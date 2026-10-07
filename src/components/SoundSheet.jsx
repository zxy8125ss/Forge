import { Check } from 'lucide-react'
import Sheet from './Sheet'

// 背景声音选择面板
export default function SoundSheet({ audio, onSelect, onClose }) {
  const { ambientTracks, classicalTracks, classicalShuffle, currentTrack } = audio
  const current = currentTrack?.id || ''

  const Row = ({ id, title }) => (
    <button
      type="button"
      onClick={() => onSelect(id)}
      className="w-full h-[52px] flex items-center justify-between text-left text-base border-t border-line first:border-t-0"
    >
      <span className={current === id ? 'font-black' : 'font-medium'}>{title}</span>
      {current === id && <Check size={20} strokeWidth={3} className="text-ember" />}
    </button>
  )

  return (
    <Sheet title="背景声音" onClose={onClose}>
      <div className="space-y-6">
        <div>
          <Row id="" title="不放" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-mute mb-1">环境白噪声</h3>
          {ambientTracks.map((t) => (
            <Row key={t.id} id={t.id} title={t.title} />
          ))}
        </div>
        <div>
          <h3 className="text-sm font-bold text-mute mb-1">古典乐 · 放完自动随机接下一首</h3>
          <Row id={classicalShuffle.id} title="随机连播" />
          {classicalTracks.map((t) => (
            <Row key={t.id} id={t.id} title={t.title} />
          ))}
        </div>
      </div>
    </Sheet>
  )
}
