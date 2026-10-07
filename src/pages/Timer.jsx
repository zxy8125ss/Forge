import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, Check, Minus, Plus, ChevronDown, Moon, Music } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import { useAudio } from '../hooks/useAudio'
import { useProjectStore } from '../store/useProjectStore'
import RecordModal from '../components/RecordModal'
import ClockScreen from '../components/ClockScreen'
import SoundSheet from '../components/SoundSheet'
import { asset } from '../lib/utils'

const ARTWORK = [
  { src: 'lockscreen_artwork.png', sizes: '512x512', type: 'image/png' },
  { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
].map((a) => ({ ...a, src: asset(a.src) }))

const pad = (n) => n.toString().padStart(2, '0')
const clock = (sec) => {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  const s = sec % 60
  return h > 0 ? `${h}:${pad(m)}:${pad(s)}` : `${pad(m)}:${pad(s)}`
}

export default function Timer({ preselectedProjectId, onNavigateToFeed }) {
  const { seconds, running, activeProjectId, start, pause, resume, reset } = useTimer()
  const audio = useAudio()
  const { currentTrack, currentPiece, isPlaying, playSeconds, selectTrack, togglePlay, enableAudio, setSilenceActive } = audio
  const { projects, records, addRecord } = useProjectStore()

  const fallbackId = projects.find((p) => p.id === records[0]?.projectId)?.id || projects[0]?.id || ''
  const [selectedId, setSelectedId] = useState(activeProjectId || preselectedProjectId || fallbackId)
  const [showRecord, setShowRecord] = useState(false)
  const [showClock, setShowClock] = useState(false)
  const [showSound, setShowSound] = useState(false)
  const [mode, setMode] = useState('countdown') // countdown | countup
  const [targetMinutes, setTargetMinutes] = useState(25)

  const project = projects.find((p) => p.id === (activeProjectId || selectedId))
  const soundTitle = currentPiece?.title || currentTrack?.title || ''
  const idle = !running && seconds === 0

  useEffect(() => {
    if (project) setTargetMinutes(project.targetMinutes || 25)
  }, [project])

  const targetSeconds = targetMinutes * 60
  const display = mode === 'countdown' ? Math.max(0, targetSeconds - seconds) : seconds
  const progress = mode === 'countdown' ? (targetSeconds ? Math.min(1, seconds / targetSeconds) : 0) : (seconds % 3600) / 3600

  const finish = () => {
    if (seconds < 5) {
      alert('不到 5 秒，再坚持一下吧。')
      return
    }
    setSilenceActive(false)
    pause()
    setShowClock(false)
    setShowRecord(true)
  }

  // 倒计时到点：振动提醒并弹出记录
  useEffect(() => {
    if (mode === 'countdown' && running && seconds >= targetSeconds) {
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
      finish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running, mode, targetSeconds])

  const handleStartPause = () => {
    const id = activeProjectId || selectedId
    if (!id) {
      alert('先在「今天」页新建一个项目。')
      return
    }
    enableAudio()
    if (running) {
      setSilenceActive(false)
      pause()
    } else {
      if (!isPlaying) setSilenceActive(true)
      if (seconds === 0) start(id)
      else resume()
    }
  }

  const handleSave = (record) => {
    addRecord(record)
    setShowRecord(false)
    reset()
    onNavigateToFeed()
  }

  const handleAbandon = () => {
    if (window.confirm('不保存这次计时？')) {
      setSilenceActive(false)
      setShowRecord(false)
      reset()
    }
  }

  const handleSelectSound = (id) => {
    selectTrack(id)
    if (id) setSilenceActive(false)
    else if (running) setSilenceActive(true)
    setShowSound(false)
  }

  const handleToggleSound = () => {
    togglePlay()
    if (isPlaying) {
      if (running) setSilenceActive(true)
    } else setSilenceActive(false)
  }

  // 锁屏 / 控制中心显示计时信息
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    const setPosition = (state) => {
      try {
        ms.setPositionState?.(state)
      } catch {
        /* 忽略 */
      }
    }
    if (project && (running || isPlaying)) {
      ms.metadata = new MediaMetadata({
        title: `${project.icon} ${project.name}`,
        artist: running ? `${mode === 'countdown' ? '剩余' : '已专注'} ${clock(display)}${isPlaying ? ` · ${soundTitle}` : ''}` : `已暂停 ${clock(display)}`,
        album: 'Forge',
        artwork: ARTWORK,
      })
      ms.playbackState = running ? 'playing' : 'paused'
      setPosition({ duration: mode === 'countdown' ? targetSeconds : Math.max(86400, seconds + 100), playbackRate: running ? 1 : 0, position: seconds })
      ms.setActionHandler('play', () => !running && resume())
      ms.setActionHandler('pause', () => running && pause())
    } else if (isPlaying && currentTrack) {
      ms.metadata = new MediaMetadata({ title: soundTitle, artist: 'Forge', album: 'Forge', artwork: ARTWORK })
      ms.playbackState = 'playing'
      setPosition({ duration: Math.max(86400, playSeconds + 100), playbackRate: 1, position: playSeconds })
      ms.setActionHandler('play', () => togglePlay())
      ms.setActionHandler('pause', () => togglePlay())
    } else {
      ms.playbackState = 'none'
    }
  }, [seconds, running, isPlaying, project, currentTrack, soundTitle, playSeconds, mode, targetSeconds, display, resume, pause, togglePlay])

  // 炉火高度：空闲时只有底部一层余温，计时越久烧得越高
  const heat = idle ? 0.34 : 0.4 + progress * 0.5

  return (
    <div className="relative flex-1 overflow-hidden w-full flex flex-col">
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none transition-[height,opacity] duration-1000 ease-linear"
        style={{
          height: `${heat * 100}%`,
          background: 'linear-gradient(180deg, rgba(246,244,240,0) 0%, rgba(240,176,143,0.55) 35%, #e98a5c 68%, #d4541f 100%)',
          opacity: running || idle ? 1 : 0.7,
        }}
        aria-hidden
      />

      <div className="relative flex-1 flex flex-col w-full max-w-md mx-auto px-6 pt-6">
        <header className="flex items-center justify-between h-11">
          {activeProjectId ? (
            <h1 className="text-lg font-black truncate">{project?.name}</h1>
          ) : (
            <label className="relative flex items-center gap-1 text-lg font-black min-w-0">
              <span className="truncate">{project?.name || '选择项目'}</span>
              <ChevronDown size={18} strokeWidth={3} className="flex-shrink-0" />
              <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} aria-label="选择项目" className="absolute inset-0 opacity-0">
                {projects.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          <button onClick={() => setShowClock(true)} className="h-11 -mr-2 px-2 flex items-center gap-1.5 text-sm font-bold text-mute">
            <Moon size={16} />
            熄屏时钟
          </button>
        </header>

        <section className="mt-[12vh] text-center">
          <div className={`num leading-[0.8] tracking-[-3px] ${display >= 3600 ? 'text-[min(25vw,118px)]' : 'text-[min(39vw,172px)]'}`}>{clock(display)}</div>

          {idle ? (
            <div className="mt-6 flex flex-col items-center gap-4">
              {mode === 'countdown' && (
                <div className="flex items-center gap-5">
                  <button onClick={() => setTargetMinutes((m) => Math.max(5, m - 5))} aria-label="减少 5 分钟" className="w-11 h-11 rounded-full bg-line flex items-center justify-center">
                    <Minus size={18} strokeWidth={3} />
                  </button>
                  <span className="text-base font-bold w-20">{targetMinutes} 分钟</span>
                  <button onClick={() => setTargetMinutes((m) => Math.min(180, m + 5))} aria-label="增加 5 分钟" className="w-11 h-11 rounded-full bg-line flex items-center justify-center">
                    <Plus size={18} strokeWidth={3} />
                  </button>
                </div>
              )}
              <div className="flex text-sm font-bold" role="tablist" aria-label="计时方式">
                {[
                  ['countdown', '倒计时'],
                  ['countup', '正计时'],
                ].map(([v, l]) => (
                  <button key={v} role="tab" aria-selected={mode === v} onClick={() => setMode(v)} className={`h-9 px-3 ${mode === v ? 'text-ink' : 'text-mute'}`}>
                    {l}
                    <span className={`block h-0.5 mt-1 mx-auto w-4 rounded ${mode === v ? 'bg-ink' : 'bg-transparent'}`} />
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-base font-bold text-ink/60 mt-5">{running ? (mode === 'countdown' ? `目标 ${targetMinutes} 分钟` : '正计时') : '已暂停'}</p>
          )}
        </section>

        <div className="flex-1" />

        <div className="flex items-center justify-center gap-2 mb-7">
          <button onClick={() => setShowSound(true)} className="h-10 px-3 flex items-center gap-2 text-[15px] font-bold text-white drop-shadow-[0_1px_2px_rgba(120,40,10,0.35)] min-w-0">
            <Music size={16} className="flex-shrink-0" />
            <span className="truncate max-w-[220px]">{currentTrack ? soundTitle : '背景声音'}</span>
          </button>
          {currentTrack && (
            <button onClick={handleToggleSound} aria-label={isPlaying ? '暂停声音' : '播放声音'} className="w-9 h-9 rounded-full bg-white/25 text-white flex items-center justify-center">
              {isPlaying ? <Pause size={14} fill="currentColor" /> : <Play size={14} fill="currentColor" />}
            </button>
          )}
        </div>

        <div className="flex items-center justify-center gap-8 pb-10">
          <button
            onClick={() => {
              if (window.confirm('清零这次计时？已计的时间不会保存。')) {
                setSilenceActive(false)
                reset()
              }
            }}
            aria-label="清零"
            className={`w-14 h-14 rounded-full bg-white/30 text-white flex items-center justify-center ${idle ? 'invisible' : ''}`}
          >
            <RotateCcw size={22} strokeWidth={2.5} />
          </button>
          <button
            onClick={handleStartPause}
            aria-label={running ? '暂停' : '开始'}
            className="w-[88px] h-[88px] rounded-full bg-white text-ink flex items-center justify-center shadow-[0_10px_30px_rgba(120,40,10,0.25)] active:scale-95 transition-transform"
          >
            {running ? <Pause size={34} fill="currentColor" /> : <Play size={34} fill="currentColor" className="ml-1.5" />}
          </button>
          <button onClick={finish} aria-label="完成并记录" className={`w-14 h-14 rounded-full bg-white/30 text-white flex items-center justify-center ${idle ? 'invisible' : ''}`}>
            <Check size={26} strokeWidth={3} />
          </button>
        </div>
      </div>

      {showSound && <SoundSheet audio={audio} onSelect={handleSelectSound} onClose={() => setShowSound(false)} />}

      {showClock && (
        <ClockScreen
          project={project}
          display={display}
          modeLabel={mode === 'countdown' ? '剩余' : '已专注'}
          progress={progress}
          running={running}
          soundTitle={soundTitle}
          isPlaying={isPlaying}
          onToggle={handleStartPause}
          onClose={() => setShowClock(false)}
        />
      )}

      {showRecord && project && (
        <RecordModal
          duration={seconds}
          project={project}
          onSave={handleSave}
          onCancel={() => {
            setShowRecord(false)
            resume()
          }}
          onAbandon={handleAbandon}
        />
      )}
    </div>
  )
}
