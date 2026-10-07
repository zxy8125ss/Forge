export const MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000]
export const STAGES = ['起步阶段', '摸索阶段', '渐悟阶段', '立足阶段', '专业阶段', '资深阶段', '大师阶段']

export function getStage(hours) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (hours >= MILESTONES[i]) return STAGES[i + 1] ?? '大师阶段'
  }
  return '起步阶段'
}

export function getStageIndex(hours) {
  return STAGES.indexOf(getStage(hours))
}

export function getNextMilestone(hours) {
  return MILESTONES.find((m) => m > hours) ?? 10000
}

// 当前阶段内的进度 0~1
export function getProgress(hours) {
  const prev = [...MILESTONES, 0].reverse().find((m) => m <= hours) ?? 0
  const span = getNextMilestone(hours) - prev
  if (span === 0) return 1
  return Math.min(1, Math.max(0, (hours - prev) / span))
}

// 阶段徽章：越往后越"热"——从生铁灰到熔铁橙，大师用黄铜
export function getStageStyle(stage) {
  switch (stage) {
    case '起步阶段':
      return 'bg-stone-deep text-iron'
    case '摸索阶段':
      return 'bg-iron-soft text-plate'
    case '渐悟阶段':
      return 'bg-iron text-plate'
    case '立足阶段':
      return 'bg-ember-deep text-plate'
    case '专业阶段':
      return 'bg-ember text-plate'
    case '资深阶段':
      return 'bg-iron text-ember'
    case '大师阶段':
      return 'bg-brass text-plate'
    default:
      return 'bg-stone-deep text-iron'
  }
}

// 小时数显示：12.5 → "12.5"，0.25 → "15 分钟"
export function splitHours(hours) {
  const minutes = Math.round(hours * 60)
  if (minutes < 60) return { value: String(minutes), unit: '分钟' }
  const h = minutes / 60
  return { value: h >= 100 ? Math.floor(h).toString() : (Math.floor(h * 10) / 10).toString(), unit: '小时' }
}
