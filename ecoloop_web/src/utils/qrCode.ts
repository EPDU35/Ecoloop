import QRCode from 'qrcode';
import { Lot, WasteLotOut } from '../models/Waste';

/**
 * Génère un code QR pour un lot de déchets
 * Le QR code contient les infos essentielles + le code de validation
 */
export interface QRCodeData {
  lotId: string;
  validationCode: string;
  category: string;
  weightKg: number;
  pricePerKg: number;
  producerId: string;
  timestamp: string;
  // Pour compatibilité app mobile
  url?: string;
}

export interface QRCodeOptions {
  width?: number;
  margin?: number;
  color?: {
    dark: string;
    light: string;
  };
  errorCorrectionLevel?: 'L' | 'M' | 'Q' | 'H';
}

/**
 * Génère le contenu JSON du QR code
 */
export function generateQRCodeData(lot: WasteLotOut | Lot, validationCode: string): QRCodeData {
  const isWasteLot = 'category' in lot;
  const data: QRCodeData = {
    lotId: lot.id,
    validationCode,
    category: isWasteLot ? (lot as WasteLotOut).category : (lot as Lot).material,
    weightKg: isWasteLot ? (lot as WasteLotOut).weight_kg : (lot as Lot).weightKg,
    pricePerKg: isWasteLot ? (lot as WasteLotOut).price_per_kg : (lot as Lot).pricePerKg,
    producerId: isWasteLot ? (lot as WasteLotOut).producer_id : '',
    timestamp: new Date().toISOString(),
    url: `${window.location.origin}/collecteur/scan/${lot.id}`,
  };
  return data;
}

/**
 * Génère un QR code en DataURL (base64)
 */
export async function generateQRCodeDataURL(
  data: QRCodeData,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#0d1f16', // el-forest
      light: '#f3eee1', // el-paper
    },
    errorCorrectionLevel: 'M',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const jsonString = JSON.stringify(data);

  try {
    const dataURL = await QRCode.toDataURL(jsonString, {
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    });
    return dataURL;
  } catch (error) {
    console.error('QR code generation failed:', error);
    throw new Error('Impossible de générer le QR code');
  }
}

/**
 * Génère un QR code en SVG (pour impression haute qualité)
 */
export async function generateQRCodeSVG(
  data: QRCodeData,
  options: QRCodeOptions = {}
): Promise<string> {
  const defaultOptions: QRCodeOptions = {
    width: 256,
    margin: 2,
    color: {
      dark: '#0d1f16',
      light: '#f3eee1',
    },
    errorCorrectionLevel: 'M',
  };

  const mergedOptions = { ...defaultOptions, ...options };
  const jsonString = JSON.stringify(data);

  try {
    const svg = await QRCode.toString(jsonString, {
      type: 'svg',
      width: mergedOptions.width,
      margin: mergedOptions.margin,
      color: mergedOptions.color,
      errorCorrectionLevel: mergedOptions.errorCorrectionLevel,
    });
    return svg;
  } catch (error) {
    console.error('QR code SVG generation failed:', error);
    throw new Error('Impossible de générer le QR code SVG');
  }
}

/**
 * Valide un code de validation (format: 6 chiffres)
 */
export function validateValidationCode(code: string): boolean {
  return /^\d{6}$/.test(code);
}

/**
 * Génère un code de validation aléatoire (6 chiffres)
 */
export function generateValidationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * Extrait les données d'un QR code scanné (depuis JSON string)
 */
export function parseQRCodeData(jsonString: string): QRCodeData | null {
  try {
    const data = JSON.parse(jsonString);
    // Validation basique
    if (
      data.lotId &&
      data.validationCode &&
      data.category &&
      typeof data.weightKg === 'number' &&
      typeof data.pricePerKg === 'number' &&
      data.producerId &&
      data.timestamp
    ) {
      return data as QRCodeData;
    }
    return null;
  } catch {
    return null;
  }
}

/**
 * Formate le QR code pour l'affichage dans l'UI du producteur
 */
export interface ProducerQRDisplayData {
  lotId: string;
  qrCodeDataURL: string;
  validationCode: string;
  category: string;
  weightKg: number;
  pricePerKg: number;
  createdAt: string;
  expiresAt?: string;
}

export async function prepareProducerQRDisplay(
  lot: WasteLotOut | Lot,
  validationCode: string
): Promise<ProducerQRDisplayData> {
  const qrData = generateQRCodeData(lot, validationCode);
  const qrCodeDataURL = await generateQRCodeDataURL(qrData);
  const isWasteLot = 'category' in lot;

  return {
    lotId: lot.id,
    qrCodeDataURL,
    validationCode,
    category: isWasteLot ? (lot as WasteLotOut).category : (lot as Lot).material,
    weightKg: isWasteLot ? (lot as WasteLotOut).weight_kg : (lot as Lot).weightKg,
    pricePerKg: isWasteLot ? (lot as WasteLotOut).price_per_kg : (lot as Lot).pricePerKg,
    createdAt: new Date().toISOString(),
  };
}

/**
 * Vérifie si un QR code est expiré (optionnel - pour ajouter une expiration)
 */
export function isQRCodeExpired(timestamp: string, maxAgeHours = 24 * 30): boolean {
  const created = new Date(timestamp).getTime();
  const now = Date.now();
  const maxAge = maxAgeHours * 60 * 60 * 1000;
  return now - created > maxAge;
}