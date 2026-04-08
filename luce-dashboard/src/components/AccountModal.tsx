import React, { useState } from 'react';

interface Profile {
  name: string;
  uuid: string;
  accessToken: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  profile: Profile | null;
  onLogin: () => void;
  onLogout: () => void;
}

// @ts-ignore
const electron = window.electron;

export default function AccountModal({ isOpen, onClose, profile, onLogin, onLogout }: Props) {
  const [deviceCode, setDeviceCode] = useState<string | null>(null);
  const [isPolling, setIsPolling] = useState(false);

  if (!isOpen) return null;

  const handleLinkLogin = async () => {
    try {
      const result = await electron.authMicrosoftLinkStart();
      if (!result.success) {
        console.error('Device code start failed:', result.error);
        return;
      }

      setDeviceCode(result.userCode);
      setIsPolling(true);

      // Start polling
      const pollResult = await electron.authMicrosoftLinkPoll(
        result.deviceCode,
        result.interval,
        result.expiresIn
      );

      if (pollResult.success) {
        window.dispatchEvent(new CustomEvent('luce-auth-success', { detail: pollResult.profile }));
      }

      setDeviceCode(null);
      setIsPolling(false);
      onClose();
    } catch (err) {
      console.error('Link login error:', err);
      setDeviceCode(null);
      setIsPolling(false);
    }
  };

  const copyCode = () => {
    if (deviceCode) {
      navigator.clipboard.writeText(deviceCode);
    }
  };

  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent('https://www.microsoft.com/link')}`;

  return (
    <div className="modal-backdrop" onClick={() => { if (!isPolling) onClose(); }}>
      <div className="modal-content" style={{ width: 500, minHeight: 450, background: '#0a0a0a', border: '1px solid #1a1a1a', borderRadius: 12 }} onClick={e => e.stopPropagation()}>
        
        {/* Header - Conditional Close Button */}
        <div style={{ padding: '24px 24px 12px', display: 'flex', justifyContent: 'flex-end' }}>
          {!isPolling && (
            <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#666', fontSize: 20, cursor: 'pointer' }}>✕</button>
          )}
        </div>

        <div style={{ padding: '0 40px 40px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          
          {deviceCode ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 30, color: '#fff' }}>링크를 통해 MICROSOFT 계정 추가</h2>
              
              {/* QR Code */}
              <div style={{ background: '#fff', padding: 8, borderRadius: 8, marginBottom: 25 }}>
                <img src={qrUrl} alt="QR Code" style={{ width: 150, height: 150, display: 'block' }} />
              </div>

              {/* Code Display Box */}
              <div style={{ 
                background: '#161616', 
                border: '1px solid #222', 
                borderRadius: 12, 
                padding: '12px 24px', 
                display: 'flex', 
                alignItems: 'center', 
                gap: 15,
                width: 'fit-content',
                marginBottom: 30
              }}>
                <span style={{ fontSize: 28, fontWeight: 900, color: '#fff', letterSpacing: 2 }}>{deviceCode}</span>
                <button onClick={copyCode} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}>
                   <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              </div>

              {/* Instructions */}
              <p style={{ color: '#ccc', fontSize: 13, textAlign: 'center', lineHeight: 1.6, marginBottom: 30 }}>
                로그인하려면 웹 브라우저를 사용하여{' '}
                <span style={{ color: '#3b82f6', textDecoration: 'underline', cursor: 'pointer' }} onClick={() => electron.openExternal('https://www.microsoft.com/link')}>
                  https://www.microsoft.com/link
                </span>{' '}
                페이지를 열고 <strong>{deviceCode}</strong> 코드를 입력하여 인증하세요.
              </p>

              {/* Red Action Button */}
              <button 
                onClick={() => { copyCode(); electron.openExternal('https://www.microsoft.com/link'); }}
                style={{ 
                  background: '#e11d48', 
                  color: '#fff', 
                  border: 'none', 
                  borderRadius: 10, 
                  padding: '14px 0', 
                  width: '100%', 
                  fontWeight: 700, 
                  fontSize: 15, 
                  cursor: 'pointer'
                }}
              >
                코드 복사 후 링크 열기
              </button>

              {isPolling && (
                <div style={{ marginTop: 20, color: '#ef4444', fontSize: 12, fontWeight: 600, animation: 'pulse 1.5s infinite' }}>
                  인증 대기 중...
                </div>
              )}
            </div>
          ) : (
            <>
              <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 20 }}>계정 전환기</h2>
              
              {/* Account Display */}
              <div style={{ 
                width: '100%', 
                background: '#111', 
                borderRadius: 12, 
                minHeight: 180, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center',
                marginBottom: 20,
                border: '1px solid #1a1a1a'
              }}>
                {profile ? (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 15, padding: 20, width: '100%' }}>
                    <img 
                      src={`https://minotar.net/helm/${profile.name}/48.png`} 
                      style={{ width: 48, height: 48, borderRadius: 8 }} 
                      alt="Skin" 
                    />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700, fontSize: 16 }}>{profile.name}</div>
                      <div style={{ fontSize: 12, color: '#22c55e' }}>로그인됨</div>
                    </div>
                    <button onClick={onLogout} style={{ background: '#ef444410', color: '#ef4444', border: '1px solid #ef444430', borderRadius: 8, padding: '8px 14px', fontWeight: 600, fontSize: 13, cursor: 'pointer' }}>로그아웃</button>
                  </div>
                ) : (
                  <span style={{ color: '#444', fontWeight: 600 }}>활성화된 계정 없음</span>
                )}
              </div>

              {/* Buttons */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10, width: '100%' }}>
                <button className="ms-btn" onClick={() => { onLogin(); onClose(); }}>
                  <MsIcon /> + Microsoft 계정
                </button>
                <button className="ms-btn" onClick={handleLinkLogin}>
                  <MsIcon /> + Microsoft 계정 (링크)
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

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
