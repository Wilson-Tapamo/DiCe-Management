import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding DiCe Management...");

    await prisma.notification.deleteMany();
    await prisma.financeEntry.deleteMany();
    await prisma.taskHours.deleteMany();
    await prisma.comment.deleteMany();
    await prisma.subTask.deleteMany();
    await prisma.payment.deleteMany();
    await prisma.invoiceLine.deleteMany();
    await prisma.invoice.deleteMany();
    await prisma.task.deleteMany();
    await prisma.project.deleteMany();
    await prisma.user.deleteMany();

    const password = await bcrypt.hash("pasword123", 10);

    // Mot de passe commun pour les tests
    const testPassword = await bcrypt.hash("pasword123", 10);

    const wilson = await prisma.user.create({
        data: {
            email: "wilson.tapamo@dice-management.com",
            name: "Wilson Tapamo",
            password,
            role: "DIRECTOR",
            title: "Coordinateur des programmes",
            description:
                "Responsable de la planification des formations, conferences et activites de Diamond Center.",
            phone: "+237 6 99 00 00 00",
            level: "DIRECTOR",
            skills: [
                "Gestion de programmes",
                "Entrepreneuriat",
                "Vente",
                "Art oratoire",
                "Coordination d'equipe",
            ],
            education: [
                {
                    degree: "Licence en gestion des organisations",
                    school: "Universite de Douala",
                    year: "2020",
                },
            ],
            experience: [
                {
                    title: "Coordinateur des formations",
                    company: "DiCe (Diamond Center) Management",
                    duration: "4 ans",
                    description:
                        "Organisation de sessions de formation, suivi des intervenants et coordination logistique.",
                },
            ],
        },
    });

    const programmes = await prisma.project.create({
        data: {
            name: "Programme Entrepreneuriat Jeunes Leaders",
            description:
                "Cycle de formation pour aider les participants a structurer une idee, valider un marche et preparer un pitch clair.",
            status: "IN_PROGRESS",
            type: "FINANCIER",
            clientName: "Participants DiCe",
            clientContact: "Equipe programme",
            clientPhone: "+237 6 90 00 00 00",
            clientEmail: "programmes@dice-management.com",
            startDate: new Date("2026-06-10"),
            endDate: new Date("2026-07-19"),
            priority: "HIGH",
            progress: 45,
            expertise: "Entrepreneuriat, motivation, vente",
            managerId: wilson.id,
            consultants: {
                connect: [{ id: wilson.id }],
            },
        },
    });

    const conference = await prisma.project.create({
        data: {
            name: "Conference Art Oratoire et Leadership",
            description:
                "Evenement public autour de la prise de parole, du leadership personnel et de la communication persuasive.",
            status: "PENDING",
            type: "JURIDIQUE",
            clientName: "Communaute Diamond Center",
            clientContact: "Comite d'organisation",
            clientPhone: "+237 6 91 00 00 00",
            clientEmail: "events@dice-management.com",
            startDate: new Date("2026-08-03"),
            endDate: new Date("2026-08-03"),
            priority: "MEDIUM",
            progress: 20,
            expertise: "Art oratoire, motivation, leadership",
            managerId: wilson.id,
            consultants: {
                connect: [{ id: wilson.id }],
            },
        },
    });

    const moduleTask = await prisma.task.create({
        data: {
            title: "Finaliser les modules de formation entrepreneuriat",
            description:
                "Verifier les supports sur l'identification d'opportunites, le business model et le pitch commercial.",
            status: "IN_PROGRESS",
            priority: 3,
            dueDate: new Date("2026-06-08"),
            projectId: programmes.id,
            creatorId: wilson.id,
            assignees: {
                connect: [{ id: wilson.id }],
            },
            subtasks: {
                create: [
                    { title: "Valider le plan de cours", completed: true },
                    { title: "Preparer les exercices pratiques", completed: false },
                    { title: "Relire les slides intervenants", completed: false },
                ],
            },
        },
    });

    await prisma.task.create({
        data: {
            title: "Confirmer la salle et le materiel de conference",
            description:
                "Verifier la disponibilite de la salle, la sonorisation, le projecteur et l'accueil des participants.",
            status: "TODO",
            priority: 2,
            dueDate: new Date("2026-07-20"),
            projectId: conference.id,
            creatorId: wilson.id,
            assignees: {
                connect: [{ id: wilson.id }],
            },
        },
    });

    await prisma.taskHours.create({
        data: {
            taskId: moduleTask.id,
            userId: wilson.id,
            hours: 6,
            description: "Preparation des supports et sequence pedagogique.",
        },
    });

    await prisma.comment.create({
        data: {
            taskId: moduleTask.id,
            userId: wilson.id,
            content:
                "Priorite cette semaine: rendre les exercices directement applicables pour les participants.",
        },
    });

    await prisma.financeEntry.createMany({
        data: [
            {
                type: "EXPENSE",
                amount: 125000,
                description: "Reservation salle de formation",
                category: "Logistique",
                date: new Date("2026-06-01"),
                projectId: programmes.id,
                createdById: wilson.id,
            },
            {
                type: "EXPENSE",
                amount: 85000,
                description: "Impression des supports participants",
                category: "Supports",
                date: new Date("2026-06-02"),
                projectId: programmes.id,
                taskId: moduleTask.id,
                createdById: wilson.id,
            },
            {
                type: "INCOME",
                amount: 450000,
                description: "Inscriptions au programme entrepreneuriat",
                category: "Inscriptions",
                date: new Date("2026-06-03"),
                projectId: programmes.id,
                createdById: wilson.id,
            },
        ],
    });

    await prisma.notification.create({
        data: {
            userId: wilson.id,
            type: "TASK",
            title: "Preparation programme",
            message:
                "Les modules du Programme Entrepreneuriat Jeunes Leaders doivent etre finalises avant le 8 juin.",
            link: "/tasks",
        },
    });

    // Création des comptes utilisateurs supplémentaires
    const herve = await prisma.user.create({
        data: {
            email: "herve@dice-management.com",
            name: "Herve",
            password: testPassword,
            role: "DIRECTOR",
            title: "Consultant Principal",
            description: "Consultant senior chez DiCe Management.",
            phone: "+237 6 77 00 00 01",
            level: "DIRECTOR",
            skills: ["Gestion de projet", "Conseil", "Analyse financière"],
        },
    });

    const hope = await prisma.user.create({
        data: {
            email: "hope@dice-management.com",
            name: "Hope",
            password: testPassword,
            role: "DIRECTOR",
            title: "Consultant Senior",
            description: "Consultant senior spécialisé en accompagnement des programmes.",
            phone: "+237 6 77 00 00 02",
            level: "DIRECTOR",
            skills: ["Accompagnement", "Formation", "Suivi de projet"],
        },
    });

    const tgSonffo = await prisma.user.create({
        data: {
            email: "tg.sonffo@dice-management.com",
            name: "T.G SONFFO",
            password: testPassword,
            role: "DIRECTOR",
            title: "Directeur Général",
            description: "Directeur général de DiCe Management.",
            phone: "+237 6 77 00 00 03",
            level: "DIRECTOR",
            skills: ["Direction", "Stratégie", "Management", "Leadership"],
        },
    });

    // Ajouter les nouveaux utilisateurs comme consultants sur les projets existants
    if (programmes) {
        await prisma.project.update({
            where: { id: programmes.id },
            data: {
                consultants: {
                    connect: [
                        { id: herve.id },
                        { id: hope.id },
                        { id: tgSonffo.id },
                    ],
                },
            },
        });
    }

    if (conference) {
        await prisma.project.update({
            where: { id: conference.id },
            data: {
                consultants: {
                    connect: [
                        { id: herve.id },
                        { id: hope.id },
                        { id: tgSonffo.id },
                    ],
                },
            },
        });
    }

    console.log("Seed complete.");
    console.log("Login: wilson.tapamo@dice-management.com");
    console.log("Password: pasword123");
    console.log("Login: herve@dice-management.com");
    console.log("Login: hope@dice-management.com");
    console.log("Login: tg.sonffo@dice-management.com");
    console.log("Password for all: pasword123");
}

main()
    .catch((error) => {
        console.error(error);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
