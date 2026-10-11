import { useEffect } from 'react'
import { useTimerStore } from '../store/useTimerStore'

let worker = null

export function useTimer() {
  const {
    seconds,
    running,
    activeProjectId,
    startTimer,
    pauseTimer,
    resumeTimer,
    resetTimer,
    tick,
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

  // 锁屏、切回前台时立即按真实时间校正
  useEffect(() => {
    const onVisible = () => document.visibilityState === 'visible' && tick()
    document.addEventListener('visibilitychange', onVisible)
    return () => document.removeEventListener('visibilitychange', onVisible)
  }, [tick])

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
