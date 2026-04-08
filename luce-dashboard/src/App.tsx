import React, { useState, useEffect } from 'react';
import './index.css';
import luceLogo from './assets/luce.png';
import VersionModal from './components/VersionModal';
import AccountModal from './components/AccountModal';
import ModsPanel from './components/ModsPanel';
import SettingsModal from './components/SettingsModal';

// @ts-ignore
const electron = window.electron;

type Tab = 'play' | 'mods' | 'skins';

interface Profile {
  name: string;
  uuid: string;
  accessToken: string;
}

function App() {
  const [tab, setTab] = useState<Tab>('play');
  const [profile, setProfile] = useState<Profile | null>(null);
  const [selectedVersion, setSelectedVersion] = useState('1.8.9');
  const [language, setLanguage] = useState('ko');
  const [isLaunching, setIsLaunching] = useState(false);

  // Modal states
  const [showVersion, setShowVersion] = useState(false);
  const [showAccount, setShowAccount] = useState(false);
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const handleAuthSuccess = (e: any) => {
      if (e.detail) {
        setProfile(e.detail);
      }
    };
    window.addEventListener('luce-auth-success', handleAuthSuccess);
    return () => window.removeEventListener('luce-auth-success', handleAuthSuccess);
  }, []);

  const handleLogin = async () => {
    try {
      const result = await electron.authMicrosoft();
      if (result.success) {
        setProfile(result.profile);
      } else {
        console.error('Auth failed:', result.error);
      }
    } catch (err) {
      console.error('Auth error:', err);
    }
  };

  const handleLogout = () => {
    setProfile(null);
  };

  const handleLaunch = async () => {
    if (!profile) return;
    setIsLaunching(true);
    try {
      await electron.launchGame({ ...profile, version: selectedVersion });
    } catch (err) {
      console.error('Launch error:', err);
    }
    setIsLaunching(false);
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#0d0d0d', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>

      {/* ===== TOP BAR ===== */}
      <div className="titlebar-drag" style={{
        height: 52,
        background: '#111',
        borderBottom: '1px solid #1e1e1e',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 16px',
        flexShrink: 0,
      }}>
        {/* Left: Logo + Tabs */}
        <div className="titlebar-no-drag" style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          {/* Logo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <img src={luceLogo} alt="Luce" style={{ width: 28, height: 28 }} />
            <span style={{ fontWeight: 900, fontSize: 15, letterSpacing: 1.5 }}>LUCE CLIENT</span>
          </div>

          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, marginLeft: 12 }}>
            <button className={`tab-btn ${tab === 'play' ? 'active' : ''}`} onClick={() => setTab('play')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
              플레이
            </button>
            <button className={`tab-btn ${tab === 'mods' ? 'active' : ''}`} onClick={() => setTab('mods')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
              모드
            </button>
            <button className={`tab-btn ${tab === 'skins' ? 'active' : ''}`} onClick={() => setTab('skins')}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              스킨
            </button>
          </div>
        </div>

        {/* Right: Profile + Controls */}
        <div className="titlebar-no-drag" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {/* Profile chip */}
          <button
            onClick={() => setShowAccount(true)}
            style={{
              display: 'flex', alignItems: 'center', gap: 10,
              background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 10,
              padding: '6px 14px 6px 8px', cursor: 'pointer', color: '#fff',
            }}
          >
            <img
              src={profile ? `https://minotar.net/helm/${profile.name}/28.png` : 'https://minotar.net/helm/MHF_Steve/28.png'}
              style={{ width: 28, height: 28, borderRadius: 6 }}
              alt="Skin"
            />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: 11, color: '#666', lineHeight: 1 }}>
                {profile ? '로그인됨' : '로그인하지 않음'}
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, lineHeight: 1.3 }}>
                {profile ? profile.name : '게스트 사용자'}
              </div>
            </div>
          </button>

          {/* Icon controls */}
          <button onClick={() => setShowSettings(true)} style={iconBtnStyle} title="설정">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          </button>
          <button style={iconBtnStyle} title="폴더 열기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z"/></svg>
          </button>
          <button onClick={() => electron.minimize()} style={iconBtnStyle} title="최소화">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/></svg>
          </button>
          <button onClick={() => electron.close()} style={{ ...iconBtnStyle, color: '#ef4444' }} title="닫기">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>
      </div>

      {/* ===== MAIN CONTENT ===== */}
      <div style={{ flex: 1, overflow: 'hidden' }}>
        {tab === 'play' && <PlayPanel
          profile={profile}
          selectedVersion={selectedVersion}
          isLaunching={isLaunching}
          onLaunch={handleLaunch}
          onVersionClick={() => setShowVersion(true)}
          onLoginClick={() => setShowAccount(true)}
        />}
        {tab === 'mods' && <ModsPanel />}
        {tab === 'skins' && <SkinsPanel profile={profile} />}
      </div>

      {/* ===== MODALS ===== */}
      <VersionModal
        isOpen={showVersion}
        onClose={() => setShowVersion(false)}
        selectedVersion={selectedVersion}
        onSelect={setSelectedVersion}
      />
      <AccountModal
        isOpen={showAccount}
        onClose={() => setShowAccount(false)}
        profile={profile}
        onLogin={handleLogin}
        onLogout={handleLogout}
      />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        language={language}
        onLanguageChange={setLanguage}
      />
    </div>
  );
}

