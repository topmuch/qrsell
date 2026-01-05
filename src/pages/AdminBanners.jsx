import React, { useState, useEffect } from "react";
import { base44 } from "@/api/base44Client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit2, Trash2, Eye, EyeOff, AlertCircle } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import BannerForm from "../components/banners/BannerForm";
import { motion, AnimatePresence } from "framer-motion";

export default function AdminBannersPage() {
    const [user, setUser] = useState(null);
    const [showForm, setShowForm] = useState(false);
    const [editingBanner, setEditingBanner] = useState(null);
    const queryClient = useQueryClient();

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = await base44.auth.me();
            setUser(currentUser);
            
            // Vérifier si superadmin
            if (currentUser.role !== 'admin') {
                window.location.href = '/';
            }
        };
        checkAuth();
    }, []);

    const { data: banners = [], isLoading } = useQuery({
        queryKey: ['banners'],
        queryFn: () => base44.entities.Banner.list('-created_date'),
    });

    const createMutation = useMutation({
        mutationFn: (data) => base44.entities.Banner.create(data),
        onSuccess: () => {
            queryClient.invalidateQueries(['banners']);
            setShowForm(false);
            setEditingBanner(null);
        },
    });

    const updateMutation = useMutation({
        mutationFn: ({ id, data }) => base44.entities.Banner.update(id, data),
        onSuccess: () => {
            queryClient.invalidateQueries(['banners']);
            setShowForm(false);
            setEditingBanner(null);
        },
    });

    const deleteMutation = useMutation({
        mutationFn: (id) => base44.entities.Banner.delete(id),
        onSuccess: () => {
            queryClient.invalidateQueries(['banners']);
        },
    });

    const handleSubmit = (data) => {
        if (editingBanner) {
            updateMutation.mutate({ id: editingBanner.id, data });
        } else {
            createMutation.mutate(data);
        }
    };

    const handleEdit = (banner) => {
        setEditingBanner(banner);
        setShowForm(true);
    };

    const handleDelete = (id) => {
        if (confirm('Êtes-vous sûr de vouloir supprimer cette bannière ?')) {
            deleteMutation.mutate(id);
        }
    };

    const toggleActive = (banner) => {
        updateMutation.mutate({
            id: banner.id,
            data: { ...banner, is_active: !banner.is_active }
        });
    };

    const positionLabels = {
        header: "En-tête",
        footer: "Pied de page",
        sidebar: "Barre latérale",
        "product-page": "Page produit",
        dashboard: "Dashboard"
    };

    const targetLabels = {
        all: "Tous",
        pro: "Pro",
        starter: "Starter"
    };

    const positionColors = {
        header: "bg-amber-100 text-amber-800",
        footer: "bg-blue-100 text-blue-800",
        sidebar: "bg-purple-100 text-purple-800",
        "product-page": "bg-green-100 text-green-800",
        dashboard: "bg-sky-100 text-sky-800"
    };

    if (!user) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Gestion des bannières
                        </h1>
                        <p className="text-gray-600">
                            Créez et gérez les bannières publicitaires de l'application
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            setEditingBanner(null);
                            setShowForm(!showForm);
                        }}
                        className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nouvelle bannière
                    </Button>
                </div>

                <AnimatePresence>
                    {showForm && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            className="mb-8"
                        >
                            <BannerForm
                                banner={editingBanner}
                                onSubmit={handleSubmit}
                                onCancel={() => {
                                    setShowForm(false);
                                    setEditingBanner(null);
                                }}
                            />
                        </motion.div>
                    )}
                </AnimatePresence>

                {isLoading ? (
                    <div className="flex justify-center py-12">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-500"></div>
                    </div>
                ) : banners.length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                            <p className="text-gray-600 mb-4">Aucune bannière créée</p>
                            <Button
                                onClick={() => setShowForm(true)}
                                variant="outline"
                            >
                                Créer la première bannière
                            </Button>
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-4">
                        {banners.map((banner) => {
                            const now = new Date();
                            const startDate = new Date(banner.start_date);
                            const endDate = new Date(banner.end_date);
                            const isActive = banner.is_active && now >= startDate && now <= endDate;

                            return (
                                <motion.div
                                    key={banner.id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                >
                                    <Card className={`${!isActive ? 'opacity-60' : ''}`}>
                                        <CardHeader className="pb-3">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <div className="flex items-center gap-2 mb-2">
                                                        <Badge className={positionColors[banner.position]}>
                                                            {positionLabels[banner.position]}
                                                        </Badge>
                                                        <Badge variant="outline">
                                                            {targetLabels[banner.target]}
                                                        </Badge>
                                                        {isActive ? (
                                                            <Badge className="bg-green-100 text-green-800">
                                                                <Eye className="w-3 h-3 mr-1" />
                                                                Active
                                                            </Badge>
                                                        ) : (
                                                            <Badge variant="secondary">
                                                                <EyeOff className="w-3 h-3 mr-1" />
                                                                Inactive
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <CardTitle className="text-lg">
                                                        {banner.text}
                                                    </CardTitle>
                                                </div>
                                                <div className="flex gap-2">
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => toggleActive(banner)}
                                                    >
                                                        {banner.is_active ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleEdit(banner)}
                                                    >
                                                        <Edit2 className="w-4 h-4" />
                                                    </Button>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        onClick={() => handleDelete(banner.id)}
                                                        className="text-red-600 hover:text-red-700"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </div>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                                {banner.image_url && (
                                                    <div className="col-span-2 md:col-span-1">
                                                        <p className="text-xs text-gray-500 mb-1">Image</p>
                                                        <img 
                                                            src={banner.image_url} 
                                                            alt="" 
                                                            className="w-full h-20 object-cover rounded-lg border"
                                                        />
                                                    </div>
                                                )}
                                                {banner.link && (
                                                    <div className="col-span-2">
                                                        <p className="text-xs text-gray-500 mb-1">Lien</p>
                                                        <a 
                                                            href={banner.link} 
                                                            target="_blank" 
                                                            rel="noopener noreferrer"
                                                            className="text-sm text-blue-600 hover:underline truncate block"
                                                        >
                                                            {banner.link}
                                                        </a>
                                                    </div>
                                                )}
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Début</p>
                                                    <p className="text-sm font-medium">
                                                        {format(startDate, 'dd MMM yyyy', { locale: fr })}
                                                    </p>
                                                </div>
                                                <div>
                                                    <p className="text-xs text-gray-500 mb-1">Fin</p>
                                                    <p className="text-sm font-medium">
                                                        {format(endDate, 'dd MMM yyyy', { locale: fr })}
                                                    </p>
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}