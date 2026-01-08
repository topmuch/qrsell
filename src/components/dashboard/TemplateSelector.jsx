import React, { useState } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

const templates = [
  {
    id: 'luxe',
    name: 'Luxe',
    description: 'Élégant et raffiné',
    colors: { bg: '#FFFFFF', text: '#6C4AB6', secondary: '#333333' },
    preview: 'linear-gradient(135deg, #FFFFFF 0%, #F8F8F8 100%)',
    idealFor: 'Mode haut de gamme, maroquinerie, cosmétiques premium',
    features: ['Police Poppins Light', 'Fond blanc pur', 'Design minimaliste', 'Bouton WhatsApp discret']
  },
  {
    id: 'vibrant',
    name: 'Vibrant',
    description: 'Dynamique et coloré',
    colors: { bg: 'linear-gradient(135deg, #FF6B9D 0%, #6C4AB6 100%)', text: '#FFFFFF', secondary: '#FFD700' },
    preview: 'linear-gradient(135deg, #FF6B9D 0%, #6C4AB6 100%)',
    idealFor: 'Mode wax, accessoires, jeunes vendeurs TikTok',
    features: ['Police Poppins Bold', 'Dégradé vif', 'QR code animé', 'Bouton WhatsApp XXL']
  },
  {
    id: 'marche_local',
    name: 'Marché Local',
    description: 'Authentique et chaleureux',
    colors: { bg: '#F5F0E8', text: '#8B6B4D', secondary: '#2E8B57' },
    preview: 'linear-gradient(135deg, #F5F0E8 0%, #E8DCC8 100%)',
    idealFor: 'Fruits, légumes, artisanat, produits locaux',
    features: ['Police Inter Medium', 'Fond texturé', 'Photos brutes', 'Contact très visible']
  },
  {
    id: 'minimal',
    name: 'Minimal',
    description: 'Sobre et professionnel',
    colors: { bg: '#FFFFFF', text: '#333333', secondary: '#999999' },
    preview: 'linear-gradient(135deg, #FFFFFF 0%, #F5F5F5 100%)',
    idealFor: 'Coiffeurs, esthéticiennes, services, formations',
    features: ['Police Poppins Thin', 'Design épuré', 'Texte centré', 'Focus sur le service']
  }
];

export default function TemplateSelector({ currentTemplate, onSelect }) {
  const [selectedTemplate, setSelectedTemplate] = useState(currentTemplate || 'vibrant');
  const [isSaving, setIsSaving] = useState(false);

  // Synchroniser avec le template actuel de la base de données
  React.useEffect(() => {
    setSelectedTemplate(currentTemplate || 'vibrant');
  }, [currentTemplate]);

  const handleSelect = (templateId) => {
    setSelectedTemplate(templateId);
  };

  const handleSaveTemplate = async () => {
    setIsSaving(true);
    await onSelect(selectedTemplate);
    setIsSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-6 border-2 border-purple-200">
        <div className="flex items-start gap-3 mb-3">
          <Sparkles className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
          <div>
            <h3 className="font-bold text-lg text-purple-900 mb-2">
              Choisissez le style qui représente le mieux votre marque
            </h3>
            <p className="text-purple-700 text-sm leading-relaxed">
              Vos clients ne verront que votre boutique — pas celle des autres. Chaque template transforme votre vitrine en une expérience unique.
            </p>
          </div>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {templates.map((template, idx) => (
          <motion.div
            key={template.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
          >
            <Card 
              className={`cursor-pointer transition-all duration-300 hover:shadow-xl ${
                selectedTemplate === template.id 
                  ? 'border-4 border-[#6C4AB6] shadow-2xl' 
                  : 'border-2 hover:border-[#6C4AB6]/50'
              }`}
              onClick={() => handleSelect(template.id)}
            >
              <CardContent className="p-6">
                {/* Preview */}
                <div 
                  className="h-32 rounded-xl mb-4 relative overflow-hidden shadow-inner"
                  style={{ background: template.preview }}
                >
                  {selectedTemplate === template.id && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute top-2 right-2 w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-lg"
                    >
                      <Check className="w-6 h-6 text-[#6C4AB6]" />
                    </motion.div>
                  )}
                  
                  {/* Mini preview content */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div 
                      className="text-center px-4"
                      style={{ 
                        color: template.id === 'luxe' || template.id === 'minimal' 
                          ? template.colors.text 
                          : template.colors.text 
                      }}
                    >
                      <div className={`text-2xl font-bold mb-1 ${
                        template.id === 'vibrant' ? 'text-white' : ''
                      }`}>
                        Ma Boutique
                      </div>
                      <div className={`text-sm ${
                        template.id === 'vibrant' ? 'text-white/80' : 'opacity-70'
                      }`}>
                        15 000 FCFA
                      </div>
                    </div>
                  </div>
                </div>

                {/* Info */}
                <div className="space-y-3">
                  <div>
                    <h3 className="font-black text-xl text-[#6C4AB6] mb-1" style={{ fontFamily: 'Poppins, sans-serif' }}>
                      {template.name}
                    </h3>
                    <p className="text-sm text-gray-600">{template.description}</p>
                  </div>

                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-xs font-semibold text-gray-500 mb-2">Idéal pour :</p>
                    <p className="text-sm text-gray-700">{template.idealFor}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {template.features.map((feature, i) => (
                      <Badge 
                        key={i} 
                        variant="outline" 
                        className="text-xs border-purple-200 text-purple-700"
                      >
                        {feature}
                      </Badge>
                    ))}
                  </div>

                  <Button
                    onClick={() => handleSelect(template.id)}
                    className={`w-full ${
                      selectedTemplate === template.id
                        ? 'bg-[#6C4AB6] text-white'
                        : 'bg-white text-[#6C4AB6] border-2 border-[#6C4AB6]'
                    }`}
                  >
                    {selectedTemplate === template.id ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Template actif
                      </>
                    ) : (
                      'Choisir ce style'
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Save Button */}
      {selectedTemplate !== currentTemplate && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="fixed bottom-6 right-6 md:relative md:bottom-auto md:right-auto md:mt-6 flex gap-2"
        >
          <Button
            variant="outline"
            onClick={() => setSelectedTemplate(currentTemplate)}
            disabled={isSaving}
            className="shadow-lg"
          >
            Annuler
          </Button>
          <Button
            onClick={handleSaveTemplate}
            disabled={isSaving}
            className="bg-gradient-to-r from-green-500 to-green-600 hover:opacity-90 text-white shadow-xl font-bold"
          >
            {isSaving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sauvegarde...
              </>
            ) : (
              <>
                <Check className="w-4 h-4 mr-2" />
                Sauvegarder le style
              </>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
}