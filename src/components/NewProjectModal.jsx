import { useState } from 'react'
import { X } from 'lucide-react'
import { uuid } from '../lib/utils'

const COLORS = ['#c4622d', '#e8943a', '#d946ef', '#3b82f6', '#10b981', '#8a9099']
const ICONS = ['✍️', '💻', '🎨', '📚', '🏋️', '🧘', '🎹', '🎸', '🗣️', '🧪']

const labelCls = 'block text-[9px] font-bold text-forge-steel mb-1 uppercase'
const inputCls =
  'w-full p-2 bg-forge-bg border border-forge-border rounded-xl text-forge-light text-xs focus:outline-none focus:border-forge-orange/60'
const toggleCls = (active) =>
  `py-1.5 rounded-lg text-[10px] font-bold border transition-all ${
    active ? 'bg-forge-orange/20 border-forge-orange text-forge-orange' : 'bg-forge-bg border-forge-border/40 text-forge-steel hover:border-forge-border'
  }`

export default function NewProjectModal({ onCreate, onClose }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💻')
  const [color, setColor] = useState('#c4622d')
  const [period, setPeriod] = useState('daily')
  const [minutes, setMinutes] = useState(30)
  const [time, setTime] = useState('22:00')

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!name.trim()) return
    onCreate({
      id: uuid(),
      name: name.trim(),
      icon,
      color,
      targetMilestone: 10,
      targetPeriod: period,
      targetMinutes: Number(minutes),
      targetTime: time,
      totalHours: 0,
      createdAt: Date.now(),
    })
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xs bg-forge-surface border border-forge-border rounded-2xl p-4 shadow-2xl space-y-4 text-forge-light"
      >
        <div className="flex justify-between items-center">
          <h3 className="text-xs font-bold text-forge-light">新增专注项目</h3>
          <button type="button" onClick={onClose} className="text-forge-steel hover:text-forge-light">
            <X size={16} />
          </button>
        </div>

        <div>
          <label className={labelCls}>项目名称</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：编程、写作、健身..."
            maxLength={10}
            required
            className={inputCls}
          />
        </div>

        <div>
          <label className={labelCls}>项目标识 (Emoji)</label>
          <div className="grid grid-cols-5 gap-1.5">
            {ICONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                className={`py-1 rounded-xl text-base border transition-all ${
                  icon === e ? 'bg-forge-orange/20 border-forge-orange' : 'bg-forge-bg border-forge-border/40 text-forge-light hover:border-forge-border'
                }`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className={labelCls}>目标周期</label>
          <div className="grid grid-cols-2 gap-2">
            <button type="button" onClick={() => setPeriod('daily')} className={toggleCls(period === 'daily')}>
              每日打卡
            </button>
            <button type="button" onClick={() => setPeriod('weekly')} className={toggleCls(period === 'weekly')}>
              每周打卡
            </button>
          </div>
        </div>

        <div>
          <label className={labelCls}>周期目标时间 ({period === 'daily' ? '每日' : '每周'})</label>
          <div className="flex gap-2 items-center">
            <input
              type="number"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max="1440"
              required
              className={inputCls}
            />
            <span className="text-[10px] text-forge-steel flex-shrink-0">分钟</span>
          </div>
        </div>

        <div>
          <label className={labelCls}>打卡时刻</label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={inputCls} />
        </div>

        <div>
          <label className={labelCls}>主题色彩</label>
          <div className="flex justify-between px-1">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className="w-5 h-5 rounded-full border border-forge-border flex items-center justify-center transition-transform active:scale-90"
                style={{ backgroundColor: c }}
              >
                {color === c && <span className="w-1.5 h-1.5 bg-forge-light rounded-full" />}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-forge-orange hover:bg-forge-orange/90 rounded-xl text-forge-light text-xs font-bold transition-transform active:scale-[0.98]"
        >
          置入熔炉
        </button>
      </form>
    </div>
  )
}
