import { create } from 'zustand'

// 计时状态放在全局，切换页面不会丢
// 秒数始终按「真实时间 - 起点」计算：暂停不计时，锁屏、切后台回来也不会错
export const useTimerStore = create((set, get) => ({
  activeProjectId: null,
  seconds: 0,
  running: false,
  startTime: null, // 换算后的起点：Date.now() - 已计秒数

  startTimer: (projectId) => set({ activeProjectId: projectId, running: true, startTime: Date.now(), seconds: 0 }),
  tick: () => {
    const { running, startTime } = get()
    if (running && startTime) set({ seconds: Math.floor((Date.now() - startTime) / 1000) })
  },
  setSeconds: (seconds) => set({ seconds }),
  pauseTimer: () => {
    const { running, startTime } = get()
    if (!running) return
    set({ running: false, seconds: Math.floor((Date.now() - startTime) / 1000) })
  },
  resumeTimer: () => {
    const { running, seconds } = get()
    if (running) return
    set({ running: true, startTime: Date.now() - seconds * 1000 })
  },
  resetTimer: () => set({ activeProjectId: null, seconds: 0, running: false, startTime: null }),
}))
