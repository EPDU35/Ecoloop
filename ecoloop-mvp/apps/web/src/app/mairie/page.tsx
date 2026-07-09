'use client';

import { useState } from 'react';
import Link from 'next/link';
import { RoleLayout } from '@/components/RoleLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Trash2, Package, MapPin, Clock, Award, TrendingUp, Users, Leaf, CheckCircle, AlertCircle, XCircle, ChevronRight, Plus, Search, Filter, Download, Map, AlertTriangle, BarChart3, Building2, Shield, Bell, TrendingDown, Thermometer } from 'lucide-react';
import { formatCurrency, formatRelativeTime } from '@/lib/utils';

const zones = [
  { id: 'ZONE-01', name: 'Centre-ville', type: 'PRODUCTION', volume: 2450, collectors: 3, risk: 4, lastCleaned: '2024-01-14' },
  { id: 'ZONE-02', name: 'Zone Industrielle Nord', type: 'COLLECTE', volume: 1200, collectors: 2, risk: 2, lastCleaned: '2024-01-15' },
  { id: 'ZONE-03', name: 'Quartier Résidentiel Est', type: 'SATURATION', volume: 3800, collectors: 1, risk: 5, lastCleaned: '2024-01-12' },
  { id: 'ZONE-04', name: 'Parc Commercial Ouest', type: 'POINT_COLLECTE', volume: 800, collectors: 4, risk: 1, lastCleaned: '2024-01-15' },
];

const alerts = [
  { id: 1, type: 'SATURATION', severity: 5, title: 'Zone 03 - Risque de saturation', message: 'Volume de déchets critique détecté. Intervention requise sous 24h.', zone: 'Quartier Résidentiel Est', date: '2024-01-15T08:00:00' },
  { id: 2, type: 'RETARD_COLLECTE', severity: 3, title: 'Retard collecte Zone 01', message: '3 collectes en retard de plus de 2h. Collecteur non joignable.', zone: 'Centre-ville', date: '2024-01-15T10:30:00' },
  { id: 3, type: 'DECHET_SAUVAGE', severity: 4, title: 'Dépôt sauvage signalé', message: 'Citoyen a signalé un dépôt sauvage rue de la Paix. Volume estimé 200kg.', zone: 'Centre-ville', date: '2024-01-15T09:15:00' },
  { id: 4, type: 'PREVENTION', severity: 2, title: 'Prévision météo', message: 'Fortes pluies prévues demain. Risque de débordement bacs extérieurs.', zone: 'Toutes zones', date: '2024-01-15T07:00:00' },
];

const stats = [
  { label: 'Niveau propreté global', value: '78%', unit: '/100', icon: Shield, color: 'text-green-600', bg: 'bg-green-100', trend: '+3%' },
  { label: 'Collectes aujourd\'hui', value: '42', unit: 'réalisées', icon: Package, color: 'text-blue-600', bg: 'bg-blue-100', trend: '+5' },
  { label: 'Zones critiques', value: '3', unit: 'surveillées', icon: AlertTriangle, color: 'text-red-600', bg: 'bg-red-100', trend: '-1' },
  { label: 'Alertes actives', value: '4', unit: 'non lues', icon: Bell, color: 'text-orange-600', bg: 'bg-orange-100', trend: '+2' },
];

const zoneTypeColors = {
  PRODUCTION: 'bg-blue-100 text-blue-700',
  COLLECTE: 'bg-green-100 text-green-700',
  SATURATION: 'bg-red-100 text-red-700',
  POINT_COLLECTE: 'bg-purple-100 text-purple-700',
};

const severityColors = {
  1: 'bg-gray-100 text-gray-700',
  2: 'bg-blue-100 text-blue-700',
  3: 'bg-yellow-100 text-yellow-700',
  4: 'bg-orange-100 text-orange-700',
  5: 'bg-red-100 text-red-700',
};

