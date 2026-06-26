'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"
import { hash, compare } from "bcryptjs"
import { z } from "zod"

const UpdateProfileSchema = z.object({
    name: z.string().min(1, "Le nom est requis").optional(),
    phone: z.string().optional(),
    title: z.string().optional(),
    description: z.string().optional(),
    skills: z.array(z.string()).optional(),
    education: z.array(z.object({
        degree: z.string(),
        school: z.string(),
        year: z.string()
    })).optional(),
    experience: z.array(z.object({
        title: z.string(),
        company: z.string(),
        duration: z.string(),
        description: z.string().optional()
    })).optional(),
})

const ChangePasswordSchema = z.object({
    currentPassword: z.string().min(1, "Le mot de passe actuel est requis"),
    newPassword: z.string().min(6, "Le nouveau mot de passe doit contenir au moins 6 caractères"),
})

export async function getCurrentUserProfile() {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non connecté" }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                avatar: true,
                title: true,
                description: true,
                level: true,
                skills: true,
                education: true,
                experience: true,
                mustChangePassword: true,
                monthlySalary: true,
                rating: true,
                createdAt: true,
                _count: {
                    select: {
                        consultingProjects: true,
                        assignedTasks: true,
                        createdTasks: true,
                    }
                }
            }
        })

        if (!user) return { success: false, error: "Utilisateur introuvable" }

        return { success: true, data: user }
    } catch (error) {
        console.error("Get profile error:", error)
        return { success: false, error: "Erreur lors de la récupération du profil" }
    }
}

export async function updateProfile(formData: FormData) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non connecté" }

    const rawData: Record<string, any> = {
        name: formData.get("name") as string || undefined,
        phone: formData.get("phone") as string || undefined,
        title: formData.get("title") as string || undefined,
        description: formData.get("description") as string || undefined,
    }

    // Parse JSON fields
    try {
        const skillsRaw = formData.get("skills")
        if (skillsRaw) rawData.skills = JSON.parse(skillsRaw as string)
        
        const educationRaw = formData.get("education")
        if (educationRaw) rawData.education = JSON.parse(educationRaw as string)
        
        const experienceRaw = formData.get("experience")
        if (experienceRaw) rawData.experience = JSON.parse(experienceRaw as string)
    } catch {
        return { success: false, error: "Format de données invalide" }
    }

    const validated = UpdateProfileSchema.safeParse(rawData)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten() }
    }

    try {
        await prisma.user.update({
            where: { id: session.user.id },
            data: validated.data,
        })

        revalidatePath("/profile")
        return { success: true }
    } catch (error) {
        console.error("Update profile error:", error)
        return { success: false, error: "Erreur lors de la mise à jour du profil" }
    }
}

export async function changePassword(data: { currentPassword: string; newPassword: string }) {
    const session = await auth()
    if (!session?.user?.id) return { success: false, error: "Non connecté" }

    const validated = ChangePasswordSchema.safeParse(data)
    if (!validated.success) {
        return { success: false, error: validated.error.flatten() }
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id: session.user.id },
            select: { password: true }
        })

        if (!user) return { success: false, error: "Utilisateur introuvable" }

        const isCurrentPasswordValid = await compare(validated.data.currentPassword, user.password)
        if (!isCurrentPasswordValid) {
            return { success: false, error: "Le mot de passe actuel est incorrect" }
        }

        const hashedPassword = await hash(validated.data.newPassword, 10)

        await prisma.user.update({
            where: { id: session.user.id },
            data: {
                password: hashedPassword,
                mustChangePassword: false,
            },
        })

        return { success: true }
    } catch (error) {
        console.error("Change password error:", error)
        return { success: false, error: "Erreur lors du changement de mot de passe" }
    }
}

export async function getProfileById(id: string) {
    const session = await auth()
    if (!session?.user) return { success: false, error: "Non connecté" }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: {
                id: true,
                email: true,
                name: true,
                phone: true,
                role: true,
                avatar: true,
                title: true,
                description: true,
                level: true,
                skills: true,
                education: true,
                experience: true,
                rating: true,
                createdAt: true,
                _count: {
                    select: {
                        consultingProjects: true,
                        assignedTasks: true,
                        createdTasks: true,
                    }
                }
            }
        })

        if (!user) return { success: false, error: "Utilisateur introuvable" }

        return { success: true, data: user }
    } catch (error) {
        console.error("Get profile by id error:", error)
        return { success: false, error: "Erreur" }
    }
}