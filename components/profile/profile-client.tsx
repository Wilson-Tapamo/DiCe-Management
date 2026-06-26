"use client";

import { useState } from "react";
import { ProfileCard } from "./profile-card";
import { ProfileEditForm } from "./profile-edit-form";
import { PasswordChangePopup } from "./password-change-popup";

interface ProfileClientProps {
    profile: any;
}

export function ProfileClient({ profile }: ProfileClientProps) {
    const [isEditing, setIsEditing] = useState(false);
    const [showPasswordPopup, setShowPasswordPopup] = useState(false);
    const [profileData, setProfileData] = useState(profile);

    const handlePasswordChanged = () => {
        setShowPasswordPopup(false);
    };

    const handleProfileUpdated = (updated: any) => {
        setProfileData(updated);
        setIsEditing(false);
    };

    return (
        <div className="space-y-6">
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