'use client'

import { File, Image as ImageIcon, X } from 'lucide-react'
import Image from 'next/image'

interface FileAttachmentItemProps {
    file: {
        url: string
        name: string
        size?: number
    }
    onRemove?: () => void
    isPreview?: boolean
    formatFileSize?: (bytes: number) => string
}

const isImageUrl = (url: string) => {
    return /\.(jpeg|jpg|gif|png|webp|svg)$/i.test(url)
}

const getFileType = (name: string) => {
    const ext = name.split('.').pop()?.toLowerCase()
    const typeMap: { [key: string]: string } = {
        pdf: 'PDF',
        doc: 'Document',
        docx: 'Document',
        xls: 'Classeur',
        xlsx: 'Classeur',
        ppt: 'Présentation',
        pptx: 'Présentation',
        txt: 'Texte',
        zip: 'Archive',
        rar: 'Archive',
        jpg: 'Image',
        jpeg: 'Image',
        png: 'Image',
        gif: 'Image',
        webp: 'Image',
        svg: 'Image',
    }
    return typeMap[ext || ''] || 'Fichier'
}

export function FileAttachmentItem({ file, onRemove, isPreview = false, formatFileSize }: FileAttachmentItemProps) {
    const isImage = isImageUrl(file.url)
    const fileType = getFileType(file.name)

    if (isImage && !isPreview) {
        return (
            <div className="relative group">
                <div className="relative w-full h-auto rounded-lg overflow-hidden border border-border bg-muted/50">
                    <Image
                        src={file.url}
                        alt={file.name}
                        width={200}
                        height={200}
                        className="w-full h-auto object-cover"
                        unoptimized
                    />
                </div>
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <p className="text-xs text-white truncate font-medium">{file.name}</p>
                    {file.size && formatFileSize && (
                        <p className="text-[10px] text-white/70">{formatFileSize(file.size)}</p>
                    )}
                    <p className="text-[10px] text-white/70">{fileType}</p>
                </div>
            </div>
        )
    }

    return (
        <a
            href={file.url}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-3 p-2.5 border rounded-lg transition-colors ${isPreview
                ? 'bg-muted/30 text-xs'
                : 'bg-muted/20 hover:bg-muted/40'
                }`}
        >
            {isImage ? (
                <ImageIcon className="h-4 w-4 text-blue-500 flex-shrink-0" />
            ) : (
                <File className="h-4 w-4 text-primary flex-shrink-0" />
            )}
            <div className="flex-1 min-w-0">
                <p className={`font-medium truncate ${isPreview ? 'text-xs' : 'text-sm'}`}>{file.name}</p>
                <div className={`flex items-center gap-2 ${isPreview ? 'text-[10px]' : 'text-xs'} text-muted-foreground`}>
                    <span>{fileType}</span>
                    {file.size && formatFileSize && <span>{formatFileSize(file.size)}</span>}
                </div>
            </div>
            {onRemove && (
                <button
                    type="button"
                    onClick={(e) => {
                        e.preventDefault()
                        onRemove()
                    }}
                    className="text-muted-foreground hover:text-destructive flex-shrink-0"
                >
                    <X className={isPreview ? 'h-3 w-3' : 'h-4 w-4'} />
                </button>
            )}
        </a>
    )
}
