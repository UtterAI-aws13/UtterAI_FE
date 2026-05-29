const tableStyles = {
  shell: {
    background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12,
    overflow: 'hidden',
    boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
  },
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '1px solid #EEF1EF',
  },
  title: { fontSize: 15, fontWeight: 600, color: '#1A1A1A' },
  filters: { display: 'flex', gap: 8, alignItems: 'center' },
  searchWrap: { position: 'relative' },
  search: {
    border: '1px solid #E2E6E4', borderRadius: 6, height: 32,
    padding: '0 10px 0 30px', fontSize: 12, width: 200,
    fontFamily: 'var(--font-sans)', color: '#1A1A1A',
    background: '#fff', outline: 'none',
  },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: 13, fontFamily: 'var(--font-sans)' },
  th: {
    textAlign: 'left', padding: '11px 18px',
    fontSize: 11, fontWeight: 600, color: '#6B7280',
    letterSpacing: '0.04em', textTransform: 'uppercase',
    background: '#F6F8F7', borderBottom: '1px solid #EEF1EF',
    whiteSpace: 'nowrap',
  },
  td: { padding: '12px 18px', borderTop: '1px solid #EEF1EF', verticalAlign: 'middle' },
  rowHover: { background: '#F4FAF6' },
  child: { fontWeight: 600, color: '#1A1A1A' },
  age: { color: '#6B7280', fontSize: 11, marginLeft: 8 },
  mono: { fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', fontVariantNumeric: 'tabular-nums' },
  kindChip: (kind) => ({
    display: 'inline-block',
    padding: '2px 8px', borderRadius: 6, fontSize: 11, fontWeight: 500,
    background: kind === '그룹' ? '#FEF3C7' : '#ECF5EF',
    color:      kind === '그룹' ? '#B45309' : '#1A3C34',
  }),
  actionBtn: {
    background: 'transparent', border: 'none', cursor: 'pointer',
    padding: '4px 8px', borderRadius: 6,
    color: '#2D6A4F', fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-sans)',
    display: 'inline-flex', alignItems: 'center', gap: 4,
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 18px', borderTop: '1px solid #EEF1EF',
    fontSize: 12, color: '#6B7280',
  },
  pageBtn: (active) => ({
    padding: '4px 9px', borderRadius: 6, cursor: 'pointer',
    background: active ? '#1A3C34' : 'transparent',
    color: active ? '#fff' : '#4B5650',
    fontWeight: 600, fontSize: 12, fontFamily: 'var(--font-mono)',
  }),
};

const SessionTable = ({ sessions, onOpen, title = '최근 세션' }) => {
  const [hover, setHover] = React.useState(null);
  const actionLabel = (s) => {
    if (s === 'REPORT_READY')        return { label: '리포트 보기', variant: 'primary' };
    if (s === 'ANALYSIS_COMPLETED')  return { label: '검토하기',     variant: 'primary' };
    if (s === 'ANALYSIS_PROCESSING') return { label: '진행 보기',    variant: 'ghost' };
    if (s === 'AUDIO_UPLOADED')      return { label: '분석 시작',    variant: 'primary' };
    if (s === 'CREATED')             return { label: '오디오 업로드', variant: 'primary' };
    if (s === 'FAILED')              return { label: '재시도',       variant: 'secondary' };
    return { label: '열기', variant: 'ghost' };
  };

  return (
    <div style={tableStyles.shell}>
      <div style={tableStyles.toolbar}>
        <div style={tableStyles.title}>{title}</div>
        <div style={tableStyles.filters}>
          <div style={tableStyles.searchWrap}>
            <span style={{ position: 'absolute', left: 9, top: 8, color: '#9AA3A0', pointerEvents: 'none' }}>
              <Icon name="search" size={14} />
            </span>
            <input style={tableStyles.search} placeholder="아동 이름 검색…" />
          </div>
          <Button variant="ghost" size="sm" icon="calendar">이번 주</Button>
        </div>
      </div>
      <table style={tableStyles.table}>
        <thead>
          <tr>
            <th style={tableStyles.th}>아동</th>
            <th style={tableStyles.th}>세션</th>
            <th style={tableStyles.th}>날짜 <span style={{ color: '#2D6A4F' }}>↓</span></th>
            <th style={tableStyles.th}>유형</th>
            <th style={tableStyles.th}>상태</th>
            <th style={{ ...tableStyles.th, textAlign: 'right' }}>MLU</th>
            <th style={{ ...tableStyles.th, textAlign: 'right' }}>액션</th>
          </tr>
        </thead>
        <tbody>
          {sessions.map((s) => {
            const a = actionLabel(s.status);
            return (
              <tr
                key={s.id}
                onMouseEnter={() => setHover(s.id)}
                onMouseLeave={() => setHover(null)}
                style={hover === s.id ? tableStyles.rowHover : null}
              >
                <td style={tableStyles.td}>
                  <span style={tableStyles.child}>{s.child}</span>
                  <span style={tableStyles.age}>{s.age}</span>
                </td>
                <td style={{ ...tableStyles.td, ...tableStyles.mono }}>#{String(s.id).padStart(3, '0')}</td>
                <td style={{ ...tableStyles.td, ...tableStyles.mono }}>{s.date} {s.time}</td>
                <td style={tableStyles.td}><span style={tableStyles.kindChip(s.kind)}>{s.kind}</span></td>
                <td style={tableStyles.td}><StatusBadge status={s.status} showEnum={false} /></td>
                <td style={{ ...tableStyles.td, textAlign: 'right', fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', color: s.mlu ? '#1A1A1A' : '#9AA3A0' }}>
                  {s.mlu ?? '—'}
                </td>
                <td style={{ ...tableStyles.td, textAlign: 'right' }}>
                  <Button size="sm" variant={a.variant} onClick={() => onOpen && onOpen(s)}>{a.label}</Button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
      <div style={tableStyles.footer}>
        <span>총 <b style={{ color: '#1A1A1A' }}>38</b>건 중 1–7</span>
        <div style={{ display: 'flex', gap: 4 }}>
          <span style={tableStyles.pageBtn(false)}>‹</span>
          <span style={tableStyles.pageBtn(true)}>1</span>
          <span style={tableStyles.pageBtn(false)}>2</span>
          <span style={tableStyles.pageBtn(false)}>3</span>
          <span style={tableStyles.pageBtn(false)}>›</span>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { SessionTable });
