import React, { useState, useEffect } from 'react';
import { base44 } from '@/api/base44Client';
import { useQuery } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Store, User, CreditCard, CheckCircle, ArrowRight, ArrowLeft, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import Logo from '@/components/ui/Logo';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [completedSteps, setCompletedSteps] = useState([]);
  
  const [formData, setFormData] = useState({
    full_name: '',
    email: '',
    phone: '',
    shop_name: '',
    shop_slug: '',
    whatsapp_number: '',
    address: '',
    plan_code: 'starter',
    duration_months: 1
  });

  // Fetch plans
  const { data: plans = [] } = useQuery({
    queryKey: ['plans'],
    queryFn: async () => {
      const allPlans = await base44.entities.Plan.filter({ is_active: true });
      return allPlans;
    }
  });

  const selectedPlan = plans.find(p => p.code === formData.plan_code);
  const totalPrice = selectedPlan ? (selectedPlan.price || 0) * formData.duration_months : 0;

  const handleSlugChange = (value) => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9_-]/g, '');
    setFormData({ ...formData, shop_slug: cleaned });
  };

  const handleNext = () => {
    // Validate current step
    if (currentStep === 1) {
      if (!formData.full_name || !formData.email || !formData.phone) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }
    }
    if (currentStep === 2) {
      if (!formData.shop_name || !formData.shop_slug || !formData.whatsapp_number) {
        toast.error('Veuillez remplir tous les champs');
        return;
      }
    }
    setCompletedSteps(prev => [...prev, currentStep]);
    setCurrentStep(prev => prev + 1);
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // Create subscription request
      await base44.entities.SubscriptionRequest.create({
        user_email: formData.email,
        plan_code: formData.plan_code,
        duration_months: formData.duration_months,
        full_name: formData.full_name,
        phone: formData.phone,
        business_name: formData.shop_name,
        country: 'Sénégal',
        city: formData.address,
        status: 'pending'
      });

      // Redirect to success page
      window.location.href = '/OnboardingSuccess?name=' + encodeURIComponent(formData.full_name);
    } catch (error) {
      console.error('Error submitting:', error);
      toast.error('Erreur lors de la soumission');
      setIsSubmitting(false);
    }
  };

  const progress = (currentStep / 3) * 100;

  return (
    <div className="min-h-screen py-8 px-4" style={{ backgroundColor: '#FAF9FC' }}>
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <Logo size="lg" />
          <h1 className="text-3xl md:text-4xl font-black mt-6 mb-2">
            Créez votre boutique en 3 étapes
          </h1>
          <p className="text-gray-600">Simple, rapide, et sans engagement</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {[1, 2, 3].map(step => (
              <div key={step} className="flex items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                  completedSteps.includes(step) 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step 
                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white' 
                    : 'bg-gray-200 text-gray-400'
                }`}>
                  {completedSteps.includes(step) ? (
                    <CheckCircle className="w-6 h-6" />
                  ) : (
                    step
                  )}
                </div>
                {step < 3 && (
                  <div className={`w-16 md:w-32 h-1 mx-2 ${
                    completedSteps.includes(step) ? 'bg-green-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        <AnimatePresence mode="wait">
          {/* Step 1: Identity */}
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="shadow-2xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="w-6 h-6 text-purple-500" />
                    Identité
                  </CardTitle>
                  <CardDescription>Qui êtes-vous ?</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="full_name">Nom complet *</Label>
                    <Input
                      id="full_name"
                      value={formData.full_name}
                      onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                      placeholder="Ex: Aminata Diallo"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="aminata@exemple.com"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Téléphone *</Label>
                    <Input
                      id="phone"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+221 77 123 45 67"
                      className="mt-1"
                    />
                  </div>

                  <Button onClick={handleNext} className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                    Continuer
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 2: Shop */}
          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="shadow-2xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Store className="w-6 h-6 text-purple-500" />
                    Boutique
                  </CardTitle>
                  <CardDescription>Configurez votre vitrine</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="shop_name">Nom de la boutique *</Label>
                    <Input
                      id="shop_name"
                      value={formData.shop_name}
                      onChange={(e) => setFormData({ ...formData, shop_name: e.target.value })}
                      placeholder="Mode Dakar"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="shop_slug">Slug de boutique *</Label>
                    <Input
                      id="shop_slug"
                      value={formData.shop_slug}
                      onChange={(e) => handleSlugChange(e.target.value)}
                      placeholder="mode_dakar"
                      className="mt-1"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Votre boutique : qrsell.com/shop/{formData.shop_slug || 'votre_slug'}
                    </p>
                  </div>
                  <div>
                    <Label htmlFor="whatsapp">WhatsApp *</Label>
                    <Input
                      id="whatsapp"
                      value={formData.whatsapp_number}
                      onChange={(e) => setFormData({ ...formData, whatsapp_number: e.target.value })}
                      placeholder="+221 77 123 45 67"
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="Dakar, Plateau"
                      rows={2}
                      className="mt-1"
                    />
                  </div>

                  <div className="flex gap-3">
                    <Button onClick={handleBack} variant="outline" className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour
                    </Button>
                    <Button onClick={handleNext} className="flex-1 bg-gradient-to-r from-purple-500 to-pink-500 hover:opacity-90">
                      Continuer
                      <ArrowRight className="w-4 h-4 ml-2" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          {/* Step 3: Plan */}
          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
            >
              <Card className="shadow-2xl border-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="w-6 h-6 text-purple-500" />
                    Forfait
                  </CardTitle>
                  <CardDescription>Choisissez votre formule</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div>
                    <Label>Forfait *</Label>
                    <Select value={formData.plan_code} onValueChange={(value) => setFormData({ ...formData, plan_code: value })}>
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {plans.map(plan => (
                          <SelectItem key={plan.code} value={plan.code}>
                            {plan.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedPlan && (
                    <div className="bg-gradient-to-r from-purple-50 to-pink-50 p-4 rounded-lg border-2 border-purple-200">
                      <h3 className="font-bold text-lg mb-2">{selectedPlan.name}</h3>
                      <p className="text-sm text-gray-600 mb-3">{selectedPlan.description}</p>
                      {selectedPlan.features && (
                        <ul className="space-y-1">
                          {selectedPlan.features.slice(0, 3).map((feature, idx) => (
                            <li key={idx} className="text-sm flex items-center gap-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              {feature}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}

                  <div>
                    <Label>Durée *</Label>
                    <Select 
                      value={formData.duration_months.toString()} 
                      onValueChange={(value) => setFormData({ ...formData, duration_months: parseInt(value) })}
                    >
                      <SelectTrigger className="mt-1">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 6, 12].map(months => (
                          <SelectItem key={months} value={months.toString()}>
                            {months} mois
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Prix Total */}
                  {selectedPlan && (
                    <div className="bg-gradient-to-r from-green-50 to-emerald-50 p-6 rounded-xl border-2 border-green-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-gray-600 mb-1">Prix mensuel</p>
                          <p className="text-lg font-semibold text-gray-900">
                            {(selectedPlan.price || 0).toLocaleString('fr-FR')} FCFA/mois
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-600 mb-1">Total à payer</p>
                          <p className="text-3xl font-black text-green-600">
                            {totalPrice.toLocaleString('fr-FR')} FCFA
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex gap-3">
                    <Button onClick={handleBack} variant="outline" className="flex-1">
                      <ArrowLeft className="w-4 h-4 mr-2" />
                      Retour
                    </Button>
                    <Button 
                      onClick={handleSubmit} 
                      disabled={isSubmitting}
                      className="flex-1 bg-gradient-to-r from-green-500 to-emerald-500 hover:opacity-90"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Envoi...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="w-4 h-4 mr-2" />
                          Créer ma boutique
                        </>
                      )}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}