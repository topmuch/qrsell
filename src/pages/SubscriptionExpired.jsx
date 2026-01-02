import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { AlertCircle, Mail, Phone } from "lucide-react";

export default function SubscriptionExpired() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center p-4">
      <Card className="max-w-lg w-full">
        <CardContent className="pt-6">
          <div className="text-center space-y-6">
            <div className="flex justify-center">
              <div className="w-20 h-20 bg-orange-100 rounded-full flex items-center justify-center">
                <AlertCircle className="w-12 h-12 text-orange-600" />
              </div>
            </div>

            <div className="space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">Abonnement expiré</h1>
              <p className="text-gray-600">
                Votre période d'essai ou d'abonnement est arrivée à échéance. 
                Pour continuer à utiliser QRSell, veuillez renouveler votre abonnement.
              </p>
            </div>

            <div className="bg-blue-50 p-4 rounded-lg text-left">
              <p className="font-semibold text-gray-900 mb-2">📞 Contactez-nous pour renouveler :</p>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-gray-700">
                  <Mail className="w-4 h-4" />
                  <span>contact@qrsell.com</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Phone className="w-4 h-4" />
                  <span>+221 77 123 45 67</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4">
              <Button className="w-full bg-blue-600 hover:bg-blue-700" size="lg">
                Contacter le support
              </Button>
              <p className="text-sm text-gray-500">
                Nos forfaits démarrent à partir de 5000 FCFA/mois
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}