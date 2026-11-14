import React, { useState, useEffect } from 'react';
import {
  X,
  ShieldCheck,
  Lock,
  CheckCircle2,
  Loader2,
  Clock,
  Sparkles,
  ArrowRight,
  Info
} from 'lucide-react';
import type { BookingFormData, PaymentMethod, PaymentStatus } from '../types';
import confetti from 'canvas-confetti';
import {
  BlikLogo,
  CardLogos,
  Przelewy24Logo,
  GoogleApplePayLogo,
  B2BInvoiceLogo,
  BankLogos
} from './PaymentBrandLogos';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  bookingData: BookingFormData | null;
  totalCost: number;
  roomName: string;
  roomLocation: string;
  onPaymentSuccess: (paymentInfo: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId: string;
  }) => void;
}

const BANKS = [
  { id: 'mbank', name: 'mBank', color: '#e60000', icon: 'M' },
  { id: 'pko', name: 'PKO Bank Polski', color: '#002882', icon: 'PKO' },
  { id: 'santander', name: 'Santander', color: '#ec0000', icon: 'SAN' },
  { id: 'ing', name: 'ING Bank Śląski', color: '#ff6200', icon: 'ING' },
  { id: 'millennium', name: 'Millennium', color: '#cc0066', icon: 'MIL' },
  { id: 'alior', name: 'Alior Bank', color: '#7c1034', icon: 'AB' },
  { id: 'pekao', name: 'Bank Pekao S.A.', color: '#d0021b', icon: 'Żubr' },
  { id: 'bnp', name: 'BNP Paribas', color: '#00965e', icon: 'BNP' }
];

