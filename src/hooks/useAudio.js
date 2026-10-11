import { useEffect, useRef, useState } from 'react'
import { AMBIENT_TRACKS, CLASSICAL_TRACKS, CLASSICAL_SHUFFLE } from '../data/tracks'
import { asset, uuid } from '../lib/utils'
import { db } from '../db'

const isLocalId = (id) => typeof id === 'string' && id.startsWith('local:')
const isClassicalId = (id) => id === CLASSICAL_SHUFFLE.id || CLASSICAL_TRACKS.some((t) => t.id === id)

// 随机挑下一首，避免和刚播的重复
function pickNextClassical(currentId) {
  const pool = CLASSICAL_TRACKS.filter((t) => t.id !== currentId)
  return pool[Math.floor(Math.random() * pool.length)]
}

// 跨页面共享的播放状态
// musicOn：用户是否打开了背景音乐；heldByTimer：计时暂停时被一起暂停，计时继续时自动恢复
const shared = { selection: null, piece: null, isPlaying: false, musicOn: false, heldByTimer: false, localTracks: [], listeners: new Set() }
const emit = () => shared.listeners.forEach((fn) => fn())

// 本地导入的音乐：只存在这台手机的 IndexedDB 里
const toTrack = (m) => ({ id: `local:${m.id}`, dbId: m.id, title: m.title, local: true })
const blobs = new Map()
async function loadLocal() {
  try {
    const list = await db.getMusic()
    list.forEach((m) => blobs.set(m.id, m.blob))
    shared.localTracks = list.map(toTrack)
    emit()
  } catch (err) {
    console.warn('读取本地音乐失败', err)
  }
}
loadLocal()

let objectUrl = null
function setLocalSrc(audio, track) {
  const blob = blobs.get(track.dbId)
  if (!blob) return false
  if (objectUrl) URL.revokeObjectURL(objectUrl)
  objectUrl = URL.createObjectURL(blob)
  audio.src = objectUrl
  return true
}

function nextLocal(currentId) {
  const list = shared.localTracks
  if (!list.length) return null
  const i = list.findIndex((t) => t.id === currentId)
  return list[(i + 1) % list.length]
}

// 全局唯一的 <audio>，切页面不中断；状态以 <audio> 的真实播放事件为准（锁屏、灵动岛暂停也能同步）
let audioEl = null
export function getAudio() {
  if (!audioEl) {
    audioEl = new Audio()
    audioEl.addEventListener('playing', () => {
      shared.isPlaying = true
      emit()
    })
    audioEl.addEventListener('pause', () => {
      shared.isPlaying = false
      emit()
    })
  }
  return audioEl
}

function play(audio) {
  audio.play().catch((err) => console.warn('Audio play failed:', err))
}

function startPiece(track) {
  const audio = getAudio()
  shared.piece = track
  audio.loop = false
  if (track.local) {
    if (!setLocalSrc(audio, track)) return
  } else audio.src = asset(track.file)
  // 一首放完自动接下一首（古典乐随机；我的音乐按顺序循环）
  audio.onended = () => {
    if (!shared.musicOn) return
    if (track.local) {
      const n = nextLocal(track.id)
      if (n) {
        shared.selection = n
        startPiece(n)
      }
    } else if (isClassicalId(shared.selection?.id)) startPiece(pickNextClassical(track.id))
  }
  play(audio)
  emit()
}

function startSelection() {
  const audio = getAudio()
  const sel = shared.selection
  if (!sel) return
  if (isLocalId(sel.id)) {
    const cur = shared.piece?.local && objectUrl && audio.src === objectUrl ? shared.piece : null
    if (cur) {
      play(audio)
      emit()
    } else startPiece(shared.localTracks.find((t) => t.id === sel.id) || shared.localTracks[0])
    return
  }
  if (isClassicalId(sel.id)) {
    const first = sel.id === CLASSICAL_SHUFFLE.id ? pickNextClassical(null) : CLASSICAL_TRACKS.find((t) => t.id === sel.id)
    startPiece(shared.piece && shared.piece.file?.startsWith('music/') && audio.src.includes(shared.piece.file) ? shared.piece : first)
    return
  }
  shared.piece = sel
  audio.onended = null
  audio.loop = true
  if (!audio.src.includes(sel.file)) audio.src = asset(sel.file)
  play(audio)
  emit()
}

