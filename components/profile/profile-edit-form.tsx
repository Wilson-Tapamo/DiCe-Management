"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { updateProfile } from "@/app/actions/profile";
import { X, Plus, Save, ArrowLeft, Briefcase, GraduationCap, Wrench } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface ProfileEditFormProps {
    profile: any;
    onCancel: () => void;
    onSuccess: (updated: any) => void;
}

export function ProfileEditForm({ profile, onCancel, onSuccess }: ProfileEditFormProps) {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // Form fields
    const [name, setName] = useState(profile.name || "");
    const [phone, setPhone] = useState(profile.phone || "");
    const [title, setTitle] = useState(profile.title || "");
    const [description, setDescription] = useState(profile.description || "");

    // Skills
    const [skills, setSkills] = useState<string[]>(Array.isArray(profile.skills) ? profile.skills : []);
    const [newSkill, setNewSkill] = useState("");

    // Education
    const [education, setEducation] = useState<any[]>(Array.isArray(profile.education) ? profile.education : []);

    // Experience
    const [experience, setExperience] = useState<any[]>(Array.isArray(profile.experience) ? profile.experience : []);

    const addSkill = () => {
        if (newSkill.trim() && !skills.includes(newSkill.trim())) {
            setSkills([...skills, newSkill.trim()]);
            setNewSkill("");
        }
    };

    const removeSkill = (index: number) => {
        setSkills(skills.filter((_, i) => i !== index));
    };

    const addEducation = () => {
        setEducation([...education, { degree: "", school: "", year: "" }]);
    };

    const updateEducation = (index: number, field: string, value: string) => {
        const updated = [...education];
        updated[index] = { ...updated[index], [field]: value };
        setEducation(updated);
    };

    const removeEducation = (index: number) => {
        setEducation(education.filter((_, i) => i !== index));
    };

    const addExperience = () => {
        setExperience([...experience, { title: "", company: "", duration: "", description: "" }]);
    };

    const updateExperience = (index: number, field: string, value: string) => {
        const updated = [...experience];
        updated[index] = { ...updated[index], [field]: value };
        setExperience(updated);
    };

    const removeExperience = (index: number) => {
        setExperience(experience.filter((_, i) => i !== index));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");

        try {
            const formData = new FormData();
            formData.set("name", name);
            formData.set("phone", phone);
            formData.set("title", title);
            formData.set("description", description);
            formData.set("skills", JSON.stringify(skills));
            formData.set("education", JSON.stringify(education));
            formData.set("experience", JSON.stringify(experience));

            const result = await updateProfile(formData);

            if (result.success) {
                onSuccess({
                    ...profile,
                    name,
                    phone,
                    title,
                    description,
                    skills,
                    education,
                    experience,
                });
                router.refresh();
            } else {
                setError(typeof result.error === "string" ? result.error : "Erreur lors de la mise à jour");
            }
        } catch (err) {
            setError("Une erreur est survenue");
        } finally {
            setLoading(false);
        }
    };

    return (
        <form onSubmit={handleSubmit}>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                        <CardTitle>Modifier mon profil</CardTitle>
                        <p className="text-sm text-slate-500 mt-1">
                            Mettez à jour vos informations personnelles et professionnelles
                        </p>
                    </div>
                    <Button type="button" variant="ghost" onClick={onCancel}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Retour
                    </Button>
                </CardHeader>
                <CardContent className="space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg text-sm">
                            {error}
                        </div>
                    )}

                    {/* Basic Info */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3">Informations de base</h3>
                        <div className="grid gap-4 sm:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nom complet</Label>
                                <Input id="name" value={name} onChange={(e) => setName(e.target.value)} required />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="phone">Téléphone</Label>
                                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="title">Titre / Fonction</Label>
                                <Input id="title" value={title} onChange={(e) => setTitle(e.target.value)} />
                            </div>
                            <div className="space-y-2 sm:col-span-2">
                                <Label htmlFor="description">Description</Label>
                                <Textarea
                                    id="description"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    rows={3}
                                />
                            </div>
                        </div>
                    </div>

                    <Separator />

                    {/* Skills */}
                    <div>
                        <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-3 flex items-center gap-2">
                            <Wrench className="h-4 w-4" />
                            Compétences
                        </h3>
                        <div className="flex flex-wrap gap-2 mb-3">
                            {skills.map((skill, i) => (
                                <Badge key={i} variant="secondary" className="gap-1 pr-1">
                                    {skill}
                                    <button onClick={() => removeSkill(i)} className="ml-1 hover:text-red-500">
                                        <X className="h-3 w-3" />
                                    </button>
                                </Badge>
                            ))}
                        </div>
                        <div className="flex gap-2">
                            <Input
                                value={newSkill}
                                onChange={(e) => setNewSkill(e.target.value)}
                                placeholder="Ajouter une compétence..."
                                onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
                            />
                            <Button type="button" variant="outline" onClick={addSkill}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>

                    <Separator />

                    {/* Education */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <GraduationCap className="h-4 w-4" />
                                Formation
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addEducation}>
                                <Plus className="h-3 w-3 mr-1" />
                                Ajouter
                            </Button>
                        </div>
                        {education.map((edu, i) => (
                            <div key={i} className="flex gap-2 items-start mb-2 p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg">
                                <div className="flex-1 grid gap-2 sm:grid-cols-3">
                                    <Input
                                        value={edu.degree}
                                        onChange={(e) => updateEducation(i, "degree", e.target.value)}
                                        placeholder="Diplôme"
                                    />
                                    <Input
                                        value={edu.school}
                                        onChange={(e) => updateEducation(i, "school", e.target.value)}
                                        placeholder="Établissement"
                                    />
                                    <Input
                                        value={edu.year}
                                        onChange={(e) => updateEducation(i, "year", e.target.value)}
                                        placeholder="Année"
                                    />
                                </div>
                                <Button type="button" variant="ghost" size="icon" onClick={() => removeEducation(i)}>
                                    <X className="h-4 w-4 text-red-500" />
                                </Button>
                            </div>
                        ))}
                    </div>

                    <Separator />

                    {/* Experience */}
                    <div>
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 flex items-center gap-2">
                                <Briefcase className="h-4 w-4" />
                                Expérience
                            </h3>
                            <Button type="button" variant="outline" size="sm" onClick={addExperience}>
                                <Plus className="h-3 w-3 mr-1" />
                                Ajouter
                            </Button>
                        </div>
                        {experience.map((exp, i) => (
                            <div key={i} className="p-3 bg-slate-50 dark:bg-slate-800/30 rounded-lg mb-2">
                                <div className="flex gap-2 items-start">
                                    <div className="flex-1 grid gap-2 sm:grid-cols-2">
                                        <Input
                                            value={exp.title}
                                            onChange={(e) => updateExperience(i, "title", e.target.value)}
                                            placeholder="Poste"
                                        />
                                        <Input
                                            value={exp.company}
                                            onChange={(e) => updateExperience(i, "company", e.target.value)}
                                            placeholder="Entreprise"
                                        />
                                        <Input
                                            value={exp.duration}
                                            onChange={(e) => updateExperience(i, "duration", e.target.value)}
                                            placeholder="Durée"
                                        />
                                        <Input
                                            value={exp.description}
                                            onChange={(e) => updateExperience(i, "description", e.target.value)}
                                            placeholder="Description (optionnel)"
                                        />
                                    </div>
                                    <Button type="button" variant="ghost" size="icon" onClick={() => removeExperience(i)}>
                                        <X className="h-4 w-4 text-red-500" />
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
                <CardFooter className="flex justify-end gap-3 border-t px-6 py-4">
                    <Button type="button" variant="outline" onClick={onCancel}>
                        Annuler
                    </Button>
                    <Button type="submit" disabled={loading}>
                        <Save className="h-4 w-4 mr-2" />
                        {loading ? "Enregistrement..." : "Enregistrer"}
                    </Button>
                </CardFooter>
            </Card>
        </form>
    );
}