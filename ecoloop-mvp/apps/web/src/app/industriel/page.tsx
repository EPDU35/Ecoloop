'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/RoleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Package, MapPin, Clock, Award, TrendingUp, Users, Leaf, CheckCircle, AlertCircle, XCircle, ChevronRight, Plus, Search, Filter, Download, DollarSign, Factory, ShoppingCart, TrendingDown, BarChart3 } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

const availableLots = [
  { id: 'LOT-2024-001', type: 'PLASTIQUE', weight: 2500, quality: 'A', price: 0.45, location: 'Zone Industrielle Nord', distance: 12.5, status: 'DISPONIBLE', industrial: 'Recyclage Plastique SA' },
  { id: 'LOT-2024-002', type: 'PAPIER/CARTON', weight: 5000, quality: 'B', price: 0.18, location: 'Centre de Tri Est', distance: 8.2, status: 'DISPONIBLE', industrial: 'Papeterie Moderne' },
  { id: 'LOT-2024-003', type: 'VERRE', weight: 10000, quality: 'A', price: 0.08, location: 'Verrierie Sud', distance: 25.0, status: 'RESERVE', industrial: 'Verre France' },
  { id: 'LOT-2024-004', type: 'MÉTAL', weight: 800, quality: 'A', price: 1.20, location: 'Fonderie Ouest', distance: 15.8, status: 'DISPONIBLE', industrial: 'Métallurgie Pro' },
];

const myOrders = [
  { id: 'CMD-2024-001', lotId: 'LOT-2024-001', type: 'PLASTIQUE', quantity: 2000, totalPrice: 900, status: 'LIVREE', date: '2024-01-10' },
  { id: 'CMD-2024-002', lotId: 'LOT-2024-002', type: 'PAPIER/CARTON', quantity: 3000, totalPrice: 540, status: 'EN_ATTENTE', date: '2024-01-12' },
  { id: 'CMD-2024-003', lotId: 'LOT-2024-003', type: 'VERRE', quantity: 8000, totalPrice: 640, status: 'EXPEDIEE', date: '2024-01-14' },
];

