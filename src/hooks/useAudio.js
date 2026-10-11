import { useEffect, useRef, useState } from 'react'
import { AMBIENT_TRACKS, CLASSICAL_TRACKS, CLASSICAL_SHUFFLE } from '../data/tracks'
import { asset } from '../lib/utils'

const isClassicalId = (id) => id === CLASSICAL_SHUFFLE.id || CLASSICAL_TRACKS.some((t) => t.id === id)

// 随机挑下一首，避免和刚播的重复
function pickNextClassical(currentId) {
  const pool = CLASSICAL_TRACKS.filter((t) => t.id !== currentId)
  return pool[Math.floor(Math.random() * pool.length)]
}

// 跨页面共享的播放状态
// musicOn：用户是否打开了背景音乐；heldByTimer：计时暂停时被一起暂停，计时继续时自动恢复
const shared = { selection: null, piece: null, isPlaying: false, musicOn: false, heldByTimer: false, listeners: new Set() }
const emit = () => shared.listeners.forEach((fn) => fn())

// 全局唯一的 <audio>，切页面不中断；状态以 <audio> 的真实播放事件为准（锁屏、灵动岛暂停也能同步）
let audioEl = null
function getAudio() {
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
  audio.src = asset(track.file)
  // 一首放完自动随机接下一首
  audio.onended = () => {
    if (shared.musicOn && isClassicalId(shared.selection?.id)) startPiece(pickNextClassical(track.id))
  }
  play(audio)
  emit()
}

function startSelection() {
  const audio = getAudio()
  const sel = shared.selection
  if (!sel) return
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
    const sel = id === CLASSICAL_SHUFFLE.id ? CLASSICAL_SHUFFLE : CLASSICAL_TRACKS.find((t) => t.id === id) || AMBIENT_TRACKS.find((t) => t.id === id)
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
    if (!isClassicalId(shared.selection?.id)) return
    setPlaySeconds(0)
    shared.musicOn = true
    shared.heldByTimer = false
    startPiece(pickNextClassical(shared.piece?.id))
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
    canNext: isClassicalId(selection?.id),
    selectTrack,
    toggleMusic,
    togglePlay: toggleMusic,
    holdForTimer,
    releaseForTimer,
    next,
    enableAudio: () => getAudio(),
  }
}
