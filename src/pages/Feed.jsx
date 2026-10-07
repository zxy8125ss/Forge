import { Calendar, Smile, Trash2 } from 'lucide-react'
import { useProjectStore } from '../store/useProjectStore'
import { moodEmoji } from '../data/moods'
import { formatDateTime, formatDuration } from '../lib/utils'

export default function Feed() {
  const { records, projects, deleteRecord } = useProjectStore()

  const handleDelete = (id) => {
    if (window.confirm('确定要删除这条熔炼记录吗？这会同时在项目总时长中扣除本次时间。')) deleteRecord(id)
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden w-full h-full max-w-md mx-auto">
      <div className="px-4 pt-3 pb-3 flex-shrink-0">
        <h1 className="text-xl font-black text-forge-light tracking-tight">淬火历程</h1>
        <p className="text-[10px] text-forge-steel tracking-wide">一步一个脚印，见证钢铁是怎样炼成的。</p>
      </div>

      <div className="flex-1 overflow-y-auto no-scrollbar px-4 pb-28">
        {records.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <span className="text-4xl mb-4">📜</span>
            <p className="text-xs text-forge-steel">尚未留下淬火印记，快去计时精进吧！</p>
          </div>
        ) : (
          <div className="relative border-l border-forge-border/40 ml-3 pl-5 space-y-6">
            {records.map((r) => {
              const p = projects.find((x) => x.id === r.projectId)
              if (!p) return null
              return (
                <div key={r.id} className="relative group">
                  <div
                    className="absolute -left-[26.5px] top-1.5 w-3 h-3 rounded-full border border-forge-surface flex items-center justify-center shadow-md"
                    style={{ backgroundColor: p.color, boxShadow: `0 0 6px ${p.color}bb` }}
                  />
                  <div className="bg-forge-surface border border-forge-border rounded-2xl p-4 shadow-lg shadow-black/5 hover:border-forge-border/60 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{p.icon}</span>
                        <div>
                          <h4 className="font-bold text-forge-light text-xs">{p.name}</h4>
                          <div className="flex items-center gap-2 mt-0.5 text-[8px] text-forge-steel font-mono">
                            <span className="flex items-center gap-0.5">
                              <Calendar size={9} />
                              {formatDateTime(r.startAt)}
                            </span>
                            <span className="flex items-center gap-0.5">
                              <Smile size={9} />
                              {r.mood} {moodEmoji(r.mood)}
                            </span>
                          </div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleDelete(r.id)}
                        className="p-1 text-forge-steel hover:text-red-500 rounded-lg md:opacity-0 group-hover:opacity-100 transition-all"
                        title="删除记录"
                      >
                        <Trash2 size={12} />
                      </button>
                    </div>
                    <p className="text-forge-light text-xs font-semibold mt-2.5 pl-1.5 border-l-2 border-forge-orange/60">
                      已锻造：<span className="text-forge-amber font-mono font-bold">{formatDuration(r.duration)}</span>
                    </p>
                    <p className="text-forge-steel text-[10px] mt-2 leading-relaxed bg-forge-bg/30 p-2.5 rounded-xl italic">
                      “ {r.note} ”
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
