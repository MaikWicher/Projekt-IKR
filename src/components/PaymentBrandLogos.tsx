import React from 'react';

export const BlikLogo: React.FC<{ height?: number }> = ({ height = 20 }) => (
  <div
    style={{
      height: `${height}px`,
      padding: '0 8px',
      background: '#0f172a',
      borderRadius: '5px',
      border: '1px solid rgba(255, 255, 255, 0.18)',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
      userSelect: 'none',
      flexShrink: 0
    }}
  >
    <span
      style={{
        fontWeight: 900,
        fontSize: `${height * 0.65}px`,
        color: '#FFFFFF',
        letterSpacing: '-0.3px',
        lineHeight: 1,
        fontFamily: 'system-ui, -apple-system, sans-serif'
      }}
    >
      blik
    </span>
    <span
      style={{
        width: `${Math.round(height * 0.35)}px`,
        height: `${Math.round(height * 0.35)}px`,
        borderRadius: '50%',
        background: '#EB0029',
        display: 'inline-block'
      }}
    />
  </div>
);

export const CardLogos: React.FC<{ height?: number }> = ({ height = 15 }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '6px',
      lineHeight: 1,
      flexShrink: 0
    }}
  >
    <svg
      height={height}
      viewBox="0 0 32 10"
      fill="none"
      style={{ width: 'auto', display: 'block', flexShrink: 0 }}
    >
      <path
        fill="#FFFFFF"
        d="M11.64 0.28L7.63 9.87H5.01L3.03 2.22C2.91 1.75 2.81 1.58 2.45 1.38C1.86 1.06 0.87 0.76 0 0.57L0.06 0.28H4.28C4.96 0.28 5.56 0.74 5.7 1.53L6.75 7.07L9.33 0.28H11.64ZM21.92 6.72C21.93 4.19 18.42 4.05 18.44 2.92C18.45 2.58 18.78 2.21 19.5 2.12C19.86 2.07 20.85 2.02 21.94 2.53L22.38 0.5C21.8 0.23 21.03 0 20.08 0C17.62 0 15.89 1.3 15.88 3.19C15.86 4.57 17.12 5.34 18.06 5.8C19.03 6.27 19.36 6.57 19.35 6.99C19.34 7.64 18.57 7.92 17.85 7.93C16.6 7.95 15.88 7.59 15.3 7.32L14.85 9.42C15.43 9.69 16.5 9.92 17.61 9.93C20.22 9.93 21.91 8.64 21.92 6.72ZM28.4 9.87H30.49L28.67 0.28H26.73C26.26 0.28 25.86 0.55 25.69 0.96L21.95 9.87H24.56L25.08 8.44H28.26L28.4 9.87ZM25.79 6.47L27.11 2.87L27.87 6.47H25.79ZM15.36 0.28L13.31 9.87H10.86L12.91 0.28H15.36Z"
      />
      <path
        fill="#F7B600"
        d="M2.45 1.38C1.86 1.06 0.87 0.76 0 0.57L0.06 0.28H4.28C4.96 0.28 5.56 0.74 5.7 1.53L6.75 7.07L5.01 0.28H2.76C2.6 0.5 2.5 0.9 2.45 1.38Z"
      />
    </svg>

    <svg
      height={height}
      viewBox="0 0 28 17"
      fill="none"
      style={{ width: 'auto', display: 'block', flexShrink: 0 }}
    >
      <circle cx="8.5" cy="8.5" r="8.5" fill="#EB001B" />
      <circle cx="19.5" cy="8.5" r="8.5" fill="#F79E1B" />
      <path
        d="M14 2.8a8.5 8.5 0 013.2 5.7 8.5 8.5 0 01-3.2 5.7 8.5 8.5 0 01-3.2-5.7c0-2.3 1.2-4.4 3.2-5.7z"
        fill="#FF5F00"
      />
    </svg>
  </div>
);

export const Przelewy24Logo: React.FC<{ height?: number }> = ({ height = 18 }) => (
  <div
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      gap: '5px',
      userSelect: 'none',
      flexShrink: 0
    }}
  >
    <div
      style={{
        height: `${height}px`,
        padding: '0 5px',
        background: '#15284f',
        borderRadius: '4px',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: '1px solid rgba(255, 255, 255, 0.2)'
      }}
    >
      <span
        style={{
          fontWeight: 900,
          fontSize: `${height * 0.56}px`,
          color: '#FFFFFF',
          letterSpacing: '-0.2px',
          lineHeight: 1
        }}
      >
        P<span style={{ color: '#E62630' }}>24</span>
      </span>
    </div>

    <span
      style={{
        fontWeight: 800,
        fontSize: `${height * 0.64}px`,
        color: 'var(--text-main)',
        letterSpacing: '-0.3px',
        lineHeight: 1
      }}
    >
      Przelewy<span style={{ color: '#E62630' }}>24</span>
    </span>
  </div>
);

