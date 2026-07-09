'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/RoleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Package, MapPin, Clock, Award, TrendingUp, Users, Leaf, CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { formatCurrency, formatRelativeTime, getInitials } from '@/lib/utils';

const wasteTypes = [
  { type: 'PLASTIQUE', icon: '🥤', color: 'bg-blue-100 text-blue-700', count: 12 },
  { type: 'PAPIER/CARTON', icon: '📦', color: 'bg-amber-100 text-amber-700', count: 8 },
  { type: 'VERRE', icon: '🍾', color: 'bg-green-100 text-green-700', count: 5 },
  { type: 'MÉTAL', icon: '♻️', color: 'bg-gray-100 text-gray-700', count: 3 },
  { type: 'DÉCHETS ÉLECTRONIQUES', icon: '📱', color: 'bg-purple-100 text-purple-700', count: 2 },
  { type: 'ORGANIQUES', icon: '🍎', color: 'bg-orange-100 text-orange-700', count: 7 },
];

const recentCollectes = [
  { id: 'COL-2024-001', type: 'PLASTIQUE', weight: 45, status: 'TERMINEE', date: '2024-01-15', collector: 'Jean Martin', points: 120 },
  { id: 'COL-2024-002', type: 'PAPIER/CARTON', weight: 120, status: 'EN_COURS', date: '2024-01-14', collector: 'Marie Dubois', points: 80 },
  { id: 'COL-2024-003', type: 'VERRE', weight: 30, status: 'EN_ATTENTE', date: '2024-01-13', collector: null, points: 0 },
  { id: 'COL-2024-004', type: 'MÉTAL', weight: 25, status: 'ANNULEE', date: '2024-01-12', collector: 'Pierre Durand', points: 0 },
];

