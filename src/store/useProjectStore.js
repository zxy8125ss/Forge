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
