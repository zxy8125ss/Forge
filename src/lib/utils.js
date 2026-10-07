export function uuid() {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) return crypto.randomUUID()
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0
    return (c === 'x' ? r : (r & 3) | 8).toString(16)
  })
}

const pad = (n) => n.toString().padStart(2, '0')

// 1小时 5分3秒
export function formatDuration(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return `${h > 0 ? h + '小时 ' : ''}${m}分${s}秒`
}

// 01:05:03
export function formatClock(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  return [pad(h), pad(m), pad(s)].join(':')
}

// 65:03（分:秒）
export function formatMinSec(totalSeconds) {
  return `${pad(Math.floor(totalSeconds / 60))}:${pad(totalSeconds % 60)}`
}

// 10-07 18:45
export function formatDateTime(ts) {
  const d = new Date(ts)
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

// public 目录下资源的完整路径（适配 GitHub Pages 子路径）
export const asset = (path) => `${import.meta.env.BASE_URL}${path}`
