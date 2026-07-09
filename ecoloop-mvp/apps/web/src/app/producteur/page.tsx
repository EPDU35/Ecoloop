'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/RoleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Package, MapPin, Clock, Award, TrendingUp, Users, Leaf, CheckCircle, AlertCircle, XCircle, ChevronRight, Plus, Search, Filter, Download } from 'lucide-react';
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
                <Plus className="mr-2 h-4 w-4" />
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
                <CardTitle className="text-sm font-medium">{stat.label}</CardTitle>
                <div className={`p-2 rounded-lg ${stat.bg}`}>
                  <stat.icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">{stat.unit}</p>
                <span className="text-xs font-medium text-green-600">{stat.trend}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { id: 'dashboard', label: 'Vue d\'ensemble', icon: TrendingUp },
            { id: 'collectes', label: 'Mes collectes', icon: Package },
            { id: 'recompenses', label: 'Récompenses', icon: Award },
          ].map((tab) => (
            <Button
              key={tab.id}
              variant={activeTab === tab.id ? 'default' : 'ghost'}
              className="gap-2"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </Button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === 'dashboard' && (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {/* Waste Types */}
            <Card className="md:col-span-2 lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trash2 className="h-5 w-5" />
                  Types de déchets déclarés
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {wasteTypes.map((wt, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${wt.color}`}>
                          {wt.icon}
                        </span>
                        <span className="font-medium">{wt.type}</span>
                      </div>
                      <div className="flex items-center gap-4 w-64">
                        <Progress value={wt.count * 5} className="flex-1 h-2" />
                        <span className="text-sm font-medium w-10 text-right">{wt.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <ChevronRight className="h-5 w-5" />
                  Actions rapides
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/producteur/declarer">
                    <Plus className="h-4 w-4" />
                    Nouvelle déclaration
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/producteur/collectes">
                    <Package className="h-4 w-4" />
                    Voir toutes mes collectes
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/producteur/recompenses">
                    <Award className="h-4 w-4" />
                    Mes récompenses
                  </Link>
                </Button>
                <Button variant="outline" className="w-full justify-start gap-2" asChild>
                  <Link href="/producteur/profil">
                    <Search className="h-4 w-4" />
                    Modifier mon profil
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'collectes' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Mes demandes de collecte</CardTitle>
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  <Filter className="mr-2 h-4 w-4" />
                  Filtres
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="mr-2 h-4 w-4" />
                  Exporter
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">ID</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Poids</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Statut</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Date</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Collecteur</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-muted-foreground">Points</th>
                      <th className="px-4 py-3 text-right text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {recentCollectes.map((col) => {
                      const config = statusConfig[col.status as keyof typeof statusConfig];
                      const Icon = config.icon;
                      return (
                        <tr key={col.id} className="hover:bg-muted/50">
                          <td className="px-4 py-3 text-sm font-mono">{col.id}</td>
                          <td className="px-4 py-3 text-sm">
                            <Badge variant="secondary" className="gap-1">
                              {col.type}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm">{col.weight} kg</td>
                          <td className="px-4 py-3">
                            <Badge variant="outline" className={config.color}>
                              <Icon className="h-3 w-3 mr-1" />
                              {config.label}
                            </Badge>
                          </td>
                          <td className="px-4 py-3 text-sm text-muted-foreground">{formatRelativeTime(col.date)}</td>
                          <td className="px-4 py-3 text-sm">{col.collector || '—'}</td>
                          <td className="px-4 py-3 text-sm font-medium text-yellow-600">{col.points} pts</td>
                          <td className="px-4 py-3 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/producteur/collectes/${col.id}`}>
                                <ChevronRight className="h-4 w-4" />
                              </Link>
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'recompenses' && (
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Points disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="text-center py-8">
                <div className="text-5xl font-bold text-yellow-600 mb-2">2 840</div>
                <p className="text-muted-foreground mb-6">points cumulés</p>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-4 bg-yellow-50 rounded-lg">
                    <div className="text-2xl font-bold text-yellow-700">1 200</div>
                    <div className="text-xs text-muted-foreground">Collectes</div>
                  </div>
                  <div className="p-4 bg-green-50 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">840</div>
                    <div className="text-xs text-muted-foreground">Parrainage</div>
                  </div>
                  <div className="p-4 bg-blue-50 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">800</div>
                    <div className="text-xs text-muted-foreground">Bonus</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Award className="h-5 w-5" />
                  Récompenses récentes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'Bon d\'achat 20€ - Carrefour', date: '2024-01-10', value: 2000, used: false },
                    { name: 'Don association - 10€', date: '2024-01-05', value: 1000, used: true },
                    { name: 'Bon d\'achat 15€ - Leroy Merlin', date: '2023-12-20', value: 1500, used: false },
                  ].map((reward, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                          <Award className="h-5 w-5 text-yellow-600" />
                        </div>
                        <div>
                          <p className="font-medium">{reward.name}</p>
                          <p className="text-sm text-muted-foreground">{formatRelativeTime(reward.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-yellow-600">{formatCurrency(reward.value / 100)}</p>
                        <Badge variant={reward.used ? 'secondary' : 'outline'}>
                          {reward.used ? 'Utilisé' : 'Disponible'}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Impact écologique */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Leaf className="h-5 w-5 text-emerald-600" />
              Impact écologique
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {[
                { label: 'Kg recyclés', value: '2 840', icon: Package, color: 'text-blue-600' },
                { label: 'CO₂ évité', value: '1 240 kg', icon: Leaf, color: 'text-emerald-600' },
                { label: 'Arbres sauvés', value: '42', icon: TrendingUp, color: 'text-green-600' },
                { label: 'Énergie économisée', value: '5 680 kWh', icon: Trash2, color: 'text-orange-600' },
              ].map((item, i) => (
                <div key={i} className="text-center p-4 bg-muted/50 rounded-lg">
                  <div className={`p-3 rounded-full w-fit mx-auto mb-2 ${item.color} bg-opacity-10`}>
                    <item.icon className="h-6 w-6" />
                  </div>
                  <div className="text-2xl font-bold">{item.value}</div>
                  <div className="text-sm text-muted-foreground">{item.label}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </RoleLayout>
  );
}