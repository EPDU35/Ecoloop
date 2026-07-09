'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/RoleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Package, MapPin, Clock, Award, TrendingUp, Users, Leaf, CheckCircle, AlertCircle, XCircle, ChevronRight, Plus, Search, Filter, Download, DollarSign, Factory, ShoppingCart, TrendingDown, BarChart3, Building2, Shield, Settings, CreditCard, History, UserCheck, UserX, UserMinus, Activity, PieChart, LineChart, Users2, ShieldCheck } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

const users = [
  { id: 'USR-001', name: 'Jean Martin', email: 'jean.martin@email.com', role: 'PRODUCTEUR', status: 'ACTIVE', createdAt: '2024-01-10', collectes: 12, points: 1240 },
  { id: 'USR-002', name: 'Marie Dubois', email: 'marie.dubois@collecte.fr', role: 'COLLECTEUR', status: 'ACTIVE', createdAt: '2024-01-08', collectes: 45, earnings: 2340 },
  { id: 'USR-003', name: 'Entreprise Recyclage SA', email: 'contact@recyclage-sa.com', role: 'INDUSTRIEL', status: 'ACTIVE', createdAt: '2024-01-05', orders: 8, volume: 15000 },
  { id: 'USR-004', name: 'Mairie de Paris 15e', email: 'environnement@mairie15.paris.fr', role: 'MAIRIE', status: 'ACTIVE', createdAt: '2024-01-03', zones: 4, alerts: 2 },
  { id: 'USR-005', name: 'Pierre Durand', email: 'pierre.durand@email.com', role: 'COLLECTEUR', status: 'SUSPENDED', createdAt: '2024-01-12', collectes: 3, earnings: 180 },
];

const collectes = [
  { id: 'COL-2024-001', producer: 'Jean Martin', collector: 'Marie Dubois', type: 'PLASTIQUE', weight: 45, status: 'TERMINEE', date: '2024-01-15', points: 120 },
  { id: 'COL-2024-002', producer: 'Boutique Mode', collector: 'Pierre Durand', type: 'PAPIER/CARTON', weight: 120, status: 'EN_COURS', date: '2024-01-14', points: 80 },
  { id: 'COL-2024-003', producer: 'Restaurant Le Petit', collector: null, type: 'VERRE', weight: 30, status: 'EN_ATTENTE', date: '2024-01-13', points: 0 },
];

const payments = [
  { id: 'PAY-001', user: 'Marie Dubois', amount: 185.50, type: 'GAIN_COLLECTE', status: 'COMPLETE', date: '2024-01-15' },
  { id: 'PAY-002', user: 'Recyclage Plastique SA', amount: 1125.00, type: 'ACHAT_LOT', status: 'EN_ATTENTE', date: '2024-01-14' },
  { id: 'PAY-003', user: 'Jean Martin', amount: 25.00, type: 'RECOMPENSE', status: 'COMPLETE', date: '2024-01-13' },
];