export default function MairieDashboard() {
  const [activeTab, setActiveTab] = useState<'dashboard' | 'carte' | 'operations' | 'prevention' | 'rapports'>('dashboard');

  return (
    <RoleLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Espace Mairie</h1>
            <p className="text-muted-foreground mt-1">Surveillez et améliorez la gestion des déchets de votre territoire</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link href="/mairie/parametres">
                <Shield className="mr-2 h-4 w-4" />
                Paramètres
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
                <p className="text-xs text-muted-foreground">{stat.unit}</p>
                <span className="text-xs font-medium text-green-600">{stat.trend}</span>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="flex gap-2 border-b">
          {[
            { id: 'dashboard', label: 'Tableau de bord', icon: TrendingUp },
            { id: 'carte', label: 'Carte intelligente', icon: Map },
            { id: 'operations', label: 'Gestion opérationnelle', icon: Building2 },
            { id: 'prevention', label: 'Système préventif', icon: Thermometer },
            { id: 'rapports', label: 'Rapports', icon: BarChart3 },
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
                  <Map className="h-5 w-5" />
                  Zones de surveillance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b text-left text-sm text-muted-foreground">
                        <th className="pb-3 font-medium">Zone</th>
                        <th className="pb-3 font-medium">Type</th>
                        <th className="pb-3 font-medium">Volume (kg)</th>
                        <th className="pb-3 font-medium">Collecteurs</th>
                        <th className="pb-3 font-medium">Niveau risque</th>
                        <th className="pb-3 font-medium">Dernier nettoyage</th>
                        <th className="pb-3 font-medium">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {zones.map((zone) => (
                        <tr key={zone.id} className="hover:bg-muted/50">
                          <td className="py-4 font-medium">{zone.name}</td>
                          <td className="py-4"><Badge variant="secondary" className={zoneTypeColors[zone.type as keyof typeof zoneTypeColors]}>{zone.type}</Badge></td>
                          <td className="py-4">{zone.volume.toLocaleString()} kg</td>
                          <td className="py-4">{zone.collectors}</td>
                          <td className="py-4">
                            <div className="flex items-center gap-2">
                              <Progress value={zone.risk * 20} className="h-2 w-24" />
                              <span className="text-sm font-medium">{zone.risk}/5</span>
                            </div>
                          </td>
                          <td className="py-4 text-sm text-muted-foreground">{formatRelativeTime(zone.lastCleaned)}</td>
                          <td className="py-4">
                            <Button variant="ghost" size="sm" asChild>
                              <Link href={`/mairie/zones/${zone.id}`}>Détails</Link>
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Bell className="h-5 w-5" />
                  Alertes récentes
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {alerts.slice(0, 3).map((alert) => (
                  <div key={alert.id} className="p-3 border rounded-lg">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Badge variant="secondary" className={severityColors[alert.severity as keyof typeof severityColors]}>{alert.type}</Badge>
                          <span className="font-medium">{alert.title}</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{alert.message}</p>
                        <p className="text-xs text-muted-foreground mt-1">{formatRelativeTime(alert.date)} • {alert.zone}</p>
                      </div>
                      <Button variant="ghost" size="sm">Voir</Button>
                    </div>
                  </div>
                ))}
                <Button variant="outline" asChild className="w-full">
                  <Link href="/mairie/alertes">Voir toutes les alertes</Link>
                </Button>
              </CardContent>
            </Card>

            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingDown className="h-5 w-5" />
                  Performance des collectes - 7 derniers jours
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64 flex items-end justify-around gap-2">
                  {['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'].map((day, i) => {
                    const height = [65, 72, 58, 80, 75, 45, 30][i];
                    return (
                      <div key={day} className="flex flex-col items-center flex-1">
                        <div className="w-full bg-primary rounded-t transition-all hover:bg-primary/80" style={{ height: `${height}%` }} />
                        <span className="text-xs text-muted-foreground mt-2">{day}</span>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-4 grid grid-cols-4 gap-4 text-center">
                  <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-green-700">342</div>
                    <div className="text-xs text-green-600">Collectes réalisées</div>
                  </div>
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-blue-700">98.5%</div>
                    <div className="text-xs text-blue-600">Taux de réussite</div>
                  </div>
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-amber-700">12 min</div>
                    <div className="text-xs text-amber-600">Délai moyen</div>
                  </div>
                  <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                    <div className="text-2xl font-bold text-purple-700">15</div>
                    <div className="text-xs text-purple-600">Incidents résolus</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Actions rapides</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/mairie/carte">
                    <Map className="h-4 w-4" />
                    Ouvrir la carte
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/mairie/operations">
                    <Building2 className="h-4 w-4" />
                    Planifier collecte
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/mairie/prevention">
                    <Thermometer className="h-4 w-4" />
                    Vérifier prévisions
                  </Link>
                </Button>
                <Button variant="outline" asChild className="w-full justify-start gap-2">
                  <Link href="/mairie/rapports">
                    <BarChart3 className="h-4 w-4" />
                    Générer rapport
                  </Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {activeTab === 'carte' && (
          <Card>
            <CardHeader>
              <CardTitle>Carte intelligente du territoire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="aspect-video bg-muted/50 rounded-lg border-2 border-dashed flex items-center justify-center">
                <Map className="h-16 w-16 text-muted-foreground" />
                <p className="text-muted-foreground">Carte interactive Leaflet/Mapbox - Intégration à implémenter</p>
              </div>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <Card>
                  <CardHeader>
                    <CardTitle>Filtres</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Zones de production</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" checked /> Points de collecte</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Zones saturées</label>
                    <label className="flex items-center gap-2"><input type="checkbox" className="rounded" /> Collecteurs actifs</label>
                  </CardContent>
                </Card>
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Légende</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2">
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-blue-500" /> Zone de production</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-green-500" /> Point de collecte</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-red-500" /> Zone saturée</div>
                    <div className="flex items-center gap-2"><div className="w-4 h-4 rounded-full bg-purple-500" /> Collecteur actif</div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'operations' && (
          <Card>
            <CardHeader>
              <CardTitle>Gestion opérationnelle</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Suivi des collecteurs</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { name: 'Jean Martin', status: 'EN_COURS', zone: 'Centre-ville', missions: 3 },
                      { name: 'Marie Dubois', status: 'DISPONIBLE', zone: 'Zone Industrielle', missions: 1 },
                      { name: 'Pierre Durand', status: 'HORS_LIGNE', zone: '—', missions: 0 },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                            {c.name.split(' ').map(n => n[0]).join('')}
                          </div>
                          <div>
                            <p className="font-medium">{c.name}</p>
                            <p className="text-sm text-muted-foreground">{c.zone}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <Badge variant={c.status === 'EN_COURS' ? 'success' : c.status === 'DISPONIBLE' ? 'secondary' : 'outline'}>
                            {c.status}
                          </Badge>
                          <p className="text-xs text-muted-foreground mt-1">{c.missions} missions</p>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Planification des campagnes</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      { title: 'Nettoyage printanier', date: '2024-03-15', zones: 5, status: 'PLANIFIEE' },
                      { title: 'Opération zéro déchet', date: '2024-04-22', zones: 8, status: 'EN_COURS' },
                      { title: 'Sensibilisation écoles', date: '2024-05-05', zones: 3, status: 'PLANIFIEE' },
                    ].map((c, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">{c.title}</p>
                          <p className="text-sm text-muted-foreground">{c.zones} zones • {formatRelativeTime(c.date)}</p>
                        </div>
                        <Badge variant={c.status === 'EN_COURS' ? 'success' : 'outline'}>{c.status}</Badge>
                      </div>
                    ))}
                    <Button variant="outline" asChild className="w-full">
                      <Link href="/mairie/operations/nouvelle">
                        <Plus className="mr-2 h-4 w-4" />
                        Nouvelle campagne
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'prevention' && (
          <Card>
            <CardHeader>
              <CardTitle>Système préventif</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-3">
                <Card className="border-l-4 border-red-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5 text-red-600" />
                      Zones à risque
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {zones.filter(z => z.risk >= 4).map((zone) => (
                      <div key={zone.id} className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg">
                        <p className="font-medium">{zone.name}</p>
                        <p className="text-sm text-muted-foreground">Risque: {zone.risk}/5 • Volume: {zone.volume} kg</p>
                        <Button variant="outline" size="sm" className="mt-2 w-full" asChild>
                          <Link href={`/mairie/zones/${zone.id}`}>Intervenir</Link>
                        </Button>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-blue-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Thermometer className="h-5 w-5 text-blue-600" />
                      Prévisions météo
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="font-medium">Demain - Pluies fortes</p>
                      <p className="text-sm text-muted-foreground">Risque de débordement bacs extérieurs. Prévoir collectes anticipées.</p>
                    </div>
                    <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                      <p className="font-medium">Après-demain - Vent fort</p>
                      <p className="text-sm text-muted-foreground">Risque de dispersion déchets légers. Vérifier fermetures bacs.</p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-l-4 border-green-500">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="h-5 w-5 text-green-600" />
                      Analyse historique
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="font-medium">Pic saisonnier détecté</p>
                      <p className="text-sm text-muted-foreground">+35% volume semaine 12 (Pâques). Prévoir renfort collecteurs.</p>
                    </div>
                    <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                      <p className="font-medium">Zone récurrente</p>
                      <p className="text-sm text-muted-foreground">Quartier Est saturé 3 mois/12. Étudier ajout point de collecte.</p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </CardContent>
          </Card>
        )}

        {activeTab === 'rapports' && (
          <Card>
            <CardHeader>
              <CardTitle>Rapports & Statistiques</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                {[
                  { title: 'Mensuel', desc: 'Bilan collectes & propreté', icon: BarChart3 },
                  { title: 'Trimestriel', desc: 'Tendances & comparaisons', icon: TrendingUp },
                  { title: 'Annuel', desc: 'Rapport d\'activité complet', icon: Building2 },
                  { title: 'Environnemental', desc: 'Impact CO₂ & recyclage', icon: Leaf },
                ].map((r, i) => (
                  <Card key={i} className="p-6 hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="p-2 rounded-lg bg-primary/10">
                        <r.icon className="h-5 w-5 text-primary" />
                      </div>
                      <h4 className="font-medium">{r.title}</h4>
                    </div>
                    <p className="text-sm text-muted-foreground">{r.desc}</p>
                  </Card>
                ))}
              </div>
              
              <div className="border-t pt-6">
                <h3 className="font-medium mb-4">Rapports générés récemment</h3>
                <div className="space-y-3">
                  {[
                    { name: 'Rapport mensuel - Janvier 2024', date: '2024-02-01', size: '2.4 MB', status: 'PRÊT' },
                    { name: 'Bilan carbone - Q4 2023', date: '2024-01-15', size: '1.8 MB', status: 'PRÊT' },
                    { name: 'Analyse zones saturées', date: '2024-01-14', size: '890 KB', status: 'GÉNÉRATION' },
                  ].map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <p className="font-medium">{r.name}</p>
                        <p className="text-sm text-muted-foreground">{r.date} • {r.size}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant={r.status === 'PRÊT' ? 'success' : 'outline'}>{r.status}</Badge>
                        <Button variant="ghost" size="sm" asChild>
                          <Link href="#">Télécharger</Link>
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </RoleLayout>
  );
}