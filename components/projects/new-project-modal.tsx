'use client'

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { CalendarIcon, Loader2, Check } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import {
    Command,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
} from "@/components/ui/command"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { createProjectJson } from "@/app/actions/projects"

const formSchema = z.object({
    name: z.string().min(2, "Le nom doit contenir au moins 2 caractères."),
    description: z.string().optional(),
    priority: z.enum(["LOW", "MEDIUM", "HIGH"]),
    startDate: z.date().optional(),
    endDate: z.date().optional(),
    consultantIds: z.array(z.string()).min(1, "Sélectionnez au moins un membre du personnel."),
})

interface Consultant {
    id: string
    name: string | null
    avatar: string | null
}

interface NewProjectModalProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    consultants: Consultant[]
}

export function NewProjectModal({ open, onOpenChange, consultants, project }: { open: boolean, onOpenChange: (open: boolean) => void, consultants: Consultant[], project?: any }) {
    const [isPending, setIsPending] = useState(false)

    // Helper to parse dates safely
    const parseDate = (date: any) => date ? new Date(date) : undefined

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            name: project?.name || "",
            description: project?.description || "",
            priority: project?.priority || "MEDIUM",
            startDate: parseDate(project?.startDate),
            endDate: parseDate(project?.endDate),
            consultantIds: project?.consultants?.map((c: any) => c.id) || [],
        },
    })

    // Reset form when project changes or modal opens
    // (This is simple effect, in prod might need more robust reset logic)
    // For now rely on key={project?.id} usage in parent or effect

    async function onSubmit(values: z.infer<typeof formSchema>) {
        setIsPending(true)
        try {
            const payload = {
                ...values,
                startDate: values.startDate?.toISOString(),
                endDate: values.endDate?.toISOString(),
            }

            let result
            if (project) {
                // Update
                /* We need to import updateProjectJson */
                const { updateProjectJson } = await import("@/app/actions/projects")
                result = await updateProjectJson(project.id, payload as any)
            } else {
                // Create
                result = await createProjectJson(payload as any)
            }

            if (result.success) {
                onOpenChange(false)
                if (!project) form.reset() // Only reset on create
            } else {
                console.error(result.error)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsPending(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="relative w-full sm:max-w-2xl">
                {isPending && (
                    <div className="absolute inset-0 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm z-50 flex flex-col items-center justify-center animate-fade-in">
                        <div className="relative flex flex-col items-center gap-4">
                            <div className="h-16 w-16 rounded-full border-4 border-blue-600/25 border-t-blue-600 animate-spin" />
                            <div className="text-center">
                                <p className="font-semibold text-foreground text-base">Enregistrement en cours...</p>
                                <p className="text-xs text-muted-foreground mt-1">Veuillez patienter un instant</p>
                            </div>
                        </div>
                    </div>
                )}
                <DialogHeader>
                    <DialogTitle>{project ? "Modifier le Projet" : "Nouveau Projet"}</DialogTitle>
                    <DialogDescription>
                        {project ? "Mettez à jour les informations du projet." : "Création d'un nouveau projet ou événement de formation."}
                    </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">

                        {/* Project Info */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Informations Projet</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="name"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Nom du projet / formation</FormLabel>
                                            <FormControl>
                                                <Input placeholder="Ex: Formation RGPD 2024" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="priority"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Priorité</FormLabel>
                                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                                                <FormControl>
                                                    <SelectTrigger>
                                                        <SelectValue placeholder="Sélectionner" />
                                                    </SelectTrigger>
                                                </FormControl>
                                                <SelectContent>
                                                    <SelectItem value="LOW">Basse</SelectItem>
                                                    <SelectItem value="MEDIUM">Moyenne</SelectItem>
                                                    <SelectItem value="HIGH">Haute</SelectItem>
                                                </SelectContent>
                                            </Select>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description</FormLabel>
                                        <FormControl>
                                            <Textarea placeholder="Objectifs de la formation, programme, etc..." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        {/* Planning & Team */}
                        <div className="space-y-4">
                            <h3 className="text-sm font-medium text-muted-foreground border-b pb-2">Planning & Équipe</h3>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={form.control}
                                    name="startDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Début</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Choisir une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={form.control}
                                    name="endDate"
                                    render={({ field }) => (
                                        <FormItem className="flex flex-col">
                                            <FormLabel>Deadline / Fin</FormLabel>
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <FormControl>
                                                        <Button
                                                            variant={"outline"}
                                                            className={cn(
                                                                "pl-3 text-left font-normal",
                                                                !field.value && "text-muted-foreground"
                                                            )}
                                                        >
                                                            {field.value ? (
                                                                format(field.value, "PPP", { locale: fr })
                                                            ) : (
                                                                <span>Choisir une date</span>
                                                            )}
                                                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                                        </Button>
                                                    </FormControl>
                                                </PopoverTrigger>
                                                <PopoverContent className="w-auto p-0" align="start">
                                                    <Calendar
                                                        mode="single"
                                                        selected={field.value}
                                                        onSelect={field.onChange}
                                                        initialFocus
                                                    />
                                                </PopoverContent>
                                            </Popover>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>

                            <FormField
                                control={form.control}
                                name="consultantIds"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Personnel assigné</FormLabel>
                                        <FormControl>
                                            <div className="border rounded-md p-2">
                                                <div className="flex flex-wrap gap-2 mb-2">
                                                    {field.value.map((id) => {
                                                        const consultant = consultants.find(c => c.id === id)
                                                        return (
                                                            <Badge key={id} variant="secondary" className="cursor-pointer" onClick={() => {
                                                                field.onChange(field.value.filter(v => v !== id))
                                                            }}>
                                                                {consultant?.name || id} ×
                                                            </Badge>
                                                        )
                                                    })}
                                                </div>
                                                <Popover>
                                                    <PopoverTrigger asChild>
                                                        <Button variant="outline" className="w-full justify-start text-muted-foreground">
                                                            + Ajouter du personnel
                                                        </Button>
                                                    </PopoverTrigger>
                                                    <PopoverContent className="p-0" align="start">
                                                        <Command>
                                                            <CommandInput placeholder="Rechercher..." />
                                                            <CommandList>
                                                                <CommandEmpty>Aucun personnel trouvé.</CommandEmpty>
                                                                <CommandGroup>
                                                                    {consultants.map((consultant) => (
                                                                        <CommandItem
                                                                            key={consultant.id}
                                                                            value={consultant.name || ""}
                                                                            onSelect={() => {
                                                                                // Prevent duplicates logic handled by includes check below usually, but toggle behavior desired
                                                                                if (field.value.includes(consultant.id)) {
                                                                                    field.onChange(field.value.filter(id => id !== consultant.id))
                                                                                } else {
                                                                                    field.onChange([...field.value, consultant.id])
                                                                                }
                                                                            }}
                                                                        >
                                                                            <Check
                                                                                className={cn(
                                                                                    "mr-2 h-4 w-4",
                                                                                    field.value.includes(consultant.id) ? "opacity-100" : "opacity-0"
                                                                                )}
                                                                            />
                                                                            {consultant.name}
                                                                        </CommandItem>
                                                                    ))}
                                                                </CommandGroup>
                                                            </CommandList>
                                                        </Command>
                                                    </PopoverContent>
                                                </Popover>
                                            </div>
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                        </div>

                        <DialogFooter>
                            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                                Annuler
                            </Button>
                            <Button type="submit" disabled={isPending}>
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                {project ? "Mettre à jour" : "Créer le projet"}
                            </Button>
                        </DialogFooter>
                    </form>
                </Form>
            </DialogContent>
        </Dialog>
    )
}
