// 计时环：270° 的粗弧，像炉温表；progress 0~1
export default function HeatRing({ progress, color = '#e5501b', children }) {
  const size = 300
  const stroke = 22
  const r = (size - stroke) / 2 - 6
  const c = 2 * Math.PI * r
  const arc = c * 0.75 // 270°
  const filled = arc * Math.min(1, Math.max(0, progress))
  const ticks = Array.from({ length: 28 }, (_, i) => i)

  return (
    <div className="relative w-full max-w-[300px] aspect-square mx-auto">
      <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full" aria-hidden>
        <g transform={`rotate(135 ${size / 2} ${size / 2})`}>
          {/* 刻度 */}
          {ticks.map((i) => {
            const a = (i / (ticks.length - 1)) * 270 * (Math.PI / 180)
            const r1 = r + stroke / 2 + 4
            const r2 = r1 + (i % 9 === 0 ? 8 : 4)
            return (
              <line
                key={i}
                x1={size / 2 + r1 * Math.cos(a)}
                y1={size / 2 + r1 * Math.sin(a)}
                x2={size / 2 + r2 * Math.cos(a)}
                y2={size / 2 + r2 * Math.sin(a)}
                stroke="#22262b"
                strokeWidth={i % 9 === 0 ? 2.5 : 1.5}
                opacity={i % 9 === 0 ? 0.8 : 0.35}
              />
            )
          })}
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="#d3cec3" strokeWidth={stroke} strokeDasharray={`${arc} ${c}`} />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            fill="none"
            stroke={color}
            strokeWidth={stroke}
            strokeDasharray={`${filled} ${c}`}
            style={{ transition: 'stroke-dasharray 0.9s linear' }}
          />
        </g>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">{children}</div>
    </div>
  )
}
