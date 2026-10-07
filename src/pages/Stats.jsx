import { Clock, TrendingUp, Award, Flame } from 'lucide-react'
import { useProjectStore } from '../store/useProjectStore'
import { getStage, getStageStyle } from '../lib/milestones'

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

function StatTile({ label, icon: Icon, iconClass, value, unit }) {
  return (
    <div className="bg-forge-surface border border-forge-border rounded-2xl p-3 flex flex-col justify-between">
      <div className="flex items-center justify-between text-forge-steel mb-1">
        <span className="text-[9px] font-bold">{label}</span>
        <Icon size={12} className={iconClass} />
      </div>
      <span className="text-base font-black text-forge-light font-mono">
        {value}
        <span className="text-[9px] font-medium text-forge-steel ml-0.5">{unit}</span>
      </span>
    </div>
  )
}

export default function Stats() {
  const { records, projects } = useProjectStore()

  const total = sumHours(records)
  const todayStart = new Date().setHours(0, 0, 0, 0)
  const today = sumHours(records.filter((r) => r.startAt >= todayStart))
  const weekStart = Date.now() - 7 * 24 * 60 * 60 * 1000
  const week = sumHours(records.filter((r) => r.startAt >= weekStart))
  const streak = calcStreak(records)
  const trend = lastSevenDays(records)
  const maxVal = Math.max(...trend.map((d) => d.val), 60)

  const top = [...projects].sort((a, b) => b.totalHours - a.totalHours)[0]
  const topStage = top ? getStage(top.totalHours) : '尚无'

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full max-w-md mx-auto">
      <div className="px-4 pt-3 pb-3 flex-shrink-0">
        <h1 className="text-xl font-black text-forge-light tracking-tight">我的印记</h1>
        <p className="text-[10px] text-forge-steel tracking-wide">凡所经过，皆留痕迹。每一分坚持都是火候。</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28 space-y-4">
        <div className="grid grid-cols-2 gap-3">
          <StatTile label="今日工作" icon={Clock} iconClass="text-forge-orange" value={today.toFixed(1)} unit="h" />
          <StatTile label="本周专注" icon={TrendingUp} iconClass="text-forge-amber" value={week.toFixed(1)} unit="h" />
          <StatTile label="累计精炼" icon={Award} iconClass="text-cyan-400" value={total.toFixed(1)} unit="h" />
          <StatTile label="连熔天数" icon={Flame} iconClass="text-rose-500" value={streak} unit="天" />
        </div>

        {top && (
          <div className="bg-forge-surface border border-forge-border rounded-2xl p-3 flex items-center justify-between shadow-lg shadow-black/5">
            <div className="flex items-center gap-3">
              <span className="text-xl p-2 bg-forge-bg/60 rounded-xl">👑</span>
              <div>
                <h4 className="font-bold text-forge-light text-xs">当前最高段位</h4>
                <p className="text-[9px] text-forge-steel mt-0.5">
                  项目: {top.icon} {top.name}
                </p>
              </div>
            </div>
            <span className={`text-[9px] font-black px-2 py-0.5 border rounded-lg uppercase tracking-wider ${getStageStyle(topStage)}`}>
              {topStage}
            </span>
          </div>
        )}

        <div className="bg-forge-surface border border-forge-border rounded-2xl p-4 shadow-lg shadow-black/5">
          <h4 className="font-bold text-forge-light text-xs mb-3">近 7 日熔炼趋势 (分钟)</h4>
          <div className="flex justify-between items-end h-28 px-1 font-mono">
            {trend.map((d, i) => (
              <div key={i} className="flex flex-col items-center flex-1 group">
                <span className="text-[7px] text-forge-steel mb-0.5 opacity-0 group-hover:opacity-100 transition-opacity">{d.val}</span>
                <div className="w-3 bg-forge-bg rounded-t-md h-20 flex items-end">
                  <div
                    className={`w-full rounded-t-md transition-all duration-700 ${
                      d.isToday ? 'bg-forge-amber shadow-sm shadow-forge-amber/40' : 'bg-forge-orange/60'
                    }`}
                    style={{ height: `${(d.val / maxVal) * 100}%` }}
                  />
                </div>
                <span className={`text-[9px] mt-1.5 ${d.isToday ? 'text-forge-amber font-bold' : 'text-forge-steel'}`}>{d.label}</span>
              </div>
            ))}
          </div>
        </div>

        {projects.length > 0 && (
          <div className="bg-forge-surface border border-forge-border rounded-2xl p-3.5 shadow-lg shadow-black/5">
            <h4 className="font-bold text-forge-light text-xs mb-3">熔炼时间比例</h4>
            <div className="space-y-2.5">
              {projects
                .filter((p) => p.totalHours > 0)
                .sort((a, b) => b.totalHours - a.totalHours)
                .map((p) => {
                  const pct = total > 0 ? (p.totalHours / total) * 100 : 0
                  return (
                    <div key={p.id} className="space-y-0.5">
                      <div className="flex justify-between items-center text-[9px]">
                        <span className="font-bold text-forge-light flex items-center gap-1.5">
                          <span>{p.icon}</span>
                          <span>{p.name}</span>
                        </span>
                        <span className="text-forge-steel font-mono">
                          {pct.toFixed(0)}% ({p.totalHours.toFixed(1)}h)
                        </span>
                      </div>
                      <div className="h-0.5 bg-forge-bg rounded-full overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: p.color }} />
                      </div>
                    </div>
                  )
                })}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
