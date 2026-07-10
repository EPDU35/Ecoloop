import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import AppLayout from '../components/AppLayout';
import { useAuth } from '../auth/AuthContext';
import { NAV_PATHS } from './nav';
import api from '../services/api';

// --- Mocks AI pour le rendu Vibeathon ---
const AI_ZONES = [
  {
    id: 'z1', name: 'Marché Central', risk: 87, confidence: 91, trend: '+40% dans 5 jours',
    reasons: ['Volume +38% en 14 jours', 'Capacité collecte -20%', '2 jours de pluie prévus'],
    action: 'Ajouter 2 collecteurs d\'urgence',
    simulatedRisk: 95, simulatedTrend: 'Saturation Critique'
  },
  {
    id: 'z2', name: 'Zone Commerce', risk: 65, confidence: 85, trend: '+15% dans 7 jours',
    reasons: ['Activité commerciale stable', 'Taux de collecte moyen'],
    action: 'Augmenter la fréquence de collecte de 30%',
    simulatedRisk: 72, simulatedTrend: '+25% dans 7 jours'
  },
  {
    id: 'z3', name: 'Quartier Résidentiel', risk: 20, confidence: 95, trend: 'Stable',
    reasons: ['Volume stable', 'Aucune anomalie détectée'],
    action: 'Aucune action requise',
    simulatedRisk: 22, simulatedTrend: 'Stable'
  }
];

const TIMELINE = [
  { day: 'Jour -7', risk: 45 },
  { day: 'Jour -3', risk: 65 },
  { day: 'Aujourd\'hui', risk: 87 }
];

