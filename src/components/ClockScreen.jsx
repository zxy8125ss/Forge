import { useEffect, useRef, useState } from 'react'
import { Pause, Play, X } from 'lucide-react'
import { formatClock } from '../lib/utils'

const WEEK = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六']
const pad = (n) => n.toString().padStart(2, '0')

// 熄屏时钟：纯黑底 + 暗色文字（OLED 屏黑色不发光，常亮也省电）
// 平时只显示时间和本次计时；点一下屏幕亮出控制按钮，5 秒后自动变暗
// 每分钟轻微移动位置，防止烧屏
export default function ClockScreen({ project, display, modeLabel, progress, running, soundTitle, isPlaying, onToggle, onClose }) {
  const [now, setNow] = useState(new Date())
  const [awake, setAwake] = useState(true)
  const [shift, setShift] = useState({ x: 0, y: 0 })
  const sleepTimer = useRef(null)

  const wake = () => {
    setAwake(true)
    clearTimeout(sleepTimer.current)
    sleepTimer.current = setTimeout(() => setAwake(false), 5000)
  }

  useEffect(() => {
    wake()
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => {
      clearInterval(t)
      clearTimeout(sleepTimer.current)
    }
  }, [])

  // 防烧屏：每分钟换一个小偏移
  useEffect(() => {
    setShift({ x: Math.round((Math.random() - 0.5) * 24), y: Math.round((Math.random() - 0.5) * 40) })
  }, [now.getMinutes()])

  // 保持屏幕不自动锁定（支持的浏览器才生效；切回前台时重新申请）
  useEffect(() => {
    let lock = null
    const request = async () => {
      try {
        if ('wakeLock' in navigator && document.visibilityState === 'visible') lock = await navigator.wakeLock.request('screen')
      } catch {
        /* 不支持或被拒绝时忽略 */
      }
    }
    request()
    document.addEventListener('visibilitychange', request)
    return () => {
      document.removeEventListener('visibilitychange', request)
      lock?.release?.().catch(() => {})
    }
  }, [])

  const color = project?.color || '#e5501b'
  const dim = awake ? 'opacity-100' : 'opacity-55'

  return (
    <div
      className="fixed inset-0 z-50 bg-black text-[#9a9a9a] flex flex-col select-none animate-fade-in pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
      onClick={wake}
    >
      <div className={`flex justify-end px-4 pt-3 transition-opacity duration-500 ${awake ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onClose()
          }}
          aria-label="退出熄屏时钟"
          className="w-11 h-11 flex items-center justify-center text-[#9a9a9a] active:text-white"
        >
          <X size={26} />
        </button>
      </div>

      <div
        className={`flex-1 flex flex-col items-center justify-center px-6 transition-[transform,opacity] duration-1000 ${dim}`}
        style={{ transform: `translate(${shift.x}px, ${shift.y}px)` }}
      >
        <div className="text-base font-bold text-[#7a7a7a]">
          {now.getMonth() + 1}月{now.getDate()}日 {WEEK[now.getDay()]}
        </div>
        <div className="num font-extrabold leading-[0.85] mt-2 text-[min(30vw,160px)] text-[#b5b5b5]">
          {pad(now.getHours())}
          <span style={{ color: running ? color : '#555' }}>:</span>
          {pad(now.getMinutes())}
        </div>

        <div className="mt-10 w-full max-w-[260px]">
          <div className="flex items-baseline justify-between">
            <span className="text-[13px] font-bold text-[#7a7a7a] truncate">{project ? `${project.icon} ${project.name}` : '未选择项目'}</span>
            <span className="text-[13px] text-[#6a6a6a]">{running ? modeLabel : '已暂停'}</span>
          </div>
          <div className="num text-[44px] leading-none font-extrabold mt-1 text-[#9a9a9a]">{formatClock(display)}</div>
          <div className="h-[3px] bg-[#222] mt-3 overflow-hidden">
            <div className="h-full transition-[width] duration-1000" style={{ width: `${Math.min(1, progress) * 100}%`, backgroundColor: color, opacity: 0.7 }} />
          </div>
          {isPlaying && <div className="text-[13px] text-[#5f5f5f] truncate mt-2">♪ {soundTitle}</div>}
        </div>
      </div>

      <div className={`flex justify-center pb-10 transition-opacity duration-500 ${awake ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            onToggle()
            wake()
          }}
          aria-label={running ? '暂停' : '继续'}
          className="w-[72px] h-[72px] rounded-full border-2 border-[#444] text-[#c8c8c8] flex items-center justify-center active:bg-[#1a1a1a]"
        >
          {running ? <Pause size={30} fill="currentColor" /> : <Play size={30} fill="currentColor" className="ml-1" />}
        </button>
      </div>

      {!awake && <p className="absolute bottom-[calc(env(safe-area-inset-bottom)+16px)] inset-x-0 text-center text-xs text-[#3a3a3a]">轻点屏幕显示按钮</p>}
    </div>
  )
}