const stats = [
  { label: 'Utilisateurs totaux', value: '1 247', icon: Users, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+23' },
  { label: 'Collectes aujourd\'hui', value: '42', icon: Package, color: 'text-green-600', bg: 'bg-green-100', trend: '+5' },
  { label: 'Volume traité', value: '12.5 T', icon: Trash2, color: 'text-orange-600', bg: 'bg-orange-100', trend: '+1.2 T' },
  { label: 'Revenus plateforme', value: '€3 450', icon: DollarSign, color: 'text-emerald-600', bg: 'bg-emerald-100', trend: '+€420' },
];

const statusConfig = {
  ACTIVE: { label: 'Actif', color: 'bg-green-100 text-green-700', icon: UserCheck },
  SUSPENDED: { label: 'Suspendu', color: 'bg-red-100 text-red-700', icon: UserX },
  PENDING_VERIFICATION: { label: 'En vérification', color: 'bg-yellow-100 text-yellow-700', icon: ShieldCheck },
  BANNED: { label: 'Banni', color: 'bg-gray-100 text-gray-700', icon: UserMinus },
};

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'users' | 'collectes' | 'finance' | 'partners' | 'analytics' | 'support' | 'settings'>('dashboard');

  return (
    <RoleLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Backoffice EcoLoop</h1>
            <p className="text-muted-foreground mt-1">Administration centrale de la plateforme</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/admin/exports">
                <Download className="mr-2 h-4 w-4" />
                Exports
              </Link>
            </Button>
          </div>
        </div>

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
                <p className="text-xs text-muted-foreground">vs mois dernier</p>
                <span className="text-xs font-medium text-green-600">{stat.trend}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex flex-wrap gap-2 border-b">
          {[
            { id: 'dashboard', label: 'Dashboard', icon: Activity },
            { id: 'users', label: 'Utilisateurs', icon: Users2 },
            { id: 'collectes', label: 'Collectes', icon: Package },
            { id: 'finance', label: 'Finance', icon: DollarSign },
            { id: 'partners', label: 'Partenaires', icon: Building2 },
            { id: 'analytics', label: 'Analytics', icon: BarChart3 },
            { id: 'support', label: 'Support', icon: ShieldCheck },
            { id: 'settings', label: 'Paramètres', icon: Settings },
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

        {activeTab === 'dashboard' && (
          <div className="grid gap-6 lg:grid-cols-3">
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Activité récente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {[
                  { action: 'Nouvel utilisateur', user: 'Entreprise Recyclage SA', role: 'INDUSTRIEL', time: '2024-01-15T08:30:00' },
                  { action: 'Collecte terminée', user: 'Jean Martin', role: 'PRODUCTEUR', time: '2024-01-15T09:45:00' },
                  { action: 'Paiement reçu', user: 'Marie Dubois', role: 'COLLECTEUR', time: '2024-01-15T10:15:00' },
                  { action: 'Nouvelle alerte', user: 'Mairie Paris 15e', role: 'MAIRIE', time: '2024-01-15T11:00:00' },
                  { action: 'Utilisateur suspendu', user: 'Pierre Durand', role: 'COLLECTEUR', time: '2024-01-15T11:30:00' },
                ].map((act, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <Activity className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{act.action}</p>
                        <p className="text-sm text-muted-foreground">{act.user} • {act.role}</p>
                      </div>
                    </div>
                    <span className="text-sm text-muted-foreground">{formatRelativeTime(act.time)}</span>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition par rôle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { role: 'PRODUCTEUR', count: 542, color: 'bg-green-500' },
                  { role: 'COLLECTEUR', count: 187, color: 'bg-blue-500' },
                  { role: 'INDUSTRIEL', count: 45, color: 'bg-orange-500' },
                  { role: 'MAIRIE', count: 12, color: 'bg-purple-500' },
                  { role: 'ADMIN', count: 8, color: 'bg-red-500' },
                ].map((r) => (
                  <div key={r.role} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${r.color}`} />
                      <span className="font-medium">{r.role}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={(r.count / 794) * 100} className="h-2 w-32" />
                      <span className="text-sm font-medium w-12 text-right">{r.count}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <LineChart className="h-5 w-5" />
                  Croissance utilisateurs - 30 jours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around gap-1">
                  {Array.from({ length: 30 }, (_, i) => {
                    const height = 20 + Math.sin(i * 0.3) * 15 + Math.random() * 20;
                    return (
                      <div key={i} className="w-full bg-primary rounded-t transition-all hover:bg-primary/80" style={{ height: `${height}%` }} />
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card className="lg:col-span-3">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Volume de déchets par type
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-6">
                  {[
                    { type: 'PLASTIQUE', volume: '4.2 T', percent: 34, color: 'bg-blue-500' },
                    { type: 'PAPIER/CARTON', volume: '3.8 T', percent: 30, color: 'bg-amber-500' },
                    { type: 'VERRE', volume: '2.1 T', percent: 17, color: 'bg-green-500' },
                    { type: 'MÉTAL', volume: '1.1 T', percent: 9, color: 'bg-gray-500' },
                    { type: 'ÉLECTRONIQUE', volume: '0.7 T', percent: 6, color: 'bg-purple-500' },
                    { type: 'ORGANIQUES', volume: '0.6 T', percent: 4, color: 'bg-orange-500' },
                  ].map((w) => (
                    <div key={w.type} className="p-4 bg-muted/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="font-medium">{w.type}</span>
                        <span className="text-sm text-muted-foreground">{w.volume}</span>
                      </div>
                      <Progress value={w.percent} className="h-2" />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>{w.percent}%</span>
                        <div className={`w-3 h-3 rounded-full ${w.color}`} />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'users' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Gestion des utilisateurs</CardTitle>
              <div className="flex gap-2">
                <input type="text" placeholder="Rechercher..." className="w-64" />
                <select className="border rounded-lg px-3 py-2">
                  <option>Tous les rôles</option>
                  <option>PRODUCTEUR</option>
                  <option>COLLECTEUR</option>
                  <option>INDUSTRIEL</option>
                  <option>MAIRIE</option>
                </select>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Nom</th>
                      <th className="pb-3 font-medium">Email</th>
                      <th className="pb-3 font-medium">Rôle</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">Inscrit le</th>
                      <th className="pb-3 font-medium">Activité</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {users.map((user) => {
                      const status = statusConfig[user.status as keyof typeof statusConfig];
                      const StatusIcon = status.icon;
                      return (
                        <tr key={user.id} className="hover:bg-muted/50">
                          <td className="py-4 font-mono text-sm">{user.id}</td>
                          <td className="py-4 font-medium">{user.name}</td>
                          <td className="py-4 text-sm text-muted-foreground">{user.email}</td>
                          <td className="py-4"><Badge variant="secondary">{user.role}</Badge></td>
                          <td className="py-4">
                            <Badge className={status.color} variant="default">
                              <StatusIcon className="mr-1 h-3 w-3" />
                              {status.label}
                            </Badge>
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(user.createdAt)}</td>
                          <td className="py-4 text-sm">
                            {user.collectes ? `${user.collectes} collectes` : user.orders ? `${user.orders} commandes` : user.zones ? `${user.zones} zones` : '—'}
                          </td>
                          <td className="py-4 text-right">
                            <div className="flex items-center justify-end gap-1">
                              <Button variant="ghost" size="sm">Voir</Button>
                              <Button variant="ghost" size="sm">Modifier</Button>
                              {user.status === 'ACTIVE' ? (
                                <Button variant="ghost" size="sm" className="text-destructive">Suspendre</Button>
                              ) : (
                                <Button variant="ghost" size="sm" className="text-green-600">Réactiver</Button>
                              )}
                            </div>
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

        {activeTab === 'collectes' && (
          <Card>
            <CardHeader>
              <CardTitle>Toutes les collectes</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Producteur</th>
                      <th className="pb-3 font-medium">Collecteur</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Poids</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Points</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {collectes.map((col) => (
                      <tr key={col.id} className="hover:bg-muted/50">
                        <td className="py-4 font-mono text-sm">{col.id}</td>
                        <td className="py-4">{col.producer}</td>
                        <td className="py-4">{col.collector || 'Non assigné'}</td>
                        <td className="py-4"><Badge variant="secondary">{col.type}</Badge></td>
                        <td className="py-4">{col.weight} kg</td>
                        <td className="py-4">
                          <Badge variant="outline">{col.status}</Badge>
                        </td>
                        <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(col.date)}</td>
                        <td className="py-4">{col.points} pts</td>
                        <td className="py-4 text-right">
                          <Button variant="ghost" size="sm">Détails</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'finance' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Paiements récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">ID</th>
                        <th className="pb-3 font-medium">Utilisateur</th>
                        <th className="pb-3 font-medium">Montant</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Statut</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {payments.map((p) => (
                        <tr key={p.id} className="hover:bg-muted/50">
                          <td className="py-4 font-mono text-sm">{p.id}</td>
                          <td className="py-4">{p.user}</td>
                          <td className="py-4 font-medium">{formatCurrency(p.amount)}</td>
                          <td className="py-4"><Badge variant="secondary">{p.type}</Badge></td>
                          <td className="py-4">
                            <Badge variant={p.status === 'COMPLETE' ? 'success' : 'outline'}>{p.status}</Badge>
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(p.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Commissions EcoLoop</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-700">€1 247.50</div>
                  <div className="text-sm text-green-600">Commissions du mois</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">€890.00</div>
                    <div className="text-xs text-muted-foreground">Sur collectes</div>
                  </div>
                  <div className="p-3 bg-muted/50 rounded-lg">
                    <div className="text-xl font-bold">€357.50</div>
                    <div className="text-xs text-muted-foreground">Sur ventes lots</div>
                  </div>
                </div>
                <Progress value={78} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">Objectif mensuel: €1 600 (78% atteint)</p>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Référence</th>
                        <th className="pb-3 font-medium">Expéditeur</th>
                        <th className="pb-3 font-medium">Destinataire</th>
                        <th className="pb-3 font-medium">Montant</th>
                        <th className="pb-3 font-medium">Commission</th>
                        <th className="pb-3 font-medium">Statut</th>
                        <th className="pb-3 font-medium">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {[
                        { ref: 'TXN-001', from: 'Recyclage Plastique SA', to: 'Marie Dubois', amount: 1125, commission: 56.25, status: 'COMPLETE', date: '2024-01-15' },
                        { ref: 'TXN-002', from: 'Papeterie Moderne', to: 'Jean Martin', amount: 540, commission: 27, status: 'EN_ATTENTE', date: '2024-01-14' },
                      ].map((t, i) => (
                        <tr key={i} className="hover:bg-muted/50">
                          <td className="py-4 font-mono text-sm">{t.ref}</td>
                          <td className="py-4">{t.from}</td>
                          <td className="py-4">{t.to}</td>
                          <td className="py-4 font-medium">{formatCurrency(t.amount)}</td>
                          <td className="py-4 text-green-600">{formatCurrency(t.commission)}</td>
                          <td className="py-4"><Badge variant={t.status === 'COMPLETE' ? 'success' : 'outline'}>{t.status}</Badge></td>
                          <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(t.date)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'analytics' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Métriques clés</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {[
                  { label: 'Taux de conversion déclaration→collecte', value: '87%', trend: '+2%' },
                  { label: 'Temps moyen assignation collecteur', value: '12 min', trend: '-3 min' },
                  { label: 'Satisfaction collecteurs', value: '4.7/5', trend: '+0.1' },
                  { label: 'Satisfaction producteurs', value: '4.5/5', trend: 'stable' },
                  { label: 'Taux de remplissage véhicules', value: '73%', trend: '+5%' },
                  { label: 'Coût d\'acquisition utilisateur', value: '€18.50', trend: '-€2.30' },
                ].map((m, i) => (
                  <div key={i} className="p-4 bg-muted/50 rounded-lg">
                    <p className="text-sm text-muted-foreground">{m.label}</p>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-2xl font-bold">{m.value}</span>
                      <span className="text-sm text-green-600">{m.trend}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance par zone</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { zone: 'Paris Centre', collectes: 145, taux: 92, revenu: 3240 },
                  { zone: 'Paris Nord', collectes: 98, taux: 88, revenu: 2100 },
                  { zone: 'Paris Est', collectes: 87, taux: 85, revenu: 1890 },
                  { zone: 'Paris Ouest', collectes: 76, taux: 90, revenu: 1650 },
                  { zone: 'Banlieue Sud', collectes: 45, taux: 78, revenu: 980 },
                ].map((z, i) => (
                  <div key={i} className="p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium">{z.zone}</span>
                      <Badge variant="success">{z.taux}%</Badge>
                    </div>
                    <div className="flex gap-4 text-sm text-muted-foreground">
                      <span>{z.collectes} collectes</span>
                      <span>{formatCurrency(z.revenu)}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Répartition revenus</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around gap-2">
                  {['Sem 1', 'Sem 2', 'Sem 3', 'Sem 4'].map((week, i) => {
                    const commissions = [420, 380, 447, 450];
                    const lots = [350, 420, 390, 410];
                    const rewards = [80, 95, 85, 90];
                    return (
                      <div key={week} className="flex flex-col items-center flex-1 gap-2">
                        <div className="w-full flex flex-col gap-1">
                          <div className="bg-emerald-500 rounded-t" style={{ height: `${(commissions[i] / 500) * 80}%` }} />
                          <div className="bg-blue-500 rounded-t" style={{ height: `${(lots[i] / 500) * 80}%` }} />
                          <div className="bg-yellow-500 rounded-t" style={{ height: `${(rewards[i] / 200) * 80}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{week}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="flex justify-center gap-6 mt-4 text-sm">
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-emerald-500" /> Commissions</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-blue-500" /> Ventes lots</span>
                  <span className="flex items-center gap-1"><span className="w-3 h-3 rounded bg-yellow-500" /> Récompenses</span>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'support' && (
          <Card>
            <CardHeader>
              <CardTitle>Tickets de support</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">ID</th>
                      <th className="pb-3 font-medium">Utilisateur</th>
                      <th className="pb-3 font-medium">Sujet</th>
                      <th className="pb-3 font-medium">Catégorie</th>
                      <th className="pb-3 font-medium">Priorité</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 fontmedium">Assigné à</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {[
                      { id: 'TKT-001', user: 'Jean Martin', subject: 'Collecte non effectuée', category: 'COLLECTE', priority: 'HAUTE', status: 'EN_COURS', assigned: 'Marie Support', date: '2024-01-15' },
                      { id: 'TKT-002', user: 'Entreprise ABC', subject: 'Facture incorrecte', category: 'PAIEMENT', priority: 'NORMALE', status: 'OUVERT', assigned: '—', date: '2024-01-14' },
                      { id: 'TKT-003', user: 'Marie Dubois', subject: 'Problème GPS application', category: 'TECHNIQUE', priority: 'URGENTE', status: 'EN_COURS', assigned: 'Tech Support', date: '2024-01-15' },
                    ].map((t, i) => (
                      <tr key={i} className="hover:bg-muted/50">
                        <td className="py-4 font-mono text-sm">{t.id}</td>
                        <td className="py-4">{t.user}</td>
                        <td className="py-4">{t.subject}</td>
                        <td className="py-4"><Badge variant="secondary">{t.category}</Badge></td>
                        <td className="py-4"><Badge variant={t.priority === 'URGENTE' ? 'destructive' : t.priority === 'HAUTE' ? 'warning' : 'outline'}>{t.priority}</Badge></td>
                        <td className="py-4"><Badge variant={t.status === 'EN_COURS' ? 'success' : 'outline'}>{t.status}</Badge></td>
                        <td className="py-4">{t.assigned}</td>
                        <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(t.date)}</td>
                        <td className="py-4 text-right"><Button variant="ghost" size="sm">Traiter</Button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'settings' && (
          <div className="grid gap-6 lg:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Paramètres généraux</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div>
                  <label className="block text-sm font-medium mb-2">Commission plateforme (%)</label>
                  <input type="number" step="0.1" defaultValue="5.5" className="w-32" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Seuil alerte saturation (kg)</label>
                  <input type="number" defaultValue="3000" className="w-32" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Points par kg (producteur)</label>
                  <input type="number" defaultValue="2" className="w-32" />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Paiement minimum collecteur (€)</label>
                  <input type="number" step="0.01" defaultValue="10" className="w-32" />
                </div>
                <Button>Sauvegarder</Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Notifications système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { label: 'Nouvelles inscriptions', enabled: true },
                  { label: 'Collectes en retard', enabled: true },
                  { label: 'Paiements échoués', enabled: true },
                  { label: 'Alertes saturation zones', enabled: true },
                  { label: 'Rapports quotidiens', enabled: false },
                ].map((n, i) => (
                  <label key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg cursor-pointer">
                    <span className="font-medium">{n.label}</span>
                    <input type="checkbox" defaultChecked={n.enabled} className="w-4 h-4 rounded" />
                  </label>
                ))}
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </RoleLayout>
  );
}