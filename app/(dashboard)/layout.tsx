import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/db/prisma";
import { DashboardLayout } from "@/components/layout/dashboard-layout";

export default async function DashboardGroupLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session?.user) {
        redirect("/");
    }

    // Check if user needs to change password (skip on profile page)
    const user = session.user.id ? await prisma.user.findUnique({
        where: { id: session.user.id },
        select: { mustChangePassword: true }
    }) : null;

    if (user?.mustChangePassword) {
        redirect("/profile");
    }

    return (
        <DashboardLayout
            user={{
                name: session?.user?.name || "",
                email: session?.user?.email || "",
                avatar: (session?.user as any)?.avatar || "",
                role: (session?.user as any)?.role,
            }}
        >
            {children}
        </DashboardLayout>
    );
}
