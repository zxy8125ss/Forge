const TABS = [
  { id: 'home', label: '今天' },
  { id: 'timer', label: '专注' },
  { id: 'feed', label: '历程' },
  { id: 'stats', label: '印记' },
]

// 纯文字导航：当前页墨黑加粗，下方一个炉火橙小点
export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex-shrink-0 bg-paper border-t border-line pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {TABS.map(({ id, label }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`h-14 flex flex-col items-center justify-center gap-1 text-[15px] ${active ? 'font-black text-ink' : 'font-medium text-mute'}`}
            >
              {label}
              <span className={`w-1 h-1 rounded-full ${active ? 'bg-ember' : 'bg-transparent'}`} />
            </button>
          )
        })}
      </div>
    </nav>
  )
}
