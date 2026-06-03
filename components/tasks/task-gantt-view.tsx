'use client'

import { useState, useMemo } from "react"
import {
    ChevronLeft,
    ChevronRight,
    BarChart2,
    ZoomIn,
    ZoomOut,
    CalendarDays
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { format, addDays, differenceInDays, startOfDay, parseISO, isToday, eachDayOfInterval, addWeeks, subWeeks } from "date-fns"
import { fr } from "date-fns/locale"

interface TaskGanttViewProps {
    tasks: any[]
    onViewTask: (task: any) => void
}

const STATUS_COLORS: Record<string, { bar: string, text: string }> = {
    TODO: { bar: "bg-slate-400", text: "text-slate-700" },
    IN_PROGRESS: { bar: "bg-blue-500", text: "text-blue-700" },
    REVIEW: { bar: "bg-amber-500", text: "text-amber-700" },
    COMPLETED: { bar: "bg-green-500", text: "text-green-700" },
}

const PRIORITY_LABELS: Record<number, string> = { 1: 'Basse', 2: 'Moyenne', 3: 'Haute' }

export function TaskGanttView({ tasks, onViewTask }: TaskGanttViewProps) {
    const [startDate, setStartDate] = useState(() => {
        const d = new Date()
        d.setDate(d.getDate() - 3)
        return startOfDay(d)
    })
    const [zoom, setZoom] = useState(32) // px per day
    const daysShown = Math.floor(900 / zoom) // adapt to typical container width
    const days = Array.from({ length: Math.max(daysShown, 28) }, (_, i) => addDays(startDate, i))

    const prevWeek = () => setStartDate(d => subWeeks(d, 1))
    const nextWeek = () => setStartDate(d => addWeeks(d, 1))
    const goToday = () => { const d = new Date(); d.setDate(d.getDate() - 3); setStartDate(startOfDay(d)) }

    const zoomIn = () => setZoom(z => Math.min(z + 8, 80))
    const zoomOut = () => setZoom(z => Math.max(z - 8, 16))

    // Tasks that have a start or due date
    const ganttTasks = useMemo(() => {
        return tasks.map(task => {
            const start = task.startDate ? startOfDay(new Date(task.startDate)) : (task.createdAt ? startOfDay(new Date(task.createdAt)) : null)
            const end = task.dueDate ? startOfDay(new Date(task.dueDate)) : null
            return { ...task, _ganttStart: start, _ganttEnd: end }
        }).filter(t => t._ganttStart || t._ganttEnd)
    }, [tasks])

    const totalWidth = days.length * zoom
    const rowH = 44 // px per row

    const getBarStyle = (task: any) => {
        const rangeStart = startDate
        const rangeEnd = addDays(startDate, days.length - 1)

        let barStart = task._ganttStart || task._ganttEnd
        let barEnd = task._ganttEnd || task._ganttStart

        if (!barStart || barEnd < rangeStart || barStart > rangeEnd) return null

        const clampedStart = barStart < rangeStart ? rangeStart : barStart
        const clampedEnd = barEnd > rangeEnd ? rangeEnd : barEnd

        const offsetDays = differenceInDays(clampedStart, rangeStart)
        const durationDays = Math.max(1, differenceInDays(clampedEnd, clampedStart) + 1)

        return {
            left: offsetDays * zoom,
            width: durationDays * zoom - 4,
        }
    }

    // Group by project
    const projects = useMemo(() => {
        const map = new Map<string, { name: string, tasks: any[] }>()
        ganttTasks.forEach(t => {
            const pid = t.project?.id || 'none'
            if (!map.has(pid)) map.set(pid, { name: t.project?.name || 'Sans projet', tasks: [] })
            map.get(pid)!.tasks.push(t)
        })
        return Array.from(map.values())
    }, [ganttTasks])

    const today = startOfDay(new Date())
    const todayOffset = differenceInDays(today, startDate) * zoom

    return (
        <div className="flex flex-col gap-4">
            {/* Header controls */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-primary/10">
                        <BarChart2 className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                        <h2 className="text-xl font-bold">Diagramme de Gantt</h2>
                        <p className="text-xs text-muted-foreground">
                            {format(startDate, 'd MMM', { locale: fr })} — {format(addDays(startDate, days.length - 1), 'd MMM yyyy', { locale: fr })}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={goToday}>Aujourd'hui</Button>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={prevWeek}>
                            <ChevronLeft className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" onClick={nextWeek}>
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                    <div className="flex items-center border rounded-lg overflow-hidden">
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" title="Zoom -" onClick={zoomOut}>
                            <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" className="h-8 w-8 rounded-none" title="Zoom +" onClick={zoomIn}>
                            <ZoomIn className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            </div>

            {ganttTasks.length === 0 && (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground border rounded-xl bg-card">
                    <BarChart2 className="h-10 w-10 mb-3 opacity-20" />
                    <p className="text-sm font-medium">Aucune tâche avec date à afficher</p>
                    <p className="text-xs mt-1">Assignez des dates de début/fin à vos tâches</p>
                </div>
            )}

            {ganttTasks.length > 0 && (
                <div className="border rounded-xl overflow-hidden bg-card shadow-sm">
                    <div className="flex overflow-x-auto">
                        {/* Left: task list */}
                        <div className="flex-shrink-0 w-56 border-r bg-muted/10 z-10 shadow-sm">
                            {/* Header */}
                            <div className="h-14 flex items-center px-4 border-b bg-muted/20">
                                <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Tâche</span>
                            </div>
                            {projects.map((group, gi) => (
                                <div key={gi}>
                                    {/* Project group header */}
                                    <div className="px-3 py-2 bg-muted/30 border-b">
                                        <p className="text-xs font-bold text-muted-foreground truncate">{group.name}</p>
                                    </div>
                                    {group.tasks.map((task, ti) => (
                                        <div
                                            key={task.id}
                                            style={{ height: rowH }}
                                            className="flex items-center px-3 border-b cursor-pointer hover:bg-primary/5 transition-colors group"
                                            onClick={() => onViewTask(task)}
                                        >
                                            <div className={cn(
                                                "w-2 h-2 rounded-full flex-shrink-0 mr-2",
                                                STATUS_COLORS[task.status]?.bar || "bg-slate-400"
                                            )} />
                                            <div className="min-w-0">
                                                <p className="text-xs font-medium truncate group-hover:text-primary transition-colors">{task.title}</p>
                                                {task.assignees?.length > 0 && (
                                                    <p className="text-[10px] text-muted-foreground truncate">{task.assignees[0].name}</p>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ))}
                        </div>

                        {/* Right: timeline */}
                        <div className="flex-1 overflow-x-auto">
                            {/* Timeline header */}
                            <div className="h-14 border-b bg-muted/20 flex-shrink-0 sticky top-0 z-10">
                                <div className="flex" style={{ width: totalWidth }}>
                                    {days.map((day, i) => (
                                        <div
                                            key={i}
                                            style={{ width: zoom, flexShrink: 0 }}
                                            className={cn(
                                                "flex flex-col items-center justify-center border-r text-center py-1",
                                                isToday(day) && "bg-primary/10",
                                                day.getDay() === 0 || day.getDay() === 6 ? "bg-muted/40" : ""
                                            )}
                                        >
                                            {(i === 0 || day.getDate() === 1 || (zoom >= 28 && i % 7 === 0)) && (
                                                <span className="text-[9px] font-semibold text-muted-foreground uppercase leading-none">
                                                    {format(day, 'MMM', { locale: fr })}
                                                </span>
                                            )}
                                            <span className={cn(
                                                "text-[10px] font-medium leading-none mt-0.5",
                                                isToday(day) ? "text-primary font-bold" : "text-muted-foreground"
                                            )}>
                                                {zoom >= 24 ? format(day, 'd') : (i % 3 === 0 ? format(day, 'd') : '')}
                                            </span>
                                            {zoom >= 36 && (
                                                <span className="text-[8px] text-muted-foreground/60 leading-none">
                                                    {format(day, 'EEE', { locale: fr })}
                                                </span>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Bars area */}
                            <div style={{ width: totalWidth, position: 'relative' }}>
                                {/* Today line */}
                                {todayOffset >= 0 && todayOffset <= totalWidth && (
                                    <div
                                        style={{ left: todayOffset + zoom / 2, position: 'absolute', top: 0, bottom: 0, width: 2, zIndex: 5 }}
                                        className="bg-primary/70"
                                    />
                                )}

                                {/* Background weekend/today columns */}
                                <div className="flex absolute inset-0">
                                    {days.map((day, i) => (
                                        <div
                                            key={i}
                                            style={{ width: zoom, flexShrink: 0 }}
                                            className={cn(
                                                "border-r border-muted/40 h-full",
                                                isToday(day) && "bg-primary/5",
                                                (day.getDay() === 0 || day.getDay() === 6) && "bg-muted/20"
                                            )}
                                        />
                                    ))}
                                </div>

                                {/* Task bars */}
                                {projects.map((group, gi) => {
                                    let rows: any[] = []
                                    // Group header spacer
                                    rows.push(
                                        <div key={`gh-${gi}`} style={{ height: 29 }} className="border-b bg-muted/10" />
                                    )
                                    group.tasks.forEach((task: any, ti: number) => {
                                        const bar = getBarStyle(task)
                                        rows.push(
                                            <div key={task.id} style={{ height: rowH }} className="relative border-b flex items-center">
                                                {bar && (
                                                    <div
                                                        style={{ left: bar.left + 2, width: Math.max(bar.width, 8), height: rowH - 14, position: 'absolute' }}
                                                        className={cn(
                                                            "rounded-md flex items-center px-2 cursor-pointer transition-all hover:opacity-90 hover:shadow-md",
                                                            STATUS_COLORS[task.status]?.bar || "bg-slate-400"
                                                        )}
                                                        onClick={() => onViewTask(task)}
                                                        title={task.title}
                                                    >
                                                        {bar.width > 60 && (
                                                            <span className="text-white text-[10px] font-medium truncate">
                                                                {task.title}
                                                            </span>
                                                        )}
                                                    </div>
                                                )}
                                                {!bar && (
                                                    <div className="absolute inset-0 flex items-center justify-center">
                                                        <span className="text-[10px] text-muted-foreground italic">hors période</span>
                                                    </div>
                                                )}
                                            </div>
                                        )
                                    })
                                    return rows
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Legend */}
                    <div className="px-4 py-3 border-t bg-muted/10 flex flex-wrap gap-4">
                        {Object.entries(STATUS_COLORS).map(([s, c]) => (
                            <div key={s} className="flex items-center gap-1.5">
                                <div className={cn("w-3 h-3 rounded-sm", c.bar)} />
                                <span className="text-xs text-muted-foreground">
                                    {s === 'TODO' ? 'À faire' : s === 'IN_PROGRESS' ? 'En cours' : s === 'REVIEW' ? 'En revue' : 'Terminé'}
                                </span>
                            </div>
                        ))}
                        <div className="flex items-center gap-1.5 ml-auto">
                            <div className="w-3 h-3 rounded-sm bg-muted/50 border border-muted-foreground/30" />
                            <span className="text-xs text-muted-foreground">Week-end</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-0.5 h-3 bg-primary" />
                            <span className="text-xs text-muted-foreground">Aujourd'hui</span>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
