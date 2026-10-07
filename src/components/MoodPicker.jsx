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
            className={`h-16 rounded-md border-2 flex flex-col items-center justify-center gap-0.5 ${
              active ? 'bg-iron border-iron text-plate' : 'bg-plate border-iron/15 text-iron'
            }`}
          >
            <span className="text-xl leading-none">{m.emoji}</span>
            <span className="text-[13px] font-bold">{m.label}</span>
          </button>
        )
      })}
    </div>
  )
}
