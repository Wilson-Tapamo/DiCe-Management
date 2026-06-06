'use client'

import { useState, useEffect, useTransition } from "react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Plus,
    ArrowUpRight,
    ArrowDownLeft,
    Calendar as CalendarIcon,
    FileText,
    BookOpen,
    BookCheck,
    BookOpenCheck,
    Trash2,
    Loader2,
    RefreshCw,
    Landmark,
    Receipt,
    ShoppingCart,
    Wallet,
} from "lucide-react"
import {
    getFinanceDashboardWithJournals,
    getJournals,
    getJournalEntries,
    getGeneralJournalEntries,
    createManualAccountingEntry,
    deleteAccountingEntry,
    getAccountChart,
    backfillJournalEntries,
} from "@/app/actions/accounting"
import { queueOperation } from "@/lib/offline/sync"

const JOURNAL_ICONS: Record<string, any> = {
    GENERAL: BookOpenCheck,
    VENTES: Receipt,
    ACHATS: ShoppingCart,
    BANQUE: Landmark,
    CAISSE: Wallet,
    OD: BookOpen,
    PAIE: FileText,
}

const GENERAL_JOURNAL = {
    id: 'general',
    type: 'GENERAL',
    label: 'Journal Général',
    code: 'GÉN',
    _count: { entries: 0 },
    totalDebit: 0,
    totalCredit: 0,
}

