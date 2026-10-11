import { useEffect, useRef, useState } from 'react'
import { getAudio } from '../hooks/useAudio'

const fmt = (t) => {
  if (!Number.isFinite(t) || t < 0) t = 0
  const m = Math.floor(t / 60)
  const s = Math.floor(t % 60)
  return `${m}:${s.toString().padStart(2, '0')}`
}

// 音乐进度条：拖动或点按跳到任意位置（循环播放的白噪声不显示）
export default function MusicSeek({ dark = false, className = '', textClass = 'text-mute' }) {
  const audio = getAudio()
  const [cur, setCur] = useState(audio.currentTime || 0)
  const [dur, setDur] = useState(audio.duration || 0)
  const [loop, setLoop] = useState(audio.loop)
  const [drag, setDrag] = useState(null) // 拖动中的比例
  const barRef = useRef(null)

  useEffect(() => {
    const sync = () => {
      setCur(audio.currentTime || 0)
      setDur(Number.isFinite(audio.duration) ? audio.duration : 0)
      setLoop(audio.loop)
      // 锁屏 / 灵动岛的进度条
      if ('mediaSession' in navigator && navigator.mediaSession.setPositionState && Number.isFinite(audio.duration) && audio.duration > 0) {
        try {
          navigator.mediaSession.setPositionState({ duration: audio.duration, position: Math.min(audio.currentTime, audio.duration), playbackRate: audio.playbackRate || 1 })
        } catch {
          /* 忽略 */
        }
      }
    }
    sync()
    const evs = ['timeupdate', 'loadedmetadata', 'durationchange', 'seeked', 'emptied', 'play']
    evs.forEach((e) => audio.addEventListener(e, sync))
    return () => evs.forEach((e) => audio.removeEventListener(e, sync))
  }, [audio])

  if (loop || !dur) return null

  const ratioAt = (clientX) => {
    const r = barRef.current.getBoundingClientRect()
    return Math.min(1, Math.max(0, (clientX - r.left) / r.width))
  }
  const onDown = (e) => {
    e.stopPropagation()
    barRef.current.setPointerCapture?.(e.pointerId)
    setDrag(ratioAt(e.clientX))
  }
  const onMove = (e) => {
    if (drag === null) return
    setDrag(ratioAt(e.clientX))
  }
  const onUp = (e) => {
    if (drag === null) return
    e.stopPropagation()
    const r = ratioAt(e.clientX)
    audio.currentTime = r * dur
    setCur(r * dur)
    setDrag(null)
  }

  const p = drag ?? (dur ? cur / dur : 0)
  const shown = drag !== null ? drag * dur : cur
  const track = dark ? 'bg-white/15' : 'bg-track'
  const text = textClass

  return (
    <div className={`w-full flex items-center gap-3 ${className}`} onClick={(e) => e.stopPropagation()}>
      <span className={`num text-sm w-10 text-right ${text}`}>{fmt(shown)}</span>
      <div
        ref={barRef}
        role="slider"
        aria-label="音乐进度"
        aria-valuemin={0}
        aria-valuemax={Math.round(dur)}
        aria-valuenow={Math.round(shown)}
        onPointerDown={onDown}
        onPointerMove={onMove}
        onPointerUp={onUp}
        onPointerCancel={() => setDrag(null)}
        className="relative flex-1 h-9 flex items-center cursor-pointer touch-none"
      >
        <div className={`w-full h-1.5 rounded-full ${track}`}>
          <div className="h-full rounded-full bg-ember" style={{ width: `${p * 100}%` }} />
        </div>
        <div
          className={`absolute top-1/2 -translate-y-1/2 -translate-x-1/2 rounded-full bg-ember shadow transition-[width,height] ${drag !== null ? 'w-5 h-5' : 'w-3.5 h-3.5'}`}
          style={{ left: `${p * 100}%` }}
        />
      </div>
      <span className={`num text-sm w-10 ${text}`}>{fmt(dur)}</span>
    </div>
  )
}
