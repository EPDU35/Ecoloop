import { useState, useCallback, useEffect } from 'react';
import './QRCode.css';

interface QRCodeDisplayProps {
  value: string;
  size?: number;
  label?: string;
  showValue?: boolean;
  onDownload?: () => void;
  error?: string;
  loading?: boolean;
}

export default function QRCodeDisplay({
  value,
  size = 128,
  label,
  showValue = false,
  onDownload,
  error,
  loading,
}: QRCodeDisplayProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);

  const generateQR = useCallback(async (data: string) => {
    try {
      const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(data)}`);
      if (response.ok) {
        const blob = await response.blob();
        setImageSrc(URL.createObjectURL(blob));
      }
    } catch {
      // Silently fail, fallback to text display
    }
  }, [size]);

  useEffect(() => {
    if (value) {
      generateQR(value);
    } else {
      setImageSrc(null);
    }
  }, [value, generateQR]);

  useEffect(() => {
    return () => {
      if (imageSrc) URL.revokeObjectURL(imageSrc);
    };
  }, [imageSrc]);

  const handleDownload = useCallback(() => {
    if (!imageSrc) return;
    const a = document.createElement('a');
    a.href = imageSrc;
    a.download = `qrcode-${Date.now()}.png`;
    a.click();
  }, [imageSrc]);

  if (error) {
    return (
      <div className="el-qr-display">
        <div className="el-qr-error">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <path d="M12 9v4M12 17h.01" />
          </svg>
          <p>{error}</p>
        </div>
      </div>
    );
  }

  if (loading && !imageSrc) {
    return (
      <div className="el-qr-display">
        <div className="el-qr-container el-qr-placeholder" style={{ width: size, height: size }}>
          <div className="el-qr-skeleton" />
        </div>
      </div>
    );
  }

  return (
    <div className="el-qr-display">
      {label && <p className="el-qr-label">{label}</p>}
      <div className="el-qr-container" style={{ width: size, height: size }}>
        {imageSrc ? (
          <img
            src={imageSrc}
            alt="QR Code"
            width={size}
            height={size}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="el-qr-placeholder" style={{ width: size, height: size }}>
            <div className="el-qr-skeleton" />
          </div>
        )}
      </div>
      {showValue && value && (
        <div className="el-qr-value">
          <code>{value}</code>
        </div>
      )}
      {onDownload && (
        <button
          type="button"
          className="el-btn el-btn-secondary el-btn-sm"
          onClick={handleDownload}
          style={{ marginTop: 12, width: '100%' }}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Télécharger
        </button>
      )}
    </div>
  );
}