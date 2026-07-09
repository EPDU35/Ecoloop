import type { KpiData } from '../models/Transaction';

export default function KpiCard({ label, value, deltaLabel, deltaDirection }: KpiData) {
  const arrow = deltaDirection === 'up' ? '↑' : '↓';
  const evolutionLabel = deltaDirection === 'up' ? 'hausse' : 'baisse';
  
  return (
    <div className="bo-card">
      <div className="bo-card-core">
        <div className="el-kpi-label">{label}</div>
        <div className="el-kpi-value">{value}</div>
        {deltaLabel && (
          <div 
            className={`el-kpi-delta ${deltaDirection || 'info'}`} 
            style={{ color: !deltaDirection ? 'var(--el-ink-soft)' : undefined, fontWeight: !deltaDirection ? 4 : undefined }}
            aria-label={deltaDirection ? `Évolution : ${evolutionLabel} de ${deltaLabel}` : undefined}
          >
            {deltaDirection && <span aria-hidden="true">{arrow}</span>} {deltaLabel}
          </div>
        )}
      </div>
    </div>
  );
}