const stats = [
  { label: 'Lots disponibles', value: '12', unit: 'en stock', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100' },
  { label: 'Commandes en cours', value: '5', unit: 'actives', icon: ShoppingCart, color: 'text-green-600', bg: 'bg-green-100' },
  { label: 'Dépenses du mois', value: '12 450', unit: '€', icon: DollarSign, color: 'text-orange-600', bg: 'bg-orange-100' },
  { label: 'Tonnes achetées', value: '45', unit: 't', icon: TrendingUp, color: 'text-emerald-600', bg: 'bg-emerald-100' },
];

const statusConfig = {
  DISPONIBLE: { label: 'Disponible', color: 'bg-green-100 text-green-700' },
  RESERVE: { label: 'Réservé', color: 'bg-yellow-100 text-yellow-700' },
  EN_NEGOCIATION: { label: 'En négociation', color: 'bg-blue-100 text-blue-700' },
  VENDU: { label: 'Vendu', color: 'bg-gray-100 text-gray-700' },
  EXPIRE: { label: 'Expiré', color: 'bg-red-100 text-red-700' },
  EN_ATTENTE: { label: 'En attente', color: 'bg-yellow-100 text-yellow-700' },
  CONFIRMEE: { label: 'Confirmée', color: 'bg-blue-100 text-blue-700' },
  EXPEDIEE: { label: 'Expédiée', color: 'bg-purple-100 text-purple-700' },
  LIVREE: { label: 'Livrée', color: 'bg-green-100 text-green-700' },
  RECUE: { label: 'Reçue', color: 'bg-emerald-100 text-emerald-700' },
  VALIDEE: { label: 'Validée', color: 'bg-green-100 text-green-700' },
  ANNULEE: { label: 'Annulée', color: 'bg-red-100 text-red-700' },
};

export default function IndustrielDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'catalogue' | 'achats' | 'commandes' | 'traceabilite'>('dashboard');

  return (
    <RoleLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Espace Industriel</h1>
            <p className="text-muted-foreground mt-1">Achetez des matières recyclées de qualité, traçables et certifiées</p>
          </div>
          <Button asChild>
            <Link href="/industriel/catalogue/nouveau">
              <Plus className="mr-2 h-4 w-4" />
              Créer une demande d'achat
            </Link>
          </Button>
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
                <p className="text-xs text-muted-foreground">{stat.unit}</p>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 border-b">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
            { id: 'catalogue', label: 'Catalogue déchets', icon: Package },
            { id: 'achats', label: 'Mes achats', icon: ShoppingCart },
            { id: 'commandes', label: 'Commandes', icon: TrendingDown },
            { id: 'traceabilite', label: 'Traçabilité', icon: BarChart3 },
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
                  <Package className="h-5 w-5" />
                  Lots disponibles par type
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { type: 'PLASTIQUE', count: 45, totalWeight: '125 t', avgPrice: '0.42 €/kg', color: 'bg-blue-100 text-blue-700' },
                  { type: 'PAPIER/CARTON', count: 32, totalWeight: '280 t', avgPrice: '0.18 €/kg', color: 'bg-amber-100 text-amber-700' },
                  { type: 'VERRE', count: 18, totalWeight: '450 t', avgPrice: '0.08 €/kg', color: 'bg-green-100 text-green-700' },
                  { type: 'MÉTAL', count: 12, totalWeight: '35 t', avgPrice: '1.15 €/kg', color: 'bg-gray-100 text-gray-700' },
                  { type: 'DÉCHETS ÉLECTRONIQUES', count: 5, totalWeight: '8 t', avgPrice: '2.80 €/kg', color: 'bg-purple-100 text-purple-700' },
                ].map((w, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Badge variant="secondary" className={w.color}>{w.type}</Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{w.count} lots</span>
                      <span>{w.totalWeight}</span>
                      <span className="font-medium text-foreground">{w.avgPrice}</span>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Budget & Dépenses
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-center p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="text-3xl font-bold text-green-700">€12 450</div>
                  <div className="text-sm text-green-600">Dépensé ce mois</div>
                </div>
                <Progress value={62} className="h-3" />
                <p className="text-sm text-muted-foreground text-center">Budget mensuel: €20 000 (62% utilisé)</p>
                
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Ce mois</span>
                    <span className="font-medium">€12 450</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Mois dernier</span>
                    <span className="font-medium">€15 200</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Moyenne 6 mois</span>
                    <span className="font-medium">€13 800</span>
                  </div>
                </div>
              </CardContent            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/industriel/catalogue">
                    <Search className="h-4 w-4" />
                    Parcourir le catalogue
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/industriel/achats">
                    <ShoppingCart className="h-4 w-4" />
                    Voir mes achats
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/industriel/commandes">
                    <Package className="h-4 w-4" />
                    Suivre commandes
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/industriel/traceabilite">
                    <BarChart3 className="h-4 w-4" />
                    Rapports traçabilité
                  </Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Dernières commandes
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Commande</th>
                        <th className="pb-3 font-medium">Lot</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Quantité</th>
                        <th className="pb-3 font-medium">Montant</th>
                        <th className="pb-3 font-medium">Statut</th>
                        <th className="pb-3 font-medium">Date</th>
                        <th className="pb-3 font-medium text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {myOrders.map((order) => {
                        const status = statusConfig[order.status as keyof typeof statusConfig];
                        return (
                          <tr key={order.id} className="hover:bg-muted/50">
                            <td className="py-4 font-mono text-sm">{order.id}</td>
                            <td className="py-4 font-mono text-sm">{order.lotId}</td>
                            <td className="py-4"><Badge variant="secondary">{order.type}</Badge></td>
                            <td className="py-4">{order.quantity.toLocaleString()} kg</td>
                            <td className="py-4 font-medium">{formatCurrency(order.totalPrice)}</td>
                            <td className="py-4"><Badge variant="outline" className={status.color}>{status.label}</Badge></td>
                            <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(order.date)}</td>
                            <td className="py-4 text-right">
                              <Button variant="ghost" size="sm" asChild>
                                <Link href={`/industriel/commandes/${order.id}`}>Détails</Link>
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
          </div>
        )}

        {activeTab === 'catalogue' && (
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Catalogue des déchets disponibles</CardTitle>
              <div className="flex gap-2">
                <input type="text" placeholder="Filtrer..." className="w-64" />
                <Button variant="outline"><Filter className="mr-2 h-4 w-4" /> Filtres</Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {availableLots.map((lot) => {
                  const status = statusConfig[lot.status as keyof typeof statusConfig];
                  return (
                    <Card key={lot.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader>
                        <div className="flex items-start justify-between">
                          <Badge variant="secondary">{lot.type}</Badge>
                          <Badge variant="outline" className={status.color}>{status.label}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <div className="text-2xl font-bold text-green-600">{formatCurrency(lot.price)}/kg</div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {lot.location}</p>
                          <p className="flex items-center gap-1"><TrendingDown className="h-3 w-3" /> {lot.distance} km</p>
                          <p className="flex items-center gap-1"><Package className="h-3 w-3" /> {lot.weight.toLocaleString()} kg disponibles</p>
                          <p className="flex items-center gap-1"><Award className="h-3 w-3" /> Qualité: {lot.quality}</p>
                        </div>
                        <div className="flex gap-2 pt-2 border-t">
                          <Button variant="outline" className="flex-1" asChild>
                            <Link href={`/industriel/catalogue/${lot.id}`}>Détails</Link>
                          </Button>
                          {lot.status === 'DISPONIBLE' && (
                            <Button className="flex-1" asChild>
                              <Link href={`/industriel/achats/nouveau?lot=${lot.id}`}>
                                <ShoppingCart className="mr-1 h-3 w-3" />
                                Acheter
                              </Link>
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'achats' && (
          <Card>
            <CardHeader>
              <CardTitle>Historique des achats</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b text-left text-sm text-muted-foreground">
                      <th className="pb-3 font-medium">Achat</th>
                      <th className="pb-3 font-medium">Lot</th>
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Quantité</th>
                      <th className="pb-3 font-medium">Prix/kg</th>
                      <th className="pb-3 font-medium">Total</th>
                      <th className="pb-3 font-medium">Statut</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y">
                    {myOrders.map((order) => {
                      const status = statusConfig[order.status as keyof typeof statusConfig];
                      return (
                        <tr key={order.id} className="hover:bg-muted/50">
                          <td className="py-4 font-mono text-sm">{order.id}</td>
                          <td className="py-4 font-mono text-sm">{order.lotId}</td>
                          <td className="py-4"><Badge variant="secondary">{order.type}</Badge></td>
                          <td className="py-4">{order.quantity.toLocaleString()} kg</td>
                          <td className="py-4">{formatCurrency(order.totalPrice / order.quantity)}/kg</td>
                          <td className="py-4 font-medium">{formatCurrency(order.totalPrice)}</td>
                          <td className="py-4"><Badge variant="outline" className={status.color}>{status.label}</Badge></td>
                          <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(order.date)}</td>
                          <td className="py-4 text-right">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/industriel/achats/${order.id}`}>Voir</Link>
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

        {activeTab === 'commandes' && (
          <Card>
            <CardHeader>
              <CardTitle>Suivi des commandes</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground">Suivez la livraison de vos commandes en temps réel</p>
              <div className="mt-4 space-y-4">
                {myOrders.map((order) => (
                  <div key={order.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="secondary">{order.type}</Badge>
                        <span className="font-medium">{order.id}</span>
                      </div>
                      <Badge variant="outline" className={statusConfig[order.status as keyof typeof statusConfig].color}>
                        {statusConfig[order.status as keyof typeof statusConfig].label}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-6 text-sm text-muted-foreground">
                      <span>{order.quantity.toLocaleString()} kg</span>
                      <span>{formatCurrency(order.totalPrice)}</span>
                      <span>Commandé le {formatRelativeTime(order.date)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'traceabilite' && (
          <Card>
            <CardHeader>
              <CardTitle>Rapports de traçabilité</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {[
                  { title: 'Certificat d\'origine', desc: 'Traçabilité complète du déchet collecté', icon: Award },
                  { title: 'Bilan carbone', desc: 'CO₂ évité par matière recyclée', icon: Leaf },
                  { title: 'Rapport qualité', desc: 'Analyses de pureté et conformité', icon: Factory },
                  { title: 'Fiche matière', desc: 'Spécifications techniques détaillées', icon: Package },
                  { title: 'Audit fournisseur', desc: 'Vérification des collecteurs et trieurs', icon: Users },
                  { title: 'Export réglementaire', desc: 'Documents pour déclaration administrative', icon: BarChart3 },
                ].map((r, i) => (
                  <Card key={i} className="p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <r.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-medium">{r.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{r.desc}</p>
                    <Button variant="outline" size="sm" className="w-full">Générer</Button>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleLayout>
  );
}