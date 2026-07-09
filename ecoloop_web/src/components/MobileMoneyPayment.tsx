import React, { useState, useEffect, useCallback } from 'react';
import './MobileMoneyPayment.css';

export interface MobileMoneyProvider {
  id: string;
  name: string;
  label: string;
  color: string;
  logo: string;
  ussdCode: string;
}

export const MOBILE_MONEY_PROVIDERS: MobileMoneyProvider[] = [
  { id: 'orange', name: 'Orange Money', label: 'Orange Money', color: '#FF7900', logo: '🍊', ussdCode: '#144#' },
  { id: 'mtn', name: 'MTN MoMo', label: 'MTN MoMo', color: '#FFCC00', logo: '🟡', ussdCode: '*133#' },
  { id: 'wave', name: 'Wave', label: 'Wave', color: '#1E90FF', logo: '🌊', ussdCode: 'Wave App' },
  { id: 'moov', name: 'Moov Money', label: 'Moov Money', color: '#008080', logo: '🟢', ussdCode: '*155#' },
];

export interface PaymentRequest {
  amount: number;
  currency: 'XOF' | 'XAF';
  phoneNumber: string;
  provider: string;
  description: string;
  reference: string;
  callbackUrl?: string;
}

export interface PaymentResponse {
  success: boolean;
  transactionId?: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  message?: string;
  ussdCode?: string;
  redirectUrl?: string;
}

interface MobileMoneyPaymentProps {
  amount: number;
  currency?: 'XOF' | 'XAF';
  description: string;
  reference: string;
  phoneNumber?: string;
  onOpen?: () => void;
  onClose?: () => void;
  onSuccess?: (response: any) => void;
  onError?: (error: string) => void;
  onPending?: (transactionId: string) => void;
  className?: string;
  modal?: boolean;
}