export function FinanceDirectorView() {
    const [activeTab, setActiveTab] = useState("dashboard")
    const [isPending, startTransition] = useTransition()

    const [dashboardData, setDashboardData] = useState<any>(null)
    const [journals, setJournals] = useState<any[]>([])
    const [selectedJournal, setSelectedJournal] = useState<any>(GENERAL_JOURNAL)
    const [journalEntries, setJournalEntries] = useState<any>(null)
    const [isAddEntryOpen, setIsAddEntryOpen] = useState(false)
    const [isBackfilling, setIsBackfilling] = useState(false)

    const [startDate, setStartDate] = useState("")
    const [endDate, setEndDate] = useState("")
    const [jStartDate, setJStartDate] = useState("")
    const [jEndDate, setJEndDate] = useState("")

    useEffect(() => {
        loadDashboard()
        loadJournals()
    }, [startDate, endDate])

    useEffect(() => {
        if (activeTab === "journals") {
            openJournal(selectedJournal || GENERAL_JOURNAL)
        }
    }, [activeTab, jStartDate, jEndDate])

    async function loadDashboard() {
        const filters: any = {}
        if (startDate) filters.startDate = startDate
        if (endDate) filters.endDate = endDate
        const result = await getFinanceDashboardWithJournals(filters)
        if (result.success) setDashboardData(result.data)
    }

    async function loadJournals() {
        const result = await getJournals()
        if (result.success) setJournals(result.data || [])
    }

    async function openJournal(journal: any) {
        setSelectedJournal(journal)
        const filters: any = {}
        if (jStartDate) filters.startDate = jStartDate
        if (jEndDate) filters.endDate = jEndDate

        if (journal.id === 'general') {
            const result = await getGeneralJournalEntries(filters)
            if (result.success) setJournalEntries(result.data)
        } else {
            const result = await getJournalEntries(journal.id, filters)
            if (result.success) setJournalEntries(result.data)
        }
    }

    async function handleBackfill() {
        setIsBackfilling(true)
        await backfillJournalEntries()
        setIsBackfilling(false)
        loadDashboard()
        loadJournals()
        openJournal(selectedJournal || GENERAL_JOURNAL)
    }

    function renderJournalIcon(type: string, className?: string) {
        const Icon = JOURNAL_ICONS[type] || BookOpen
        return <Icon className={className || "h-5 w-5"} />
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-white">
                        Comptabilité
                    </h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">
                        Espace comptable professionnel - Plan comptable OHADA
                    </p>
                </div>
                <div className="flex gap-2">
                    <Button variant="outline" onClick={handleBackfill} disabled={isBackfilling}>
                        <RefreshCw className={`h-4 w-4 mr-2 ${isBackfilling ? 'animate-spin' : ''}`} />
                        Alimenter auto.
                    </Button>
                </div>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6 max-w-[90vw]">
                <TabsList className="w-full md:w-fit items-center rounded-md bg-muted p-1 text-muted-foreground flex flex-wrap justify-start h-auto gap-2">
                    <TabsTrigger value="dashboard">Tableau de Bord</TabsTrigger>
                    <TabsTrigger value="journals">Journaux Comptables</TabsTrigger>
                </TabsList>

                {/* DASHBOARD TAB */}
                <TabsContent value="dashboard" className="space-y-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-950 p-4 rounded-lg border shadow-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium">Période:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    className="w-auto h-9"
                                />
                                <span className="text-slate-400">-</span>
                                <Input
                                    type="date"
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    className="w-auto h-9"
                                />
                            </div>
                            {(startDate || endDate) && (
                                <Button variant="ghost" size="sm" onClick={() => { setStartDate(""); setEndDate("") }} className="h-9">
                                    Effacer
                                </Button>
                            )}
                        </div>
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        <Card className="border-l-4 border-l-green-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-green-100 dark:bg-green-900/30">
                                        <ArrowDownLeft className="h-6 w-6 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Revenus</p>
                                        <p className="text-2xl font-bold text-green-600">
                                            {(dashboardData?.totalIncome || 0).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-red-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-red-100 dark:bg-red-900/30">
                                        <ArrowUpRight className="h-6 w-6 text-red-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Total Dépenses</p>
                                        <p className="text-2xl font-bold text-red-600">
                                            {(dashboardData?.totalExpenses || 0).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className={`border-l-4 ${(dashboardData?.balance || 0) >= 0 ? 'border-l-emerald-500' : 'border-l-orange-500'}`}>
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${(dashboardData?.balance || 0) >= 0 ? 'bg-emerald-100 dark:bg-emerald-900/30' : 'bg-orange-100 dark:bg-orange-900/30'}`}>
                                        <DollarSign className={`h-6 w-6 ${(dashboardData?.balance || 0) >= 0 ? 'text-emerald-600' : 'text-orange-600'}`} />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Solde Net</p>
                                        <p className={`text-2xl font-bold ${(dashboardData?.balance || 0) >= 0 ? 'text-emerald-600' : 'text-orange-600'}`}>
                                            {(dashboardData?.balance || 0).toLocaleString()} FCFA
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <Card className="border-l-4 border-l-blue-500">
                            <CardContent className="p-6">
                                <div className="flex items-center gap-4">
                                    <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30">
                                        <BookCheck className="h-6 w-6 text-blue-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm text-slate-500">Écritures comptables</p>
                                        <p className="text-2xl font-bold text-blue-600">
                                            {dashboardData?.totalJournalEntries || 0}
                                        </p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>Journaux Comptables OHADA</CardTitle>
                            <CardDescription>
                                {dashboardData?.totalJournals || 0} journaux • Plan comptable camerounais
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                                {dashboardData?.journalsSummary?.map((j: any) => {
                                    const colorMap: Record<string, string> = {
                                        VENTES: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400 border-green-200',
                                        ACHATS: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400 border-orange-200',
                                        BANQUE: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 border-blue-200',
                                        CAISSE: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400 border-purple-200',
                                        OD: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-400 border-slate-200',
                                        PAIE: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border-amber-200',
                                    }
                                    return (
                                        <button
                                            key={j.id}
                                            onClick={() => { setSelectedJournal(j); openJournal(j); setActiveTab('journals') }}
                                            className={`p-4 rounded-xl border ${colorMap[j.type] || 'bg-slate-100'} text-left transition-all hover:shadow-md`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className="p-2 rounded-lg bg-white/50 dark:bg-black/20">
                                                    {renderJournalIcon(j.type, "h-5 w-5")}
                                                </div>
                                                <div>
                                                    <p className="font-semibold">{j.label}</p>
                                                    <p className="text-xs opacity-70">Code: {j.code}</p>
                                                </div>
                                            </div>
                                            <div className="mt-3 flex justify-between text-sm">
                                                <span>{j.entryCount} écritures</span>
                                                <span className="font-medium">{j.total.toLocaleString()} FCFA</span>
                                            </div>
                                        </button>
                                    )
                                })}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between">
                            <div>
                                <CardTitle>Mouvements Financiers</CardTitle>
                                <CardDescription>Dernières entrées et sorties</CardDescription>
                            </div>
                            <Button onClick={() => setIsAddEntryOpen(true)}>
                                <Plus className="h-4 w-4 mr-2" />
                                Nouvelle écriture
                            </Button>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {dashboardData?.entries?.length > 0 ? (
                                    dashboardData.entries.map((entry: any) => (
                                        <div key={entry.id} className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors gap-4">
                                            <div className="flex items-center gap-4">
                                                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${entry.type === 'INCOME' ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'}`}>
                                                    {entry.type === 'INCOME' ? (
                                                        <ArrowDownLeft className="h-5 w-5 text-green-600" />
                                                    ) : (
                                                        <ArrowUpRight className="h-5 w-5 text-red-600" />
                                                    )}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className="font-medium truncate">{entry.description}</p>
                                                    <p className="text-sm text-muted-foreground truncate">
                                                        {entry.category || '-'} • {entry.project?.name || 'Général'}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-center justify-between sm:justify-end gap-4 w-full sm:w-auto pl-14 sm:pl-0">
                                                <div className="text-right">
                                                    <p className={`font-bold ${entry.type === 'INCOME' ? 'text-green-600' : 'text-red-600'}`}>
                                                        {entry.type === 'INCOME' ? '+' : '-'}{Number(entry.amount).toLocaleString()} FCFA
                                                    </p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="text-center py-8 text-muted-foreground">
                                        Aucune entrée enregistrée. Utilisez "Alimenter auto." pour générer les écritures depuis les données existantes.
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>
                </TabsContent>

                {/* JOURNALS TAB */}
                <TabsContent value="journals" className="space-y-6">
                    {/* Period Filter */}
                    <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between bg-white dark:bg-slate-950 p-4 rounded-lg border shadow-sm">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                            <div className="flex items-center gap-2">
                                <CalendarIcon className="h-4 w-4 text-slate-500" />
                                <span className="text-sm font-medium">Période:</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Input
                                    type="date"
                                    value={jStartDate}
                                    onChange={(e) => setJStartDate(e.target.value)}
                                    className="w-auto h-9"
                                />
                                <span className="text-slate-400">-</span>
                                <Input
                                    type="date"
                                    value={jEndDate}
                                    onChange={(e) => setJEndDate(e.target.value)}
                                    className="w-auto h-9"
                                />
                            </div>
                            {(jStartDate || jEndDate) && (
                                <Button variant="ghost" size="sm" onClick={() => { setJStartDate(""); setJEndDate("") }} className="h-9">
                                    Effacer
                                </Button>
                            )}
                        </div>
                    </div>

                    {/* Journal Selector */}
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-7">
                        {[{ ...GENERAL_JOURNAL, _count: { entries: journalEntries?.count || 0 }, totalDebit: journalEntries?.totalDebit || 0 }, ...journals].map((j: any) => {
                            const isSelected = selectedJournal?.id === j.id
                            let colorClass = 'hover:bg-slate-100 dark:hover:bg-slate-800'
                            if (isSelected) {
                                if (j.id === 'general') colorClass = 'ring-2 ring-sky-500 bg-sky-50 dark:bg-sky-950'
                                else if (j.type === 'VENTES') colorClass = 'ring-2 ring-green-500 bg-green-50 dark:bg-green-950'
                                else if (j.type === 'ACHATS') colorClass = 'ring-2 ring-orange-500 bg-orange-50 dark:bg-orange-950'
                                else if (j.type === 'BANQUE') colorClass = 'ring-2 ring-blue-500 bg-blue-50 dark:bg-blue-950'
                                else if (j.type === 'CAISSE') colorClass = 'ring-2 ring-purple-500 bg-purple-50 dark:bg-purple-950'
                                else if (j.type === 'OD') colorClass = 'ring-2 ring-slate-500 bg-slate-50 dark:bg-slate-900'
                                else if (j.type === 'PAIE') colorClass = 'ring-2 ring-amber-500 bg-amber-50 dark:bg-amber-950'
                            }
                            return (
                                <button
                                    key={j.id}
                                    onClick={() => openJournal(j)}
                                    className={`p-3 rounded-xl border text-left transition-all ${colorClass}`}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        {renderJournalIcon(j.type, "h-4 w-4")}
                                        <span className="font-semibold text-sm">{j.code}</span>
                                    </div>
                                    <p className="text-xs text-muted-foreground">{j.label}</p>
                                    <div className="mt-2 flex justify-between text-xs">
                                        <span>{j._count?.entries || 0} écritures</span>
                                        <span className="font-medium">{(j.totalDebit || 0).toLocaleString()} FCFA</span>
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {/* Journal Detail */}
                    {selectedJournal && journalEntries && (
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <div>
                                    <CardTitle className="flex items-center gap-2">
                                        {renderJournalIcon(selectedJournal.type, "h-5 w-5")}
                                        {selectedJournal.label}
                                        <Badge variant="outline" className="ml-2">{selectedJournal.code}</Badge>
                                        {selectedJournal.id === 'general' && (
                                            <Badge variant="secondary" className="ml-1">Tous les journaux</Badge>
                                        )}
                                    </CardTitle>
                                    <CardDescription>
                                        {journalEntries.count || journalEntries.entries?.length || 0} écritures •
                                        Débit: {journalEntries.totalDebit.toLocaleString()} FCFA •
                                        Crédit: {journalEntries.totalCredit.toLocaleString()} FCFA •
                                        Solde: {journalEntries.balance.toLocaleString()} FCFA
                                    </CardDescription>
                                </div>
                                <Button onClick={() => setIsAddEntryOpen(true)} size="sm">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Ajouter
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div className="overflow-x-auto">
                                    <table className="w-full min-w-[900px]">
                                        <thead>
                                            <tr className="border-b border-slate-100 dark:border-slate-800">
                                                <th className="text-left p-3 font-medium text-slate-500 text-sm">Date</th>
                                                {selectedJournal.id === 'general' && (
                                                    <th className="text-left p-3 font-medium text-slate-500 text-sm">Journal</th>
                                                )}
                                                <th className="text-left p-3 font-medium text-slate-500 text-sm">Pièce</th>
                                                <th className="text-left p-3 font-medium text-slate-500 text-sm">Compte</th>
                                                <th className="text-left p-3 font-medium text-slate-500 text-sm">Libellé</th>
                                                <th className="text-right p-3 font-medium text-slate-500 text-sm">Débit</th>
                                                <th className="text-right p-3 font-medium text-slate-500 text-sm">Crédit</th>
                                                <th className="text-left p-3 font-medium text-slate-500 text-sm">Source</th>
                                                <th className="w-10"></th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {journalEntries.entries?.map((entry: any) => (
                                                <tr key={entry.id} className="border-b border-slate-50 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors">
                                                    <td className="p-3 text-sm">
                                                        {new Date(entry.date).toLocaleDateString('fr-FR')}
                                                    </td>
                                                    {selectedJournal.id === 'general' && (
                                                        <td className="p-3">
                                                            <Badge variant="outline" className="text-xs font-mono">
                                                                {entry.journal?.code || '-'}
                                                            </Badge>
                                                        </td>
                                                    )}
                                                    <td className="p-3 text-sm text-muted-foreground">
                                                        {entry.pieceRef || '-'}
                                                    </td>
                                                    <td className="p-3">
                                                        <span className="font-mono font-medium">{entry.accountNum}</span>
                                                        <p className="text-xs text-muted-foreground">{entry.accountName}</p>
                                                    </td>
                                                    <td className="p-3 text-sm max-w-[200px] truncate">
                                                        {entry.description}
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-sm">
                                                        {Number(entry.debit) > 0 ? `${Number(entry.debit).toLocaleString()} FCFA` : '-'}
                                                    </td>
                                                    <td className="p-3 text-right font-mono text-sm">
                                                        {Number(entry.credit) > 0 ? `${Number(entry.credit).toLocaleString()} FCFA` : '-'}
                                                    </td>
                                                    <td className="p-3">
                                                        <Badge variant="outline" className="text-xs">
                                                            {entry.sourceType === 'MANUAL' ? 'Manuelle' :
                                                             entry.sourceType === 'INVOICE' ? 'Facture' :
                                                             entry.sourceType === 'FINANCE_ENTRY' ? 'Finances' : 'Auto'}
                                                        </Badge>
                                                    </td>
                                                    <td className="p-3">
                                                        {entry.sourceType === 'MANUAL' && (
                                                            <Button
                                                                variant="ghost"
                                                                size="icon"
                                                                className="h-7 w-7"
                                                                onClick={async () => {
                                                                    await deleteAccountingEntry(entry.id)
                                                                    openJournal(selectedJournal)
                                                                }}
                                                            >
                                                                <Trash2 className="h-3 w-3" />
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))}
                                            {(!journalEntries.entries || journalEntries.entries.length === 0) && (
                                                <tr>
                                                    <td colSpan={selectedJournal.id === 'general' ? 9 : 8} className="p-8 text-center text-muted-foreground">
                                                        Aucune écriture trouvée pour cette période. Cliquez sur "Alimenter auto." pour générer les écritures depuis les données existantes.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                        <tfoot>
                                            <tr className="border-t-2 border-slate-200 dark:border-slate-700 font-bold">
                                                <td colSpan={selectedJournal.id === 'general' ? 4 : 3} className="p-3 text-right">Totaux</td>
                                                <td className="p-3 text-right">{journalEntries.totalDebit.toLocaleString()} FCFA</td>
                                                <td className="p-3 text-right">{journalEntries.totalCredit.toLocaleString()} FCFA</td>
                                                <td colSpan={2}></td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </CardContent>
                        </Card>
                    )}
                </TabsContent>
            </Tabs>

            <AddJournalEntryModal
                open={isAddEntryOpen}
                onOpenChange={setIsAddEntryOpen}
                journals={journals}
                preselectedJournalId={selectedJournal?.id === 'general' ? undefined : selectedJournal?.id}
                onSuccess={() => {
                    setIsAddEntryOpen(false)
                    loadDashboard()
                    loadJournals()
                    if (selectedJournal) openJournal(selectedJournal)
                }}
            />
        </div>
    )
}

function AddJournalEntryModal({ open, onOpenChange, journals, preselectedJournalId, onSuccess }: {
    open: boolean
    onOpenChange: (open: boolean) => void
    journals: any[]
    preselectedJournalId?: string
    onSuccess: () => void
}) {
    const [isPending, startTransition] = useTransition()
    const [journalId, setJournalId] = useState(preselectedJournalId || '')
    const [date, setDate] = useState(new Date().toISOString().split('T')[0])
    const [pieceRef, setPieceRef] = useState('')
    const [description, setDescription] = useState('')
    const [accountNum, setAccountNum] = useState('')
    const [accountName, setAccountName] = useState('')
    const [debit, setDebit] = useState('')
    const [credit, setCredit] = useState('')
    const [accountChart, setAccountChart] = useState<any[]>([])

    const journalIcons: Record<string, any> = {
        VENTES: Receipt,
        ACHATS: ShoppingCart,
        BANQUE: Landmark,
        CAISSE: Wallet,
        OD: BookOpen,
        PAIE: FileText,
    }

    useEffect(() => {
        getAccountChart().then((r) => {
            if (r.success) setAccountChart(r.data || [])
        })
    }, [])

    useEffect(() => {
        if (preselectedJournalId) setJournalId(preselectedJournalId)
    }, [preselectedJournalId])

    const handleAccountSelect = (num: string) => {
        setAccountNum(num)
        const acct = accountChart.find((a) => a.num === num)
        if (acct) setAccountName(acct.name)
    }

    const handleSubmit = () => {
        startTransition(async () => {
            if (typeof navigator !== 'undefined' && !navigator.onLine) {
                await queueOperation({
                    action: 'createManualAccountingEntry',
                    endpoint: '/api/offline',
                    payload: {
                        journalId,
                        date,
                        pieceRef,
                        description,
                        accountNum,
                        accountName,
                        debit: parseFloat(debit) || 0,
                        credit: parseFloat(credit) || 0,
                    },
                })
                setPieceRef('')
                setDescription('')
                setAccountNum('')
                setAccountName('')
                setDebit('')
                setCredit('')
                onSuccess()
                return
            }

            const result = await createManualAccountingEntry({
                journalId,
                date,
                pieceRef,
                description,
                accountNum,
                accountName,
                debit: parseFloat(debit) || 0,
                credit: parseFloat(credit) || 0,
            })
            if (result.success) {
                setPieceRef('')
                setDescription('')
                setAccountNum('')
                setAccountName('')
                setDebit('')
                setCredit('')
                onSuccess()
            }
        })
    }

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-md">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <BookOpen className="h-5 w-5 text-primary" />
                        Nouvelle écriture comptable
                    </DialogTitle>
                    <DialogDescription>
                        Enregistrer une écriture dans un journal comptable OHADA
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label>Journal comptable</Label>
                        <Select value={journalId} onValueChange={setJournalId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Sélectionner un journal" />
                            </SelectTrigger>
                            <SelectContent>
                                {journals.map((j) => {
                                    const Icon = journalIcons[j.type] || BookOpen
                                    return (
                                        <SelectItem key={j.id} value={j.id}>
                                            <span className="flex items-center gap-2">
                                                <Icon className="h-4 w-4" />
                                                {j.label} ({j.code})
                                            </span>
                                        </SelectItem>
                                    )
                                })}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Date</Label>
                            <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Pièce comptable</Label>
                            <Input placeholder="N° facture/reçu" value={pieceRef} onChange={(e) => setPieceRef(e.target.value)} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Compte comptable OHADA</Label>
                        <Select value={accountNum} onValueChange={handleAccountSelect}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choisir un compte" />
                            </SelectTrigger>
                            <SelectContent>
                                {accountChart.map((a) => (
                                    <SelectItem key={a.num} value={a.num}>
                                        {a.num} - {a.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Libellé</Label>
                        <Input placeholder="Description de l'écriture" value={description} onChange={(e) => setDescription(e.target.value)} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Débit (FCFA)</Label>
                            <Input type="number" placeholder="0" value={debit} onChange={(e) => setDebit(e.target.value)} />
                        </div>
                        <div className="space-y-2">
                            <Label>Crédit (FCFA)</Label>
                            <Input type="number" placeholder="0" value={credit} onChange={(e) => setCredit(e.target.value)} />
                        </div>
                    </div>
                </div>
                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Annuler
                    </Button>
                    <Button onClick={handleSubmit} disabled={isPending || !journalId || !description || !accountNum || (!debit && !credit)}>
                        {isPending && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Enregistrer
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
