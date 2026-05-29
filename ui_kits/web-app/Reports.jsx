// =============================================================
// Reports list (리포트) + slide-in detail panel
// =============================================================

const reportsList = [
  { id: 'R-2026-024', title: '5월 4주차 언어치료 리포트', child: '박서윤', age: '6세 2개월', sessionDate: '2026.05.28', createdAt: '2026.05.28 14:48', state: 'READY', sharedWith: '보호자', mlu: 4.27, mluDelta: '+0.34' },
  { id: 'R-2026-023', title: '5월 4주차 언어치료 리포트', child: '이하준', age: '5세 8개월', sessionDate: '2026.05.28', createdAt: '2026.05.28 12:10', state: 'READY', sharedWith: '미공유',   mlu: 3.62, mluDelta: '+0.12' },
  { id: 'R-2026-022', title: '5월 4주차 그룹 세션 리포트', child: '최예나', age: '4세 11개월', sessionDate: '2026.05.27', createdAt: '2026.05.27 17:30', state: 'READY', sharedWith: '보호자', mlu: 3.91, mluDelta: '+0.08' },
  { id: 'R-2026-021', title: '월간 언어 평가 리포트',     child: '정도윤', age: '7세 1개월', sessionDate: '2026.05.27', createdAt: '2026.05.27 13:45', state: 'DELETED', sharedWith: '—',     mlu: null, mluDelta: null },
  { id: 'R-2026-019', title: '5월 4주차 언어치료 리포트', child: '윤시아', age: '6세 7개월', sessionDate: '2026.05.26', createdAt: '2026.05.26 11:22', state: 'READY', sharedWith: '보호자', mlu: 4.12, mluDelta: '+0.21' },
  { id: 'R-2026-017', title: '5월 3주차 언어 평가 리포트', child: '강하린', age: '5세 4개월', sessionDate: '2026.05.21', createdAt: '2026.05.21 16:15', state: 'READY', sharedWith: '미공유', mlu: 3.45, mluDelta: '−0.04' },
  { id: 'R-2026-015', title: '5월 3주차 언어치료 리포트', child: '서지호', age: '6세 3개월', sessionDate: '2026.05.20', createdAt: '2026.05.20 15:00', state: 'READY', sharedWith: '보호자', mlu: 3.88, mluDelta: '+0.15' },
  { id: 'R-2026-014', title: '5월 3주차 언어치료 리포트', child: '한이서', age: '4세 5개월', sessionDate: '2026.05.19', createdAt: '2026.05.19 14:32', state: 'READY', sharedWith: '미공유', mlu: 2.94, mluDelta: '+0.31' },
];

const reportsStyles = {
  filterBar: {
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '14px 18px', background: '#fff',
    border: '1px solid #E2E6E4', borderRadius: 12,
    boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
    marginBottom: 16,
  },
  searchWrap: { position: 'relative', flex: 1, maxWidth: 320 },
  search: {
    border: '1px solid #E2E6E4', borderRadius: 8, height: 36,
    padding: '0 12px 0 34px', fontSize: 13, width: '100%',
    fontFamily: 'var(--font-sans)', color: '#1A1A1A',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
  },
  dateRange: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '0 12px', height: 36,
    border: '1px solid #E2E6E4', borderRadius: 8,
    fontSize: 12, color: '#1A1A1A', background: '#fff',
    fontFamily: 'var(--font-sans)', cursor: 'pointer',
  },
  chipFilter: (active) => ({
    padding: '0 12px', height: 30, display: 'inline-flex', alignItems: 'center',
    borderRadius: 999, fontSize: 12, fontWeight: 500, cursor: 'pointer',
    background: active ? '#1A3C34' : 'transparent',
    color: active ? '#fff' : '#4B5650',
    border: active ? '1px solid #1A3C34' : '1px solid #E2E6E4',
    transition: 'all 120ms',
  }),
  grid: {
    display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 14,
  },
  card: ({ deleted, selected }) => ({
    background: '#fff',
    border: selected ? '1.5px solid #2D6A4F' : '1px solid #E2E6E4',
    borderRadius: 12,
    padding: 18,
    boxShadow: selected
      ? '0 0 0 3px rgba(45,106,79,0.12), 0 1px 3px rgba(15,42,36,0.06)'
      : '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
    cursor: 'pointer',
    opacity: deleted ? 0.65 : 1,
    transition: 'all 120ms',
    display: 'flex', flexDirection: 'column', gap: 10,
  }),
  cardId: { fontSize: 10, color: '#9AA3A0', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: '0.04em' },
  cardTitle: { fontSize: 14, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.45 },
  cardMeta: { display: 'flex', alignItems: 'center', gap: 8, fontSize: 12, color: '#6B7280' },
  cardAvatar: (g) => ({
    width: 22, height: 22, borderRadius: 999, flexShrink: 0,
    background: g === 'F' ? '#FCE4EC' : g === 'M' ? '#DBEAFE' : '#D8ECDF',
    color:      g === 'F' ? '#B72B6B' : g === 'M' ? '#1D4ED8' : '#1A3C34',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 10, fontWeight: 700,
  }),
  cardFooter: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    paddingTop: 10, borderTop: '1px solid #EEF1EF',
  },
  metricInline: {
    display: 'inline-flex', alignItems: 'baseline', gap: 4,
    padding: '4px 10px', borderRadius: 8, background: '#F4FAF6',
  },
  iconBtn: {
    width: 30, height: 30, borderRadius: 8,
    background: 'transparent', border: 'none',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#4B5650', cursor: 'pointer',
    transition: 'all 120ms',
  },
};

