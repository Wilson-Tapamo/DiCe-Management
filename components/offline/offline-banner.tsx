'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CloudOff, Cloud, RefreshCw, Wifi, WifiOff } from 'lucide-react'
import { useOnlineStatus } from '@/lib/offline/use-online-status'

export function OfflineBanner() {
  const {
    isOnline,
    isOffline,
    pendingCount,
    isSyncing,
    lastSyncResult,
    triggerSync,
    refreshPendingCount,
  } = useOnlineStatus()

  useEffect(() => {
    if (lastSyncResult) {
      const timer = setTimeout(() => {
        refreshPendingCount()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [lastSyncResult, refreshPendingCount])

  if (isOnline && pendingCount === 0) return null

  return (
    <>
      {isOffline && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
          <WifiOff className="h-4 w-4" />
          Mode hors ligne
          {pendingCount > 0 && (
            <span className="ml-1 rounded-full bg-white/20 px-2 py-0.5 text-xs">
              {pendingCount} en attente
            </span>
          )}
        </div>
      )}

      {isOnline && pendingCount > 0 && (
        <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 rounded-full bg-blue-500 px-4 py-2 text-sm font-medium text-white shadow-lg">
          <Cloud className="h-4 w-4" />
          <span>{pendingCount} écriture(s) en attente</span>
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 rounded-full text-white hover:bg-white/20"
            onClick={triggerSync}
            disabled={isSyncing}
          >
            <RefreshCw className={`h-3 w-3 ${isSyncing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      )}
    </>
  )
}
