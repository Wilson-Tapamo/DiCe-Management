import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/app/actions/profile";
import { ProfileClient } from "@/components/profile/profile-client";

export default async function ProfilePage() {
    const session = await auth();
    if (!session?.user) redirect("/");

    const { success, data: profile, error } = await getCurrentUserProfile();

    if (!success || !profile) {
        return (
            <div className="p-8 text-center text-red-500">
                Erreur: {error || "Impossible de charger le profil"}
            </div>
        );
    }

    const serializedProfile = JSON.parse(JSON.stringify(profile));

    return <ProfileClient profile={serializedProfile} />;
}