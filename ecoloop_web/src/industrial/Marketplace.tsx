import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getLots } from '../services/waste.service';
import { getCurrentUser } from '../services/user.service';
import type { Lot } from '../models/Waste';
import type { IndustrialUser } from '../models/User';

const MATERIAL_COLORS: Record<string, string> = {
  PET: '#3fa34d',
  HDPE: '#6b8f79',
  Carton: '#d9a441',
  Verre: '#b4522f',
};

export default function Marketplace() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [lots, setLots] = useState<Lot[]>([]);
  const [user, setUser] = useState<IndustrialUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [material, setMaterial] = useState('all');
  const [city, setCity] = useState('all');
  const [minWeight, setMinWeight] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadMarketplace() {
      try {
        const [lotsData, userData] = await Promise.all([getLots(), getCurrentUser()]);
        if (cancelled) return;
        setLots(lotsData);
        setUser(userData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadMarketplace();
    return () => {
      cancelled = true;
    };
  }, []);

  const cities = useMemo(() => Array.from(new Set(lots.map((l) => l.location.split(',')[0]))), [lots]);

  const filtered = useMemo(() => {
    return lots.filter((lot) => {
      if (material !== 'all' && lot.material !== material) return false;
      if (city !== 'all' && !lot.location.startsWith(city)) return false;
      if (minWeight && lot.weightKg < Number(minWeight)) return false;
      return true;
    });
  }, [lots, material, city, minWeight]);

  const toggleAdd = (id: string) => {
    setAddedIds((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  if (loading || !user) {
    return <div className="el-content">Chargement du marketplace...</div>;
  }

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="marketplace"
        onSelect={handleSelect}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Marketplace"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          <div className="el-filter-bar">
            <div className="el-filter-field">
              <label htmlFor="material">Matériau</label>
              <select id="material" value={material} onChange={(e) => setMaterial(e.target.value)}>
                <option value="all">Tous</option>
                <option value="PET">PET</option>
                <option value="HDPE">HDPE</option>
                <option value="Carton">Carton</option>
                <option value="Verre">Verre</option>
              </select>
            </div>

            <div className="el-filter-field">
              <label htmlFor="city">Zone</label>
              <select id="city" value={city} onChange={(e) => setCity(e.target.value)}>
                <option value="all">Toutes</option>
                {cities.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="el-filter-field">
              <label htmlFor="minWeight">Poids minimum (kg)</label>
              <input
                id="minWeight"
                type="number"
                placeholder="Ex. 500"
                value={minWeight}
                onChange={(e) => setMinWeight(e.target.value)}
              />
            </div>

            <button type="button" className="el-filter-apply">
              Filtrer
            </button>
          </div>

          <div className="el-results-count">
            <strong>{filtered.length}</strong> lot{filtered.length > 1 ? 's' : ''} disponible
            {filtered.length > 1 ? 's' : ''}
          </div>

          <div className="el-lot-grid">
            {filtered.map((lot) => {
              const isAdded = addedIds.has(lot.id);
              return (
                <div className="el-lot-card" key={lot.id}>
                  <div className="el-lot-header">
                    <span className="el-material-badge" style={{ background: MATERIAL_COLORS[lot.material] }}>
                      {lot.material}
                    </span>
                    <span className="el-lot-distance">{lot.distanceKm} km</span>
                  </div>

                  <div className="el-lot-weight">
                    {lot.weightKg >= 1000 ? `${(lot.weightKg / 1000).toFixed(1)} t` : `${lot.weightKg} kg`}
                  </div>

                  <div className="el-lot-location">📍 {lot.location}</div>
                  <div className="el-mono">{lot.collector}</div>

                  <div className="el-lot-footer">
                    <div className="el-lot-price">
                      {lot.pricePerKg} FCFA<span>par kg</span>
                    </div>
                    <button
                      type="button"
                      className={`el-lot-btn${isAdded ? ' added' : ''}`}
                      onClick={() => toggleAdd(lot.id)}
                    >
                      {isAdded ? 'Ajouté ✓' : 'Ajouter'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
