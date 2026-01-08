import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { X, Plus, Ruler } from 'lucide-react';
import { toast } from 'sonner';

const PRESET_SIZES = {
  clothing: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
  shoes: ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45', '46'],
  accessories: ['Unique', 'One Size']
};

export default function SizeSelector({ sizes = [], onChange }) {
  const [sizeInput, setSizeInput] = useState('');
  const [sizeType, setSizeType] = useState('clothing');

  const handleAddSize = () => {
    if (!sizeInput.trim()) {
      toast.error('Entrez une taille');
      return;
    }

    const newSize = {
      id: `size_${Date.now()}`,
      size: sizeInput.trim().toUpperCase(),
      in_stock: true
    };

    if (sizes.find(s => s.size === newSize.size)) {
      toast.error('Cette taille existe déjà');
      return;
    }

    onChange([...sizes, newSize]);
    setSizeInput('');
    toast.success('Taille ajoutée');
  };

  const handleAddPreset = (preset) => {
    const newSizes = preset
      .filter(size => !sizes.find(s => s.size === size))
      .map(size => ({
        id: `size_${Date.now()}_${size}`,
        size,
        in_stock: true
      }));

    if (newSizes.length === 0) {
      toast.error('Ces tailles existent déjà');
      return;
    }

    onChange([...sizes, ...newSizes]);
    toast.success(`${newSizes.length} taille(s) ajoutée(s)`);
  };

  const handleToggleStock = (id) => {
    onChange(
      sizes.map(s => 
        s.id === id ? { ...s, in_stock: !s.in_stock } : s
      )
    );
  };

  const handleRemoveSize = (id) => {
    onChange(sizes.filter(s => s.id !== id));
  };

  return (
    <div className="space-y-4 p-4 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-lg">
      <div className="flex items-center gap-2">
        <Ruler className="w-5 h-5 text-blue-600" />
        <Label className="text-base font-semibold">Tailles disponibles (optionnel)</Label>
      </div>

      {/* Display existing sizes */}
      {sizes.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {sizes.map(size => (
            <div
              key={size.id}
              className={`relative px-3 py-2 rounded-full font-semibold text-sm transition-all cursor-pointer border-2 ${
                size.in_stock
                  ? 'bg-blue-100 border-blue-400 text-blue-900'
                  : 'bg-gray-100 border-gray-300 text-gray-500 line-through'
              }`}
              onClick={() => handleToggleStock(size.id)}
              title={size.in_stock ? 'En stock' : 'Rupture de stock - cliquez pour activer'}
            >
              {size.size}
              <Button
                type="button"
                size="icon"
                variant="ghost"
                className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 hover:bg-red-600 text-white"
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveSize(size.id);
                }}
              >
                <X className="w-3 h-3" />
              </Button>
            </div>
          ))}
        </div>
      )}

      {/* Form to add sizes */}
      <div className="space-y-3 p-3 bg-white rounded-lg border border-gray-200">
        <div>
          <Label htmlFor="size_type" className="text-sm">Utilisez une liste prédéfinie</Label>
          <Select value={sizeType} onValueChange={setSizeType}>
            <SelectTrigger className="h-9 mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="clothing">👕 Vêtements (XS-XXL)</SelectItem>
              <SelectItem value="shoes">👟 Chaussures (35-46)</SelectItem>
              <SelectItem value="accessories">👜 Accessoires</SelectItem>
            </SelectContent>
          </Select>
          <Button
            type="button"
            size="sm"
            variant="outline"
            className="w-full mt-2"
            onClick={() => handleAddPreset(PRESET_SIZES[sizeType])}
          >
            <Plus className="w-4 h-4 mr-2" />
            Ajouter ces tailles
          </Button>
        </div>

        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 text-sm">
            ou
          </div>
          <Input
            value={sizeInput}
            onChange={(e) => setSizeInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAddSize()}
            placeholder="Ex: S, M, L (séparées par virgule)"
            className="h-9 pl-16"
          />
        </div>

        <Button
          type="button"
          size="sm"
          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          onClick={handleAddSize}
        >
          <Plus className="w-4 h-4 mr-2" />
          Ajouter cette taille
        </Button>

        <p className="text-xs text-gray-500 text-center">
          💡 Cliquez sur une taille pour marquer comme épuisée
        </p>
      </div>
    </div>
  );
}