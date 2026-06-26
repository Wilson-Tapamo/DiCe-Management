import { NextResponse } from "next/server";
import { prisma } from "@/db/prisma";
import { auth } from "@/lib/auth";

export async function GET(
    request: Request,
    { params }: { params: Promise<{ id: string }> }
) {
    const session = await auth();
    if (!session?.user) {
        return NextResponse.json({ error: "Non connecté" }, { status: 401 });
    }

    const { id } = await params;

    // Only allow checking your own status
    if (id !== session.user.id) {
        return NextResponse.json({ error: "Non autorisé" }, { status: 403 });
    }

    try {
        const user = await prisma.user.findUnique({
            where: { id },
            select: { mustChangePassword: true },
        });

        return NextResponse.json({ mustChangePassword: user?.mustChangePassword ?? false });
    } catch {
        return NextResponse.json({ mustChangePassword: false });
    }
}