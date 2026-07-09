'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/RoleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MapPin, Truck, Package, Navigation, DollarSign, CreditCard, Calendar, Clock, CheckCircle, Map, Users, Settings, Bell, Menu, X, ChevronDown, ChevronRight, Plus, Search, Filter, MapPin as MapPinIcon, ArrowRight, Star } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

const availableMissions = [
  { id: 'MIS-001', type: 'PLASTIQUE', weight: 45, distance: 2.3, earning: 18.50, address: '12 Rue de la Paix, 75001 Paris', producer: 'Marie Dubois', status: 'DISPONIBLE' },
  { id: 'MIS-002', type: 'PAPIER/CARTON', weight: 120, distance: 1.8, earning: 24.00, address: '45 Avenue des Champs, 75008 Paris', producer: 'Entreprise ABC', status: 'DISPONIBLE' },
  { id: 'MIS-003', type: 'VERRE', weight: 30, distance: 3.1, earning: 15.00, address: '78 Boulevard Saint-Germain, 75006 Paris', producer: 'Restaurant Le Petit', status: 'DISPONIBLE' },
  { id: 'MIS-004', type: 'MÉTAL', weight: 25, distance: 4.2, earning: 22.50, address: '23 Rue Oberkampf, 75011 Paris', producer: 'Atelier Métal', status: 'DISPONIBLE' },
];

const myMissions = [
  { id: 'MIS-005', type: 'PLASTIQUE', weight: 60, earning: 22.00, status: 'EN_COURS', producer: 'Jean Martin', address: '10 Rue de Rivoli, 75004 Paris', startedAt: '2024-01-15T09:30:00' },
  { id: 'MIS-006', type: 'PAPIER/CARTON', weight: 80, earning: 18.50, status: 'ARRIVE', producer: 'Boutique Mode', address: '55 Rue du Commerce, 75015 Paris', startedAt: '2024-01-15T10:00:00' },
];

const completedToday = [
  { id: 'MIS-007', type: 'VERRE', weight: 40, earning: 16.00, completedAt: '2024-01-15T08:45:00' },
  { id: 'MIS-008', type: 'ORGANIQUES', weight: 150, earning: 35.00, completedAt: '2024-01-15T11:20:00' },
];

