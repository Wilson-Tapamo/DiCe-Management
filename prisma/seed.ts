import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
    console.log("Start seeding DiCe Management...");

    // 1. Nettoyer toutes les données existantes
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

    const defaultPassword = await bcrypt.hash("pasword123", 10);

    // ================================================================
    // PERSONNEL CONSERVÉ
    // ================================================================

    // 1. Wilson Tapamo (conservé)
    const wilson = await prisma.user.create({
        data: {
            email: "wilson.tapamo@dice-management.com",
            name: "Wilson Tapamo",
            password: defaultPassword,
            role: "DIRECTOR",
            title: "Coordinateur des programmes",
            description:
                "Responsable de la planification des formations, conferences et activites de Diamond Center.",
            phone: "+237 6 99 00 00 00",
            level: "DIRECTOR",
            mustChangePassword: true,
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

    // 2. Dr T.G SONNFO (conservé, avec téléphone corrigé)
    const drSonffo = await prisma.user.create({
        data: {
            email: "tg.sonffo@dice-management.com",
            name: "Dr T.G SONNFO",
            password: defaultPassword,
            role: "DIRECTOR",
            title: "Dirigeant Directeur",
            description: "Dirigeant et directeur général de DiCe Management.",
            phone: "+237 55268913",
            level: "DIRECTOR",
            mustChangePassword: true,
            skills: ["Direction", "Stratégie", "Management", "Leadership", "Prise de décision"],
            education: [
                {
                    degree: "Doctorat en Gestion",
                    school: "Université de Yaoundé",
                    year: "2015",
                },
            ],
            experience: [
                {
                    title: "Dirigeant Directeur",
                    company: "DiCe (Diamond Center) Management",
                    duration: "10 ans",
                    description: "Direction générale et pilotage stratégique de l'entreprise.",
                },
            ],
        },
    });

    // ================================================================
    // NOUVEAU PERSONNEL
    // ================================================================

    // 3. Serge BOUMSONG — Directeur Commercial, senior
    const serge = await prisma.user.create({
        data: {
            email: "serge.boumsong@dice-management.com",
            name: "Serge BOUMSONG",
            password: defaultPassword,
            role: "DIRECTOR",
            title: "Directeur Commercial",
            description: "Directeur commercial senior chargé du développement des ventes et du portefeuille clients.",
            phone: "+237 6 94 27 66 59",
            level: "SENIOR",
            mustChangePassword: true,
            skills: ["Gestion commerciale", "Négociation", "Développement client", "Stratégie commerciale", "Management d'équipe"],
            education: [
                {
                    degree: "Master en Commerce International",
                    school: "Université de Douala",
                    year: "2012",
                },
            ],
            experience: [
                {
                    title: "Directeur Commercial",
                    company: "DiCe (Diamond Center) Management",
                    duration: "3 ans",
                    description: "Pilotage de la stratégie commerciale et développement du portefeuille clients.",
                },
            ],
        },
    });

    // 4. Mannuella — Comptable junior
    const mannuella = await prisma.user.create({
        data: {
            email: "mannuella@dice-management.com",
            name: "Mannuella",
            password: defaultPassword,
            role: "CONSULTANT",
            title: "Comptable Junior",
            description: "Comptable junior en charge de la saisie comptable et du classement des documents.",
            phone: "+237 691344506",
            level: "JUNIOR",
            mustChangePassword: true,
            skills: ["Comptabilité générale", "Saisie comptable", "Classement", "Archivage", "Excel"],
            education: [
                {
                    degree: "BTS Comptabilité et Gestion",
                    school: "Institut de Formation de Douala",
                    year: "2023",
                },
            ],
        },
    });

    // 5. Hope — Coordinateur intermédiaire
    const hope = await prisma.user.create({
        data: {
            email: "hope@dice-management.com",
            name: "Hope",
            password: defaultPassword,
            role: "CONSULTANT",
            title: "Coordinateur",
            description: "Coordinateur intermédiaire chargé du suivi des programmes et de la coordination des équipes.",
            phone: "+237 670208668",
            level: "INTERMEDIATE",
            mustChangePassword: true,
            skills: ["Coordination", "Suivi de projet", "Organisation", "Communication"],
            education: [
                {
                    degree: "Licence en Gestion de Projet",
                    school: "Université de Douala",
                    year: "2021",
                },
            ],
            experience: [
                {
                    title: "Coordinateur",
                    company: "DiCe (Diamond Center) Management",
                    duration: "2 ans",
                    description: "Coordination des activités et suivi des équipes projets.",
                },
            ],
        },
    });

    // 6. Hervé — Community Manager principal senior
    const herve = await prisma.user.create({
        data: {
            email: "herve@dice-management.com",
            name: "Hervé",
            password: defaultPassword,
            role: "CONSULTANT",
            title: "Community Manager Principal",
            description: "Community manager principal senior en charge de la stratégie de communication et des réseaux sociaux.",
            phone: "+237 90462829",
            level: "SENIOR",
            mustChangePassword: true,
            skills: ["Community Management", "Stratégie digitale", "Création de contenu", "Réseaux sociaux", "Communication"],
            education: [
                {
                    degree: "Master en Communication Digitale",
                    school: "Université de Yaoundé",
                    year: "2018",
                },
            ],
            experience: [
                {
                    title: "Community Manager Principal",
                    company: "DiCe (Diamond Center) Management",
                    duration: "5 ans",
                    description: "Gestion de la stratégie de communication digitale et animation des réseaux sociaux.",
                },
            ],
        },
    });

    // ================================================================
    // PROJETS
    // ================================================================

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
                connect: [
                    { id: wilson.id },
                    { id: drSonffo.id },
                    { id: serge.id },
                    { id: hope.id },
                    { id: herve.id },
                ],
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
                connect: [
                    { id: wilson.id },
                    { id: drSonffo.id },
                    { id: serge.id },
                    { id: hope.id },
                    { id: herve.id },
                ],
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

    console.log("Seed complete.");
    console.log("====================================");
    console.log("Personnel créé avec succès :");
    console.log("1. Wilson Tapamo - Coordinateur des programmes");
    console.log("2. Dr T.G SONNFO - Dirigeant Directeur");
    console.log("3. Serge BOUMSONG - Directeur Commercial (senior)");
    console.log("4. Mannuella - Comptable Junior");
    console.log("5. Hope - Coordinateur (intermédiaire)");
    console.log("6. Hervé - Community Manager Principal (senior)");
    console.log("====================================");
    console.log("Email: wilson.tapamo@dice-management.com");
    console.log("Email: tg.sonffo@dice-management.com");
    console.log("Email: serge.boumsong@dice-management.com");
    console.log("Email: mannuella@dice-management.com");
    console.log("Email: hope@dice-management.com");
    console.log("Email: herve@dice-management.com");
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