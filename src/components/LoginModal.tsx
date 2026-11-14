import React, { useState } from 'react';
import { X, Lock, Mail, User as UserIcon, Shield, Sparkles, Building2, Phone } from 'lucide-react';
import { ApiService } from '../services/api';
import type { User } from '../types';

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLoginSuccess: (user: User) => void;
}

export const LoginModal: React.FC<LoginModalProps> = ({ isOpen, onClose, onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [companyName, setCompanyName] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg(null);

    try {
      if (mode === 'login') {
        const { user } = await ApiService.login(email, password);
        onLoginSuccess(user);
        onClose();
      } else {
        if (!name.trim()) throw new Error('Podaj swoje imię i nazwisko');
        const { user } = await ApiService.register({
          email,
          password,
          name,
          phone: phone.trim() || undefined,
          companyName: companyName.trim() || undefined
        });
        onLoginSuccess(user);
        onClose();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Wystąpił błąd podczas autoryzacji');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickLogin = async (demoEmail: string, demoPass: string) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setIsLoading(true);
    setErrorMsg(null);
    try {
      const { user } = await ApiService.login(demoEmail, demoPass);
      onLoginSuccess(user);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.message || 'Błąd szybkiego logowania');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div
        className="modal-dialog animate-fade-in"
        style={{ maxWidth: '440px' }}
        onClick={e => e.stopPropagation()}
      >
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'var(--primary)'
              }}
            >
              <Lock size={18} />
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.15rem' }}>
                {mode === 'login' ? 'Logowanie do systemu' : 'Rejestracja nowego konta'}
              </h3>
              <p style={{ margin: 0, fontSize: '0.8rem', color: 'var(--text-dim)' }}>
                {mode === 'login'
                  ? 'Uzyskaj dostęp do zarządzania rezerwacjami'
                  : 'Utwórz konto w Gdańsk Business Hub'}
              </p>
            </div>
          </div>
          <button type="button" className="icon-btn" onClick={onClose}>
            <X size={18} />
          </button>
        </div>

        <div style={{ padding: '16px 24px 0 24px' }}>
          <div
            style={{
              background: 'var(--bg-input)',
              border: '1px solid var(--border)',
              borderRadius: '8px',
              padding: '12px'
            }}
          >
            <div
              style={{
                fontSize: '0.74rem',
                fontWeight: 600,
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                color: 'var(--text-dim)',
                marginBottom: '8px',
                display: 'flex',
                alignItems: 'center',
                gap: '5px'
              }}
            >
              <Sparkles size={13} color="var(--amber)" />
              Szybkie logowanie testowe (1-kliknięciem):
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 10px',
                  justifyContent: 'center',
                  background: 'rgba(99, 102, 241, 0.12)',
                  borderColor: 'rgba(99, 102, 241, 0.4)',
                  color: 'var(--primary)'
                }}
                onClick={() => handleQuickLogin('admin@gdanskhub.pl', 'admin123')}
                disabled={isLoading}
              >
                <Shield size={14} />
                <span>Administrator</span>
              </button>
              <button
                type="button"
                className="btn-secondary"
                style={{
                  fontSize: '0.78rem',
                  padding: '8px 10px',
                  justifyContent: 'center',
                  background: 'rgba(16, 185, 129, 0.12)',
                  borderColor: 'rgba(16, 185, 129, 0.4)',
                  color: 'var(--emerald)'
                }}
                onClick={() => handleQuickLogin('klient@gdanskhub.pl', 'user123')}
                disabled={isLoading}
              >
                <UserIcon size={14} />
                <span>Zwykły Klient</span>
              </button>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '16px 24px 24px 24px' }}>
          {errorMsg && (
            <div
              style={{
                background: 'rgba(239, 68, 68, 0.12)',
                border: '1px solid rgba(239, 68, 68, 0.35)',
                color: 'var(--rose)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.84rem',
                marginBottom: '16px'
              }}
            >
              {errorMsg}
            </div>
          )}

          {mode === 'register' && (
            <>
              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">
                  <UserIcon size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Imię i nazwisko *
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="np. Jan Kowalski"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">
                  <Building2 size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Nazwa firmy (opcjonalnie)
                </label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="np. StartUp Sp. z o.o."
                  value={companyName}
                  onChange={e => setCompanyName(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: '12px' }}>
                <label className="form-label">
                  <Phone size={13} style={{ display: 'inline', marginRight: '4px' }} />
                  Numer telefonu (opcjonalnie)
                </label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="np. +48 600 123 456"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group" style={{ marginBottom: '12px' }}>
            <label className="form-label">
              <Mail size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Adres e-mail *
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="np. jan@example.com"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>

          <div className="form-group" style={{ marginBottom: '18px' }}>
            <label className="form-label">
              <Lock size={13} style={{ display: 'inline', marginRight: '4px' }} />
              Hasło *
            </label>
            <input
              type="password"
              className="form-input"
              placeholder="Wpisz hasło..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', padding: '10px' }}
            disabled={isLoading}
          >
            {isLoading ? 'Przetwarzanie...' : mode === 'login' ? 'Zaloguj się' : 'Zarejestruj konto'}
          </button>

          <div style={{ textAlign: 'center', marginTop: '14px', fontSize: '0.84rem' }}>
            {mode === 'login' ? (
              <span>
                Nie masz jeszcze konta?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0
                  }}
                  onClick={() => {
                    setMode('register');
                    setErrorMsg(null);
                  }}
                >
                  Zarejestruj się
                </button>
              </span>
            ) : (
              <span>
                Masz już konto?{' '}
                <button
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: 'var(--primary)',
                    cursor: 'pointer',
                    fontWeight: 600,
                    padding: 0
                  }}
                  onClick={() => {
                    setMode('login');
                    setErrorMsg(null);
                  }}
                >
                  Zaloguj się
                </button>
              </span>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
