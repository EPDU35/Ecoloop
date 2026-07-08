import React from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import { ShieldCheck, Truck, BarChart3, ShoppingBag, Sparkles, Award } from 'lucide-react';

export const Landing: React.FC = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Header />
      
      <main style={{ flex: 1, padding: '60px 20px', maxWidth: '1200px', margin: '0 auto', width: '100%' }}>
        {/* Hero Section */}
        <section style={{ textAlign: 'center', marginBottom: '80px', animation: 'fadeIn 0.6s ease-out' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 16px', background: 'rgba(16, 185, 129, 0.08)', borderRadius: '9999px', border: '1px solid rgba(16, 185, 129, 0.2)', marginBottom: '24px' }}>
            <Sparkles size={16} style={{ color: '#10b981' }} />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: '#10b981', letterSpacing: '0.05em' }}>MVP ECOLOOP OPERATIONNEL</span>
          </div>
          
          <h1 style={{ fontSize: '3.5rem', marginBottom: '24px', lineHeight: 1.1, background: 'linear-gradient(135deg, #fff 0%, #94a3b8 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Valorisez vos déchets, <br />
            <span style={{ background: 'var(--gradient-accent)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>dynamisez le recyclage</span>
          </h1>
          
          <p style={{ fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto 40px', color: 'var(--text-secondary)' }}>
            Une plateforme de logistique verte de bout en bout reliant ménages, collecteurs, municipalités et industriels pour un avenir durable en Côte d'Ivoire.
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
            <Link to="/register" className="btn btn-primary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Commencer maintenant
            </Link>
            <Link to="/login" className="btn btn-secondary" style={{ padding: '14px 32px', fontSize: '1rem' }}>
              Se connecter
            </Link>
          </div>
        </section>

        {/* Roles/Actors Section */}
        <section style={{ marginBottom: '80px' }}>
          <h2 style={{ textAlign: 'center', fontSize: '2rem', marginBottom: '40px' }}>
            Une solution adaptée à chaque acteur
          </h2>
          
          <div className="grid-4">
            <div className="glass-panel glass-panel-interactive animate-fade-in delay-1" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(16, 185, 129, 0.1)', display: 'flex', alignItems: 'center', justifySelf: 'center', justifyContent: 'center', color: '#10b981' }}>
                <Award size={24} />
              </div>
              <h3>Producteurs</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Publiez vos lots de déchets (plastique, carton, etc.), gagnez des points de récompense et échangez-les contre du Mobile Money.
              </p>
            </div>

            <div className="glass-panel glass-panel-interactive animate-fade-in delay-2" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#06b6d4' }}>
                <Truck size={24} />
              </div>
              <h3>Collecteurs</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Optimisez vos tournées grâce au matching intelligent par zone, réservez des lots et gagnez des commissions par transaction.
              </p>
            </div>

            <div className="glass-panel glass-panel-interactive animate-fade-in delay-3" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(59, 130, 246, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#3b82f6' }}>
                <ShoppingBag size={24} />
              </div>
              <h3>Industriels</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Achetez des matières recyclables en grande quantité sur la marketplace d'EcoLoop et tracez leur provenance géographique.
              </p>
            </div>

            <div className="glass-panel glass-panel-interactive animate-fade-in delay-3" style={{ padding: '30px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(245, 158, 11, 0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#f59e0b' }}>
                <BarChart3 size={24} />
              </div>
              <h3>Municipalités</h3>
              <p style={{ fontSize: '0.9rem' }}>
                Suivez l'impact écologique réel de votre commune grâce à des tableaux de bord statistiques agrégés et respectueux de la RGPD.
              </p>
            </div>
          </div>
        </section>

        {/* Security & Reliability Section */}
        <section className="glass-panel" style={{ padding: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '40px', alignItems: 'center' }}>
          <div>
            <h2 style={{ fontSize: '2rem', marginBottom: '20px' }}>Une plateforme robuste et sécurisée</h2>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <li style={{ display: 'flex', gap: '16px' }}>
                <ShieldCheck style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: 'white' }}>Anti-fraude de poids & volume</h4>
                  <p style={{ fontSize: '0.9rem' }}>Vérification double par code OTP unique et réajustement dynamique de poids lors de la collecte.</p>
                </div>
              </li>
              <li style={{ display: 'flex', gap: '16px' }}>
                <ShieldCheck style={{ color: '#10b981', flexShrink: 0 }} />
                <div>
                  <h4 style={{ color: 'white' }}>Idempotence financière & Audit trail</h4>
                  <p style={{ fontSize: '0.9rem' }}>Chaque transaction financière et attribution de points est auditable et protégée contre les doubles dépenses.</p>
                </div>
              </li>
            </ul>
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ padding: '30px', background: 'rgba(255, 255, 255, 0.02)', border: '1px dashed var(--border-color)', borderRadius: '16px', textAlign: 'center' }}>
              <h3 style={{ fontSize: '2.5rem', color: '#10b981', fontFamily: 'var(--font-display)', marginBottom: '8px' }}>9.5 / 10</h3>
              <p style={{ fontSize: '0.95rem' }}>Note d'architecture MVP validée par le comité technique d'EcoLoop</p>
            </div>
          </div>
        </section>
      </main>

      <footer style={{ borderTop: '1px solid var(--border-color)', padding: '40px 20px', textAlign: 'center', background: 'rgba(0,0,0,0.2)' }}>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
          © 2026 EcoLoop. Tous droits réservés.
        </p>
      </footer>
    </div>
  );
};
export default Landing;
