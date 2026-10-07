import { Trash2 } from 'lucide-react'
import { useProjectStore } from '../store/useProjectStore'
import { moodEmoji } from '../data/moods'

const pad = (n) => n.toString().padStart(2, '0')
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function dayLabel(ts) {
  const d = new Date(ts)
  const today = new Date()
  const yesterday = new Date()
  yesterday.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return '今天'
  if (d.toDateString() === yesterday.toDateString()) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`
}

function durationParts(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  if (h > 0) return m > 0 ? [[h, '小时'], [m, '分']] : [[h, '小时']]
  if (m > 0) return s > 0 ? [[m, '分'], [s, '秒']] : [[m, '分钟']]
  return [[sec, '秒']]
}

// 按天分组的锻造记录
export default function Feed() {
  const { records, projects, deleteRecord } = useProjectStore()

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
    <div className="flex-1 flex flex-col overflow-hidden w-full max-w-md mx-auto">
      <header className="flex-shrink-0 px-5 pt-5 pb-4 border-b-2 border-iron">
        <h1 className="text-[28px] leading-none font-black tracking-tight">历程</h1>
        <p className="text-[13px] text-steel mt-1.5">每一次专注都留在这里</p>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pb-8">
        {records.length === 0 ? (
          <div className="pt-10">
            <p className="text-2xl font-black leading-snug">还没有记录。</p>
            <p className="text-[15px] text-steel mt-3 leading-relaxed">在「专注」里完成一次计时并保存，就会出现在这里。</p>
          </div>
        ) : (
          groups.map((g) => (
            <section key={g.key} className="pt-5">
              <div className="flex items-baseline justify-between mb-3">
                <h2 className="text-base font-black">{dayLabel(g.ts)}</h2>
                <span className="text-[13px] text-steel">
                  共 <span className="num text-base font-bold text-iron">{Math.round(g.total / 60)}</span> 分钟
                </span>
              </div>
              <ul className="space-y-3">
                {g.items.map((r) => {
                  const p = projects.find((x) => x.id === r.projectId)
                  if (!p) return null
                  const d = new Date(r.startAt)
                  return (
                    <li key={r.id} className="relative bg-plate border-2 border-iron/15 rounded-md overflow-hidden">
                      <span className="absolute left-0 top-0 bottom-0 w-1.5" style={{ backgroundColor: p.color }} aria-hidden />
                      <div className="pl-5 pr-3 py-3.5">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <div className="text-[15px] font-bold truncate">
                              {p.icon} {p.name}
                            </div>
                            <div className="text-[13px] text-steel mt-0.5">
                              <span className="num text-sm">
                                {pad(d.getHours())}:{pad(d.getMinutes())}
                              </span>{' '}
                              开始 · {moodEmoji(r.mood)} {r.mood}
                            </div>
                          </div>
                          <div className="flex items-baseline gap-0.5 flex-shrink-0">
                            {durationParts(r.duration).map(([v, u]) => (
                              <span key={u}>
                                <span className="num text-[30px] leading-none font-extrabold">{v}</span>
                                <span className="text-[13px] font-bold mr-1">{u}</span>
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="flex items-end justify-between gap-3 mt-2.5">
                          <p className="text-[15px] leading-relaxed">{r.note}</p>
                          <button
                            onClick={() => handleDelete(r.id)}
                            aria-label="删除记录"
                            className="w-9 h-9 -mr-1 -mb-1 flex-shrink-0 flex items-center justify-center text-steel/70 active:text-ember-deep"
                          >
                            <Trash2 size={17} />
                          </button>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            </section>
          ))
        )}
      </div>
    </div>
  )
}
