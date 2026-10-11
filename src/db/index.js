import { openDB } from 'idb'

// 数据库名、版本与结构沿用线上版，升级后已有记录不受影响
const dbPromise = openDB('forge-db', 2, {
  upgrade(db) {
    // v2：本地导入的音乐（只存在本机，不上传）
    if (!db.objectStoreNames.contains('music')) {
      db.createObjectStore('music', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('projects')) {
      db.createObjectStore('projects', { keyPath: 'id' })
    }
    if (!db.objectStoreNames.contains('records')) {
      const records = db.createObjectStore('records', { keyPath: 'id' })
      records.createIndex('projectId', 'projectId', { unique: false })
      records.createIndex('startAt', 'startAt', { unique: false })
    }
  },
})

const byNewest = (a, b) => b.startAt - a.startAt

export const db = {
  async getProjects() {
    return (await dbPromise).getAll('projects')
  },
  async saveProject(project) {
    return (await dbPromise).put('projects', project)
  },
  // 删除项目时连带删除它的全部记录
  async deleteProject(id) {
    const tx = (await dbPromise).transaction(['projects', 'records'], 'readwrite')
    await tx.objectStore('projects').delete(id)
    let cursor = await tx.objectStore('records').index('projectId').openCursor(IDBKeyRange.only(id))
    while (cursor) {
      await cursor.delete()
      cursor = await cursor.continue()
    }
    await tx.done
  },
  async getRecords() {
    return (await (await dbPromise).getAll('records')).sort(byNewest)
  },
  async getRecordsByProject(projectId) {
    return (await (await dbPromise).getAllFromIndex('records', 'projectId', projectId)).sort(byNewest)
  },
  async saveRecord(record) {
    return (await dbPromise).put('records', record)
  },
  async deleteRecord(id) {
    return (await dbPromise).delete('records', id)
  },
  async getMusic() {
    return (await (await dbPromise).getAll('music')).sort((a, b) => a.addedAt - b.addedAt)
  },
  async saveMusic(item) {
    return (await dbPromise).put('music', item)
  },
  async deleteMusic(id) {
    return (await dbPromise).delete('music', id)
  },
}
