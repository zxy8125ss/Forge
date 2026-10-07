import { useState } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import { moodEmoji } from '../data/moods'

const pad = (n) => n.toString().padStart(2, '0')
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function dayLabel(ts) {
  const d = new Date(ts)
  const today = new Date()
  const y = new Date()
  y.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return '今天'
  if (d.toDateString() === y.toDateString()) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`
}

// 时长：大于 1 小时显示 1:05，否则显示分钟数
function Duration({ sec }) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  if (h > 0)
    return (
      <>
        <span className="num text-[34px] leading-none">
          {h}:{pad(m)}
        </span>
        <span className="text-[13px] font-bold text-mute ml-1">时</span>
      </>
    )
  return (
    <>
      <span className="num text-[34px] leading-none">{Math.max(1, m)}</span>
      <span className="text-[13px] font-bold text-mute ml-1">分</span>
    </>
  )
}

export default function Feed() {
  const { records, projects, deleteRecord } = useProjectStore()
  const [open, setOpen] = useState(null)

  const groups = []
  records.forEach((r) => {
    const key = new Date(r.startAt).toDateString()
    let g = groups.find((x) => x.key === key)
    if (!g) groups.push((g = { key, ts: r.startAt, items: [], total: 0 }))
    g.items.push(r)
    g.total += r.duration
  })

  const handleDelete = (id) => {
    if (window.confirm('删除这条记录？对应时长会从项目里扣除。')) deleteRecord(id)
  }

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar w-full max-w-md mx-auto">
      <header className="px-6 pt-8 pb-2">
        <h1 className="text-[34px] font-black leading-none">历程</h1>
      </header>

      {records.length === 0 ? (
        <p className="px-6 pt-6 text-base text-mute leading-relaxed">完成一次专注并保存后，会出现在这里。</p>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="pt-7">
            <div className="flex items-baseline justify-between px-6 pb-2">
              <h2 className="text-base font-black">{dayLabel(g.ts)}</h2>
              <span className="text-sm text-mute">
                共 <span className="font-bold text-ink">{Math.round(g.total / 60)}</span> 分钟
              </span>
            </div>
            {g.items.map((r) => {
              const p = projects.find((x) => x.id === r.projectId)
              if (!p) return null
              const d = new Date(r.startAt)
              const expanded = open === r.id
              return (
                <div key={r.id} className="border-t border-line">
                  <button onClick={() => setOpen(expanded ? null : r.id)} className="w-full flex items-start justify-between gap-4 px-6 py-4 text-left">
                    <div className="min-w-0">
                      <div className="text-[17px] font-black truncate">{p.name}</div>
                      <p className="text-[15px] leading-relaxed mt-1">{r.note}</p>
                      <p className="text-[13px] text-mute mt-1">
                        {pad(d.getHours())}:{pad(d.getMinutes())} · {moodEmoji(r.mood)} {r.mood}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      <Duration sec={r.duration} />
                    </div>
                  </button>
                  {expanded && (
                    <div className="px-6 pb-4 -mt-1">
                      <button onClick={() => handleDelete(r.id)} className="h-9 px-4 rounded-full bg-line text-sm font-bold text-ember">
                        删除这条记录
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </section>
        ))
      )}
      <div className="h-8" />
    </div>
  )
}
