import { MOODS } from '../data/moods'

export default function MoodPicker({ selectedMood, onSelect }) {
  return (
    <div className="flex justify-between gap-1.5 my-3">
      {MOODS.map((m) => (
        <button
          key={m.label}
          type="button"
          onClick={() => onSelect(m.label)}
          className={`flex flex-col items-center flex-1 py-2 px-1 rounded-xl border transition-all duration-200 select-none ${
            selectedMood === m.label
              ? `${m.color} scale-105 font-medium`
              : 'bg-forge-surface/30 border-forge-border/30 text-forge-steel hover:bg-forge-surface/50 hover:text-forge-light'
          }`}
        >
          <span className="text-lg mb-1">{m.emoji}</span>
          <span className="text-[10px]">{m.label}</span>
        </button>
      ))}
    </div>
  )
}
