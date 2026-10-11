import { create } from 'zustand'
import { db } from '../db'

const addHours = (project, hours) => {
  const totalHours = Number(Math.max(0, project.totalHours + hours).toFixed(4))
  const updated = { ...project, totalHours }
  db.saveProject(updated)
  return updated
}

export const useProjectStore = create((set, get) => ({
  projects: [],
  records: [],
  loading: true,

  init: async () => {
    try {
      set({ projects: await db.getProjects(), records: await db.getRecords(), loading: false })
    } catch (err) {
      console.error('Failed to initialize database stores:', err)
      set({ loading: false })
    }
  },

  addProject: async (project) => {
    await db.saveProject(project)
    set((s) => ({ projects: [...s.projects, project] }))
  },

  deleteProject: async (id) => {
    await db.deleteProject(id)
    set((s) => ({
      projects: s.projects.filter((p) => p.id !== id),
      records: s.records.filter((r) => r.projectId !== id),
    }))
  },

  // 保存记录并把时长累加到所属项目
  addRecord: async (record) => {
    await db.saveRecord(record)
    const hours = record.duration / 3600
    set((s) => ({
      records: [record, ...s.records],
      projects: s.projects.map((p) => (p.id === record.projectId ? addHours(p, hours) : p)),
    }))
  },

  // 修改记录的心得 / 心境（时长不变）
  updateRecord: async (record) => {
    const updated = { ...record, updatedAt: Date.now() }
    await db.saveRecord(updated)
    set((s) => ({ records: s.records.map((r) => (r.id === updated.id ? updated : r)) }))
  },

  // 从备份恢复：按 id 合并（备份里的为准），再按记录重算各项目累计时长
  importBackup: async (backup) => {
    const { projects: curP, records: curR } = get()
    const pMap = new Map(curP.map((p) => [p.id, p]))
    backup.projects.forEach((p) => pMap.set(p.id, p))
    const rMap = new Map(curR.map((r) => [r.id, r]))
    backup.records.forEach((r) => rMap.set(r.id, r))
    const records = [...rMap.values()].filter((r) => pMap.has(r.projectId)).sort((a, b) => b.startAt - a.startAt)
    const projects = [...pMap.values()].map((p) => ({
      ...p,
      totalHours: Number((records.filter((r) => r.projectId === p.id).reduce((a, r) => a + r.duration, 0) / 3600).toFixed(4)),
    }))
    for (const p of projects) await db.saveProject(p)
    for (const r of records) await db.saveRecord(r)
    set({ projects, records })
    return { projects: backup.projects.length, records: backup.records.length }
  },

  // 删除记录并从所属项目扣回时长
  deleteRecord: async (id) => {
    const record = get().records.find((r) => r.id === id)
    if (!record) return
    await db.deleteRecord(id)
    const hours = record.duration / 3600
    set((s) => ({
      records: s.records.filter((r) => r.id !== id),
      projects: s.projects.map((p) => (p.id === record.projectId ? addHours(p, -hours) : p)),
    }))
  },
}))
