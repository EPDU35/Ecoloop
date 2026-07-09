import { useState, useRef, useCallback, useEffect } from 'react';
import { classifyImage, getCategories } from '../services/ai.service';
import './WasteClassifier.css';

interface ClassificationResult {
  category: string;
  confidence: number;
  all_scores?: Record<string, number>;
}

interface WasteClassifierProps {
  onClassify?: (result: ClassificationResult) => void;
  onClose?: () => void;
}

export default function WasteClassifier({ onClassify, onClose }: WasteClassifierProps) {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [result, setResult] = useState<ClassificationResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [, setCategories] = useState<string[]>([]);
  const [step, setStep] = useState<'capture' | 'review' | 'result'>('capture');
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [cameraError, setCameraError] = useState<string | null>(null);

  const loadCategories = useCallback(async () => {
    try {
      const cats = await getCategories();
      setCategories(cats);
    } catch (e) {
      console.warn('Could not load categories:', e);
    }
  }, []);

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      setCameraError(null);
    } catch (e) {
      setCameraError('Impossible d\'accéder à la caméra. Veuillez autoriser l\'accès ou utiliser l\'upload de fichier.');
      console.error('Camera error:', e);
    }
  }, []);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
      if (videoRef.current) videoRef.current.srcObject = null;
    }
  }, [stream]);

  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return;
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const capturedFile = new File([blob], 'capture.jpg', { type: 'image/jpeg' });
        setFile(capturedFile);
        setImagePreview(URL.createObjectURL(blob));
        setStep('review');
        stopCamera();
      }
    }, 'image/jpeg', 0.9);
  }, [stopCamera]);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (!selectedFile.type.startsWith('image/')) {
        setError('Veuillez sélectionner une image (JPG, PNG, WebP).');
        return;
      }
      if (selectedFile.size > 10 * 1024 * 1024) {
        setError('L\'image ne doit pas dépasser 10 Mo.');
        return;
      }
      setFile(selectedFile);
      setImagePreview(URL.createObjectURL(selectedFile));
      setStep('review');
      setError(null);
    }
  }, []);

  const removeImage = useCallback(() => {
    setFile(null);
    setImagePreview(null);
    setStep('capture');
    setError(null);
  }, []);

  const classify = useCallback(async () => {
    if (!file) return;
    setLoading(true);
    setError(null);
    try {
      const res = await classifyImage(file);
      setResult(res);
      setStep('result');
      onClassify?.(res);
    } catch (e: any) {
      setError(e.response?.data?.detail || 'Erreur lors de la classification. Réessayez.');
    } finally {
      setLoading(false);
    }
  }, [file, onClassify]);

  const retake = useCallback(() => {
    setFile(null);
    setImagePreview(null);
    setResult(null);
    setStep('capture');
    setError(null);
  }, []);

  const handleClose = useCallback(() => {
    stopCamera();
    onClose?.();
  }, [stopCamera, onClose]);

  // Cleanup on unmount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const cleanup = useCallback(() => {
    stopCamera();
    if (imagePreview) URL.revokeObjectURL(imagePreview);
  }, [stopCamera, imagePreview]);

  // Load categories on mount
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadCategories(); }, []);

  // Cleanup
  useEffect(() => cleanup, [cleanup]);

  const CATEGORY_LABELS: Record<string, string> = {
    PET: 'PET (Bouteilles transparentes)',
    HDPE: 'HDPE (Flacons opaques)',
    CARTON: 'Carton / Papier',
    VERRE: 'Verre',
    PLASTIQUE: 'Autre plastique',
    METAL: 'Métal / Aluminium',
    PAPIER: 'Papier',
    ORGANIQUE: 'Organique',
    AUTRE: 'Autre / Non recyclable',
  };

  const getConfidenceColor = (conf: number) => {
    if (conf >= 0.8) return 'var(--el-success)';
    if (conf >= 0.5) return 'var(--el-amber)';
    return 'var(--el-signal)';
  };

  return (
    <div className="el-waste-classifier">
      <div className="el-classifier-header">
        <h3>Scanner un déchet ♻️</h3>
        <p className="el-classifier-subtitle">
          Prenez une photo ou importez une image. L'IA identifiera le type de déchet.
        </p>
        <button type="button" className="el-close-btn" onClick={handleClose} aria-label="Fermer">&times;</button>
      </div>

      {error && <div className="el-error-banner">{error}</div>}

      {/* Step 1: Capture */}
      {step === 'capture' && (
        <div className="el-capture-step">
          <div className="el-camera-options">
            <button
              type="button"
              className="el-camera-option el-camera-option--camera"
              onClick={startCamera}
              disabled={!!stream}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                <circle cx="12" cy="12" r="4" />
              </svg>
              <span>Prendre une photo</span>
            </button>
            <label className="el-camera-option el-camera-option--upload">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                <polyline points="17 8 12 3 7 8" />
                <line x1="12" y1="3" x2="12" y2="15" />
              </svg>
              <span>Choisir un fichier</span>
              <input type="file" accept="image/*" onChange={handleFileSelect} hidden />
            </label>
          </div>

          <div className="el-camera-preview" ref={videoRef ? undefined : undefined}>
            {stream && (
              <>
                <video ref={videoRef} autoPlay playsInline muted />
                <canvas ref={canvasRef} hidden />
                <div className="el-camera-controls">
                  <button type="button" className="el-btn el-btn-secondary" onClick={stopCamera}>
                    Annuler
                  </button>
                  <button type="button" className="el-btn el-btn-primary" onClick={capturePhoto} disabled={loading}>
                    {loading ? 'Traitement...' : 'Capturer'}
                  </button>
                </div>
              </>
            )}
            {!stream && (
              <div className="el-camera-placeholder">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                  <circle cx="12" cy="12" r="4" />
                </svg>
                <p>Cliquez sur "Prendre une photo" pour ouvrir la caméra</p>
                {cameraError && <p className="el-camera-error">{cameraError}</p>}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Step 2: Review */}
      {step === 'review' && imagePreview && (
        <div className="el-review-step">
          <div className="el-review-image">
            <img src={imagePreview} alt="Aperçu" />
            <button type="button" className="el-remove-btn" onClick={removeImage} aria-label="Retirer l'image">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
          <div className="el-review-actions">
            <button type="button" className="el-btn el-btn-secondary" onClick={retake}>
              Reprendre
            </button>
            <button type="button" className="el-btn el-btn-primary" onClick={classify} disabled={loading}>
              {loading ? 'Analyse en cours...' : 'Analyser avec l\'IA'}
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Result */}
      {step === 'result' && result && (
        <div className="el-result-step">
          <div className="el-result-header">
            <div className="el-result-category">
              <span className="el-category-badge" style={{ backgroundColor: getConfidenceColor(result.confidence) }}>
                {CATEGORY_LABELS[result.category] || result.category}
              </span>
              <div className="el-confidence">
                Confiance : <strong>{(result.confidence * 100).toFixed(1)}%</strong>
              </div>
            </div>
          </div>

          {result.all_scores && (
            <div className="el-all-scores">
              <h4>Toutes les prédictions :</h4>
              <div className="el-scores-grid">
                {Object.entries(result.all_scores)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 5)
                  .map(([cat, score]) => (
                    <div key={cat} className="el-score-item">
                      <span className="el-score-label">{CATEGORY_LABELS[cat] || cat}</span>
                      <div className="el-score-bar">
                        <div
                          className="el-score-fill"
                          style={{
                            width: `${(score * 100).toFixed(1)}%`,
                            backgroundColor: getConfidenceColor(score)
                          }}
                        />
                      </div>
                      <span className="el-score-value">{(score * 100).toFixed(1)}%</span>
                    </div>
                  ))}
              </div>
            </div>
          )}

          <div className="el-result-actions">
            <button type="button" className="el-btn el-btn-secondary" onClick={retake}>
              Refaire
            </button>
            <button type="button" className="el-btn el-btn-primary" onClick={() => onClassify?.(result)}>
              Valider et publier
            </button>
          </div>
        </div>
      )}

      <div className="el-classifier-footer">
        <p>L'IA EcoLoop utilise YOLOv8 entraîné sur TACO + données locales. Précision ~85% sur 8 catégories.</p>
      </div>
    </div>
  );
}