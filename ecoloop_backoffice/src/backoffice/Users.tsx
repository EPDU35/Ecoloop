import React, { useEffect, useState } from 'react';
import { Search } from 'lucide-react';
import api from '../services/api';

interface UserItem {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  is_locked: boolean;
  created_at: string;
}

export default function Users() {
  const [users, setUsers] = useState<UserItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  const load = () => {
    const params: any = { limit: 50, offset: page * 50 };
    if (search) params.search = search;
    if (roleFilter) params.role = roleFilter;
    api.get('/admin/users', { params }).then((r) => {
      setUsers(r.data.users);
      setTotal(r.data.total);
    });
  };

  useEffect(() => { load(); }, [page, roleFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(0);
    load();
  };

  const handleValidate = async (id: string) => {
    if (!window.confirm("Valider ce compte professionnel ?")) return;
    try {
      await api.patch(`/admin/users/${id}/validate`);
      load();
    } catch (e) {
      alert("Erreur lors de la validation");
    }
  };

  const handleSuspend = async (id: string) => {
    if (!window.confirm("Suspendre ce compte ? L'utilisateur ne pourra plus se connecter.")) return;
    try {
      await api.patch(`/admin/users/${id}/suspend`);
      load();
    } catch (e) {
      alert("Erreur lors de la suspension");
    }
  };

  return (
    <div className="bo-page">
      <div className="bo-page-header">
        <h1>Utilisateurs</h1>
        <span className="bo-count">{total} total</span>
      </div>

      <div className="bo-toolbar">
        <form onSubmit={handleSearch} className="bo-search-box">
          <Search size={16} />
          <input
            placeholder="Rechercher par nom, email, téléphone..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
        <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(0); }}>
          <option value="">Tous les rôles</option>
          <option value="PRODUCTEUR">Producteur</option>
          <option value="COLLECTEUR">Collecteur</option>
          <option value="INDUSTRIEL">Industriel</option>
          <option value="MAIRIE">Mairie</option>
          <option value="ADMIN">Admin</option>
        </select>
      </div>

      <div className="bo-table-container">
        <table className="bo-table">
          <thead>
            <tr>
              <th>Nom</th>
              <th>Email</th>
              <th>Téléphone</th>
              <th>Rôle</th>
              <th>Statut</th>
              <th>Inscription</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id}>
                <td className="bo-cell-name">{u.full_name}</td>
                <td>{u.email}</td>
                <td>{u.phone}</td>
                <td><span className={`bo-role-badge ${u.role.toLowerCase()}`}>{u.role}</span></td>
                <td>
                  {!u.is_active ? <span className="bo-status-badge danger">Inactif</span>
                    : u.is_locked ? <span className="bo-status-badge danger">Verrouillé</span>
                    : u.is_verified ? <span className="bo-status-badge success">Vérifié</span>
                    : <span className="bo-status-badge warning">En attente</span>}
                </td>
                <td className="bo-cell-date">{u.created_at ? new Date(u.created_at).toLocaleDateString('fr-FR') : '-'}</td>
                <td>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    {!u.is_active && u.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleValidate(u.id)}
                        style={{ padding: '4px 8px', background: 'var(--accent)', color: '#000', border: 'none', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', fontWeight: 'bold' }}
                      >
                        Valider
                      </button>
                    )}
                    {u.is_active && u.role !== 'ADMIN' && (
                      <button 
                        onClick={() => handleSuspend(u.id)}
                        style={{ padding: '4px 8px', background: 'transparent', color: 'var(--danger)', border: '1px solid var(--danger)', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem' }}
                      >
                        Suspendre
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bo-pagination">
        <button disabled={page === 0} onClick={() => setPage(page - 1)}>Précédent</button>
        <span>Page {page + 1} / {Math.ceil(total / 50)}</span>
        <button disabled={(page + 1) * 50 >= total} onClick={() => setPage(page + 1)}>Suivant</button>
      </div>
    </div>
  );
}
