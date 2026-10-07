import { useEffect, useRef, useState } from 'react'
import { AMBIENT_TRACKS, CLASSICAL_TRACKS, CLASSICAL_SHUFFLE } from '../data/tracks'
import { asset } from '../lib/utils'

// 全局唯一的 <audio>，切页面不中断
let audioEl = null
function getAudio() {
  if (!audioEl) audioEl = new Audio()
  return audioEl
}

const isClassicalId = (id) => id === CLASSICAL_SHUFFLE.id || CLASSICAL_TRACKS.some((t) => t.id === id)

// 随机挑下一首，避免和刚播的重复
function pickNextClassical(currentId) {
  const pool = CLASSICAL_TRACKS.filter((t) => t.id !== currentId)
  return pool[Math.floor(Math.random() * pool.length)]
}

function playSafely(audio, label = 'HTML5 Audio') {
  audio.play().catch((err) => console.warn(`${label} play failed:`, err))
}

// 跨页面共享的播放状态
const shared = { selection: null, piece: null, isPlaying: false, listeners: new Set() }
const emit = () => shared.listeners.forEach((fn) => fn())

export function useAudio() {
  const [, force] = useState(0)
  const [playSeconds, setPlaySeconds] = useState(0)
  const intervalRef = useRef(null)

  useEffect(() => {
    const fn = () => force((n) => n + 1)
    shared.listeners.add(fn)
    return () => shared.listeners.delete(fn)
  }, [])

  const { selection, piece, isPlaying } = shared

  useEffect(() => {
    if (isPlaying) {
      intervalRef.current = setInterval(() => setPlaySeconds((s) => s + 1), 1000)
    } else if (intervalRef.current) {
      clearInterval(intervalRef.current)
      intervalRef.current = null
    }
    return () => intervalRef.current && clearInterval(intervalRef.current)
  }, [isPlaying])

  const startPiece = (track) => {
    const audio = getAudio()
    shared.piece = track
    audio.loop = false
    audio.src = asset(track.file)
    // 一首放完自动接下一首
    audio.onended = () => {
      if (shared.isPlaying && isClassicalId(shared.selection?.id)) startPiece(pickNextClassical(track.id))
    }
    playSafely(audio)
    emit()
  }

  const selectTrack = (id) => {
    const audio = getAudio()
    audio.pause()
    audio.onended = null
    setPlaySeconds(0)

    if (!id) {
      Object.assign(shared, { selection: null, piece: null, isPlaying: false })
      emit()
      return
    }

    if (id === CLASSICAL_SHUFFLE.id) {
      Object.assign(shared, { selection: CLASSICAL_SHUFFLE, isPlaying: true })
      startPiece(pickNextClassical(null))
      return
    }

    const classical = CLASSICAL_TRACKS.find((t) => t.id === id)
    if (classical) {
      // 从选中的曲子开始，放完继续随机连播
      Object.assign(shared, { selection: classical, isPlaying: true })
      startPiece(classical)
      return
    }

    const ambient = AMBIENT_TRACKS.find((t) => t.id === id)
    if (!ambient) return
    Object.assign(shared, { selection: ambient, piece: ambient, isPlaying: true })
    audio.loop = true
    audio.src = asset(ambient.file)
    playSafely(audio)
    emit()
  }

  const togglePlay = () => {
    if (!shared.selection) return
    const audio = getAudio()
    if (shared.isPlaying) {
      audio.pause()
      shared.isPlaying = false
    } else {
      shared.isPlaying = true
      // 静音保活占用过 <audio> 时，恢复原曲目
      if (!audio.src || audio.src.includes('silence.wav')) {
        if (isClassicalId(shared.selection.id)) {
          startPiece(shared.piece && shared.piece.file.startsWith('music/') ? shared.piece : pickNextClassical(null))
          return
        }
        audio.loop = true
        audio.src = asset(shared.selection.file)
      }
      playSafely(audio)
    }
    emit()
  }

  // 不放音乐时播放无声音频，让 iOS 锁屏后计时不被挂起
  const setSilenceActive = (active) => {
    const audio = getAudio()
    if (active) {
      if (shared.isPlaying) return
      audio.pause()
      audio.onended = null
      audio.loop = true
      audio.src = asset('silence.wav')
      playSafely(audio, 'Silence audio')
    } else if (audio.src && audio.src.includes('silence.wav')) {
      audio.pause()
    }
  }

  return {
    ambientTracks: AMBIENT_TRACKS,
    classicalTracks: CLASSICAL_TRACKS,
    classicalShuffle: CLASSICAL_SHUFFLE,
    currentTrack: selection, // 选择器里选中的项
    currentPiece: piece, // 实际正在放的那首
    isPlaying,
    playSeconds,
    selectTrack,
    togglePlay,
    enableAudio: () => getAudio(),
    setSilenceActive,
  }
}
