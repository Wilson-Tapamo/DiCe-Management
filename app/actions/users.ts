'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { ConsultantSchema, ConsultantInput } from "@/lib/schemas"
import { hash } from "bcryptjs"

export async function getConsultants(filters?: {
    search?: string
    level?: string
    minSalary?: number
    maxSalary?: number
    sortBy?: 'salary_asc' | 'salary_desc' | 'rating_desc' | 'projects_desc'
}) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") return { success: false, error: "Non autorisé" }

    const where: any = {
        role: { in: ["CONSULTANT", "DIRECTOR"] }
    }

    const searchConditions: any[] = []
    if (filters?.search) {
        const searchTerm = filters.search
        searchConditions.push({
            OR: [
                { name: { contains: searchTerm } },
                { email: { contains: searchTerm } },
                { title: { contains: searchTerm } },
            ]
        })
    }

    if (filters?.level && filters.level !== "ALL") {
        searchConditions.push({ level: filters.level })
    }

    if (searchConditions.length > 0) {
        where.AND = searchConditions
    }

    if (filters?.minSalary !== undefined || filters?.maxSalary !== undefined) {
        where.monthlySalary = {}
        if (filters.minSalary !== undefined) where.monthlySalary.gte = filters.minSalary
        if (filters.maxSalary !== undefined) where.monthlySalary.lte = filters.maxSalary
    }

    let orderBy: any = { name: 'asc' }
    if (filters?.sortBy === 'salary_asc') orderBy = { monthlySalary: 'asc' }
    if (filters?.sortBy === 'salary_desc') orderBy = { monthlySalary: 'desc' }
    if (filters?.sortBy === 'rating_desc') orderBy = { rating: 'desc' }
    // For projects_desc, we might need relation count sorting or sort in memory

    try {
        const consultants = await prisma.user.findMany({
            where,
            orderBy,
            include: {
                _count: {
                    select: {
                        consultingProjects: true,
                        assignedTasks: true
                    }
                },
                workedHours: {
                    include: {
                        task: {
                            select: {
                                id: true,
                                title: true,
                                status: true,
                                project: { select: { id: true, name: true } }
                            }
                        }
                    }
                },
                assignedTasks: {
                    select: {
                        id: true,
                        title: true,
                        status: true,
                        project: { select: { id: true, name: true } }
                    },
                    take: 10,
                    orderBy: { updatedAt: 'desc' }
                }
            }
        })

        // Manual sort for counts if needed
        if (filters?.sortBy === 'projects_desc') {
            consultants.sort((a: any, b: any) => b._count.consultingProjects - a._count.consultingProjects)
        }

        return { success: true, data: consultants }
    } catch (error) {
        console.error("Get consultants error:", error)
        return { success: false, error: "Erreur lors de la récupération des consultants" }
    }
}

export async function createConsultant(data: ConsultantInput) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") return { success: false, error: "Non autorisé" }

    const validated = ConsultantSchema.safeParse(data)
    if (!validated.success) return { success: false, error: validated.error.flatten() }

    const { email, password, name, phone, ...profileData } = validated.data

    try {
        // password hash
        const hashedPassword = await hash(password || "Optimum123!", 10)

        await prisma.user.create({
            data: {
                email,
                name,
                phone,
                password: hashedPassword,
                role: "CONSULTANT",
                ...profileData,
                // Ensure Enums are cast if needed, but safeParse handles structure
            }
        })

        revalidatePath("/consultants")
        return { success: true }
    } catch (error) {
        console.error("Create consultant error:", error)
        return { success: false, error: "Erreur (probablement email déjà utilisé)" }
    }
}

export async function updateConsultant(id: string, data: Partial<ConsultantInput>) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") return { success: false, error: "Non autorisé" }

    try {
        const { password, ...updateData } = data
        // If password is provided, hash it
        let finalData: any = { ...updateData }
        if (password) {
            finalData.password = await hash(password, 10)
        }

        await prisma.user.update({
            where: { id },
            data: finalData
        })

        revalidatePath("/consultants")
        return { success: true }

    } catch (error) {
        return { success: false, error: "Erreur lors de la mise à jour" }
    }
}

export async function deleteConsultant(id: string) {
    const session = await auth()
    if (!session?.user || (session.user as any)?.role !== "DIRECTOR") return { success: false, error: "Non autorisé" }

    try {
        await prisma.user.delete({ where: { id } })
        revalidatePath("/consultants")
        return { success: true }
    } catch (error) {
        return { success: false, error: "Impossible de supprimer (adossé à des projets ?)" }
    }
}
