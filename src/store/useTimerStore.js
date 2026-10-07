import { create } from 'zustand'

// 计时状态放在全局，切换页面不会丢
export const useTimerStore = create((set) => ({
  activeProjectId: null,
  seconds: 0,
  running: false,
  startTime: null,

  startTimer: (projectId) => set({ activeProjectId: projectId, running: true, startTime: Date.now(), seconds: 0 }),
  tick: () => set((s) => ({ seconds: s.seconds + 1 })),
  setSeconds: (seconds) => set({ seconds }),
  pauseTimer: () => set({ running: false }),
  resumeTimer: () => set({ running: true }),
  resetTimer: () => set({ activeProjectId: null, seconds: 0, running: false, startTime: null }),
}))
