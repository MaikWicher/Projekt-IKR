import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { RoomFilterBar } from './components/RoomFilterBar';
import { CalendarView } from './components/CalendarView';
import { AdminDashboard } from './components/AdminDashboard';
import { BookingModal } from './components/BookingModal';
import { BookingDetailsModal } from './components/BookingDetailsModal';
import { ConfirmationModal } from './components/ConfirmationModal';
import { ToastContainer } from './components/ToastContainer';
import { LoginModal } from './components/LoginModal';
import { PaymentModal } from './components/PaymentModal';
import { Shield, Bell, X } from 'lucide-react';
import type { Booking, BookingFormData, BookingStatus, ToastMessage, User, PaymentMethod, PaymentStatus } from './types';
import { loadStoredBookings, saveStoredBookings, resetBookingsStorage } from './data/seedBookings';
import { getRoomById } from './data/mockRooms';
import { RoomsCatalogView } from './components/RoomsCatalogView';
import { calculateTotalCost, formatFullDateTimeRange } from './utils/calendarUtils';
import { ApiService } from './services/api';
import './App.css';

export const App: React.FC = () => {
  const urlParams = typeof window !== 'undefined' ? new URLSearchParams(window.location.search) : null;

  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const t = urlParams?.get('theme');
    if (t === 'light' || t === 'dark') return t;
    return (localStorage.getItem('cowork_theme') as 'dark' | 'light') || 'dark';
  });

  const [currentUser, setCurrentUser] = useState<User | null>(() => {
    if (urlParams?.get('as') === 'admin') {
      return {
        id: 'admin-1',
        email: 'admin@gdanskhub.pl',
        name: 'Administrator Hub',
        role: 'ADMIN'
      };
    }
    if (urlParams?.get('as') === 'client' || urlParams?.get('as') === 'user') {
      return {
        id: 'user-client',
        email: 'klient@gdanskhub.pl',
        name: 'Jan Kowalski',
        role: 'CLIENT',
        companyName: 'Kowalski Dev Studio',
        phone: '+48 600 123 456'
      };
    }
    return ApiService.getStoredUser();
  });
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);

  const [currentMode, setCurrentMode] = useState<'calendar' | 'rooms' | 'admin'>(() => {
    const m = urlParams?.get('mode');
    if (m === 'admin' || m === 'rooms') return m;
    return 'calendar';
  });

  const [selectedRoomId, setSelectedRoomId] = useState<string>('all');
  const [onlyMyBookings, setOnlyMyBookings] = useState<boolean>(false);

  const [bookings, setBookings] = useState<Booking[]>(() => loadStoredBookings());

  const [isBookingModalOpen, setIsBookingModalOpen] = useState(() => urlParams?.get('modal') === 'booking');
  const [initialSlot, setInitialSlot] = useState<{ start: string; end: string; roomId?: string } | null>(null);
  const [editingBooking, setEditingBooking] = useState<Booking | null>(null);

  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(() => {
    if (urlParams?.get('modal') === 'details') {
      const stored = loadStoredBookings();
      if (urlParams?.get('as') === 'client' || urlParams?.get('as') === 'user') {
        const myBooking = stored.find(b => b.userId === 'user-client' || b.customerEmail === 'klient@gdanskhub.pl');
        if (myBooking) return myBooking;
      }
      return stored[0] || null;
    }
    return null;
  });
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(() => urlParams?.get('modal') === 'details');

  const [confirmedBooking, setConfirmedBooking] = useState<Booking | null>(() => {
    if (urlParams?.get('modal') === 'confirmation') {
      const stored = loadStoredBookings();
      return stored[0] || null;
    }
    return null;
  });
  const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(() => urlParams?.get('modal') === 'confirmation');

  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(() => urlParams?.get('modal') === 'payment');
  const [pendingBookingData, setPendingBookingData] = useState<BookingFormData | null>(() => {
    if (urlParams?.get('modal') === 'payment') {
      const isClient = urlParams?.get('as') === 'client' || urlParams?.get('as') === 'user';
      return {
        title: isClient ? 'Rezerwacja Hotdesk: Sprint 14' : 'Spotkanie projektowe architektów',
        roomId: isClient ? 'room-hotdesk' : 'room-kreatywna',
        customerName: isClient ? 'Jan Kowalski' : 'Maik Wicher',
        customerEmail: isClient ? 'klient@gdanskhub.pl' : 'maik.wicher@gdanskhub.pl',
        customerPhone: '+48 600 123 456',
        companyName: isClient ? 'Kowalski Dev Studio' : 'Wicher Tech Solutions',
        date: '2026-11-12',
        startTime: '10:00',
        endTime: '12:00',
        attendeesCount: isClient ? 1 : 6,
        notes: isClient ? 'Stanowisko z dodatkowym monitorem.' : 'Przygotować salę do wideokonferencji z zespołem w Gdańsku.',
        selectedEquipment: isClient ? ['Monitor 27" Dell 4K USB-C'] : ['Ekran interaktywny 65" Touch', 'Wideobar 4K Logitech MeetUp'],
        paymentMethod: 'blik',
        paymentStatus: 'paid'
      };
    }
    return null;
  });
  const [pendingBookingCost, setPendingBookingCost] = useState(() => {
    if (urlParams?.get('modal') === 'payment') {
      const isClient = urlParams?.get('as') === 'client' || urlParams?.get('as') === 'user';
      return isClient ? 70 : 190;
    }
    return 0;
  });

  const [hasDismissedLoginReminder, setHasDismissedLoginReminder] = useState<boolean>(() => {
    return sessionStorage.getItem('login_reminder_dismissed') === 'true';
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('cowork_theme', theme);
  }, [theme]);

  useEffect(() => {
    let isMounted = true;
    const syncWithBackend = async () => {
      const online = await ApiService.checkHealth();
      if (!isMounted || !online) return;
      try {
        const remoteBookings = await ApiService.getBookings();
        if (remoteBookings && remoteBookings.length > 0 && isMounted) {
          setBookings(remoteBookings);
        }
      } catch (e) {
        console.warn('Błąd synchronizacji z API:', e);
      }
    };

    syncWithBackend();
    const interval = setInterval(syncWithBackend, 15000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, []);

  const updateBookings = (newBookings: Booking[]) => {
    setBookings(newBookings);
    saveStoredBookings(newBookings);
  };

  const addToast = (type: ToastMessage['type'], title: string, message: string) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { id, type, title, message }]);

    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4500);
  };

  const dismissToast = (id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  };

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setHasDismissedLoginReminder(false);
    sessionStorage.removeItem('login_reminder_dismissed');

    addToast(
      'success',
      'Zalogowano pomyślnie',
      `Witaj, ${user.name}!`
    );
  };

  const handleLogout = () => {
    ApiService.clearSession();
    setCurrentUser(null);
    setOnlyMyBookings(false);
    setHasDismissedLoginReminder(false);
    sessionStorage.removeItem('login_reminder_dismissed');
    if (currentMode === 'admin') {
      setCurrentMode('calendar');
    }
    addToast('info', 'Wylogowano', 'Zostałeś pomyślnie wylogowany z systemu.');
  };

  const handleSelectSlot = (startIso: string, endIso: string) => {
    if (!currentUser) {
      addToast('warning', 'Wymagane logowanie', 'Aby zarezerwować salę, musisz być zalogowany.');
      setIsLoginModalOpen(true);
      return;
    }

    const slotStart = new Date(startIso);

    if (slotStart.getTime() < Date.now()) {
      addToast('error', 'Termin niedostępny', 'Nie można zarezerwować terminu na godzinę, która już upłynęła.');
      return;
    }

    setEditingBooking(null);
    setInitialSlot({
      start: startIso,
      end: endIso,
      roomId: selectedRoomId !== 'all' ? selectedRoomId : undefined
    });
    setIsBookingModalOpen(true);
  };

  const handleOpenNewBooking = (presetRoomId?: string) => {
    if (!currentUser) {
      addToast('warning', 'Wymagane logowanie', 'Aby zarezerwować salę, musisz być zalogowany.');
      setIsLoginModalOpen(true);
      return;
    }

    setEditingBooking(null);

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
    const yr = slotDate.getFullYear();
    const mo = String(slotDate.getMonth() + 1).padStart(2, '0');
    const da = String(slotDate.getDate()).padStart(2, '0');
    const dateStr = `${yr}-${mo}-${da}`;

    const effectiveRoomId = presetRoomId || (selectedRoomId !== 'all' ? selectedRoomId : undefined);

    setInitialSlot({
      start: `${dateStr}T${String(startH).padStart(2, '0')}:00:00`,
      end: `${dateStr}T${String(endH).padStart(2, '0')}:00:00`,
      roomId: effectiveRoomId
    });
    setIsBookingModalOpen(true);
  };

  const handleSelectBooking = (booking: Booking) => {
    setDetailsBooking(booking);
    setIsDetailsModalOpen(true);
  };

  const handleStartEditBooking = (booking: Booking) => {
    const isAdmin = currentUser?.role === 'ADMIN';
    const isOwner = !!currentUser && (
      (Boolean(booking.userId) && booking.userId === currentUser.id) ||
      (Boolean(booking.customerEmail) && Boolean(currentUser.email) && booking.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
    );

    if (!isAdmin && !isOwner) {
      addToast('error', 'Brak uprawnień', 'Możesz edytować wyłącznie własne rezerwacje.');
      return;
    }

    setEditingBooking(booking);
    setInitialSlot(null);
    setIsBookingModalOpen(true);
  };

  const handleSubmitBooking = async (data: BookingFormData, existingId?: string) => {
    const proposedStart = new Date(`${data.date}T${data.startTime}:00`);

    if (proposedStart.getTime() < Date.now()) {
      addToast('error', 'Błąd rezerwacji', 'Wybrany termin lub godzina rozpoczęcia już upłynęła.');
      return;
    }

    const room = getRoomById(data.roomId);
    if (!room) {
      addToast('error', 'Błąd rezerwacji', 'Wybrana sala nie istnieje.');
      return;
    }

    if (data.attendeesCount < 1) {
      addToast('error', 'Błąd rezerwacji', 'Liczba uczestników musi wynosić co najmniej 1 osobę.');
      return;
    }

    if (data.attendeesCount > room.capacity) {
      addToast(
        'error',
        'Przekroczono limit sali',
        `Maksymalna pojemność sali "${room.name}" wynosi ${room.capacity} osób. Liczba uczestników (${data.attendeesCount}) nie może przekraczać tego progu.`
      );
      return;
    }

    const hourlyRate = room.hourlyRate;
    const startIso = `${data.date}T${data.startTime}:00`;
    const endIso = `${data.date}T${data.endTime}:00`;
    const totalCost = calculateTotalCost(hourlyRate, startIso, endIso);

    if (existingId) {
      const updated = bookings.map(b => {
        if (b.id === existingId) {
          const updatedItem: Booking = {
            ...b,
            title: data.title,
            roomId: data.roomId,
            customerName: data.customerName,
            customerEmail: data.customerEmail,
            customerPhone: data.customerPhone,
            companyName: data.companyName,
            start: startIso,
            end: endIso,
            attendeesCount: data.attendeesCount,
            notes: data.notes,
            selectedEquipment: data.selectedEquipment,
            totalCost
          };
          if (detailsBooking && detailsBooking.id === existingId) {
            setDetailsBooking(updatedItem);
          }
          return updatedItem;
        }
        return b;
      });

      updateBookings(updated);
      setIsBookingModalOpen(false);
      addToast('success', 'Zaktualizowano rezerwację', `Zmiany w "${data.title}" zostały zapisane.`);
    } else {
      setPendingBookingData(data);
      setPendingBookingCost(totalCost);
      setIsBookingModalOpen(false);
      setIsPaymentModalOpen(true);
    }
  };

  const handlePaymentSuccess = async (paymentInfo: {
    method: PaymentMethod;
    status: PaymentStatus;
    transactionId: string;
  }) => {
    if (!pendingBookingData) return;

    const finalData: BookingFormData = {
      ...pendingBookingData,
      paymentMethod: paymentInfo.method,
      paymentStatus: paymentInfo.status,
      transactionId: paymentInfo.transactionId
    };

    try {
      const newBooking = await ApiService.createBooking(finalData, pendingBookingCost);
      updateBookings([...bookings, newBooking]);
      setIsPaymentModalOpen(false);
      setPendingBookingData(null);
      setConfirmedBooking(newBooking);
      setIsConfirmationModalOpen(true);

      const methodLabel =
        paymentInfo.method === 'blik' ? 'BLIK' :
        paymentInfo.method === 'card' ? 'Karta płatnicza' :
        paymentInfo.method === 'transfer' ? 'Szybki przelew online' :
        paymentInfo.method === 'google_pay' ? 'Google / Apple Pay' : 'Faktura B2B (14 dni)';

      addToast(
        'success',
        'Płatność i rezerwacja zatwierdzone',
        `Pomyślnie opłacono (${methodLabel}). Kod: ${newBooking.code}, Transakcja: ${paymentInfo.transactionId}.`
      );
    } catch (err: any) {
      addToast('error', 'Błąd rezerwacji', err.message || 'Nie udało się zarezerwować terminu');
    }
  };

  const handleStatusChange = async (bookingId: string, newStatus: BookingStatus) => {
    const targetBooking = bookings.find(b => b.id === bookingId);
    const isAdmin = currentUser?.role === 'ADMIN';
    const isOwner = !!currentUser && !!targetBooking && (
      (Boolean(targetBooking.userId) && targetBooking.userId === currentUser.id) ||
      (Boolean(targetBooking.customerEmail) && Boolean(currentUser.email) && targetBooking.customerEmail.toLowerCase() === currentUser.email.toLowerCase())
    );

    if (!isAdmin && !isOwner) {
      addToast('error', 'Brak uprawnień', 'Możesz anulować wyłącznie własne rezerwacje.');
      return;
    }

    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, status: newStatus };
      }
      return b;
    });

    updateBookings(updated);

    if (detailsBooking && detailsBooking.id === bookingId) {
      setDetailsBooking(prev => (prev ? { ...prev, status: newStatus } : null));
    }

    try {
      await ApiService.updateBookingStatus(bookingId, newStatus);
    } catch (e: any) {
      console.warn('Błąd aktualizacji statusu w API:', e);
      addToast('error', 'Błąd operacji', e.message || 'Nie udało się zmienić statusu rezerwacji');
    }

    const statusLabels: Record<BookingStatus, string> = {
      confirmed: 'Potwierdzona',
      cancelled: 'Anulowana'
    };

    addToast(
      newStatus === 'cancelled' ? 'warning' : 'info',
      'Zaktualizowano status',
      `Status rezerwacji zmieniono na: ${statusLabels[newStatus]}`
    );
  };

  const handleUpdateAdminNotes = (bookingId: string, notes: string) => {
    const updated = bookings.map(b => {
      if (b.id === bookingId) {
        return { ...b, adminNotes: notes };
      }
      return b;
    });

    updateBookings(updated);

    if (detailsBooking && detailsBooking.id === bookingId) {
      setDetailsBooking(prev => (prev ? { ...prev, adminNotes: notes } : null));
    }

    addToast('success', 'Zapisano notatkę', 'Wewnętrzna notatka administracyjna została zaktualizowana.');
  };

  const handleDeleteBooking = async (bookingId: string) => {
    const isAdmin = currentUser?.role === 'ADMIN';

    if (!isAdmin) {
      addToast('error', 'Brak uprawnień', 'Tylko administrator może trwale usuwać rezerwacje.');
      return;
    }

    const updated = bookings.filter(b => b.id !== bookingId);
    updateBookings(updated);

    if (detailsBooking && detailsBooking.id === bookingId) {
      setIsDetailsModalOpen(false);
      setDetailsBooking(null);
    }

    try {
      await ApiService.deleteBooking(bookingId);
    } catch (e: any) {
      console.warn('Błąd usuwania rezerwacji w API:', e);
      addToast('error', 'Błąd usuwania', e.message || 'Nie udało się usunąć rezerwacji z bazy danych');
    }

    addToast('info', 'Usunięto rezerwację', 'Wpis został usunięty z systemu.');
  };

  const handleResetData = () => {
    if (window.confirm('Czy na pewno chcesz zresetować rezerwacje do początkowych danych demonstracyjnych?')) {
      const reset = resetBookingsStorage();
      setBookings(reset);
      addToast('info', 'Zresetowano dane', 'Przywrócono zestaw demonstracyjny rezerwacji.');
    }
  };

  const handleDismissReminder = () => {
    setHasDismissedLoginReminder(true);
    sessionStorage.setItem('login_reminder_dismissed', 'true');
  };

  const upcomingReminder = React.useMemo(() => {
    if (!currentUser || currentUser.role === 'ADMIN' || hasDismissedLoginReminder) {
      return null;
    }
    const nowTime = Date.now();
    const in24h = nowTime + 24 * 60 * 60 * 1000;

    const userBookings = bookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const isMine =
        (Boolean(b.userId) && b.userId === currentUser.id) ||
        (Boolean(b.customerEmail) && Boolean(currentUser.email) && b.customerEmail.toLowerCase() === currentUser.email.toLowerCase());
      if (!isMine) return false;
      const startTime = new Date(b.start).getTime();
      return startTime > nowTime && startTime <= in24h;
    });

    userBookings.sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());
    return userBookings[0] || null;
  }, [bookings, currentUser, hasDismissedLoginReminder]);

  const handleSendReminder = async (booking: Booking) => {
    try {
      const res = await ApiService.sendReminder(booking.id);
      addToast(
        'success',
        'Wysłano przypomnienie e-mail',
        res.message || `Wysłano powiadomienie o wydarzeniu "${booking.title}" na adres ${booking.customerEmail}.`
      );
    } catch (e: any) {
      addToast('error', 'Błąd wysyłania', e.message || 'Nie udało się wysłać przypomnienia');
    }
  };

  return (
    <div className="app-container">
      <Header
        currentMode={currentMode}
        onModeChange={setCurrentMode}
        onOpenNewBooking={handleOpenNewBooking}
        theme={theme}
        onToggleTheme={toggleTheme}
        bookings={bookings}
        currentUser={currentUser}
        onOpenLogin={() => setIsLoginModalOpen(true)}
        onLogout={handleLogout}
      />

      <main className="main-wrapper">
        {upcomingReminder && (
          <div
            className="animate-fade-in"
            style={{
              marginBottom: '16px',
              background: 'linear-gradient(90deg, rgba(245, 158, 11, 0.12) 0%, rgba(234, 88, 12, 0.12) 100%)',
              border: '1px solid rgba(245, 158, 11, 0.35)',
              borderRadius: 'var(--radius-md)',
              padding: '12px 16px',
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
                  borderRadius: '50%',
                  background: 'rgba(245, 158, 11, 0.25)',
                  color: '#f59e0b',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0
                }}
              >
                <Bell size={16} />
              </div>
              <div style={{ fontSize: '0.86rem' }}>
                <span style={{ fontWeight: 700, color: 'var(--text-main)' }}>
                  🔔 Przypomnienie o zbliżającym się wydarzeniu:
                </span>{' '}
                <span style={{ color: 'var(--text-main)' }}>
                  <strong>{upcomingReminder.title}</strong> ({getRoomById(upcomingReminder.roomId)?.name}) – {formatFullDateTimeRange(upcomingReminder.start, upcomingReminder.end)}
                </span>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '0.78rem', padding: '5px 12px' }}
                onClick={() => {
                  setDetailsBooking(upcomingReminder);
                  setIsDetailsModalOpen(true);
                  handleDismissReminder();
                }}
              >
                Szczegóły
              </button>
              <button
                type="button"
                className="btn-primary"
                style={{ fontSize: '0.78rem', padding: '5px 12px', background: 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)' }}
                onClick={() => {
                  handleSendReminder(upcomingReminder);
                  handleDismissReminder();
                }}
              >
                <Bell size={13} /> Wyślij przypomnienie e-mail
              </button>
              <button
                type="button"
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', padding: '4px', display: 'flex', alignItems: 'center' }}
                title="Ukryj powiadomienie"
                onClick={handleDismissReminder}
              >
                <X size={16} />
              </button>
            </div>
          </div>
        )}
        {currentMode === 'calendar' && (
          <>
            <RoomFilterBar
              selectedRoomId={selectedRoomId}
              onSelectRoom={setSelectedRoomId}
              bookings={bookings}
              currentUser={currentUser}
              onlyMyBookings={onlyMyBookings}
              onToggleOnlyMyBookings={() => {
                if (!currentUser) {
                  addToast('info', 'Wymagane logowanie', 'Zaloguj się na swoje konto, aby filtrować własne rezerwacje.');
                  setIsLoginModalOpen(true);
                  return;
                }
                setOnlyMyBookings(prev => !prev);
              }}
            />

            <CalendarView
              bookings={bookings}
              selectedRoomId={selectedRoomId}
              onSelectSlot={handleSelectSlot}
              onSelectBooking={handleSelectBooking}
              currentUser={currentUser}
              onlyMyBookings={onlyMyBookings}
            />
          </>
        )}

        {currentMode === 'rooms' && (
          <RoomsCatalogView
            onGoToCalendarForRoom={(roomId) => {
              setSelectedRoomId(roomId);
              setCurrentMode('calendar');
            }}
            onBookRoom={(roomId) => {
              setSelectedRoomId(roomId);
              handleOpenNewBooking(roomId);
            }}
          />
        )}

        {currentMode === 'admin' && (
          currentUser?.role === 'ADMIN' ? (
            <AdminDashboard
              bookings={bookings}
              onOpenDetails={handleSelectBooking}
              onEditBooking={handleStartEditBooking}
              onStatusChange={handleStatusChange}
              onDeleteBooking={handleDeleteBooking}
              onResetData={handleResetData}
              onOpenNewBooking={handleOpenNewBooking}
              currentUser={currentUser}
            />
          ) : (
            <div
              className="animate-fade-in"
              style={{
                maxWidth: '520px',
                margin: '60px auto',
                padding: '40px 28px',
                background: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                textAlign: 'center',
                boxShadow: 'var(--shadow-md)'
              }}
            >
              <div
                style={{
                  width: '60px',
                  height: '60px',
                  borderRadius: '50%',
                  background: 'rgba(239, 68, 68, 0.15)',
                  color: 'var(--rose)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 16px auto'
                }}
              >
                <Shield size={28} />
              </div>
              <h2 style={{ fontSize: '1.4rem', marginBottom: '8px' }}>Dostęp Zastrzeżony</h2>
              <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px' }}>
                Panel administracyjny ze statystykami i zarządzaniem wszystkimi rezerwacjami jest dostępny wyłącznie dla <strong>Administratora</strong>.
                Zwykły użytkownik ma wgląd do kalendarza oraz katalogu sal.
              </p>
              <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setCurrentMode('calendar')}
                >
                  Wróć do kalendarza
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => setIsLoginModalOpen(true)}
                >
                  Zaloguj jako Administrator
                </button>
              </div>
            </div>
          )
        )}
      </main>

      <BookingModal
        isOpen={isBookingModalOpen}
        onClose={() => setIsBookingModalOpen(false)}
        onSubmit={handleSubmitBooking}
        initialSlot={initialSlot}
        existingBooking={editingBooking}
        bookings={bookings}
        currentUser={currentUser}
      />

      <PaymentModal
        isOpen={isPaymentModalOpen}
        onClose={() => {
          setIsPaymentModalOpen(false);
          setIsBookingModalOpen(true);
        }}
        bookingData={pendingBookingData}
        totalCost={pendingBookingCost}
        roomName={getRoomById(pendingBookingData?.roomId || '')?.name || 'Sala konferencyjna'}
        roomLocation={getRoomById(pendingBookingData?.roomId || '')?.floor || 'Gdańsk Business Hub'}
        onPaymentSuccess={handlePaymentSuccess}
      />

      <BookingDetailsModal
        isOpen={isDetailsModalOpen}
        booking={detailsBooking}
        onClose={() => setIsDetailsModalOpen(false)}
        onEdit={handleStartEditBooking}
        onStatusChange={handleStatusChange}
        onUpdateAdminNotes={handleUpdateAdminNotes}
        onDelete={handleDeleteBooking}
        onSendReminder={handleSendReminder}
        currentUser={currentUser}
      />

      <ConfirmationModal
        isOpen={isConfirmationModalOpen}
        booking={confirmedBooking}
        onClose={() => setIsConfirmationModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={handleLoginSuccess}
      />

      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
};

export default App;
