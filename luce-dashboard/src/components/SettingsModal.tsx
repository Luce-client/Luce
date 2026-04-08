import React from 'react';

const LANGUAGES = [
  { code: 'ko', label: '한국어', flag: '🇰🇷' },
  { code: 'en', label: 'English', flag: '🇺🇸' },
  { code: 'ja', label: '日本語', flag: '🇯🇵' },
  { code: 'zh', label: '中文', flag: '🇨🇳' },
  { code: 'es', label: 'Español', flag: '🇪🇸' },
  { code: 'de', label: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', label: 'Français', flag: '🇫🇷' },
  { code: 'pt', label: 'Português', flag: '🇧🇷' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺' },
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  language: string;
  onLanguageChange: (code: string) => void;
}

export default function SettingsModal({ isOpen, onClose, language, onLanguageChange }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ width: 500, maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 12px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>⚙️ 설정</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>

        <div style={{ padding: '8px 24px 24px' }}>
          {/* Language Section */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>언어 / Language</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8 }}>
              {LANGUAGES.map(lang => (
                <button
                  key={lang.code}
                  onClick={() => onLanguageChange(lang.code)}
                  style={{
                    background: language === lang.code ? '#22c55e20' : '#222',
                    border: `1px solid ${language === lang.code ? '#22c55e' : '#333'}`,
                    borderRadius: 8,
                    padding: '10px 12px',
                    color: language === lang.code ? '#22c55e' : '#ccc',
                    cursor: 'pointer',
                    fontSize: 13,
                    fontWeight: 600,
                    textAlign: 'left',
                    transition: 'all 0.15s ease',
                  }}
                >
                  {lang.flag} {lang.label}
                </button>
              ))}
            </div>
          </div>

          {/* JVM Settings */}
          <div style={{ marginBottom: 24 }}>
            <h3 style={{ fontSize: 14, fontWeight: 700, color: '#888', marginBottom: 12, textTransform: 'uppercase', letterSpacing: 1 }}>JVM 메모리</h3>
            <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
              <input
                type="range"
                min="1024"
                max="16384"
                step="512"
                defaultValue="4096"
                style={{ flex: 1, accentColor: '#22c55e' }}
              />
              <span style={{ color: '#ccc', fontWeight: 700, fontSize: 14, minWidth: 50, textAlign: 'right' }}>4 GB</span>
            </div>
          </div>

          {/* About */}
          <div style={{ borderTop: '1px solid #2a2a2a', paddingTop: 16 }}>
            <div style={{ fontSize: 12, color: '#555', textAlign: 'center' }}>
              Luce Client v1.0.0 · Built with Electron
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
