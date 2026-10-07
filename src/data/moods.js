export const MOODS = [
  { label: '专注', emoji: '🔥', color: 'bg-forge-orange/20 text-forge-amber border-forge-orange/50' },
  { label: '平静', emoji: '🍃', color: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50' },
  { label: '困惑', emoji: '🌀', color: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/50' },
  { label: '疲惫', emoji: '🔋', color: 'bg-yellow-600/20 text-yellow-400 border-yellow-600/50' },
  { label: '亢奋', emoji: '⚡', color: 'bg-rose-500/20 text-rose-400 border-rose-500/50' },
]

export const moodEmoji = (label) => MOODS.find((m) => m.label === label)?.emoji ?? '✨'
