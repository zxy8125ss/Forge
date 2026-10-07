import { useState } from 'react'
import Sheet from './Sheet'
import MoodPicker from './MoodPicker'
import { uuid } from '../lib/utils'

const pad = (n) => n.toString().padStart(2, '0')

// 计时结束：写一句、选状态、保存
export default function RecordModal({ duration, project, onSave, onCancel, onAbandon }) {
  const [note, setNote] = useState('')
  const [mood, setMood] = useState('专注')
  const h = Math.floor(duration / 3600)
  const m = Math.floor((duration % 3600) / 60)
  const s = duration % 60

  const handleSubmit = (e) => {
    e.preventDefault()
    onSave({
      id: uuid(),
      projectId: project.id,
      duration,
      note: note.trim() || '默默精进，百炼成钢',
      mood,
      startAt: Date.now() - duration * 1000,
      endAt: Date.now(),
    })
  }

  return (
    <Sheet title={project.name}>
      <div className="-mt-3 mb-7">
        <div className="num text-[96px] leading-[0.82] tracking-[-1px]">{h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${m}:${pad(s)}`}</div>
        <p className="text-base font-bold mt-3">{h > 0 ? '小时 : 分 : 秒' : '分 : 秒'}，这一锤落下了</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <label className="block">
          <span className="block text-sm font-bold text-mute mb-2">这次做了什么</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="一句话就好，比如：读完第三章"
            rows={3}
            maxLength={150}
            className="w-full p-4 bg-white rounded-2xl text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-mute/60"
          />
        </label>

        <div>
          <span className="block text-sm font-bold text-mute mb-2">状态</span>
          <MoodPicker selectedMood={mood} onSelect={setMood} />
        </div>

        <div className="space-y-2 pt-1">
          <button type="submit" className="w-full h-[60px] rounded-full bg-ink text-paper text-[17px] font-black active:scale-[0.99]">
            保存
          </button>
          <div className="grid grid-cols-2">
            <button type="button" onClick={onCancel} className="h-12 text-[15px] font-bold">
              继续计时
            </button>
            <button type="button" onClick={onAbandon} className="h-12 text-[15px] font-bold text-mute">
              不保存
            </button>
          </div>
        </div>
      </form>
    </Sheet>
  )
}
