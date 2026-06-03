'use client'

import { useState } from "react"
import {
    ChevronLeft,
    ChevronRight,
    Circle,
    CalendarDays
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    isToday,
    parseISO
} from "date-fns"
import { fr } from "date-fns/locale"

interface TaskCalendarViewProps {
    tasks: any[]
    onViewTask: (task: any) => void
}

const STATUS_COLORS: Record<string, string> = {
    TODO: "bg-slate-400",
    IN_PROGRESS: "bg-blue-500",
    REVIEW: "bg-amber-500",
    COMPLETED: "bg-green-500",
}

const STATUS_BG: Record<string, string> = {
    TODO: "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300",
    IN_PROGRESS: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
    REVIEW: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300",
    COMPLETED: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300",
}

export function TaskCalendarView({ tasks, onViewTask }: TaskCalendarViewProps) {
    const [currentDate, setCurrentDate] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState<Date | null>(null)

    const monthStart = startOfMonth(currentDate)
    const monthEnd = endOfMonth(currentDate)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    const days = eachDayOfInterval({ start: calStart, end: calEnd })

    const prevMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
    const nextMonth = () => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
    const goToday = () => { setCurrentDate(new Date()); setSelectedDay(new Date()) }

    const getTasksForDay = (day: Date) =>
        tasks.filter(t => t.dueDate && isSameDay(new Date(t.dueDate), day))

    const selectedDayTasks = selectedDay ? getTasksForDay(selectedDay) : []

    const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']

    // Stats du mois
    const monthTasks = tasks.filter(t => {
        if (!t.dueDate) return false
        const d = new Date(t.dueDate)
        return d >= monthStart && d <= monthEnd
    })

    return (
        <div className="flex flex-col gap-4">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <CalendarDays className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold capitalize">
                            {format(currentDate, 'MMMM yyyy', { locale: fr })}
                        </h2>
                        <p className="text-xs text-muted-foreground">{monthTasks.length} tâches ce mois</p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToday}>Aujourd'hui</Button>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={prevMonth}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={nextMonth}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Calendar grid */}
                <div className="lg:col-span-2 border rounded-xl overflow-hidden bg-card shadow-sm">
                    {/* Day headers */}
                    <div className="grid grid-cols-7 border-b bg-muted/30">
                        {WEEKDAYS.map(d => (
                            <div key={d} className="py-2 text-center text-xs font-semibold text-muted-foreground">
                                {d}
                            </div>
                        ))}
                    </div>

                    {/* Days grid */}
                    <div className="grid grid-cols-7">
                        {days.map((day, idx) => {
                            const dayTasks = getTasksForDay(day)
                            const isCurrentMonth = isSameMonth(day, currentDate)
                            const isSelected = selectedDay && isSameDay(day, selectedDay)
                            const todayDay = isToday(day)

                            return (
                                <div
                                    key={idx}
                                    onClick={() => setSelectedDay(day)}
                                    className={cn(
                                        "min-h-[80px] p-1.5 border-b border-r cursor-pointer transition-colors",
                                        !isCurrentMonth && "opacity-40 bg-muted/20",
                                        isSelected && "bg-primary/5 ring-1 ring-inset ring-primary/30",
                                        !isSelected && isCurrentMonth && "hover:bg-muted/30",
                                    )}
                                >
                                    <div className={cn(
                                        "h-6 w-6 flex items-center justify-center text-xs font-medium rounded-full mb-1 mx-auto",
                                        todayDay && "bg-primary text-primary-foreground font-bold",
                                        !todayDay && "text-foreground"
                                    )}>
                                        {format(day, 'd')}
                                    </div>

                                    <div className="space-y-0.5">
                                        {dayTasks.slice(0, 2).map(task => (
                                            <div
                                                key={task.id}
                                                onClick={(e) => { e.stopPropagation(); onViewTask(task) }}
                                                className={cn(
                                                    "text-[10px] px-1.5 py-0.5 rounded font-medium truncate cursor-pointer hover:opacity-80 transition-opacity",
                                                    STATUS_BG[task.status] || STATUS_BG.TODO
                                                )}
                                                title={task.title}
                                            >
                                                {task.title}
                                            </div>
                                        ))}
                                        {dayTasks.length > 2 && (
                                            <div className="text-[10px] text-muted-foreground px-1">
                                                +{dayTasks.length - 2} autres
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </div>

                {/* Side panel */}
                <div className="border rounded-xl overflow-hidden bg-card shadow-sm flex flex-col">
                    <div className="p-4 border-b bg-muted/20">
                        <p className="font-semibold text-sm">
                            {selectedDay
                                ? format(selectedDay, "EEEE d MMMM", { locale: fr })
                                : "Sélectionnez une date"}
                        </p>
                        {selectedDay && (
                            <p className="text-xs text-muted-foreground mt-0.5">
                                {selectedDayTasks.length} tâche{selectedDayTasks.length !== 1 ? 's' : ''}
                            </p>
                        )}
                    </div>

                    <div className="flex-1 overflow-y-auto p-4">
                        {!selectedDay && (
                            <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                                <CalendarDays className="h-8 w-8 mb-2 opacity-30" />
                                <p className="text-xs">Cliquez sur un jour pour voir les tâches</p>
                            </div>
                        )}
                        {selectedDay && selectedDayTasks.length === 0 && (
                            <div className="flex flex-col items-center justify-center h-32 text-center text-muted-foreground">
                                <Circle className="h-8 w-8 mb-2 opacity-20" />
                                <p className="text-xs">Aucune tâche ce jour</p>
                            </div>
                        )}
                        <div className="space-y-3">
                            {selectedDayTasks.map(task => (
                                <div
                                    key={task.id}
                                    className="p-3 border rounded-lg hover:bg-muted/30 cursor-pointer transition-colors group"
                                    onClick={() => onViewTask(task)}
                                >
                                    <div className="flex items-start gap-2">
                                        <div className={cn("w-2 h-2 rounded-full mt-1.5 flex-shrink-0", STATUS_COLORS[task.status] || "bg-slate-400")} />
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium truncate group-hover:text-primary transition-colors">
                                                {task.title}
                                            </p>
                                            {task.project?.name && (
                                                <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                                    {task.project.name}
                                                </p>
                                            )}
                                            <div className="flex items-center gap-1 mt-1.5">
                                                <Badge variant="outline" className={cn("text-[10px] px-1.5 py-0", STATUS_BG[task.status])}>
                                                    {task.status === 'TODO' ? 'À faire' :
                                                        task.status === 'IN_PROGRESS' ? 'En cours' :
                                                            task.status === 'REVIEW' ? 'En revue' : 'Terminé'}
                                                </Badge>
                                                {task.priority >= 3 && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-red-50 text-red-600 dark:bg-red-900/20">
                                                        Haute
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Month summary */}
                    <div className="p-4 border-t bg-muted/10">
                        <p className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wide">Ce mois</p>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { label: 'À faire', status: 'TODO', color: 'bg-slate-500' },
                                { label: 'En cours', status: 'IN_PROGRESS', color: 'bg-blue-500' },
                                { label: 'En revue', status: 'REVIEW', color: 'bg-amber-500' },
                                { label: 'Terminé', status: 'COMPLETED', color: 'bg-green-500' },
                            ].map(s => {
                                const count = monthTasks.filter(t => t.status === s.status).length
                                return (
                                    <div key={s.status} className="flex items-center gap-1.5">
                                        <div className={cn("w-2 h-2 rounded-full flex-shrink-0", s.color)} />
                                        <span className="text-xs text-muted-foreground">{s.label}</span>
                                        <span className="text-xs font-bold ml-auto">{count}</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
