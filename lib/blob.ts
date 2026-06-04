export type BlobCategory = 'tache' | 'commentaire' | 'document'

export function buildBlobPathname(opts: {
    projectId?: string | null
    taskId?: string | null
    category?: BlobCategory
    fileName: string
}): string {
    const safeName = `${Date.now()}_${opts.fileName.replace(/[^a-zA-Z0-9._-]/g, '_')}`
    const category = opts.category || 'document'

    if (opts.projectId && opts.taskId) {
        return `projets/${opts.projectId}/taches/${opts.taskId}/${category}/${safeName}`
    }
    if (opts.projectId) {
        return `projets/${opts.projectId}/${category}/${safeName}`
    }
    return `documents/${category}/${safeName}`
}

export function getBlobToken(): string | undefined {
    return (
        process.env.BLOB_READ_WRITE_TOKEN ||
        process.env.vercel_blob_rw_token ||
        process.env.VERCEL_BLOB_RW_TOKEN
    )
}
