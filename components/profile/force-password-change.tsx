"use client";

import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { changePassword } from "@/app/actions/profile";
import { Lock, Eye, EyeOff, AlertTriangle } from "lucide-react";

interface ForcePasswordChangeProps {
    open: boolean;
    onPasswordChanged: () => void;
}

export function ForcePasswordChange({ open, onPasswordChanged }: ForcePasswordChangeProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");

        if (newPassword !== confirmPassword) {
            setError("Les nouveaux mots de passe ne correspondent pas");
            return;
        }

        if (newPassword.length < 6) {
            setError("Le mot de passe doit contenir au moins 6 caractères");
            return;
        }

        if (currentPassword === newPassword) {
            setError("Le nouveau mot de passe doit être différent du mot de passe actuel");
            return;
        }

        setLoading(true);

        try {
            const result = await changePassword({ currentPassword, newPassword });

            if (result.success) {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                onPasswordChanged();
            } else {
                setError(typeof result.error === "string" ? result.error : "Erreur lors du changement de mot de passe");
            }
        } catch {
            setError("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={() => {}}>
            <DialogContent className="sm:max-w-md" onInteractOutside={(e) => e.preventDefault()}>
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-amber-100 dark:bg-amber-900/30">
                            <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                        </div>
                        Sécurité : changement de mot de passe requis
                    </DialogTitle>
                    <DialogDescription className="text-base">
                        Vous devez changer votre mot de passe avant de pouvoir accéder à l'application.
                        Veuillez choisir un mot de passe personnel et sécurisé.
                    </DialogDescription>
                </DialogHeader>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    <div className="space-y-2">
                        <Label htmlFor="force-currentPassword">Mot de passe actuel (provisoire)</Label>
                        <div className="relative">
                            <Input
                                id="force-currentPassword"
                                type={showCurrent ? "text" : "password"}
                                value={currentPassword}
                                onChange={(e) => setCurrentPassword(e.target.value)}
                                required
                                className="pr-10"
                                placeholder="Entrez le mot de passe provisoire"
                            />
                            <button
                                type="button"
                                onClick={() => setShowCurrent(!showCurrent)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="force-newPassword">Nouveau mot de passe</Label>
                        <div className="relative">
                            <Input
                                id="force-newPassword"
                                type={showNew ? "text" : "password"}
                                value={newPassword}
                                onChange={(e) => setNewPassword(e.target.value)}
                                required
                                minLength={6}
                                className="pr-10"
                                placeholder="Minimum 6 caractères"
                            />
                            <button
                                type="button"
                                onClick={() => setShowNew(!showNew)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="force-confirmPassword">Confirmer le nouveau mot de passe</Label>
                        <div className="relative">
                            <Input
                                id="force-confirmPassword"
                                type={showConfirm ? "text" : "password"}
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                required
                                minLength={6}
                                className="pr-10"
                                placeholder="Confirmez le nouveau mot de passe"
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg text-xs text-blue-700 dark:text-blue-400">
                        <p><strong>Rappel :</strong> Choisissez un mot de passe que vous retiendrez facilement mais que personne d'autre ne peut deviner. Ne le partagez avec personne.</p>
                    </div>

                    <div className="flex justify-end pt-2">
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? "Changement en cours..." : "Valider et continuer"}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}