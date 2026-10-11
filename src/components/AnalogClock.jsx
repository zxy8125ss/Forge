// 指针表盘（无数字）：60 刻度、时分秒针，外圈弧线 = 本次专注进度
export default function AnalogClock({ now, progress = 0, running, color = '#e5501b', className = '' }) {
  const C = 500
  const R = 222
  const c = C / 2
  const h = now.getHours() % 12
  const m = now.getMinutes()
  const s = now.getSeconds()
  const ringR = R + 16
  const ringLen = 2 * Math.PI * ringR
  const p = Math.min(1, Math.max(0, progress))

  const ticks = Array.from({ length: 60 }, (_, i) => {
    const major = i % 5 === 0
    const quarter = i % 15 === 0
    const a = (i * 6 * Math.PI) / 180
    const r1 = R - (quarter ? 36 : major ? 24 : 12)
    return (
      <line
        key={i}
        x1={c + r1 * Math.sin(a)}
        y1={c - r1 * Math.cos(a)}
        x2={c + (R - 4) * Math.sin(a)}
        y2={c - (R - 4) * Math.cos(a)}
        stroke={major ? '#e9e1d6' : '#6a6058'}
        strokeWidth={quarter ? 9 : major ? 5 : 2.2}
      />
    )
  })

  const hand = (deg, len, tail, width, stroke) => (
    <line x1={c} y1={c + tail} x2={c} y2={c - len} stroke={stroke} strokeWidth={width} strokeLinecap="round" transform={`rotate(${deg} ${c} ${c})`} />
  )

  return (
    <svg viewBox={`0 0 ${C} ${C}`} className={className} aria-label="时钟" role="img">
      <defs>
        <radialGradient id="face" cx="50%" cy="40%" r="60%">
          <stop offset="0%" stopColor="#2a221d" />
          <stop offset="100%" stopColor="#17120f" />
        </radialGradient>
      </defs>
      <circle cx={c} cy={c} r={R + 4} fill="url(#face)" />
      <circle cx={c} cy={c} r={ringR} fill="none" stroke="#2b2420" strokeWidth="8" />
      <circle
        cx={c}
        cy={c}
        r={ringR}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={`${ringLen * p} ${ringLen}`}
        transform={`rotate(-90 ${c} ${c})`}
        style={{ transition: 'stroke-dasharray 1s linear' }}
      />
      {ticks}
      {hand((h + m / 60) * 30, 120, 22, 15, '#f1ebe3')}
      {hand((m + s / 60) * 6, 190, 26, 9, '#f1ebe3')}
      {running && hand(s * 6, 204, 42, 3.5, color)}
      <circle cx={c} cy={c} r="12" fill="#17120f" stroke={running ? color : '#bdb3a7'} strokeWidth="5" />
    </svg>
  )
}
