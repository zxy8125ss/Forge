import { useEffect, useState } from 'react'
import { Pause, Play } from 'lucide-react'
import { asset, formatMinSec } from '../lib/utils'

// 模拟 iOS 锁屏上的媒体卡片
export default function LockscreenPreview({ project, seconds, running, isPlaying, soundTitle, onToggle, onClose }) {
  const [clock, setClock] = useState('')
  const [date, setDate] = useState('')

  useEffect(() => {
    const update = () => {
      const now = new Date()
      setClock(now.toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit', hour12: false }))
      setDate(now.toLocaleDateString('zh-CN', { month: 'long', day: 'numeric', weekday: 'long' }))
    }
    update()
    const t = setInterval(update, 1000)
    return () => clearInterval(t)
  }, [])

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-lg flex flex-col justify-between p-6 animate-fade-in text-white font-sans">
      <div className="flex justify-end">
        <button
          type="button"
          onClick={onClose}
          className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-zinc-400 hover:text-white transition-colors"
        >
          ✕
        </button>
      </div>

      <div className="flex flex-col items-center mt-6 space-y-1">
        <span className="text-[13px] font-medium tracking-wide text-zinc-200">{date}</span>
        <h1 className="text-7xl font-light tracking-tight font-sans text-zinc-100 select-none">{clock}</h1>
      </div>

      <div className="my-auto w-full max-w-sm mx-auto bg-zinc-900/70 border border-white/10 rounded-2xl p-4 space-y-3 shadow-2xl backdrop-blur-md select-none">
        <div className="flex gap-3.5 items-center">
          <img
            src={asset('lockscreen_artwork.png')}
            alt="Artwork"
            className="w-14 h-14 rounded-lg object-cover border border-white/5 shadow-md flex-shrink-0"
          />
          <div className="flex-1 min-w-0 space-y-1">
            <div className="flex justify-between items-start">
              <div className="min-w-0 flex-1">
                <div className="text-[12px] font-bold text-white truncate">
                  正在锻造: {project?.icon} {project?.name || '未选择项目'}
                </div>
                <div className="text-[9.5px] text-zinc-400 truncate">
                  已熔铸时长: {formatMinSec(seconds)} {isPlaying ? `(${soundTitle || ''})` : '(静音专注)'}
                </div>
                <div className="text-[8.5px] text-zinc-500 truncate">Forge 个人成长计时器</div>
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  type="button"
                  onClick={onToggle}
                  className="w-7 h-7 flex items-center justify-center bg-white/10 rounded-full hover:bg-white/20 active:scale-90 text-white transition-colors"
                >
                  {running ? <Pause size={12} fill="white" /> : <Play size={12} fill="white" className="ml-0.5" />}
                </button>
              </div>
            </div>
            <div className="space-y-0.5">
              <div className="h-1 bg-zinc-700/50 rounded-full overflow-hidden relative">
                <div
                  className="absolute top-0 bottom-0 left-0 bg-white"
                  style={{ width: `${Math.min(100, (seconds / 3600) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[7.5px] text-zinc-500 font-mono">
                <span>{formatMinSec(seconds)}</span>
                <span>24:00:00</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex flex-col items-center space-y-4 mb-4 select-none">
        <div className="flex justify-between w-full max-w-[280px] px-4">
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-zinc-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9V3h4.5v6M9 21h6M10.5 15h3m-5.25-3h9M12 9v12" />
            </svg>
          </div>
          <div className="w-11 h-11 rounded-full bg-white/10 flex items-center justify-center text-zinc-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z"
              />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 13.5a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </div>
        </div>
        <div className="w-32 h-1 bg-white/30 rounded-full" />
      </div>
    </div>
  )
}
