import { queueOperation } from './sync'

export function createOfflineAction<T extends Record<string, any>>(
  actionName: string,
  endpoint: string,
) {
  return async (payload: T): Promise<{ success: boolean; error?: string; offline?: boolean }> => {
    try {
      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      return await res.json()
    } catch (err: any) {
      if (
        err?.name === 'TypeError' ||
        err?.message?.includes('NetworkError') ||
        err?.message?.includes('Failed to fetch') ||
        err?.message?.includes('Network request failed')
      ) {
        await queueOperation({
          action: actionName,
          endpoint,
          payload,
        })
        return { success: true, offline: true }
      }
      return { success: false, error: err?.message || 'Erreur' }
    }
  }
}

export function createOfflineHandlers<T extends Record<string, any>>(
  actionName: string,
  endpoint: string,
) {
  const offlineAction = createOfflineAction<T>(actionName, endpoint)

  return {
    submit: offlineAction,
    getQueueAction: () => ({
      action: actionName,
      endpoint,
    }),
  }
}
