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
    action: 'Ajouter 2 collecteurs d\'urgence'
  },
  {
    id: 'z2', name: 'Zone Commerce', risk: 65, confidence: 85, trend: '+15% dans 7 jours',
    reasons: ['Activité commerciale stable', 'Taux de collecte moyen'],
    action: 'Augmenter la fréquence de collecte de 30%'
  },
  {
    id: 'z3', name: 'Quartier Résidentiel', risk: 20, confidence: 95, trend: 'Stable',
    reasons: ['Volume stable', 'Aucune anomalie détectée'],
    action: 'Aucune action requise'
  }
];

const TIMELINE = [
  { day: 'Jour -7', risk: 45 },
  { day: 'Jour -3', risk: 65 },
  { day: 'Aujourd\'hui', risk: 87 },
  { day: 'Projection +5 jours', risk: 92 }
];

export default function MunicipalityDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [activeZone, setActiveZone] = useState(AI_ZONES[0]);
  const [showExplanation, setShowExplanation] = useState(false);

  const firstName = user?.full_name?.split(' ')[0] ?? 'Mairie';

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
                <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Analyse en temps réel</div>
              </div>
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 350px', gap: 24, alignItems: 'start' }}>
            
            {/* Colonne Principale: Cartes & IA */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
              
              {/* Carte des Zones Critiques */}
              <div className="el-card" style={{ borderTop: '4px solid #EF4444' }}>
                <div className="el-card-header">
                  <span className="el-card-title">Zones Analysées en Temps Réel</span>
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
                            {z.risk > 80 ? '🔴' : z.risk > 50 ? '🟠' : '🟢'}
                          </span>
                          <span style={{ fontWeight: 700, fontSize: '1.1rem' }}>{z.name}</span>
                        </div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: 4, marginLeft: 32 }}>
                          Prévision : {z.trend}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: '1.5rem', fontWeight: 800, fontFamily: 'Outfit', color: z.risk > 80 ? '#EF4444' : z.risk > 50 ? '#F59E0B' : '#10B981' }}>
                          {z.risk}%
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
                        background: i === TIMELINE.length - 1 ? 'rgba(239,68,68,0.2)' : 'var(--card)', 
                        border: `2px solid ${i === TIMELINE.length - 1 ? '#EF4444' : 'var(--border-focus)'}`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center'
                      }}>
                        <div style={{ width: 8, height: 8, borderRadius: '50%', background: i === TIMELINE.length - 1 ? '#EF4444' : 'var(--text-secondary)' }} />
                      </div>
                      <div>
                        <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>{t.day}</div>
                        <div style={{ fontWeight: 700, fontSize: '1.1rem', color: i === TIMELINE.length - 1 ? '#EF4444' : 'var(--text-primary)' }}>
                          {t.risk}%
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Assistant IA Chat */}
              <div className="el-card" style={{ border: '1px solid rgba(59,130,246,0.3)', background: 'rgba(59,130,246,0.02)' }}>
                <div className="el-card-header" style={{ borderBottom: '1px solid rgba(59,130,246,0.1)', paddingBottom: 12 }}>
                  <span className="el-card-title" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: '1.2rem' }}>🤖</span> Assistant EcoLoop
                  </span>
                </div>
                <div style={{ paddingTop: 16 }}>
                  <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'var(--primary-light)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>👤</div>
                    <div style={{ background: 'var(--background)', padding: 12, borderRadius: '0 12px 12px 12px', fontSize: '0.9rem', border: '1px solid var(--border)' }}>
                      Pourquoi le Marché Central est-il critique ?
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 12 }}>
                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: '#3B82F6', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>🤖</div>
                    <div style={{ background: 'rgba(59,130,246,0.1)', padding: 12, borderRadius: '0 12px 12px 12px', fontSize: '0.9rem', color: 'var(--text-primary)' }}>
                      Selon mes modèles, le volume a augmenté de <strong>38%</strong> en 2 semaines. Couplé aux <strong>2 jours de pluies prévus</strong>, cela augmente drastiquement le risque de saturation sanitaire (87%).
                    </div>
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
