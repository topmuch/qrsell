import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon, Upload } from "lucide-react";
import { format } from "date-fns";
import { fr } from "date-fns/locale";
import { base44 } from "@/api/base44Client";

export default function BannerForm({ banner, onSubmit, onCancel }) {
    const [formData, setFormData] = useState(banner || {
        image_url: "",
        link: "",
        text: "",
        position: "header",
        target: "all",
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
        is_active: true
    });
    const [uploading, setUploading] = useState(false);

    const handleImageUpload = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        const { file_url } = await base44.integrations.Core.UploadFile({ file });
        setFormData({ ...formData, image_url: file_url });
        setUploading(false);
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onSubmit(formData);
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-xl border border-gray-200">
            <div className="space-y-2">
                <Label htmlFor="text">Texte de la bannière *</Label>
                <Textarea
                    id="text"
                    value={formData.text}
                    onChange={(e) => setFormData({ ...formData, text: e.target.value })}
                    placeholder="Nouvelle fonctionnalité : QR dynamiques !"
                    required
                    className="h-20"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="image">Image</Label>
                <div className="flex items-center gap-4">
                    <Input
                        id="image"
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        disabled={uploading}
                        className="flex-1"
                    />
                    {formData.image_url && (
                        <img 
                            src={formData.image_url} 
                            alt="Preview" 
                            className="w-16 h-16 object-cover rounded-lg border"
                        />
                    )}
                </div>
                <Input
                    value={formData.image_url}
                    onChange={(e) => setFormData({ ...formData, image_url: e.target.value })}
                    placeholder="ou entrez une URL d'image"
                    className="mt-2"
                />
            </div>

            <div className="space-y-2">
                <Label htmlFor="link">Lien de destination</Label>
                <Input
                    id="link"
                    type="url"
                    value={formData.link}
                    onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                    placeholder="https://qrsell.com/campagne"
                />
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Position</Label>
                    <Select
                        value={formData.position}
                        onValueChange={(value) => setFormData({ ...formData, position: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="header">En-tête</SelectItem>
                            <SelectItem value="footer">Pied de page</SelectItem>
                            <SelectItem value="sidebar">Barre latérale</SelectItem>
                            <SelectItem value="product-page">Page produit</SelectItem>
                            <SelectItem value="dashboard">Dashboard</SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                <div className="space-y-2">
                    <Label>Cible</Label>
                    <Select
                        value={formData.target}
                        onValueChange={(value) => setFormData({ ...formData, target: value })}
                    >
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="all">Tous</SelectItem>
                            <SelectItem value="pro">Pro</SelectItem>
                            <SelectItem value="starter">Starter</SelectItem>
                        </SelectContent>
                    </Select>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <Label>Date de début *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(new Date(formData.start_date), 'PPP', { locale: fr })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={new Date(formData.start_date)}
                                onSelect={(date) => setFormData({ ...formData, start_date: date.toISOString() })}
                                locale={fr}
                            />
                        </PopoverContent>
                    </Popover>
                </div>

                <div className="space-y-2">
                    <Label>Date de fin *</Label>
                    <Popover>
                        <PopoverTrigger asChild>
                            <Button variant="outline" className="w-full justify-start">
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {format(new Date(formData.end_date), 'PPP', { locale: fr })}
                            </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                            <Calendar
                                mode="single"
                                selected={new Date(formData.end_date)}
                                onSelect={(date) => setFormData({ ...formData, end_date: date.toISOString() })}
                                locale={fr}
                            />
                        </PopoverContent>
                    </Popover>
                </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <Label htmlFor="is_active" className="cursor-pointer">Bannière active</Label>
                <Switch
                    id="is_active"
                    checked={formData.is_active}
                    onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Annuler
                </Button>
                <Button type="submit" className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600">
                    {banner ? 'Mettre à jour' : 'Créer la bannière'}
                </Button>
            </div>
        </form>
    );
}