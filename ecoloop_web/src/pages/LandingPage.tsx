import { Link } from 'react-router-dom';
import { ArrowRight, Recycle, Map, ShieldCheck, Factory, BrainCircuit } from 'lucide-react';
import './LandingPage.css';

export function LandingPage() {
  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav className="landing-nav">
        <div className="nav-container">
          <div className="logo">EcoLoop</div>
          <div className="nav-links">
            <a href="#probleme">Le Problème</a>
            <a href="#solution">La Solution</a>
            <a href="#moteur">Moteur de Décision</a>
            <a href="#impact">Impact</a>
          </div>
          <div className="nav-actions">
            <Link to="/login" className="btn btn-secondary">Se connecter</Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="hero-section text-center">
        <div className="hero-content">
          <h1>L'intelligence qui transforme les déchets en ressources.</h1>
          <p className="hero-subtitle">
            La première plateforme ivoirienne qui connecte producteurs, collecteurs, recycleurs et collectivités pour une économie circulaire structurée.
          </p>
          <div className="hero-cta mt-8">
            <Link to="/login" className="btn btn-primary" style={{ padding: '16px 32px', fontSize: '1.1rem' }}>
              Découvrir EcoLoop <ArrowRight size={20} className="ml-2 inline" />
            </Link>
          </div>
        </div>
      </section>

      {/* Problème Section */}
      <section id="probleme" className="section bg-light">
        <div className="section-container text-center">
          <h2 className="section-title">Le défi urbain</h2>
          <p className="section-description">
            Abidjan produit des milliers de tonnes de déchets chaque jour. Le manque de traçabilité, l'insalubrité urbaine et la collecte réactive freinent la valorisation des matières recyclables.
          </p>
        </div>
      </section>

      {/* Fonctionnement / Solution Section */}
      <section id="solution" className="section">
        <div className="section-container">
          <h2 className="section-title text-center">Comment ça marche ?</h2>
          <div className="grid-cols-4 mt-12 text-center">
            <div className="step-card">
              <div className="step-icon"><Recycle size={32} /></div>
              <h3>1. Déclarer</h3>
              <p>Les producteurs signalent leurs lots triés.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><Map size={32} /></div>
              <h3>2. Optimiser</h3>
              <p>Le système matche les meilleurs collecteurs.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><ShieldCheck size={32} /></div>
              <h3>3. Collecter</h3>
              <p>Les matières sont tracées et ramassées.</p>
            </div>
            <div className="step-card">
              <div className="step-icon"><Factory size={32} /></div>
              <h3>4. Valoriser</h3>
              <p>L'industrie rachète des matières qualifiées.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Decision Support Engine */}
      <section id="moteur" className="section bg-primary-light">
        <div className="section-container text-center">
          <div style={{ display: 'inline-block', padding: '16px', backgroundColor: 'var(--primary)', color: 'white', borderRadius: '50%', marginBottom: '24px' }}>
            <BrainCircuit size={48} />
          </div>
          <h2 className="section-title">EcoLoop Decision Support Engine</h2>
          <p className="section-description" style={{ maxWidth: '800px', margin: '0 auto' }}>
            Notre moteur de décision combine données opérationnelles de terrain, règles métier strictes et algorithmes d'analyse spatiale. Il permet aux mairies d'identifier les zones à risque de saturation et propose des recommandations concrètes pour optimiser les circuits de collecte, sans boîte noire.
          </p>
        </div>
      </section>

      {/* Impact Section */}
      <section id="impact" className="section">
        <div className="section-container text-center">
          <h2 className="section-title">Impact Environnemental</h2>
          <div className="grid-cols-3 mt-12">
            <div className="impact-stat">
              <span className="impact-number">120+</span>
              <span className="impact-label">Tonnes Valorisées</span>
            </div>
            <div className="impact-stat">
              <span className="impact-number">36</span>
              <span className="impact-label">Tonnes CO₂ Évitées</span>
            </div>
            <div className="impact-stat">
              <span className="impact-number">500+</span>
              <span className="impact-label">Acteurs Connectés</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div className="footer-brand">
            <h3>EcoLoop</h3>
            <p>Solutions technologiques pour l'économie circulaire en Afrique de l'Ouest.</p>
          </div>
          <div className="footer-links">
            <a href="#">Contact</a>
            <a href="#">Mentions légales</a>
            <a href="#">Politique de confidentialité</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
