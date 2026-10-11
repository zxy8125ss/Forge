import { useState } from 'react'
import { Download, PenLine } from 'lucide-react'
import { useProjectStore } from '../store/useProjectStore'
import { moodEmoji } from '../data/moods'
import RecordSheet from '../components/RecordSheet'
import BackupSheet from '../components/BackupSheet'
import { getLastBackup } from '../lib/backup'

const pad = (n) => n.toString().padStart(2, '0')
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

function dayLabel(ts) {
  const d = new Date(ts)
  const today = new Date()
  const y = new Date()
  y.setDate(today.getDate() - 1)
  if (d.toDateString() === today.toDateString()) return '今天'
  if (d.toDateString() === y.toDateString()) return '昨天'
  return `${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`
}

function Duration({ sec }) {
  const h = Math.floor(sec / 3600)
  const m = Math.floor((sec % 3600) / 60)
  return h > 0 ? (
    <>
      <span className="num text-[30px] leading-none">
        {h}:{pad(m)}
      </span>
      <span className="text-[13px] font-bold text-mute ml-1">时</span>
    </>
  ) : (
    <>
      <span className="num text-[30px] leading-none">{Math.max(1, m)}</span>
      <span className="text-[13px] font-bold text-mute ml-1">分</span>
    </>
  )
}

// 记录：按天分组的专注记录 + 心得 / 日记，点开可看全文、修改；右上角导出与备份
export default function Feed() {
  const { records, projects, deleteRecord, updateRecord } = useProjectStore()
  const [openId, setOpenId] = useState(null)
  const [showBackup, setShowBackup] = useState(false)
  const needBackup = records.length > 0 && Date.now() - getLastBackup() > 7 * 86400000

  const groups = []
  records.forEach((r) => {
    const key = new Date(r.startAt).toDateString()
    let g = groups.find((x) => x.key === key)
    if (!g) groups.push((g = { key, ts: r.startAt, items: [], total: 0 }))
    g.items.push(r)
    g.total += r.duration
  })

  const open = records.find((r) => r.id === openId)

  return (
    <div className="flex-1 overflow-y-auto no-scrollbar w-full max-w-md mx-auto">
      <header className="px-6 pt-8 pb-2 flex items-end justify-between">
        <h1 className="text-[34px] font-black leading-none">记录</h1>
        <button onClick={() => setShowBackup(true)} className="relative h-10 -mr-2 px-3 rounded-full flex items-center gap-1.5 text-sm font-bold active:bg-line">
          <Download size={17} />
          导出与备份
          {needBackup && <span className="absolute top-1.5 right-1 w-2 h-2 rounded-full bg-ember" aria-label="该备份了" />}
        </button>
      </header>

      {records.length === 0 ? (
        <p className="px-6 pt-6 text-base text-mute leading-relaxed">完成一次专注并保存后，会出现在这里，你写的心得和日记也都在这里。</p>
      ) : (
        groups.map((g) => (
          <section key={g.key} className="pt-7">
            <div className="flex items-baseline justify-between px-6 pb-2">
              <h2 className="text-base font-black">{dayLabel(g.ts)}</h2>
              <span className="text-sm text-mute">
                共 <span className="font-bold text-ink">{Math.round(g.total / 60)}</span> 分钟
              </span>
            </div>
            {g.items.map((r) => {
              const p = projects.find((x) => x.id === r.projectId)
              if (!p) return null
              const d = new Date(r.startAt)
              return (
                <button key={r.id} onClick={() => setOpenId(r.id)} className="w-full text-left border-t border-line px-6 py-4 active:bg-line/60">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[17px] font-black truncate">{p.name}</div>
                      <p className="text-[13px] text-mute mt-0.5">
                        {pad(d.getHours())}:{pad(d.getMinutes())} · {moodEmoji(r.mood)} {r.mood}
                      </p>
                    </div>
                    <div className="flex-shrink-0 pt-0.5">
                      <Duration sec={r.duration} />
                    </div>
                  </div>
                  {r.note ? (
                    <p className="text-[15px] leading-relaxed mt-2 line-clamp-3 whitespace-pre-line">{r.note}</p>
                  ) : (
                    <p className="text-sm text-mute mt-2 flex items-center gap-1.5">
                      <PenLine size={14} />
                      写点心得
                    </p>
                  )}
                </button>
              )
            })}
          </section>
        ))
      )}
      <div className="h-8" />

      {open && (
        <RecordSheet
          key={open.id}
          record={open}
          project={projects.find((p) => p.id === open.projectId)}
          onSave={updateRecord}
          onDelete={(id) => {
            deleteRecord(id)
            setOpenId(null)
          }}
          onClose={() => setOpenId(null)}
        />
      )}
      {showBackup && <BackupSheet onClose={() => setShowBackup(false)} />}
    </div>
  )
}
