export const startOfToday = () => new Date().setHours(0, 0, 0, 0)

// 本周一 0 点
export const startOfWeek = () => {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7))
  return d.getTime()
}

export const sumMinutes = (records) => records.reduce((a, r) => a + r.duration / 60, 0)

// 小时数显示：<100 保留一位小数，否则取整
export const fmtHours = (h) => (h >= 100 ? Math.floor(h).toString() : (Math.floor(h * 10) / 10).toFixed(1))

// 项目本周期（每天/每周）已完成的分钟数
export function periodMinutes(project, records) {
  const from = project.targetPeriod === 'weekly' ? startOfWeek() : startOfToday()
  return sumMinutes(records.filter((r) => r.projectId === project.id && r.startAt >= from))
}
