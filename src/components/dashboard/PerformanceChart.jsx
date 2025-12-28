import React, { useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

export default function PerformanceChart({ products, analytics }) {
  const chartData = useMemo(() => {
    return products
      .map(product => {
        const productAnalytics = analytics.filter(a => a.product_id === product.id);
        const scans = productAnalytics.filter(a => a.event_type === 'scan').length;
        const clicks = productAnalytics.filter(a => a.event_type === 'whatsapp_click').length;
        
        return {
          name: product.name.length > 15 ? product.name.substring(0, 15) + '...' : product.name,
          scans,
          clicks
        };
      })
      .sort((a, b) => b.scans - a.scans)
      .slice(0, 5); // Top 5 products
  }, [products, analytics]);

  if (chartData.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          📊 Top 5 produits par performance
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="name" 
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: 'white', 
                border: '1px solid #e5e7eb',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="scans" fill="#3b82f6" name="Scans" radius={[8, 8, 0, 0]} />
            <Bar dataKey="clicks" fill="#10b981" name="Clics WhatsApp" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}