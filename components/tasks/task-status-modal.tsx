'use client'

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle, Trophy, PartyPopper } from "lucide-react"
import { updateTaskStatus } from "@/app/actions/tasks"
import { cn } from "@/lib/utils"

interface TaskStatusModalProps {
    task: any
    open: boolean
    onOpenChange: (open: boolean) => void
    currentUserId: string
    isDirector: boolean
}

const statuses = [
    { value: "TODO", label: "À faire", description: "La tâche est créée mais pas encore commencée.", color: "bg-slate-500/10 text-slate-500 border-slate-500/20" },
    { value: "IN_PROGRESS", label: "En cours", description: "Travail actif en cours sur cette tâche.", color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
    { value: "REVIEW", label: "Revue", description: "La tâche est terminée et en attente de validation.", color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
    { value: "COMPLETED", label: "Terminé", description: "La tâche est validée et clôturée.", color: "bg-green-500/10 text-green-500 border-green-500/20", directorOnly: true },
]

export function TaskStatusModal({ task, open, onOpenChange, currentUserId, isDirector }: TaskStatusModalProps) {
    const [isPending, setIsPending] = useState(false)
    const [selectedStatus, setSelectedStatus] = useState<string>(task?.status || "TODO")
    const [showCongrats, setShowCongrats] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Reset status when task changes
    useEffect(() => {
        if (task) {
            setSelectedStatus(task.status)
        }
    }, [task, open])

    async function handleSubmit() {
        if (!task) return
        setIsPending(true)
        setError(null)

        try {
            const result = await updateTaskStatus(task.id, selectedStatus)
            if (result.success) {
                if (selectedStatus === 'COMPLETED') {
                    setShowCongrats(true)
                    setTimeout(() => {
                        onOpenChange(false)
                        setShowCongrats(false)
                    }, 2500)
                } else {
                    onOpenChange(false)
                }
            } else {
                setError(result.error || "Erreur lors du changement de statut")
            }
        } catch (error) {
            console.error(error)
            setError("Une erreur est survenue")
        } finally {
            setIsPending(false)
        }
    }

    if (!task) return null

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o && !showCongrats) onOpenChange(o); }}>
            <DialogContent className="sm:max-w-md overflow-hidden">
                {showCongrats ? (
                    <div className="flex flex-col items-center justify-center py-10 space-y-4 text-center animate-in fade-in zoom-in-95 duration-500 relative">
                        {/* Festive Animations */}
                        <div className="absolute top-4 left-6 animate-bounce delay-100">
                            <PartyPopper className="h-6 w-6 text-blue-500 opacity-60" />
                        </div>
                        <div className="absolute top-8 right-8 animate-bounce delay-300">
                            <PartyPopper className="h-6 w-6 text-green-500 opacity-60" />
                        </div>
                        <div className="relative">
                            <div className="absolute inset-0 bg-green-500/20 rounded-full blur-xl animate-pulse scale-150" />
                            <Trophy className="h-20 w-20 text-yellow-500 relative z-10 animate-bounce duration-1000" />
                        </div>
                        <div className="space-y-2 relative z-10">
                            <h3 className="text-2xl font-bold text-foreground">Félicitations ! 🎉</h3>
                            <p className="text-muted-foreground text-sm max-w-xs px-2">
                                La tâche <strong className="text-foreground">{task.title}</strong> est maintenant terminée. Excellent travail !
                            </p>
                        </div>
                    </div>
                ) : (
                    <>
                        <DialogHeader>
                            <DialogTitle>Changer le statut</DialogTitle>
                            <DialogDescription>
                                Sélectionnez le nouveau statut pour la tâche <strong>{task.title}</strong>.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="py-4">
                            <RadioGroup value={selectedStatus} onValueChange={setSelectedStatus} className="grid grid-cols-1 gap-3">
                                {statuses.map((status) => {
                                    const isDisabled = status.directorOnly && !isDirector
                                    return (
                                        <div key={status.value}>
                                            <RadioGroupItem value={status.value} id={status.value} className="peer sr-only" disabled={isDisabled} />
                                            <Label
                                                htmlFor={status.value}
                                                className={cn(
                                                    "flex flex-col items-start justify-between rounded-md border-2 border-muted bg-popover p-4 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer transition-all",
                                                    selectedStatus === status.value ? "border-primary bg-primary/5" : "",
                                                    isDisabled ? "opacity-50 cursor-not-allowed" : ""
                                                )}
                                            >
                                                <div className="flex w-full items-center justify-between mb-1">
                                                    <span className="font-semibold">{status.label}</span>
                                                    {isDisabled && (
                                                        <span className="text-xs text-muted-foreground">Directeur uniquement</span>
                                                    )}
                                                </div>
                                                <span className="text-sm text-muted-foreground font-normal">
                                                    {status.description}
                                                </span>
                                            </Label>
                                        </div>
                                    )
                                })}
                            </RadioGroup>
                        </div>

                        {error && (
                            <div className="flex items-center gap-2 text-sm text-destructive bg-destructive/10 p-3 rounded-lg">
                                <AlertCircle className="h-4 w-4" />
                                {error}
                            </div>
                        )}

                        <DialogFooter>
                            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isPending}>
                                Annuler
                            </Button>
                            <Button
                                onClick={handleSubmit}
                                disabled={isPending || selectedStatus === task.status}
                            >
                                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                                Enregistrer
                            </Button>
                        </DialogFooter>
                    </>
                )}
            </DialogContent>
        </Dialog>
    )
}