export default function MunicipalityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeZone, setActiveZone] = useState(AI_ZONES[0]);
  const [showExplanation, setShowExplanation] = useState(false);
  const [simulating, setSimulating] = useState(false);
  const [simulationDone, setSimulationDone] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Mairie';

  const handleSimulate = () => {
    setSimulating(true);
    setTimeout(() => {
      setSimulating(false);
      setSimulationDone(true);
    }, 1500);
  };

  return (
    <AppLayout role="municipality" activeKey="dashboard" title="">
      <div className="el-shell">
        <div className="el-content">
          <div className="el-fade-in" style={{ marginBottom: 32, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <h1 style={{ fontFamily: 'Fraunces', fontSize: '2.5rem', margin: 0, lineHeight: 1.1 }}>
                EcoLoop Intelligence Center 🧠
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 8 }}>
                Système de décision prédictive pour la gestion des déchets urbains.
              </p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(59,130,246,0.1)', border: '1px solid rgba(59,130,246,0.2)', padding: '8px 16px', borderRadius: 20 }}>
              <span style={{ fontSize: '1.2rem' }}>🧠</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.85rem', color: '#60A5FA' }}>EcoLoop AI Engine</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Decision Support Engine</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
            
            {/* Colonne Principale: Cartes & IA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Carte des Zones Critiques */}
              <div className="el-card" style={{ borderTop: '4px solid #EF4444' }}>
                <div className="el-card-header" style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="el-card-title">Zones Analysées</span>
                  <button 
                    onClick={handleSimulate}
                    disabled={simulating || simulationDone}
                    className="el-btn" 
                    style={{ background: simulationDone ? '#10B981' : '#3B82F6', color: '#fff', border: 'none', padding: '4px 12px', fontSize: '0.85rem' }}
                  >
                    {simulating ? 'Calcul en cours...' : simulationDone ? '✅ J+7 Simulé' : '🔮 Simuler dans 7 jours'}
                  </button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {AI_ZONES.map(z => (
                    <div 
                      key={z.id} 
                      style={{ 
                        padding: 16, borderRadius: 12, 
                        border: activeZone.id === z.id ? '2px solid var(--primary)' : '1px solid var(--border)',
                        background: activeZone.id === z.id ? 'rgba(0,168,89,0.05)' : 'var(--background)',
                        cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => { setActiveZone(z); setShowExplanation(false); }}
                    >
                      <div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span style={{ fontSize: '1.5rem' }}>
                            {(simulationDone ? z.simulatedRisk : z.risk) > 80 ? '🔴' : (simulationDone ? z.simulatedRisk : z.risk) > 50 ? '🟠' : '🟢'}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{z.name}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, marginLeft: 32 }}>
                          Prévision : {simulationDone ? z.simulatedTrend : z.trend}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: (simulationDone ? z.simulatedRisk : z.risk) > 80 ? '#EF4444' : (simulationDone ? z.simulatedRisk : z.risk) > 50 ? '#F59E0B' : '#10B981' }}>
                          {simulationDone ? z.simulatedRisk : z.risk}%
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Risque</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Détails IA pour la zone sélectionnée */}
              <div className="el-card" style={{ background: '#0F172A', color: '#F8FAFC', border: 'none' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                  <span style={{ fontSize: '1.2rem', fontWeight: 700 }}>Action Recommandée par l'IA</span>
                  <span className="el-badge" style={{ background: 'rgba(59,130,246,0.2)', color: '#60A5FA' }}>
                    Confiance : {activeZone.confidence}%
                  </span>
                </div>
                
                <div style={{ fontSize: '1.5rem', fontWeight: 800, color: '#10B981', marginBottom: 16 }}>
                  ⚡ {activeZone.action}
                </div>

                {showExplanation ? (
                  <div className="el-fade-in" style={{ background: 'rgba(255,255,255,0.05)', padding: 16, borderRadius: 8 }}>
                    <div style={{ fontSize: '0.9rem', color: '#9CA3AF', marginBottom: 12 }}>Facteurs d'analyse :</div>
                    <ul style={{ margin: 0, paddingLeft: 20, display: 'flex', flexDirection: 'column', gap: 8 }}>
                      {activeZone.reasons.map((r, i) => (
                        <li key={i} style={{ fontSize: '0.95rem' }}>{r}</li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <button className="el-btn el-btn-ghost" style={{ color: '#9CA3AF' }} onClick={() => setShowExplanation(true)}>
                    🔍 Voir explication IA
                  </button>
                )}
              </div>
            </div>

            {/* Colonne Droite: Timeline & Assistant */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Timeline */}
              <div className="el-card">
                <div className="el-card-header">
                  <span className="el-card-title">Évolution {activeZone.name}</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16, position: 'relative' }}>
                  <div style={{ position: 'absolute', left: 11, top: 10, bottom: 10, width: 2, background: 'var(--border)' }} />
                  
                  {TIMELINE.map((t, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1 }}>
                      <div style={{ 
                        width: 24, height: 24, borderRadius: '50%', 
                        background: 'var(--card)', 
                        border: `2px solid var(--border-focus)`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--text-secondary)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.day}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)' }}>
                          {t.risk}%
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {simulationDone && (
                    <div className="el-fade-in" style={{ display: 'flex', alignItems: 'center', gap: 16, position: 'relative', zIndex: 1, marginTop: 8 }}>
                      <div style={{ 
                        width: 24, height: 24, borderRadius: '50%', 
                        background: 'rgba(239,68,68,0.2)', 
                        border: `2px solid #EF4444`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: '#EF4444', fontWeight: 600 }}>Projection J+7 (Simulée)</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: '#EF4444' }}>
                          {activeZone.simulatedRisk}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Decision Log IA */}
              <div className="el-card" style={{ border: '1px solid rgba(16,185,129,0.3)', background: 'rgba(16,185,129,0.02)' }}>
                <div className="el-card-header" style={{ borderBottom: '1px solid rgba(16,185,129,0.1)', paddingBottom: 12 }}>
                  <span className="el-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.95rem' }}>
                    <span>📜</span> Historique des décisions IA
                  </span>
                </div>
                <div style={{ paddingTop: 16, fontSize: '0.85rem', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  <div style={{ borderLeft: '2px solid #10B981', paddingLeft: 12 }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 4 }}>10/07/2026 14:30 - {activeZone.name}</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Analyse : Risque {activeZone.risk}%</div>
                    <div style={{ color: '#059669', marginTop: 2 }}>{activeZone.action}</div>
                    <div style={{ marginTop: 4, display: 'inline-block', padding: '2px 6px', background: '#FDE68A', color: '#92400E', borderRadius: 4, fontSize: '0.7rem', fontWeight: 700 }}>En attente d'approbation</div>
                  </div>
                  <div style={{ borderLeft: '2px solid var(--border)', paddingLeft: 12, opacity: 0.6 }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.75rem', marginBottom: 4 }}>09/07/2026 09:15 - Zone Commerce</div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Analyse : Risque 45%</div>
                    <div style={{ color: 'var(--text-secondary)', marginTop: 2 }}>Aucune action (Stable)</div>
                  </div>
                </div>
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
