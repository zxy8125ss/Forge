import { useState } from 'react'
import { useProjectStore } from '../store/useProjectStore'
import ProjectCard from '../components/ProjectCard'
import NewProjectModal from '../components/NewProjectModal'
import { asset } from '../lib/utils'

export default function Home({ onStartTimer }) {
  const { projects, addProject, deleteProject } = useProjectStore()
  const [creating, setCreating] = useState(false)

  const handleDelete = (id, name) => {
    if (window.confirm(`确定要废弃该熔炼项目“${name}”吗？此操作会同时删除该项目的所有专注记录，不可撤销！`)) {
      deleteProject(id)
    }
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full max-w-md mx-auto">
      <div className="pt-4 pb-2 px-4 flex flex-col items-center flex-shrink-0 border-b border-forge-border/20 bg-forge-bg/60 backdrop-blur-md">
        <div className="flex flex-col items-center space-y-1">
          <div className="text-3xl font-extrabold bg-gradient-to-r from-forge-orange to-forge-amber bg-clip-text text-transparent filter drop-shadow-[0_0_8px_#c4622d40] tracking-widest font-mono">
            ∞
          </div>
          <p className="text-[10px] text-forge-steel font-bold tracking-widest uppercase">相信时间的力量</p>
        </div>
        <div className="my-3 flex-shrink-0 select-none">
          <img
            src={asset('home_illustration.png')}
            alt="Believe in the power of time"
            className="w-32 h-32 object-contain rounded-2xl border border-forge-border/10 shadow-lg shadow-black/30"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pt-4 pb-32 space-y-5">
        {projects.map((p) => (
          <ProjectCard key={p.id} project={p} onStart={() => onStartTimer(p.id)} onDelete={() => handleDelete(p.id, p.name)} />
        ))}

        <div className="bg-forge-surface/30 border border-forge-border/20 border-dashed rounded-2xl p-5 text-center flex flex-col items-center justify-center space-y-3.5 shadow-inner">
          <span className="text-[9px] text-forge-steel tracking-widest font-bold">把时间留给真正重要的事</span>
          <div className="flex flex-col items-center space-y-0.5">
            <span className="text-xl">🕹️</span>
            <h4 className="font-extrabold text-xs text-forge-light tracking-tight">新建专注项目</h4>
            <p className="text-[9px] text-forge-steel">开始记录一件你想长期坚持的事</p>
          </div>
          <button
            onClick={() => setCreating(true)}
            className="px-6 py-2 bg-black hover:bg-forge-orange/10 border border-forge-orange/30 hover:border-forge-orange text-forge-orange font-bold text-xs rounded-xl tracking-wider shadow-md active:scale-95 transition-all"
          >
            + 新建项目
          </button>
        </div>
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
