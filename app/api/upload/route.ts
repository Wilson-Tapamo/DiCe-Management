export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

import { NextRequest, NextResponse } from 'next/server'
import { mkdir, writeFile } from 'fs/promises'
import { join } from 'path'
import { auth } from '@/lib/auth'

export async function POST(request: NextRequest) {
    try {
        const session = await auth()
        if (!session?.user) {
            return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
        }

        const data = await request.formData()
        const file: File | null = data.get('file') as unknown as File

        if (!file) {
            return NextResponse.json({ error: 'Aucun fichier fourni' }, { status: 400 })
        }

        // Validate size (max 10MB)
        if (file.size > 10 * 1024 * 1024) {
            return NextResponse.json({ error: 'Fichier trop volumineux (max 10 Mo)' }, { status: 400 })
        }

        const bytes = await file.arrayBuffer()
        const buffer = Buffer.from(bytes)

        // Generate unique filename
        const timestamp = Date.now()
        const originalName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_')
        const fileName = `${timestamp}_${originalName}`

        const uploadDir = join(process.cwd(), 'public', 'uploads')
        const filePath = join(uploadDir, fileName)

        await mkdir(uploadDir, { recursive: true })
        await writeFile(filePath, buffer)

        const fileUrl = `/uploads/${fileName}`

        return NextResponse.json({
            success: true,
            url: fileUrl,
            name: file.name,
            size: file.size,
            type: file.type
        })
    } catch (error) {
        console.error('Upload error:', error)
        return NextResponse.json({ error: 'Erreur lors de l\'upload' }, { status: 500 })
    }
}
