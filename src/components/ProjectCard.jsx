import { Play, Trash2 } from 'lucide-react'
import { getStage, getProgress, getNextMilestone, getStageStyle, splitHours } from '../lib/milestones'

const daysSince = (ts) => Math.max(1, Math.ceil((Date.now() - ts) / 86400000))

// 一块"铁锭"：左侧项目色、大号累计时长、阶段进度、开始按钮
export default function ProjectCard({ project, todayMinutes, onStart, onDelete }) {
  const stage = getStage(project.totalHours)
  const progress = getProgress(project.totalHours)
  const next = getNextMilestone(project.totalHours)
  const left = Math.max(0, next - project.totalHours)
  const color = project.color || '#e5501b'
  const total = splitHours(project.totalHours)
  const goal = project.targetMinutes || 30
  const goalDone = project.targetPeriod === 'daily' && todayMinutes >= goal

  return (
    <article className="relative bg-plate border-2 border-iron shadow-plate rounded-md overflow-hidden">
      <span className="absolute left-0 top-0 bottom-0 w-2" style={{ backgroundColor: color }} aria-hidden />
      <div className="pl-6 pr-4 pt-4 pb-4">
        <header className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="text-lg font-extrabold leading-tight truncate">
              <span className="mr-1.5" aria-hidden>
                {project.icon}
              </span>
              {project.name}
            </h3>
            <p className="text-[13px] text-steel mt-0.5">
              {project.targetPeriod === 'daily' ? '每天' : '每周'} {goal} 分钟 · 第 {daysSince(project.createdAt)} 天
              {project.targetTime ? ` · ${project.targetTime}` : ''}
            </p>
          </div>
          <span className={`flex-shrink-0 text-xs font-bold px-2 py-1 rounded-sm ${getStageStyle(stage)}`}>{stage}</span>
        </header>

        <div className="mt-3 flex items-end justify-between gap-3">
          <div className="flex items-baseline gap-1.5">
            <span className="num text-[56px] leading-[0.85] font-extrabold">{total.value}</span>
            <span className="text-sm font-bold text-steel">{total.unit}</span>
          </div>
          {project.targetPeriod === 'daily' && (
            <div className="text-right text-[13px] leading-tight">
              <div className="text-steel">今天</div>
              <div className={`font-bold ${goalDone ? 'text-ember' : ''}`}>
                <span className="num text-xl">{Math.round(todayMinutes)}</span> / {goal} 分
              </div>
            </div>
          )}
        </div>

        <div className="mt-3">
          <div className="h-2.5 bg-stone-deep rounded-sm overflow-hidden" role="progressbar" aria-valuenow={Math.round(progress * 100)} aria-valuemin={0} aria-valuemax={100}>
            <div className="h-full transition-[width] duration-500" style={{ width: `${progress * 100}%`, backgroundColor: color }} />
          </div>
          <p className="mt-1.5 text-[13px] text-steel">
            距 <span className="num text-[15px] font-bold text-iron">{next}</span> 小时还差{' '}
            <span className="num text-[15px] font-bold text-iron">{left < 1 ? left.toFixed(2) : left.toFixed(1)}</span> 小时
          </p>
        </div>

        <div className="mt-4 flex gap-2.5">
          <button
            onClick={onStart}
            className="flex-1 h-12 bg-iron text-plate rounded-md font-bold text-base flex items-center justify-center gap-2 active:translate-y-px active:bg-iron-soft"
          >
            <Play size={18} fill="currentColor" />
            开始锻造
          </button>
          <button
            onClick={onDelete}
            aria-label={`删除项目 ${project.name}`}
            className="w-12 h-12 border-2 border-iron/20 rounded-md flex items-center justify-center text-steel active:text-ember-deep active:border-ember-deep"
          >
            <Trash2 size={18} />
          </button>
        </div>
      </div>
    </article>
  )
}
