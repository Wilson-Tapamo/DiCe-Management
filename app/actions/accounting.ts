'use server'

import { prisma } from "@/db/prisma"
import { auth } from "@/lib/auth"
import { revalidatePath } from "next/cache"

const JOURNAL_DEFS = [
  { type: 'VENTES' as const, label: 'Journal des Ventes', code: 'VNA' },
  { type: 'ACHATS' as const, label: 'Journal des Achats', code: 'ACH' },
  { type: 'BANQUE' as const, label: 'Journal de Banque', code: 'BQ' },
  { type: 'CAISSE' as const, label: 'Journal de Caisse', code: 'CS' },
  { type: 'OD' as const, label: 'Journal des Opérations Diverses', code: 'OD' },
  { type: 'PAIE' as const, label: 'Journal de Paie', code: 'PA' },
]

async function ensureJournals() {
  for (const j of JOURNAL_DEFS) {
    await prisma.accountingJournal.upsert({
      where: { type: j.type },
      update: {},
      create: j,
    })
  }
}

export async function getJournals() {
  const session = await auth()
  if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await ensureJournals()
    const journals = await prisma.accountingJournal.findMany({
      include: {
        _count: { select: { entries: true } },
      },
      orderBy: { id: 'asc' },
    })

    const totals = await prisma.accountEntry.groupBy({
      by: ['journalId'],
      _sum: { debit: true, credit: true },
    })

    const data = journals.map((j) => {
      const t = totals.find((x) => x.journalId === j.id)
      return {
        ...j,
        totalDebit: Number(t?._sum?.debit || 0),
        totalCredit: Number(t?._sum?.credit || 0),
      }
    })

    return { success: true, data }
  } catch (error) {
    console.error("Get journals error:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

export async function getJournalEntries(journalId: string, filters?: {
  startDate?: string
  endDate?: string
}) {
  const session = await auth()
  if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await ensureJournals()
    const where: any = { journalId }
    if (filters?.startDate || filters?.endDate) {
      where.date = {}
      if (filters.startDate) where.date.gte = new Date(filters.startDate)
      if (filters.endDate) where.date.lte = new Date(filters.endDate)
    }

    const entries = await prisma.accountEntry.findMany({
      where,
      include: { createdBy: { select: { id: true, name: true } } },
      orderBy: { date: 'desc' },
    })

    const totalDebit = entries.reduce((s, e) => s + Number(e.debit), 0)
    const totalCredit = entries.reduce((s, e) => s + Number(e.credit), 0)

    return {
      success: true,
      data: {
        entries: JSON.parse(JSON.stringify(entries)),
        totalDebit,
        totalCredit,
        balance: totalDebit - totalCredit,
      },
    }
  } catch (error) {
    console.error("Get journal entries error:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

export async function createManualAccountingEntry(data: {
  journalId: string
  date?: string
  pieceRef?: string
  description: string
  accountNum: string
  accountName: string
  debit: number
  credit: number
}) {
  const session = await auth()
  if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await prisma.accountEntry.create({
      data: {
        journalId: data.journalId,
        date: data.date ? new Date(data.date) : new Date(),
        pieceRef: data.pieceRef,
        description: data.description,
        accountNum: data.accountNum,
        accountName: data.accountName,
        debit: data.debit,
        credit: data.credit,
        sourceType: 'MANUAL',
        createdById: (session.user as any).id,
      },
    })

    revalidatePath("/finance")
    return { success: true }
  } catch (error) {
    console.error("Create accounting entry error:", error)
    return { success: false, error: "Erreur lors de la création" }
  }
}

export async function deleteAccountingEntry(id: string) {
  const session = await auth()
  if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await prisma.accountEntry.delete({ where: { id } })
    revalidatePath("/finance")
    return { success: true }
  } catch (error) {
    return { success: false, error: "Erreur lors de la suppression" }
  }
}

export async function getAccountChart() {
  return {
    success: true,
    data: [
      { num: '512', name: 'Banque', type: 'ACTIF' },
      { num: '571', name: 'Caisse', type: 'ACTIF' },
      { num: '401', name: 'Fournisseurs', type: 'PASSIF' },
      { num: '421', name: 'Personnel - Rémunérations dues', type: 'PASSIF' },
      { num: '441', name: 'État - TVA', type: 'PASSIF' },
      { num: '701', name: 'Ventes de services', type: 'PRODUIT' },
      { num: '601', name: 'Achats', type: 'CHARGE' },
      { num: '603', name: 'Fournitures', type: 'CHARGE' },
      { num: '611', name: 'Sous-traitance', type: 'CHARGE' },
      { num: '621', name: 'Honoraires consultants', type: 'CHARGE' },
      { num: '624', name: 'Transports', type: 'CHARGE' },
      { num: '625', name: 'Déplacements et missions', type: 'CHARGE' },
      { num: '631', name: 'Frais bancaires', type: 'CHARGE' },
      { num: '671', name: 'Charges diverses', type: 'CHARGE' },
    ],
  }
}

export async function getFinanceDashboardWithJournals(filters?: {
  startDate?: string
  endDate?: string
}) {
  const session = await auth()
  if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await ensureJournals()
    const whereDate: any = {}
    if (filters?.startDate) whereDate.gte = new Date(filters.startDate)
    if (filters?.endDate) whereDate.lte = new Date(filters.endDate)

    const enDateClause = Object.keys(whereDate).length > 0 ? { date: whereDate } : undefined

    const entries = await prisma.financeEntry.findMany({
      where: enDateClause,
      include: {
        project: { select: { id: true, name: true } },
        createdBy: { select: { id: true, name: true } },
      },
      orderBy: { date: 'desc' },
    })

    const paidInvoices = await prisma.invoice.findMany({
      where: { status: 'PAID', paidDate: Object.keys(whereDate).length > 0 ? whereDate : undefined },
      select: { total: true, paidDate: true },
    })

    const totalIncome = entries
      .filter((e: any) => e.type === 'INCOME')
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0) +
      paidInvoices.reduce((sum: number, i: any) => sum + Number(i.total), 0)

    const totalExpenses = entries
      .filter((e: any) => e.type === 'EXPENSE')
      .reduce((sum: number, e: any) => sum + Number(e.amount), 0)

    const balance = totalIncome - totalExpenses

    // Journal summary
    const journals = await prisma.accountingJournal.findMany({
      include: { _count: { select: { entries: true } } },
    })

    const journalTotals = await prisma.accountEntry.groupBy({
      by: ['journalId'],
      _sum: { debit: true, credit: true },
    })

    const journalsSummary = journals.map((j) => {
      const t = journalTotals.find((x) => x.journalId === j.id)
      return {
        id: j.id,
        label: j.label,
        code: j.code,
        type: j.type,
        entryCount: j._count.entries,
        total: Number(t?._sum?.credit || 0) + Number(t?._sum?.debit || 0),
      }
    })

    const totalJournalEntries = await prisma.accountEntry.count()

    return {
      success: true,
      data: {
        totalIncome,
        totalExpenses,
        balance: Number(balance),
        entries: JSON.parse(JSON.stringify(entries.slice(0, 20))),
        journalsSummary,
        totalJournalEntries,
        totalJournals: journals.length,
      },
    }
  } catch (error) {
    console.error("Dashboard error:", error)
    return { success: false, error: "Erreur lors du chargement" }
  }
}

