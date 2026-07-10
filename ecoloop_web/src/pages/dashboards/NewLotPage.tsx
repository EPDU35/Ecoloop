import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { wasteService } from '@/services/api/wasteService';
import { Camera } from 'lucide-react';
import './Dashboards.css';

export function NewLotPage() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    category: 'PLASTIQUE',
    weight_kg: '',
    price_per_kg: '',
    description: '',
    latitude: 5.30966, // Abidjan par defaut
    longitude: -4.01266
  });

  const [photo, setPhoto] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const lot = await wasteService.createLot({
        ...formData,
        weight_kg: parseFloat(formData.weight_kg),
        price_per_kg: parseFloat(formData.price_per_kg),
      });

      if (photo) {
        await wasteService.uploadPhoto(lot.id, photo);
      }

      alert("Lot créé avec succès !");
      navigate('/producer/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erreur lors de la création du lot.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Déclarer un nouveau lot</h1>
        <p className="page-subtitle">Ajoutez un lot de déchets pour qu'il soit collecté</p>
      </div>

      <div className="card mt-6" style={{ maxWidth: '600px' }}>
        {error && <div className="alert alert-error" style={{ marginBottom: '16px', color: 'red' }}>{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Catégorie de déchets</label>
            <select 
              className="input" 
              value={formData.category} 
              onChange={e => setFormData({...formData, category: e.target.value})}
            >
              <option value="PLASTIQUE">Plastique</option>
              <option value="CARTON">Carton</option>
              <option value="VERRE">Verre</option>
              <option value="METAL">Métal</option>
              <option value="ORGANIQUE">Organique</option>
              <option value="ELECTRONIQUE">Électronique</option>
            </select>
          </div>

          <div className="grid-cols-2">
            <div className="form-group">
              <label>Poids estimé (kg)</label>
              <input 
                type="number" 
                className="input" 
                min="0.1" 
                step="0.1" 
                required
                value={formData.weight_kg}
                onChange={e => setFormData({...formData, weight_kg: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>Prix par kg (FCFA)</label>
              <input 
                type="number" 
                className="input" 
                min="1" 
                required
                value={formData.price_per_kg}
                onChange={e => setFormData({...formData, price_per_kg: e.target.value})}
              />
            </div>
          </div>

          <div className="form-group">
            <label>Description (Optionnel)</label>
            <textarea 
              className="input" 
              rows={3}
              value={formData.description}
              onChange={e => setFormData({...formData, description: e.target.value})}
            ></textarea>
          </div>

          <div className="form-group">
            <label>Photo du lot (Optionnel)</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <label className="btn btn-secondary" style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Camera size={20} />
                <span>{photo ? photo.name : 'Prendre une photo'}</span>
                <input 
                  type="file" 
                  accept="image/jpeg, image/png, image/webp" 
                  style={{ display: 'none' }}
                  onChange={e => {
                    if (e.target.files && e.target.files[0]) {
                      setPhoto(e.target.files[0]);
                    }
                  }}
                />
              </label>
            </div>
          </div>

          <button type="submit" className="btn btn-primary mt-4" disabled={isSubmitting}>
            {isSubmitting ? 'Publication en cours...' : 'Publier le lot'}
          </button>
        </form>
      </div>
    </div>
  );
}
