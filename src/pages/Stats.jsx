import { useProjectStore } from '../store/useProjectStore'
import { getStage, getProgress, getNextMilestone } from '../lib/milestones'
import WeekBars from '../components/WeekBars'
import { startOfToday, sumMinutes, fmtHours } from '../lib/time'

// 连续有记录的天数（今天没记也从昨天往前数）
function calcStreak(records) {
  if (records.length === 0) return 0
  const days = new Set(records.map((r) => new Date(r.startAt).toDateString()))
  const cursor = new Date()
  if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1)
  let n = 0
  while (days.has(cursor.toDateString())) {
    n++
    cursor.setDate(cursor.getDate() - 1)
  }
  return n
}

export default function Stats() {
  const { records, projects } = useProjectStore()

  const total = sumMinutes(records) / 60
  const week = sumMinutes(records.filter((r) => r.startAt >= Date.now() - 7 * 86400000)) / 60
  const today = sumMinutes(records.filter((r) => r.startAt >= startOfToday())) / 60
  const streak = calcStreak(records)
  const longest = records.reduce((m, r) => Math.max(m, r.duration), 0)
  const ranked = [...projects].sort((a, b) => b.totalHours - a.totalHours)

  const figures = [
    ['今天', fmtHours(today), '小时'],
    ['近 7 天', fmtHours(week), '小时'],
    ['连续', String(streak), '天'],
    ['最长一次', String(Math.round(longest / 60)), '分钟'],
  ]

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar w-full max-w-md mx-auto">
      <section className="px-6 pt-8">
        <p className="text-sm text-mute">累计专注</p>
        <div className="num text-[128px] leading-[0.82] tracking-[-2px] mt-3">{fmtHours(total)}</div>
        <p className="text-base font-bold mt-3">小时</p>
        <div className="mt-6 h-1 rounded-full bg-track overflow-hidden">
          <div className="h-full bg-ember rounded-full" style={{ width: `${Math.min(100, (total / 10000) * 100)}%`, minWidth: total > 0 ? 4 : 0 }} />
        </div>
        <p className="text-[13px] text-mute mt-2">距一万小时还有 {Math.max(0, 10000 - total).toFixed(0)} 小时</p>
      </section>

      <section className="grid grid-cols-2 gap-y-7 px-6 mt-10">
        {figures.map(([label, value, unit]) => (
          <div key={label}>
            <p className="text-[13px] text-mute">{label}</p>
            <div className="mt-1.5">
              <span className="num text-[48px] leading-none">{value}</span>
              <span className="text-sm font-bold ml-1">{unit}</span>
            </div>
          </div>
        ))}
      </section>

      <section className="px-6 mt-11">
        <h2 className="text-base font-black mb-4">近 7 天 · 分钟</h2>
        <WeekBars records={records} height={120} showValues showLabels />
      </section>

      {ranked.length > 0 && (
        <section className="mt-11">
          <h2 className="text-base font-black px-6 mb-2">各项目</h2>
          {ranked.map((p) => {
            const next = getNextMilestone(p.totalHours)
            return (
              <div key={p.id} className="px-6 py-4 border-t border-line">
                <div className="flex items-baseline justify-between gap-3">
                  <div className="min-w-0">
                    <span className="text-[17px] font-black">{p.name}</span>
                    <span className="text-[13px] text-mute ml-2">{getStage(p.totalHours)}</span>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="num text-[30px] leading-none">{fmtHours(p.totalHours)}</span>
                    <span className="text-[13px] text-mute ml-1">/ {next} h</span>
                  </div>
                </div>
                <div className="mt-2.5 h-1 rounded-full bg-track overflow-hidden">
                  <div className="h-full rounded-full bg-ink" style={{ width: `${getProgress(p.totalHours) * 100}%` }} />
                </div>
              </div>
            )
          })}
        </section>
      )}
      <div className="h-8" />
    </div>
  )
}
