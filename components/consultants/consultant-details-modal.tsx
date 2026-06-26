'use client'

import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { getInitials } from "@/lib/utils"
import { Briefcase, Mail, Phone, MapPin, Calendar, Building, GraduationCap, CheckCircle2, Edit } from "lucide-react"
import { Button } from "@/components/ui/button"

interface ConsultantDetailsModalProps {
    consultant: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit?: (consultant: any) => void
}

export function ConsultantDetailsModal({ consultant, open, onOpenChange, onEdit }: ConsultantDetailsModalProps) {
    if (!consultant) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl max-h-[90vh] flex flex-col p-0 overflow-hidden">
                <DialogHeader className="p-4 sm:p-6 pb-2">
                    <div className="flex flex-col sm:flex-row items-start gap-4">
                        <Avatar className="h-16 w-16 sm:h-20 sm:w-20 border-4 border-background shadow-md shrink-0">
                            <AvatarImage src={consultant.avatar} />
                            <AvatarFallback className="text-lg sm:text-xl">{getInitials(consultant.name)}</AvatarFallback>
                        </Avatar>
                        <div className="space-y-1 w-full sm:w-auto">
                            <DialogTitle className="text-xl sm:text-2xl font-bold">{consultant.name}</DialogTitle>
                            <DialogDescription className="flex flex-col gap-1">
                                <span className="flex items-center gap-1.5 text-foreground font-medium text-sm sm:text-base">
                                    <Briefcase className="h-4 w-4 shrink-0" />
                                    {consultant.title || "Consultant"}
                                </span>
                                <span className="flex flex-col sm:flex-row items-start sm:items-center gap-1 sm:gap-3 text-sm">
                                    <span className="flex items-center gap-1">
                                        <Mail className="h-3.5 w-3.5 shrink-0" /> {consultant.email}
                                    </span>
                                    {consultant.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="h-3.5 w-3.5 shrink-0" /> {consultant.phone}
                                        </span>
                                    )}
                                </span>
                            </DialogDescription>
                        </div>
                        <div className="flex sm:flex-col items-center sm:items-end gap-2 w-full sm:w-auto sm:ml-auto">
                            <div className="flex items-center gap-2 sm:flex-col sm:items-end">
                                <Badge variant="outline" className="text-xs sm:text-sm px-2 sm:px-3 py-1">
                                    {consultant.level}
                                </Badge>
                                {consultant.rating > 0 && (
                                    <Badge variant="secondary" className="bg-amber-100 text-amber-800 hover:bg-amber-100 text-xs sm:text-sm">
                                        ★ {consultant.rating.toFixed(1)}
                                    </Badge>
                                )}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                className="flex items-center gap-2 whitespace-nowrap h-8 sm:h-9 px-2 sm:px-3"
                                onClick={() => {
                                    onOpenChange(false)
                                    onEdit?.(consultant)
                                }}
                            >
                                <Edit className="h-4 w-4 shrink-0" />
                                <span className="sm:hidden"></span>
                                Modifier
                            </Button>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="overview" className="flex-1 flex flex-col overflow-hidden">
                    <div className="px-6 pt-2">
                        <TabsList className="w-fit items-center rounded-md bg-muted p-1 text-muted-foreground flex flex-wrap justify-start h-auto gap-2 mb-6">
                            <TabsTrigger value="overview">
                                Vue d'ensemble
                            </TabsTrigger>
                            <TabsTrigger value="cv">
                                CV & Parcours
                            </TabsTrigger>
                            <TabsTrigger value="tasks">
                                Tâches ({consultant._count?.assignedTasks || 0})
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    <ScrollArea className="flex-1 p-6">
                        <TabsContent value="overview" className="mt-0 space-y-6">
                            {/* Stats Grid */}
                            <div className="grid grid-cols-3 gap-4">
                                <div className="p-4 rounded-lg bg-muted/30 border text-center">
                                    <div className="text-sm text-muted-foreground mb-1">Projets</div>
                                    <div className="text-2xl font-bold">{consultant._count?.consultingProjects || 0}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30 border text-center">
                                    <div className="text-sm text-muted-foreground mb-1">Tâches</div>
                                    <div className="text-2xl font-bold">{consultant._count?.assignedTasks || 0}</div>
                                </div>
                                <div className="p-4 rounded-lg bg-muted/30 border text-center">
                                    <div className="text-sm text-muted-foreground mb-1">Salaire Mensuel</div>
                                    <div className="text-2xl font-bold">{Number(consultant.monthlySalary) || 0} FCFA</div>
                                </div>
                            </div>

                            {/* Bio */}
                            {consultant.description && (
                                <div className="space-y-2">
                                    <h3 className="font-semibold text-sm">À propos</h3>
                                    <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-wrap">
                                        {consultant.description}
                                    </p>
                                </div>
                            )}

                            {/* Skills */}
                            <div className="space-y-2">
                                <h3 className="font-semibold text-sm">Compétences</h3>
                                <div className="flex flex-wrap gap-2">
                                    {Array.isArray(consultant.skills) && consultant.skills.length > 0 ? (
                                        consultant.skills.map((skill: string, i: number) => (
                                            <Badge key={i} variant="secondary" className="font-normal">
                                                {skill}
                                            </Badge>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Aucune compétence renseignée</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="cv" className="mt-0 space-y-8">
                            {/* Experience */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <Briefcase className="h-4 w-4" /> Expérience Professionnelle
                                </h3>
                                <div className="relative border-l-2 ml-2 pl-6 space-y-6">
                                    {Array.isArray(consultant.experience) && consultant.experience.length > 0 ? (
                                        consultant.experience.map((exp: any, i: number) => (
                                            <div key={i} className="relative">
                                                <div className="absolute -left-[31px] top-1 h-3 w-3 rounded-full bg-primary border-2 border-background" />
                                                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-baseline gap-1">
                                                    <h4 className="font-medium text-sm">{exp.title}</h4>
                                                    <span className="text-xs text-muted-foreground">{exp.duration}</span>
                                                </div>
                                                <div className="text-sm text-primary/80 font-medium">{exp.company}</div>
                                                {exp.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{exp.description}</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic pl-2">Aucune expérience renseignée</p>
                                    )}
                                </div>
                            </div>

                            {/* Education */}
                            <div className="space-y-4">
                                <h3 className="font-semibold flex items-center gap-2">
                                    <GraduationCap className="h-4 w-4" /> Formation
                                </h3>
                                <div className="space-y-3">
                                    {Array.isArray(consultant.education) && consultant.education.length > 0 ? (
                                        consultant.education.map((edu: any, i: number) => (
                                            <div key={i} className="flex items-start gap-3 p-3 rounded-lg border bg-muted/10">
                                                <div className="bg-background p-2 rounded-full border shadow-sm mt-0.5">
                                                    <Building className="h-4 w-4 text-muted-foreground" />
                                                </div>
                                                <div>
                                                    <h4 className="font-medium text-sm">{edu.school}</h4>
                                                    <div className="text-sm text-muted-foreground">{edu.degree}</div>
                                                    <div className="text-xs text-muted-foreground mt-0.5">{edu.year}</div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <p className="text-sm text-muted-foreground italic">Aucune formation renseignée</p>
                                    )}
                                </div>
                            </div>
                        </TabsContent>

                        <TabsContent value="tasks" className="mt-0">
                            <div className="space-y-2">
                                <div className="text-sm text-muted-foreground mb-4">
                                    Tâches assignées ({consultant.assignedTasks?.length || 0})
                                </div>
                                {/* Task list preview - simplified */}
                                {consultant.assignedTasks?.length > 0 ? (
                                    consultant.assignedTasks.map((task: any) => (
                                        <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/30 transition-colors">
                                            <div className={`h-2 w-2 rounded-full ${task.status === 'COMPLETED' ? 'bg-green-500' : 'bg-slate-300'}`} />
                                            <div className="flex-1 min-w-0">
                                                <div className="font-medium text-sm truncate">{task.title}</div>
                                                <div className="text-xs text-muted-foreground truncate">{task.project?.name || "Projet inconnu"}</div>
                                            </div>
                                            {task.status === 'COMPLETED' ? (
                                                <Badge variant="outline" className="text-green-600 bg-green-50 border-green-200">Terminé</Badge>
                                            ) : (
                                                <Badge variant="outline">{task.status}</Badge>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground bg-muted/10 rounded-lg">
                                        Aucune tâche assignée
                                    </div>
                                )}
                            </div>
                        </TabsContent>
                    </ScrollArea>
                </Tabs>
            </DialogContent>
        </Dialog>
    )
}
