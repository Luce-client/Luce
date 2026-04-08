import React from 'react';

const VERSIONS = [
  '26.1.1', '26.1', '1.21.11', '1.21.10',
  '1.21.8', '1.21.7', '1.21.5', '1.21.4',
  '1.21.3', '1.21.1', '1.21', '1.20.6',
  '1.20.4', '1.20.2', '1.20.1', '1.20',
  '1.19.4', '1.19.3', '1.19.2', '1.19',
  '1.18.2', '1.17.1', '1.12.2', '1.8.9',
];

interface Props {
  isOpen: boolean;
  onClose: () => void;
  selectedVersion: string;
  onSelect: (v: string) => void;
}

export default function VersionModal({ isOpen, onClose, selectedVersion, onSelect }: Props) {
  if (!isOpen) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-content" style={{ width: 720, maxHeight: '80vh' }} onClick={e => e.stopPropagation()}>
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 24px 12px' }}>
          <h2 style={{ fontSize: 18, fontWeight: 800 }}>버전 선택</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#ef4444', fontSize: 20, cursor: 'pointer', fontWeight: 700 }}>✕</button>
        </div>

        {/* Version Grid */}
        <div style={{ padding: '8px 24px 24px', overflowY: 'auto', maxHeight: 'calc(80vh - 60px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
            {VERSIONS.map(v => (
              <div
                key={v}
                className={`version-card ${selectedVersion === v ? 'selected' : ''}`}
                onClick={() => { onSelect(v); onClose(); }}
              >
                {v}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
