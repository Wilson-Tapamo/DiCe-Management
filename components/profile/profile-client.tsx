"use client";

import { useState, useEffect } from "react";
import { ProfileCard } from "./profile-card";
import { ProfileEditForm } from "./profile-edit-form";
import { PasswordChangePopup } from "./password-change-popup";
import { ForcePasswordChange } from "./force-password-change";

interface ProfileClientProps {
    profile: any;
}

export function ProfileClient({ profile }: ProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [forceChange, setForceChange] = useState(profile.mustChangePassword);
    const [profileData, setProfileData] = useState(profile);

    useEffect(() => {
        if (profile.mustChangePassword) {
            setForceChange(true);
            setShowPasswordPopup(true);
        }
    }, [profile.mustChangePassword]);

    const handlePasswordChanged = () => {
        setForceChange(false);
        setShowPasswordPopup(false);
        setProfileData((prev: any) => ({ ...prev, mustChangePassword: false }));
    };

    const handleProfileUpdated = (updated: any) => {
        setProfileData(updated);
        setIsEditing(false);
    };

    // Force password change overlay
    if (forceChange) {
        return (
            <>
                <ForcePasswordChange
                    open={showPasswordPopup}
                    onPasswordChanged={handlePasswordChanged}
                />
                {/* Show profile read-only while password change is required */}
                <div className="opacity-50 pointer-events-none">
                    <ProfileCard
                        profile={profileData}
                        onEdit={() => {}}
                        onChangePassword={() => {}}
                    />
                </div>
            </>
        );
    }

    return (
        <div className="space-y-6">
            {/* Optional: show password popup manually */}
            <PasswordChangePopup
                open={showPasswordPopup}
                onOpenChange={setShowPasswordPopup}
                onSuccess={handlePasswordChanged}
            />

            {isEditing ? (
                <ProfileEditForm
                    profile={profileData}
                    onCancel={() => setIsEditing(false)}
                    onSuccess={handleProfileUpdated}
                />
            ) : (
                <ProfileCard
                    profile={profileData}
                    onEdit={() => setIsEditing(true)}
                    onChangePassword={() => setShowPasswordPopup(true)}
                />
            )}
        </div>
    );
}