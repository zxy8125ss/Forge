import { Hammer, Flame, History, ChartNoAxesColumn } from 'lucide-react'

const TABS = [
  { id: 'home', label: '熔炉', icon: Hammer },
  { id: 'timer', label: '专注', icon: Flame },
  { id: 'feed', label: '历程', icon: History },
  { id: 'stats', label: '印记', icon: ChartNoAxesColumn },
]

export default function BottomNav({ activeTab, onTabChange }) {
  return (
    <div className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 w-[92%] max-w-sm bg-forge-surface/60 backdrop-blur-lg border border-forge-border/40 rounded-full shadow-2xl py-2 px-6 flex justify-between items-center">
      {TABS.map(({ id, label, icon: Icon }) => {
        const active = activeTab === id
        return (
          <button
            key={id}
            onClick={() => onTabChange(id)}
            className={`flex flex-col items-center gap-1 transition-all duration-200 select-none flex-1 py-1 ${
              active ? 'text-forge-orange scale-105 font-bold' : 'text-forge-steel hover:text-forge-light'
            }`}
          >
            <Icon size={18} className={active ? 'text-forge-orange' : 'text-forge-steel'} />
            <span className="text-[9px] tracking-widest font-medium mt-0.5">{label}</span>
          </button>
        )
      })}
    </div>
  )
}