export async function backfillJournalEntries() {
  const session = await auth()
  if (!session?.user || (session.user as any)?.role !== "DIRECTOR") {
    return { success: false, error: "Non autorisé" }
  }

  try {
    await ensureJournals()

    const existingAuto = await prisma.accountEntry.count({
      where: { sourceType: { not: 'MANUAL' } },
    })
    if (existingAuto > 0) {
      return { success: true, message: "Déjà alimenté" }
    }

    const paidInvoices = await prisma.invoice.findMany({
      where: { status: 'PAID', paidDate: { not: null } },
    })

    for (const inv of paidInvoices) {
      const banqueJournal = await prisma.accountingJournal.findUnique({ where: { type: 'BANQUE' } })
      const ventesJournal = await prisma.accountingJournal.findUnique({ where: { type: 'VENTES' } })
      if (!banqueJournal || !ventesJournal) continue

      const d = inv.paidDate || inv.createdAt

      await prisma.accountEntry.create({
        data: {
          journalId: banqueJournal.id,
          date: d,
          pieceRef: inv.number,
          description: `Encaissement facture ${inv.number}`,
          accountNum: '512',
          accountName: 'Banque',
          debit: Number(inv.total),
          credit: 0,
          sourceType: 'INVOICE',
          sourceId: inv.id,
          createdById: (session.user as any).id,
        },
      })

      await prisma.accountEntry.create({
        data: {
          journalId: ventesJournal.id,
          date: d,
          pieceRef: inv.number,
          description: `Vente - Facture ${inv.number}`,
          accountNum: '701',
          accountName: 'Ventes de services',
          debit: 0,
          credit: Number(inv.total),
          sourceType: 'INVOICE',
          sourceId: inv.id,
          createdById: (session.user as any).id,
        },
      })
    }

    const expenseEntries = await prisma.financeEntry.findMany({
      where: { type: 'EXPENSE' },
    })

    const odJournal = await prisma.accountingJournal.findUnique({ where: { type: 'OD' } })
    if (odJournal) {
      for (const exp of expenseEntries) {
        await prisma.accountEntry.create({
          data: {
            journalId: odJournal.id,
            date: exp.date,
            pieceRef: exp.description.slice(0, 50),
            description: exp.description,
            accountNum: exp.category === 'Transport' ? '624' :
              exp.category === 'Per Diem' ? '625' :
              exp.category === 'Honoraires Consultants' ? '621' :
              exp.category === 'Débours' ? '601' : '671',
            accountName: exp.category || 'Charges diverses',
            debit: Number(exp.amount),
            credit: 0,
            sourceType: 'FINANCE_ENTRY',
            sourceId: exp.id,
            createdById: (session.user as any).id,
          },
        })

        await prisma.accountEntry.create({
          data: {
            journalId: odJournal.id,
            date: exp.date,
            pieceRef: exp.description.slice(0, 50),
            description: `Contrepartie - ${exp.description}`,
            accountNum: '571',
            accountName: 'Caisse',
            debit: 0,
            credit: Number(exp.amount),
            sourceType: 'FINANCE_ENTRY',
            sourceId: exp.id,
            createdById: (session.user as any).id,
          },
        })
      }
    }

    revalidatePath("/finance")
    return { success: true, message: `Alimenté: ${paidInvoices.length} factures, ${expenseEntries.length} dépenses` }
  } catch (error) {
    console.error("Backfill error:", error)
    return { success: false, error: "Erreur lors de l'alimentation" }
  }
}

