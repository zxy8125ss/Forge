import { Music, Pause, Play } from 'lucide-react'

// 背景声音：环境白噪声 + 古典乐
export default function SoundPanel({ audio, onSelect, onToggle }) {
  const { ambientTracks, classicalTracks, classicalShuffle, currentTrack, currentPiece, isPlaying } = audio
  const isClassical = currentPiece?.file?.startsWith('music/')

  return (
    <div className="bg-plate border-2 border-iron/15 rounded-md px-3.5 py-3 flex items-center gap-3">
      <Music size={20} className={isPlaying ? 'text-ember flex-shrink-0' : 'text-steel flex-shrink-0'} />
      <div className="min-w-0 flex-1">
        <select
          value={currentTrack?.id || ''}
          onChange={(e) => onSelect(e.target.value)}
          aria-label="背景声音"
          className="w-full bg-transparent text-[15px] font-bold focus:outline-none truncate"
        >
          <option value="">不放背景声音</option>
          <optgroup label="环境白噪声">
            {ambientTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </optgroup>
          <optgroup label="古典乐（10 首，随机连播）">
            <option value={classicalShuffle.id}>{classicalShuffle.title}</option>
            {classicalTracks.map((t) => (
              <option key={t.id} value={t.id}>
                {t.title}
              </option>
            ))}
          </optgroup>
        </select>
        {isClassical && <p className="text-[13px] text-steel truncate mt-0.5">正在播放：{currentPiece.title}</p>}
      </div>
      {currentTrack && (
        <button
          type="button"
          onClick={onToggle}
          aria-label={isPlaying ? '暂停声音' : '播放声音'}
          className={`w-10 h-10 flex-shrink-0 rounded-md flex items-center justify-center ${isPlaying ? 'bg-ember text-plate' : 'bg-stone-deep text-iron'}`}
        >
          {isPlaying ? <Pause size={18} fill="currentColor" /> : <Play size={18} fill="currentColor" />}
        </button>
      )}
    </div>
  )
}
