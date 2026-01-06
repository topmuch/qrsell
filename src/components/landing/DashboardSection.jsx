import React from 'react';
import { Button } from "@/components/ui/button";
import { motion } from 'framer-motion';
import { BarChart3, TrendingUp, Eye, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils/index';

export default function DashboardSection() {
  return (
    <section className="py-24 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
          {/* Left: Content */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
          >
            <div className="inline-flex items-center gap-2 bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <BarChart3 className="w-4 h-4" />
              Analytics en temps réel
            </div>
            
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6 leading-tight">
              Suivez vos scans, vues et conversions{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-purple-500">
                en temps réel
              </span>
            </h2>
            
            <p className="text-xl text-gray-700 mb-8 leading-relaxed">
              Statistiques, tendances, performance — tout est visible dans votre dashboard. 
              <span className="font-bold text-blue-600"> Pas besoin de compétences techniques.</span>
            </p>

            <ul className="space-y-4 mb-8">
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg text-gray-700">
                  <span className="font-bold">Nombre de scans QR</span> — qui scanne vos produits, quand et où
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg text-gray-700">
                  <span className="font-bold">Vues produits & clics WhatsApp</span> — mesurez l'engagement réel
                </span>
              </li>
              <li className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center flex-shrink-0 mt-1">
                  <span className="text-white text-sm font-bold">✓</span>
                </div>
                <span className="text-lg text-gray-700">
                  <span className="font-bold">Taux de conversion</span> — optimisez vos performances semaine après semaine
                </span>
              </li>
            </ul>

            <Link to={createPageUrl('Demo')}>
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-500 to-purple-500 hover:opacity-90 text-white px-8 py-6 text-lg font-bold rounded-full shadow-xl"
              >
                Voir le dashboard en démo
                <ArrowRight className="ml-2 w-5 h-5" />
              </Button>
            </Link>
          </motion.div>

          {/* Right: Dashboard Preview */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            className="relative"
          >
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 rounded-3xl p-8 shadow-2xl border-2 border-blue-100">
              {/* Header */}
              <div className="mb-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Vue d'ensemble</h3>
                <p className="text-sm text-gray-600">Derniers 7 jours</p>
              </div>

              {/* Stats Grid */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                {[
                  { label: 'Scans QR', value: '47', trend: '+100%', color: 'from-blue-500 to-cyan-500' },
                  { label: 'Vues produits', value: '124', trend: '+85%', color: 'from-purple-500 to-pink-500' },
                  { label: 'Clics WhatsApp', value: '38', trend: '+120%', color: 'from-green-500 to-emerald-500' },
                  { label: 'Conversion', value: '30.6%', trend: '+15%', color: 'from-orange-500 to-red-500' }
                ].map((stat, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: i * 0.1 }}
                    className="bg-white rounded-xl p-4 shadow-sm"
                  >
                    <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${stat.color} flex items-center justify-center mb-2`}>
                      {i === 0 && <Eye className="w-5 h-5 text-white" />}
                      {i === 1 && <BarChart3 className="w-5 h-5 text-white" />}
                      {i === 2 && <TrendingUp className="w-5 h-5 text-white" />}
                      {i === 3 && <TrendingUp className="w-5 h-5 text-white" />}
                    </div>
                    <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                    <p className="text-xs text-gray-600 mb-1">{stat.label}</p>
                    <p className="text-xs text-green-600 font-semibold">{stat.trend}</p>
                  </motion.div>
                ))}
              </div>

              {/* Chart Preview */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <h4 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                  Performance cette semaine
                </h4>
                <div className="flex items-end gap-2 h-32">
                  {[40, 60, 45, 80, 65, 90, 75].map((height, i) => (
                    <motion.div
                      key={i}
                      initial={{ height: 0 }}
                      whileInView={{ height: `${height}%` }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex-1 bg-gradient-to-t ${i % 2 === 0 ? 'from-blue-400 to-blue-500' : 'from-purple-400 to-purple-500'} rounded-t-lg`}
                    />
                  ))}
                </div>
                <div className="flex justify-between mt-2 text-xs text-gray-500">
                  <span>Lun</span>
                  <span>Mar</span>
                  <span>Mer</span>
                  <span>Jeu</span>
                  <span>Ven</span>
                  <span>Sam</span>
                  <span>Dim</span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}