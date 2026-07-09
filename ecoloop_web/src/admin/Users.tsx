import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { getAdminUsers, validatePlatformUser, suspendPlatformUser, rejectPlatformUser, type PlatformUser } from '../services/analytics.service';

export default function Users() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Producteur' | 'Collecteur' | 'Industriel' | 'Mairie'>('all');

  async function loadData() {
    try {
      const data = await getAdminUsers();
      setUsers(data);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const handleValidate = async (id: string) => {
    await validatePlatformUser(id);
    loadData();
  };

  const handleReject = async (id: string) => {
    if (!window.confirm('Confirmer le rejet de ce compte ? L\'utilisateur sera notifié par email et son inscription sera supprimée.')) return;
    await rejectPlatformUser(id);
    loadData();
  };

  const handleSuspend = async (id: string) => {
    await suspendPlatformUser(id);
    loadData();
  };

  const filtered = users.filter((u) => {
    const q = query.toLowerCase();
    const matchesSearch =
      u.name.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.phone.includes(query);
    const matchesRole = roleFilter === 'all' || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  if (loading) {
    return <div className="el-content">Chargement des utilisateurs...</div>;
  }

  return (
    <AppLayout role="admin" activeKey="users" title="Gestion des Utilisateurs">
      <div className="el-filter-bar">
        <div className="el-filter-field" style={{ minWidth: 240 }}>
          <label htmlFor="userSearch">Rechercher</label>
          <input
            id="userSearch"
            type="text"
            placeholder="Nom, email ou téléphone..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        <div className="el-filter-field">
          <label htmlFor="roleFilter">Rôle</label>
          <select
            id="roleFilter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as any)}
          >
            <option value="all">Tous les rôles</option>
            <option value="Producteur">Producteur</option>
            <option value="Collecteur">Collecteur</option>
            <option value="Industriel">Industriel</option>
            <option value="Mairie">Mairie / RSE</option>
          </select>
        </div>
      </div>

      <div className="el-results-count" style={{ marginTop: '1rem' }}>
        <strong>{filtered.length}</strong> utilisateur{filtered.length > 1 ? 's' : ''} trouvé{filtered.length > 1 ? 's' : ''}
      </div>

      <div className="el-card" style={{ marginTop: '0.5rem' }}>
        <div className="el-table-wrap">
          <table className="el-table">
            <thead>
              <tr>
                <th>Nom</th>
                <th>Email</th>
                <th>Téléphone</th>
                <th>Rôle</th>
                <th>Statut</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((u) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 600 }}>{u.name}</td>
                  <td className="el-mono">{u.email}</td>
                  <td className="el-mono">{u.phone}</td>
                  <td>
                    <span
                      className="el-material-badge"
                      style={{
                        background:
                          u.role === 'Producteur'
                            ? '#efefef'
                            : u.role === 'Collecteur'
                              ? '#d9a441'
                              : u.role === 'Industriel'
                                ? '#3fa34d'
                                : '#6b8f79',
                        color: '#1a1a1a',
                      }}
                    >
                      {u.role}
                    </span>
                  </td>
                  <td>
                    <span className={`el-pill ${u.status === 'active' ? 'success' : u.status === 'pending' ? 'in_transit' : 'late'}`}>
                      {u.status === 'active' ? 'Actif' : u.status === 'pending' ? 'En attente' : 'Suspendu'}
                    </span>
                  </td>
                  <td>
                    {u.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="el-card-link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, padding: 0 }}
                          onClick={() => handleValidate(u.id)}
                        >
                          Valider
                        </button>
                        <button
                          type="button"
                          className="el-card-link"
                          style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--el-signal)', fontWeight: 600, padding: 0 }}
                          onClick={() => handleReject(u.id)}
                        >
                          Rejeter
                        </button>
                      </div>
                    )}
                    {u.status === 'active' && (
                      <button
                        type="button"
                        className="el-card-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--el-amber)', fontWeight: 600, padding: 0 }}
                        onClick={() => handleSuspend(u.id)}
                      >
                        Suspendre
                      </button>
                    )}
                    {u.status === 'suspended' && (
                      <button
                        type="button"
                        className="el-card-link"
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--el-signal)', fontWeight: 600, padding: 0 }}
                        onClick={() => handleValidate(u.id)}
                      >
                        Réactiver
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AppLayout>
  );
}
