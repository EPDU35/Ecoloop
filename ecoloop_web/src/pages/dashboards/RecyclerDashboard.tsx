import { EmptyState } from '@/components/feedback/States';
import './Dashboards.css';

export function RecyclerDashboard() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Marketplace Industrielle</h1>
        <p className="page-subtitle">Achetez des matières premières secondaires de qualité</p>
      </div>

      <section className="dashboard-section mt-8">
        <div className="card" style={{ padding: '40px 24px' }}>
          <EmptyState 
            title="Marketplace en préparation" 
            message="La marketplace industrielle sera activée dès la validation des lots par les collecteurs et leur acheminement vers les centres de tri." 
          />
        </div>
      </section>
    </div>
  );
}
