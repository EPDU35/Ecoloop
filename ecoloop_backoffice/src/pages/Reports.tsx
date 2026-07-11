import { useEffect, useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle, 
  XCircle, 
  Trash2, 
  MapPin,
  ExternalLink 
} from 'lucide-react';
import api from '../../services/api';

interface Report {
  id: string;
  latitude: number;
  longitude: number;
  address: string | null;
  description: string | null;
  photo_url: string;
  estimated_volume_m3: number | null;
  status: 'PENDING' | 'VERIFIED' | 'REJECTED' | 'CLEANED';
  ai_confidence_score: number | null;
  reward_awarded: number;
  created_at: string;
}

export function Reports() {
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState<string | null>(null);

  const fetchReports = async () => {
    try {
      setLoading(true);
      const res = await api.get('/reports/');
      setReports(res.data);
    } catch (err) {
      console.error('Failed to fetch reports:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, []);

  const handleValidate = async (id: string, newStatus: string, rewardPoints: number = 0) => {
    try {
      setProcessing(id);
      await api.post(`/reports/${id}/validate`, {
        status: newStatus,
        reward_points: rewardPoints
      });
      // Mettre à jour l'état local
      setReports(reports.map(r => 
        r.id === id ? { ...r, status: newStatus as any, reward_awarded: rewardPoints } : r
      ));
    } catch (err) {
      console.error('Failed to validate report:', err);
      alert("Erreur lors de la validation du signalement.");
    } finally {
      setProcessing(null);
    }
  };

  if (loading) return <div className="p-8 flex justify-center"><div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div></div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <AlertTriangle className="text-warning" />
            Signalements de Dépôts Sauvages
          </h1>
          <p className="text-gray-500 mt-1">Gérez les alertes citoyennes et attribuez les récompenses</p>
        </div>
        <button onClick={fetchReports} className="btn btn-outline">
          Actualiser
        </button>
      </div>

      {reports.length === 0 ? (
        <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
          Aucun signalement enregistré.
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b text-sm text-gray-500">
                <th className="p-4 font-medium">Date & Lieu</th>
                <th className="p-4 font-medium">Détails</th>
                <th className="p-4 font-medium">IA & Vol.</th>
                <th className="p-4 font-medium">Statut</th>
                <th className="p-4 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {reports.map((report) => (
                <tr key={report.id} className="hover:bg-gray-50 transition-colors">
                  <td className="p-4 align-top">
                    <p className="font-medium text-sm">
                      {new Date(report.created_at).toLocaleDateString('fr-FR')}
                    </p>
                    <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                      <MapPin size={12} />
                      {report.address || 'Adresse inconnue'}
                    </p>
                    <a 
                      href={`https://www.google.com/maps?q=${report.latitude},${report.longitude}`}
                      target="_blank" rel="noreferrer"
                      className="text-xs text-primary flex items-center gap-1 mt-1 hover:underline"
                    >
                      <ExternalLink size={12} /> Voir carte
                    </a>
                  </td>
                  <td className="p-4 align-top">
                    <div className="flex gap-3">
                      <a href={report.photo_url} target="_blank" rel="noreferrer">
                        <img 
                          src={report.photo_url} 
                          alt="Dépôt sauvage" 
                          className="w-16 h-16 object-cover rounded-md border"
                        />
                      </a>
                      <p className="text-sm text-gray-700 max-w-xs line-clamp-3">
                        {report.description || 'Aucune description'}
                      </p>
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <div className="space-y-1">
                      {report.ai_confidence_score && (
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-gray-500">Confiance IA:</span>
                          <span className={`text-xs font-bold ${report.ai_confidence_score > 0.8 ? 'text-green-600' : 'text-orange-500'}`}>
                            {(report.ai_confidence_score * 100).toFixed(0)}%
                          </span>
                        </div>
                      )}
                      <p className="text-sm">
                        <span className="text-gray-500 text-xs">Volume est.: </span>
                        {report.estimated_volume_m3 ? `${report.estimated_volume_m3} m³` : 'N/A'}
                      </p>
                      {report.reward_awarded > 0 && (
                        <span className="inline-block bg-accent-light text-accent text-xs px-2 py-0.5 rounded-full mt-1">
                          +{report.reward_awarded} pts
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="p-4 align-top">
                    <span className={`px-2.5 py-1 text-xs font-medium rounded-full ${
                      report.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                      report.status === 'VERIFIED' ? 'bg-blue-100 text-blue-800' :
                      report.status === 'CLEANED' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {report.status}
                    </span>
                  </td>
                  <td className="p-4 align-top text-right space-x-2">
                    {report.status === 'PENDING' && (
                      <>
                        <button 
                          onClick={() => handleValidate(report.id, 'VERIFIED', 50)}
                          disabled={processing === report.id}
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                          title="Valider (+50 pts)"
                        >
                          <CheckCircle size={18} />
                        </button>
                        <button 
                          onClick={() => handleValidate(report.id, 'REJECTED', 0)}
                          disabled={processing === report.id}
                          className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                          title="Rejeter"
                        >
                          <XCircle size={18} />
                        </button>
                      </>
                    )}
                    {report.status === 'VERIFIED' && (
                      <button 
                        onClick={() => handleValidate(report.id, 'CLEANED', 0)}
                        disabled={processing === report.id}
                        className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded border border-emerald-200 text-xs flex items-center gap-1 float-right"
                      >
                        <Trash2 size={14} /> Marquer nettoyé
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
