"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ForcePasswordChange } from "./force-password-change";

interface MustChangePasswordCheckProps {
    userId: string;
}

export function MustChangePasswordCheck({ userId }: MustChangePasswordCheckProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [mustChange, setMustChange] = useState(false);
    const [checking, setChecking] = useState(true);

    useEffect(() => {
        async function check() {
            try {
                const res = await fetch(`/api/users/${userId}/must-change-password`);
                const data = await res.json();
                setMustChange(data.mustChangePassword);
            } catch {
                // ignore
            } finally {
                setChecking(false);
            }
        }
        check();
    }, [userId]);

    // If must change password and NOT on /profile, redirect to /profile
    useEffect(() => {
        if (!checking && mustChange && pathname !== "/profile") {
            router.push("/profile");
        }
    }, [checking, mustChange, pathname, router]);

    const handlePasswordChanged = () => {
        setMustChange(false);
    };

    if (checking) return null;

    // On the profile page, show the force change popup
    if (mustChange && pathname === "/profile") {
        return <ForcePasswordChange open={true} onPasswordChanged={handlePasswordChanged} />;
    }

    return null;
}