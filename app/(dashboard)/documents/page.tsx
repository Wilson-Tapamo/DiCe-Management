export const dynamic = 'force-dynamic'

import { auth } from '@/lib/auth'
import { getDocuments } from '@/app/actions/documents'
import { DocumentsView } from '@/components/documents/documents-view'
import { redirect } from 'next/navigation'
import { FolderOpen } from 'lucide-react'

export default async function DocumentsPage() {
    const session = await auth()
    if (!session?.user) redirect('/')

    const result = await getDocuments()
    const documents = result.success ? result.data ?? [] : []
    const projects = result.success ? result.projects ?? [] : []

    return (
        <div className="flex-1 space-y-4 p-4 md:p-6">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-600 to-sky-500 shadow-lg shadow-blue-500/20">
                    <FolderOpen className="h-5 w-5 text-white" />
                </div>
                <div>
                    <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
                        Documents
                    </h1>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                        Tous les fichiers classés par projet et tâche
                    </p>
                </div>
            </div>

            <DocumentsView
                initialDocuments={JSON.parse(JSON.stringify(documents))}
                projects={JSON.parse(JSON.stringify(projects))}
            />
        </div>
    )
}
