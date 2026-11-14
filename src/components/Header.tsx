import React from 'react';
import { Calendar, ShieldCheck, Plus, Moon, Sun, Building2, Clock, User as UserIcon, LogIn, LogOut, Shield } from 'lucide-react';
import type { Booking, User } from '../types';

interface HeaderProps {
  currentMode: 'calendar' | 'rooms' | 'admin';
  onModeChange: (mode: 'calendar' | 'rooms' | 'admin') => void;
  onOpenNewBooking: () => void;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
  bookings: Booking[];
  currentUser: User | null;
  onOpenLogin: () => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentMode,
  onModeChange,
  onOpenNewBooking,
  theme,
  onToggleTheme,
  bookings,
  currentUser,
  onOpenLogin,
  onLogout
}) => {
  const todayStr = new Date().toISOString().split('T')[0];
  const todayBookingsCount = bookings.filter(
    b => b.status !== 'cancelled' && b.start.startsWith(todayStr)
  ).length;

  return (
    <header className="app-header">
      <div className="header-inner">
        <div className="brand-section">
          <div className="brand-icon" style={{ padding: 0, background: 'transparent', boxShadow: 'none' }}>
            <img
              src="/favicon.svg?v=2"
              alt="Gdańsk Business Hub Logo"
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '12px',
                display: 'block',
                filter: 'drop-shadow(0 4px 14px rgba(99, 102, 241, 0.45))'
              }}
            />
          </div>
          <div className="brand-info">
            <h1>Gdańsk Business Hub</h1>
            <p className="brand-subtitle">
              System rezerwacji sal konferencyjnych i przestrzeni biznesowych w Gdańsku
            </p>
          </div>
        </div>

        <div className="header-controls">
          <div className="mode-switcher" role="tablist">
            <button
              type="button"
              className={`mode-btn ${currentMode === 'calendar' ? 'active' : ''}`}
              onClick={() => onModeChange('calendar')}
              title="Widok interaktywnego kalendarza"
            >
              <Calendar size={16} />
              <span>Kalendarz</span>
            </button>
            <button
              type="button"
              className={`mode-btn ${currentMode === 'rooms' ? 'active' : ''}`}
              onClick={() => onModeChange('rooms')}
              title="Katalog sal, zdjęcia i lista wyposażenia"
            >
              <Building2 size={16} />
              <span>Katalog sal</span>
            </button>
            {currentUser?.role === 'ADMIN' && (
              <button
                type="button"
                className={`mode-btn ${currentMode === 'admin' ? 'active' : ''}`}
                onClick={() => onModeChange('admin')}
                title="Panel zarządzania rezerwacjami dla administratora"
              >
                <ShieldCheck size={16} />
                <span>Panel Admina</span>
              </button>
            )}
          </div>

          <div
            className="room-pill"
            style={{ display: 'none', cursor: 'default' }}
          >
            <Clock size={14} />
            <span>Dziś: {todayBookingsCount} rezerwacji</span>
          </div>

          <div className="header-actions-bar">
            {currentUser ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '5px 12px',
                    background: 'var(--bg-input)',
                    border: '1px solid var(--border)',
                    borderRadius: '9999px',
                    fontSize: '0.82rem'
                  }}
                >
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      background:
                        currentUser.role === 'ADMIN'
                          ? 'rgba(99, 102, 241, 0.2)'
                          : 'rgba(16, 185, 129, 0.2)',
                      color:
                        currentUser.role === 'ADMIN' ? 'var(--primary)' : 'var(--emerald)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}
                  >
                    {currentUser.role === 'ADMIN' ? <Shield size={13} /> : <UserIcon size={13} />}
                  </div>
                  <span style={{ fontWeight: 600 }}>{currentUser.name}</span>
                </div>
                <button
                  type="button"
                  className="icon-btn"
                  onClick={onLogout}
                  title="Wyloguj się z systemu"
                  aria-label="Wyloguj się"
                >
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <button
                type="button"
                className="btn-secondary"
                onClick={onOpenLogin}
                style={{ gap: '6px', fontSize: '0.82rem', padding: '7px 12px' }}
                title="Zaloguj się jako klient lub administrator"
              >
                <LogIn size={15} />
                <span>Zaloguj się</span>
              </button>
            )}

            <button
              type="button"
              className="icon-btn"
              onClick={onToggleTheme}
              title={theme === 'dark' ? 'Przełącz na jasny motyw' : 'Przełącz na ciemny motyw'}
              aria-label="Przełącz motyw"
            >
              {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>

          <button
            type="button"
            className="btn-primary"
            onClick={onOpenNewBooking}
          >
            <Plus size={18} />
            <span>Zarezerwuj termin</span>
          </button>
        </div>
      </div>
    </header>
  );
};