export async function autoFeedFromInvoice(invoiceId: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Non autorisé" }

  try {
    await ensureJournals()
    const invoice = await prisma.invoice.findUnique({ where: { id: invoiceId } })
    if (!invoice || invoice.status !== 'PAID') return { success: false, error: "Facture non payée" }

    const existing = await prisma.accountEntry.findFirst({
      where: { sourceType: 'INVOICE', sourceId: invoiceId },
    })
    if (existing) return { success: true }

    const banqueJournal = await prisma.accountingJournal.findUnique({ where: { type: 'BANQUE' } })
    const ventesJournal = await prisma.accountingJournal.findUnique({ where: { type: 'VENTES' } })
    if (!banqueJournal || !ventesJournal) return { success: false, error: "Journaux non trouvés" }

    const d = invoice.paidDate || new Date()

    await prisma.accountEntry.create({
      data: {
        journalId: banqueJournal.id,
        date: d,
        pieceRef: invoice.number,
        description: `Encaissement facture ${invoice.number}`,
        accountNum: '512',
        accountName: 'Banque',
        debit: Number(invoice.total),
        credit: 0,
        sourceType: 'INVOICE',
        sourceId: invoiceId,
        createdById: (session.user as any).id,
      },
    })

    await prisma.accountEntry.create({
      data: {
        journalId: ventesJournal.id,
        date: d,
        pieceRef: invoice.number,
        description: `Vente de services - Facture ${invoice.number}`,
        accountNum: '701',
        accountName: 'Ventes de services',
        debit: 0,
        credit: Number(invoice.total),
        sourceType: 'INVOICE',
        sourceId: invoiceId,
        createdById: (session.user as any).id,
      },
    })

    revalidatePath("/finance")
    return { success: true, message: "Écriture comptable créée" }
  } catch (error) {
    console.error("Auto feed error:", error)
    return { success: false, error: "Erreur" }
  }
}

