import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import Navbar from '../components/Navbar';
import { NAV_ITEMS, NAV_PATHS } from './nav';
import { getSuppliers, getCurrentUser } from '../services/user.service';
import type { Supplier, IndustrialUser } from '../models/User';

const StarIcon = ({ filled }: { filled: boolean }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 21 12 17.77 5.82 21 7 14.14l-5-4.87 6.91-1.01L12 2z" />
  </svg>
);

export default function Suppliers() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [user, setUser] = useState<IndustrialUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');

  useEffect(() => {
    document.body.style.overflow = sidebarOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [sidebarOpen]);

  useEffect(() => {
    let cancelled = false;

    async function loadSuppliers() {
      try {
        const [suppliersData, userData] = await Promise.all([getSuppliers(), getCurrentUser()]);
        if (cancelled) return;
        setSuppliers(suppliersData);
        setUser(userData);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadSuppliers();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = suppliers.filter(
    (s) => s.name.toLowerCase().includes(query.toLowerCase()) || s.zone.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (key: string) => {
    const path = NAV_PATHS[key];
    if (path) navigate(path);
  };

  if (loading || !user) {
    return <div className="el-content">Chargement des fournisseurs...</div>;
  }

  return (
    <div className="el-shell">
      <Sidebar
        items={NAV_ITEMS}
        activeKey="suppliers"
        onSelect={handleSelect}
        user={user}
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="el-main">
        <Navbar
          title="Fournisseurs"
          searchOpen={searchOpen}
          onToggleSearch={() => setSearchOpen((v) => !v)}
          onOpenSidebar={() => setSidebarOpen(true)}
        />

        <div className="el-content">
          <div className="el-filter-bar">
            <div className="el-filter-field" style={{ minWidth: 260 }}>
              <label htmlFor="search">Rechercher</label>
              <input
                id="search"
                type="text"
                placeholder="Nom ou zone..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="el-results-count">
            <strong>{filtered.length}</strong> fournisseur{filtered.length > 1 ? 's' : ''}
          </div>

          <div className="el-card">
            <div className="el-table-wrap">
              <table className="el-table">
                <thead>
                  <tr>
                    <th>Fournisseur</th>
                    <th>Zone</th>
                    <th>Matériaux principaux</th>
                    <th>Volume total fourni</th>
                    <th>Réputation</th>
                    <th>Statut</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((s) => (
                    <tr key={s.id}>
                      <td style={{ fontWeight: 600 }}>{s.name}</td>
                      <td>{s.zone}</td>
                      <td>{s.mainMaterials.join(', ')}</td>
                      <td className="el-mono">
                        {s.totalSuppliedKg >= 1000
                          ? `${(s.totalSuppliedKg / 1000).toFixed(1)} t`
                          : `${s.totalSuppliedKg} kg`}
                      </td>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                          {[1, 2, 3, 4, 5].map((i) => (
                            <span key={i} style={{ color: '#d9a441' }}>
                              <StarIcon filled={i <= Math.round(s.rating)} />
                            </span>
                          ))}
                          <span className="el-mono" style={{ marginLeft: 4 }}>
                            {s.rating.toFixed(1)}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span className={`el-pill ${s.status === 'active' ? 'success' : 'late'}`}>
                          {s.status === 'active' ? 'Actif' : 'Inactif'}
                        </span>
                      </td>
                      <td>
                        <a className="el-card-link" href="#" onClick={(e) => e.preventDefault()}>
                          Voir profil
                        </a>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
