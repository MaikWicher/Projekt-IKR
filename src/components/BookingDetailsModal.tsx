import React, { useState } from 'react';
import {
  X,
  Clock,
  Users,
  Mail,
  Phone,
  Edit3,
  Trash2,
  CheckCircle2,
  XCircle,
  Download,
  Send,
  MessageSquare,
  Calendar as CalendarIcon,
  Eye,
  UserCheck,
  Lock,
  Bell,
  CreditCard
} from 'lucide-react';
import type { Booking, BookingStatus, User } from '../types';
import { getRoomById } from '../data/mockRooms';
import { ApiService } from '../services/api';
import {
  formatFullDateTimeRange,
  downloadPdfConfirmation,
  downloadIcsFile,
  getGoogleCalendarUrl,
  createEmailSimulation,
  formatPaymentMethod
} from '../utils/calendarUtils';

interface BookingDetailsModalProps {
  booking: Booking | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (booking: Booking) => void;
  onStatusChange: (bookingId: string, newStatus: BookingStatus) => void;
  onUpdateAdminNotes: (bookingId: string, notes: string) => void;
  onDelete: (bookingId: string) => void;
  onSendReminder?: (booking: Booking) => void;
  currentUser?: User | null;
}

export const BookingDetailsModal: React.FC<BookingDetailsModalProps> = ({
  booking,
  isOpen,
  onClose,
  onEdit,
  onStatusChange,
  onUpdateAdminNotes,
  onDelete,
  onSendReminder,
  currentUser
}) => {
  if (!isOpen || !booking) return null;

  const room = getRoomById(booking.roomId);
  const [adminNotes, setAdminNotes] = useState(booking.adminNotes || '');
  const [isEditingNotes, setIsEditingNotes] = useState(false);
  const [showEmailPreview, setShowEmailPreview] = useState(false);
  const [isSendingReminder, setIsSendingReminder] = useState(false);
  const [reminderSent, setReminderSent] = useState(false);

  const isAdmin = currentUser?.role === 'ADMIN';
  const isOwner = !!currentUser && (
    (Boolean(booking.userId) && booking.userId === currentUser.id) ||
    (Boolean(booking.customerEmail) && Boolean(currentUser.email) && booking.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
  );
  const canManage = isAdmin || isOwner;

  const emailSim = createEmailSimulation(booking, room ? room.name : 'Wybrana sala');

  const handleSaveNotes = () => {
    onUpdateAdminNotes(booking.id, adminNotes);
    setIsEditingNotes(false);
  };

  const handleSendReminderClick = async () => {
    setIsSendingReminder(true);
    try {
      if (onSendReminder) {
        await onSendReminder(booking);
      } else {
        await ApiService.sendReminder(booking.id);
      }
      setReminderSent(true);
      setTimeout(() => setReminderSent(false), 4500);
    } catch (e: any) {
      alert(e.message || 'Błąd wysyłania przypomnienia');
    } finally {
      setIsSendingReminder(false);
    }
  };

  const handleDeleteClick = () => {
    if (window.confirm(`Czy na pewno chcesz bezpowrotnie usunąć rezerwację "${booking.title}"?`)) {
      onDelete(booking.id);
    }
  };

  const getStatusBadge = (status: BookingStatus) => {
    switch (status) {
      case 'confirmed':
        return (
          <span className="status-pill status-confirmed">
            <CheckCircle2 size={12} /> Potwierdzona
          </span>
        );
      case 'cancelled':
        return (
          <span className="status-pill status-cancelled">
            <XCircle size={12} /> Anulowana
          </span>
        );
    }
  };

  const maskedEmail = canManage
    ? booking.customerEmail
    : booking.customerEmail.replace(/^(.)(.*)(@.*)$/, (_, first, _middle, domain) => `${first}***${domain}`);

  const maskedPhone = canManage
    ? booking.customerPhone
    : '+48 ••• ••• ••• (zastrzeżony)';

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span className="booking-ref-badge">{booking.code}</span>
            {getStatusBadge(booking.status)}
            {isOwner && !isAdmin && (
              <span className="status-pill status-confirmed" style={{ fontSize: '0.72rem' }}>
                <UserCheck size={12} /> Twoja rezerwacja
              </span>
            )}
            {!canManage && (
              <span
                className="status-pill"
                style={{
                  background: 'rgba(59, 130, 246, 0.15)',
                  color: '#60a5fa',
                  borderColor: 'rgba(59, 130, 246, 0.3)',
                  fontSize: '0.72rem'
                }}
              >
                <Eye size={12} /> Tylko wgląd
              </span>
            )}
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <div className="modal-body">
          {!canManage && (
            <div
              style={{
                background: 'rgba(59, 130, 246, 0.08)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                fontSize: '0.84rem',
                color: '#93c5fd'
              }}
            >
              <Eye size={20} style={{ flexShrink: 0, color: '#60a5fa' }} />
              <div>
                <strong style={{ color: '#bfdbfe' }}>Tryb informacyjny (Wgląd w harmonogram)</strong>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                  Ta rezerwacja należy do innego użytkownika. Masz do niej wyłącznie wgląd w harmonogramie sal — anulowanie i edycja są zastrzeżone dla autora.
                </div>
              </div>
            </div>
          )}

          <div>
            <h2 style={{ fontSize: '1.35rem', marginBottom: '6px' }}>{booking.title}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              <span
                style={{
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: room?.color || '#6366f1'
                }}
              ></span>
              <strong style={{ color: 'var(--text-main)' }}>{room?.name}</strong>
              <span>({room?.floor})</span>
            </div>
          </div>

          <div className="cost-summary-card">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-main)', fontWeight: 600 }}>
                <Clock size={16} color="var(--primary)" />
                <span>{formatFullDateTimeRange(booking.start, booking.end)}</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                <Users size={14} />
                <span>Liczba uczestników: {booking.attendeesCount} osób</span>
              </div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Łączna kwota:</div>
              <div className="cost-amount">{booking.totalCost} PLN</div>
            </div>
          </div>

          <div
            style={{
              background: booking.paymentStatus === 'invoice_b2b' ? 'rgba(245, 158, 11, 0.08)' : 'rgba(16, 185, 129, 0.08)',
              border: `1px solid ${booking.paymentStatus === 'invoice_b2b' ? 'rgba(245, 158, 11, 0.25)' : 'rgba(16, 185, 129, 0.25)'}`,
              borderRadius: 'var(--radius-sm)',
              padding: '8px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.8rem',
              flexWrap: 'wrap',
              gap: '6px'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <CreditCard size={15} color={booking.paymentStatus === 'invoice_b2b' ? '#f59e0b' : 'var(--emerald)'} />
              <span>
                Status płatności:{' '}
                <strong style={{ color: booking.paymentStatus === 'invoice_b2b' ? '#f59e0b' : 'var(--emerald)' }}>
                  {booking.paymentStatus === 'invoice_b2b' ? 'Faktura B2B (termin 14 dni)' : 'Opłacono online (100%)'}
                </strong>
              </span>
            </div>

            <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontFamily: 'monospace' }}>
              {formatPaymentMethod(booking.paymentMethod)} {booking.transactionId ? `• ${booking.transactionId}` : ''}
            </div>
          </div>

          <div style={{ background: 'var(--bg-subtle)', padding: '16px', borderRadius: 'var(--radius-md)' }}>
            <div style={{ fontSize: '0.82rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-dim)', marginBottom: '10px' }}>
              Dane osoby rezerwującej
            </div>
            <div className="form-grid">
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Imię i nazwisko:</div>
                <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{booking.customerName}</div>
              </div>
              {booking.companyName && (
                <div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Firma:</div>
                  <div style={{ fontWeight: 600, color: 'var(--text-main)' }}>{booking.companyName}</div>
                </div>
              )}
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Adres e-mail:</div>
                <div style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Mail size={12} color="var(--primary)" /> {maskedEmail}
                </div>
              </div>
              <div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Telefon:</div>
                <div style={{ color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <Phone size={12} color="var(--emerald)" /> {maskedPhone}
                </div>
              </div>
            </div>
          </div>

          {booking.notes && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '4px' }}>
                Notatki i prośby klienta:
              </div>
              <div style={{ background: 'var(--bg-input)', padding: '12px 14px', borderRadius: 'var(--radius-sm)', fontSize: '0.84rem', color: 'var(--text-main)', fontStyle: 'italic', borderLeft: '3px solid var(--primary)' }}>
                "{booking.notes}"
              </div>
            </div>
          )}

          {booking.selectedEquipment && booking.selectedEquipment.length > 0 && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '6px' }}>
                Wybrane wyposażenie:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {booking.selectedEquipment.map(eq => (
                  <span key={eq} className="equipment-chip" style={{ cursor: 'default' }}>
                    {eq}
                  </span>
                ))}
              </div>
            </div>
          )}

          {isAdmin && (
            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                <div style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <MessageSquare size={14} color="var(--amber)" /> Wewnętrzne notatki administracyjne
                </div>
                {!isEditingNotes && (
                  <button
                    type="button"
                    style={{ background: 'none', border: 'none', color: 'var(--primary)', cursor: 'pointer', fontSize: '0.78rem', fontWeight: 600 }}
                    onClick={() => setIsEditingNotes(true)}
                  >
                    Edytuj notatki
                  </button>
                )}
              </div>

              {isEditingNotes ? (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <textarea
                    className="form-textarea"
                    value={adminNotes}
                    onChange={e => setAdminNotes(e.target.value)}
                    placeholder="Wpisz wewnętrzne instrukcje dla recepcji lub techników..."
                  />
                  <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                    <button type="button" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={() => setIsEditingNotes(false)}>
                      Anuluj
                    </button>
                    <button type="button" className="btn-primary" style={{ padding: '6px 12px', fontSize: '0.78rem' }} onClick={handleSaveNotes}>
                      Zapisz notatkę
                    </button>
                  </div>
                </div>
              ) : (
                <div style={{ fontSize: '0.82rem', color: adminNotes ? 'var(--text-main)' : 'var(--text-dim)', background: 'var(--bg-input)', padding: '10px 12px', borderRadius: 'var(--radius-sm)' }}>
                  {adminNotes || 'Brak wewnętrznych notatek. Kliknij "Edytuj notatki", aby dodać uwagi dla personelu.'}
                </div>
              )}
            </div>
          )}

          {isOwner && !isAdmin && booking.status === 'confirmed' && (
            <div
              style={{
                background: 'rgba(245, 158, 11, 0.08)',
                border: '1px solid rgba(245, 158, 11, 0.28)',
                borderRadius: 'var(--radius-md)',
                padding: '12px 14px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                gap: '12px',
                flexWrap: 'wrap'
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div
                  style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'rgba(245, 158, 11, 0.2)',
                    color: '#f59e0b',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}
                >
                  <Bell size={16} />
                </div>
                <div>
                  <div style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text-main)' }}>
                    Powiadomienie i przypomnienie e-mail
                  </div>
                  <div style={{ fontSize: '0.76rem', color: 'var(--text-muted)' }}>
                    Wyślij e-mail z przypomnieniem o zbliżającym się wydarzeniu, kodzie dostępu i wskazówkach
                  </div>
                </div>
              </div>

              <button
                type="button"
                className="btn-secondary"
                style={{
                  padding: '7px 13px',
                  fontSize: '0.79rem',
                  borderColor: reminderSent ? 'var(--emerald)' : 'rgba(245, 158, 11, 0.4)',
                  color: reminderSent ? 'var(--emerald)' : '#f59e0b',
                  whiteSpace: 'nowrap',
                  gap: '6px'
                }}
                disabled={isSendingReminder}
                onClick={handleSendReminderClick}
              >
                <Bell size={13} />
                {reminderSent ? '✓ Wysłano przypomnienie!' : isSendingReminder ? 'Wysyłanie...' : 'Wyślij przypomnienie'}
              </button>
            </div>
          )}

          {isAdmin && (
            <div>
              <button
                type="button"
                className="btn-secondary"
                style={{ width: '100%', justifyContent: 'center' }}
                onClick={() => setShowEmailPreview(!showEmailPreview)}
              >
                <Send size={15} />
                {showEmailPreview ? 'Ukryj podgląd wysłanego powiadomienia e-mail' : 'Podgląd automatycznego e-maila do klienta'}
              </button>

              {showEmailPreview && (
                <div className="email-preview-box animate-fade-in" style={{ marginTop: '10px' }}>
                  <div className="email-header-row">
                    <div><strong>Odbiorca:</strong> {emailSim.recipient} &lt;{emailSim.to}&gt;</div>
                    <div><strong>Status:</strong> Wysłano automatycznie</div>
                  </div>
                  <div style={{ marginBottom: '8px' }}>
                    <strong>Temat:</strong> {emailSim.subject}
                  </div>
                  <div style={{ lineHeight: 1.6 }}>
                    Dzień dobry {emailSim.recipient},<br />
                    Twoja rezerwacja w <strong>Gdańsk Business Hub</strong> została zarejestrowana z kodem: <strong>{emailSim.code}</strong>.<br />
                    <strong>Przestrzeń:</strong> {emailSim.roomName}<br />
                    <strong>Termin:</strong> {emailSim.dateRange}<br />
                    <strong>Szacowany koszt:</strong> {emailSim.cost} PLN<br />
                    W załączniku przesyłamy bilet i potwierdzenie rezerwacji w formacie PDF (.pdf).
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="modal-footer" style={{ justifyContent: 'space-between' }}>
          {canManage ? (
            <>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                {booking.status === 'confirmed' ? (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ borderColor: 'var(--rose)', color: 'var(--rose)' }}
                    onClick={() => onStatusChange(booking.id, 'cancelled')}
                  >
                    <XCircle size={14} /> Anuluj rezerwację
                  </button>
                ) : (
                  <button
                    type="button"
                    className="btn-secondary"
                    style={{ borderColor: 'var(--emerald)', color: 'var(--emerald)' }}
                    onClick={() => onStatusChange(booking.id, 'confirmed')}
                  >
                    <CheckCircle2 size={14} /> Przywróć rezerwację
                  </button>
                )}
                {isAdmin && (
                  <button
                    type="button"
                    className="action-btn danger"
                    title="Usuń trwale rezerwację"
                    style={{ width: '36px', height: '36px' }}
                    onClick={handleDeleteClick}
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  title="Pobierz bilet i potwierdzenie w formacie PDF"
                  onClick={() => downloadPdfConfirmation(booking, room ? room.name : 'Sala')}
                >
                  <Download size={15} /> PDF
                </button>

                <button
                  type="button"
                  className="btn-secondary"
                  title="Pobierz plik iCalendar (.ics) dla Outlook / Apple / Smartfona"
                  onClick={() => downloadIcsFile(booking, room ? room.name : 'Sala')}
                  style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <CalendarIcon size={14} /> .ics
                </button>

                <a
                  href={getGoogleCalendarUrl(booking, room ? room.name : 'Sala')}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-secondary"
                  title="Otwórz i dodaj termin do Google Kalendarza"
                  style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                >
                  <CalendarIcon size={14} color="#4285F4" /> Google Kalendarz
                </a>

                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => {
                    onClose();
                    onEdit(booking);
                  }}
                >
                  <Edit3 size={15} /> Edytuj
                </button>
              </div>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock size={14} color="var(--text-dim)" /> Zarządzanie rezerwacją zastrzeżone dla autora
              </div>
              <button
                type="button"
                className="btn-primary"
                onClick={onClose}
              >
                Zamknij
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
