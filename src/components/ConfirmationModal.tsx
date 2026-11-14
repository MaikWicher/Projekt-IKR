import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { CheckCircle2, Download, X, Mail, Clock, MapPin, Calendar as CalendarIcon } from 'lucide-react';
import type { Booking } from '../types';
import { getRoomById } from '../data/mockRooms';
import {
  formatFullDateTimeRange,
  downloadPdfConfirmation,
  downloadIcsFile,
  getGoogleCalendarUrl,
  formatPaymentMethod
} from '../utils/calendarUtils';

interface ConfirmationModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({
  booking,
  isOpen,
  onClose
}) => {
  useEffect(() => {
    if (isOpen) {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  }, [isOpen]);

  if (!isOpen || !booking) return null;

  const room = getRoomById(booking.roomId);

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog animate-fade-in" style={{ maxWidth: '580px' }} onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="brand-badge" style={{ fontSize: '0.75rem' }}>Automatyczne Potwierdzenie</span>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          <div className="confirmation-content">
            <div className="confirmation-badge">
              <CheckCircle2 size={36} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.4rem' }}>Rezerwacja potwierdzona!</h2>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '4px' }}>
                Twój termin został pomyślnie zablokowany w kalendarzu.
              </p>
            </div>

            <div style={{ background: 'var(--bg-subtle)', padding: '6px 14px', borderRadius: 'var(--radius-full)', border: '1px solid var(--border-card)', display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
              <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Numer rezerwacji:</span>
              <strong style={{ color: 'var(--primary)', fontFamily: 'monospace', fontSize: '0.95rem' }}>{booking.code}</strong>
            </div>

            <div
              style={{
                width: '100%',
                background: booking.paymentStatus === 'invoice_b2b' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(16, 185, 129, 0.1)',
                border: `1px solid ${booking.paymentStatus === 'invoice_b2b' ? 'rgba(245, 158, 11, 0.35)' : 'rgba(16, 185, 129, 0.35)'}`,
                borderRadius: 'var(--radius-md)',
                padding: '10px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: '8px',
                textAlign: 'left'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CheckCircle2 size={18} color={booking.paymentStatus === 'invoice_b2b' ? '#f59e0b' : 'var(--emerald)'} />
                <div>
                  <div style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-main)' }}>
                    {booking.paymentStatus === 'invoice_b2b' ? 'Faktura B2B (termin 14 dni)' : 'Opłacono online pomyślnie'}
                  </div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-muted)' }}>
                    Metoda:{' '}
                    <strong>
                      {formatPaymentMethod(booking.paymentMethod)}
                    </strong>
                    {booking.transactionId && ` • Transakcja: ${booking.transactionId}`}
                  </div>
                </div>
              </div>

              <div style={{ fontWeight: 800, fontSize: '1.05rem', color: booking.paymentStatus === 'invoice_b2b' ? '#f59e0b' : 'var(--emerald)' }}>
                {booking.totalCost} PLN
              </div>
            </div>

            <div style={{ width: '100%', background: 'var(--bg-input)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-md)', padding: '16px', textAlign: 'left', display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <div style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--text-main)' }}>
                {booking.title}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <MapPin size={15} color={room?.color || 'var(--primary)'} />
                <span><strong>{room?.name}</strong> ({room?.floor})</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <Clock size={15} color="var(--emerald)" />
                <span>{formatFullDateTimeRange(booking.start, booking.end)}</span>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                <Mail size={15} color="var(--cyan)" />
                <span>Potwierdzenie e-mail wysłano na: <strong>{booking.customerEmail}</strong></span>
              </div>
            </div>

            <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', lineHeight: 1.5 }}>
              Wiadomość z podsumowaniem rezerwacji oraz dokumentem PDF została automatycznie skierowana na skrzynkę pocztową klienta.
            </div>
          </div>
        </div>

        <div className="modal-footer" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              type="button"
              className="btn-primary"
              title="Pobierz bilet i potwierdzenie w formacie PDF"
              onClick={() => downloadPdfConfirmation(booking, room ? room.name : 'Sala')}
            >
              <Download size={15} /> Pobierz PDF
            </button>
            <button
              type="button"
              className="btn-secondary"
              title="Pobierz plik kalendarza (.ics) dla Outlook, Apple Calendar lub smartfona"
              onClick={() => downloadIcsFile(booking, room ? room.name : 'Sala')}
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarIcon size={15} /> Pobierz .ics
            </button>
            <a
              href={getGoogleCalendarUrl(booking, room ? room.name : 'Sala')}
              target="_blank"
              rel="noreferrer"
              className="btn-secondary"
              title="Dodaj termin bezpośrednio do Kalendarza Google"
              style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
            >
              <CalendarIcon size={15} color="#4285F4" /> Google Kalendarz
            </a>
          </div>
          <button type="button" className="btn-secondary" onClick={onClose}>
            Zamknij
          </button>
        </div>
      </div>
    </div>
  );
};
