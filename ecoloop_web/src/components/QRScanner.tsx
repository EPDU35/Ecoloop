import { useState, useEffect, useRef, useCallback } from 'react';
import './WasteClassifier.css'; // reuse existing CSS

declare var BarcodeDetector: any;

interface QRScannerProps {
  /** Callback appelé quand un QR code est détecté */
  onScan: (data: string) => void;
  /** Callback en cas d'erreur */
  onError?: (error: string) => void;
  /** Si le scanner doit être actif */
  active?: boolean;
  /** Texte du bouton d'arrêt */
  stopLabel?: string;
  /** Texte d'instruction */
  instruction?: string;
  /** Classes CSS additionnelles */
  className?: string;
}

interface QRScannerState {
  hasPermission: boolean;
  isScanning: boolean;
  error: string | null;
  facingMode: 'environment' | 'user';
}

export default function QRScanner({
  onScan,
  onError,
  active = true,
  stopLabel = 'Arrêter le scanner',
  instruction = 'Pointez la caméra vers le QR code',
  className = '',
}: QRScannerProps) {
  const [state, setState] = useState<QRScannerState>({
    hasPermission: false,
    isScanning: false,
    error: null,
    facingMode: 'environment',
  });

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>();
  const streamRef = useRef<MediaStream | null>(null);
  const barcodeDetectorRef = useRef<any>(null);
  const scanIntervalRef = useRef<number>();

  // Vérifier si l'API BarcodeDetector est disponible
  const hasBarcodeDetector = typeof window !== 'undefined' && 'BarcodeDetector' in window;

  const checkPermissions = useCallback(async () => {
    try {
      const permission = await navigator.permissions.query({ name: 'camera' as PermissionName });
      return permission.state === 'granted';
    } catch {
      // Fallback: essayer d'accéder à la caméra directement
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        stream.getTracks().forEach(track => track.stop());
        return true;
      } catch {
        return false;
      }
    }
  }, []);

  const startCamera = useCallback(async () => {
    if (state.isScanning) return;

    try {
      setState(prev => ({ ...prev, error: null }));

      const hasPerm = await checkPermissions();
      if (!hasPerm) {
        throw new Error('Permission caméra refusée. Veuillez autoriser l\'accès à la caméra dans les paramètres de votre navigateur.');
      }

      const constraints: MediaStreamConstraints = {
        video: {
          facingMode: state.facingMode,
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }

      // Initialiser BarcodeDetector si disponible
      if (hasBarcodeDetector && !barcodeDetectorRef.current) {
        try {
          barcodeDetectorRef.current = new BarcodeDetector({
            formats: ['qr_code', 'data_matrix', 'aztec'],
          });
        } catch {
          // Silently fail, fallback to interval scanning
        }
      }

      setState(prev => ({ ...prev, hasPermission: true, isScanning: true }));
      startScanning();
    } catch (err: any) {
      const errorMsg = err.name === 'NotAllowedError'
        ? 'Permission caméra refusée. Veuillez autoriser l\'accès dans les paramètres.'
        : err.name === 'NotFoundError'
          ? 'Aucune caméra trouvée sur cet appareil.'
          : err.message || 'Impossible d\'accéder à la caméra';

      setState(prev => ({ ...prev, error: errorMsg }));
      onError?.(errorMsg);
    }
  }, [state.facingMode, checkPermissions]);

  const stopCamera = useCallback(() => {
    stopScanning();

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }

    setState(prev => ({ ...prev, isScanning: false }));
  }, []);

  const startScanning = useCallback(() => {
    if (!videoRef.current) return;

    const scanFrame = async () => {
      if (!state.isScanning || !videoRef.current) return;

      try {
        // Méthode 1: BarcodeDetector API (moderne, performant)
        if (barcodeDetectorRef.current && videoRef.current.readyState === videoRef.current.HAVE_ENOUGH_DATA) {
          try {
            const barcodes = await barcodeDetectorRef.current.detect(videoRef.current);
            if (barcodes.length > 0) {
              const barcode = barcodes[0];
              if (barcode.rawValue) {
                stopCamera();
                onScan(barcode.rawValue);
                return;
              }
            }
          } catch {
            // Ignore detection errors, continue scanning
          }
        }
      } catch {
        // Ignore errors
      }

      animationRef.current = requestAnimationFrame(scanFrame);
    };

    scanFrame();
  }, [state.isScanning, onScan]);

  const stopScanning = useCallback(() => {
    if (animationRef.current) {
      cancelAnimationFrame(animationRef.current);
      animationRef.current = undefined;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = undefined;
    }
  }, []);

  const toggleCamera = useCallback(() => {
    setState(prev => ({ ...prev, facingMode: prev.facingMode === 'environment' ? 'user' : 'environment' }));
    stopCamera();
    // Redémarrer avec la nouvelle caméra après un court délai
    setTimeout(() => startCamera(), 300);
  }, [startCamera, stopCamera]);

  // Nettoyage au démontage
  useEffect(() => {
    return () => {
      stopCamera();
    };
  }, [stopCamera]);

  // Démarrer automatiquement si active
  useEffect(() => {
    if (active) {
      startCamera();
    } else {
      stopCamera();
    }
    return () => stopCamera();
  }, [active, startCamera, stopCamera]);

  if (!state.hasPermission && !state.error) {
    return (
      <div className={`el-qr-scanner ${className}`}>
        <div className="el-scanner-permission">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
            <circle cx="12" cy="12" r="4" />
          </svg>
          <h3>Accès à la caméra requis</h3>
          <p>EcoLoop a besoin d'accéder à votre caméra pour scanner les QR codes.</p>
          <button
            type="button"
            className="el-btn el-btn-primary"
            onClick={startCamera}
          >
            Autoriser l'accès
          </button>
        </div>
      </div>
    );
  }

  if (state.error) {
    return (
      <div className={`el-qr-scanner ${className}`}>
        <div className="el-scanner-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <h3>Erreur caméra</h3>
          <p>{state.error}</p>
          <div style={{ marginTop: 16, display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <button className="el-btn el-btn-primary" onClick={startCamera}>Réessayer</button>
            <button className="el-btn el-btn-secondary" onClick={toggleCamera}>
              {state.facingMode === 'environment' ? 'Caméra frontale' : 'Caméra arrière'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`el-qr-scanner ${className}`}>
      <div className="el-scanner-container">
        <div className="el-scanner-header">
          <h3>Scanner un QR code</h3>
          {state.error && (
            <div className="el-scanner-error-banner">
              {state.error}
              <button type="button" className="el-btn el-btn-ghost el-btn-sm" onClick={startCamera}>
                Réessayer
              </button>
            </div>
          )}
        </div>

        <div className="el-scanner-viewport">
          <video
            ref={videoRef}
            className="el-scanner-video"
            autoPlay
            playsInline
            muted
            aria-label="Caméra pour scanner QR code"
          />
          <canvas ref={canvasRef} className="el-scanner-canvas" hidden />

          {/* Cadre de visée */}
          <div className="el-scanner-frame">
            <div className="el-scanner-corner tl" />
            <div className="el-scanner-corner tr" />
            <div className="el-scanner-corner bl" />
            <div className="el-scanner-corner br" />
            <div className="el-scanner-line" />
          </div>

          <p className="el-scanner-instruction">{instruction}</p>
        </div>

        <div className="el-scanner-controls">
          <button
            type="button"
            className="el-btn el-btn-secondary"
            onClick={toggleCamera}
            disabled={!state.isScanning}
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
              <circle cx="12" cy="12" r="4" />
            </svg>
            {state.facingMode === 'environment' ? 'Caméra frontale' : 'Caméra arrière'}
          </button>

          <button
            type="button"
            className={`el-btn ${state.isScanning ? 'el-btn-danger' : 'el-btn-primary'}`}
            onClick={state.isScanning ? stopCamera : startCamera}
            disabled={!state.hasPermission}
          >
            {state.isScanning ? stopLabel : 'Démarrer le scanner'}
          </button>
        </div>

        <div className="el-scanner-hints">
          <p>Astuce : Assurez-vous que le QR code est bien éclairé et centré dans le cadre.</p>
          <button
            type="button"
            className="el-btn el-btn-ghost el-btn-sm"
            onClick={() => onScan('MANUAL_ENTRY')}
          >
            Saisir le code manuellement
          </button>
        </div>
      </div>
    </div>
  );
}