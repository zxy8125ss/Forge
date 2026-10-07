import { useEffect, useState } from 'react'
import { Pause, Play, Square, Flame } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import { useAudio } from '../hooks/useAudio'
import { useProjectStore } from '../store/useProjectStore'
import RecordModal from '../components/RecordModal'
import LockscreenPreview from '../components/LockscreenPreview'
import SoundPanel from '../components/SoundPanel'
import { asset, formatClock } from '../lib/utils'

const ARTWORK = [
  { src: 'lockscreen_artwork.png', sizes: '1024x1024', type: 'image/png' },
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
  const [showLockscreen, setShowLockscreen] = useState(false)
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

  const modeBtn = (value, label) => (
    <button
      type="button"
      onClick={() => !running && setMode(value)}
      disabled={running}
      className={`px-3 py-1 rounded-full transition-all ${
        mode === value ? 'bg-zinc-800 text-forge-orange shadow-sm' : 'text-zinc-500 hover:text-zinc-300'
      } ${running ? 'opacity-50 cursor-not-allowed' : ''}`}
    >
      {label}
    </button>
  )

  return (
    <div className="flex-1 p-4 pb-28 flex flex-col justify-between max-w-md mx-auto w-full h-full overflow-hidden">
      <div className="text-center mt-1 flex-shrink-0">
        {activeProjectId ? (
          <div className="inline-flex flex-col items-center space-y-0.5">
            <span className="text-[10px] tracking-widest text-forge-steel font-bold uppercase">
              {running ? '正在进行专注精炼' : '专注淬火暂歇'}
            </span>
          </div>
        ) : (
          <div className="inline-block w-full max-w-xs">
            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full bg-forge-surface border border-forge-border rounded-xl p-2 text-xs text-forge-light focus:outline-none focus:border-forge-orange"
            >
              <option value="">-- 选择要熔炼的项目 --</option>
              {projects.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.icon} {p.name}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      <div className="my-auto flex-1 flex flex-col items-center justify-center min-h-0 w-full px-2">
        <div className="bg-black/90 border border-forge-border/40 rounded-3xl p-5 aspect-video w-full flex flex-col justify-between shadow-2xl relative overflow-hidden select-none">
          <div className="flex justify-between items-center z-10">
            <div className="flex bg-zinc-900 border border-zinc-800/80 p-0.5 rounded-full text-[8.5px] font-bold">
              {modeBtn('countdown', '倒计时')}
              {modeBtn('countup', '正计时')}
            </div>
            {project && (
              <div className="px-3 py-1 bg-zinc-900/90 border border-zinc-800/80 rounded-full flex items-center gap-1.5 shadow-md">
                <span className="text-xs">{project.icon}</span>
                <span className="text-[9px] font-bold text-forge-light tracking-wide">{project.name}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col items-center justify-center my-auto z-10">
            <div className="text-4xl font-extrabold font-mono text-white tracking-tight select-none drop-shadow-[0_0_8px_rgba(255,255,255,0.15)]">
              {formatClock(display)}
            </div>
            {mode === 'countdown' && !running && seconds === 0 && (
              <div className="flex gap-3 mt-1.5 text-[8px] font-bold">
                <button
                  type="button"
                  onClick={() => setTargetMinutes((m) => Math.max(5, m - 5))}
                  className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded hover:text-white"
                >
                  -5m
                </button>
                <button
                  type="button"
                  onClick={() => setTargetMinutes((m) => Math.min(180, m + 5))}
                  className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded hover:text-white"
                >
                  +5m
                </button>
              </div>
            )}
          </div>

          <div className="w-full flex justify-center items-center opacity-10">
            <div className="w-12 h-1 bg-forge-orange rounded-full" />
          </div>
        </div>

        {project && (
          <button
            type="button"
            onClick={() => setShowLockscreen(true)}
            className="mt-3.5 text-[9px] text-forge-steel bg-forge-surface/20 border border-forge-border/20 px-3.5 py-1 rounded-full hover:text-forge-light hover:bg-forge-surface/40 active:scale-95 transition-all font-bold flex items-center gap-1"
          >
            <span>📱 预览 iOS 锁屏效果</span>
          </button>
        )}
      </div>

      <SoundPanel audio={audio} onSelect={handleSelectSound} onToggle={handleToggleSound} />

      <div className="flex justify-center items-center gap-6 mb-2 flex-shrink-0">
        {seconds > 0 && (
          <button
            type="button"
            onClick={() => {
              if (window.confirm('确定要终止计时并清除吗？')) {
                setSilenceActive(false)
                reset()
              }
            }}
            className="w-10 h-10 flex items-center justify-center bg-forge-surface border border-forge-border text-forge-steel hover:text-red-500 rounded-full transition-transform active:scale-90"
            title="废弃重置"
          >
            <Square size={13} />
          </button>
        )}
        <button
          type="button"
          onClick={handleStartPause}
          className="w-13 h-13 flex items-center justify-center bg-forge-orange text-forge-light rounded-full transition-all active:scale-95 shadow-lg shadow-forge-orange/20 hover:brightness-110"
          style={{ backgroundColor: project?.color }}
        >
          {running ? <Pause size={18} /> : <Play size={18} className="ml-0.5" />}
        </button>
        {seconds > 0 && (
          <button
            type="button"
            onClick={finish}
            className="w-10 h-10 flex items-center justify-center bg-forge-surface border border-forge-border text-forge-amber hover:bg-forge-orange hover:border-forge-orange hover:text-forge-light rounded-full transition-transform active:scale-90"
            title="熔铸封存"
          >
            <Flame size={15} />
          </button>
        )}
      </div>

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

      {showLockscreen && (
        <LockscreenPreview
          project={project}
          seconds={seconds}
          running={running}
          isPlaying={isPlaying}
          soundTitle={soundTitle}
          onToggle={handleStartPause}
          onClose={() => setShowLockscreen(false)}
        />
      )}
    </div>
  )
}
