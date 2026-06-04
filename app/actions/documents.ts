'use server'

import { prisma } from '@/db/prisma'
import { auth } from '@/lib/auth'

export type DocumentCategory = 'tache' | 'commentaire'
export type DocumentItem = {
    id: string
    fileName: string
    fileUrl: string
    fileSize: number
    createdAt: string
    category: DocumentCategory
    projectId: string
    projectName: string
    taskId: string
    taskTitle: string
    uploadedByName?: string
    mimeType?: string
}

export async function getDocuments(filters?: {
    projectId?: string
    taskId?: string
    category?: DocumentCategory | 'all'
    search?: string
}) {
    const session = await auth()
    if (!session?.user) return { success: false, error: 'Non autorisé' }

    try {
        const items: DocumentItem[] = []

        const attachmentWhere: { task?: { projectId?: string }; taskId?: string } = {}
        if (filters?.projectId) {
            attachmentWhere.task = { projectId: filters.projectId }
        }
        if (filters?.taskId) {
            attachmentWhere.taskId = filters.taskId
        }

        if (!filters?.category || filters.category === 'all' || filters.category === 'tache') {
            const attachments = await prisma.taskAttachment.findMany({
                where: attachmentWhere,
                include: {
                    uploadedBy: { select: { name: true } },
                    task: {
                        select: {
                            id: true,
                            title: true,
                            project: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            })

            for (const att of attachments) {
                items.push({
                    id: `att-${att.id}`,
                    fileName: att.fileName,
                    fileUrl: att.fileUrl,
                    fileSize: att.fileSize,
                    createdAt: att.createdAt.toISOString(),
                    category: 'tache',
                    projectId: att.task.project.id,
                    projectName: att.task.project.name,
                    taskId: att.task.id,
                    taskTitle: att.task.title,
                    uploadedByName: att.uploadedBy.name ?? undefined,
                })
            }
        }

        if (!filters?.category || filters.category === 'all' || filters.category === 'commentaire') {
            const commentWhere: { task?: { projectId?: string }; taskId?: string } = {}
            if (filters?.projectId) {
                commentWhere.task = { projectId: filters.projectId }
            }
            if (filters?.taskId) {
                commentWhere.taskId = filters.taskId
            }

            const comments = await prisma.comment.findMany({
                where: commentWhere,
                include: {
                    user: { select: { name: true } },
                    task: {
                        select: {
                            id: true,
                            title: true,
                            project: { select: { id: true, name: true } },
                        },
                    },
                },
                orderBy: { createdAt: 'desc' },
            })

            for (const comment of comments) {
                const raw = comment.attachments
                if (!raw || !Array.isArray(raw)) continue

                const attachmentList = raw as {
                    url?: string
                    name?: string
                    size?: number
                    type?: string
                }[]

                attachmentList.forEach((att, index) => {
                    if (!att?.url || !att?.name) return
                    items.push({
                        id: `cmt-${comment.id}-${index}`,
                        fileName: att.name,
                        fileUrl: att.url,
                        fileSize: att.size ?? 0,
                        createdAt: comment.createdAt.toISOString(),
                        category: 'commentaire',
                        projectId: comment.task.project.id,
                        projectName: comment.task.project.name,
                        taskId: comment.task.id,
                        taskTitle: comment.task.title,
                        uploadedByName: comment.user.name ?? undefined,
                        mimeType: att.type,
                    })
                })
            }
        }

        let result = items
        if (filters?.search?.trim()) {
            const q = filters.search.trim().toLowerCase()
            result = result.filter(
                (d) =>
                    d.fileName.toLowerCase().includes(q) ||
                    d.projectName.toLowerCase().includes(q) ||
                    d.taskTitle.toLowerCase().includes(q)
            )
        }

        result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

        const projects = await prisma.project.findMany({
            select: { id: true, name: true },
            orderBy: { name: 'asc' },
        })

        return { success: true, data: result, projects }
    } catch (error) {
        console.error('Get documents error:', error)
        return { success: false, error: 'Erreur lors de la récupération des documents' }
    }
}
