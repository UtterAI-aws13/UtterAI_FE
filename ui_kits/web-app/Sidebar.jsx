const sidebarStyles = {
  root: {
    width: 248,
    flexShrink: 0,
    background: '#fff',
    borderRight: '1px solid #E2E6E4',
    display: 'flex',
    flexDirection: 'column',
    padding: '18px 14px 14px',
    fontFamily: 'var(--font-sans)',
    height: '100vh',
    position: 'sticky',
    top: 0,
  },
  brand: {
    display: 'flex', alignItems: 'center', gap: 9,
    padding: '4px 8px 18px',
  },
  brandMark: {
    width: 30, height: 30, borderRadius: 8, background: '#1A3C34',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  brandText: {
    fontSize: 16, fontWeight: 700, color: '#1A3C34', letterSpacing: '-0.01em',
  },
  sectionLabel: {
    fontSize: 10, fontWeight: 600, color: '#9AA3A0',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    padding: '12px 10px 6px',
  },
  item: (active) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '8px 10px',
    borderRadius: 8,
    fontSize: 13, fontWeight: active ? 600 : 500,
    color: active ? '#1A3C34' : '#4B5650',
    background: active ? '#ECF5EF' : 'transparent',
    textDecoration: 'none', cursor: 'pointer',
    marginBottom: 2,
    transition: 'background 120ms',
  }),
  itemBadge: {
    marginLeft: 'auto',
    fontSize: 10, fontWeight: 700,
    background: '#D8ECDF', color: '#1A3C34',
    padding: '1px 7px', borderRadius: 999,
  },
  footer: {
    marginTop: 'auto',
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 8px', borderTop: '1px solid #EEF1EF', marginTop: 'auto',
  },
  avatar: {
    width: 32, height: 32, borderRadius: 999,
    background: '#B7DEC8', color: '#1A3C34',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 12, fontWeight: 700, flexShrink: 0,
  },
};

const NAV = [
  { id: 'dashboard', label: '대시보드', icon: 'grid' },
  { id: 'children',  label: '아동 관리', icon: 'users' },
  { id: 'sessions',  label: '세션 관리', icon: 'audio', badge: 3 },
  { id: 'reports',   label: '리포트',   icon: 'report' },
  { id: 'templates', label: '템플릿 관리', icon: 'fileText' },
];

const Sidebar = ({ active, onNavigate, me, onLogout }) => {
  return (
    <aside style={sidebarStyles.root}>
      <div style={sidebarStyles.brand}>
        <div style={sidebarStyles.brandMark}>
          <svg width="18" height="18" viewBox="0 0 64 64" fill="none">
            <rect x="6" y="26" width="6" height="12" rx="3" fill="#B7DEC8"/>
            <rect x="16" y="18" width="6" height="28" rx="3" fill="#B7DEC8"/>
            <rect x="26" y="10" width="6" height="44" rx="3" fill="#7FB196"/>
            <rect x="36" y="16" width="6" height="32" rx="3" fill="#B7DEC8"/>
            <rect x="46" y="24" width="6" height="16" rx="3" fill="#B7DEC8"/>
          </svg>
        </div>
        <span style={sidebarStyles.brandText}>UtterAI</span>
      </div>

      <div style={sidebarStyles.sectionLabel}>메인</div>
      {NAV.map((item) => (
        <a key={item.id} style={sidebarStyles.item(active === item.id)} onClick={() => onNavigate(item.id)}>
          <Icon name={item.icon} size={16} />
          {item.label}
          {item.badge && <span style={sidebarStyles.itemBadge}>{item.badge}</span>}
        </a>
      ))}

      <div style={sidebarStyles.sectionLabel}>관리</div>
      <a style={sidebarStyles.item(active === 'settings')} onClick={() => onNavigate('settings')}>
        <Icon name="settings" size={16} />
        설정
      </a>

      <div style={sidebarStyles.footer}>
        <div style={sidebarStyles.avatar}>{me.initial}</div>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.name} {me.role}</div>
          <div style={{ fontSize: 10, color: '#6B7280', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{me.org}</div>
        </div>
        {onLogout && (
          <button
            onClick={onLogout}
            title="로그아웃"
            style={{
              width: 26, height: 26, borderRadius: 6,
              background: 'transparent', border: 'none',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#9AA3A0', cursor: 'pointer', flexShrink: 0, marginLeft: 2,
              transition: 'all 120ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#B91C1C'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#9AA3A0'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
          </button>
        )}
      </div>
    </aside>
  );
};

Object.assign(window, { Sidebar });
