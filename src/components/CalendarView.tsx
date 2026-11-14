import React, { useState, useMemo } from 'react';
import type { Booking, User as AuthUser } from '../types';
import { getRoomById } from '../data/mockRooms';
import { formatPolishDate, formatPolishTime } from '../utils/calendarUtils';
import {
  ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, Plus,
  MapPin, User, Sparkles, Grid, Columns, CalendarDays, List
} from 'lucide-react';

interface CalendarViewProps {
  bookings: Booking[];
  selectedRoomId: string;
  onSelectSlot: (startIso: string, endIso: string) => void;
  onSelectBooking: (booking: Booking) => void;
  currentUser?: AuthUser | null;
  onlyMyBookings?: boolean;
}

const WEEKDAY_NAMES = ['Pn', 'Wt', 'Śr', 'Cz', 'Pt', 'Sb', 'Nd'];
const WEEKDAY_FULL = ['Poniedziałek', 'Wtorek', 'Środa', 'Czwartek', 'Piątek', 'Sobota', 'Niedziela'];

const HOURS_LIST = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20];

export const CalendarView: React.FC<CalendarViewProps> = ({
  bookings,
  selectedRoomId,
  onSelectSlot,
  onSelectBooking,
  currentUser,
  onlyMyBookings
}) => {
  const isOwnBooking = (b: Booking): boolean => {
    if (!currentUser) return false;
    if (b.userId && b.userId === currentUser.id) return true;
    if (b.customerEmail && currentUser.email && b.customerEmail.toLowerCase() === currentUser.email.toLowerCase()) return true;
    return false;
  };
  const [currentDate, setCurrentDate] = useState<Date>(() => new Date());

  const [selectedDateStr, setSelectedDateStr] = useState<string>(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  });

  const [activeView, setActiveView] = useState<'month' | 'week' | 'day' | 'agenda'>('month');

  const todayStr = useMemo(() => {
    const d = new Date();
    const yyyy = d.getFullYear();
    const mm = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const isTimeSlotPast = (dateStr: string, hour: number): boolean => {
    const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`).getTime();
    return slotStart < Date.now();
  };

  const getNextAvailableSlotForDate = (dateStr: string): { startIso: string; endIso: string } | null => {
    const now = new Date();
    const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;

    if (dateStr < today) {
      return null;
    }

    if (dateStr > today) {
      return {
        startIso: `${dateStr}T10:00:00`,
        endIso: `${dateStr}T12:00:00`
      };
    }

    const nextHour = now.getHours() + 1;
    if (nextHour > 20) {
      return null;
    }
    const startH = Math.max(nextHour, 8);
    const endH = Math.min(startH + 2, 21);
    return {
      startIso: `${dateStr}T${String(startH).padStart(2, '0')}:00:00`,
      endIso: `${dateStr}T${String(endH).padStart(2, '0')}:00:00`
    };
  };

  const filteredBookings = useMemo(() => {
    let list = selectedRoomId === 'all'
      ? bookings
      : bookings.filter(b => b.roomId === selectedRoomId);

    if (onlyMyBookings && currentUser) {
      list = list.filter(b => isOwnBooking(b));
    }

    return list;
  }, [bookings, selectedRoomId, onlyMyBookings, currentUser]);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const activeWeekDays = useMemo(() => {
    const [y, m, d] = selectedDateStr.split('-').map(Number);
    const dateObj = new Date(y, m - 1, d);

    const dayOfWeek = (dateObj.getDay() + 6) % 7;
    const monday = new Date(dateObj);
    monday.setDate(dateObj.getDate() - dayOfWeek);

    const todayStr = new Date().toISOString().split('T')[0];
    const days = [];

    for (let i = 0; i < 7; i++) {
      const cur = new Date(monday);
      cur.setDate(monday.getDate() + i);

      const yr = cur.getFullYear();
      const mo = String(cur.getMonth() + 1).padStart(2, '0');
      const da = String(cur.getDate()).padStart(2, '0');
      const dateStr = `${yr}-${mo}-${da}`;

      days.push({
        date: cur,
        dateStr,
        dayNumber: cur.getDate(),
        weekdayShort: WEEKDAY_NAMES[i],
        weekdayFull: WEEKDAY_FULL[i],
        isToday: dateStr === todayStr,
        isPast: dateStr < todayStr,
        isSelected: dateStr === selectedDateStr,
        bookings: filteredBookings.filter(b => b.status !== 'cancelled' && b.start.startsWith(dateStr))
      });
    }

    return days;
  }, [selectedDateStr, filteredBookings]);

  const headerTitle = useMemo(() => {
    if (activeView === 'week') {
      const startDay = activeWeekDays[0];
      const endDay = activeWeekDays[6];
      if (startDay.date.getMonth() === endDay.date.getMonth()) {
        const monthStr = endDay.date.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
        return `Tydzień: ${startDay.dayNumber} – ${endDay.dayNumber} ${monthStr}`;
      } else {
        const startMonthStr = startDay.date.toLocaleDateString('pl-PL', { month: 'short' });
        const endMonthStr = endDay.date.toLocaleDateString('pl-PL', { month: 'short', year: 'numeric' });
        return `Tydzień: ${startDay.dayNumber} ${startMonthStr} – ${endDay.dayNumber} ${endMonthStr}`;
      }
    }
    if (activeView === 'day') {
      return `Harmonogram: ${formatPolishDate(selectedDateStr)}`;
    }
    if (activeView === 'agenda') {
      return 'Agenda nadchodzących rezerwacji';
    }
    const mName = currentDate.toLocaleDateString('pl-PL', { month: 'long', year: 'numeric' });
    return mName.charAt(0).toUpperCase() + mName.slice(1);
  }, [activeView, currentDate, activeWeekDays, selectedDateStr]);

  const handlePrev = () => {
    if (activeView === 'month') {
      setCurrentDate(new Date(year, month - 1, 1));
    } else if (activeView === 'week') {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d - 7);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
      setCurrentDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
    } else if (activeView === 'day') {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d - 1);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
      setCurrentDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
    }
  };

  const handleNext = () => {
    if (activeView === 'month') {
      setCurrentDate(new Date(year, month + 1, 1));
    } else if (activeView === 'week') {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d + 7);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
      setCurrentDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
    } else if (activeView === 'day') {
      const [y, m, d] = selectedDateStr.split('-').map(Number);
      const dt = new Date(y, m - 1, d + 1);
      const yyyy = dt.getFullYear();
      const mm = String(dt.getMonth() + 1).padStart(2, '0');
      const dd = String(dt.getDate()).padStart(2, '0');
      setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
      setCurrentDate(new Date(dt.getFullYear(), dt.getMonth(), 1));
    }
  };

  const handleToday = () => {
    const today = new Date();
    setCurrentDate(new Date(today.getFullYear(), today.getMonth(), 1));
    const yyyy = today.getFullYear();
    const mm = String(today.getMonth() + 1).padStart(2, '0');
    const dd = String(today.getDate()).padStart(2, '0');
    setSelectedDateStr(`${yyyy}-${mm}-${dd}`);
  };

  const calendarTiles = useMemo(() => {
    const tiles = [];
    const firstDayOfMonth = new Date(year, month, 1);
    const firstDayIndex = (firstDayOfMonth.getDay() + 6) % 7;
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const todayStr = new Date().toISOString().split('T')[0];

    const formatStr = (y: number, m: number, d: number) => {
      const mm = String(m + 1).padStart(2, '0');
      const dd = String(d).padStart(2, '0');
      return `${y}-${mm}-${dd}`;
    };

    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const dayNum = daysInPrevMonth - i;
      const prevDate = new Date(year, month - 1, dayNum);
      const str = formatStr(prevDate.getFullYear(), prevDate.getMonth(), dayNum);
      tiles.push({
        date: prevDate,
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isPast: str < todayStr,
        isSelected: str === selectedDateStr,
        bookings: filteredBookings.filter(b => b.status !== 'cancelled' && b.start.startsWith(str))
      });
    }

    for (let dayNum = 1; dayNum <= daysInCurrentMonth; dayNum++) {
      const curDate = new Date(year, month, dayNum);
      const str = formatStr(year, month, dayNum);
      tiles.push({
        date: curDate,
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: true,
        isToday: str === todayStr,
        isPast: str < todayStr,
        isSelected: str === selectedDateStr,
        bookings: filteredBookings.filter(b => b.status !== 'cancelled' && b.start.startsWith(str))
      });
    }

    const totalSlots = tiles.length > 35 ? 42 : 35;
    const remainingSlots = totalSlots - tiles.length;
    for (let dayNum = 1; dayNum <= remainingSlots; dayNum++) {
      const nextDate = new Date(year, month + 1, dayNum);
      const str = formatStr(nextDate.getFullYear(), nextDate.getMonth(), dayNum);
      tiles.push({
        date: nextDate,
        dateStr: str,
        dayNumber: dayNum,
        isCurrentMonth: false,
        isToday: str === todayStr,
        isPast: str < todayStr,
        isSelected: str === selectedDateStr,
        bookings: filteredBookings.filter(b => b.status !== 'cancelled' && b.start.startsWith(str))
      });
    }

    return tiles;
  }, [year, month, selectedDateStr, filteredBookings]);

  const getSlotBookingsForDate = (dateStr: string, hour: number): Booking[] => {
    const slotStart = new Date(`${dateStr}T${String(hour).padStart(2, '0')}:00:00`).getTime();
    const slotEnd = slotStart + 60 * 60 * 1000;

    return filteredBookings.filter(b => {
      if (b.status === 'cancelled') return false;
      const s = new Date(b.start).getTime();
      const e = new Date(b.end).getTime();
      return slotStart < e && slotEnd > s;
    });
  };

  return (
    <div className="win-calendar-root animate-fade-in">
      <div className="win-calendar-header">
        <div className="win-header-left">
          <div className="win-header-icon">
            <CalendarIcon size={22} />
          </div>
          <div className="win-month-title">
            <h2>{headerTitle}</h2>
            <span className="win-current-day-badge">
              {formatPolishDate(selectedDateStr)}
            </span>
          </div>
        </div>

        <div className="win-header-controls">
          {activeView !== 'agenda' && (
            <div className="win-nav-group">
              <button
                type="button"
                className="win-icon-btn"
                onClick={handlePrev}
                title="Poprzedni"
              >
                <ChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="win-btn-today"
                onClick={handleToday}
                title="Przejdź do dzisiaj"
              >
                Dzisiaj
              </button>
              <button
                type="button"
                className="win-icon-btn"
                onClick={handleNext}
                title="Następny"
              >
                <ChevronRight size={18} />
              </button>
            </div>
          )}

          <div className="win-view-switcher">
            <button
              type="button"
              className={`win-view-btn ${activeView === 'month' ? 'active' : ''}`}
              onClick={() => setActiveView('month')}
            >
              <Grid size={15} />
              <span>Miesiąc</span>
            </button>
            <button
              type="button"
              className={`win-view-btn ${activeView === 'week' ? 'active' : ''}`}
              onClick={() => setActiveView('week')}
            >
              <Columns size={15} />
              <span>Tydzień</span>
            </button>
            <button
              type="button"
              className={`win-view-btn ${activeView === 'day' ? 'active' : ''}`}
              onClick={() => setActiveView('day')}
            >
              <CalendarDays size={15} />
              <span>Dzień</span>
            </button>
            <button
              type="button"
              className={`win-view-btn ${activeView === 'agenda' ? 'active' : ''}`}
              onClick={() => setActiveView('agenda')}
            >
              <List size={15} />
              <span>Agenda</span>
            </button>
          </div>
        </div>
      </div>

      {activeView === 'month' && (
        <div className="win-calendar-layout">
          <div className="win-tiles-container">
            <div className="win-weekdays-grid">
              {WEEKDAY_NAMES.map((name, idx) => (
                <div key={name} className="win-weekday-cell" title={WEEKDAY_FULL[idx]}>
                  {name}
                </div>
              ))}
            </div>

            <div className="win-days-grid">
              {calendarTiles.map(tile => {
                const hasBookings = tile.bookings.length > 0;
                return (
                  <div
                    key={tile.dateStr}
                    className={`win-day-tile ${tile.isCurrentMonth ? 'current-month' : 'other-month'} ${tile.isToday ? 'today' : ''} ${tile.isSelected ? 'selected' : ''} ${tile.isPast ? 'past-day' : ''}`}
                    onClick={() => {
                      setSelectedDateStr(tile.dateStr);
                      if (!tile.isCurrentMonth) {
                        setCurrentDate(new Date(tile.date.getFullYear(), tile.date.getMonth(), 1));
                      }
                    }}
                    onDoubleClick={() => {
                      const nextSlot = getNextAvailableSlotForDate(tile.dateStr);
                      if (nextSlot) {
                        onSelectSlot(nextSlot.startIso, nextSlot.endIso);
                      }
                    }}
                  >
                    <div className="win-tile-header">
                      <span className={`win-day-num ${tile.isToday ? 'today-pill' : ''}`}>
                        {tile.dayNumber}
                      </span>
                      {tile.isToday && <span className="win-today-label">Dziś</span>}
                    </div>

                    <div className="win-tile-events">
                      {tile.bookings.slice(0, 3).map(b => {
                        const room = getRoomById(b.roomId);
                        const isOwn = isOwnBooking(b);
                        return (
                          <div
                            key={b.id}
                            className="win-tile-event-pill"
                            style={{
                              borderLeftColor: isOwn ? 'var(--emerald)' : (room?.color || 'var(--primary)'),
                              background: isOwn ? 'rgba(16, 185, 129, 0.15)' : undefined
                            }}
                            title={`${b.title} (${room?.name}) • ${formatPolishTime(b.start)} - ${formatPolishTime(b.end)}${isOwn ? ' [Twoja rezerwacja]' : ''}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              onSelectBooking(b);
                            }}
                          >
                            <span
                              className="win-event-dot"
                              style={{ background: isOwn ? 'var(--emerald)' : (room?.color || 'var(--primary)') }}
                            ></span>
                            <span className="win-event-title">{isOwn ? `★ ${b.title}` : b.title}</span>
                          </div>
                        );
                      })}

                      {tile.bookings.length > 3 && (
                        <div className="win-more-events">
                          +{tile.bookings.length - 3} więcej
                        </div>
                      )}

                      {!hasBookings && tile.isCurrentMonth && (
                        <div className="win-empty-tile-hint">
                          Wolne
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="win-agenda-panel">
            <div className="win-agenda-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={18} color="var(--primary)" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 800 }}>
                  {formatPolishDate(selectedDateStr)}
                </h3>
              </div>
              <p style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                Harmonogram kafelkowy wszystkich przestrzeni o każdej godzinie
              </p>
            </div>

            {(() => {
              const nextSlot = getNextAvailableSlotForDate(selectedDateStr);
              if (!nextSlot) {
                return (
                  <div style={{ padding: '9px 14px', background: 'var(--bg-subtle)', borderRadius: 'var(--radius-sm)', color: 'var(--text-muted)', fontSize: '0.82rem', textAlign: 'center', border: '1px dashed var(--border-subtle)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                    <Clock size={14} color="var(--text-dim)" /> {selectedDateStr < todayStr ? 'Ten dzień już minął — brak możliwości rezerwacji' : 'Dzisiejsze godziny rezerwacji już upłynęły'}
                  </div>
                );
              }
              return (
                <button
                  type="button"
                  className="btn-primary"
                  style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
                  onClick={() => onSelectSlot(nextSlot.startIso, nextSlot.endIso)}
                >
                  <Plus size={16} /> Dodaj rezerwację na ten dzień
                </button>
              );
            })()}

            <div className="win-agenda-slots-list">
              {HOURS_LIST.map(hour => {
                const slotBookings = getSlotBookingsForDate(selectedDateStr, hour);
                const hourStr = String(hour).padStart(2, '0');
                const nextHourStr = String(hour + 1).padStart(2, '0');
                const slotStartIso = `${selectedDateStr}T${hourStr}:00:00`;
                const slotEndIso = `${selectedDateStr}T${nextHourStr}:00:00`;

                if (slotBookings.length > 0) {
                  return (
                    <div key={hour} className="win-slot-group-card">
                      <div className="win-slot-time-header">
                        <span className="win-slot-time">
                          <Clock size={12} /> {hourStr}:00 - {nextHourStr}:00
                        </span>
                        <span className="pill-badge" style={{ fontSize: '0.68rem', fontWeight: 700 }}>
                          {slotBookings.length === 1 ? '1 zajęta przestrzeń' : `${slotBookings.length} zajęte przestrzenie`}
                        </span>
                      </div>

                      <div className="win-slot-items-list">
                        {slotBookings.map(booking => {
                          const room = getRoomById(booking.roomId);
                          const isOwn = isOwnBooking(booking);
                          return (
                            <div
                              key={booking.id}
                              className="win-slot-card occupied mini"
                              style={{
                                borderLeftColor: isOwn ? 'var(--emerald)' : (room?.color || 'var(--primary)'),
                                background: isOwn ? 'rgba(16, 185, 129, 0.08)' : undefined
                              }}
                              onClick={() => onSelectBooking(booking)}
                              title="Kliknij, aby otworzyć szczegóły rezerwacji"
                            >
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
                                <div className="win-slot-title">{booking.title}</div>
                                {isOwn ? (
                                  <span className="status-pill status-confirmed" style={{ fontSize: '0.65rem', padding: '1px 6px', flexShrink: 0 }}>
                                    Twoja
                                  </span>
                                ) : (
                                  <span className="status-pill" style={{ fontSize: '0.65rem', padding: '1px 6px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.25)', flexShrink: 0 }}>
                                    Wgląd
                                  </span>
                                )}
                              </div>
                              <div className="win-slot-sub">
                                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', fontWeight: 600, color: 'var(--text-main)' }}>
                                  <MapPin size={11} color={room?.color} />
                                  {room?.name}
                                </span>
                                <span>•</span>
                                <span>{isOwn ? `${booking.customerName} (Ty)` : booking.customerName}</span>
                              </div>
                            </div>
                          );
                        })}
                      </div>

                      {selectedRoomId === 'all' && !isTimeSlotPast(selectedDateStr, hour) && (
                        <button
                          type="button"
                          className="win-slot-add-another-btn"
                          onClick={() => onSelectSlot(slotStartIso, slotEndIso)}
                          title="Zarezerwuj inną wolną przestrzeń o tej samej godzinie"
                        >
                          <Plus size={13} /> Zarezerwuj inną wolną salę o {hourStr}:00
                        </button>
                      )}
                    </div>
                  );
                }

                if (isTimeSlotPast(selectedDateStr, hour)) {
                  return (
                    <div
                      key={hour}
                      className="win-slot-card past"
                      style={{ opacity: 0.55, cursor: 'not-allowed', background: 'var(--bg-subtle)' }}
                    >
                      <div className="win-slot-time">
                        <Clock size={12} /> {hourStr}:00 - {nextHourStr}:00
                        <span className="pill-badge" style={{ fontSize: '0.68rem', background: 'var(--bg-input)', color: 'var(--text-dim)' }}>
                          Termin minął
                        </span>
                      </div>
                    </div>
                  );
                }
                return (
                  <div
                    key={hour}
                    className="win-slot-card free"
                    onClick={() => onSelectSlot(slotStartIso, slotEndIso)}
                  >
                    <div className="win-slot-time">
                      <Clock size={12} /> {hourStr}:00 - {nextHourStr}:00
                      <span className="win-slot-free-tag">
                        <Sparkles size={10} /> Wszystkie przestrzenie wolne
                      </span>
                    </div>
                    <div className="win-slot-prompt">
                      <span>Kliknij, aby zarezerwować termin</span>
                      <Plus size={14} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeView === 'week' && (
        <div className="win-week-view animate-fade-in">
          <div className="win-week-scroll-container">
            <div className="win-week-table">
              <div className="win-week-header-row">
                <div className="win-week-time-gutter">Godz.</div>
                {activeWeekDays.map(day => (
                  <div
                    key={day.dateStr}
                    className={`win-week-col-header ${day.isToday ? 'today' : ''} ${day.isSelected ? 'selected' : ''}`}
                    onClick={() => setSelectedDateStr(day.dateStr)}
                    title={`Wybierz ${day.weekdayFull}`}
                  >
                    <div className="win-week-col-weekday">
                      {day.weekdayShort}
                    </div>
                    <div className="win-week-col-num">{day.dayNumber}</div>
                    {day.bookings.length > 0 && (
                      <span className="pill-badge win-week-badge">
                        {day.bookings.length} rez.
                      </span>
                    )}
                  </div>
                ))}
              </div>

              <div className="win-week-body">
                {HOURS_LIST.map(hour => {
                  const hourStr = String(hour).padStart(2, '0');
                  const nextHourStr = String(hour + 1).padStart(2, '0');
                  return (
                    <div key={hour} className="win-week-hour-row">
                      <div className="win-week-time-label">{hourStr}:00</div>
                      {activeWeekDays.map(day => {
                        const isPastSlot = isTimeSlotPast(day.dateStr, hour);
                        const slotStart = `${day.dateStr}T${hourStr}:00:00`;
                        const slotEnd = `${day.dateStr}T${nextHourStr}:00:00`;
                        const slotBookings = getSlotBookingsForDate(day.dateStr, hour);

                        if (slotBookings.length > 0) {
                          return (
                            <div key={day.dateStr} className="win-week-cell-container">
                              {slotBookings.map(b => {
                                const room = getRoomById(b.roomId);
                                const shortRoomName = room
                                  ? (room.name.includes('-') ? room.name.split('-')[1].trim() : room.name)
                                  : 'Sala';
                                const isOwn = isOwnBooking(b);
                                return (
                                  <div
                                    key={b.id}
                                    className="win-week-slot-occupied"
                                    style={{
                                      background: isOwn ? 'rgba(16, 185, 129, 0.22)' : (room?.bgColor || 'rgba(99, 102, 241, 0.25)'),
                                      borderLeft: `3px solid ${isOwn ? 'var(--emerald)' : (room?.color || 'var(--primary)')}`,
                                      color: 'var(--text-main)',
                                      opacity: isPastSlot ? 0.75 : 1
                                    }}
                                    onClick={() => onSelectBooking(b)}
                                    title={`${b.title} (${room?.name}) • ${b.customerName} (${formatPolishTime(b.start)} - ${formatPolishTime(b.end)})${isOwn ? ' [Twoja rezerwacja]' : ''}`}
                                  >
                                    <div className="win-week-slot-title" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                      <span>{b.title}</span>
                                      {isOwn && <span style={{ fontSize: '0.6rem', color: 'var(--emerald)', fontWeight: 800 }}>TY</span>}
                                    </div>
                                    <div className="win-week-slot-sub">
                                      {shortRoomName} • {isOwn ? 'Ty' : b.customerName.split(' ')[0]}
                                    </div>
                                  </div>
                                );
                              })}

                              {selectedRoomId === 'all' && !isPastSlot && (
                                <button
                                  type="button"
                                  className="win-week-add-mini"
                                  onClick={() => onSelectSlot(slotStart, slotEnd)}
                                  title={`Dodaj kolejną rezerwację o ${hourStr}:00`}
                                >
                                  + kolejna
                                </button>
                              )}
                            </div>
                          );
                        }

                        if (isPastSlot) {
                          return (
                            <div
                              key={day.dateStr}
                              className="win-week-slot-empty past"
                              title="Ta godzina już minęła"
                            >
                              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>—</span>
                            </div>
                          );
                        }

                        return (
                          <div
                            key={day.dateStr}
                            className="win-week-slot-empty"
                            onClick={() => onSelectSlot(slotStart, slotEnd)}
                            title={`Wolny termin ${hourStr}:00 - ${nextHourStr}:00 • Kliknij aby zarezerwować`}
                          >
                            <span className="win-week-empty-plus">+</span>
                          </div>
                        );
                      })}
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeView === 'day' && (
        <div className="win-day-view animate-fade-in">
          <div className="win-day-view-header">
            <div>
              <h3>Harmonogram dnia: {formatPolishDate(selectedDateStr)}</h3>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                Wszystkie przestrzenie i rezerwacje przypadające na poszczególne godziny
              </p>
            </div>
            {(() => {
              const nextSlot = getNextAvailableSlotForDate(selectedDateStr);
              if (!nextSlot) {
                return (
                  <span className="pill-badge" style={{ padding: '8px 14px', fontSize: '0.8rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock size={14} /> {selectedDateStr < todayStr ? 'Dzień minął' : 'Godziny upłynęły'}
                  </span>
                );
              }
              return (
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => onSelectSlot(nextSlot.startIso, nextSlot.endIso)}
                >
                  <Plus size={16} /> Nowa rezerwacja
                </button>
              );
            })()}
          </div>

          <div className="win-day-hours-list">
            {HOURS_LIST.map(hour => {
              const isPastSlot = isTimeSlotPast(selectedDateStr, hour);
              const slotBookings = getSlotBookingsForDate(selectedDateStr, hour);
              const hourStr = String(hour).padStart(2, '0');
              const nextHourStr = String(hour + 1).padStart(2, '0');
              const slotStartIso = `${selectedDateStr}T${hourStr}:00:00`;
              const slotEndIso = `${selectedDateStr}T${nextHourStr}:00:00`;

              if (slotBookings.length > 0) {
                return (
                  <div key={hour} className="win-day-group-card">
                    <div className="win-day-group-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                        <div className="win-hour-time-badge">{hourStr}:00 - {nextHourStr}:00</div>
                        <span className="pill-badge" style={{ fontSize: '0.74rem', whiteSpace: 'nowrap', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--primary)', display: 'inline-block' }}></span>
                          Zajęte: {slotBookings.length} {slotBookings.length === 1 ? 'przestrzeń' : 'przestrzenie'}
                        </span>
                      </div>
                      {selectedRoomId === 'all' && !isPastSlot && (
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '4px 12px', fontSize: '0.76rem', whiteSpace: 'nowrap' }}
                          onClick={() => onSelectSlot(slotStartIso, slotEndIso)}
                        >
                          <Plus size={13} /> Zarezerwuj inną salę o {hourStr}:00
                        </button>
                      )}
                    </div>

                    <div className="win-day-items-grid">
                      {slotBookings.map(booking => {
                        const room = getRoomById(booking.roomId);
                        const isOwn = isOwnBooking(booking);
                        return (
                          <div
                            key={booking.id}
                            className="win-day-hour-card occupied"
                            style={{
                              borderLeftColor: isOwn ? 'var(--emerald)' : (room?.color || 'var(--primary)'),
                              background: isOwn ? 'rgba(16, 185, 129, 0.08)' : undefined
                            }}
                            onClick={() => onSelectBooking(booking)}
                          >
                            <div className="win-day-card-body">
                              <div className="win-day-card-title">{booking.title}</div>
                              <div className="win-day-card-sub">
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '65%' }}>
                                  <MapPin size={12} color={room?.color} style={{ flexShrink: 0 }} />
                                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{room?.name}</span>
                                </span>
                                <span style={{ flexShrink: 0 }}>•</span>
                                <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flexShrink: 0 }}>
                                  <User size={12} style={{ flexShrink: 0 }} /> {isOwn ? `${booking.customerName.split(' ')[0]} (Ty)` : booking.customerName.split(' ')[0]}
                                </span>
                              </div>
                            </div>
                            <span
                              className={`status-pill ${isOwn ? 'status-confirmed' : ''} win-day-status-pill`}
                              style={!isOwn ? { background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.25)' } : {}}
                            >
                              {isOwn ? 'Twoja' : 'Wgląd'}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                );
              }

              if (isTimeSlotPast(selectedDateStr, hour)) {
                return (
                  <div
                    key={hour}
                    className="win-day-hour-card past"
                    style={{ opacity: 0.5, cursor: 'not-allowed' }}
                  >
                    <div className="win-hour-time-badge">{hourStr}:00 - {nextHourStr}:00</div>
                    <div style={{ color: 'var(--text-dim)', fontSize: '0.82rem' }}>
                      Termin minął
                    </div>
                  </div>
                );
              }

              return (
                <div
                  key={hour}
                  className="win-day-hour-card free"
                  onClick={() => onSelectSlot(slotStartIso, slotEndIso)}
                >
                  <div className="win-hour-time-badge free">{hourStr}:00 - {nextHourStr}:00</div>
                  <div style={{ color: 'var(--emerald)', fontWeight: 600, fontSize: '0.88rem' }}>
                    Wszystkie przestrzenie wolne — kliknij, aby zarezerwować termin
                  </div>
                  <Plus size={18} color="var(--emerald)" />
                </div>
              );
            })}
          </div>
        </div>
      )}

      {activeView === 'agenda' && (() => {
        const nowMs = Date.now();
        const upcomingAgendaBookings = filteredBookings
          .filter(b => b.status !== 'cancelled' && new Date(b.end).getTime() > nowMs)
          .sort((a, b) => new Date(a.start).getTime() - new Date(b.start).getTime());

        return (
          <div className="win-agenda-full-view animate-fade-in">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                Lista nadchodzących rezerwacji
              </div>
              <span className="pill-badge" style={{ background: 'var(--bg-subtle)', color: 'var(--text-muted)', fontSize: '0.8rem', fontWeight: 600 }}>
                {upcomingAgendaBookings.length === 1 ? '1 aktywny termin' : `${upcomingAgendaBookings.length} aktywne terminy`} • odbyte rezerwacje są automatycznie ukryte
              </span>
            </div>

            {upcomingAgendaBookings.length === 0 ? (
              <div className="empty-state" style={{ padding: '36px 20px', textAlign: 'center' }}>
                <Clock size={36} color="var(--text-dim)" style={{ margin: '0 auto 10px', display: 'block' }} />
                <div style={{ fontWeight: 700, fontSize: '0.98rem', color: 'var(--text-main)', marginBottom: '4px' }}>
                  Brak nadchodzących rezerwacji
                </div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>
                  Wszystkie wcześniejsze rezerwacje już się odbyły lub brak wpisów dla wybranego filtra sali.
                </div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {upcomingAgendaBookings.map(b => {
                  const room = getRoomById(b.roomId);
                  const isOngoing = new Date(b.start).getTime() <= nowMs && new Date(b.end).getTime() > nowMs;
                  const isOwn = isOwnBooking(b);
                  return (
                    <div
                      key={b.id}
                      className="win-agenda-item-card"
                      style={{
                        borderLeftColor: isOwn ? 'var(--emerald)' : (room?.color || 'var(--primary)'),
                        background: isOwn ? 'rgba(16, 185, 129, 0.05)' : undefined
                      }}
                      onClick={() => onSelectBooking(b)}
                    >
                      <div style={{ minWidth: '135px' }}>
                        <div style={{ fontWeight: 700, fontSize: '0.88rem' }}>{formatPolishDate(b.start)}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px', marginTop: '2px' }}>
                          <span>{formatPolishTime(b.start)} - {formatPolishTime(b.end)}</span>
                          {isOngoing && (
                            <span style={{
                              background: 'rgba(16, 185, 129, 0.18)',
                              color: 'var(--emerald)',
                              fontSize: '0.68rem',
                              fontWeight: 700,
                              padding: '1px 5px',
                              borderRadius: '4px'
                            }}>
                              Trwa
                            </span>
                          )}
                        </div>
                      </div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{b.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                          <span style={{ color: room?.color, fontWeight: 600 }}>{room?.name}</span> • {isOwn ? `${b.customerName} (Ty)` : b.customerName} • {b.attendeesCount} {b.attendeesCount === 1 ? 'osoba' : b.attendeesCount < 5 ? 'osoby' : 'osób'}
                        </div>
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <div style={{ fontWeight: 800, color: 'var(--emerald)', fontSize: '0.95rem' }}>
                          {b.totalCost} PLN
                        </div>
                        {isOwn ? (
                          <span className="status-pill status-confirmed" style={{ fontSize: '0.65rem', padding: '1px 6px' }}>
                            Twoja
                          </span>
                        ) : (
                          <span className="status-pill" style={{ fontSize: '0.65rem', padding: '1px 6px', background: 'rgba(59, 130, 246, 0.12)', color: '#60a5fa', borderColor: 'rgba(59, 130, 246, 0.25)' }}>
                            Wgląd
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })()}
    </div>
  );
};
