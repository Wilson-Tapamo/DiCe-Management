import type { BlobCategory } from '@/lib/blob'

export type UploadMeta = {
    projectId?: string
    taskId?: string
    category?: BlobCategory
}

export async function uploadFile(file: File, meta?: UploadMeta) {
    const formData = new FormData()
    formData.append('file', file)
    if (meta?.projectId) formData.append('projectId', meta.projectId)
    if (meta?.taskId) formData.append('taskId', meta.taskId)
    if (meta?.category) formData.append('category', meta.category)

    const res = await fetch('/api/upload', { method: 'POST', body: formData })
    const data = await res.json()
    if (!res.ok || !data.success) {
        throw new Error(data.error || "Erreur lors de l'upload")
    }
    return data as {
        success: true
        url: string
        name: string
        size: number
        type?: string
    }
}