export const ApplePayLogo: React.FC<{ height?: number }> = ({ height = 15 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', lineHeight: 1 }}>
    <svg
      height={height}
      viewBox="0 0 101 121"
      fill="currentColor"
      style={{ width: 'auto', display: 'block', flexShrink: 0 }}
    >
      <path d="m 28.709,28.63 c 3.516,0 7.758,0.726 12.727,2.179 5.015,1.454 8.343,2.18 9.984,2.18 2.109,0 5.555,-0.82 10.336,-2.461 4.781,-1.64 8.93,-2.461 12.445,-2.461 5.766,0 10.899,1.547 15.399,4.641 2.531,1.781 5.039,4.195 7.523,7.242 -3.75,3.188 -6.492,6.024 -8.226,8.508 -3.141,4.5 -4.711,9.469 -4.711,14.906 0,5.953 1.664,11.32 4.992,16.102 3.328,4.781 7.125,7.804 11.392,9.07 -1.783,5.766 -4.736,11.794 -8.861,18.074 -6.234,9.42 -12.422,14.13 -18.562,14.13 -2.438,0 -5.813,-0.77 -10.125,-2.32 -4.266,-1.55 -7.875,-2.32 -10.828,-2.32 -2.954,0 -6.399,0.8 -10.336,2.39 -3.891,1.64 -7.055,2.46 -9.493,2.46 -7.359,0 -14.578,-6.23 -21.656,-18.7 C 3.631,89.919 0.092,77.825 0.092,65.966 0.09199,54.95 2.7873,45.974 8.1779,39.036 13.615,32.098 20.4589,28.63 28.7089,28.63 M 73.0059,0.927 c 0.187,0.60946 0.305,1.1486 0.352,1.6172 0.046,0.4689 0.07,0.9376 0.07,1.4063 0,3.0001 -0.703,6.281 -2.109,9.844 -1.407,3.562 -3.633,6.867 -6.68,9.914 -2.625,2.578 -5.227,4.312 -7.805,5.203 -1.64,0.516 -4.125,0.914 -7.453,1.195 0.094,-7.125 1.945,-13.289 5.555,-18.492 3.656,-5.203 9.679,-8.7655 18.07,-10.687" />
    </svg>
    <span
      style={{
        fontWeight: 700,
        fontSize: `${height * 0.9}px`,
        letterSpacing: '-0.2px',
        lineHeight: 1,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      Pay
    </span>
  </div>
);

export const GooglePayLogo: React.FC<{ height?: number }> = ({ height = 15 }) => (
  <div style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', lineHeight: 1 }}>
    <svg
      height={height}
      viewBox="0 0 24 24"
      fill="none"
      style={{ width: 'auto', display: 'block', flexShrink: 0 }}
    >
      <path
        fill="#4285F4"
        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
      />
      <path
        fill="#34A853"
        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.35 24 12 24z"
      />
      <path
        fill="#FBBC05"
        d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.14-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
      />
      <path
        fill="#EA4335"
        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
      />
    </svg>
    <span
      style={{
        fontWeight: 700,
        fontSize: `${height * 0.9}px`,
        letterSpacing: '-0.2px',
        lineHeight: 1,
        fontFamily: '"Google Sans", "Product Sans", Roboto, sans-serif'
      }}
    >
      Pay
    </span>
  </div>
);

export const GoogleApplePayLogo: React.FC<{ height?: number; compact?: boolean }> = ({
  height = 18,
  compact = false
}) => {
  const iconHeight = compact ? 13 : Math.max(14, Math.round(height * 0.85));

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: compact ? '4px' : '6px',
        maxWidth: '100%',
        boxSizing: 'border-box'
      }}
    >
      <ApplePayLogo height={iconHeight} />
      <span style={{ opacity: 0.35, fontSize: `${iconHeight * 0.8}px`, fontWeight: 300, userSelect: 'none' }}>
        /
      </span>
      <GooglePayLogo height={iconHeight} />
    </div>
  );
};