const stats = [
  { label: 'Missions aujourd\'hui', value: '4', icon: Truck, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Revenus du jour', value: '€91.50', icon: DollarSign, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Kg collectés', value: '275 kg', icon: Package, color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Taux de réussite', value: '96%', icon: Star, color: 'text-purple-600', bg: 'bg-purple-100' },
];

const statusConfig = {
  DISPONIBLE: { label: 'Disponible', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  ACCEPTEE: { label: 'Acceptée', color: 'bg-blue-100 text-blue-700', icon: Truck },
  EN_ROUTE: { label: 'En route', color: 'bg-yellow-100 text-yellow-700', icon: Navigation },
  ARRIVE: { label: 'Arrivé', color: 'bg-purple-100 text-purple-700', icon: MapPin },
  EN_COURS_COLLECTE: { label: 'Collecte en cours', color: 'bg-orange-100 text-orange-700', icon: Package },
  TERMINEE: { label: 'Terminée', color: 'bg-green-100 text-green-700', icon: CheckCircle },
  REFUSEE: { label: 'Refusée', color: 'bg-red-100 text-red-700', icon: X },
  ANNULEE: { label: 'Annulée', color: 'bg-gray-100 text-gray-700', icon: X },
};

export default function CollecteurDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'marketplace' | 'missions' | 'pesee'>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <RoleLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Tableau de bord Collecteur</h1>
            <p className="text-muted-foreground mt-1">Gérez vos missions, optimisez vos tournées, maximisez vos revenus</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/collecteur/missions/nouvelle">
                <Plus className="mr-2 h-4 w-4" />
                Nouvelle mission
              </Link>
            </Button>
            <Button asChild>
              <Link href="/collecteur/marketplace">
                <MapPin className="mr-2 h-4 w-4" />
                Voir le marketplace
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
                <p className="text-xs text-muted-foreground">Mis à jour il y a 5 min</p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="h-4 w-4" /> },
            { id: 'marketplace', label: 'Marketplace', icon: <MapPin className="h-4 w-4" /> },
            { id: 'missions', label: 'Mes missions', icon: <Truck className="h-4 w-4" /> },
            { id: 'pesee', label: 'Pesée', icon: <Package className="h-4 w-4" /> },
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
            {/* Missions en cours */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Missions en cours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {myMissions.map((mission) => {
                  const status = statusConfig[mission.status as keyof typeof statusConfig];
                  const StatusIcon = status.icon;
                  return (
                    <div key={mission.id} className="p-4 bg-muted/50 rounded-lg border">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <Badge variant="secondary">{mission.type}</Badge>
                            <Badge className={status.color} variant="default">
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </div>
                          <p className="font-medium">{mission.producer}</p>
                          <p className="text-sm text-muted-foreground">{mission.address}</p>
                          <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                            <span className="flex items-center gap-1"><MapPinIcon className="h-3 w-3" /> {mission.weight} kg</span>
                            <span className="flex items-center gap-1"><DollarSign className="h-3 w-3" /> {formatCurrency(mission.earning)}</span>
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Button size="sm" variant="outline" asChild>
                            <Link href={`/collecteur/missions/${mission.id}`}>
                              <Navigation className="mr-1 h-3 w-3" />
                              Navigation
                            </Link>
                          </Button>
                          {mission.status === 'ARRIVE' && (
                            <Button size="sm" asChild>
                              <Link href={`/collecteur/pesee/${mission.id}`}>
                                <Package className="mr-1 h-3 w-3" />
                                Commencer pesée
                              </Link>
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {myMissions.length === 0 && (
                  <div className="text-center py-8 text-muted-foreground">
                    <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Aucune mission en cours</p>
                    <Button variant="outline" asChild className="mt-4">
                      <Link href="/collecteur/marketplace">Voir les missions disponibles</Link>
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Revenus du jour */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Revenus du jour
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-700">€91.50</div>
                  <div className="text-sm text-green-600">+12% vs hier</div>
                </div>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">€52.00</div>
                    <div className="text-xs text-muted-foreground">Missions en cours</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold text-green-600">€39.50</div>
                    <div className="text-xs text-muted-foreground">Déjà gagnés</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">€127.00</div>
                    <div className="text-xs text-muted-foreground">Potentiel total</div>
                  </div>
                </div>
                <Progress value={72} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">Objectif journalier: €127.00 (72% atteint)</p>
              </CardContent>
            </Card>

            {/* Collectes terminées aujourd'hui */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle className="h-5 w-5" />
                  Collectes terminées aujourd'hui
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Mission</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Poids</th>
                        <th className="pb-3 font-medium">Gain</th>
                        <th className="pb-3 font-medium">Terminée à</th>
                        <th className="pb-3 font-medium">Statut paiement</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {completedToday.map((mission) => (
                        <tr key={mission.id} className="hover:bg-muted/50">
                          <td className="py-4 font-mono text-sm">{mission.id}</td>
                          <td className="py-4"><Badge variant="secondary">{mission.type}</Badge></td>
                          <td className="py-4">{mission.weight} kg</td>
                          <td className="py-4 font-medium text-green-600">{formatCurrency(mission.earning)}</td>
                          <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(mission.completedAt)}</td>
                          <td className="py-4"><Badge variant="success">Payé</Badge></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="grid gap-2 sm:grid-cols-2 md:grid-cols-4">
                <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/collecteur/marketplace">
                    <MapPin className="h-6 w-6" />
                    <span>Missions proches</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/collecteur/missions">
                    <Truck className="h-6 w-6" />
                    <span>Mes missions</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/collecteur/revenus">
                    <DollarSign className="h-6 w-6" />
                    <span>Mes revenus</span>
                  </Link>
                </Button>
                <Button variant="outline" asChild className="h-auto py-4 flex-col gap-2">
                  <Link href="/collecteur/profil">
                    <Settings className="h-6 w-6" />
                    <span>Profil & Véhicule</span>
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Marketplace Tab */}
        {activeTab === 'marketplace' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input type="text" placeholder="Rechercher par adresse, type..." className="w-full" />
              </div>
              <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filtres</Button>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {availableMissions.map((mission) => (
                <Card key={mission.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <Badge variant="secondary">{mission.type}</Badge>
                        <Badge variant="success" className="ml-2">{mission.status}</Badge>
                      </div>
                      <span className="text-lg font-bold text-green-600">{formatCurrency(mission.earning)}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <p className="font-medium">{mission.producer}</p>
                    <p className="text-sm text-muted-foreground flex items-center gap-1">
                      <MapPinIcon className="h-3 w-3" /> {mission.address}
                    </p>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground pt-2 border-t">
                      <span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> {mission.distance} km</span>
                      <span className="flex items-center gap-1"><Package className="h-3 w-3" /> ~{mission.weight} kg</span>
                    </div>
                    <Button className="w-full" asChild>
                      <Link href={`/collecteur/missions/${mission.id}/accepter`}>
                        Accepter la mission
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Missions Tab */}
        {activeTab === 'missions' && (
          <Card>
            <CardHeader>
              <CardTitle>Toutes mes missions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Mission</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Producteur</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">Gain</th>
                      <th className="pb-3 font-medium">Début</th>
                      <th className="pb-3 font-medium">Fin</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[...myMissions, ...completedToday].map((mission) => {
                      const status = statusConfig[mission.status as keyof typeof statusConfig] || statusConfig.DISPONIBLE;
                      const StatusIcon = status.icon;
                      return (
                        <tr key={mission.id} className="hover:bg-muted/50">
                          <td className="py-4 font-mono text-sm">{mission.id}</td>
                          <td className="py-4"><Badge variant="secondary">{mission.type}</Badge></td>
                          <td className="py-4">{mission.producer}</td>
                          <td className="py-4">
                            <Badge className={status.color} variant="default">
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4 font-medium">{formatCurrency(mission.earning)}</td>
                          <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(mission.startedAt || mission.completedAt)}</td>
                          <td className="py-4 text-sm text-muted-foreground">{mission.completedAt ? formatRelativeTime(mission.completedAt) : '—'}</td>
                          <td className="py-4 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/collecteur/missions/${mission.id}`}>Détails</Link>
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

        {/* Pesée Tab */}
        {activeTab === 'pesee' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Pesée en cours
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700">Mission: MIS-006 - PAPIER/CARTON</p>
                  <p className="text-sm text-blue-700">Producteur: Boutique Mode</p>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Poids réel (kg)</label>
                  <input type="number" step="0.1" className="w-full text-3xl font-bold text-center" placeholder="0.0" />
                </div>
                <div className="grid gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Photo de la pesée</label>
                    <div className="aspect-video bg-muted/50 rounded-lg border-2 border-dashed flex items-center justify-center">
                      <Camera className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Signature collecteur</label>
                    <div className="aspect-video bg-muted/50 rounded-lg border-2 border-dashed flex items-center justify-center">
                      <PenTool className="h-12 w-12 text-muted-foreground" />
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" className="flex-1">Annuler</Button>
                  <Button className="flex-1" size="lg">
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Valider la pesée
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Historique des pesées</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { mission: 'MIS-007', type: 'VERRE', estimated: 35, actual: 40, date: '2024-01-15T08:45:00', status: 'VALIDEE' },
                    { mission: 'MIS-008', type: 'ORGANIQUES', estimated: 140, actual: 150, date: '2024-01-15T11:20:00', status: 'VALIDEE' },
                    { mission: 'MIS-009', type: 'PLASTIQUE', estimated: 50, actual: 48, date: '2024-01-14T16:30:00', status: 'VALIDEE' },
                  ].map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{w.type}</Badge>
                        <div>
                          <p className="font-medium">{w.mission}</p>
                          <p className="text-sm text-muted-foreground">{formatRelativeTime(w.date)}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium">Estimé: {w.estimated} kg</p>
                        <p className="font-medium text-green-600">Réel: {w.actual} kg</p>
                        <Badge variant="success">{w.status}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}