export default function MobileMoneyPayment({
  amount,
  currency = 'XOF',
  description,
  reference,
  phoneNumber,
  onClose,
  onSuccess,
  onError,
  onPending,
  className = '',
  modal = true,
}: MobileMoneyPaymentProps) {
  const [step, setStep] = useState<'provider' | 'phone' | 'pending' | 'success' | 'error'>('provider');
  const [selectedProvider, setSelectedProvider] = useState<string | null>(null);
  const [inputPhone, setInputPhone] = useState(phoneNumber || '');
  const [loading, setLoading] = useState(false);
  const [transactionId, setTransactionId] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [_polling, setPolling] = useState(false);

  const handleProviderSelect = useCallback((providerId: string) => {
    setSelectedProvider(providerId);
    setStep('phone');
    setErrorMessage(null);
  }, []);

  const validatePhone = useCallback((phone: string): boolean => {
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+225/, '0');
    return /^0[1-9]\d{8}$/.test(cleaned);
  }, []);

  const formatPhone = useCallback((phone: string): string => {
    const cleaned = phone.replace(/\s+/g, '').replace(/^\+225/, '0');
    if (cleaned.length === 10) {
      return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
    }
    return phone;
  }, []);

  const initiatePayment = useCallback(async () => {
    if (!selectedProvider || !validatePhone(inputPhone)) {
      setErrorMessage('Numero de telephone invalide');
      return;
    }

    setLoading(true);
    setErrorMessage(null);

    try {
      const response = await simulatePayment({
        amount,
        currency,
        phoneNumber: inputPhone.replace(/\s+/g, ''),
        provider: selectedProvider,
        description,
        reference,
      });

      if (response.success) {
        setTransactionId(response.transactionId || '');
        setStep('pending');
        onPending?.(response.transactionId || '');
        startPolling();
      } else {
        setStep('error');
        setErrorMessage(response.message || 'Echec du paiement');
        onError?.(response.message || 'Echec du paiement');
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur inattendue';
      setErrorMessage(msg);
      setStep('error');
      onError?.(msg);
    } finally {
      setLoading(false);
    }
  }, [amount, currency, description, reference, selectedProvider, inputPhone, validatePhone]);

  const startPolling = useCallback(() => {
    setPolling(true);
    const interval = setInterval(async () => {
      if (!transactionId) return;
      
      try {
        const status = await checkPaymentStatus(transactionId);
        if (status === 'completed') {
          clearInterval(interval);
          setPolling(false);
          setStep('success');
          onSuccess?.({ success: true, transactionId, status: 'completed' });
        } else if (status === 'failed' || status === 'cancelled') {
          clearInterval(interval);
          setPolling(false);
          setStep('error');
          setErrorMessage('Paiement echoue ou annule');
          onError?.('Paiement echoue ou annule');
        }
      } catch {
        // Ignore polling errors
      }
    }, 3000);

    (window as any).__pollingInterval = interval;
  }, [transactionId, onSuccess, onError]);

  const cleanup = useCallback(() => {
    if ((window as any).__pollingInterval) {
      clearInterval((window as any).__pollingInterval);
      setPolling(false);
    }
  }, []);

  useEffect(() => {
    return cleanup;
  }, [cleanup]);

  const handleClose = useCallback(() => {
    cleanup();
    onClose?.();
  }, [cleanup, onClose]);

  const retry = useCallback(() => {
    setStep('provider');
    setSelectedProvider(null);
    setErrorMessage(null);
  }, []);

  const goBack = useCallback(() => {
    if (step === 'phone') setStep('provider');
    else if (step === 'pending') setStep('phone');
  }, [step]);

  if (modal) {
    return (
      <div className={`el-mobile-money-modal-overlay ${className}`} onClick={e => e.target === e.currentTarget && handleClose()}>
        <div className="el-mobile-money-modal" onClick={e => e.stopPropagation()}>
          <div className="el-mm-header">
            <h3>Paiement Mobile Money</h3>
            <button className="el-mm-close" onClick={handleClose} aria-label="Fermer">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>

          <div className="el-mm-body">
            {step === 'provider' && <ProviderSelection onSelect={handleProviderSelect} />}
            {step === 'phone' && <PhoneInput
              phone={inputPhone}
              onChange={setInputPhone}
              formatPhone={formatPhone}
              onSubmit={initiatePayment}
              loading={loading}
              disabled={!selectedProvider}
            />}
            {step === 'pending' && <PendingPayment
              amount={amount}
              currency={currency}
              transactionId={transactionId || ''}
              provider={selectedProvider || ''}
            />}
            {step === 'success' && <SuccessScreen />}
            {step === 'error' && <ErrorScreen message={errorMessage || ''} onRetry={retry} onBack={goBack} />}
          </div>

          <div className="el-mm-footer">
            <p className="el-mm-footer-note">
              Paiement securise via {selectedProvider ? MOBILE_MONEY_PROVIDERS.find(p => p.id === selectedProvider)?.name : 'Mobile Money'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`el-mobile-money-inline ${className}`}>
      {/* Version inline sans modal */}
    </div>
  );
}

// Sous-composants
function ProviderSelection({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="el-mm-providers">
      <h4>Choisissez votre operateur</h4>
      <div className="el-provider-grid">
        {MOBILE_MONEY_PROVIDERS.map(provider => (
          <button
            key={provider.id}
            type="button"
            className="el-provider-card"
            onClick={() => onSelect(provider.id)}
            style={{ borderColor: provider.color }}
          >
            <span className="el-provider-logo" style={{ backgroundColor: provider.color }}>
              {provider.logo}
            </span>
            <span className="el-provider-name">{provider.label}</span>
            <span className="el-provider-ussd">{provider.ussdCode}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function PhoneInput({ 
  phone, onChange, formatPhone: _formatPhone, onSubmit, loading, disabled 
}: { 
  phone: string; 
  onChange: (v: string) => void; 
  formatPhone: (p: string) => string;
  onSubmit: () => void;
  loading: boolean;
  disabled: boolean;
}) {
  const [localPhone, setLocalPhone] = useState(phone);
  
  useEffect(() => { setLocalPhone(phone); }, [phone]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const digits = e.target.value.replace(/\D/g, '');
    let formatted = '+225';
    for (let i = 0; i < digits.length && i < 10; i++) {
      if (i % 2 === 0 && i > 0) formatted += ' ';
      formatted += digits[i];
    }
    onChange(formatted);
    setLocalPhone(formatted);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') onSubmit();
  };

  return (
    <div className="el-mm-phone-input">
      <h4>Numero de telephone</h4>
      <p className="el-mm-hint">Format: 07 XX XX XX XX ou 05 XX XX XX XX</p>
      
      <div className="el-phone-input-wrapper">
        <select className="el-phone-prefix" defaultValue="+225" disabled>
          <option value="+225">+225 (Cote d'Ivoire)</option>
        </select>
        <input
          type="tel"
          inputMode="numeric"
          pattern="[0-9\s]*"
          value={localPhone}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder="07 00 00 00 00"
          className="el-phone-input"
          disabled={disabled}
          maxLength={14}
          autoComplete="tel"
        />
      </div>

      <p className="el-mm-hint el-mm-secure">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
          <path d="M7 11V7a5 5 0 0 1 10 0v4" />
        </svg>
        Vos donnees sont securisees (chiffrement AES-256)
      </p>

      <button
        type="button"
        className="el-btn el-btn-primary el-btn-lg"
        onClick={onSubmit}
        disabled={loading}
        style={{ width: '100%', marginTop: '1rem' }}
      >
        {loading ? 'Traitement...' : 'Payer maintenant'}
      </button>
    </div>
  );
}

function PendingPayment({ amount, currency, transactionId, provider: _provider }: { 
  amount: number; 
  currency: string; 
  transactionId: string; 
  provider: string;
}) {

  return (
    <div className="el-mm-pending">
      <div className="el-pending-spinner">
        <svg className="el-spin" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <circle cx="12" cy="12" r="10" strokeWidth="3" stroke="currentColor" fill="none" strokeDasharray="31.4 31.4" style={{ strokeDashoffset: 30, animation: 'el-spin 1s linear infinite' }} />
        </svg>
      </div>
      <h3>Paiement en cours...</h3>
      <p className="el-mm-amount">Montant: <strong>{new Intl.NumberFormat('fr-FR', { style: 'currency', currency }).format(amount)}</strong></p>
      <p className="el-txn-id">Transaction: <code>{transactionId.slice(0, 12)}...</code></p>
      
      <div className="el-pending-steps">
        <div className="el-pending-step done">
          <span className="el-step-icon">✓</span>
          <span>Demande envoyee</span>
        </div>
        <div className="el-step active">
          <span className="el-step-icon">{'.'.repeat(Math.floor(Date.now() / 500) % 3 + 1).padEnd(3, ' ')}</span>
          <span>Validation par notre equipe</span>
        </div>
        <div className="el-step">
          <span className="el-step-icon">⏳</span>
          <span>Confirmation</span>
        </div>
      </div>

      <p className="el-pending-note">
        Un message USSD/Push a ete envoye sur votre mobile.<br/>
        Validez la transaction dans les 5 minutes.
      </p>
    </div>
  );
}

function SuccessScreen() {
  return (
    <div className="el-mm-success">
      <div className="el-success-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#3fa34d" strokeWidth="2">
          <circle cx="12" cy="12" r="10" />
          <path d="M9 12l2 2 4-4" />
        </svg>
      </div>
      <h3>Paiement reussi !</h3>
      <p>Votre transaction a ete confirmee avec succes.</p>
      <p className="el-txn-ref">Une confirmation a ete envoyee par SMS.</p>
      <button className="el-btn el-btn-primary el-btn-lg" style={{ marginTop: '1rem', width: '100%' }}>
        Terminer
      </button>
    </div>
  );
}

function ErrorScreen({ message, onRetry, onBack }: { message: string; onRetry: () => void; onBack: () => void }) {
  return (
    <div className="el-mm-error">
      <div className="el-error-icon">
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#b4522f" strokeWidth="2">
          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
          <path d="M12 9v4M12 17h.01" />
        </svg>
      </div>
      <h3>Echec du paiement</h3>
      <p className="el-error-message">{message}</p>
      <div style={{ display: 'flex', gap: 8, marginTop: '1rem', width: '100%' }}>
        <button className="el-btn el-btn-secondary" style={{ flex: 1 }} onClick={onBack}>
          Retour
        </button>
        <button className="el-btn el-btn-primary" style={{ flex: 1 }} onClick={onRetry}>
          Reessayer
        </button>
      </div>
    </div>
  );
}

// Fonctions utilitaires simulees (a remplacer par de vrais appels API)
async function simulatePayment(_params: any): Promise<{ success: boolean; transactionId?: string; message?: string; status: string }> {
  await new Promise(r => setTimeout(r, 1500));
  if (Math.random() > 0.1) {
    return { 
      success: true, 
      transactionId: 'TXN-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9),
      status: 'pending'
    };
  }
  return { success: false, message: 'Solde insuffisant ou numero invalide', status: 'failed' };
}

async function checkPaymentStatus(_transactionId: string): Promise<'pending' | 'completed' | 'failed' | 'cancelled'> {
  await new Promise(r => setTimeout(r, 500));
  const rand = Math.random();
  if (rand < 0.7) return 'completed';
  if (rand < 0.9) return 'failed';
  return 'pending';
}