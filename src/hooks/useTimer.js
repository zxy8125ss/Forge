import { useEffect } from 'react'
import { useTimerStore } from '../store/useTimerStore'

let worker = null

export function useTimer() {
  const {
    seconds,
    running,
    activeProjectId,
    startTime,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    tick,
    setSeconds,
  } = useTimerStore()

  useEffect(() => {
    worker ||= new Worker(new URL('../workers/timer.worker.js', import.meta.url), { type: 'module' })
    const onMessage = (e) => {
      if (e.data === 'tick') tick()
    }
    worker.addEventListener('message', onMessage)
    return () => worker && worker.removeEventListener('message', onMessage)
  }, [tick])

  useEffect(() => {
    if (!worker) return
    worker.postMessage(running ? 'start' : 'stop')
  }, [running])

  // 锁屏回来后按真实时间校正
  useEffect(() => {
    const onVisible = () => {
      if (document.visibilityState === 'visible' && running && startTime) {
        const elapsed = Math.floor((Date.now() - startTime) / 1000)
        if (elapsed > seconds) setSeconds(elapsed)
      }
    }
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [running, startTime, seconds, setSeconds])

  return {
    seconds,
    running,
    activeProjectId,
    start: (projectId) => startTimer(projectId),
    pause: () => pauseTimer(),
    resume: () => resumeTimer(),
    reset: () => resetTimer(),
  }
}