export const PaymentModal: React.FC<PaymentModalProps> = ({
  isOpen,
  onClose,
  bookingData,
  totalCost,
  roomName,
  roomLocation,
  onPaymentSuccess
}) => {
  if (!isOpen || !bookingData) return null;

  const [method, setMethod] = useState<PaymentMethod>('blik');

  const [blikCode, setBlikCode] = useState('');
  const [blikWaiting, setBlikWaiting] = useState(false);
  const [blikTimer, setBlikTimer] = useState(50);

  const [cardNumber, setCardNumber] = useState('');
  const [cardExpiry, setCardExpiry] = useState('');
  const [cardCvv, setCardCvv] = useState('');
  const [cardHolder, setCardHolder] = useState(bookingData.customerName || '');

  const [selectedBank, setSelectedBank] = useState('mbank');

  const [nip, setNip] = useState('583-000-12-34');
  const [invoiceCompanyName, setInvoiceCompanyName] = useState(bookingData.companyName || 'Trójmiasto Tech Sp. z o.o.');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<string>('');
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedTxId, setGeneratedTxId] = useState('');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (blikWaiting && blikTimer > 0) {
      interval = setInterval(() => {
        setBlikTimer(prev => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [blikWaiting, blikTimer]);

  const fillTestBlik = () => {
    const randomCode = String(Math.floor(100000 + Math.random() * 900000));
    setBlikCode(randomCode);
  };

  const fillTestCard = () => {
    setCardNumber('4242 4242 4242 4242');
    setCardExpiry('12/28');
    setCardCvv('789');
    setCardHolder(bookingData.customerName || 'Jan Kowalski');
  };

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = val.replace(/(\d{4})/g, '$1 ').trim();
    setCardNumber(formatted);
  };

  const handleCardExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (val.length >= 2) {
      val = val.slice(0, 2) + '/' + val.slice(2);
    }
    setCardExpiry(val);
  };

  const handleExecutePayment = async () => {
    const txId = `PAY-${Math.floor(100000 + Math.random() * 900000)}`;
    setGeneratedTxId(txId);
    setIsProcessing(true);

    if (method === 'blik') {
      if (blikCode.replace(/\s/g, '').length !== 6) {
        alert('Podaj poprawny 6-cyfrowy kod BLIK');
        setIsProcessing(false);
        return;
      }
      setProcessingStep('Inicjalizacja płatności BLIK...');
      await new Promise(r => setTimeout(r, 600));

      setBlikWaiting(true);
      setProcessingStep('Oczekiwanie na zatwierdzenie w aplikacji bankowej...');
      await new Promise(r => setTimeout(r, 1400));

      setProcessingStep('Autoryzacja zaakceptowana! Rejestracja w NBP...');
      await new Promise(r => setTimeout(r, 700));
    } else if (method === 'card') {
      setProcessingStep('Szyfrowanie danych karty (AES-256)...');
      await new Promise(r => setTimeout(r, 700));

      setProcessingStep('Weryfikacja 3D-Secure 2.0...');
      await new Promise(r => setTimeout(r, 900));

      setProcessingStep('Autoryzacja w centrum Visa / Mastercard...');
      await new Promise(r => setTimeout(r, 700));
    } else if (method === 'transfer') {
      const bank = BANKS.find(b => b.id === selectedBank)?.name || 'Bank';
      setProcessingStep(`Nawiązywanie połączenia z bramką ${bank}...`);
      await new Promise(r => setTimeout(r, 800));

      setProcessingStep('Symulacja logowania i autoryzacji przelewu...');
      await new Promise(r => setTimeout(r, 900));
    } else if (method === 'google_pay' || method === 'apple_pay') {
      setProcessingStep('Autoryzacja portfela cyfrowego i tokenu biometrycznego...');
      await new Promise(r => setTimeout(r, 1000));
    } else if (method === 'invoice_b2b') {
      setProcessingStep('Weryfikacja danych rejestrowych NIP w bazie GUS...');
      await new Promise(r => setTimeout(r, 700));

      setProcessingStep(`Wystawianie faktury proforma z terminem 14 dni...`);
      await new Promise(r => setTimeout(r, 800));
    }

    setProcessingStep('Płatność zrealizowana pomyślnie! ✓');
    setIsSuccess(true);

    confetti({
      particleCount: 70,
      spread: 60,
      origin: { y: 0.6 }
    });

    await new Promise(r => setTimeout(r, 900));

    onPaymentSuccess({
      method,
      status: method === 'invoice_b2b' ? 'invoice_b2b' : 'paid',
      transactionId: txId
    });
  };

  return (
    <div className="modal-backdrop" style={{ zIndex: 1200 }}>
      <div
        className="modal-dialog animate-fade-in"
        style={{ maxWidth: '640px', padding: '0', overflow: 'hidden' }}
        onClick={e => e.stopPropagation()}
      >
        <div
          style={{
            background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 100%)',
            padding: '20px 24px',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
              }}
            >
              <ShieldCheck size={22} color="#a5b4fc" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <h3 style={{ fontSize: '1.15rem', margin: 0, fontWeight: 700, letterSpacing: '-0.3px' }}>
                  Gdańsk Hub Pay
                </h3>
                <span
                  style={{
                    background: 'rgba(16, 185, 129, 0.25)',
                    color: '#6ee7b7',
                    fontSize: '0.68rem',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    border: '1px solid rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <Lock size={10} style={{ display: 'inline', marginRight: '3px' }} />
                  SSL 256-BIT
                </span>
              </div>
              <p style={{ margin: 0, fontSize: '0.76rem', color: '#c7d2fe' }}>
                Bezpieczna symulacja płatności online za wynajem przestrzeni
              </p>
            </div>
          </div>

          <button
            type="button"
            className="modal-close-btn"
            onClick={onClose}
            style={{ color: 'white', opacity: 0.8 }}
            disabled={isProcessing}
          >
            <X size={20} />
          </button>
        </div>

        {isProcessing && (
          <div
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px'
            }}
          >
            {isSuccess ? (
              <div
                style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: 'var(--emerald)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
              >
                <CheckCircle2 size={40} />
              </div>
            ) : (
              <Loader2 size={44} className="spin-slow" color="var(--primary)" />
            )}

            <div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '6px', color: 'var(--text-main)' }}>
                {isSuccess ? 'Płatność Zaakceptowana!' : 'Przetwarzanie Płatności'}
              </h4>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                {processingStep}
              </p>
            </div>

            {blikWaiting && !isSuccess && (
              <div
                style={{
                  background: 'var(--bg-input)',
                  border: '1px solid var(--border)',
                  padding: '12px 18px',
                  borderRadius: 'var(--radius-md)',
                  fontSize: '0.82rem',
                  maxWidth: '380px',
                  color: 'var(--text-main)'
                }}
              >
                🔔 Sprawdź telefon: powiadomienie z banku czeka na akceptację kodem PIN.
              </div>
            )}

            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', fontFamily: 'monospace' }}>
              Identyfikator transakcji: {generatedTxId}
            </div>
          </div>
        )}

        {!isProcessing && (
          <div style={{ padding: '20px 24px' }}>
            <div
              style={{
                background: 'var(--bg-input)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: '20px',
                flexWrap: 'wrap',
                gap: '10px'
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--text-main)' }}>
                  {bookingData.title}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  {roomName} • {roomLocation} • {bookingData.date}, {bookingData.startTime} - {bookingData.endTime}
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  Do zapłaty:
                </div>
                <div style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--emerald)' }}>
                  {totalCost} PLN
                </div>
              </div>
            </div>

            <div style={{ marginBottom: '16px' }}>
              <div style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '8px' }}>
                Wybierz metodę płatności:
              </div>

              <div className="payment-methods-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(105px, 1fr))', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => setMethod('blik')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: method === 'blik' ? '2px solid #eb0029' : '1px solid var(--border-card)',
                    background: method === 'blik' ? 'rgba(235, 0, 41, 0.1)' : 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '66px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: method === 'blik' ? '0 0 12px rgba(235, 0, 41, 0.2)' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <BlikLogo height={20} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    Kod BLIK
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('card')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: method === 'card' ? '2px solid var(--primary)' : '1px solid var(--border-card)',
                    background: method === 'card' ? 'rgba(99, 102, 241, 0.1)' : 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '66px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: method === 'card' ? '0 0 12px rgba(99, 102, 241, 0.2)' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <CardLogos height={15} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    Karta płatnicza
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('transfer')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: method === 'transfer' ? '2px solid var(--cyan)' : '1px solid var(--border-card)',
                    background: method === 'transfer' ? 'rgba(6, 182, 212, 0.1)' : 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '66px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: method === 'transfer' ? '0 0 12px rgba(6, 182, 212, 0.2)' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <Przelewy24Logo height={18} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    Szybki przelew
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('google_pay')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: method === 'google_pay' ? '2px solid #10b981' : '1px solid var(--border-card)',
                    background: method === 'google_pay' ? 'rgba(16, 185, 129, 0.1)' : 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '66px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: method === 'google_pay' ? '0 0 12px rgba(16, 185, 129, 0.2)' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <GoogleApplePayLogo compact />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    Google / Apple Pay
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => setMethod('invoice_b2b')}
                  style={{
                    padding: '8px 4px',
                    borderRadius: 'var(--radius-md)',
                    border: method === 'invoice_b2b' ? '2px solid var(--amber)' : '1px solid var(--border-card)',
                    background: method === 'invoice_b2b' ? 'rgba(245, 158, 11, 0.1)' : 'var(--bg-subtle)',
                    color: 'var(--text-main)',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    minHeight: '66px',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    boxShadow: method === 'invoice_b2b' ? '0 0 12px rgba(245, 158, 11, 0.2)' : 'none',
                    overflow: 'hidden'
                  }}
                >
                  <div style={{ height: '22px', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '100%' }}>
                    <B2BInvoiceLogo height={20} />
                  </div>
                  <span style={{ fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                    Faktura B2B (14 dni)
                  </span>
                </button>
              </div>
            </div>

            <div
              style={{
                background: 'var(--bg-subtle)',
                border: '1px solid var(--border-card)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                minHeight: '190px'
              }}
            >
              {method === 'blik' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Wpisz 6-cyfrowy kod z aplikacji swojego banku:
                    </div>
                    <button
                      type="button"
                      onClick={fillTestBlik}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={13} /> Wstaw testowy kod
                    </button>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <input
                      type="text"
                      maxLength={6}
                      placeholder="000 000"
                      value={blikCode}
                      onChange={e => setBlikCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{
                        fontSize: '1.8rem',
                        letterSpacing: '10px',
                        textAlign: 'center',
                        fontWeight: 800,
                        fontFamily: 'monospace',
                        width: '240px',
                        padding: '10px',
                        borderRadius: 'var(--radius-md)',
                        background: 'var(--bg-input)',
                        color: 'var(--text-main)',
                        border: '2px solid var(--border-focus)'
                      }}
                    />
                  </div>

                  <div
                    style={{
                      fontSize: '0.76rem',
                      color: 'var(--text-dim)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px'
                    }}
                  >
                    <Clock size={13} />
                    <span>Kod ważny przez 2 minuty. Po kliknięciu zatwierdź płatność w aplikacji banku.</span>
                  </div>
                </div>
              )}

              {method === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                        Dane karty płatniczej:
                      </span>
                      <CardLogos height={15} />
                    </div>
                    <button
                      type="button"
                      onClick={fillTestCard}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: 'var(--primary)',
                        fontSize: '0.78rem',
                        fontWeight: 600,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                      }}
                    >
                      <Sparkles size={13} /> Wypełnij testową kartą
                    </button>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Numer karty:
                    </label>
                    <input
                      type="text"
                      placeholder="4242 4242 4242 4242"
                      value={cardNumber}
                      onChange={handleCardNumberChange}
                      className="form-input"
                      style={{ fontFamily: 'monospace', letterSpacing: '2px', fontSize: '0.95rem', width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Ważność (MM/RR):
                      </label>
                      <input
                        type="text"
                        placeholder="MM/RR"
                        value={cardExpiry}
                        onChange={handleCardExpiryChange}
                        className="form-input"
                        style={{ fontFamily: 'monospace', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>

                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        CVV / CVC:
                      </label>
                      <input
                        type="password"
                        maxLength={4}
                        placeholder="•••"
                        value={cardCvv}
                        onChange={e => setCardCvv(e.target.value.replace(/\D/g, '').slice(0, 4))}
                        className="form-input"
                        style={{ fontFamily: 'monospace', textAlign: 'center', width: '100%', boxSizing: 'border-box' }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                      Imię i nazwisko posiadacza karty:
                    </label>
                    <input
                      type="text"
                      placeholder="Jan Kowalski"
                      value={cardHolder}
                      onChange={e => setCardHolder(e.target.value)}
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                    />
                  </div>
                </div>
              )}

              {method === 'transfer' && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                    <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                      Wybierz swój bank:
                    </div>
                    <Przelewy24Logo height={18} />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px' }}>
                    {BANKS.map(bank => {
                      const BankLogo = BankLogos[bank.id];
                      const isSelected = selectedBank === bank.id;
                      return (
                        <button
                          key={bank.id}
                          type="button"
                          onClick={() => setSelectedBank(bank.id)}
                          style={{
                            padding: '10px 8px',
                            borderRadius: 'var(--radius-sm)',
                            border: isSelected ? '2px solid var(--primary)' : '1px solid var(--border)',
                            background: isSelected ? 'rgba(99, 102, 241, 0.18)' : 'var(--bg-input)',
                            color: 'var(--text-main)',
                            cursor: 'pointer',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            gap: '6px',
                            transition: 'all 0.15s',
                            boxShadow: isSelected ? '0 0 10px rgba(99, 102, 241, 0.25)' : 'none'
                          }}
                        >
                          <div
                            style={{
                              width: '32px',
                              height: '32px',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: '6px',
                              overflow: 'hidden'
                            }}
                          >
                            {BankLogo ? (
                              <BankLogo size={30} />
                            ) : (
                              <div
                                style={{
                                  width: '28px',
                                  height: '28px',
                                  borderRadius: '4px',
                                  background: bank.color,
                                  color: 'white',
                                  fontWeight: 800,
                                  fontSize: '0.7rem',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center'
                                }}
                              >
                                {bank.icon}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '0.72rem', fontWeight: 600, textAlign: 'center', lineHeight: 1.2 }}>
                            {bank.name}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {method === 'google_pay' && (
                <div style={{ textAlign: 'center', padding: '14px 0' }}>
                  <div style={{ fontSize: '0.92rem', fontWeight: 700, color: 'var(--text-main)', marginBottom: '6px' }}>
                    Szybka płatność portfelem mobilnym
                  </div>
                  <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '18px' }}>
                    Zatwierdź transakcję za pomocą biometrii (Face ID, Touch ID lub kod blokady telefonu).
                  </p>

                  <div style={{ display: 'flex', justifyContent: 'center' }}>
                    <div
                      style={{
                        padding: '12px 28px',
                        background: '#090d16',
                        border: '1px solid rgba(255, 255, 255, 0.2)',
                        color: '#ffffff',
                        borderRadius: '10px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '12px',
                        boxShadow: '0 6px 20px rgba(0,0,0,0.4)'
                      }}
                    >
                      <GoogleApplePayLogo height={24} />
                    </div>
                  </div>
                </div>
              )}

              {method === 'invoice_b2b' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  <div style={{ fontSize: '0.84rem', fontWeight: 600, color: 'var(--text-main)' }}>
                    Płatność odroczona dla firm (Faktura VAT 14 dni):
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        NIP przedsiębiorstwa:
                      </label>
                      <input
                        type="text"
                        value={nip}
                        onChange={e => setNip(e.target.value)}
                        className="form-input"
                        placeholder="NIP np. 583-000-12-34"
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block', marginBottom: '4px' }}>
                        Pełna nazwa firmy:
                      </label>
                      <input
                        type="text"
                        value={invoiceCompanyName}
                        onChange={e => setInvoiceCompanyName(e.target.value)}
                        className="form-input"
                        placeholder="Nazwa z KRS / CEIDG"
                      />
                    </div>
                  </div>

                  <div
                    style={{
                      background: 'rgba(245, 158, 11, 0.1)',
                      border: '1px solid rgba(245, 158, 11, 0.3)',
                      padding: '8px 12px',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.76rem',
                      color: 'var(--text-main)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}
                  >
                    <Info size={14} color="#f59e0b" />
                    <span>
                      Faktura proforma zostanie wygenerowana automatycznie i wysłana na adres: <strong>{bookingData.customerEmail}</strong> z terminem 14 dni.
                    </span>
                  </div>
                </div>
              )}
            </div>

            <div
              style={{
                marginTop: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '12px'
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={onClose}
              >
                Wróć do formularza
              </button>

              <button
                type="button"
                className="btn-primary"
                onClick={handleExecutePayment}
                style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  padding: '11px 24px',
                  fontSize: '0.92rem',
                  gap: '8px'
                }}
              >
                <span>
                  {method === 'invoice_b2b'
                    ? `Zatwierdź z terminem 14 dni (${totalCost} PLN)`
                    : `Autoryzuj i zapłać ${totalCost} PLN`}
                </span>
                <ArrowRight size={16} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
