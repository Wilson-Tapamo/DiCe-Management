import { NextRequest, NextResponse } from 'next/server'
import { createTask, updateTaskStatus } from '@/app/actions/tasks'
import { createFinanceEntry } from '@/app/actions/finance'
import { createManualAccountingEntry } from '@/app/actions/accounting'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, payload } = body

    if (!action || !payload) {
      return NextResponse.json({ success: false, error: 'Action et payload requis' }, { status: 400 })
    }

    let result: any

    switch (action) {
      case 'createTask':
        result = await createTask(payload)
        break
      case 'updateTaskStatus':
        result = await updateTaskStatus(payload.id, payload.status)
        break
      case 'createFinanceEntry':
        result = await createFinanceEntry(payload)
        break
      case 'createManualAccountingEntry':
        result = await createManualAccountingEntry(payload)
        break
      default:
        return NextResponse.json({ success: false, error: `Action inconnue: ${action}` }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Sync API error:', error)
    return NextResponse.json({ success: false, error: 'Erreur serveur' }, { status: 500 })
  }
}
