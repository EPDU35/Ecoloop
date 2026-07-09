import { useEffect, useState } from 'react';
import AppLayout from '../components/AppLayout';
import KpiCard from '../components/KpiCard';
import { getCurrentUser } from '../services/user.service';
import type { IndustrialUser } from '../models/User';

export default function Reports() {
  const [user, setUser] = useState<IndustrialUser | null>(null);
  const [loading, setLoading] = useState(true);

  // Formulaire rapports
  const [reportType, setReportType] = useState('spending');
  const [period, setPeriod] = useState('quarter');
  const [format, setFormat] = useState('pdf');
  const [generating, setGenerating] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const userData = await getCurrentUser();
        setUser(userData);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleGenerateReport = (e: React.FormEvent) => {
    e.preventDefault();
    setGenerating(true);
    setSuccess(false);

    setTimeout(() => {
      setGenerating(false);
      setSuccess(true);
    }, 1500);
  };

  if (loading || !user) {
    return <div className="el-content">Chargement des rapports...</div>;
  }

  return (
    <AppLayout role="industrial" activeKey="reports" title="Rapports d'achats &amp; Statistiques">
      {/* Statistiques d'impact achat RSE */}
      <div className="el-kpi-grid">
        <KpiCard
          id="vol"
          label="Volume total acheté"
          value="142.5 t"
          deltaLabel="Cumulé depuis janvier 2026"
        />
        <KpiCard
          id="spend"
          label="Dépense cumulée"
          value="18.4 M FCFA"
          deltaLabel="Moyenne de 2.3 M FCFA / mois"
        />
        <KpiCard
          id="avg"
          label="Prix moyen payé"
          value="129 FCFA/kg"
          deltaLabel="2.4% vs mois dernier"
          deltaDirection="down"
        />
      </div>

      <div className="el-grid-2" style={{ gridTemplateColumns: '3fr 2fr', gap: '1.5rem', marginTop: '1rem' }}>
        <div className="el-card">
          <div className="el-card-heading">
            <div className="el-card-title">Générer un rapport d'achat</div>
          </div>

          <form onSubmit={handleGenerateReport} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem', marginTop: '1rem' }}>
            <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label htmlFor="reportType" style={{ marginBottom: 4 }}>Type de bilan</label>
              <select
                id="reportType"
                value={reportType}
                onChange={(e) => setReportType(e.target.value)}
              >
                <option value="spending">Rapport financier (Dépenses &amp; Budgets)</option>
                <option value="volume">Bilan des volumes et approvisionnements</option>
                <option value="supplier">Performance et fiabilité des collecteurs</option>
              </select>
            </div>

            <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label htmlFor="periodSelect" style={{ marginBottom: 4 }}>Période</label>
              <select
                id="periodSelect"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              >
                <option value="month">Mois en cours (Juillet 2026)</option>
                <option value="quarter">Trimestre en cours (T3 2026)</option>
                <option value="year">Année entière (2026)</option>
              </select>
            </div>

            <div className="el-filter-field" style={{ flexDirection: 'column', alignItems: 'stretch' }}>
              <label htmlFor="formatSelect" style={{ marginBottom: 4 }}>Format de sortie</label>
              <select
                id="formatSelect"
                value={format}
                onChange={(e) => setFormat(e.target.value)}
              >
                <option value="pdf">Document PDF (.pdf)</option>
                <option value="excel">Tableau Excel (.xlsx)</option>
              </select>
            </div>

            <button
              type="submit"
              className="el-btn el-btn-emerald"
              style={{ alignSelf: 'flex-start' }}
              disabled={generating}
            >
              {generating ? 'Génération...' : 'Exporter le rapport'}
            </button>

            {success && (
              <div style={{ background: '#e6f4ea', color: '#137333', padding: '0.75rem', borderRadius: 4, fontSize: '0.85rem', fontWeight: 500 }}>
                ✓ Bilan exporté avec succès ! Le téléchargement du fichier {format.toUpperCase()} va débuter sous peu.
              </div>
            )}
          </form>
        </div>

        <div className="el-card">
          <div className="el-card-heading">
            <div className="el-card-title">Exports récents</div>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem', marginTop: '0.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--el-border)', paddingBottom: 8 }}>
              <div>
                <strong>Bilan Volume Appro T2 2026</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)' }}>01/07/2026 · PDF</div>
              </div>
              <button
                type="button"
                className="el-card-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => alert('Téléchargement du Bilan Volume Appro T2 2026...')}
              >
                Télécharger
              </button>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', borderBottom: '1px solid var(--el-border)', paddingBottom: 8 }}>
              <div>
                <strong>Rapport Dépenses Mensuelles Juin</strong>
                <div style={{ fontSize: '0.75rem', color: 'var(--el-ink-soft)' }}>12/06/2026 · Excel</div>
              </div>
              <button
                type="button"
                className="el-card-link"
                style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}
                onClick={() => alert('Téléchargement du Rapport Dépenses Mensuelles Juin...')}
              >
                Télécharger
              </button>
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
