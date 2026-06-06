'use client'

import { useCallback, useState } from 'react'
import { queueOperation } from './sync'

export function useOfflineAction<TArgs extends any[], TReturn>(
  actionFn: (...args: TArgs) => Promise<TReturn>,
  actionName: string,
) {
  const [isOfflineExec, setIsOfflineExec] = useState(false)

  const execute = useCallback(
    async (...args: TArgs): Promise<TReturn & { offline?: boolean }> => {
      try {
        setIsOfflineExec(false)
        const result = await actionFn(...args)
        return result as any
      } catch (err: any) {
        const isNetworkError =
          err?.message?.includes('fetch') ||
          err?.message?.includes('NetworkError') ||
          err?.name === 'TypeError' ||
          err?.message?.includes('Failed to fetch') ||
          err?.message?.includes('network')

        if (isNetworkError && args.length > 0) {
          setIsOfflineExec(true)
          await queueOperation({
            action: actionName,
            endpoint: '/api/offline',
            payload: args[0],
          })
          return { success: true, offline: true } as any
        }

        throw err
      }
    },
    [actionFn, actionName],
  )

  return { execute, isOfflineExec }
}
