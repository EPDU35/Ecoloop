import React, { useEffect, useState } from 'react';
import './auth.css';

type Material = { name: string; confidence: number; color: string };

const MATERIALS: Material[] = [
  { name: 'PET', confidence: 95, color: '#3fa34d' },
  { name: 'HDPE', confidence: 91, color: '#3fa34d' },
  { name: 'CARTON', confidence: 88, color: '#d9a441' },
  { name: 'VERRE', confidence: 97, color: '#3fa34d' },
];

/**
 * Rotating "AI recognition" stamp — a nod to the waste-classification
 * feature (YOLO) described in the technical dossier. Purely decorative
 * on the auth screen, but ties the brand panel to the real product.
 */
function MaterialStamp() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const interval = setInterval(() => {
      setVisible(false);
      timeoutId = setTimeout(() => {
        setIndex((i) => (i + 1) % MATERIALS.length);
        setVisible(true);
      }, 250);
    }, 2600);

    return () => {
      clearInterval(interval);
      clearTimeout(timeoutId);
    };
  }, []);

  const material = MATERIALS[index];

  return (
    <div className="el-stamp-wrap">
      <div className="el-stamp-label">Reconnaissance IA — en direct</div>
      <div className="el-stamp-row" style={{ opacity: visible ? 1 : 0, transition: 'opacity 0.25s ease' }}>
        <div className="el-stamp-material">{material.name}</div>
        <div className="el-stamp-confidence" style={{ color: material.color }}>
          {material.confidence}%
        </div>
      </div>
      <div className="el-stamp-bar">
        <div
          className="el-stamp-bar-fill"
          style={{ width: `${material.confidence}%`, background: material.color }}
        />
      </div>
    </div>
  );
}

type AuthLayoutProps = {
  children: React.ReactNode;
};

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="el-root">
      {/* Left: brand panel */}
      <div className="el-side">
        <div className="el-eyebrow">Plateforme de collecte &amp; valorisation</div>

        <div>
          <div className="el-wordmark">
            Eco<span>Loop</span>
          </div>
          <p className="el-tagline">
            Chaque déchet a une seconde vie. Producteurs, collecteurs, industriels et mairies,
            connectés dans une seule boucle.
          </p>
          <MaterialStamp />
        </div>

        <div className="el-side-footer">
          <span>Abidjan · Côte d'Ivoire</span>
          <span className="el-dot" />
          <span>14 320 kg valorisés cette semaine</span>
        </div>
      </div>

      {/* Right: ticket card */}
      <div className="el-form-side">
        <div className="el-ticket">
          {/* Barre supérieure avec retour à l'accueil hautement visible */}
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            borderBottom: '1px solid var(--el-line-dark)', 
            padding: '14px 24px', 
            background: 'var(--el-paper-2)', 
            borderTopLeftRadius: 'var(--radius-card)', 
            borderTopRightRadius: 'var(--radius-card)' 
          }}>
            <a href="/" style={{ 
              color: 'var(--el-ink)', 
              textDecoration: 'none', 
              fontSize: '0.82rem', 
              fontWeight: 600, 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '6px' 
            }}>
              <span style={{ fontSize: '1rem', lineHeight: 1 }}>←</span> Retour à l'accueil
            </a>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}