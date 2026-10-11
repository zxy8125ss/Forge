// 备份与导出：完整备份（JSON，可恢复）、日记导出（Markdown，可直接阅读）

const LAST_KEY = 'forge-last-backup'
const pad = (n) => n.toString().padStart(2, '0')
const WEEK = ['周日', '周一', '周二', '周三', '周四', '周五', '周六']

export function getLastBackup() {
  try {
    return Number(localStorage.getItem(LAST_KEY)) || 0
  } catch {
    return 0
  }
}

function markBackedUp() {
  try {
    localStorage.setItem(LAST_KEY, String(Date.now()))
  } catch {
    /* 忽略 */
  }
}

const stamp = () => {
  const d = new Date()
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}-${pad(d.getHours())}${pad(d.getMinutes())}`
}

// 手机上弹出系统分享面板（可存到「文件」/ iCloud / 微信）；电脑上直接下载
async function saveFile(name, text, type) {
  const blob = new Blob([text], { type })
  const file = new File([blob], name, { type })
  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: name })
      return true
    } catch (err) {
      if (err?.name === 'AbortError') return false
    }
  }
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = name
  document.body.appendChild(a)
  a.click()
  setTimeout(() => {
    URL.revokeObjectURL(a.href)
    a.remove()
  }, 1000)
  return true
}

export async function exportBackup(projects, records) {
  const data = { app: 'forge', version: 1, exportedAt: new Date().toISOString(), projects, records }
  const ok = await saveFile(`Forge备份-${stamp()}.json`, JSON.stringify(data, null, 2), 'application/json')
  if (ok) markBackedUp()
  return ok
}

function durationText(sec) {
  const h = Math.floor(sec / 3600)
  const m = Math.round((sec % 3600) / 60)
  return h > 0 ? `${h} 小时 ${m} 分钟` : `${Math.max(1, m)} 分钟`
}

export function journalMarkdown(projects, records) {
  const name = (id) => projects.find((p) => p.id === id)?.name || '已删除的项目'
  const sorted = [...records].sort((a, b) => a.startAt - b.startAt)
  const lines = ['# Forge 专注日记', '', `导出时间：${new Date().toLocaleString('zh-CN')}　共 ${sorted.length} 条`, '']
  let day = ''
  for (const r of sorted) {
    const d = new Date(r.startAt)
    const key = `${d.getFullYear()}年${d.getMonth() + 1}月${d.getDate()}日 ${WEEK[d.getDay()]}`
    if (key !== day) {
      lines.push(`## ${key}`, '')
      day = key
    }
    lines.push(`### ${pad(d.getHours())}:${pad(d.getMinutes())} · ${name(r.projectId)} · ${durationText(r.duration)} · ${r.mood || ''}`, '')
    if (r.note) lines.push(r.note.trim(), '')
  }
  return lines.join('\n')
}

export async function exportJournal(projects, records) {
  return saveFile(`Forge日记-${stamp()}.md`, journalMarkdown(projects, records), 'text/markdown')
}

// 读取并校验备份文件
export async function readBackupFile(file) {
  const data = JSON.parse(await file.text())
  if (data?.app !== 'forge' || !Array.isArray(data.projects) || !Array.isArray(data.records)) {
    throw new Error('这不是 Forge 的备份文件')
  }
  return data
}

// 申请持久化存储，降低浏览器自动清理数据的可能
export async function requestPersist() {
  try {
    if (navigator.storage?.persist && !(await navigator.storage.persisted())) await navigator.storage.persist()
  } catch {
    /* 忽略 */
  }
}
