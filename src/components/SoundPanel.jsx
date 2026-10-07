import { Music } from 'lucide-react'
import { formatMinSec } from '../lib/utils'

// 计时页的声音面板：环境白噪声 + 古典乐
export default function SoundPanel({ audio, onSelect, onToggle }) {
  const { ambientTracks, classicalTracks, classicalShuffle, currentTrack, currentPiece, isPlaying, playSeconds } = audio
  const isClassical = currentPiece?.file?.startsWith('music/')

  return (
    <div className="bg-forge-surface/40 border border-forge-border/40 rounded-2xl p-3.5 space-y-3 mb-4 flex-shrink-0">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-forge-steel min-w-0 flex-1">
          <Music size={14} className={isPlaying ? 'animate-pulse text-forge-orange' : 'text-forge-steel'} />
          <select
            value={currentTrack?.id || ''}
            onChange={(e) => onSelect(e.target.value)}
            className="bg-transparent text-[11px] text-forge-light focus:outline-none w-full overflow-hidden text-ellipsis whitespace-nowrap cursor-pointer font-bold"
          >
            <option value="" className="bg-forge-surface text-forge-steel">
              -- 选择背景声音 --
            </option>
            <optgroup label="环境白噪声" className="bg-forge-surface text-forge-steel">
              {ambientTracks.map((t) => (
                <option key={t.id} value={t.id} className="bg-forge-surface text-forge-light">
                  {t.title}
                </option>
              ))}
            </optgroup>
            <optgroup label="古典乐（10 首，随机连播）" className="bg-forge-surface text-forge-steel">
              <option value={classicalShuffle.id} className="bg-forge-surface text-forge-light">
                {classicalShuffle.title}
              </option>
              {classicalTracks.map((t) => (
                <option key={t.id} value={t.id} className="bg-forge-surface text-forge-light">
                  🎵 {t.title}
                </option>
              ))}
            </optgroup>
          </select>
        </div>
        {currentTrack && (
          <button
            type="button"
            onClick={onToggle}
            className={`text-[9px] px-2.5 py-1 bg-forge-bg border rounded-lg transition-colors font-bold ${
              isPlaying ? 'text-forge-amber border-forge-amber/40 animate-pulse' : 'text-forge-steel border-forge-border hover:text-forge-light'
            }`}
          >
            {isPlaying ? '暂停' : '播起'}
          </button>
        )}
      </div>

      {currentTrack && (
        <div className="space-y-1.5 pt-0.5">
          {isClassical && (
            <div className="text-[10px] text-forge-amber/90 font-bold truncate pl-0.5">♪ {currentPiece.title}</div>
          )}
          <div className="flex items-center gap-3">
            <span className="text-[9px] text-forge-steel font-mono select-none">{formatMinSec(playSeconds)}</span>
            <div className="flex-1 h-1 bg-forge-bg border border-forge-border/20 rounded-full overflow-hidden relative">
              {isPlaying && (
                <div
                  className="absolute inset-0 bg-gradient-to-r from-forge-orange via-forge-amber to-forge-orange bg-[length:200%_100%] animate-wave-flow"
                  style={{ boxShadow: '0 0 3px #e8943a' }}
                />
              )}
            </div>
            <span className="text-[8px] text-forge-steel font-mono tracking-widest animate-pulse select-none">
              {isPlaying ? 'WAVING' : 'PAUSED'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
