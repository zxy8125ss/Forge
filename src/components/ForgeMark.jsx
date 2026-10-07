// Forge 标志：铸铁底上的铁砧和一条熔铁（与 App 图标同一套图形）
export default function ForgeMark({ className = '' }) {
  return (
    <svg viewBox="0 0 64 64" className={className} role="img" aria-label="Forge">
      <rect width="64" height="64" rx="10" fill="#22262b" />
      <g transform="translate(32 34) scale(0.86) translate(-32 -34)">
        <path d="M31 9.5l1.6-4.2M38.5 11.5l3.2-3.2M24.5 11.5l-3.2-3.2" stroke="#e5501b" strokeWidth="2.2" strokeLinecap="round" />
        <rect x="20" y="16" width="26" height="6.5" rx="1" fill="#e5501b" />
        <path d="M9 25h46v4.5c-7.5 0-11.5 3-12.5 8.5h-19C22.5 31.5 17.5 28.5 9 28.5z" fill="#e4e0d8" />
        <path d="M25.5 38h13l3.2 9.5H22.3z" fill="#e4e0d8" />
        <rect x="16" y="47.5" width="32" height="5.5" rx="1" fill="#e4e0d8" />
      </g>
    </svg>
  )
}
