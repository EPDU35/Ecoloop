import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import { getAdminUsers, validatePlatformUser, suspendPlatformUser, rejectPlatformUser, createInvitation, type PlatformUser } from '../services/analytics.service';

export default function Users() {
  const [users, setUsers] = useState<PlatformUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'Producteur' | 'Collecteur' | 'Industriel' | 'Mairie'>('all');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState<'COLLECTEUR' | 'INDUSTRIEL' | 'MAIRIE'>('COLLECTEUR');
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');
  const [showExcelModal, setShowExcelModal] = useState(false);
  const [excelFile, setExcelFile] = useState<File | null>(null);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [bulkResult, setBulkResult] = useState<{success: number, errors: string[]} | null>(null);

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

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteError('');
    setInviteLoading(true);
    try {
      await createInvitation({ email: inviteEmail, role: inviteRole as any });
      setShowInviteModal(false);
      setInviteEmail('');
      loadData();
    } catch (err: any) {
      setInviteError(err?.response?.data?.detail || 'Erreur lors de la création de l\'invitation');
    } finally {
      setInviteLoading(false);
    }
  };

  const handleExcelUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setExcelFile(file);
    setBulkResult(null);
  };

  const handleBulkInvite = async () => {
    if (!excelFile) return;
    setBulkLoading(true);
    try {
      const formData = new FormData();
      formData.append('file', excelFile);
      const response = await fetch('/api/v1/admin/invitations/bulk', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: formData,
      });
      if (!response.ok) throw new Error('Erreur lors de l\'import');
      const result = await response.json();
      setBulkResult(result);
      loadData();
    } catch (err: any) {
      setBulkResult({ success: 0, errors: [err.message] });
    } finally {
      setBulkLoading(false);
    }
  };

  const handleExcelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    handleExcelUpload(e);
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

        <div className="el-filter-actions">
          <button type="button" className="el-btn-primary" onClick={() => setShowInviteModal(true)}>
            + Inviter un professionnel
          </button>
        </div>
      </div>

      {/* Modal Invitation unique */}
      {showInviteModal && (
        <div className="el-modal-overlay" onClick={() => setShowInviteModal(false)}>
          <div className="el-modal" onClick={(e) => e.stopPropagation()}>
            <div className="el-modal-header">
              <h3>Inviter un professionnel</h3>
              <button className="el-modal-close" onClick={() => setShowInviteModal(false)}>&times;</button>
            </div>
            <form onSubmit={handleInvite}>
              <div className="el-field">
                <label htmlFor="inviteEmail">Email</label>
                <input id="inviteEmail" type="email" value={inviteEmail} onChange={(e) => setInviteEmail(e.target.value)} required />
              </div>
              <div className="el-field">
                <label htmlFor="inviteRole">Rôle</label>
                <select id="inviteRole" value={inviteRole} onChange={(e) => setInviteRole(e.target.value as 'COLLECTEUR' | 'INDUSTRIEL' | 'MAIRIE')} required>
                  <option value="COLLECTEUR">Collecteur</option>
                  <option value="INDUSTRIEL">Industriel</option>
                  <option value="MAIRIE">Mairie / RSE</option>
                </select>
              </div>
              {inviteError && <div className="el-error-msg">{inviteError}</div>}
              <div className="el-modal-actions">
                <button type="button" className="el-btn-secondary" onClick={() => setShowInviteModal(false)}>Annuler</button>
                <button type="submit" className="el-btn-primary" disabled={inviteLoading}>
                  {inviteLoading ? 'Envoi...' : 'Envoyer l\'invitation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Import Excel */}
      {showExcelModal && (
        <div className="el-modal-overlay" onClick={() => setShowExcelModal(false)}>
          <div className="el-modal" onClick={(e) => e.stopPropagation()}>
            <div className="el-modal-header">
              <h3>Import invitations par Excel</h3>
              <button className="el-modal-close" onClick={() => setShowExcelModal(false)}>&times;</button>
            </div>
            <form onSubmit={(e) => { e.preventDefault(); handleBulkInvite(); }}>
              <div className="el-field">
                <label>Fichier Excel (.xlsx)</label>
                <input type="file" accept=".xlsx,.xls" onChange={handleExcelChange} required />
                <p className="el-hint">Colonnes attendues : email, role (COLLECTEUR/INDUSTRIEL/MAIRIE), full_name (optionnel)</p>
              </div>
              {bulkResult && (
                <div className={`el-banner ${bulkResult.success > 0 ? 'success' : 'error'}`}>
                  <strong>{bulkResult.success} invitation(s) créée(s)</strong>
                  {bulkResult.errors.length > 0 && (
                    <ul style={{ marginTop: 8, paddingLeft: 20 }}>
                      {bulkResult.errors.map((e, i) => <li key={i}>{e}</li>)}
                    </ul>
                  )}
                </div>
              )}
              <div className="el-modal-actions">
                <button type="button" className="el-btn-secondary" onClick={() => setShowExcelModal(false)}>Annuler</button>
                <button type="submit" className="el-btn-primary" disabled={bulkLoading || !excelFile}>
                  {bulkLoading ? 'Import...' : 'Importer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

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