export const B2BInvoiceLogo: React.FC<{ height?: number }> = ({ height = 20 }) => (
  <div
    style={{
      height: `${height}px`,
      padding: '0 6px',
      background: 'rgba(245, 158, 11, 0.15)',
      border: '1px solid rgba(245, 158, 11, 0.4)',
      borderRadius: '5px',
      display: 'inline-flex',
      alignItems: 'center',
      gap: '4px',
      userSelect: 'none',
      flexShrink: 0
    }}
  >
    <svg
      width={height * 0.65}
      height={height * 0.65}
      viewBox="0 0 24 24"
      fill="none"
      stroke="#F59E0B"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={{ display: 'block', flexShrink: 0 }}
    >
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <polyline points="14 2 14 8 20 8" />
      <line x1="16" y1="13" x2="8" y2="13" />
      <line x1="16" y1="17" x2="8" y2="17" />
    </svg>
    <span
      style={{
        fontWeight: 800,
        fontSize: `${height * 0.58}px`,
        color: '#F59E0B',
        letterSpacing: '-0.2px',
        lineHeight: 1
      }}
    >
      B2B
    </span>
  </div>
);

export const MBankLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
    <rect width="32" height="32" rx="6" fill="#FFFFFF" />
    <rect x="4" y="5" width="24" height="4" rx="2" fill="#E60000" />
    <rect x="4" y="11" width="24" height="4" rx="2" fill="#FF7A00" />
    <rect x="4" y="17" width="24" height="4" rx="2" fill="#00A3E0" />
    <rect x="4" y="23" width="24" height="4" rx="2" fill="#78BE20" />
  </svg>
);

export const PkoLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
    <rect width="32" height="32" rx="6" fill="#002882" />
    <circle cx="16" cy="16" r="9" stroke="#FFFFFF" strokeWidth="2.4" />
    <circle cx="16" cy="16" r="4.2" fill="#FFFFFF" />
    <rect x="14.8" y="10" width="2.4" height="4.5" fill="#002882" />
  </svg>
);

export const SantanderLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
    <rect width="32" height="32" rx="6" fill="#EC0000" />
    <path
      d="M16 6c-3 4-6 7.5-6 11 0 3.3 2.7 6 6 6s6-2.7 6-6c0-3.5-3-7-6-11z"
      fill="#FFFFFF"
    />
    <path
      d="M16 11.5c-1.5 1.8-3 3.6-3 5.5 0 1.6 1.3 2.8 3 2.8s3-1.2 3-2.8c0-1.9-1.5-3.7-3-5.5z"
      fill="#EC0000"
    />
  </svg>
);

export const IngLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '6px',
      background: '#FF6200',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    }}
  >
    <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: `${size * 0.42}px`, letterSpacing: '-0.3px', lineHeight: 1 }}>
      ING
    </span>
  </div>
);

export const MillenniumLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '6px',
      background: '#C4005B',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    }}
  >
    <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: `${size * 0.58}px`, lineHeight: 1, fontFamily: 'serif' }}>
      M
    </span>
  </div>
);

export const AliorLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" style={{ display: 'block' }}>
    <rect width="32" height="32" rx="6" fill="#7C1034" />
    <path
      d="M16 6l7 3.2v6.2c0 5-3.5 8.5-7 10.6-3.5-2.1-7-5.6-7-10.6V9.2l7-3.2z"
      fill="#EAA844"
    />
    <circle cx="16" cy="14" r="3.2" fill="#7C1034" />
  </svg>
);

export const PekaoLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '6px',
      background: '#D0021B',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    }}
  >
    <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: `${size * 0.34}px`, letterSpacing: '-0.2px', lineHeight: 1 }}>
      Pekao
    </span>
  </div>
);

export const BnpLogo: React.FC<{ size?: number }> = ({ size = 28 }) => (
  <div
    style={{
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '6px',
      background: '#00965E',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      userSelect: 'none'
    }}
  >
    <span style={{ color: '#FFFFFF', fontWeight: 900, fontSize: `${size * 0.38}px`, letterSpacing: '-0.2px', lineHeight: 1 }}>
      BNP
    </span>
  </div>
);

export const BankLogos: Record<string, React.FC<{ size?: number }>> = {
  mbank: MBankLogo,
  pko: PkoLogo,
  santander: SantanderLogo,
  ing: IngLogo,
  millennium: MillenniumLogo,
  alior: AliorLogo,
  pekao: PekaoLogo,
  bnp: BnpLogo
};
