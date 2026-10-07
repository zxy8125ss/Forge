import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, Check, Minus, Plus, Moon } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import { useAudio } from '../hooks/useAudio'
import { useProjectStore } from '../store/useProjectStore'
import RecordModal from '../components/RecordModal'
import HeatRing from '../components/HeatRing'
import ClockScreen from '../components/ClockScreen'
import SoundPanel from '../components/SoundPanel'
import { asset, formatClock } from '../lib/utils'

const ARTWORK = [
  { src: 'lockscreen_artwork.png', sizes: '512x512', type: 'image/png' },
  { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
  { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
].map((a) => ({ ...a, src: asset(a.src) }))

export default function Timer({ preselectedProjectId, onNavigateToFeed }) {
  const { seconds, running, activeProjectId, start, pause, resume, reset } = useTimer()
  const audio = useAudio()
  const { currentTrack, currentPiece, isPlaying, playSeconds, selectTrack, togglePlay, enableAudio, setSilenceActive } = audio
  const { projects, addRecord } = useProjectStore()

  const [selectedId, setSelectedId] = useState(activeProjectId || preselectedProjectId || '')
  const [showRecord, setShowRecord] = useState(false)
  const [showClock, setShowClock] = useState(false)
  const [mode, setMode] = useState('countdown') // countdown | countup
  const [targetMinutes, setTargetMinutes] = useState(25)

  const project = projects.find((p) => p.id === (activeProjectId || selectedId))
  const soundTitle = currentPiece?.title || currentTrack?.title || ''

  useEffect(() => {
    if (project) setTargetMinutes(project.targetMinutes || 25)
  }, [project])

  const targetSeconds = targetMinutes * 60
  const display = mode === 'countdown' ? Math.max(0, targetSeconds - seconds) : seconds

  const finish = () => {
    if (seconds < 5) {
      alert('熔炼时间太短啦（不足5秒），多坚持一下吧！')
      return
    }
    setSilenceActive(false)
    pause()
    setShowClock(false)
    setShowRecord(true)
  }

  // 倒计时到点：提醒并弹出记录
  useEffect(() => {
    if (mode === 'countdown' && running && seconds >= targetSeconds) {
      setSilenceActive(false)
      pause()
      if ('vibrate' in navigator) navigator.vibrate([200, 100, 200])
      alert('专注时间到！恭喜完成本次熔炉专注！')
      finish()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running, mode, targetSeconds])

  const handleStartPause = () => {
    const id = activeProjectId || selectedId
    if (!id) {
      alert('请先选择一个熔炼项目！')
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
    if (window.confirm('确定要放弃本次熔炼记录吗？这部分时间将不会被计入累计小时数。')) {
      setSilenceActive(false)
      setShowRecord(false)
      reset()
    }
  }

  const handleToggleSound = () => {
    togglePlay()
    if (isPlaying) {
      if (running) setSilenceActive(true)
    } else {
      setSilenceActive(false)
    }
  }

  const handleSelectSound = (id) => {
    selectTrack(id)
    if (id) setSilenceActive(false)
    else if (running) setSilenceActive(true)
  }

  // 锁屏 / 控制中心显示计时信息
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    const setPosition = (state) => {
      if (!('setPositionState' in ms)) return
      try {
        ms.setPositionState(state)
      } catch (err) {
        console.warn('MediaSession setPositionState error:', err)
      }
    }

    if (project && (running || isPlaying)) {
      ms.metadata = new MediaMetadata({
        title: `正在锻造: ${project.icon} ${project.name}`,
        artist: running
          ? `${mode === 'countdown' ? '剩余' : '已熔铸'}: ${formatClock(display)} ${isPlaying ? `(${soundTitle})` : '(静音专注)'}`
          : `已暂停熔铸: ${formatClock(display)}`,
        album: 'Forge 个人成长计时器',
        artwork: ARTWORK,
      })
      ms.playbackState = running ? 'playing' : 'paused'
      setPosition({
        duration: mode === 'countdown' ? targetSeconds : Math.max(86400, seconds + 100),
        playbackRate: running ? 1 : 0,
        position: seconds,
      })
      ms.setActionHandler('play', () => !running && resume())
      ms.setActionHandler('pause', () => running && pause())
      ms.setActionHandler('stop', () => {
        pause()
        if (isPlaying) togglePlay()
      })
    } else if (isPlaying && currentTrack) {
      ms.metadata = new MediaMetadata({
        title: soundTitle,
        artist: currentPiece?.file?.startsWith('music/') ? 'Forge 古典乐' : 'Forge 环境白噪声',
        album: 'Forge 个人成长计时器',
        artwork: ARTWORK,
      })
      ms.playbackState = 'playing'
      setPosition({ duration: Math.max(86400, playSeconds + 100), playbackRate: 1, position: playSeconds })
      ms.setActionHandler('play', () => togglePlay())
      ms.setActionHandler('pause', () => togglePlay())
    } else {
      ms.playbackState = 'none'
    }
  }, [seconds, running, isPlaying, project, currentTrack, currentPiece, soundTitle, playSeconds, mode, targetSeconds, display, resume, pause, togglePlay])

  const ringProgress = mode === 'countdown' ? (targetSeconds ? seconds / targetSeconds : 0) : (seconds % 3600) / 3600
  const idle = !running && seconds === 0

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar w-full max-w-md mx-auto px-5 pt-4 pb-6 flex flex-col">
      <header className="flex-shrink-0">
        {activeProjectId ? (
          <div className="flex items-center justify-between h-12">
            <h1 className="text-xl font-black truncate">
              {project?.icon} {project?.name}
            </h1>
            <span className={`text-[13px] font-bold px-2.5 py-1 rounded-sm ${running ? 'bg-ember text-plate' : 'bg-stone-deep text-iron'}`}>
              {running ? '锻造中' : '已暂停'}
            </span>
          </div>
        ) : (
          <select
            value={selectedId}
            onChange={(e) => setSelectedId(e.target.value)}
            aria-label="选择项目"
            className="w-full h-12 px-3 bg-plate border-2 border-iron rounded-md text-base font-bold focus:outline-none"
          >
            <option value="">选择要锻造的项目</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.icon} {p.name}
              </option>
            ))}
          </select>
        )}
      </header>

      <section className="flex-1 flex flex-col items-center justify-center py-3">
        <HeatRing progress={ringProgress} color={project?.color || '#e5501b'}>
          <span className="text-sm font-bold text-steel">{mode === 'countdown' ? '剩余' : '已锻造'}</span>
          <span className="num text-[68px] leading-none font-extrabold mt-1">{formatClock(display)}</span>
          {mode === 'countdown' && idle ? (
            <div className="flex items-center gap-2 mt-3">
              <button
                type="button"
                onClick={() => setTargetMinutes((m) => Math.max(5, m - 5))}
                aria-label="减少 5 分钟"
                className="w-9 h-9 rounded-md border-2 border-iron/25 flex items-center justify-center active:border-iron"
              >
                <Minus size={16} strokeWidth={3} />
              </button>
              <span className="w-16 text-center text-sm font-bold">
                <span className="num text-xl">{targetMinutes}</span> 分
              </span>
              <button
                type="button"
                onClick={() => setTargetMinutes((m) => Math.min(180, m + 5))}
                aria-label="增加 5 分钟"
                className="w-9 h-9 rounded-md border-2 border-iron/25 flex items-center justify-center active:border-iron"
              >
                <Plus size={16} strokeWidth={3} />
              </button>
            </div>
          ) : (
            <span className="text-sm text-steel mt-3">{mode === 'countdown' ? `目标 ${targetMinutes} 分钟` : '每满一小时转一圈'}</span>
          )}
        </HeatRing>

        <div className="mt-4 grid grid-cols-2 p-1 bg-stone-deep rounded-md w-56" role="tablist" aria-label="计时方式">
          {[
            ['countdown', '倒计时'],
            ['countup', '正计时'],
          ].map(([value, label]) => (
            <button
              key={value}
              type="button"
              role="tab"
              aria-selected={mode === value}
              disabled={running}
              onClick={() => !running && setMode(value)}
              className={`h-9 rounded-[4px] text-[15px] font-bold transition-colors ${mode === value ? 'bg-iron text-plate' : 'text-iron/70'} ${
                running ? 'opacity-50' : ''
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </section>

      <div className="flex-shrink-0 flex justify-center -mt-1">
        <button
          type="button"
          onClick={() => setShowClock(true)}
          className="h-9 px-4 rounded-md text-sm font-bold text-steel flex items-center gap-1.5 active:text-iron active:bg-stone-deep"
        >
          <Moon size={16} />
          熄屏时钟
        </button>
      </div>

      <div className="flex-shrink-0 flex items-center justify-center gap-6 py-4">
        <button
          type="button"
          disabled={seconds === 0}
          onClick={() => {
            if (window.confirm('清零这次计时？已计的时间不会保存。')) {
              setSilenceActive(false)
              reset()
            }
          }}
          aria-label="清零"
          className="w-14 h-14 rounded-md border-2 border-iron flex items-center justify-center disabled:opacity-25 active:bg-stone-deep"
        >
          <RotateCcw size={22} strokeWidth={2.5} />
        </button>
        <button
          type="button"
          onClick={handleStartPause}
          aria-label={running ? '暂停' : '开始'}
          className="w-[84px] h-[84px] rounded-md bg-ember text-plate flex items-center justify-center shadow-plate border-2 border-iron active:translate-x-px active:translate-y-px active:shadow-press"
        >
          {running ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1" />}
        </button>
        <button
          type="button"
          disabled={seconds === 0}
          onClick={finish}
          aria-label="完成并记录"
          className="w-14 h-14 rounded-md bg-iron text-plate flex items-center justify-center disabled:opacity-25 active:bg-iron-soft"
        >
          <Check size={26} strokeWidth={3} />
        </button>
      </div>

      <div className="flex-shrink-0">
        <SoundPanel audio={audio} onSelect={handleSelectSound} onToggle={handleToggleSound} />
      </div>

      {showClock && (
        <ClockScreen
          project={project}
          display={display}
          modeLabel={mode === 'countdown' ? '剩余' : '已锻造'}
          progress={ringProgress}
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
