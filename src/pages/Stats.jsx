import { useProjectStore } from '../store/useProjectStore'
import { getStage, getStageStyle, getProgress, getNextMilestone } from '../lib/milestones'

const sumHours = (records) => records.reduce((acc, r) => acc + r.duration / 3600, 0)

// 连续有记录的天数（今天没记也从昨天往前数）
function calcStreak(records) {
  if (records.length === 0) return 0
  const days = new Set(records.map((r) => new Date(r.startAt).toDateString()))
  const cursor = new Date()
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  let streak = 0
  while (days.has(cursor.toDateString())) {
    streak++
    cursor.setDate(cursor.getDate() - 1)
  }
  return streak
}

// 近 7 天每天的分钟数
function lastSevenDays(records) {
  const today = new Date()
  const days = []
  for (let i = 6; i >= 0; i--) {
    const d = new Date()
    d.setDate(today.getDate() - i)
    days.push(d)
  }
  const minutes = Array(7).fill(0)
  records.forEach((r) => {
    const key = new Date(r.startAt).toDateString()
    days.forEach((d, i) => {
      if (d.toDateString() === key) minutes[i] += r.duration / 60
    })
  })
  const week = ['日', '一', '二', '三', '四', '五', '六']
  return days.map((d, i) => ({
    label: week[d.getDay()],
    val: Math.round(minutes[i]),
    isToday: d.toDateString() === today.toDateString(),
  }))
}

const fmt = (h) => (h >= 100 ? Math.floor(h).toString() : h.toFixed(1))

export default function Stats() {
  const { records, projects } = useProjectStore()

  const total = sumHours(records)
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const today = sumHours(records.filter((r) => r.startAt >= todayStart))
  const week = sumHours(records.filter((r) => r.startAt >= Date.now() - 7 * 86400000))
  const streak = calcStreak(records)
  const trend = lastSevenDays(records)
  const maxVal = Math.max(...trend.map((d) => d.val), 30)
  const longest = records.reduce((m, r) => Math.max(m, r.duration), 0)
  const ranked = [...projects].sort((a, b) => b.totalHours - a.totalHours)
  const top = ranked[0]

  const tiles = [
    ['今天', fmt(today), '小时'],
    ['近 7 天', fmt(week), '小时'],
    ['连续', String(streak), '天'],
    ['最长一次', String(Math.round(longest / 60)), '分钟'],
  ]

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full max-w-md mx-auto">
      <header className="flex-shrink-0 px-5 pt-5 pb-4 border-b-2 border-iron">
        <h1 className="text-[28px] leading-none font-black tracking-tight">印记</h1>
        <p className="text-[13px] text-steel mt-1.5">凡所经过，皆留痕迹</p>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-8 space-y-5">
        {/* 总时长：页面主角 */}
        <section className="bg-iron text-plate rounded-md px-5 pt-4 pb-5 shadow-plate">
          <div className="text-sm font-bold text-plate/70">累计锻造</div>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="num text-[80px] leading-[0.85] font-extrabold">{fmt(total)}</span>
            <span className="text-lg font-bold">小时</span>
          </div>
          <div className="mt-4 h-2 bg-plate/15 rounded-sm overflow-hidden">
            <div className="h-full bg-ember" style={{ width: `${Math.min(100, (total / 10000) * 100)}%`, minWidth: total > 0 ? '4px' : 0 }} />
          </div>
          <div className="mt-1.5 text-[13px] text-plate/70">
            离一万小时还有 <span className="num text-[15px] font-bold text-plate">{Math.max(0, 10000 - total).toFixed(0)}</span> 小时
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {tiles.map(([label, value, unit]) => (
            <div key={label} className="bg-plate border-2 border-iron/15 rounded-md px-4 py-3">
              <div className="text-[13px] font-bold text-steel">{label}</div>
              <div className="mt-1">
                <span className="num text-[38px] leading-none font-extrabold">{value}</span>
                <span className="text-sm font-bold ml-1">{unit}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="bg-plate border-2 border-iron/15 rounded-md px-4 pt-4 pb-3">
          <div className="flex items-baseline justify-between mb-4">
            <h2 className="text-base font-black">近 7 天</h2>
            <span className="text-[13px] text-steel">单位：分钟</span>
          </div>
          <div className="flex items-end justify-between gap-2 h-36">
            {trend.map((d, i) => (
              <div key={i} className="flex-1 h-full flex flex-col items-center justify-end">
                <span className={`num text-sm font-bold mb-1 ${d.val ? '' : 'text-steel/60'}`}>{d.val}</span>
                <div
                  className={`w-full rounded-t-[3px] ${d.isToday ? 'bg-ember' : 'bg-iron'}`}
                  style={{ height: `${Math.max(d.val ? 4 : 2, (d.val / maxVal) * 100)}%`, opacity: d.val ? 1 : 0.15 }}
                />
                <span className={`text-[13px] mt-1.5 ${d.isToday ? 'font-black text-ember' : 'font-bold text-steel'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </section>

        {ranked.length > 0 && (
          <section className="bg-plate border-2 border-iron/15 rounded-md px-4 py-4">
            <h2 className="text-base font-black mb-3">各项目</h2>
            <ul className="space-y-4">
              {ranked.map((p) => {
                const stage = getStage(p.totalHours)
                const share = total > 0 ? (p.totalHours / total) * 100 : 0
                return (
                  <li key={p.id}>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[15px] font-bold truncate">
                        {p.icon} {p.name}
                        {p === top && p.totalHours > 0 && <span className="ml-2 text-[13px] text-brass">领先</span>}
                      </span>
                      <span className={`flex-shrink-0 text-xs font-bold px-2 py-0.5 rounded-sm ${getStageStyle(stage)}`}>{stage}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <div className="flex-1 h-2.5 bg-stone-deep rounded-sm overflow-hidden">
                        <div className="h-full" style={{ width: `${getProgress(p.totalHours) * 100}%`, backgroundColor: p.color }} />
                      </div>
                      <span className="text-[13px] text-steel w-28 text-right">
                        <span className="num text-[15px] font-bold text-iron">{fmt(p.totalHours)}</span> / {getNextMilestone(p.totalHours)} 小时
                      </span>
                    </div>
                    <div className="text-[13px] text-steel mt-0.5">占总时长 {share.toFixed(0)}%</div>
                  </li>
                )
              })}
            </ul>
          </section>
        )}
      </div>
    </div>
  )
}
