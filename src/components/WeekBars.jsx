// 近 7 天每天的分钟数
export function lastSevenDays(records) {
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
  return days.map((d, i) => ({ label: week[d.getDay()], val: Math.round(minutes[i]), isToday: d.toDateString() === today.toDateString() }))
}

// 七根柱子，今天用炉火橙；showValues 时柱顶显示分钟数
export default function WeekBars({ records, height = 64, showValues = false, showLabels = false }) {
  const days = lastSevenDays(records)
  const max = Math.max(...days.map((d) => d.val), 30)
  return (
    <div>
      <div className="flex items-end gap-2.5" style={{ height }}>
        {days.map((d, i) => (
          <div key={i} className="flex-1 h-full flex flex-col justify-end items-center">
            {showValues && <span className={`num text-sm mb-1 ${d.val ? 'text-ink' : 'text-mute/50'}`}>{d.val}</span>}
            <div
              className={`w-full rounded-[4px] ${d.isToday ? 'bg-ember' : 'bg-track'}`}
              style={{ height: `${Math.max(4, (d.val / max) * 100)}%` }}
              title={`${d.val} 分钟`}
            />
          </div>
        ))}
      </div>
      {showLabels && (
        <div className="flex gap-2.5 mt-2">
          {days.map((d, i) => (
            <span key={i} className={`flex-1 text-center text-[13px] ${d.isToday ? 'font-black text-ember' : 'text-mute'}`}>
              {d.label}
            </span>
          ))}
        </div>
      )}
    </div>
  )
}
