import { useState } from 'react'
import { Plus, X } from 'lucide-react'
import { useProjectStore } from '../store/useProjectStore'
import NewProjectModal from '../components/NewProjectModal'
import WeekBars from '../components/WeekBars'
import { startOfToday, sumMinutes, fmtHours, periodMinutes } from '../lib/time'

const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export default function Home({ onStartTimer }) {
  const { projects, records, addProject, deleteProject } = useProjectStore()
  const [creating, setCreating] = useState(false)
  const [editing, setEditing] = useState(false)

  const now = new Date()
  const todayHours = sumMinutes(records.filter((r) => r.startAt >= startOfToday())) / 60
  // "开始专注"默认接上最近一次的项目
  const lastId = records[0]?.projectId
  const defaultProject = projects.find((p) => p.id === lastId) || projects[0]

  const handleDelete = (p) => {
    if (window.confirm(`删除“${p.name}”？这个项目的所有记录也会一起删除，无法恢复。`)) deleteProject(p.id)
  }

  return (
    <div className="relative flex-1 flex flex-col overflow-hidden w-full max-w-md mx-auto">
      <div className="flex-1 overflow-y-auto no-scrollbar">
        <section className="px-6 pt-8">
          <p className="text-sm text-mute">
            {now.getMonth() + 1}月{now.getDate()}日 · {WEEK[now.getDay()]}
          </p>
          <div className="num text-[128px] leading-[0.82] tracking-[-2px] mt-3">{fmtHours(todayHours)}</div>
          <p className="text-base font-bold mt-3">小时专注</p>
        </section>

        <section className="px-6 mt-7">
          <WeekBars records={records} height={64} />
        </section>

        <section className="mt-8">
          {projects.length > 0 && (
            <div className="flex justify-end px-6 mb-1">
              <button onClick={() => setEditing((v) => !v)} className="h-8 text-[13px] font-bold text-mute">
                {editing ? '完成' : '管理'}
              </button>
            </div>
          )}

          {projects.map((p, i) => {
            const done = periodMinutes(p, records)
            const goal = p.targetMinutes || 30
            return (
              <div key={p.id} className={`flex items-center ${i > 0 ? 'border-t border-line' : ''}`}>
                {editing && (
                  <button onClick={() => handleDelete(p)} aria-label={`删除 ${p.name}`} className="w-12 h-16 pl-4 flex items-center text-ember">
                    <X size={20} strokeWidth={2.5} />
                  </button>
                )}
                <button
                  onClick={() => !editing && onStartTimer(p.id)}
                  className={`flex-1 flex items-center justify-between gap-4 py-[18px] text-left ${editing ? 'pr-6' : 'px-6'} active:bg-line/60`}
                >
                  <div className="min-w-0">
                    <div className="text-lg font-black truncate">{p.name}</div>
                    <div className={`text-[13px] mt-0.5 ${done >= goal ? 'text-ember font-bold' : 'text-mute'}`}>
                      {p.targetPeriod === 'weekly' ? '本周' : '今天'} {Math.round(done)} / {goal} 分钟
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    <span className="num text-[40px] leading-none">{fmtHours(p.totalHours)}</span>
                    <span className="text-[13px] font-bold text-mute ml-1">h</span>
                  </div>
                </button>
              </div>
            )
          })}

          <button
            onClick={() => setCreating(true)}
            className={`w-full flex items-center gap-2 px-6 h-16 text-[15px] font-bold text-mute ${projects.length ? 'border-t border-line' : ''}`}
          >
            <Plus size={18} strokeWidth={2.5} />
            {projects.length ? '新建项目' : '建一个想长期坚持的项目'}
          </button>
        </section>
        <div className="h-28" />
      </div>

      {defaultProject && !editing && (
        <div className="absolute left-0 right-0 bottom-5 px-6 pointer-events-none">
          <button
            onClick={() => onStartTimer(defaultProject.id)}
            className="pointer-events-auto max-w-md mx-auto w-full h-[60px] rounded-full bg-ink text-paper text-[17px] font-black flex items-center justify-center shadow-[0_8px_24px_rgba(22,24,27,0.18)] active:scale-[0.99]"
          >
            开始专注 · {defaultProject.name}
          </button>
        </div>
      )}

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
