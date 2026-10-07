import { Hammer, Flame, ScrollText, ChartNoAxesColumn } from 'lucide-react'

const TABS = [
  { id: 'home', label: '熔炉', icon: Hammer },
  { id: 'timer', label: '专注', icon: Flame },
  { id: 'feed', label: '历程', icon: ScrollText },
  { id: 'stats', label: '印记', icon: ChartNoAxesColumn },
]

// 底部铸铁导航条，当前页上沿亮一条熔铁橙
export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <nav className="flex-shrink-0 bg-iron text-plate pb-[env(safe-area-inset-bottom)]">
      <div className="max-w-md mx-auto grid grid-cols-4">
        {TABS.map(({ id, label, icon: Icon }) => {
          const active = activeTab === id
          return (
            <button
              key={id}
              onClick={() => onTabChange(id)}
              aria-current={active ? 'page' : undefined}
              className={`relative flex flex-col items-center gap-1 pt-3 pb-2.5 transition-colors ${
                active ? 'text-ember' : 'text-plate/55 active:text-plate'
              }`}
            >
              <span className={`absolute top-0 left-1/2 -translate-x-1/2 h-[3px] w-8 ${active ? 'bg-ember' : 'bg-transparent'}`} />
              <Icon size={22} strokeWidth={active ? 2.5 : 2} />
              <span className={`text-xs ${active ? 'font-bold' : 'font-medium'}`}>{label}</span>
            </button>
          )
        })}
      </div>
    </nav>
  )
}
