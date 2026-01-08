import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { base44 } from '@/api/base44Client';
import { X, Upload, Plus, Loader2, Palette } from 'lucide-react';
import { toast } from 'sonner';

export default function ColorSelector({ colors = [], onChange }) {
  const [colorForm, setColorForm] = useState({ name: '', hex_color: '#ED477C', image_url: '' });
  const [uploading, setUploading] = useState(false);

  const handleAddColor = async () => {
    if (!colorForm.name.trim()) {
      toast.error('Entrez un nom de coloris');
      return;
    }

    const newColor = {
      id: `color_${Date.now()}`,
      name: colorForm.name.trim(),
      hex_color: colorForm.hex_color,
      image_url: colorForm.image_url || null
    };

    onChange([...colors, newColor]);
    setColorForm({ name: '', hex_color: '#ED477C', image_url: '' });
    toast.success('Coloris ajouté');
  };

  const handleUploadImage = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploading(true);
    try {
      const result = await base44.integrations.Core.UploadFile({ file });
      setColorForm(prev => ({ ...prev, image_url: result.file_url }));
      toast.success('Image uploadée');
    } catch (error) {
      toast.error('Erreur lors de l\'upload');
    } finally {
      setUploading(false);
    }
  };

  const handleRemoveColor = (id) => {
    onChange(colors.filter(c => c.id !== id));
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Palette className="w-5 h-5 text-purple-600" />
        <Label className="text-base font-semibold">Coloris disponibles (optionnel)</Label>
      </div>

      {/* Display existing colors */}
      {colors.length > 0 && (
        <div className="flex flex-wrap gap-3">
          {colors.map(color => (
            <div key={color.id} className="relative">
              <div className="flex flex-col items-center gap-2 p-2 bg-white rounded-lg border border-gray-200 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-2">
                  {color.image_url ? (
                    <img src={color.image_url} alt={color.name} className="w-12 h-12 rounded object-cover" />
                  ) : (
                    <div 
                      className="w-12 h-12 rounded border-2 border-gray-300"
                      style={{ backgroundColor: color.hex_color }}
                    />
                  )}
                </div>
                <span className="text-xs font-medium text-gray-700 text-center">{color.name}</span>
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white"
                  onClick={() => handleRemoveColor(color.id)}
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Form to add colors */}
      <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
        <div>
          <Label htmlFor="color_name" className="text-sm">Nom du coloris</Label>
          <Input
            id="color_name"
            value={colorForm.name}
            onChange={(e) => setColorForm(prev => ({ ...prev, name: e.target.value }))}
            placeholder="Ex: Rouge, Noir, Wax Imprimé"
            className="h-9 mt-1"
          />
        </div>

        <div>
          <Label htmlFor="color_hex" className="text-sm">Couleur (optionnel)</Label>
          <div className="flex gap-2 mt-1">
            <input
              id="color_hex"
              type="color"
              value={colorForm.hex_color}
              onChange={(e) => setColorForm(prev => ({ ...prev, hex_color: e.target.value }))}
              className="w-12 h-9 rounded cursor-pointer border"
            />
            <Input
              type="text"
              value={colorForm.hex_color}
              onChange={(e) => setColorForm(prev => ({ ...prev, hex_color: e.target.value }))}
              className="flex-1 h-9 font-mono text-sm"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="color_image" className="text-sm">Image du coloris (optionnel)</Label>
          <div className="mt-1">
            {colorForm.image_url ? (
              <div className="flex items-center gap-2">
                <img src={colorForm.image_url} alt="Preview" className="w-10 h-10 rounded object-cover border" />
                <Button
                  type="button"
                  size="sm"
                  variant="outline"
                  onClick={() => setColorForm(prev => ({ ...prev, image_url: '' }))}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleUploadImage}
                  disabled={uploading}
                  className="hidden"
                />
                <Button type="button" size="sm" variant="outline" disabled={uploading} asChild>
                  <span>
                    {uploading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Upload className="w-4 h-4 mr-1" />
                    )}
                    Uploader une image
                  </span>
                </Button>
              </label>
            )}
          </div>
        </div>

        <Button
          type="button"
          size="sm"
          className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          onClick={handleAddColor}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter ce coloris
        </Button>
      </div>
    </div>
  );
}