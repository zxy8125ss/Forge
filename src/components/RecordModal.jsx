import { useState } from 'react'
import MoodPicker from './MoodPicker'
import { formatDuration, uuid } from '../lib/utils'

// 计时结束弹窗：写心得、选心境、保存
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-sm bg-forge-surface border border-forge-border rounded-2xl p-5 shadow-2xl">
        <h3 className="text-base font-bold text-forge-light mb-1">
          本次淬火已完成 {project.icon} {project.name}
        </h3>
        <p className="text-xs text-forge-steel mb-4">
          成功熔铸时长：<span className="text-forge-amber font-bold font-mono text-sm">{formatDuration(duration)}</span>
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-forge-steel mb-1.5 uppercase tracking-wider">熔炼心得</label>
            <textarea
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="这块铁骨上留下了你怎样的印记？..."
              rows={3}
              maxLength={150}
              className="w-full p-3 bg-forge-bg border border-forge-border rounded-xl text-forge-light text-xs focus:outline-none focus:border-forge-orange/60 resize-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-[10px] font-bold text-forge-steel mb-1 uppercase tracking-wider">淬火心境</label>
            <MoodPicker selectedMood={mood} onSelect={setMood} />
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <div className="flex gap-2">
              <button
                type="button"
                onClick={onCancel}
                className="flex-1 py-2.5 bg-forge-bg border border-forge-border rounded-xl text-forge-steel text-xs font-semibold hover:text-forge-light transition-colors"
              >
                继续锻造
              </button>
              <button
                type="submit"
                className="flex-1 py-2.5 bg-forge-orange hover:bg-forge-orange/90 rounded-xl text-forge-light text-xs font-semibold transition-transform active:scale-[0.98] shadow-md shadow-forge-orange/20"
              >
                淬火封存
              </button>
            </div>
            <button
              type="button"
              onClick={onAbandon}
              className="py-2 text-[10px] text-red-500/70 hover:text-red-400 hover:underline font-medium transition-colors"
            >
              弃置本次熔炼（不保存记录）
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
