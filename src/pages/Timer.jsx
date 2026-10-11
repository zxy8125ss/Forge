import { useEffect, useState } from 'react'
import { Pause, Play, RotateCcw, Check, Minus, Plus, ChevronDown, Moon, SkipForward, ListMusic, Volume2, VolumeX } from 'lucide-react'
import { useTimer } from '../hooks/useTimer'
import { useAudio, getAudio } from '../hooks/useAudio'
import { useProjectStore } from '../store/useProjectStore'
import RecordModal from '../components/RecordModal'
import ClockScreen from '../components/ClockScreen'
import SoundSheet from '../components/SoundSheet'
import MusicSeek from '../components/MusicSeek'
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
  const { currentTrack, currentPiece, isPlaying, musicOn, playSeconds, selectTrack, toggleMusic, holdForTimer, releaseForTimer, enableAudio, next, canNext } = audio
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

  // 一个计时：大按钮 = 开始 / 暂停计时；计时暂停时音乐跟着停，继续时音乐跟着恢复
  const pauseSession = () => {
    pause()
    holdForTimer()
  }
  const resumeSession = () => {
    resume()
    releaseForTimer()
  }

  const finish = () => {
    if (seconds < 5) {
      alert('不到 5 秒，再坚持一下吧。')
      return
    }
    pauseSession()
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
    if (running) pauseSession()
    else if (seconds === 0) {
      start(id)
      releaseForTimer()
    } else resumeSession()
  }

  const handleSave = (record) => {
    addRecord(record)
    setShowRecord(false)
    reset()
    onNavigateToFeed()
  }

  const handleAbandon = () => {
    if (window.confirm('不保存这次计时？')) {
      setShowRecord(false)
      reset()
    }
  }

  const handleSelectSound = (id) => {
    selectTrack(id)
    setShowSound(false)
  }

  // 锁屏 / 灵动岛：只在真正放音乐时出现；那里的暂停 / 播放 = 暂停 / 继续这次专注
  useEffect(() => {
    if (!('mediaSession' in navigator)) return
    const ms = navigator.mediaSession
    if (!isPlaying && !(musicOn && seconds > 0)) {
      ms.playbackState = 'none'
      return
    }
    ms.metadata = new MediaMetadata({
      title: project ? `${project.name} · ${running ? (mode === 'countdown' ? '剩余 ' : '已专注 ') + clock(display) : '已暂停'}` : soundTitle,
      artist: soundTitle,
      album: 'Forge',
      artwork: ARTWORK,
    })
    ms.playbackState = isPlaying ? 'playing' : 'paused'
    ms.setActionHandler('play', () => {
      if (seconds > 0 && !running) resumeSession()
      else toggleMusic()
    })
    try {
      ms.setActionHandler('seekto', (d) => {
        const a = getAudio()
        if (Number.isFinite(d.seekTime)) a.currentTime = d.seekTime
      })
    } catch {
      /* 不支持时忽略 */
    }
    ms.setActionHandler('pause', () => {
      if (running) pauseSession()
      else toggleMusic()
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seconds, running, isPlaying, musicOn, project, soundTitle, mode, display])

  // 炉火高度：空闲时只有底部一层余温，计时越久烧得越高
  const heat = idle ? 0.34 : 0.4 + progress * 0.5

  const tap = 'touch-manipulation select-none active:scale-95 transition-transform duration-75'

  const header = (
    <header className="flex items-center justify-between h-12">
      {activeProjectId ? (
        <h1 className="text-lg font-black truncate">{project?.name}</h1>
      ) : (
        <label className="relative flex items-center gap-1 text-lg font-black min-w-0 h-12">
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
      <button onClick={() => setShowClock(true)} className={`h-12 -mr-2 px-2 flex items-center gap-1.5 text-sm font-bold text-mute ${tap}`}>
        <Moon size={16} />
        熄屏时钟
      </button>
    </header>
  )

  const timerBlock = (
    <section className="text-center">
      <div
        className={`num leading-[0.8] tracking-[-3px] ${
          display >= 3600 ? 'text-[min(25vw,118px)] landscape:text-[min(30vh,calc((100vw_-_480px)/3.4))]' : 'text-[min(39vw,172px)] landscape:text-[min(44vh,calc((100vw_-_480px)/2.4))]'
        }`}
      >
        {clock(display)}
      </div>

      {idle ? (
        <div className="mt-6 landscape:mt-4 flex flex-col items-center gap-3">
          {mode === 'countdown' && (
            <div className="flex items-center gap-5">
              <button onClick={() => setTargetMinutes((m) => Math.max(5, m - 5))} aria-label="减少 5 分钟" className={`w-12 h-12 rounded-full bg-line flex items-center justify-center ${tap}`}>
                <Minus size={18} strokeWidth={3} />
              </button>
              <span className="text-base font-bold w-20">{targetMinutes} 分钟</span>
              <button onClick={() => setTargetMinutes((m) => Math.min(180, m + 5))} aria-label="增加 5 分钟" className={`w-12 h-12 rounded-full bg-line flex items-center justify-center ${tap}`}>
                <Plus size={18} strokeWidth={3} />
              </button>
            </div>
          )}
          <div className="flex text-sm font-bold" role="tablist" aria-label="计时方式">
            {[
              ['countdown', '倒计时'],
              ['countup', '正计时'],
            ].map(([v, l]) => (
              <button key={v} role="tab" aria-selected={mode === v} onClick={() => setMode(v)} className={`h-10 px-3 touch-manipulation ${mode === v ? 'text-ink' : 'text-mute'}`}>
                {l}
                <span className={`block h-0.5 mt-1 mx-auto w-4 rounded ${mode === v ? 'bg-ink' : 'bg-transparent'}`} />
              </button>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-base font-bold text-ink/55 mt-5 landscape:mt-3">{running ? (mode === 'countdown' ? `目标 ${targetMinutes} 分钟` : '正计时') : '已暂停'}</p>
      )}
    </section>
  )

  // 音乐条：左边是音乐开关（和计时的暂停是两回事），中间点开选曲，右边下一首
  const musicStatus = !musicOn ? '音乐已关 · 点左边打开' : isPlaying ? '正在播放 · 点这里换曲' : seconds > 0 && !running ? '随计时暂停 · 继续计时自动恢复' : '音乐停了 · 点左边继续'
  const musicBar = (
    <div className="w-full max-w-[360px] flex flex-col items-center gap-1">
    <div className="w-full h-16 rounded-full bg-white/90 shadow-[0_6px_20px_rgba(120,40,10,0.15)] flex items-center pl-2 pr-1.5 gap-2">
      <button
        onClick={toggleMusic}
        aria-label={musicOn && isPlaying ? '关闭音乐' : '打开音乐'}
        aria-pressed={musicOn && isPlaying}
        className={`w-12 h-12 flex-shrink-0 rounded-full flex items-center justify-center ${musicOn && isPlaying ? 'bg-ink text-paper' : 'bg-line text-mute'} ${tap}`}
      >
        {musicOn && isPlaying ? <Volume2 size={22} /> : <VolumeX size={22} />}
      </button>
      <button onClick={() => setShowSound(true)} className="flex-1 min-w-0 h-12 text-left touch-manipulation">
        <div className="text-[15px] font-bold truncate">{currentTrack ? soundTitle : '古典乐随机连播'}</div>
        <div className="text-xs text-mute truncate">{musicStatus}</div>
      </button>
      {canNext && musicOn && (
        <button onClick={next} aria-label="下一首" className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center text-ink ${tap}`}>
          <SkipForward size={20} fill="currentColor" />
        </button>
      )}
      <button onClick={() => setShowSound(true)} aria-label="曲目列表" className={`w-11 h-11 flex-shrink-0 rounded-full flex items-center justify-center text-ink ${tap}`}>
        <ListMusic size={20} />
      </button>
    </div>
    {musicOn && <MusicSeek className="px-3" textClass="text-ink/70" />}
    </div>
  )

  const controls = (
    <div className="flex items-center justify-center gap-7">
      <button
        onClick={() => {
          if (window.confirm('清零这次计时？已计的时间不会保存。')) {
            holdForTimer()
            reset()
          }
        }}
        aria-label="清零"
        className={`w-16 h-16 rounded-full bg-white/35 text-white flex items-center justify-center ${tap} ${idle ? 'invisible' : ''}`}
      >
        <RotateCcw size={24} strokeWidth={2.5} />
      </button>
      <button
        onClick={handleStartPause}
        aria-label={running ? '暂停' : '开始'}
        className={`w-[92px] h-[92px] rounded-full bg-white text-ink flex items-center justify-center shadow-[0_10px_30px_rgba(120,40,10,0.25)] ${tap}`}
      >
        {running ? <Pause size={36} fill="currentColor" /> : <Play size={36} fill="currentColor" className="ml-1.5" />}
      </button>
      <button onClick={finish} aria-label="完成并记录" className={`w-16 h-16 rounded-full bg-white/35 text-white flex items-center justify-center ${tap} ${idle ? 'invisible' : ''}`}>
        <Check size={28} strokeWidth={3} />
      </button>
    </div>
  )

  return (
    <div className="relative flex-1 overflow-hidden w-full flex flex-col">
      {/* 炉火：竖屏从底部往上烧，横屏从右侧往左烧 */}
      <div
        className="absolute inset-x-0 bottom-0 pointer-events-none transition-[height,opacity] duration-1000 ease-linear landscape:hidden"
        style={{
          height: `${heat * 100}%`,
          background: 'linear-gradient(180deg, rgba(246,244,240,0) 0%, rgba(240,176,143,0.55) 35%, #e98a5c 68%, #d4541f 100%)',
          opacity: running || idle ? 1 : 0.7,
        }}
        aria-hidden
      />
      <div
        className="absolute inset-y-0 right-0 pointer-events-none transition-[width,opacity] duration-1000 ease-linear hidden landscape:block"
        style={{
          width: `${Math.max(58, heat * 100)}%`,
          background: 'linear-gradient(90deg, rgba(246,244,240,0) 0%, rgba(240,176,143,0.55) 30%, #e98a5c 65%, #d4541f 100%)',
          opacity: running || idle ? 1 : 0.7,
        }}
        aria-hidden
      />

      {/* 竖屏 */}
      <div className="relative flex-1 flex flex-col w-full max-w-md mx-auto px-6 pt-4 landscape:hidden">
        {header}
        <div className="flex-1 flex flex-col justify-center pb-[6vh]">{timerBlock}</div>
        <div className="flex flex-col items-center gap-7 pb-[calc(env(safe-area-inset-bottom)+28px)]">
          {musicBar}
          {controls}
        </div>
      </div>

      {/* 横屏：左边大数字，右边音乐和按键 */}
      <div className="relative flex-1 hidden landscape:grid grid-cols-[1fr_360px] gap-6 w-full pl-[max(env(safe-area-inset-left),24px)] pr-[max(env(safe-area-inset-right),24px)]">
        <div className="flex flex-col min-w-0">
          {header}
          <div className="flex-1 flex flex-col justify-center pb-6">{timerBlock}</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-6">
          {musicBar}
          {controls}
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
          musicOn={musicOn}
          canNext={canNext}
          onToggleMusic={toggleMusic}
          onNext={next}
          onToggle={handleStartPause}
          onClose={() => setShowClock(false)}
          seconds={seconds}
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