/* ===== PLAY PANEL ===== */
function PlayPanel({ profile, selectedVersion, isLaunching, onLaunch, onVersionClick, onLoginClick }: {
  profile: Profile | null;
  selectedVersion: string;
  isLaunching: boolean;
  onLaunch: () => void;
  onVersionClick: () => void;
  onLoginClick: () => void;
}) {
  return (
    <div style={{
      height: '100%', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center', gap: 32,
      background: 'radial-gradient(ellipse at center bottom, #111a15 0%, #0d0d0d 70%)',
    }}>
      {/* Version Selector */}
      <button onClick={onVersionClick} style={{
        background: '#1a1a1a', border: '1px solid #2a2a2a', borderRadius: 12,
        padding: '12px 28px', cursor: 'pointer', color: '#fff',
        display: 'flex', alignItems: 'center', gap: 10, fontSize: 14, fontWeight: 600,
        transition: 'all 0.15s ease',
      }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
        Minecraft {selectedVersion}
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><polyline points="6 9 12 15 18 9"/></svg>
      </button>

      {/* Launch Button */}
      {profile ? (
        <button className="launch-btn" onClick={onLaunch} disabled={isLaunching}>
          {isLaunching ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
              실행 중...
            </>
          ) : (
            <>▶ 게임 시작</>
          )}
        </button>
      ) : (
        <button className="ms-btn" onClick={onLoginClick} style={{ width: 'auto', padding: '14px 40px', borderRadius: 12 }}>
          <MsIcon /> Microsoft 로그인
        </button>
      )}

      {/* Bottom info */}
      <div style={{ fontSize: 12, color: '#444', textAlign: 'center' }}>
        {profile ? `${profile.name} 님으로 로그인됨` : '게임을 시작하려면 먼저 Microsoft 계정으로 로그인하세요'}
      </div>
    </div>
  );
}

/* ===== SKINS PANEL ===== */
function SkinsPanel({ profile }: { profile: Profile | null }) {
  return (
    <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: 16 }}>
      {profile ? (
        <>
          <img
            src={`https://minotar.net/armor/body/${profile.name}/250.png`}
            style={{ height: 250, imageRendering: 'pixelated' }}
            alt="Full Skin"
          />
          <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.name}</div>
          <div style={{ fontSize: 12, color: '#666' }}>UUID: {profile.uuid}</div>
        </>
      ) : (
        <div style={{ color: '#555', fontSize: 14 }}>로그인 후 스킨을 확인할 수 있습니다</div>
      )}
    </div>
  );
}

/* ===== MS ICON ===== */
function MsIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 21 21" fill="none">
      <rect x="0" y="0" width="10" height="10" fill="#f25022" />
      <rect x="11" y="0" width="10" height="10" fill="#7fba00" />
      <rect x="0" y="11" width="10" height="10" fill="#00a4ef" />
      <rect x="11" y="11" width="10" height="10" fill="#ffb900" />
    </svg>
  );
}

/* ===== ICON BUTTON STYLE ===== */
const iconBtnStyle: React.CSSProperties = {
  background: '#1a1a1a',
  border: '1px solid #2a2a2a',
  borderRadius: 8,
  width: 34,
  height: 34,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  cursor: 'pointer',
  color: '#888',
  transition: 'all 0.15s ease',
};

export default App;
