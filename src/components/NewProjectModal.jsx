import { useState } from 'react'
import Sheet from './Sheet'
import { uuid } from '../lib/utils'

const COLORS = ['#e5501b', '#a87a22', '#2f6f8f', '#3f7d4e', '#7a3fa0', '#22262b']
const ICONS = ['✍️', '💻', '🎨', '📚', '🏋️', '🧘', '🎹', '🎸', '🗣️', '🧪']

const Label = ({ children }) => <span className="block text-sm font-bold mb-2">{children}</span>
const choice = (active) =>
  `h-11 rounded-md border-2 font-bold text-[15px] transition-colors ${
    active ? 'bg-iron border-iron text-plate' : 'bg-plate border-iron/20 text-iron active:border-iron'
  }`
const inputCls = 'w-full h-12 px-3 bg-white/70 border-2 border-iron/25 rounded-md text-base focus:outline-none focus:border-iron'

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
      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <Label>要长期坚持的事</Label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：写作、编程、健身"
            maxLength={10}
            required
            autoFocus
            className={inputCls}
          />
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
                className={`h-12 text-2xl rounded-md border-2 ${icon === e ? 'border-iron bg-stone-deep' : 'border-iron/15 bg-plate'}`}
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
                className={`w-10 h-10 rounded-md border-2 ${color === c ? 'border-iron ring-2 ring-offset-2 ring-iron ring-offset-plate' : 'border-iron/20'}`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        <div>
          <Label>目标</Label>
          <div className="grid grid-cols-2 gap-2 mb-2.5">
            <button type="button" onClick={() => setPeriod('daily')} className={choice(period === 'daily')}>
              每天
            </button>
            <button type="button" onClick={() => setPeriod('weekly')} className={choice(period === 'weekly')}>
              每周
            </button>
          </div>
          <div className="flex items-center gap-3">
            <input
              type="number"
              inputMode="numeric"
              value={minutes}
              onChange={(e) => setMinutes(Math.max(1, parseInt(e.target.value) || 0))}
              min="1"
              max="1440"
              required
              className={`${inputCls} num text-xl font-bold`}
            />
            <span className="text-base font-bold flex-shrink-0">分钟</span>
          </div>
        </div>

        <label className="block">
          <Label>提醒时刻</Label>
          <input type="time" value={time} onChange={(e) => setTime(e.target.value)} required className={`${inputCls} num text-xl font-bold`} />
        </label>

        <button type="submit" className="w-full h-14 bg-ember text-plate rounded-md text-lg font-extrabold shadow-plate active:translate-x-px active:translate-y-px active:shadow-press">
          放进熔炉
        </button>
      </form>
    </Sheet>
  )
}
