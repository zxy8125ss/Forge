import { useRef, useState } from 'react'
import Sheet from './Sheet'
import { useProjectStore } from '../store/useProjectStore'
import { exportBackup, exportJournal, readBackupFile, getLastBackup } from '../lib/backup'

function ago(ts) {
  if (!ts) return '还没备份过'
  const days = Math.floor((Date.now() - ts) / 86400000)
  if (days === 0) return '今天备份过'
  return `${days} 天前备份过`
}

// 导出日记 / 完整备份 / 从备份恢复
export default function BackupSheet({ onClose }) {
  const { projects, records, importBackup } = useProjectStore()
  const [last, setLast] = useState(getLastBackup())
  const [msg, setMsg] = useState('')
  const fileRef = useRef(null)
  const withNote = records.filter((r) => r.note).length

  const Item = ({ title, desc, onClick, primary }) => (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl px-5 py-4 active:scale-[0.99] ${primary ? 'bg-ink text-paper' : 'bg-white text-ink'}`}
    >
      <div className="text-[17px] font-black">{title}</div>
      <div className={`text-[13px] mt-1 leading-relaxed ${primary ? 'text-paper/70' : 'text-mute'}`}>{desc}</div>
    </button>
  )

  return (
    <Sheet title="导出与备份" onClose={onClose}>
      <p className="-mt-4 mb-5 text-sm text-mute">
        共 {records.length} 条记录，其中 {withNote} 条写了心得 · <span className={last && Date.now() - last < 7 * 86400000 ? '' : 'text-ember font-bold'}>{ago(last)}</span>
      </p>

      <div className="space-y-3">
        <Item
          primary
          title="完整备份"
          desc="所有项目和记录存成一个文件，换手机或数据丢了可以恢复。手机上会弹出分享面板，选「存储到文件」或发到微信 / iCloud 即可。"
          onClick={async () => {
            if (await exportBackup(projects, records)) {
              setLast(getLastBackup())
              setMsg('已生成备份文件')
            }
          }}
        />
        <Item
          title="导出日记"
          desc="把所有记录按日期整理成一篇可直接阅读的文档（Markdown），适合存档或贴到笔记软件。"
          onClick={async () => {
            if (await exportJournal(projects, records)) setMsg('已生成日记文件')
          }}
        />
        <Item title="从备份恢复" desc="选择之前导出的备份文件。会和现有数据合并，不会删掉现有记录。" onClick={() => fileRef.current?.click()} />
        <input
          ref={fileRef}
          type="file"
          accept=".json,application/json"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0]
            e.target.value = ''
            if (!file) return
            try {
              const data = await readBackupFile(file)
              if (!window.confirm(`恢复备份：${data.projects.length} 个项目、${data.records.length} 条记录，和现有数据合并？`)) return
              const r = await importBackup(data)
              setMsg(`已恢复 ${r.projects} 个项目、${r.records} 条记录`)
            } catch (err) {
              setMsg(`恢复失败：${err.message}`)
            }
          }}
        />
      </div>

      {msg && <p className="mt-5 text-center text-[15px] font-bold">{msg}</p>}
      <p className="mt-6 text-[13px] text-mute leading-relaxed">
        记录只保存在这台手机的 Forge 里。建议每周做一次完整备份，超过 7 天没备份时，「记录」页右上角会提醒。
      </p>
    </Sheet>
  )
}
