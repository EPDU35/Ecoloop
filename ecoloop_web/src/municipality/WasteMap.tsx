import { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { useNavigate } from 'react-router-dom';

interface MapPoint {
  id: string;
  name: string;
  type: 'wild_dump' | 'high_production';
  weight: string;
  description: string;
  status?: string;
  x: number; // Coordonnées SVG
  y: number;
}

const MAP_POINTS: MapPoint[] = [
  { id: '1', name: 'Yopougon - Selmer', type: 'wild_dump', weight: '180 kg', description: 'Bouteilles plastiques près du canal', status: 'Signalé', x: 120, y: 150 },
  { id: '2', name: 'Koumassi - Marché', type: 'high_production', weight: '1.2 t', description: 'Zone de forte production carton', x: 380, y: 280 },
  { id: '3', name: 'Bassam - Zone Touristique', type: 'wild_dump', weight: '320 kg', description: 'Débris de plastique sur la plage', status: 'En cours', x: 480, y: 320 },
  { id: '4', name: 'Marcory - Résidentiel', type: 'high_production', weight: '850 kg', description: 'Déchets de verre et cartons', x: 340, y: 220 },
  { id: '5', name: 'Cocody - Angré', type: 'wild_dump', weight: '95 kg', description: 'Dépôt sauvage d\'appareils et métaux', status: 'Résolu', x: 260, y: 100 },
];

export default function WasteMap() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [filterType, setFilterType] = useState<'all' | 'wild_dump' | 'high_production'>('all');
  const [selectedPoint, setSelectedPoint] = useState<MapPoint | null>(MAP_POINTS[0]);

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  const filteredPoints = MAP_POINTS.filter((p) => {
    if (filterType === 'all') return true;
    return p.type === filterType;
  });

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="carte"
        onSelect={handleSelect}
        user={{ name: "Koffi N'Guessan", role: "Mairie d'Abidjan (RSE)" }}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Carte des déchets & zones critiques"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          <div className="el-filter-bar">
            <div className="el-filter-field">
              <label htmlFor="mapFilter">Filtrer la carte</label>
              <select
                id="mapFilter"
                value={filterType}
                onChange={(e) => setFilterType(e.target.value as any)}
              >
                <option value="all">Tous les points</option>
                <option value="wild_dump">⚠️ Dépôts sauvages</option>
                <option value="high_production">📈 Forte production</option>
              </select>
            </div>
          </div>

          <div className="el-grid-2" style={{ gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginTop: '1rem' }}>
            {/* Visualisation de la carte SVG */}
            <div className="el-card" style={{ padding: 0, position: 'relative', overflow: 'hidden', minHeight: 400, background: 'var(--el-paper-2)' }}>
              <div style={{ position: 'absolute', top: 12, left: 12, zIndex: 1, pointerEvents: 'none' }}>
                <strong style={{ display: 'block', fontSize: '0.85rem' }}>Zone : District d'Abidjan</strong>
                <span style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)' }}>Fond de carte vectoriel interactif</span>
              </div>

              <svg width="100%" height="100%" viewBox="0 0 600 450" style={{ display: 'block', width: '100%', height: '100%' }}>
                {/* Dessin des lagunes et des contours d'Abidjan en SVG stylisé */}
                <path d="M 50 150 Q 150 120 250 180 T 450 200 T 550 140" fill="none" stroke="#68b4f4" strokeWidth="24" strokeLinecap="round" opacity="0.4" />
                <path d="M 120 180 Q 200 240 300 240 T 480 280" fill="none" stroke="#68b4f4" strokeWidth="16" strokeLinecap="round" opacity="0.3" />
                
                {/* Communes / Secteurs dessinés */}
                <text x="70" y="80" fill="var(--el-ink-soft)" fontSize="11" fontFamily="monospace">Yopougon</text>
                <text x="240" y="60" fill="var(--el-ink-soft)" fontSize="11" fontFamily="monospace">Cocody</text>
                <text x="320" y="160" fill="var(--el-ink-soft)" fontSize="11" fontFamily="monospace">Marcory</text>
                <text x="380" y="240" fill="var(--el-ink-soft)" fontSize="11" fontFamily="monospace">Koumassi</text>
                <text x="490" y="290" fill="var(--el-ink-soft)" fontSize="11" fontFamily="monospace">Grand-Bassam</text>

                {/* Connexions / Itinéraires principaux */}
                <line x1="120" y1="150" x2="340" y2="220" stroke="var(--el-ink-soft)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                <line x1="340" y1="220" x2="380" y2="280" stroke="var(--el-ink-soft)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />
                <line x1="380" y1="280" x2="480" y2="320" stroke="var(--el-ink-soft)" strokeWidth="1" strokeDasharray="4 4" opacity="0.4" />

                {/* Points */}
                {filteredPoints.map((p) => {
                  const isSelected = selectedPoint?.id === p.id;
                  const color = p.type === 'wild_dump' ? '#b4522f' : '#3fa34d';
                  return (
                    <g key={p.id} style={{ cursor: 'pointer' }} onClick={() => setSelectedPoint(p)}>
                      {isSelected && (
                        <circle cx={p.x} cy={p.y} r="16" fill={color} opacity="0.25" style={{ transition: 'r 0.2s ease' }} />
                      )}
                      <circle cx={p.x} cy={p.y} r="8" fill={color} stroke="var(--el-paper)" strokeWidth="2" />
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Détails du point sélectionné */}
            <div className="el-card" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
              {selectedPoint ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <span
                      className="el-material-badge"
                      style={{
                        background: selectedPoint.type === 'wild_dump' ? 'var(--el-amber)' : 'var(--el-emerald)',
                        color: selectedPoint.type === 'wild_dump' ? '#4a3200' : '#05300e'
                      }}
                    >
                      {selectedPoint.type === 'wild_dump' ? '⚠️ Dépôt Sauvage' : '📈 Forte Production'}
                    </span>
                    {selectedPoint.status && (
                      <span className={`el-pill ${selectedPoint.status === 'Signalé' ? 'late' : selectedPoint.status === 'En cours' ? 'in_transit' : 'success'}`}>
                        {selectedPoint.status}
                      </span>
                    )}
                  </div>

                  <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>{selectedPoint.name}</h3>
                  <div className="el-kpi-value" style={{ fontSize: '1.75rem', margin: '0.5rem 0' }}>{selectedPoint.weight}</div>
                  <p style={{ color: 'var(--el-ink-soft)', fontSize: '0.9rem', lineHeight: 1.5, margin: '1rem 0' }}>
                    {selectedPoint.description}
                  </p>
                  
                  {selectedPoint.type === 'wild_dump' && selectedPoint.status === 'Signalé' && (
                    <button
                      type="button"
                      className="el-btn el-btn-amber"
                      style={{ width: '100%', marginTop: '1rem' }}
                      onClick={() => {
                        setSelectedPoint(prev => prev ? { ...prev, status: 'En cours' } : null);
                      }}
                    >
                      Déployer un collecteur
                    </button>
                  )}
                </div>
              ) : (
                <div style={{ textAlign: 'center', color: 'var(--el-ink-soft)', padding: '2rem 0' }}>
                  Sélectionnez un point sur la carte pour voir les détails
                </div>
              )}

              <div style={{ borderTop: '1px solid var(--el-border)', paddingTop: '1rem', marginTop: '1rem', fontSize: '0.8rem', color: 'var(--el-ink-soft)' }}>
                💡 <em>Les dépôts sauvages sont signalés en temps réel par les riverains ou les mairies partenaires.</em>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
