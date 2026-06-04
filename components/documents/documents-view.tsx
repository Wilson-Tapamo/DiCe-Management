'use client'

import { useMemo, useState } from 'react'
import {
    ChevronRight,
    Download,
    File,
    FileImage,
    FileText,
    Folder,
    FolderOpen,
    Grid3X3,
    List,
    MessageSquare,
    Paperclip,
    Search,
    SlidersHorizontal,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { DocumentCategory, DocumentItem } from '@/app/actions/documents'

type ViewMode = 'grid' | 'list'
type TreeSelection =
    | { type: 'all' }
    | { type: 'project'; projectId: string }
    | { type: 'task'; projectId: string; taskId: string }
    | { type: 'folder'; projectId: string; taskId: string; category: DocumentCategory }

interface DocumentsViewProps {
    initialDocuments: DocumentItem[]
    projects: { id: string; name: string }[]
}

function formatFileSize(bytes: number) {
    if (bytes < 1024) return `${bytes} o`
    if (bytes < 1048576) return `${(bytes / 1024).toFixed(1)} Ko`
    return `${(bytes / 1048576).toFixed(1)} Mo`
}

function getFileIcon(name: string, mimeType?: string) {
    const lower = name.toLowerCase()
    if (
        mimeType?.startsWith('image/') ||
        /\.(png|jpe?g|gif|webp|svg)$/i.test(lower)
    ) {
        return FileImage
    }
    if (/\.(pdf|docx?|txt|xlsx?)$/i.test(lower)) return FileText
    return File
}

function downloadFile(doc: DocumentItem) {
    const a = document.createElement('a')
    a.href = doc.fileUrl
    a.download = doc.fileName
    a.target = '_blank'
    a.rel = 'noopener noreferrer'
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
}

export function DocumentsView({ initialDocuments, projects }: DocumentsViewProps) {
    const [documents] = useState(initialDocuments)
    const [viewMode, setViewMode] = useState<ViewMode>('grid')
    const [search, setSearch] = useState('')
    const [filterProject, setFilterProject] = useState<string>('all')
    const [filterCategory, setFilterCategory] = useState<string>('all')
    const [selection, setSelection] = useState<TreeSelection>({ type: 'all' })
    const [expandedProjects, setExpandedProjects] = useState<Set<string>>(new Set())
    const [expandedTasks, setExpandedTasks] = useState<Set<string>>(new Set())

    const tree = useMemo(() => {
        const map = new Map<
            string,
            {
                name: string
                tasks: Map<
                    string,
                    { title: string; tache: DocumentItem[]; commentaire: DocumentItem[] }
                >
            }
        >()
        for (const doc of documents) {
            if (!map.has(doc.projectId)) {
                map.set(doc.projectId, { name: doc.projectName, tasks: new Map() })
            }
            const project = map.get(doc.projectId)!
            if (!project.tasks.has(doc.taskId)) {
                project.tasks.set(doc.taskId, {
                    title: doc.taskTitle,
                    tache: [],
                    commentaire: [],
                })
            }
            const task = project.tasks.get(doc.taskId)!
            task[doc.category].push(doc)
        }
        return map
    }, [documents])

    const filteredDocuments = useMemo(() => {
        let list = documents

        if (filterProject !== 'all') {
            list = list.filter((d) => d.projectId === filterProject)
        }
        if (filterCategory !== 'all') {
            list = list.filter((d) => d.category === filterCategory)
        }
        if (search.trim()) {
            const q = search.trim().toLowerCase()
            list = list.filter(
                (d) =>
                    d.fileName.toLowerCase().includes(q) ||
                    d.projectName.toLowerCase().includes(q) ||
                    d.taskTitle.toLowerCase().includes(q)
            )
        }

        if (selection.type === 'project') {
            list = list.filter((d) => d.projectId === selection.projectId)
        } else if (selection.type === 'task') {
            list = list.filter(
                (d) =>
                    d.projectId === selection.projectId && d.taskId === selection.taskId
            )
        } else if (selection.type === 'folder') {
            list = list.filter(
                (d) =>
                    d.projectId === selection.projectId &&
                    d.taskId === selection.taskId &&
                    d.category === selection.category
            )
        }

        return list
    }, [documents, filterProject, filterCategory, search, selection])

    const breadcrumbs = useMemo(() => {
        const crumbs: { label: string; sel: TreeSelection }[] = [
            { label: 'Documents', sel: { type: 'all' } },
        ]
        if (selection.type === 'all') return crumbs

        const projectName =
            projects.find((p) => p.id === (selection as { projectId: string }).projectId)
                ?.name ||
            documents.find((d) => d.projectId === (selection as { projectId: string }).projectId)
                ?.projectName ||
            'Projet'

        crumbs.push({
            label: projectName,
            sel: { type: 'project', projectId: (selection as { projectId: string }).projectId },
        })

        if (selection.type === 'task' || selection.type === 'folder') {
            const taskTitle =
                documents.find(
                    (d) =>
                        d.taskId === (selection as { taskId: string }).taskId &&
                        d.projectId === (selection as { projectId: string }).projectId
                )?.taskTitle || 'Tâche'
            crumbs.push({
                label: taskTitle,
                sel: {
                    type: 'task',
                    projectId: (selection as { projectId: string }).projectId,
                    taskId: (selection as { taskId: string }).taskId,
                },
            })
        }

        if (selection.type === 'folder') {
            crumbs.push({
                label: selection.category === 'tache' ? 'Tâches' : 'Commentaires',
                sel: selection,
            })
        }

        return crumbs
    }, [selection, projects, documents])

    const toggleProject = (id: string) => {
        setExpandedProjects((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    const toggleTask = (id: string) => {
        setExpandedTasks((prev) => {
            const next = new Set(prev)
            if (next.has(id)) next.delete(id)
            else next.add(id)
            return next
        })
    }

    return (
        <div className="flex flex-col h-[calc(100vh-8rem)] min-h-[520px] rounded-2xl border border-slate-200/80 bg-[#f5f5f7] overflow-hidden shadow-sm dark:border-slate-700 dark:bg-slate-900/50">
            {/* Toolbar — style Finder */}
            <div className="flex items-center gap-2 px-4 py-2.5 bg-[#ebebed]/90 border-b border-slate-200/60 backdrop-blur-sm dark:bg-slate-800/90 dark:border-slate-700">
                <div className="flex items-center gap-1 text-sm text-slate-600 dark:text-slate-300 flex-wrap min-w-0 flex-1">
                    {breadcrumbs.map((crumb, i) => (
                        <span key={i} className="flex items-center gap-1 shrink-0">
                            {i > 0 && <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                            <button
                                type="button"
                                onClick={() => setSelection(crumb.sel)}
                                className={cn(
                                    'hover:underline truncate max-w-[140px] sm:max-w-none',
                                    i === breadcrumbs.length - 1 && 'font-semibold text-slate-900 dark:text-white'
                                )}
                            >
                                {crumb.label}
                            </button>
                        </span>
                    ))}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                    <div className="relative hidden sm:block w-44 lg:w-56">
                        <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher…"
                            className="h-8 pl-8 text-xs bg-white/80 border-slate-200 dark:bg-slate-900/80"
                        />
                    </div>
                    <Select value={filterProject} onValueChange={setFilterProject}>
                        <SelectTrigger className="h-8 w-[130px] text-xs bg-white/80 hidden md:flex">
                            <SelectValue placeholder="Projet" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous les projets</SelectItem>
                            {projects.map((p) => (
                                <SelectItem key={p.id} value={p.id}>
                                    {p.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Select value={filterCategory} onValueChange={setFilterCategory}>
                        <SelectTrigger className="h-8 w-[120px] text-xs bg-white/80 hidden lg:flex">
                            <SlidersHorizontal className="h-3 w-3 mr-1 opacity-60" />
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="tache">Tâches</SelectItem>
                            <SelectItem value="commentaire">Commentaires</SelectItem>
                        </SelectContent>
                    </Select>
                    <div className="flex rounded-lg border border-slate-200/80 bg-white/60 p-0.5 dark:border-slate-600 dark:bg-slate-800/60">
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn('h-7 w-7', viewMode === 'grid' && 'bg-white shadow-sm dark:bg-slate-700')}
                            onClick={() => setViewMode('grid')}
                        >
                            <Grid3X3 className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className={cn('h-7 w-7', viewMode === 'list' && 'bg-white shadow-sm dark:bg-slate-700')}
                            onClick={() => setViewMode('list')}
                        >
                            <List className="h-3.5 w-3.5" />
                        </Button>
                    </div>
                </div>
            </div>

            <div className="flex flex-1 min-h-0">
                {/* Sidebar — arborescence */}
                <aside className="w-52 lg:w-60 shrink-0 border-r border-slate-200/60 bg-[#fafafa]/95 overflow-y-auto dark:border-slate-700 dark:bg-slate-900/40 hidden sm:block">
                    <div className="p-2 space-y-0.5 text-[13px]">
                        <button
                            type="button"
                            onClick={() => setSelection({ type: 'all' })}
                            className={cn(
                                'w-full flex items-center gap-2 px-2 py-1.5 rounded-md text-left',
                                selection.type === 'all'
                                    ? 'bg-blue-500/15 text-blue-700 dark:text-blue-300'
                                    : 'hover:bg-slate-200/60 dark:hover:bg-slate-800'
                            )}
                        >
                            <FolderOpen className="h-4 w-4 shrink-0 text-blue-500" />
                            <span className="truncate font-medium">Tous les fichiers</span>
                        </button>

                        {Array.from(tree.entries()).map(([projectId, project]) => {
                            const isExpanded = expandedProjects.has(projectId)
                            const isProjectSelected =
                                selection.type === 'project' && selection.projectId === projectId

                            return (
                                <div key={projectId}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            toggleProject(projectId)
                                            setSelection({ type: 'project', projectId })
                                        }}
                                        className={cn(
                                            'w-full flex items-center gap-1.5 px-2 py-1.5 rounded-md text-left',
                                            isProjectSelected &&
                                                selection.type === 'project' &&
                                                'bg-blue-500/15 text-blue-700 dark:text-blue-300',
                                            !isProjectSelected && 'hover:bg-slate-200/60 dark:hover:bg-slate-800'
                                        )}
                                    >
                                        <ChevronRight
                                            className={cn(
                                                'h-3.5 w-3.5 shrink-0 transition-transform',
                                                isExpanded && 'rotate-90'
                                            )}
                                        />
                                        {isExpanded ? (
                                            <FolderOpen className="h-4 w-4 shrink-0 text-amber-500" />
                                        ) : (
                                            <Folder className="h-4 w-4 shrink-0 text-amber-500" />
                                        )}
                                        <span className="truncate">{project.name}</span>
                                    </button>

                                    {isExpanded &&
                                        Array.from(project.tasks.entries()).map(([taskId, task]) => {
                                            const taskKey = `${projectId}-${taskId}`
                                            const taskExpanded = expandedTasks.has(taskKey)
                                            const hasTache = task.tache.length > 0
                                            const hasComment = task.commentaire.length > 0

                                            return (
                                                <div key={taskId} className="ml-4">
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            toggleTask(taskKey)
                                                            setSelection({
                                                                type: 'task',
                                                                projectId,
                                                                taskId,
                                                            })
                                                        }}
                                                        className={cn(
                                                            'w-full flex items-center gap-1.5 px-2 py-1 rounded-md text-left text-slate-700 dark:text-slate-300',
                                                            selection.type === 'task' &&
                                                                selection.taskId === taskId &&
                                                                'bg-slate-200/70 dark:bg-slate-800',
                                                            'hover:bg-slate-200/50 dark:hover:bg-slate-800/80'
                                                        )}
                                                    >
                                                        <ChevronRight
                                                            className={cn(
                                                                'h-3 w-3 shrink-0 transition-transform',
                                                                taskExpanded && 'rotate-90'
                                                            )}
                                                        />
                                                        <Folder className="h-3.5 w-3.5 shrink-0 text-sky-500" />
                                                        <span className="truncate">{task.title}</span>
                                                    </button>

                                                    {taskExpanded && (
                                                        <div className="ml-5 space-y-0.5">
                                                            {hasTache && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setSelection({
                                                                            type: 'folder',
                                                                            projectId,
                                                                            taskId,
                                                                            category: 'tache',
                                                                        })
                                                                    }
                                                                    className={cn(
                                                                        'w-full flex items-center gap-2 px-2 py-1 rounded-md text-left',
                                                                        selection.type === 'folder' &&
                                                                            selection.category === 'tache' &&
                                                                            selection.taskId === taskId &&
                                                                            'bg-blue-500/10 text-blue-600',
                                                                        'hover:bg-slate-200/50 dark:hover:bg-slate-800'
                                                                    )}
                                                                >
                                                                    <Paperclip className="h-3.5 w-3.5" />
                                                                    <span>Tâches ({task.tache.length})</span>
                                                                </button>
                                                            )}
                                                            {hasComment && (
                                                                <button
                                                                    type="button"
                                                                    onClick={() =>
                                                                        setSelection({
                                                                            type: 'folder',
                                                                            projectId,
                                                                            taskId,
                                                                            category: 'commentaire',
                                                                        })
                                                                    }
                                                                    className={cn(
                                                                        'w-full flex items-center gap-2 px-2 py-1 rounded-md text-left',
                                                                        selection.type === 'folder' &&
                                                                            selection.category === 'commentaire' &&
                                                                            selection.taskId === taskId &&
                                                                            'bg-blue-500/10 text-blue-600',
                                                                        'hover:bg-slate-200/50 dark:hover:bg-slate-800'
                                                                    )}
                                                                >
                                                                    <MessageSquare className="h-3.5 w-3.5" />
                                                                    <span>
                                                                        Commentaires ({task.commentaire.length})
                                                                    </span>
                                                                </button>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            )
                                        })}
                                </div>
                            )
                        })}
                    </div>
                </aside>

                {/* Zone principale */}
                <main className="flex-1 overflow-y-auto p-4 bg-white/40 dark:bg-slate-950/20">
                    <div className="sm:hidden mb-3">
                        <Input
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Rechercher un fichier…"
                            className="h-9 text-sm"
                        />
                    </div>

                    {filteredDocuments.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full min-h-[200px] text-slate-500">
                            <Folder className="h-12 w-12 mb-3 opacity-30" />
                            <p className="text-sm">Aucun document dans ce dossier</p>
                        </div>
                    ) : viewMode === 'grid' ? (
                        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                            {filteredDocuments.map((doc) => {
                                const Icon = getFileIcon(doc.fileName, doc.mimeType)
                                return (
                                    <div
                                        key={doc.id}
                                        className="group flex flex-col items-center p-4 rounded-xl bg-white/90 border border-slate-200/50 shadow-sm hover:shadow-md hover:border-blue-200/60 transition-all dark:bg-slate-800/80 dark:border-slate-700"
                                    >
                                        <div className="h-14 w-14 flex items-center justify-center rounded-lg bg-gradient-to-b from-slate-50 to-slate-100 mb-2 dark:from-slate-700 dark:to-slate-800">
                                            <Icon className="h-8 w-8 text-blue-500" />
                                        </div>
                                        <p className="text-xs font-medium text-center line-clamp-2 w-full px-1">
                                            {doc.fileName}
                                        </p>
                                        <p className="text-[10px] text-slate-500 mt-0.5">
                                            {formatFileSize(doc.fileSize)}
                                        </p>
                                        <Button
                                            type="button"
                                            size="sm"
                                            variant="secondary"
                                            className="mt-2 h-7 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
                                            onClick={() => downloadFile(doc)}
                                        >
                                            <Download className="h-3 w-3 mr-1" />
                                            Télécharger
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    ) : (
                        <div className="rounded-xl border border-slate-200/60 bg-white/90 overflow-hidden dark:border-slate-700 dark:bg-slate-800/50">
                            <div className="grid grid-cols-[1fr_100px_120px_90px] gap-2 px-4 py-2 text-[11px] font-semibold uppercase tracking-wide text-slate-500 border-b bg-slate-50/80 dark:bg-slate-900/50">
                                <span>Nom</span>
                                <span className="hidden md:block">Taille</span>
                                <span className="hidden lg:block">Emplacement</span>
                                <span />
                            </div>
                            {filteredDocuments.map((doc) => {
                                const Icon = getFileIcon(doc.fileName, doc.mimeType)
                                return (
                                    <div
                                        key={doc.id}
                                        className="grid grid-cols-[1fr_100px_120px_90px] gap-2 px-4 py-2.5 items-center border-b border-slate-100 last:border-0 hover:bg-blue-50/40 dark:hover:bg-slate-800/60 text-sm"
                                    >
                                        <div className="flex items-center gap-2 min-w-0">
                                            <Icon className="h-4 w-4 shrink-0 text-blue-500" />
                                            <div className="min-w-0">
                                                <p className="font-medium truncate">{doc.fileName}</p>
                                                <p className="text-xs text-slate-500 md:hidden">
                                                    {formatFileSize(doc.fileSize)}
                                                </p>
                                            </div>
                                        </div>
                                        <span className="text-xs text-slate-500 hidden md:block">
                                            {formatFileSize(doc.fileSize)}
                                        </span>
                                        <span className="text-xs text-slate-500 truncate hidden lg:block">
                                            {doc.projectName} / {doc.taskTitle}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 justify-self-end"
                                            onClick={() => downloadFile(doc)}
                                        >
                                            <Download className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )
                            })}
                        </div>
                    )}

                    <p className="mt-4 text-xs text-slate-500 text-center">
                        {filteredDocuments.length} fichier
                        {filteredDocuments.length !== 1 ? 's' : ''}
                    </p>
                </main>
            </div>
        </div>
    )
}
