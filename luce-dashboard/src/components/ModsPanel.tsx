import React, { useState, useEffect } from 'react';

interface ModResult {
  slug: string;
  title: string;
  description: string;
  icon_url: string;
  downloads: number;
  categories: string[];
}

export default function ModsPanel() {
  const [query, setQuery] = useState('');
  const [mods, setMods] = useState<ModResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [installed, setInstalled] = useState<Set<string>>(new Set());

  useEffect(() => {
    fetchMods('');
  }, []);

  const fetchMods = async (q: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        limit: '20',
        facets: '[[\"project_type:mod\"]]',
      });
      if (q) params.set('query', q);
      const res = await fetch(`https://api.modrinth.com/v2/search?${params}`);
      const data = await res.json();
      setMods(data.hits || []);
    } catch (err) {
      console.error('Modrinth API error:', err);
    }
    setLoading(false);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchMods(query);
  };

  const toggleInstall = (slug: string) => {
    setInstalled(prev => {
      const next = new Set(prev);
      if (next.has(slug)) next.delete(slug);
      else next.add(slug);
      return next;
    });
  };

  const formatDownloads = (n: number) => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  return (
    <div style={{ height: '100%', display: 'flex', flexDirection: 'column', padding: '24px 32px' }}>
      {/* Search */}
      <form onSubmit={handleSearch} style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', gap: 10 }}>
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="모드 검색... (Modrinth)"
            style={{
              flex: 1,
              background: '#1a1a1a',
              border: '1px solid #333',
              borderRadius: 10,
              padding: '12px 16px',
              color: '#fff',
              fontSize: 14,
              outline: 'none',
            }}
          />
          <button
            type="submit"
            style={{
              background: '#22c55e',
              border: 'none',
              borderRadius: 10,
              padding: '12px 24px',
              color: '#fff',
              fontWeight: 700,
              cursor: 'pointer',
              fontSize: 14,
            }}
          >
            검색
          </button>
        </div>
      </form>

      {/* Mod List */}
      <div style={{ flex: 1, overflowY: 'auto' }}>
        {loading ? (
          <div style={{ textAlign: 'center', color: '#666', paddingTop: 60 }}>로딩 중...</div>
        ) : mods.length === 0 ? (
          <div style={{ textAlign: 'center', color: '#666', paddingTop: 60 }}>모드를 찾을 수 없습니다</div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {mods.map(mod => (
              <div key={mod.slug} className="mod-card" style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <img
                  src={mod.icon_url || 'https://cdn.modrinth.com/placeholder.svg'}
                  alt={mod.title}
                  style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover', background: '#111' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>{mod.title}</div>
                  <div style={{ fontSize: 12, color: '#888', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {mod.description}
                  </div>
                  <div style={{ fontSize: 11, color: '#555', marginTop: 2 }}>
                    ↓ {formatDownloads(mod.downloads)} · {mod.categories?.slice(0, 3).join(', ')}
                  </div>
                </div>
                <button
                  onClick={() => toggleInstall(mod.slug)}
                  style={{
                    background: installed.has(mod.slug) ? '#ef444420' : '#22c55e20',
                    color: installed.has(mod.slug) ? '#ef4444' : '#22c55e',
                    border: `1px solid ${installed.has(mod.slug) ? '#ef444440' : '#22c55e40'}`,
                    borderRadius: 8,
                    padding: '8px 16px',
                    fontWeight: 700,
                    fontSize: 12,
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {installed.has(mod.slug) ? '제거' : '설치'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
