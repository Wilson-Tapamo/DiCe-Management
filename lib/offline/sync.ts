import { offlineDB, type PendingSyncOp } from './db'

export async function queueOperation(op: Omit<PendingSyncOp, 'id' | 'createdAt' | 'retries' | 'lastError'>) {
  try {
    await offlineDB.pendingSync.add({
      ...op,
      createdAt: Date.now(),
      retries: 0,
    })
  } catch (e) {
    console.warn('Failed to queue operation offline:', e)
  }
}

export async function getPendingOperations(): Promise<PendingSyncOp[]> {
  try {
    return await offlineDB.pendingSync
      .orderBy('createdAt')
      .toArray()
  } catch {
    return []
  }
}

export async function getPendingCount(): Promise<number> {
  try {
    return await offlineDB.pendingSync.count()
  } catch {
    return 0
  }
}

export async function processSyncQueue(): Promise<{ success: number; failed: number }> {
  let success = 0
  let failed = 0

  try {
    const ops = await offlineDB.pendingSync.orderBy('createdAt').toArray()

    for (const op of ops) {
      try {
        const res = await fetch('/api/offline', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: op.action, payload: op.payload }),
        })

        if (res.ok) {
          await offlineDB.pendingSync.delete(op.id!)
          success++
        } else {
          await offlineDB.pendingSync.update(op.id!, {
            retries: op.retries + 1,
            lastError: `HTTP ${res.status}`,
          })
          if (op.retries >= 5) {
            await offlineDB.pendingSync.delete(op.id!)
          }
          failed++
        }
      } catch (err: any) {
        await offlineDB.pendingSync.update(op.id!, {
          retries: op.retries + 1,
          lastError: err?.message || 'Network error',
        })
        if (op.retries >= 5) {
          await offlineDB.pendingSync.delete(op.id!)
        }
        failed++
        break
      }
    }
  } catch (e) {
    console.warn('Sync queue processing error:', e)
  }

  return { success, failed }
}

export async function clearSyncQueue() {
  try {
    await offlineDB.pendingSync.clear()
  } catch {}
}
