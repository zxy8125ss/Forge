export const MILESTONES = [10, 50, 100, 500, 1000, 5000, 10000]
export const STAGES = ['起步阶段', '摸索阶段', '渐悟阶段', '立足阶段', '专业阶段', '资深阶段', '大师阶段']

export function getStage(hours) {
  for (let i = MILESTONES.length - 1; i >= 0; i--) {
    if (hours >= MILESTONES[i]) return STAGES[i + 1] ?? '大师阶段'
  }
  return '起步阶段'
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

export function getStageStyle(stage) {
  switch (stage) {
    case '起步阶段':
      return 'text-zinc-400 border-zinc-700/30 bg-zinc-800/20'
    case '摸索阶段':
      return 'text-amber-500 border-amber-900/30 bg-amber-950/10'
    case '渐悟阶段':
      return 'text-orange-400 border-orange-950/30 bg-orange-950/10'
    case '立足阶段':
      return 'text-amber-400 border-amber-950/30 bg-amber-950/10'
    case '专业阶段':
      return 'text-cyan-400 border-cyan-900/30 bg-cyan-950/10'
    case '资深阶段':
      return 'text-fuchsia-400 border-fuchsia-950/30 bg-fuchsia-950/10'
    case '大师阶段':
      return 'text-forge-amber animate-pulse border-forge-orange/30 bg-forge-orange/10'
    default:
      return 'text-forge-light border-forge-border'
  }
}
