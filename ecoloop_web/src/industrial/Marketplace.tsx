import { useEffect, useMemo, useState } from 'react';
import AppLayout from '../components/AppLayout';
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
  const [lots, setLots] = useState<Lot[]>([]);
  const [user, setUser] = useState<IndustrialUser | null>(null);
  const [loading, setLoading] = useState(true);

  const [material, setMaterial] = useState('all');
  const [city, setCity] = useState('all');
  const [minWeightInput, setMinWeightInput] = useState('');
  const [minWeight, setMinWeight] = useState('');
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  // Debounce pour le filtre de poids minimum
  useEffect(() => {
    const handler = setTimeout(() => {
      setMinWeight(minWeightInput);
    }, 300);

    return () => {
      clearTimeout(handler);
    };
  }, [minWeightInput]);

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

  const isFiltered = material !== 'all' || city !== 'all' || minWeightInput !== '';
  
  const handleReset = () => {
    setMaterial('all');
    setCity('all');
    setMinWeightInput('');
  };

  if (loading || !user) {
    return <div className="el-content">Chargement du marketplace...</div>;
  }

  return (
    <AppLayout role="industrial" activeKey="marketplace" title="Marketplace">
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
          <label htmlFor="minWeightInput">Poids minimum (kg)</label>
          <input
            id="minWeightInput"
            type="number"
            placeholder="Ex. 500"
            value={minWeightInput}
            onChange={(e) => setMinWeightInput(e.target.value)}
          />
        </div>

        <button 
          type="button" 
          className="el-filter-apply"
          onClick={isFiltered ? handleReset : undefined}
          style={{ background: isFiltered ? 'var(--el-rust)' : undefined }}
        >
          {isFiltered ? 'Réinitialiser' : 'Filtrer'}
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

              <div className="el-lot-location">
                <span role="img" aria-label="localisation">📍</span> {lot.location}
              </div>
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
    </AppLayout>
  );
}
