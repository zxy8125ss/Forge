import { Clock, Trash2 } from 'lucide-react'
import { getStage, getProgress, getNextMilestone, getStageStyle } from '../lib/milestones'

const daysSince = (ts) => Math.ceil(Math.max(0, Date.now() - ts) / (1000 * 60 * 60 * 24))

function TotalTime({ hours }) {
  const totalMinutes = Math.round(hours * 60)
  const h = Math.floor(totalMinutes / 60)
  const m = totalMinutes % 60
  const big = 'text-3xl font-extrabold font-mono text-forge-light tracking-tight'
  const unit = 'text-[10px] text-forge-steel font-bold'

  if (h === 0) {
    return (
      <div className="flex items-baseline gap-0.5">
        <span className={big}>{Math.max(0, m)}</span>
        <span className={unit}>分钟</span>
      </div>
    )
  }
  return (
    <div className="flex items-baseline gap-0.5">
      <span className={big}>{h}</span>
      <span className={`${unit} mr-1.5`}>小时</span>
      {m > 0 && (
        <>
          <span className={big}>{m}</span>
          <span className={unit}>分钟</span>
        </>
      )}
    </div>
  )
}

export default function ProjectCard({ project, onStart, onDelete }) {
  const stage = getStage(project.totalHours)
  const progress = getProgress(project.totalHours)
  const next = getNextMilestone(project.totalHours)
  const color = project.color || '#c4622d'

  return (
    <div className="bg-forge-surface/60 border border-forge-border/40 backdrop-blur-md rounded-2xl p-4.5 flex flex-col justify-between hover:border-forge-border/80 transition-all shadow-xl shadow-black/10 group">
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className="text-lg">{project.icon}</span>
          <h3 className="font-extrabold text-forge-light text-sm tracking-tight">{project.name}</h3>
        </div>
        <div className="flex items-center gap-1.5">
          <span className={`text-[8px] font-bold px-2 py-0.5 border rounded-full uppercase tracking-wider ${getStageStyle(stage)}`}>
            {stage}
          </span>
          {project.targetTime && (
            <span className="text-[8px] text-forge-steel font-bold px-2 py-0.5 border border-forge-border/20 rounded-full flex items-center gap-1">
              <Clock size={8} />
              {project.targetTime}
            </span>
          )}
          <button
            onClick={onDelete}
            className="p-1 text-forge-steel hover:text-red-500 rounded-lg transition-colors md:opacity-0 group-hover:opacity-100"
            title="废弃项目"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>

      <div className="text-[9.5px] text-forge-steel font-medium mb-3.5">
        {project.targetPeriod === 'daily' ? '每日' : '每周'} {project.targetMinutes}分钟 · 已开始 {daysSince(project.createdAt)} 天
      </div>

      <div className="mb-4">
        <TotalTime hours={project.totalHours} />
      </div>

      <div className="space-y-1.5">
        <div className="flex justify-between text-[8px] text-forge-steel font-mono">
          <span>阶段进度 {(progress * 100).toFixed(1)}%</span>
          <span>/ {next}h</span>
        </div>
        <div className="h-1 bg-forge-bg border border-forge-border/20 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{ width: `${progress * 100}%`, backgroundColor: color, boxShadow: `0 0 5px ${color}bb` }}
          />
        </div>
      </div>

      <button
        onClick={onStart}
        className="mt-4 w-full py-2 bg-black border border-forge-orange/30 hover:border-forge-orange text-forge-orange hover:text-forge-light hover:bg-forge-orange/10 font-black text-xs rounded-xl tracking-wider flex items-center justify-center gap-1 active:scale-[0.98] transition-all"
      >
        GO<span className="font-sans text-[10px]">&gt;</span>
      </button>
    </div>
  )
}
