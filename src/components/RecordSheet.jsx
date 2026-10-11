import { useState } from 'react'
import Sheet from './Sheet'
import MoodPicker from './MoodPicker'
import { moodEmoji } from '../data/moods'

const pad = (n) => n.toString().padStart(2, '0')
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function durationText(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return h > 0 ? `${h} 小时 ${m} 分钟` : `${Math.max(1, m)} 分钟`
}

// 单条记录：查看全文、修改心得和心境、删除
export default function RecordSheet({ record, project, onSave, onDelete, onClose, startEditing = false }) {
  const [editing, setEditing] = useState(startEditing)
  const [note, setNote] = useState(record.note || '')
  const [mood, setMood] = useState(record.mood || '专注')
  const d = new Date(record.startAt)

  return (
    <Sheet title={project?.name || '已删除的项目'} onClose={onClose}>
      <p className="-mt-4 mb-5 text-sm text-mute">
        {d.getMonth() + 1}月{d.getDate()}日 {WEEK[d.getDay()]} {pad(d.getHours())}:{pad(d.getMinutes())} · 专注 {durationText(record.duration)}
        {record.updatedAt ? ' · 已修改' : ''}
      </p>

      {editing ? (
        <div className="space-y-5">
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder="心得、日记，想写多少写多少"
            rows={10}
            maxLength={5000}
            autoFocus
            className="w-full p-4 bg-white rounded-2xl text-base leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-ink placeholder:text-mute/60"
          />
          <MoodPicker selectedMood={mood} onSelect={setMood} />
          <button
            onClick={() => {
              onSave({ ...record, note: note.trim(), mood })
              setEditing(false)
            }}
            className="w-full h-[60px] rounded-full bg-ink text-paper text-[17px] font-black active:scale-[0.99]"
          >
            保存
          </button>
        </div>
      ) : (
        <div>
          <div className="text-[15px] font-bold mb-3">
            {moodEmoji(record.mood)} {record.mood}
          </div>
          {record.note ? (
            <p className="text-[17px] leading-[1.85] whitespace-pre-wrap break-words select-text">{record.note}</p>
          ) : (
            <p className="text-base text-mute">这次还没写记录。</p>
          )}
          <div className="grid grid-cols-2 gap-2 mt-8">
            <button onClick={() => setEditing(true)} className="h-[52px] rounded-full bg-ink text-paper text-base font-black">
              {record.note ? '修改' : '写记录'}
            </button>
            <button
              onClick={() => {
                if (window.confirm('删除这条记录？对应时长会从项目里扣除。')) onDelete(record.id)
              }}
              className="h-[52px] rounded-full bg-line text-base font-bold text-ember"
            >
              删除
            </button>
          </div>
        </div>
      )}
    </Sheet>
  )
}
