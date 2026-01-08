import React, { useState } from 'react';
import { MapPin, Truck, X } from 'lucide-react';

export default function ProductVariants({ product, seller }) {
  const [selectedColor, setSelectedColor] = useState(null);
  const [selectedSize, setSelectedSize] = useState(null);

  // Handle no variants
  if (!product.colors?.length && !product.sizes?.length && product.shipping_free) {
    return null;
  }

  return (
    <div className="space-y-6 mt-6 pt-6 border-t">
      {/* Colors */}
      {product.colors && product.colors.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Coloris</h3>
          <div className="flex flex-wrap gap-3">
            {product.colors.map(color => (
              <button
                key={color.id}
                onClick={() => setSelectedColor(color.id)}
                className={`flex flex-col items-center gap-2 p-2 rounded-lg transition-all ${
                  selectedColor === color.id
                    ? 'ring-2 ring-[#ed477c] shadow-md scale-105'
                    : 'hover:shadow-md'
                }`}
              >
                {color.image_url ? (
                  <img 
                    src={color.image_url} 
                    alt={color.name}
                    className="w-14 h-14 rounded object-cover border-2 border-gray-200"
                  />
                ) : (
                  <div 
                    className="w-14 h-14 rounded border-2 border-gray-300"
                    style={{ backgroundColor: color.hex_color || '#CCC' }}
                  />
                )}
                <span className="text-xs font-medium text-gray-700 text-center max-w-12">
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sizes */}
      {product.sizes && product.sizes.length > 0 && (
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Tailles</h3>
          <div className="flex flex-wrap gap-2">
            {product.sizes.map(size => (
              <button
                key={size.id}
                onClick={() => size.in_stock && setSelectedSize(size.id)}
                disabled={!size.in_stock}
                className={`
                  w-12 h-12 rounded-full font-bold text-sm transition-all flex items-center justify-center
                  ${size.in_stock
                    ? selectedSize === size.id
                      ? 'bg-[#ed477c] text-white ring-2 ring-[#ed477c] ring-offset-2 scale-110'
                      : 'bg-white border-2 border-gray-300 text-gray-900 hover:border-[#ed477c] hover:text-[#ed477c]'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed line-through'
                  }
                `}
                title={!size.in_stock ? 'Rupture de stock' : ''}
              >
                {size.size}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Shipping */}
      {(!product.shipping_free || product.local_pickup_available) && (
        <div className="space-y-3 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg border border-orange-200">
          {!product.shipping_free && product.shipping_fee && (
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Livraison</p>
                <p className="text-sm text-gray-700">
                  {product.shipping_fee.toLocaleString('fr-FR')} FCFA
                </p>
              </div>
            </div>
          )}

          {product.shipping_free && (
            <div className="flex items-start gap-3">
              <Truck className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Livraison gratuite</p>
              </div>
            </div>
          )}

          {product.local_pickup_available && product.local_pickup_address && (
            <div className="flex items-start gap-3 pt-2 border-t border-orange-200">
              <MapPin className="w-5 h-5 text-orange-600 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-gray-900">Retrait sur place</p>
                <p className="text-sm text-gray-700">{product.local_pickup_address}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}