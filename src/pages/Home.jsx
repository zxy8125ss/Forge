import { useState } from 'react'
import { Plus } from 'lucide-react'
import { useProjectStore } from '../store/useProjectStore'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/NewProjectModal'
import ForgeMark from '../components/ForgeMark'

const startOfToday = () => new Date().setHours(0, 0, 0, 0)

export default function Home({ onStartTimer }) {
  const { projects, records, addProject, deleteProject } = useProjectStore()
  const [creating, setCreating] = useState(false)

  const today = startOfToday()
  const todayMinutesBy = (id) => records.filter((r) => r.projectId === id && r.startAt >= today).reduce((a, r) => a + r.duration / 60, 0)
  const todayTotal = records.filter((r) => r.startAt >= today).reduce((a, r) => a + r.duration / 60, 0)

  const handleDelete = (id, name) => {
    if (window.confirm(`删除“${name}”？这个项目的所有记录也会一起删除，无法恢复。`)) deleteProject(id)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full max-w-md mx-auto">
      <header className="flex-shrink-0 px-5 pt-5 pb-4 flex items-end justify-between border-b-2 border-iron">
        <div className="flex items-center gap-3">
          <ForgeMark className="w-11 h-11" />
          <div>
            <h1 className="text-[28px] leading-none font-black tracking-tight">熔炉</h1>
            <p className="text-[13px] text-steel mt-1.5">相信时间的力量</p>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[13px] text-steel">今天已锻造</div>
          <div className="leading-none mt-1">
            <span className="num text-[34px] font-extrabold">{Math.round(todayTotal)}</span>
            <span className="text-sm font-bold ml-1">分钟</span>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto no-scrollbar px-5 pt-5 pb-8 space-y-5">
        {projects.length === 0 && (
          <div className="pt-6 pb-2">
            <p className="text-2xl font-black leading-snug">
              一万小时，
              <br />
              从第一块铁开始。
            </p>
            <p className="text-[15px] text-steel mt-3 leading-relaxed">建一个你想长期坚持的项目，每次专注都会累计成它的时长。</p>
          </div>
        )}

        {projects.map((p) => (
          <ProjectCard
            key={p.id}
            project={p}
            todayMinutes={todayMinutesBy(p.id)}
            onStart={() => onStartTimer(p.id)}
            onDelete={() => handleDelete(p.id, p.name)}
          />
        ))}

        <button
          onClick={() => setCreating(true)}
          className="w-full h-14 border-2 border-dashed border-iron/40 rounded-md flex items-center justify-center gap-2 text-base font-bold text-iron active:border-iron active:bg-plate"
        >
          <Plus size={20} strokeWidth={2.5} />
          新建项目
        </button>
      </div>

      {creating && (
        <NewProjectModal
          onClose={() => setCreating(false)}
          onCreate={(project) => {
            addProject(project)
            setCreating(false)
          }}
        />
      )}
    </div>
  )
}