const REPORT_STATE = {
  READY:    { bg: '#DCFCE7', fg: '#15803D', dot: '#22C55E', label: 'READY · 완료' },
  DELETED:  { bg: '#FEE2E2', fg: '#B91C1C', dot: '#EF4444', label: 'DELETED · 삭제됨' },
};

const ReportStateChip = ({ state }) => {
  const s = REPORT_STATE[state];
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '3px 9px', borderRadius: 999,
      background: s.bg, color: s.fg,
      fontSize: 10.5, fontWeight: 600,
      fontFamily: "'JetBrains Mono', monospace",
    }}>
      <span style={{ width: 5, height: 5, borderRadius: 999, background: s.dot }} />
      {s.label}
    </span>
  );
};

const ReportsList = ({ onToast }) => {
  const [query, setQuery] = React.useState('');
  const [range, setRange] = React.useState('30d'); // 7d | 30d | 90d | all
  const [openId, setOpenId] = React.useState(null);
  const [stateFilter, setStateFilter] = React.useState('all');

  // Map child name → gender for avatar color
  const childGender = Object.fromEntries(childrenData.map((c) => [c.name, c.gender]));

  const filtered = reportsList.filter((r) => {
    if (query && !r.child.includes(query) && !r.title.includes(query)) return false;
    if (stateFilter !== 'all' && r.state !== stateFilter) return false;
    return true;
  });

  const openReport = filtered.find((r) => r.id === openId) || reportsList.find((r) => r.id === openId);

  return (
    <>
      <PageHeader
        title="리포트"
        subtitle={`총 ${reportsList.length}건의 리포트 · 이번 달 ${reportsList.filter(r => r.state === 'READY').length}건 생성됨`}
        actions={
          <>
            <Button variant="ghost" icon="download">전체 내보내기</Button>
          </>
        }
      />

      <div style={appStyles.page}>
        {/* Filter bar */}
        <div style={reportsStyles.filterBar}>
          <div style={reportsStyles.searchWrap}>
            <span style={{ position: 'absolute', left: 11, top: 11, color: '#9AA3A0', pointerEvents: 'none' }}>
              <Icon name="search" size={14} />
            </span>
            <input
              style={reportsStyles.search}
              placeholder="아동명 또는 리포트 제목 검색…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <div style={reportsStyles.dateRange}>
            <Icon name="calendar" size={13} color="#6B7280" />
            <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1A1A', fontSize: 12 }}>2026.04.29 — 2026.05.28</span>
            <Icon name="chevronDown" size={12} color="#9AA3A0" strokeWidth={2} />
          </div>

          <div style={{ display: 'flex', gap: 6 }}>
            {[
              { id: '7d',  label: '최근 7일' },
              { id: '30d', label: '최근 30일' },
              { id: '90d', label: '최근 90일' },
              { id: 'all', label: '전체' },
            ].map((opt) => (
              <span key={opt.id} style={reportsStyles.chipFilter(range === opt.id)} onClick={() => setRange(opt.id)}>{opt.label}</span>
            ))}
          </div>

          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6 }}>
            <span style={reportsStyles.chipFilter(stateFilter === 'all')} onClick={() => setStateFilter('all')}>전체</span>
            <span style={reportsStyles.chipFilter(stateFilter === 'READY')} onClick={() => setStateFilter('READY')}>완료</span>
            <span style={reportsStyles.chipFilter(stateFilter === 'DELETED')} onClick={() => setStateFilter('DELETED')}>삭제됨</span>
          </div>
        </div>

        {/* Grid */}
        {filtered.length === 0 ? (
          <div style={{
            background: '#fff', border: '1px dashed #C9CFCC', borderRadius: 12,
            padding: '64px 24px', textAlign: 'center',
          }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#ECF5EF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#2D6A4F', marginBottom: 14 }}>
              <Icon name="report" size={24} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: 15, fontWeight: 600 }}>검색 결과가 없습니다</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>다른 검색어나 필터로 다시 시도해보세요.</div>
          </div>
        ) : (
          <div style={reportsStyles.grid}>
            {filtered.map((r) => (
              <ReportCard
                key={r.id}
                report={r}
                gender={childGender[r.child] || 'U'}
                selected={openId === r.id}
                onOpen={() => setOpenId(r.id)}
                onDownload={(e) => { e.stopPropagation(); onToast && onToast({ title: 'PDF 다운로드 시작', body: `${r.id} 리포트를 다운로드합니다.` }); }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Slide-in detail panel */}
      {openReport && (
        <ReportSidePanel
          report={openReport}
          gender={childGender[openReport.child] || 'U'}
          onClose={() => setOpenId(null)}
          onToast={onToast}
        />
      )}
    </>
  );
};

const ReportCard = ({ report, gender, selected, onOpen, onDownload }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={{ ...reportsStyles.card({ deleted: report.state === 'DELETED', selected }), ...(hover && !selected ? { borderColor: '#B7DEC8', transform: 'translateY(-1px)' } : {}) }}
      onClick={onOpen}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
        <div style={reportsStyles.cardId}>{report.id}</div>
        <ReportStateChip state={report.state} />
      </div>

      <div style={reportsStyles.cardTitle}>{report.title}</div>

      <div style={reportsStyles.cardMeta}>
        <span style={reportsStyles.cardAvatar(gender)}>{report.child[0]}</span>
        <span style={{ fontWeight: 600, color: '#1A1A1A' }}>{report.child}</span>
        <span style={{ color: '#C9CFCC' }}>·</span>
        <span>{report.age}</span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6, fontSize: 11, color: '#6B7280' }}>
        <div>
          <span style={{ display: 'block', color: '#9AA3A0', fontWeight: 500, marginBottom: 2 }}>세션 날짜</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1A1A', fontWeight: 600 }}>{report.sessionDate}</span>
        </div>
        <div>
          <span style={{ display: 'block', color: '#9AA3A0', fontWeight: 500, marginBottom: 2 }}>생성일</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A1A1A', fontWeight: 600 }}>{report.createdAt}</span>
        </div>
      </div>

      <div style={reportsStyles.cardFooter}>
        {report.mlu !== null ? (
          <span style={reportsStyles.metricInline}>
            <span style={{ fontSize: 10, fontWeight: 600, color: '#6B7280', fontFamily: "'JetBrains Mono', monospace" }}>MLU</span>
            <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, color: '#1A3C34', fontSize: 13, fontVariantNumeric: 'tabular-nums' }}>{report.mlu}</span>
            <span style={{ fontSize: 10, fontWeight: 600, color: report.mluDelta.startsWith('+') ? '#15803D' : '#B45309' }}>{report.mluDelta}</span>
          </span>
        ) : (
          <span style={{ fontSize: 11, color: '#9AA3A0' }}>지표 없음</span>
        )}

        <div style={{ display: 'flex', gap: 4 }}>
          {report.state === 'READY' && (
            <button
              style={reportsStyles.iconBtn}
              onClick={onDownload}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ECF5EF'; e.currentTarget.style.color = '#1A3C34'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#4B5650'; }}
              title="PDF 다운로드"
            >
              <Icon name="download" size={15} strokeWidth={2} />
            </button>
          )}
          <button
            style={{ ...reportsStyles.iconBtn, color: '#2D6A4F', fontWeight: 600, fontSize: 12, padding: '0 10px', width: 'auto', gap: 3, fontFamily: 'var(--font-sans)' }}
            onClick={(e) => { e.stopPropagation(); onOpen(); }}
          >
            상세 보기 <Icon name="chevronRight" size={12} strokeWidth={2.2} />
          </button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ReportsList, ReportCard, ReportStateChip, reportsList, REPORT_STATE });