export async function autoFeedFromFinanceEntry(entryId: string) {
  const session = await auth()
  if (!session?.user) return { success: false, error: "Non autorisé" }

  try {
    await ensureJournals()
    const entry = await prisma.financeEntry.findUnique({ where: { id: entryId } })
    if (!entry) return { success: false, error: "Entrée non trouvée" }

    const existing = await prisma.accountEntry.findFirst({
      where: { sourceType: 'FINANCE_ENTRY', sourceId: entryId },
    })
    if (existing) return { success: true }

    const odJournal = await prisma.accountingJournal.findUnique({ where: { type: 'OD' } })
    if (!odJournal) return { success: false, error: "Journal OD non trouvé" }

    const expAccountNum = entry.category === 'Transport' ? '624' :
      entry.category === 'Per Diem' ? '625' :
      entry.category === 'Honoraires Consultants' ? '621' :
      entry.category === 'Débours' ? '601' : '671'

    const expAccountName = entry.category || 'Charges diverses'

    if (entry.type === 'EXPENSE') {
      await prisma.accountEntry.create({
        data: {
          journalId: odJournal.id,
          date: entry.date,
          description: entry.description,
          accountNum: expAccountNum,
          accountName: expAccountName,
          debit: Number(entry.amount),
          credit: 0,
          sourceType: 'FINANCE_ENTRY',
          sourceId: entryId,
          createdById: (session.user as any).id,
        },
      })
      await prisma.accountEntry.create({
        data: {
          journalId: odJournal.id,
          date: entry.date,
          description: `Contrepartie - ${entry.description}`,
          accountNum: '571',
          accountName: 'Caisse',
          debit: 0,
          credit: Number(entry.amount),
          sourceType: 'FINANCE_ENTRY',
          sourceId: entryId,
          createdById: (session.user as any).id,
        },
      })
    } else {
      await prisma.accountEntry.create({
        data: {
          journalId: odJournal.id,
          date: entry.date,
          description: entry.description,
          accountNum: '701',
          accountName: 'Ventes de services',
          debit: 0,
          credit: Number(entry.amount),
          sourceType: 'FINANCE_ENTRY',
          sourceId: entryId,
          createdById: (session.user as any).id,
        },
      })
      await prisma.accountEntry.create({
        data: {
          journalId: odJournal.id,
          date: entry.date,
          description: `Contrepartie - ${entry.description}`,
          accountNum: '571',
          accountName: 'Caisse',
          debit: Number(entry.amount),
          credit: 0,
          sourceType: 'FINANCE_ENTRY',
          sourceId: entryId,
          createdById: (session.user as any).id,
        },
      })
    }

    revalidatePath("/finance")
    return { success: true }
  } catch (error) {
    console.error("Auto feed entry error:", error)
    return { success: false, error: "Erreur" }
  }
}
