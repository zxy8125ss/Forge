import { useState } from 'react'
import Sheet from './Sheet'
import MoodPicker from './MoodPicker'
import { formatClock, uuid } from '../lib/utils'

// 计时结束：写一句心得、选心境、保存
export default function RecordModal({ duration, project, onSave, onCancel, onAbandon }) {
  const [note, setNote] = useState('')
  const [mood, setMood] = useState('专注')

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
    <Sheet title="这一锤，落下了">
      <div className="flex items-end justify-between border-b-2 border-iron pb-4 mb-5">
        <div>
          <div className="text-[13px] text-steel">
            {project.icon} {project.name}
          </div>
          <div className="num text-[52px] leading-none font-extrabold mt-1">{formatClock(duration)}</div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        <label className="block">
          <span className="block text-sm font-bold mb-2">这次做了什么</span>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="一句话就好，比如：读完第三章"
            rows={3}
            maxLength={150}
            className="w-full p-3 bg-white/70 border-2 border-iron/25 rounded-md text-base leading-relaxed resize-none focus:outline-none focus:border-iron"
          />
        </label>

        <div>
          <span className="block text-sm font-bold mb-2">状态</span>
          <MoodPicker selectedMood={mood} onSelect={setMood} />
        </div>

        <div className="grid grid-cols-2 gap-2.5 pt-1">
          <button type="button" onClick={onCancel} className="h-14 rounded-md border-2 border-iron text-base font-bold active:bg-stone-deep">
            继续计时
          </button>
          <button type="submit" className="h-14 rounded-md bg-ember text-plate text-base font-extrabold shadow-plate active:translate-x-px active:translate-y-px active:shadow-press">
            保存记录
          </button>
        </div>
        <button type="button" onClick={onAbandon} className="w-full h-10 text-sm font-bold text-steel active:text-ember-deep">
          不保存，放弃这次计时
        </button>
      </form>
    </Sheet>
  )
}
