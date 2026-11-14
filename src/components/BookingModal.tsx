import React, { useState, useEffect, useMemo } from 'react';
import { X, Calendar, Clock, MapPin, Users, Mail, Phone, AlertTriangle, CheckCircle, FileText, Sparkles, CreditCard } from 'lucide-react';
import type { Booking, BookingFormData, User } from '../types';
import { ROOMS, getRoomById } from '../data/mockRooms';
import { checkBookingCollision, calculateTotalCost, calculateDurationHours } from '../utils/calendarUtils';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (bookingData: BookingFormData, existingBookingId?: string) => void;
  initialSlot?: { start: string; end: string; roomId?: string } | null;
  existingBooking?: Booking | null;
  bookings: Booking[];
  currentUser?: User | null;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialSlot,
  existingBooking,
  bookings,
  currentUser
}) => {
  if (!isOpen) return null;

  const [title, setTitle] = useState('');
  const [roomId, setRoomId] = useState(ROOMS[0].id);
  const [customerName, setCustomerName] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [date, setDate] = useState('');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('12:00');
  const [attendeesCount, setAttendeesCount] = useState(2);
  const [notes, setNotes] = useState('');
  const [selectedEquipment, setSelectedEquipment] = useState<string[]>([]);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    if (existingBooking) {
      setTitle(existingBooking.title);
      setRoomId(existingBooking.roomId);
      setCustomerName(existingBooking.customerName);
      setCustomerEmail(existingBooking.customerEmail);
      setCustomerPhone(existingBooking.customerPhone);
      setCompanyName(existingBooking.companyName || '');

      const startD = new Date(existingBooking.start);
      const endD = new Date(existingBooking.end);

      const yyyy = startD.getFullYear();
      const mm = String(startD.getMonth() + 1).padStart(2, '0');
      const dd = String(startD.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);

      const sh = String(startD.getHours()).padStart(2, '0');
      const sm = String(startD.getMinutes()).padStart(2, '0');
      setStartTime(`${sh}:${sm}`);

      const eh = String(endD.getHours()).padStart(2, '0');
      const em = String(endD.getMinutes()).padStart(2, '0');
      setEndTime(`${eh}:${em}`);

      const targetRoom = getRoomById(existingBooking.roomId) || ROOMS[0];
      setAttendeesCount(Math.min(existingBooking.attendeesCount, targetRoom.capacity));
      setNotes(existingBooking.notes || '');
      setSelectedEquipment(existingBooking.selectedEquipment || []);
    } else if (initialSlot) {
      setTitle('Nowe spotkanie');
      const targetRoomId = initialSlot.roomId || ROOMS[0].id;
      setRoomId(targetRoomId);

      const startD = new Date(initialSlot.start);
      const endD = new Date(initialSlot.end);

      const yyyy = startD.getFullYear();
      const mm = String(startD.getMonth() + 1).padStart(2, '0');
      const dd = String(startD.getDate()).padStart(2, '0');
      setDate(`${yyyy}-${mm}-${dd}`);

      const sh = String(startD.getHours()).padStart(2, '0');
      const sm = String(startD.getMinutes()).padStart(2, '0');
      setStartTime(`${sh}:${sm}`);

      if (endD.getTime() <= startD.getTime() || (startD.getHours() === 0 && endD.getHours() === 0)) {
        setStartTime('10:00');
        setEndTime('12:00');
      } else {
        const eh = String(endD.getHours()).padStart(2, '0');
        const em = String(endD.getMinutes()).padStart(2, '0');
        setEndTime(`${eh}:${em}`);
      }
      const targetRoom = getRoomById(targetRoomId) || ROOMS[0];
      setAttendeesCount(Math.min(2, targetRoom.capacity));
      setSelectedEquipment([]);
    } else {
      const now = new Date();
      const nextHour = now.getHours() + 1;
      let slotDate = now;
      let startH = nextHour;

      if (nextHour > 20) {
        slotDate = new Date(now);
        slotDate.setDate(slotDate.getDate() + 1);
        startH = 10;
      } else {
        startH = Math.max(nextHour, 8);
      }
      const endH = Math.min(startH + 2, 21);
      const yyyy = slotDate.getFullYear();
      const mm = String(slotDate.getMonth() + 1).padStart(2, '0');
      const dd = String(slotDate.getDate()).padStart(2, '0');

      setDate(`${yyyy}-${mm}-${dd}`);
      setStartTime(`${String(startH).padStart(2, '0')}:00`);
      setEndTime(`${String(endH).padStart(2, '0')}:00`);
      setTitle('');
      setAttendeesCount(Math.min(2, ROOMS[0].capacity));
      setSelectedEquipment([]);
    }

    if (!existingBooking && currentUser) {
      setCustomerName(currentUser.name || '');
      setCustomerEmail(currentUser.email || '');
      if (currentUser.phone) setCustomerPhone(currentUser.phone);
      if (currentUser.companyName) setCompanyName(currentUser.companyName);
    }
  }, [existingBooking, initialSlot, currentUser]);

  const currentRoom = getRoomById(roomId) || ROOMS[0];

  const isOverCapacity = attendeesCount > currentRoom.capacity;
  const isAttendeesInvalid = attendeesCount < 1;

  const handleRoomChange = (newRoomId: string) => {
    setRoomId(newRoomId);
    const targetRoom = getRoomById(newRoomId) || ROOMS[0];
    if (attendeesCount > targetRoom.capacity) {
      setAttendeesCount(targetRoom.capacity);
    }
  };

  const todayStr = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  }, []);

  const isTimePast = useMemo(() => {
    if (!date || !startTime) return false;
    const proposedStart = new Date(`${date}T${startTime}:00`).getTime();
    return proposedStart < Date.now();
  }, [date, startTime]);

  const constructedStartIso = `${date}T${startTime}:00`;
  const constructedEndIso = `${date}T${endTime}:00`;

  const collisionResult = useMemo(() => {
    if (!date || !startTime || !endTime) return { hasCollision: false };
    return checkBookingCollision(
      roomId,
      constructedStartIso,
      constructedEndIso,
      bookings,
      existingBooking?.id
    );
  }, [roomId, constructedStartIso, constructedEndIso, bookings, existingBooking]);

  const durationHours = calculateDurationHours(constructedStartIso, constructedEndIso);
  const estimatedCost = calculateTotalCost(currentRoom.hourlyRate, constructedStartIso, constructedEndIso);

  const toggleEquipment = (item: string) => {
    setSelectedEquipment(prev =>
      prev.includes(item) ? prev.filter(i => i !== item) : [...prev, item]
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!currentUser) {
      setFormError('Wymagane logowanie: Aby utworzyć rezerwację, musisz być zalogowany.');
      return;
    }

    if (!title.trim()) {
      setFormError('Podaj tytuł spotkania lub rezerwacji.');
      return;
    }
    if (!customerName.trim()) {
      setFormError('Podaj imię i nazwisko osoby rezerwującej.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setFormError('Podaj prawidłowy adres e-mail do wysłania potwierdzenia.');
      return;
    }
    if (!customerPhone.trim()) {
      setFormError('Podaj numer telefonu kontaktowego.');
      return;
    }
    if (startTime >= endTime) {
      setFormError('Godzina zakończenia musi być późniejsza niż godzina rozpoczęcia.');
      return;
    }
    if (!attendeesCount || attendeesCount < 1) {
      setFormError('Liczba uczestników musi wynosić co najmniej 1 osobę.');
      return;
    }
    if (attendeesCount > currentRoom.capacity) {
      setFormError(
        `Liczba uczestników (${attendeesCount}) przekracza maksymalny limit sali "${currentRoom.name}" (${currentRoom.capacity} ${
          currentRoom.capacity === 1 ? 'osoba' : currentRoom.capacity < 5 ? 'osoby' : 'osób'
        })! Zmniejsz liczbę osób do limitu sali lub wybierz większą przestrzeń.`
      );
      return;
    }
    const proposedStart = new Date(`${date}T${startTime}:00`);
    if (proposedStart.getTime() < Date.now()) {
      if (date < todayStr) {
        setFormError('Nie można zarezerwować terminu przed dzisiejszym dniem (ten dzień już minął).');
      } else {
        setFormError(`Wybrana godzina rozpoczęcia (${startTime}) już upłynęła! Wybierz przyszłą godzinę.`);
      }
      return;
    }
    if (collisionResult.hasCollision) {
      setFormError('Wybrany termin jest już zajęty! Proszę wybrać inną godzinę lub inną salę.');
      return;
    }

    const bookingData: BookingFormData = {
      title,
      roomId,
      customerName,
      customerEmail,
      customerPhone,
      companyName,
      date,
      startTime,
      endTime,
      attendeesCount,
      notes,
      selectedEquipment
    };

    onSubmit(bookingData, existingBooking?.id);
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-dialog" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '10px',
                background: currentRoom.bgColor,
                border: `1px solid ${currentRoom.borderColor}`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: currentRoom.color
              }}
            >
              <Calendar size={20} />
            </div>
            <div>
              <h2>{existingBooking ? 'Edycja Rezerwacji' : 'Nowa Rezerwacja Przestrzeni'}</h2>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Wypełnij szczegóły, aby zarezerwować przestrzeń w Gdańsk Business Hub
              </p>
            </div>
          </div>
          <button type="button" className="modal-close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0 }}>
          <div className="modal-body">
            {!currentUser && (
              <div className="collision-banner" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'var(--rose)' }}>
                <AlertTriangle size={20} color="var(--rose)" />
                <div>
                  <strong style={{ color: 'var(--rose)' }}>Wymagane logowanie</strong>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    Tylko zarejestrowani i zalogowani użytkownicy mogą rezerwować sale. Zaloguj się na swoje konto.
                  </div>
                </div>
              </div>
            )}

            {formError && (
              <div className="collision-banner">
                <AlertTriangle size={20} />
                <span>{formError}</span>
              </div>
            )}

            {isTimePast ? (
              <div className="collision-banner" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: 'var(--rose)' }}>
                <AlertTriangle size={20} color="var(--rose)" />
                <div>
                  <strong style={{ color: 'var(--rose)' }}>
                    {date < todayStr ? 'Wybrany dzień już minął!' : 'Wybrana godzina już upłynęła!'}
                  </strong>
                  <div style={{ fontSize: '0.78rem', marginTop: '2px', color: 'var(--text-muted)' }}>
                    {date < todayStr
                      ? `Nie można rezerwować terminów w przeszłości. Wybierz datę od dzisiaj (${todayStr}) wprzód.`
                      : `Godzina ${startTime} dla dnia dzisiejszego już upłynęła. Wybierz późniejszą godzinę.`}
                  </div>
                </div>
              </div>
            ) : collisionResult.hasCollision ? (
              <div className="collision-banner">
                <AlertTriangle size={20} />
                <div>
                  <strong>Termin niedostępny!</strong>
                  <div style={{ fontSize: '0.78rem', marginTop: '2px' }}>
                    Wybrana sala w tych godzinach koliduje z inną rezerwacją ({collisionResult.conflictingBooking?.title}). Zmień godzinę lub wybierz inną salę.
                  </div>
                </div>
              </div>
            ) : isOverCapacity ? (
              <div className="collision-banner" style={{ background: 'rgba(239, 68, 68, 0.12)', borderColor: '#ef4444', color: '#fca5a5' }}>
                <AlertTriangle size={20} color="#ef4444" style={{ flexShrink: 0 }} />
                <div>
                  <strong style={{ color: '#ef4444' }}>Przekroczono limit osób na sali!</strong>
                  <div style={{ fontSize: '0.78rem', marginTop: '2px', color: 'var(--text-muted)' }}>
                    Maksymalna pojemność sali &quot;{currentRoom.name}&quot; wynosi <strong>{currentRoom.capacity} {currentRoom.capacity === 1 ? 'osobę' : currentRoom.capacity < 5 ? 'osoby' : 'osób'}</strong>. Wprowadzona liczba uczestników: <strong>{attendeesCount}</strong>.
                  </div>
                </div>
              </div>
            ) : (
              <div className="available-banner">
                <CheckCircle size={18} />
                <span>Wybrana przestrzeń jest <strong>dostępna</strong> w tym terminie.</span>
              </div>
            )}

            <div className="form-group">
              <label className="form-label">
                <MapPin size={14} /> Wybierz salę / przestrzeń
              </label>
              <select
                className="form-select"
                value={roomId}
                onChange={e => handleRoomChange(e.target.value)}
              >
                {ROOMS.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.name} — maks. {r.capacity} os. ({r.hourlyRate} zł/h) • {r.floor}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">
                <FileText size={14} /> Tytuł rezerwacji / Nazwa spotkania *
              </label>
              <input
                type="text"
                className="form-input"
                placeholder="np. Warsztaty strategiczne, Spotkanie z klientem"
                value={title}
                onChange={e => setTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-grid">
              <div className="form-group">
                <label className="form-label">
                  <Calendar size={14} /> Data rezerwacji *
                </label>
                <input
                  type="date"
                  className="form-input"
                  min={todayStr}
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <Users size={14} /> Liczba uczestników *
                  </span>
                  <span style={{
                    fontSize: '0.78rem',
                    fontWeight: isOverCapacity ? 700 : 500,
                    color: isOverCapacity ? '#ef4444' : 'var(--color-text-muted)'
                  }}>
                    Maks. {currentRoom.capacity} {currentRoom.capacity === 1 ? 'osoba' : currentRoom.capacity < 5 ? 'osoby' : 'osób'}
                  </span>
                </label>
                <input
                  type="number"
                  min="1"
                  max={currentRoom.capacity}
                  className={`form-input ${isOverCapacity ? 'input-error' : ''}`}
                  value={attendeesCount === 0 ? '' : attendeesCount}
                  onChange={e => {
                    const raw = e.target.value;
                    if (raw === '') {
                      setAttendeesCount(0);
                    } else {
                      const val = parseInt(raw, 10);
                      setAttendeesCount(isNaN(val) ? 0 : val);
                    }
                  }}
                  onBlur={() => {
                    if (attendeesCount < 1) {
                      setAttendeesCount(1);
                    } else if (attendeesCount > currentRoom.capacity) {
                      setAttendeesCount(currentRoom.capacity);
                    }
                  }}
                  required
                />
                {isOverCapacity && (
                  <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>Liczba osób ({attendeesCount}) przekracza maksymalny limit sali ({currentRoom.capacity} os.)!</span>
                  </div>
                )}
                {isAttendeesInvalid && attendeesCount !== 0 && (
                  <div style={{ color: '#ef4444', fontSize: '0.78rem', marginTop: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                    <AlertTriangle size={13} style={{ flexShrink: 0 }} />
                    <span>Wymagany co najmniej 1 uczestnik.</span>
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} /> Godzina rozpoczęcia *
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={startTime}
                  onChange={e => setStartTime(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">
                  <Clock size={14} /> Godzina zakończenia *
                </label>
                <input
                  type="time"
                  className="form-input"
                  value={endTime}
                  onChange={e => setEndTime(e.target.value)}
                  required
                />
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>
              <div style={{ fontSize: '0.85rem', fontWeight: 700, marginBottom: '12px', color: 'var(--text-main)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Users size={16} /> Dane rezerwującego
              </div>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Imię i nazwisko *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="np. Anna Nowak"
                    value={customerName}
                    onChange={e => setCustomerName(e.target.value)}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Firma / Organizacja (opcjonalnie)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="np. Acme Corp"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Mail size={14} /> E-mail (do powiadomień) *
                    </span>
                    {currentUser && currentUser.role !== 'ADMIN' && (
                      <span style={{ fontSize: '0.68rem', color: 'var(--primary)', fontWeight: 600 }}>Twoje konto</span>
                    )}
                  </label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="anna.nowak@example.com"
                    value={customerEmail}
                    onChange={e => setCustomerEmail(e.target.value)}
                    readOnly={Boolean(currentUser && currentUser.role !== 'ADMIN')}
                    style={currentUser && currentUser.role !== 'ADMIN' ? { opacity: 0.85, cursor: 'not-allowed' } : {}}
                    required
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">
                    <Phone size={14} /> Telefon kontaktowy *
                  </label>
                  <input
                    type="tel"
                    className="form-input"
                    placeholder="+48 600 000 000"
                    value={customerPhone}
                    onChange={e => setCustomerPhone(e.target.value)}
                    required
                  />
                </div>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">
                <Sparkles size={14} /> Wyposażenie i udogodnienia w cenie
              </label>
              <div className="equipment-grid">
                {currentRoom.equipment.map(eq => {
                  const isSelected = selectedEquipment.includes(eq);
                  return (
                    <div
                      key={eq}
                      className={`equipment-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleEquipment(eq)}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {}}
                        style={{ cursor: 'pointer' }}
                      />
                      <span>{eq}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Uwagi i notatki do rezerwacji</label>
              <textarea
                className="form-textarea"
                placeholder="np. Prośba o układ krzeseł w podkowę, dodatkowy kabel HDMI..."
                value={notes}
                onChange={e => setNotes(e.target.value)}
              />
            </div>

            <div className="cost-summary-card">
              <div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                  Szacowany koszt wynajmu ({durationHours} godz. x {currentRoom.hourlyRate} zł/h):
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                  W tym dostęp do strefy kuchennej i superszybkiego Wi-Fi
                </div>
              </div>
              <div className="cost-amount">
                {estimatedCost} PLN
              </div>
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Anuluj
            </button>
            <button
              type="submit"
              className="btn-primary"
              disabled={!currentUser || collisionResult.hasCollision || isTimePast || isOverCapacity || isAttendeesInvalid}
              style={(!currentUser || collisionResult.hasCollision || isTimePast || isOverCapacity || isAttendeesInvalid) ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
            >
              {existingBooking ? (
                'Zapisz zmiany'
              ) : (
                <>
                  <CreditCard size={15} /> Przejdź do płatności ({estimatedCost} PLN)
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
