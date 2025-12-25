import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { base44 } from '@/api/base44Client';
import { Download, Upload, Loader2, CheckCircle, AlertCircle } from 'lucide-react';

export default function ProductImportExport({ seller, products, onImportComplete }) {
  const [importing, setImporting] = useState(false);
  const [importResult, setImportResult] = useState(null);

  const handleExport = () => {
    const csv = [
      ['Nom', 'Prix (FCFA)', 'Description', 'URL Image', 'Actif'].join(','),
      ...products.map(p => [
        `"${p.name}"`,
        p.price,
        `"${p.description || ''}"`,
        p.image_url || '',
        p.is_active ? 'Oui' : 'Non'
      ].join(','))
    ].join('\n');

    const blob = new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `produits-${seller.shop_slug}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  const handleImport = async (file) => {
    if (!file) return;

    setImporting(true);
    setImportResult(null);

    try {
      const result = await base44.integrations.Core.ExtractDataFromUploadedFile({
        file_url: await uploadFile(file),
        json_schema: {
          type: "object",
          properties: {
            products: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  name: { type: "string" },
                  price: { type: "number" },
                  description: { type: "string" },
                  image_url: { type: "string" },
                  is_active: { type: "boolean" }
                },
                required: ["name", "price"]
              }
            }
          }
        }
      });

      if (result.status === 'success' && result.output?.products) {
        const productsToCreate = result.output.products.map(p => ({
          seller_id: seller.id,
          shop_slug: seller.shop_slug,
          name: p.name,
          price: p.price,
          description: p.description || '',
          image_url: p.image_url || '',
          is_active: p.is_active !== false,
          public_id: `PROD-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`
        }));

        await base44.entities.Product.bulkCreate(productsToCreate);
        
        setImportResult({
          success: true,
          count: productsToCreate.length
        });
        
        onImportComplete();
      } else {
        throw new Error(result.details || 'Erreur lors de l\'extraction');
      }
    } catch (error) {
      setImportResult({
        success: false,
        error: error.message
      });
    } finally {
      setImporting(false);
    }
  };

  const uploadFile = async (file) => {
    const { file_url } = await base44.integrations.Core.UploadFile({ file });
    return file_url;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import / Export</CardTitle>
        <CardDescription>Gérez vos produits en masse via fichier CSV</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-3">
          <Button
            onClick={handleExport}
            variant="outline"
            className="flex-1"
            disabled={products.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Exporter ({products.length})
          </Button>

          <label className="flex-1 cursor-pointer">
            <Button
              type="button"
              variant="outline"
              disabled={importing}
              className="w-full"
              asChild
            >
              <span>
                {importing ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Import...</>
                ) : (
                  <><Upload className="w-4 h-4 mr-2" /> Importer CSV</>
                )}
              </span>
            </Button>
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => handleImport(e.target.files[0])}
              disabled={importing}
            />
          </label>
        </div>

        {importResult && (
          <div className={`p-3 rounded-lg flex items-start gap-2 ${
            importResult.success 
              ? 'bg-green-50 text-green-800 border border-green-200' 
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}>
            {importResult.success ? (
              <>
                <CheckCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Import réussi !</p>
                  <p className="text-sm">{importResult.count} produit{importResult.count > 1 ? 's' : ''} ajouté{importResult.count > 1 ? 's' : ''}</p>
                </div>
              </>
            ) : (
              <>
                <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium">Erreur d'import</p>
                  <p className="text-sm">{importResult.error}</p>
                </div>
              </>
            )}
          </div>
        )}

        <div className="text-xs text-gray-500 space-y-1">
          <p><strong>Format CSV :</strong></p>
          <p>Colonnes : Nom, Prix (FCFA), Description, URL Image, Actif</p>
          <p>Exemple : "T-shirt Rouge", 15000, "100% coton", "https://...", Oui</p>
        </div>
      </CardContent>
    </Card>
  );
}