const stats = [
  { label: 'Déchets déclarés', value: '28', unit: 'collectes', icon: Trash2, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+12%' },
  { label: 'Collectes effectuées', value: '22', unit: 'terminées', icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-100', trend: '+8%' },
  { label: 'Points gagnés', value: '2 840', unit: 'pts', icon: Award, color: 'text-yellow-600', bg: 'bg-yellow-100', trend: '+450' },
  { label: 'CO₂ évité', value: '1 240', unit: 'kg', icon: Leaf, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+180 kg' },
];

const statusConfig = {
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700', icon: Clock },
  COLLECTEUR_ASSIGNE: { label: 'Collecteur assigné', color: 'bg-blue-100 text-blue-700', icon: Users },
  EN_COURS: { label: 'En cours', color: 'bg-purple-100 text-purple-700', icon: TrendingUp },
  TERMINEE: { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  ANNULEE: { label: 'Annulée', color: 'bg-red-100 text-red-700', icon: XCircle },
};

export default function ProducteurDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'collectes' | 'recompenses'>('dashboard');

  return (
    <RoleLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Producteur</h1>
            <p className="text-muted-foreground mt-1">Suivez vos déclarations, collectes et impact écologique</p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/producteur/declarer">
                <Trash2 className="mr-2 h-4 w-4" />
                Déclarer un déchet
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {stats.map((stat, index) => (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">{stat.label}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.unit}</p>
                <p className="text-xs text-green-600 mt-1">{stat.trend} vs mois dernier</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { id: 'dashboard', label: 'Vue d\'ensemble', icon: <TrendingUp className="h-4 w-4" /> },
            { id: 'collectes', label: 'Mes collectes', icon: <Package className="h-4 w-4" /> },
            { id: 'recompenses', label: 'Récompenses', icon: <Award className="h-4 w-4" /> },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className="gap-2"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              {tab.icon}
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Dashboard Tab */}
        {activeTab === 'dashboard' && (
          <div className="grid gap-6 lg:grid-cols-2">
            {/* Waste Types */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Types de déchets déclarés
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {wasteTypes.map((waste, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${waste.color}`}>
                        {waste.icon} {waste.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-4 w-48">
                      <Progress value={(waste.count / 12) * 100} className="h-2 flex-1" />
                      <span className="text-sm font-medium w-12 text-right">{waste.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Impact Ecologique */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Leaf className="h-5 w-5" />
                  Impact écologique
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-lg bg-emerald-50 dark:bg-emerald-900/20">
                    <p className="text-2xl font-bold text-emerald-700">1 240 kg</p>
                    <p className="text-sm text-emerald-600">CO₂ évité</p>
                  </div>
                  <div className="p-4 rounded-lg bg-blue-50 dark:bg-blue-900/20">
                    <p className="text-2xl font-bold text-blue-700">850 kg</p>
                    <p className="text-sm text-blue-600">Matériaux recyclés</p>
                  </div>
                  <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20">
                    <p className="text-2xl font-bold text-amber-700">12</p>
                    <p className="text-sm text-amber-600">Arbres sauvés</p>
                  </div>
                  <div className="p-4 rounded-lg bg-purple-50 dark:bg-purple-900/20">
                    <p className="text-2xl font-bold text-purple-700">3 200 L</p>
                    <p className="text-sm text-purple-600">Eau économisée</p>
                  </div>
                </div>
                <div className="p-4 rounded-lg bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    <strong>Équivalent :</strong> Vos actions ont permis d'éviter l'émission de CO₂ équivalente à 
                    <strong>6 200 km en voiture</strong> ou l'alimentation de <strong>2 foyers</strong> pendant un an.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prochaine collecte */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Prochaine collecte prévue
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4 p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="p-3 rounded-full bg-blue-100 dark:bg-blue-900/30">
                    <Package className="h-6 w-6 text-blue-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">Collecte PLASTIQUE - 45 kg</p>
                    <p className="text-sm text-muted-foreground">Jean Martin • Arrivée estimée : 14h30</p>
                    <div className="flex items-center gap-2 mt-2">
                      <Badge variant="outline" className="bg-green-100 text-green-700">EN COURS</Badge>
                      <Button variant="outline" size="sm" asChild>
                        <Link href="/producteur/suivi/COL-2024-002">Suivre</Link>
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2">
                <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/producteur/declarer">
                    <Trash2 className="h-6 w-6" />
                    <span>Nouvelle déclaration</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/producteur/collectes?status=EN_ATTENTE">
                    <Clock className="h-6 w-6" />
                    <span>Collectes en attente</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/producteur/recompenses">
                    <Award className="h-6 w-6" />
                    <span>Mes récompenses</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/producteur/historique">
                    <Leaf className="h-6 w-6" />
                    <span>Impact complet</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Collectes Tab */}
        {activeTab === 'collectes' && (
          <Card>
            <CardHeader>
              <CardTitle>Mes demandes de collecte</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Référence</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Poids</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">Collecteur</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Points</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentCollectes.map((col) => {
                      const status = statusConfig[col.status as keyof typeof statusConfig];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={col.id} className="hover:bg-muted/50">
                          <td className="py-4 font-mono text-sm">{col.id}</td>
                          <td className="py-4">
                            <Badge variant="secondary">{col.type}</Badge>
                          </td>
                          <td className="py-4">{col.weight} kg</td>
                          <td className="py-4">
                            <Badge className={status.color} variant="default">
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4">{col.collector || '—'}</td>
                          <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(col.date)}</td>
                          <td className="py-4 font-medium text-green-600">{col.points} pts</td>
                          <td className="py-4 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/producteur/collectes/${col.id}`}>Détails</Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
              <div className="mt-4 flex justify-end">
                <Button variant="outline" asChild>
                  <Link href="/producteur/collectes">Voir toutes les collectes</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Récompenses Tab */}
        {activeTab === 'recompenses' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Historique des gains
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { date: '2024-01-15', type: 'Collecte PLASTIQUE', points: 120, icon: Trash2 },
                    { date: '2024-01-10', type: 'Collecte VERRE', points: 80, icon: Leaf },
                    { date: '2024-01-05', type: 'Bonus fidélité', points: 50, icon: Award },
                    { date: '2024-01-02', type: 'Collecte PAPIER', points: 90, icon: Package },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <item.icon className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                          <p className="font-medium">{item.type}</p>
                          <p className="text-sm text-muted-foreground">{formatRelativeTime(item.date)}</p>
                        </div>
                      </div>
                      <span className="text-lg font-bold text-green-600">+{item.points} pts</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Bons d'achat disponibles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { name: 'Épicerie Bio - 10€', code: 'BIO10', validUntil: '2024-03-15' },
                  { name: 'Jardinage - 15€', code: 'JARDIN15', validUntil: '2024-02-28' },
                  { name: 'Mobilité douce - 20€', code: 'VELO20', validUntil: '2024-04-01' },
                ].map((voucher, i) => (
                  <div key={i} className="p-3 rounded-lg border">
                    <p className="font-medium">{voucher.name}</p>
                    <p className="text-sm text-muted-foreground">Code: {voucher.code}</p>
                    <p className="text-xs text-muted-foreground">Valide jusqu'au {formatRelativeTime(voucher.validUntil)}</p>
                    <Button variant="outline" size="sm" className="mt-2 w-full">Utiliser</Button>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}