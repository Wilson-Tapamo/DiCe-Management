"use client";

import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { getInitials } from "@/lib/utils";
import {
    Edit,
    Lock,
    Mail,
    Phone,
    Briefcase,
    GraduationCap,
    Star,
    Award,
    Calendar,
    Building,
    MapPin,
    TrendingUp,
    CheckSquare,
    FolderKanban,
} from "lucide-react";

interface ProfileCardProps {
    profile: any;
    onEdit: () => void;
    onChangePassword: () => void;
}

const levelLabels: Record<string, string> = {
    JUNIOR: "Junior",
    INTERMEDIATE: "Intermédiaire",
    SENIOR: "Senior",
    DIRECTOR: "Directeur",
};

const levelColors: Record<string, string> = {
    JUNIOR: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
    INTERMEDIATE: "bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400",
    SENIOR: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400",
    DIRECTOR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
};

export function ProfileCard({ profile, onEdit, onChangePassword }: ProfileCardProps) {
    const skills = Array.isArray(profile.skills) ? profile.skills : [];
    const education = Array.isArray(profile.education) ? profile.education : [];
    const experience = Array.isArray(profile.experience) ? profile.experience : [];

    return (
        <div className="space-y-6">
            {/* Header Card */}
            <Card className="overflow-hidden">
                <div className="h-32 bg-gradient-to-r from-blue-600 via-blue-500 to-sky-500" />
                <CardContent className="relative -mt-16 p-6">
                    <div className="flex flex-col sm:flex-row items-start gap-6">
                        <Avatar className="h-24 w-24 ring-4 ring-white dark:ring-slate-900 shadow-xl">
                            <AvatarFallback className="text-2xl bg-gradient-to-br from-blue-600 to-blue-400 text-white">
                                {getInitials(profile.name || "User")}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1 pt-2 sm:pt-12 w-full">
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                <div>
                                    <h1 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
                                        {profile.name}
                                    </h1>
                                    {profile.title && (
                                        <p className="text-slate-500 dark:text-slate-400 mt-1 text-sm sm:text-base">
                                            {profile.title}
                                        </p>
                                    )}
                                </div>
                                <div className="flex gap-2 w-full sm:w-auto">
                                    <Button
                                        onClick={onEdit}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-9 px-3"
                                    >
                                        <Edit className="h-4 w-4 shrink-0" />
                                        <span>Modifier</span>
                                    </Button>
                                    <Button
                                        onClick={onChangePassword}
                                        variant="outline"
                                        size="sm"
                                        className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50 h-9 px-3"
                                    >
                                        <Lock className="h-4 w-4 shrink-0" />
                                        <span>Mot de passe</span>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="grid gap-6 md:grid-cols-3">
                {/* Info Column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Informations</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3 text-sm">
                            <Mail className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-300">{profile.email}</span>
                        </div>
                        {profile.phone && (
                            <div className="flex items-center gap-3 text-sm">
                                <Phone className="h-4 w-4 text-slate-400" />
                                <span className="text-slate-600 dark:text-slate-300">{profile.phone}</span>
                            </div>
                        )}
                        <div className="flex items-center gap-3 text-sm">
                            <Briefcase className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-300 capitalize">{profile.role?.toLowerCase()}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Award className="h-4 w-4 text-slate-400" />
                            <Badge className={levelColors[profile.level] || ""} variant="outline">
                                {levelLabels[profile.level] || profile.level}
                            </Badge>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                            <Calendar className="h-4 w-4 text-slate-400" />
                            <span className="text-slate-600 dark:text-slate-300">
                                Membre depuis {new Date(profile.createdAt).toLocaleDateString("fr-FR", { year: "numeric", month: "long" })}
                            </span>
                        </div>
                        {profile.rating > 0 && (
                            <div className="flex items-center gap-3 text-sm">
                                <Star className="h-4 w-4 text-amber-400" />
                                <span className="text-slate-600 dark:text-slate-300">{profile.rating}/5</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Stats Column */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Statistiques</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <FolderKanban className="h-5 w-5 text-blue-500" />
                                <span className="text-sm font-medium">Projets</span>
                            </div>
                            <span className="text-lg font-bold">{profile._count?.consultingProjects || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <CheckSquare className="h-5 w-5 text-emerald-500" />
                                <span className="text-sm font-medium">Tâches assignées</span>
                            </div>
                            <span className="text-lg font-bold">{profile._count?.assignedTasks || 0}</span>
                        </div>
                        <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <div className="flex items-center gap-3">
                                <TrendingUp className="h-5 w-5 text-purple-500" />
                                <span className="text-sm font-medium">Tâches créées</span>
                            </div>
                            <span className="text-lg font-bold">{profile._count?.createdTasks || 0}</span>
                        </div>
                        {profile.monthlySalary > 0 && (
                            <div className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                <div className="flex items-center gap-3">
                                    <Building className="h-5 w-5 text-amber-500" />
                                    <span className="text-sm font-medium">Salaire mensuel</span>
                                </div>
                                <span className="text-lg font-bold">{Number(profile.monthlySalary).toLocaleString("fr-FR")} FCFA</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Description & Skills */}
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Aperçu</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {profile.description && (
                            <div>
                                <p className="text-sm text-slate-600 dark:text-slate-300">{profile.description}</p>
                            </div>
                        )}
                        <Separator />
                        <div>
                            <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">Compétences</h3>
                            <div className="flex flex-wrap gap-1.5">
                                {skills.length > 0 ? skills.map((skill: string, i: number) => (
                                    <Badge key={i} variant="secondary" className="text-xs">
                                        {skill}
                                    </Badge>
                                )) : (
                                    <p className="text-xs text-slate-400">Aucune compétence renseignée</p>
                                )}
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Education & Experience */}
            <div className="grid gap-6 md:grid-cols-2">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <GraduationCap className="h-5 w-5 text-blue-500" />
                            Formation
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {education.length > 0 ? (
                            <div className="space-y-4">
                                {education.map((edu: any, i: number) => (
                                    <div key={i} className="border-l-2 border-blue-200 dark:border-blue-800 pl-4">
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{edu.degree}</p>
                                        <p className="text-sm text-slate-500">{edu.school}</p>
                                        {edu.year && <p className="text-xs text-slate-400">{edu.year}</p>}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Aucune formation renseignée</p>
                        )}
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg flex items-center gap-2">
                            <Briefcase className="h-5 w-5 text-emerald-500" />
                            Expérience
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        {experience.length > 0 ? (
                            <div className="space-y-4">
                                {experience.map((exp: any, i: number) => (
                                    <div key={i} className="border-l-2 border-emerald-200 dark:border-emerald-800 pl-4">
                                        <p className="font-medium text-slate-800 dark:text-slate-200">{exp.title}</p>
                                        <p className="text-sm text-slate-500">{exp.company}</p>
                                        {exp.duration && <p className="text-xs text-slate-400">{exp.duration}</p>}
                                        {exp.description && (
                                            <p className="text-xs text-slate-500 mt-1">{exp.description}</p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <p className="text-sm text-slate-400">Aucune expérience renseignée</p>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}