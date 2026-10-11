import { useEffect, useRef, useState } from 'react'
import { Pause, Play, X, Volume2, VolumeX, SkipForward } from 'lucide-react'
import AnalogClock from './AnalogClock'

const WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const pad = (n) => n.toString().padStart(2, '0')
const clock = (sec) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

// 熄屏时钟：浅色底，和 iOS 状态栏连成一片，竖屏数字时钟、横屏指针表盘
// 只有一个操作：暂停 / 继续这次专注（音乐会跟着停和恢复）。按钮始终可点，闲置 8 秒后整体调暗省电
export default function ClockScreen({ project, display, modeLabel, progress, running, seconds = 0, soundTitle, isPlaying, musicOn, canNext, onToggleMusic, onNext, onToggle, onClose }) {
  const [now, setNow] = useState(new Date())
  const [awake, setAwake] = useState(true)
  const [shift, setShift] = useState({ x: 0, y: 0 })
  const [landscape, setLandscape] = useState(() => window.matchMedia('(orientation: landscape)').matches)
  const timer = useRef(null)

  const wake = () => {
    setAwake(true)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => setAwake(false), 8000)
  }

  useEffect(() => {
    wake()
    const t = setInterval(() => setNow(new Date()), 1000)
    const mq = window.matchMedia('(orientation: landscape)')
    const onChange = () => setLandscape(mq.matches)
    mq.addEventListener('change', onChange)
    return () => {
      clearInterval(t)
      clearTimeout(timer.current)
      mq.removeEventListener('change', onChange)
    }
  }, [])

  // 防残影：每分钟轻微挪动
  const minute = now.getMinutes()
  useEffect(() => {
    setShift({ x: Math.round((Math.random() - 0.5) * 16), y: Math.round((Math.random() - 0.5) * 16) })
  }, [minute])

  // 屏幕常亮
  useEffect(() => {
    let lock = null
    const request = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen')
      } catch {
        /* 不支持时忽略 */
      }
    }
    request()
    document.addEventListener('visibilitychange', request)
    return () => {
      document.removeEventListener('visibilitychange', request)
      lock?.release?.().catch(() => {})
    }
  }, [])

  const color = project?.color && project.color !== '#16181b' ? project.color : '#ff6a2b'
  const started = seconds > 0 || running
  const status = running ? modeLabel : started ? '已暂停' : '未开始'

  const toggleBtn = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        wake()
        onToggle()
      }}
      className="h-16 px-8 rounded-full bg-ink text-paper flex items-center justify-center gap-2.5 text-[17px] font-black touch-manipulation active:scale-95 transition-transform"
    >
      {running ? <Pause size={22} fill="currentColor" /> : <Play size={22} fill="currentColor" />}
      {running ? '暂停专注' : started ? '继续专注' : '开始专注'}
    </button>
  )

  const closeBtn = (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        onClose()
      }}
      aria-label="退出熄屏时钟"
      className="w-12 h-12 rounded-full flex items-center justify-center text-mute bg-black/5 touch-manipulation"
    >
      <X size={24} />
    </button>
  )

  const stop = (fn) => (e) => {
    e.stopPropagation()
    wake()
    fn()
  }

  // 音乐：开关 + 曲名 + 下一首
  const musicRow = (
    <div className="flex items-center gap-2 min-w-0">
      <button
        type="button"
        onClick={stop(onToggleMusic)}
        aria-label={musicOn && isPlaying ? '关闭音乐' : '打开音乐'}
        className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center touch-manipulation ${musicOn && isPlaying ? 'bg-ink text-paper' : 'bg-black/5 text-mute'}`}
      >
        {musicOn && isPlaying ? <Volume2 size={20} /> : <VolumeX size={20} />}
      </button>
      <span className="flex-1 min-w-0 truncate text-[15px] text-mute">{musicOn && isPlaying ? soundTitle : '音乐已关'}</span>
      {canNext && musicOn && (
        <button type="button" onClick={stop(onNext)} aria-label="下一首" className="w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center text-ink bg-black/5 touch-manipulation">
          <SkipForward size={20} fill="currentColor" />
        </button>
      )}
    </div>
  )

  const remaining = (
    <div>
      <div className="text-base font-bold text-mute truncate">
        {project ? project.name : '未选择项目'} · {status}
      </div>
      <div className="num leading-none mt-2 text-[min(18vw,96px)] landscape:text-[min(22vh,110px)]" style={{ color }}>
        {clock(display)}
      </div>
      <div className="h-1.5 rounded-full bg-track mt-4 overflow-hidden">
        <div className="h-full rounded-full transition-[width] duration-1000" style={{ width: `${Math.min(1, progress) * 100}%`, backgroundColor: color }} />
      </div>
    </div>
  )

  const bg = {
    background: `radial-gradient(130% 70% at 50% 120%, ${running ? '#f6c9a8' : '#ebe2d6'} 0%, #f2eee8 55%, #f6f4f0 100%)`,
  }

  return (
    <div className="fixed inset-0 z-50 text-ink select-none animate-fade-in" style={bg} onClick={wake}>
      <div className={`h-full w-full transition-opacity duration-1000 ${awake ? 'opacity-100' : 'opacity-70'}`}>
        {landscape ? (
          <div className="h-full grid grid-cols-[auto_1fr] items-center gap-10 pl-[max(env(safe-area-inset-left),28px)] pr-[max(env(safe-area-inset-right),28px)] py-5">
            <div className="h-[88svh] aspect-square transition-transform duration-1000" style={{ transform: `translate(${shift.x}px, ${shift.y}px)` }}>
              <AnalogClock now={now} progress={progress} running={running} color={color} className="w-full h-full" />
            </div>
            <div className="h-full flex flex-col justify-center gap-8 min-w-0 max-w-[400px] py-4 relative">
              <div className="absolute top-2 right-0">{closeBtn}</div>
              {remaining}
              {musicRow}
              <div>{toggleBtn}</div>
            </div>
          </div>
        ) : (
          <div className="h-full flex flex-col px-7 pt-[calc(env(safe-area-inset-top)+12px)] pb-[calc(env(safe-area-inset-bottom)+28px)]">
            <div className="flex justify-end">{closeBtn}</div>
            <div className="flex-1 flex flex-col justify-center transition-transform duration-1000" style={{ transform: `translate(${shift.x}px, ${shift.y}px)` }}>
              <div className="text-center">
                <div className="text-lg font-bold text-mute">
                  {now.getMonth() + 1}月{now.getDate()}日 {WEEK[now.getDay()]}
                </div>
                <div className="num leading-[0.85] text-[min(36vw,180px)] mt-2">
                  {pad(now.getHours())}
                  <span style={{ color: running ? color : '#c9c4bb' }}>:</span>
                  {pad(now.getMinutes())}
                </div>
              </div>
              <div className="mt-12">{remaining}</div>
              <div className="mt-6">{musicRow}</div>
            </div>
            <div className="flex justify-center">{toggleBtn}</div>
          </div>
        )}
      </div>
    </div>
  )
}
