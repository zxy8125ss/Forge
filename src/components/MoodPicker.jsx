import { MOODS } from '../data/moods'

export default function MoodPicker({ selectedMood, onSelect }) {
  return (
    <div className="grid grid-cols-5 gap-2">
      {MOODS.map((m) => {
        const active = selectedMood === m.label
        return (
          <button
            key={m.label}
            type="button"
            onClick={() => onSelect(m.label)}
            aria-pressed={active}
            className={`h-[68px] rounded-2xl flex flex-col items-center justify-center gap-1 ${active ? 'bg-ink text-paper' : 'bg-white text-ink'}`}
          >
            <span className="text-xl leading-none">{m.emoji}</span>
            <span className="text-[13px] font-bold">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
