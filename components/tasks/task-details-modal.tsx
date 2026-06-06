'use client'

import { useState, useRef, useEffect } from "react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"
import {
    Calendar,
    CheckCircle2,
    Circle,
    Clock,
    MessageSquare,
    Paperclip,
    Send,
    User,
    X,
    FileText,
    MoreVertical,
    Edit,
    Upload,
    File,
    ImageIcon,
    Trash,
    Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { getInitials } from "@/lib/utils"
import { addComment, toggleSubtask, getComments } from "@/app/actions/tasks"
import { uploadFile } from "@/lib/upload-client"
import { FileAttachmentItem } from "./file-attachment-item"
// import { Comment } from "@prisma/client" // Avoid direct import if possible, use any

interface TaskDetailsModalProps {
    task: any
    open: boolean
    onOpenChange: (open: boolean) => void
    onEdit: (task: any) => void
    currentUser: any
}

export function TaskDetailsModal({ task, open, onOpenChange, onEdit, currentUser }: TaskDetailsModalProps) {
    const [newComment, setNewComment] = useState("")
    const [isSending, setIsSending] = useState(false)
    const [comments, setComments] = useState<any[]>([])
    const [loadingComments, setLoadingComments] = useState(false)
    const [commentFiles, setCommentFiles] = useState<{ url: string, name: string, size: number }[]>([])
    const [isUploadingComment, setIsUploadingComment] = useState(false)
    const commentFileRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        if (open && task?.id) {
            setLoadingComments(true)
            getComments(task.id).then(res => {
                if (res.success && res.data) {
                    setComments(res.data)
                }
                setLoadingComments(false)
            })
        }
    }, [open, task?.id])

    const handleSendComment = async () => {
        if (!newComment.trim() && commentFiles.length === 0) return
        setIsSending(true)
        try {
            const attachments = commentFiles.length > 0 ? commentFiles : undefined
            const res = await addComment(task.id, newComment, attachments)
            if (res.success) {
                setNewComment("")
                setCommentFiles([])
                const user = {
                    id: currentUser.id,
                    name: currentUser.name,
                    avatar: currentUser.avatar
                }
                setComments([...comments, {
                    id: `temp-${Date.now()}`,
                    content: newComment,
                    attachments,
                    createdAt: new Date(),
                    user
                }])
                getComments(task.id).then(r => r.success && r.data && setComments(r.data))
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSending(false)
        }
    }

    const handleCommentFileUpload = async (files: FileList) => {
        setIsUploadingComment(true)
        for (const file of Array.from(files)) {
            try {
                const data = await uploadFile(file, {
                    projectId: task.projectId || task.project?.id,
                    taskId: task.id,
                    category: 'commentaire',
                })
                setCommentFiles(prev => [...prev, { url: data.url, name: data.name, size: data.size }])
            } catch (err) {
                console.error(err)
            }
        }
        setIsUploadingComment(false)
    }

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return bytes + ' o'
        if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' Ko'
        return (bytes / 1048576).toFixed(1) + ' Mo'
    }


    const handleToggleSubtask = async (subtaskId: string, current: boolean) => {
        try {
            await toggleSubtask(subtaskId, !current)
        } catch (error) {
            console.error(error)
        }
    }

    if (!task) return null

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="w-full max-w-4xl p-0 gap-0 overflow-hidden flex flex-col max-h-[calc(100vh-2rem)]">
                {/* Header */}
                <div className="p-4 md:p-6 border-b flex flex-col md:flex-row md:items-start md:justify-between gap-3 bg-background">
                    <div className="space-y-2 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline" className="text-xs md:text-sm">{task.project?.name}</Badge>
                            <Badge className={`text-xs md:text-sm
                                ${task.status === "TODO" ? "bg-slate-500" :
                                    task.status === "IN_PROGRESS" ? "bg-blue-500" :
                                        task.status === "REVIEW" ? "bg-amber-500" : "bg-green-500"}`
                            }>{task.status}</Badge>
                        </div>
                        <DialogTitle className="text-lg md:text-xl font-bold line-clamp-2">{task.title}</DialogTitle>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                        <Button variant="ghost" size="sm" onClick={() => onEdit(task)} className="h-8 w-8 md:h-10 md:w-10 p-0">
                            <Edit className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)} className="h-8 w-8 md:h-10 md:w-10 p-0">
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                </div>

                {/* Body - Responsive Layout */}
                <div className="flex-1 flex flex-col md:grid md:grid-cols-12 overflow-hidden">
                    {/* Main Content */}
                    <div className="md:col-span-8 overflow-hidden flex flex-col md:block">
                        {/* Desktop: Direct content */}
                        <div className="hidden md:flex-1 md:p-6 md:overflow-y-auto">
                            <div className="space-y-8">
                                {/* Description */}
                                <section>
                                    <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                                        <FileText className="h-4 w-4 text-muted-foreground" />
                                        Description
                                    </h3>
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {task.description || "Aucune description."}
                                    </p>
                                </section>

                                {/* Subtasks */}
                                <section>
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
                                        Sous-tâches
                                    </h3>
                                    <div className="space-y-2">
                                        {task.subtasks?.map((st: any) => (
                                            <div key={st.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50 group">
                                                <div
                                                    className={`mt-0.5 cursor-pointer h-4 w-4 border rounded flex items-center justify-center ${st.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}
                                                    onClick={() => handleToggleSubtask(st.id, st.completed)}
                                                >
                                                    {st.completed && <CheckCircle2 className="h-3 w-3" />}
                                                </div>
                                                <span className={`text-sm ${st.completed ? 'text-muted-foreground line-through' : ''}`}>
                                                    {st.title}
                                                </span>
                                            </div>
                                        ))}
                                        {(!task.subtasks || task.subtasks.length === 0) && (
                                            <p className="text-xs text-muted-foreground italic">Aucune sous-tâche.</p>
                                        )}
                                    </div>
                                </section>

                                {/* Attachments */}
                                <section>
                                    <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                                        <Paperclip className="h-4 w-4 text-muted-foreground" />
                                        Fichiers
                                    </h3>
                                    <div className="space-y-3 grid grid-cols-2 gap-3">
                                        {task.attachments?.map((att: any) => (
                                            <FileAttachmentItem
                                                key={att.id}
                                                file={{ url: att.fileUrl, name: att.fileName, size: att.fileSize }}
                                                formatFileSize={formatFileSize}
                                            />
                                        ))}
                                    </div>
                                    {(!task.attachments || task.attachments.length === 0) && (
                                        <p className="text-xs text-muted-foreground italic">Aucun fichier attaché.</p>
                                    )}
                                </section>

                                {/* Budget & Meta */}
                                <section className="space-y-4">
                                    <h3 className="text-sm font-semibold flex items-center gap-2">
                                        <span className="font-bold">Finances</span>
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-muted/20 rounded-lg">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Débours</p>
                                            <p className="text-sm font-medium">
                                                {task.budgetDebours ? `${task.budgetDebours} FCFA` : "0 FCFA"}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/20 rounded-lg">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Perdiem</p>
                                            <p className="text-sm font-medium">
                                                {task.budgetPerdiem ? `${task.budgetPerdiem} FCFA` : "0 FCFA"}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-muted/20 rounded-lg">
                                            <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Transport</p>
                                            <p className="text-sm font-medium">
                                                {task.budgetTransport ? `${task.budgetTransport} FCFA` : "0 FCFA"}
                                            </p>
                                        </div>
                                        <div className="p-3 bg-primary/10 rounded-lg border border-primary/20">
                                            <p className="text-xs text-primary uppercase font-bold mb-1">Total</p>
                                            <p className="text-sm font-bold text-primary">
                                                {((Number(task.budgetDebours) || 0) + (Number(task.budgetPerdiem) || 0) + (Number(task.budgetTransport) || 0)).toFixed(0)} FCFA
                                            </p>
                                        </div>
                                    </div>
                                </section>

                                <section className="grid grid-cols-2 gap-4">
                                    <div className="p-3 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Assignés</p>
                                        <div className="flex -space-x-2">
                                            {task.assignees?.map((u: any) => (
                                                <Avatar key={u.id} className="h-8 w-8 border-2 border-background">
                                                    <AvatarImage src={u.avatar} />
                                                    <AvatarFallback>{getInitials(u.name)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {(!task.assignees || task.assignees.length === 0) && <span>-</span>}
                                        </div>
                                    </div>
                                    <div className="p-3 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Échéance</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {task.dueDate ? format(new Date(task.dueDate), "PPP", { locale: fr }) : "-"}
                                            </span>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </div>

                        {/* Mobile: Tabs */}
                        <Tabs defaultValue="description" className="md:hidden flex flex-col flex-1">
                            <TabsList className="grid w-full grid-cols-4 rounded-none border-b">
                                <TabsTrigger value="description" className="text-xs">Description</TabsTrigger>
                                <TabsTrigger value="tasks" className="text-xs">Sous-tâches</TabsTrigger>
                                <TabsTrigger value="files" className="text-xs">Fichiers</TabsTrigger>
                                <TabsTrigger value="details" className="text-xs">Détails</TabsTrigger>
                            </TabsList>

                            <TabsContent value="description" className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-2">
                                    <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                                        {task.description || "Aucune description."}
                                    </p>
                                </div>
                            </TabsContent>

                            <TabsContent value="tasks" className="flex-1 overflow-y-auto p-4">
                                <div className="space-y-2">
                                    {task.subtasks?.map((st: any) => (
                                        <div key={st.id} className="flex items-start gap-3 p-2 rounded-md hover:bg-muted/50">
                                            <div
                                                className={`mt-0.5 cursor-pointer h-4 w-4 border rounded flex items-center justify-center ${st.completed ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground'}`}
                                                onClick={() => handleToggleSubtask(st.id, st.completed)}
                                            >
                                                {st.completed && <CheckCircle2 className="h-3 w-3" />}
                                            </div>
                                            <span className={`text-sm ${st.completed ? 'text-muted-foreground line-through' : ''}`}>
                                                {st.title}
                                            </span>
                                        </div>
                                    ))}
                                    {(!task.subtasks || task.subtasks.length === 0) && (
                                        <p className="text-xs text-muted-foreground italic">Aucune sous-tâche.</p>
                                    )}
                                </div>
                            </TabsContent>

                            <TabsContent value="files" className="flex-1 overflow-y-auto p-4">
                                <div className="grid grid-cols-2 gap-3">
                                    {task.attachments?.map((att: any) => (
                                        <FileAttachmentItem
                                            key={att.id}
                                            file={{ url: att.fileUrl, name: att.fileName, size: att.fileSize }}
                                            formatFileSize={formatFileSize}
                                        />
                                    ))}
                                </div>
                                {(!task.attachments || task.attachments.length === 0) && (
                                    <p className="text-xs text-muted-foreground italic">Aucun fichier attaché.</p>
                                )}
                            </TabsContent>

                            <TabsContent value="details" className="flex-1 overflow-y-auto p-4 space-y-4">
                                <div className="space-y-3">
                                    <div className="p-2 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Débours</p>
                                        <p className="text-sm font-medium">{task.budgetDebours ? `${task.budgetDebours} FCFA` : "0 FCFA"}</p>
                                    </div>
                                    <div className="p-2 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Perdiem</p>
                                        <p className="text-sm font-medium">{task.budgetPerdiem ? `${task.budgetPerdiem} FCFA` : "0 FCFA"}</p>
                                    </div>
                                    <div className="p-2 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Transport</p>
                                        <p className="text-sm font-medium">{task.budgetTransport ? `${task.budgetTransport} FCFA` : "0 FCFA"}</p>
                                    </div>
                                    <div className="p-2 bg-primary/10 rounded-lg border border-primary/20">
                                        <p className="text-xs text-primary uppercase font-bold mb-1">Total</p>
                                        <p className="text-sm font-bold text-primary">
                                            {((Number(task.budgetDebours) || 0) + (Number(task.budgetPerdiem) || 0) + (Number(task.budgetTransport) || 0)).toFixed(0)} FCFA
                                        </p>
                                    </div>
                                    <div className="p-2 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Assignés</p>
                                        <div className="flex -space-x-2 mt-1">
                                            {task.assignees?.map((u: any) => (
                                                <Avatar key={u.id} className="h-6 w-6 border-2 border-background">
                                                    <AvatarImage src={u.avatar} />
                                                    <AvatarFallback className="text-[10px]">{getInitials(u.name)}</AvatarFallback>
                                                </Avatar>
                                            ))}
                                            {(!task.assignees || task.assignees.length === 0) && <span className="text-xs">-</span>}
                                        </div>
                                    </div>
                                    <div className="p-2 bg-muted/20 rounded-lg">
                                        <p className="text-xs text-muted-foreground uppercase font-bold mb-1">Échéance</p>
                                        <div className="flex items-center gap-2">
                                            <Calendar className="h-4 w-4 text-muted-foreground" />
                                            <span className="text-sm font-medium">
                                                {task.dueDate ? format(new Date(task.dueDate), "PPP", { locale: fr }) : "-"}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </TabsContent>
                        </Tabs>
                    </div>

                    {/* Comments - Sidebar on desktop, Tab on mobile */}
                    <div className="md:col-span-4 md:border-l bg-muted/10 flex flex-col md:flex-col"
                        style={{ display: 'none' }}>
                    </div>
                </div>

                {/* Mobile Tabs Navigation */}
                <Tabs defaultValue="details" className="md:hidden w-full flex flex-col border-t">
                    <TabsList className="grid w-full grid-cols-2 rounded-none">
                        <TabsTrigger value="details">Détails</TabsTrigger>
                        <TabsTrigger value="comments">Commentaires</TabsTrigger>
                    </TabsList>

                    <TabsContent value="comments" className="flex-1 overflow-auto">
                        <div className="p-4">
                            <div className="flex-1 p-4 overflow-y-auto">
                                <div className="space-y-4">
                                    {loadingComments ? (
                                        <div className="text-center py-4 text-xs text-muted-foreground">Chargement...</div>
                                    ) : comments.length === 0 ? (
                                        <div className="text-center py-8 text-muted-foreground text-xs">
                                            Aucun commentaire pour le moment.
                                        </div>
                                    ) : (
                                        comments.map(comment => (
                                            <div key={comment.id} className="flex gap-3 text-sm">
                                                <Avatar className="h-8 w-8 mt-1">
                                                    <AvatarImage src={comment.user?.avatar} />
                                                    <AvatarFallback>{getInitials(comment.user?.name)}</AvatarFallback>
                                                </Avatar>
                                                <div className="flex-1 space-y-1">
                                                    <div className="flex items-center justify-between">
                                                        <span className="font-medium text-xs">{comment.user?.name}</span>
                                                        <span className="text-[10px] text-muted-foreground">
                                                            {format(new Date(comment.createdAt), "d MMM HH:mm", { locale: fr })}
                                                        </span>
                                                    </div>
                                                    {comment.content && (
                                                        <p className="text-muted-foreground leading-snug">{comment.content}</p>
                                                    )}
                                                    {Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
                                                        <div className="flex flex-wrap gap-2 pt-2">
                                                            {comment.attachments.map((att: any, i: number) => (
                                                                <div key={i} className="w-full sm:w-[140px]">
                                                                    <FileAttachmentItem
                                                                        file={{ url: att.url, name: att.name, size: att.size }}
                                                                        isPreview={true}
                                                                        formatFileSize={formatFileSize}
                                                                    />
                                                                </div>
                                                            ))}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            <div className="p-4 border-t bg-background space-y-3">
                                <input
                                    ref={commentFileRef}
                                    type="file"
                                    multiple
                                    className="hidden"
                                    onChange={(e) => e.target.files && handleCommentFileUpload(e.target.files)}
                                />

                                {/* Attached files preview */}
                                {commentFiles.length > 0 && (
                                    <div className="space-y-2 grid grid-cols-2 gap-2">
                                        {commentFiles.map((f, i) => (
                                            <div key={i} className="w-full">
                                                <FileAttachmentItem
                                                    file={f}
                                                    onRemove={() => setCommentFiles(prev => prev.filter((_, j) => j !== i))}
                                                    isPreview={true}
                                                    formatFileSize={formatFileSize}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <Textarea
                                        placeholder="Écrire un commentaire..."
                                        className="min-h-[70px] resize-none text-sm"
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendComment()
                                        }}
                                    />
                                    <div className="flex justify-between items-center gap-2">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            className="h-8 w-8 p-0"
                                            onClick={() => commentFileRef.current?.click()}
                                            disabled={isUploadingComment}
                                            title="Joindre un fichier"
                                        >
                                            {isUploadingComment
                                                ? <Loader2 className="h-4 w-4 animate-spin" />
                                                : <Paperclip className="h-4 w-4" />}
                                        </Button>
                                        <Button size="sm" onClick={handleSendComment} disabled={isSending || (!newComment.trim() && commentFiles.length === 0)} className="text-xs">
                                            {isSending ? <Clock className="h-3 w-3 animate-spin mr-1" /> : <Send className="h-3 w-3 mr-1" />}
                                            Envoyer
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                {/* Desktop Comments Sidebar */}
                <div className="hidden md:flex md:col-span-4 md:border-l bg-muted/10 flex-col">
                    <div className="p-4 border-b bg-background/50 backdrop-blur">
                        <h3 className="font-semibold flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" /> Commentaires
                        </h3>
                    </div>

                    <div className="flex-1 p-4 overflow-y-auto">
                        <div className="space-y-4">
                            {loadingComments ? (
                                <div className="text-center py-4 text-xs text-muted-foreground">Chargement...</div>
                            ) : comments.length === 0 ? (
                                <div className="text-center py-8 text-muted-foreground text-xs">
                                    Aucun commentaire pour le moment.
                                </div>
                            ) : (
                                comments.map(comment => (
                                    <div key={comment.id} className="flex gap-3 text-sm">
                                        <Avatar className="h-8 w-8 mt-1">
                                            <AvatarImage src={comment.user?.avatar} />
                                            <AvatarFallback>{getInitials(comment.user?.name)}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 space-y-1">
                                            <div className="flex items-center justify-between">
                                                <span className="font-medium text-xs">{comment.user?.name}</span>
                                                <span className="text-[10px] text-muted-foreground">
                                                    {format(new Date(comment.createdAt), "d MMM HH:mm", { locale: fr })}
                                                </span>
                                            </div>
                                            {comment.content && (
                                                <p className="text-muted-foreground leading-snug">{comment.content}</p>
                                            )}
                                            {Array.isArray(comment.attachments) && comment.attachments.length > 0 && (
                                                <div className="flex flex-wrap gap-2 pt-2">
                                                    {comment.attachments.map((att: any, i: number) => (
                                                        <div key={i} className="w-full sm:w-[140px]">
                                                            <FileAttachmentItem
                                                                file={{ url: att.url, name: att.name, size: att.size }}
                                                                isPreview={true}
                                                                formatFileSize={formatFileSize}
                                                            />
                                                        </div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-4 border-t bg-background">
                        <input
                            ref={commentFileRef}
                            type="file"
                            multiple
                            className="hidden"
                            onChange={(e) => e.target.files && handleCommentFileUpload(e.target.files)}
                        />

                        {/* Attached files preview */}
                        {commentFiles.length > 0 && (
                            <div className="mb-2 space-y-2 grid grid-cols-2 gap-2">
                                {commentFiles.map((f, i) => (
                                    <div key={i} className="w-full">
                                        <FileAttachmentItem
                                            file={f}
                                            onRemove={() => setCommentFiles(prev => prev.filter((_, j) => j !== i))}
                                            isPreview={true}
                                            formatFileSize={formatFileSize}
                                        />
                                    </div>
                                ))}
                            </div>
                        )}

                        <div className="flex gap-2">
                            <Textarea
                                placeholder="Écrire un commentaire..."
                                className="min-h-[70px] resize-none"
                                value={newComment}
                                onChange={(e) => setNewComment(e.target.value)}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) handleSendComment()
                                }}
                            />
                        </div>
                        <div className="flex justify-between items-center mt-2">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => commentFileRef.current?.click()}
                                disabled={isUploadingComment}
                                title="Joindre un fichier"
                            >
                                {isUploadingComment
                                    ? <Loader2 className="h-4 w-4 animate-spin" />
                                    : <Paperclip className="h-4 w-4" />}
                            </Button>
                            <Button size="sm" onClick={handleSendComment} disabled={isSending || (!newComment.trim() && commentFiles.length === 0)}>
                                {isSending ? <Clock className="h-3 w-3 animate-spin" /> : <Send className="h-3 w-3" />}
                                <span className="sr-only">Envoyer</span>
                            </Button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
