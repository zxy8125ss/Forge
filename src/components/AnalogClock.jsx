// 指针表盘（无数字）：60 根刻度、时针分针秒针，外圈弧线 = 本次专注进度
export default function AnalogClock({ now, progress = 0, running, color = '#e5501b', className = '' }) {
  const C = 500
  const R = 230 // 表盘半径
  const h = now.getHours() % 12
  const m = now.getMinutes()
  const s = now.getSeconds()
  const hourDeg = (h + m / 60) * 30
  const minDeg = (m + s / 60) * 6
  const secDeg = s * 6

  const ringR = R + 12
  const ringLen = 2 * Math.PI * ringR
  const p = Math.min(1, Math.max(0, progress))

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0
    const quarter = i % 15 === 0
    const a = (i * 6 * Math.PI) / 180
    const r1 = R - (quarter ? 34 : major ? 24 : 10)
    return (
      <line
        key={i}
        x1={C / 2 + r1 * Math.sin(a)}
        y1={C / 2 - r1 * Math.cos(a)}
        x2={C / 2 + (R - 2) * Math.sin(a)}
        y2={C / 2 - (R - 2) * Math.cos(a)}
        stroke={major ? '#a8a8a8' : '#4a4a4a'}
        strokeWidth={quarter ? 9 : major ? 5 : 2}
        strokeLinecap="butt"
      />
    )
  })

  const hand = (deg, len, tail, width, stroke) => (
    <line
      x1={C / 2}
      y1={C / 2 + tail}
      x2={C / 2}
      y2={C / 2 - len}
      stroke={stroke}
      strokeWidth={width}
      strokeLinecap="round"
      transform={`rotate(${deg} ${C / 2} ${C / 2})`}
    />
  )

  return (
    <svg viewBox={`0 0 ${C} ${C}`} className={className} aria-label="时钟" role="img">
      {/* 专注进度外圈 */}
      <circle cx={C / 2} cy={C / 2} r={ringR} fill="none" stroke="#161616" strokeWidth="6" />
      <circle
        cx={C / 2}
        cy={C / 2}
        r={ringR}
        fill="none"
        stroke={color}
        strokeOpacity={running ? 0.85 : 0.4}
        strokeWidth="6"
        strokeDasharray={`${ringLen * p} ${ringLen}`}
        transform={`rotate(-90 ${C / 2} ${C / 2})`}
        style={{ transition: 'stroke-dasharray 1s linear' }}
      />
      {ticks}
      {hand(hourDeg, 120, 22, 14, '#c8c8c8')}
      {hand(minDeg, 186, 26, 9, '#b0b0b0')}
      {running && hand(secDeg, 200, 40, 3, color)}
      <circle cx={C / 2} cy={C / 2} r="13" fill="#000" stroke={running ? color : '#8a8a8a'} strokeWidth="5" />
    </svg>
  )
}
