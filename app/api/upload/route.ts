export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { put } from '@vercel/blob'
import { auth } from '@/lib/auth'
import { buildBlobPathname, getBlobToken, type BlobCategory } from '@/lib/blob'

const MAX_SIZE = 10 * 1024 * 1024
const VALID_CATEGORIES: BlobCategory[] = ['tache', 'commentaire', 'document']

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const token = getBlobToken()
        if (!token) {
            console.error('Upload error: BLOB_READ_WRITE_TOKEN manquant')
            return NextResponse.json(
                { error: 'Stockage Blob non configuré (BLOB_READ_WRITE_TOKEN)' },
                { status: 503 }
            )
        }

        const data = await request.formData()
        const file = data.get('file') as File | null

        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
        }

        if (file.size > MAX_SIZE) {
            return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })
        }

        const projectId = (data.get('projectId') as string) || undefined
        const taskId = (data.get('taskId') as string) || undefined
        const rawCategory = (data.get('category') as string) || 'document'
        const category = VALID_CATEGORIES.includes(rawCategory as BlobCategory)
            ? (rawCategory as BlobCategory)
            : 'document'

        const pathname = buildBlobPathname({
            projectId,
            taskId,
            category,
            fileName: file.name,
        })

        const blob = await put(pathname, file, {
            access: 'public',
            token,
            contentType: file.type || undefined,
        })

        return NextResponse.json({
            success: true,
            url: blob.url,
            pathname: blob.pathname,
            name: file.name,
            size: file.size,
            type: file.type,
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: "Erreur lors de l'upload" }, { status: 500 })
    }
}