export function useAudio() {
  const [, force] = useState(0)
  const [playSeconds, setPlaySeconds] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    const fn = () => force((n) => n + 1)
    shared.listeners.add(fn)
    return () => shared.listeners.delete(fn)
  }, [])

  const { selection, piece, isPlaying, musicOn } = shared

  useEffect(() => {
    if (isPlaying) intervalRef.current = setInterval(() => setPlaySeconds((s) => s + 1), 1000)
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [isPlaying])

  // 选曲：选了就打开音乐并开始播放
  const selectTrack = (id) => {
    const audio = getAudio()
    audio.pause()
    audio.onended = null
    setPlaySeconds(0)
    shared.heldByTimer = false
    if (!id) {
      Object.assign(shared, { selection: null, piece: null, musicOn: false })
      emit()
      return
    }
    const sel =
      id === CLASSICAL_SHUFFLE.id
        ? CLASSICAL_SHUFFLE
        : CLASSICAL_TRACKS.find((t) => t.id === id) || AMBIENT_TRACKS.find((t) => t.id === id) || shared.localTracks.find((t) => t.id === id)
    if (!sel) return
    Object.assign(shared, { selection: sel, piece: null, musicOn: true })
    audio.removeAttribute('src')
    startSelection()
  }

  // 音乐开关（和计时无关）：没选过曲目时直接开始古典乐随机连播
  const toggleMusic = () => {
    shared.heldByTimer = false
    if (!shared.selection) {
      selectTrack(CLASSICAL_SHUFFLE.id)
      return
    }
    if (shared.musicOn && shared.isPlaying) {
      shared.musicOn = false
      getAudio().pause()
    } else {
      shared.musicOn = true
      startSelection()
    }
    emit()
  }

  // 计时暂停时，音乐一起暂停
  const holdForTimer = () => {
    if (shared.musicOn && shared.isPlaying) {
      shared.heldByTimer = true
      getAudio().pause()
    }
  }

  // 计时继续时，之前被一起暂停的音乐自动恢复
  const releaseForTimer = () => {
    if (shared.musicOn && (shared.heldByTimer || !shared.isPlaying)) {
      shared.heldByTimer = false
      startSelection()
    }
  }

  // 下一首（古典乐）
  const next = () => {
    const id = shared.selection?.id
    if (!isClassicalId(id) && !isLocalId(id)) return
    setPlaySeconds(0)
    shared.musicOn = true
    shared.heldByTimer = false
    if (isLocalId(id)) {
      const n = nextLocal(shared.piece?.id)
      if (n) {
        shared.selection = n
        startPiece(n)
      }
    } else startPiece(pickNextClassical(shared.piece?.id))
  }

  // 导入手机里的音频文件（可多选）
  const importLocal = async (files) => {
    let added = 0
    for (const f of files) {
      if (!f.type.startsWith('audio/') && !/\.(mp3|m4a|aac|wav|flac|ogg)$/i.test(f.name)) continue
      const blob = new Blob([await f.arrayBuffer()], { type: f.type || 'audio/mpeg' })
      const item = { id: uuid(), title: f.name.replace(/\.[^.]+$/, ''), blob, type: f.type, size: f.size, addedAt: Date.now() + added }
      await db.saveMusic(item)
      blobs.set(item.id, blob)
      shared.localTracks = [...shared.localTracks, toTrack(item)]
      added++
    }
    emit()
    return added
  }

  const removeLocal = async (id) => {
    const t = shared.localTracks.find((x) => x.id === id)
    if (!t) return
    if (shared.piece?.id === id || shared.selection?.id === id) selectTrack('')
    await db.deleteMusic(t.dbId)
    blobs.delete(t.dbId)
    shared.localTracks = shared.localTracks.filter((x) => x.id !== id)
    emit()
  }

  return {
    ambientTracks: AMBIENT_TRACKS,
    classicalTracks: CLASSICAL_TRACKS,
    classicalShuffle: CLASSICAL_SHUFFLE,
    currentTrack: selection, // 选择器里选中的项
    currentPiece: piece, // 实际正在放的那首
    musicOn,
    isPlaying,
    playSeconds,
    canNext: isClassicalId(selection?.id) || (isLocalId(selection?.id) && shared.localTracks.length > 1),
    localTracks: shared.localTracks,
    importLocal,
    removeLocal,
    selectTrack,
    toggleMusic,
    togglePlay: toggleMusic,
    holdForTimer,
    releaseForTimer,
    next,
    enableAudio: () => getAudio(),
  }
}
