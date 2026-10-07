import { useState } from 'react'
import Sheet from './Sheet'
import { uuid } from '../lib/utils'

const COLORS = ['#e5501b', '#c98a1c', '#2f6f8f', '#3f7d4e', '#7a3fa0', '#16181b']
const ICONS = ['✍️', '💻', '🎨', '📚', '🏋️', '🧘', '🎹', '🎸', '🗣️', '🧪']

const Label = ({ children }) => <span className="block text-sm font-bold text-mute mb-2">{children}</span>
const pill = (active) => `h-12 rounded-full text-base font-bold ${active ? 'bg-ink text-paper' : 'bg-line text-ink'}`
const inputCls = 'w-full h-14 px-5 bg-white rounded-2xl text-lg font-bold focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-mute/60 placeholder:font-medium'

export default function NewProjectModal({ onCreate, onClose }) {
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('💻')
  const [color, setColor] = useState(COLORS[0])
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
    <Sheet title="新建项目" onClose={onClose}>
      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block">
          <Label>想长期坚持的事</Label>
          <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="写作、编程、健身…" maxLength={10} required autoFocus className={inputCls} />
        </label>

        <div>
          <Label>目标</Label>
          <div className="grid grid-cols-2 gap-2 mb-3">
            <button type="button" onClick={() => setPeriod('daily')} className={pill(period === 'daily')}>
              每天
            </button>
            <button type="button" onClick={() => setPeriod('weekly')} className={pill(period === 'weekly')}>
              每周
            </button>
          </div>
          <div className="relative">
            <input
              type="number"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max="1440"
              required
              aria-label="目标分钟数"
              className={`${inputCls} num text-[28px] pr-16`}
            />
            <span className="absolute right-5 top-1/2 -translate-y-1/2 text-base font-bold text-mute">分钟</span>
          </div>
        </div>

        <label className="block">
          <Label>提醒时刻</Label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={`${inputCls} num text-[28px]`} />
        </label>

        <div>
          <Label>图标</Label>
          <div className="grid grid-cols-5 gap-2">
            {ICONS.map((e) => (
              <button
                key={e}
                type="button"
                onClick={() => setIcon(e)}
                aria-pressed={icon === e}
                className={`h-12 text-2xl rounded-2xl ${icon === e ? 'bg-ink' : 'bg-white'}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        <div>
          <Label>颜色</Label>
          <div className="flex gap-3">
            {COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                aria-label={`颜色 ${c}`}
                aria-pressed={color === c}
                className={`w-10 h-10 rounded-full ${color === c ? 'ring-2 ring-offset-[3px] ring-ink ring-offset-paper' : ''}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <button type="submit" className="w-full h-[60px] rounded-full bg-ink text-paper text-[17px] font-black active:scale-[0.99]">
          创建
        </button>
      </form>
    </Sheet>
  )
}
