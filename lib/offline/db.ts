import Dexie, { type Table } from 'dexie'

export interface PendingSyncOp {
  id?: number
  action: string
  endpoint: string
  payload: any
  createdAt: number
  retries: number
  lastError?: string
}

export interface CachedTask {
  id: string
  title: string
  description?: string | null
  status: string
  priority: number
  budget: number
  budgetDebours: number
  budgetPerdiem: number
  budgetTransport: number
  dueDate?: string | null
  projectId: string
  projectName?: string
  assigneeIds?: string[]
  updatedAt: string
  syncedAt: number
}

export interface CachedProject {
  id: string
  name: string
  status: string
  clientName?: string | null
  type: string
  updatedAt: string
  syncedAt: number
}

export interface CachedFinanceEntry {
  id: string
  type: string
  amount: number
  description: string
  category?: string | null
  date: string
  projectId?: string | null
  syncedAt: number
}

export class OfflineDB extends Dexie {
  pendingSync!: Table<PendingSyncOp, number>
  cachedTasks!: Table<CachedTask, string>
  cachedProjects!: Table<CachedProject, string>
  cachedFinanceEntries!: Table<CachedFinanceEntry, string>

  constructor() {
    super('DiceOfflineDB')
    this.version(1).stores({
      pendingSync: '++id, action, createdAt',
      cachedTasks: 'id, projectId, status, updatedAt',
      cachedProjects: 'id, status, updatedAt',
      cachedFinanceEntries: 'id, type, date',
    })
  }
}

export const offlineDB = new OfflineDB()
