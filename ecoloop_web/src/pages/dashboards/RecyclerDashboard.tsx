import { useEffect, useState } from 'react';
import { Factory, Search, Filter, ShieldCheck, Download, FileText, BarChart3, TrendingUp } from 'lucide-react';
import { wasteService } from '@/services/api/wasteService';
import type { WasteLot } from '@/types';
import { EmptyState, ErrorState } from '@/components/feedback/States';
import './Dashboards.css';

export function RecyclerDashboard() {
  const [activeTab, setActiveTab] = useState<'marketplace' | 'contrats' | 'esg' | 'historique'>('marketplace');
  const [availableLots, setAvailableLots] = useState<WasteLot[]>([]);
  const [historyLots, setHistoryLots] = useState<WasteLot[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('Tous');
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [lots, history] = await Promise.all([
          wasteService.getAvailableWastes(),
          wasteService.getHistory(),
        ]);
        setAvailableLots(lots);
        setHistoryLots(history);
      } catch (err: any) {
        setError("Impossible de charger les données.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAll();
  }, []);

  const categories = ['Tous', ...Array.from(new Set(availableLots.map(l => l.category)))];

  const filteredLots = availableLots.filter(lot => {
    const matchesCategory = activeCategory === 'Tous' || lot.category === activeCategory;
    const matchesSearch = searchQuery === '' ||
      lot.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lot.description && lot.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const totalWeight = availableLots.reduce((sum, l) => sum + l.weight_kg, 0);
  const totalValue = availableLots.reduce((sum, l) => sum + l.weight_kg * l.price_per_kg, 0);
  const historyWeight = historyLots.reduce((sum, l) => sum + l.weight_kg, 0);

  if (isLoading) return <div className="page-container text-center mt-8">Chargement...</div>;

  if (error) {
    return (
      <div className="page-container theme-recycler">
        <ErrorState title="Erreur réseau" message={error} />
      </div>
    );
  }

  return (
    <div className="page-container theme-recycler">
      <div className="page-header-actions mb-8">
        <div>
          <h1 className="page-title text-3xl font-bold flex items-center gap-3">
            <Factory className="text-accent" size={32} />
            Espace Industriel
          </h1>
          <p className="page-subtitle text-secondary text-lg mt-2">Approvisionnez-vous en matière première secondaire certifiée</p>
        </div>
        <div className="flex items-center gap-4 bg-white p-2 rounded-lg border shadow-sm">
          <div className="px-4 border-r">
            <span className="text-xs text-secondary block">Lots disponibles</span>
            <span className="font-bold">{availableLots.length}</span>
          </div>
          <div className="px-4 border-r">
            <span className="text-xs text-secondary block">Poids total</span>
            <span className="font-bold">{totalWeight} kg</span>
          </div>
          <div className="px-4">
            <span className="text-xs text-secondary block">Valeur estimée</span>
            <span className="font-bold">{totalValue.toLocaleString()} CFA</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-4 border-b mb-8 overflow-x-auto pb-2">
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'marketplace' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-accent'}`}
          onClick={() => setActiveTab('marketplace')}
        >
          Marketplace B2B
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'contrats' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-accent'}`}
          onClick={() => setActiveTab('contrats')}
        >
          Demandes & Contrats
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'esg' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-accent'}`}
          onClick={() => setActiveTab('esg')}
        >
          Rapports ESG
        </button>
        <button
          className={`px-4 py-2 font-bold whitespace-nowrap transition-colors border-b-2 ${activeTab === 'historique' ? 'border-accent text-accent' : 'border-transparent text-secondary hover:text-accent'}`}
          onClick={() => setActiveTab('historique')}
        >
          Historique d'Achats
        </button>
      </div>

      {/* TAB: Marketplace */}
      {activeTab === 'marketplace' && (
        <div className="fade-in-up">
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Rechercher par matière..."
                className="input w-full pl-10 bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <button className="btn btn-secondary flex items-center gap-2">
              <Filter size={18} /> Filtres
            </button>
          </div>

          <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
            {categories.map(cat => (
              <span
                key={cat}
                className={`px-4 py-1.5 rounded-full border text-sm cursor-pointer whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'border-accent bg-purple-50 text-accent font-bold'
                    : 'bg-white text-secondary hover:border-accent'
                }`}
                onClick={() => setActiveCategory(cat)}
              >
                {cat}
              </span>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredLots.length > 0 ? (
              filteredLots.map(lot => (
                <div key={lot.id} className="card rounded-xl overflow-hidden border hover:border-accent transition group cursor-pointer shadow-sm hover:shadow-md bg-white flex flex-col">
                  <div className="h-40 bg-gray-100 relative">
                    {lot.photo_url ? (
                      <img src={lot.photo_url} alt={lot.category} className="w-full h-full object-cover" />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-gray-300">
                        <Factory size={48} />
                      </div>
                    )}
                    <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 rounded text-xs font-bold border flex items-center gap-1">
                      <ShieldCheck size={14} className="text-primary" /> {lot.status}
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{lot.category}</h3>
                      <span className="font-bold text-accent">{lot.weight_kg} kg</span>
                    </div>
                    {lot.description && (
                      <p className="text-sm text-secondary mb-4 flex-1">{lot.description}</p>
                    )}
                    {!lot.description && <div className="flex-1" />}

                    <div className="pt-4 border-t flex justify-between items-center mt-auto">
                      <div>
                        <span className="text-xs text-secondary block">Prix estimé</span>
                        <span className="font-bold">{(lot.weight_kg * lot.price_per_kg).toLocaleString()} CFA</span>
                      </div>
                      <button className="btn bg-accent text-white hover:bg-purple-700 py-2">
                        Acheter
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="col-span-full">
                <EmptyState title="Aucun lot disponible" message="Il n'y a pas de matière disponible correspondant à vos critères pour le moment." />
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB: Rapports ESG */}
      {activeTab === 'esg' && (
        <div className="fade-in-up">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            <div className="card p-6 border-l-4 border-accent rounded-xl shadow-sm col-span-1 lg:col-span-2">
              <h3 className="text-secondary font-medium mb-4 flex items-center gap-2">
                <BarChart3 size={20} className="text-accent" /> Impact Global
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-3xl font-bold text-gray-900">{historyWeight.toLocaleString()} kg</span>
                  <p className="text-sm text-secondary mt-1">Matière sourcée</p>
                </div>
                <div>
                  <span className="text-3xl font-bold text-gray-900">{historyLots.length}</span>
                  <p className="text-sm text-secondary mt-1">Achats réalisés</p>
                </div>
              </div>
            </div>
            <div className="card p-6 bg-accent-light rounded-xl shadow-sm border border-accent/20">
              <h3 className="font-bold mb-2 flex items-center gap-2">
                <TrendingUp size={20} className="text-accent" /> Certification
              </h3>
              <p className="text-sm text-secondary mb-4">Vos achats sur EcoLoop sont certifiés traçables et contribuent à l'économie locale.</p>
              {historyLots.length > 0 ? (
                <>
                  <div className="w-full bg-white rounded-full h-2 mb-2">
                    <div className="bg-accent h-2 rounded-full" style={{ width: `${Math.min(100, (historyWeight / 1000) * 100)}%` }}></div>
                  </div>
                  <span className="text-xs font-bold text-accent">{historyWeight.toLocaleString()} kg achetés</span>
                </>
              ) : (
                <span className="text-xs text-secondary">Aucun achat enregistré</span>
              )}
            </div>
          </div>

          <h2 className="text-xl font-bold mb-4">Générer un rapport de traçabilité</h2>
          <div className="card p-6 rounded-xl shadow-sm border">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <select className="input flex-1 bg-white">
                <option>Toutes les périodes</option>
              </select>
              <select className="input flex-1 bg-white">
                <option>Tous les matériaux</option>
                {categories.filter(c => c !== 'Tous').map(cat => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
              <div className="flex gap-2 w-full md:w-auto">
                <button className="btn btn-primary flex-1 md:flex-none flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white border-none">
                  <FileText size={18} /> Exporter PDF
                </button>
                <button className="btn btn-secondary flex-1 md:flex-none flex items-center justify-center gap-2">
                  <Download size={18} /> CSV
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Contrats */}
      {activeTab === 'contrats' && (
        <div className="fade-in-up">
          <EmptyState
            title="Aucune demande en cours"
            message="Vous n'avez pas encore effectué d'opérations sur la plateforme."
          />
        </div>
      )}

      {/* TAB: Historique */}
      {activeTab === 'historique' && (
        <div className="fade-in-up">
          {historyLots.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {historyLots.map(lot => (
                <div key={lot.id} className="card rounded-xl overflow-hidden border shadow-sm bg-white flex flex-col">
                  <div className="p-5 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                      <h3 className="font-bold text-lg">{lot.category}</h3>
                      <span className="font-bold text-accent">{lot.weight_kg} kg</span>
                    </div>
                    {lot.description && (
                      <p className="text-sm text-secondary mb-4 flex-1">{lot.description}</p>
                    )}
                    <div className="pt-4 border-t flex justify-between items-center mt-auto">
                      <div>
                        <span className="text-xs text-secondary block">Prix</span>
                        <span className="font-bold">{(lot.weight_kg * lot.price_per_kg).toLocaleString()} CFA</span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-bold ${
                        lot.status === 'RECYCLED' ? 'bg-green-100 text-green-700' :
                        lot.status === 'COLLECTED' ? 'bg-blue-100 text-blue-700' :
                        lot.status === 'ACCEPTED' ? 'bg-yellow-100 text-yellow-700' :
                        'bg-gray-100 text-gray-700'
                      }`}>
                        {lot.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <EmptyState
              title="Historique vide"
              message="Vous n'avez pas encore effectué d'achats sur la plateforme."
            />
          )}
        </div>
      )}
    </div>
  );
}
