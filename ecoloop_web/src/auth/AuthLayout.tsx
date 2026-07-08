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
    const interval = setInterval(() => {
      setVisible(false);
      const timeout = setTimeout(() => {
        setIndex((i) => (i + 1) % MATERIALS.length);
        setVisible(true);
      }, 250);
      return () => clearTimeout(timeout);
    }, 2600);
    return () => clearInterval(interval);
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
  ticketCode?: string;
  children: React.ReactNode;
};

export default function AuthLayout({ ticketCode, children }: AuthLayoutProps) {
  const code = ticketCode ?? `EL-${Math.floor(10000 + Math.random() * 89999)}`;

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
          <div className="el-ticket-code">TICKET N° {code}</div>
          {children}
        </div>
      </div>
    </div>
  );
}
