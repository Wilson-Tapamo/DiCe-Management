'use client'

import { useState, useEffect, useCallback } from 'react'
import { getPendingCount, processSyncQueue } from './sync'

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true)
  const [pendingCount, setPendingCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)
  const [lastSyncResult, setLastSyncResult] = useState<string | null>(null)

  const refreshPendingCount = useCallback(async () => {
    const count = await getPendingCount()
    setPendingCount(count)
  }, [])

  const triggerSync = useCallback(async () => {
    if (!isOnline || isSyncing) return
    setIsSyncing(true)
    setLastSyncResult(null)
    try {
      const result = await processSyncQueue()
      await refreshPendingCount()
      if (result.success > 0 || result.failed > 0) {
        setLastSyncResult(`${result.success} synchronisé(s), ${result.failed} échec(s)`)
      }
    } catch (err: any) {
      setLastSyncResult(`Erreur: ${err?.message}`)
    } finally {
      setIsSyncing(false)
    }
  }, [isOnline, isSyncing, refreshPendingCount])

  useEffect(() => {
    const handleOnline = async () => {
      setIsOnline(true)
      await refreshPendingCount()
    }
    const handleOffline = () => {
      setIsOnline(false)
    }

    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)
    refreshPendingCount()

    return () => {
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [refreshPendingCount])

  useEffect(() => {
    if (isOnline && pendingCount > 0) {
      const timer = setTimeout(() => triggerSync(), 2000)
      return () => clearTimeout(timer)
    }
  }, [isOnline, pendingCount, triggerSync])

  return {
    isOnline,
    isOffline: !isOnline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    pendingOps: pendingCount > 0,
    triggerSync,
    refreshPendingCount,
  }
}
