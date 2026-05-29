// =============================================================
// Children list (아동 관리) + registration modal
// =============================================================

const childrenData = [
  { id: 1, name: '박서윤', dob: '2020.04.15', age: '6세 2개월', gender: 'F', registered: '2024.10.02', sessions: 24, lastSession: '2026.05.28', primaryGoal: '표현언어 지연' },
  { id: 2, name: '이하준', dob: '2020.09.20', age: '5세 8개월', gender: 'M', registered: '2025.01.14', sessions: 18, lastSession: '2026.05.28', primaryGoal: '조음 오류' },
  { id: 3, name: '최예나', dob: '2021.06.10', age: '4세 11개월', gender: 'F', registered: '2025.03.22', sessions: 12, lastSession: '2026.05.27', primaryGoal: '언어 발달 지연' },
  { id: 4, name: '정도윤', dob: '2019.04.03', age: '7세 1개월', gender: 'M', registered: '2024.06.08', sessions: 32, lastSession: '2026.05.27', primaryGoal: '말 유창성' },
  { id: 5, name: '강하린', dob: '2020.12.18', age: '5세 4개월', gender: 'F', registered: '2025.02.11', sessions: 16, lastSession: '2026.05.26', primaryGoal: '어휘 확장' },
  { id: 6, name: '윤시아', dob: '2019.10.05', age: '6세 7개월', gender: 'F', registered: '2024.08.30', sessions: 28, lastSession: '2026.05.26', primaryGoal: '문장 구성' },
  { id: 7, name: '한이서', dob: '2021.12.22', age: '4세 5개월', gender: 'M', registered: '2025.05.04', sessions: 6,  lastSession: '2026.05.25', primaryGoal: '초기 어휘' },
  { id: 8, name: '서지호', dob: '2020.02.14', age: '6세 3개월', gender: 'M', registered: '2024.11.19', sessions: 22, lastSession: '2026.05.24', primaryGoal: '화용 언어' },
];

const childrenStyles = {
  shell: { background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)' },
  toolbar: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '14px 18px', borderBottom: '1px solid #EEF1EF', gap: 12 },
  filterChips: { display: 'flex', gap: 6 },
  chip: (active) => ({
    padding: '5px 11px', borderRadius: 999,
    fontSize: 12, fontWeight: 500, cursor: 'pointer',
    background: active ? '#1A3C34' : 'transparent',
    color: active ? '#fff' : '#4B5650',
    border: active ? '1px solid #1A3C34' : '1px solid #E2E6E4',
    transition: 'all 120ms',
  }),
  searchWrap: { position: 'relative', flex: 1, maxWidth: 320 },
  search: {
    border: '1px solid #E2E6E4', borderRadius: 8, height: 36,
    padding: '0 12px 0 34px', fontSize: 13, width: '100%',
    fontFamily: 'var(--font-sans)', color: '#1A1A1A',
    background: '#fff', outline: 'none', boxSizing: 'border-box',
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
  avatar: (g) => ({
    width: 32, height: 32, borderRadius: 999, flexShrink: 0,
    background: g === 'F' ? '#FCE4EC' : g === 'M' ? '#DBEAFE' : '#EEF1EF',
    color:      g === 'F' ? '#B72B6B' : g === 'M' ? '#1D4ED8' : '#4B5650',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700,
  }),
  genderChip: (g) => ({
    display: 'inline-block', padding: '2px 8px', borderRadius: 6,
    fontSize: 11, fontWeight: 500,
    background: g === 'F' ? '#FCE4EC' : g === 'M' ? '#DBEAFE' : '#EEF1EF',
    color:      g === 'F' ? '#B72B6B' : g === 'M' ? '#1D4ED8' : '#4B5650',
  }),
  mono: { fontFamily: "'JetBrains Mono', monospace", color: '#6B7280', fontVariantNumeric: 'tabular-nums' },
  iconBtn: {
    width: 28, height: 28, borderRadius: 8,
    background: 'transparent', border: 'none',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#6B7280', cursor: 'pointer', transition: 'background 120ms',
  },
};

const genderLabel = { M: '남아', F: '여아', U: '미입력' };

const ChildrenList = ({ onOpenChild, onToast }) => {
  const [query, setQuery] = React.useState('');
  const [filter, setFilter] = React.useState('all'); // all | active | new
  const [modalOpen, setModalOpen] = React.useState(false);
  const [hoverRow, setHoverRow] = React.useState(null);
  const [confirmDel, setConfirmDel] = React.useState(null);
  const [children, setChildren] = React.useState(childrenData);

  const filtered = children.filter((c) => {
    if (query && !c.name.includes(query)) return false;
    if (filter === 'new') {
      const reg = new Date(c.registered.replaceAll('.', '-'));
      const cutoff = new Date('2026-03-01');
      if (reg < cutoff) return false;
    }
    return true;
  });

  const onRegister = (child) => {
    setChildren((cs) => [{ ...child, id: cs.length + 1, sessions: 0, lastSession: '—', age: '—', registered: '2026.05.28' }, ...cs]);
    setModalOpen(false);
    onToast && onToast({ title: '아동이 등록되었습니다', body: `${child.name} 아동이 명단에 추가되었어요.` });
  };

  const onDelete = () => {
    setChildren((cs) => cs.filter((c) => c.id !== confirmDel.id));
    onToast && onToast({ title: '아동 정보가 삭제되었습니다', body: `${confirmDel.name} 아동과 관련된 세션 기록도 함께 삭제되었어요.` });
    setConfirmDel(null);
  };

  return (
    <>
      <PageHeader
        title="아동 관리"
        subtitle={`총 ${children.length}명의 아동`}
        actions={<Button variant="primary" icon="plus" onClick={() => setModalOpen(true)}>아동 등록</Button>}
      />

      <div style={appStyles.page}>
        <div style={childrenStyles.shell}>
          <div style={childrenStyles.toolbar}>
            <div style={childrenStyles.searchWrap}>
              <span style={{ position: 'absolute', left: 11, top: 11, color: '#9AA3A0', pointerEvents: 'none' }}>
                <Icon name="search" size={14} />
              </span>
              <input
                style={childrenStyles.search}
                placeholder="아동 이름 검색…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>
            <div style={childrenStyles.filterChips}>
              <span style={childrenStyles.chip(filter === 'all')} onClick={() => setFilter('all')}>전체</span>
              <span style={childrenStyles.chip(filter === 'active')} onClick={() => setFilter('active')}>활동 중</span>
              <span style={childrenStyles.chip(filter === 'new')} onClick={() => setFilter('new')}>최근 등록</span>
            </div>
          </div>

          {filtered.length === 0 ? (
            <EmptyChildren onAdd={() => setModalOpen(true)} hasQuery={!!query} />
          ) : (
            <table style={childrenStyles.table}>
              <thead>
                <tr>
                  <th style={childrenStyles.th}>이름</th>
                  <th style={childrenStyles.th}>생년월일</th>
                  <th style={childrenStyles.th}>성별</th>
                  <th style={childrenStyles.th}>주 목표</th>
                  <th style={childrenStyles.th}>등록일</th>
                  <th style={{ ...childrenStyles.th, textAlign: 'right' }}>세션 수</th>
                  <th style={{ ...childrenStyles.th, textAlign: 'right' }}>액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onMouseEnter={() => setHoverRow(c.id)}
                    onMouseLeave={() => setHoverRow(null)}
                    onClick={() => onOpenChild && onOpenChild(c)}
                    style={{ cursor: 'pointer', ...(hoverRow === c.id ? childrenStyles.rowHover : null) }}
                  >
                    <td style={childrenStyles.td}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={childrenStyles.avatar(c.gender)}>{c.name[0]}</div>
                        <div>
                          <div style={{ fontWeight: 600, color: '#1A1A1A' }}>{c.name}</div>
                          <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{c.age}</div>
                        </div>
                      </div>
                    </td>
                    <td style={{ ...childrenStyles.td, ...childrenStyles.mono }}>{c.dob}</td>
                    <td style={childrenStyles.td}><span style={childrenStyles.genderChip(c.gender)}>{genderLabel[c.gender]}</span></td>
                    <td style={{ ...childrenStyles.td, color: '#4B5650' }}>{c.primaryGoal}</td>
                    <td style={{ ...childrenStyles.td, ...childrenStyles.mono }}>{c.registered}</td>
                    <td style={{ ...childrenStyles.td, textAlign: 'right' }}>
                      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, fontVariantNumeric: 'tabular-nums' }}>{c.sessions}</span>
                      <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 3 }}>회</span>
                    </td>
                    <td style={{ ...childrenStyles.td, textAlign: 'right' }}>
                      <div style={{ display: 'inline-flex', gap: 2, opacity: hoverRow === c.id ? 1 : 0.55, transition: 'opacity 120ms' }}>
                        <button
                          style={childrenStyles.iconBtn}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#ECF5EF'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                          onClick={(e) => { e.stopPropagation(); onOpenChild && onOpenChild(c); }}
                          title="상세 보기"
                        >
                          <Icon name="chevronRight" size={14} strokeWidth={2.2} />
                        </button>
                        <button
                          style={childrenStyles.iconBtn}
                          onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#B91C1C'; }}
                          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#6B7280'; }}
                          onClick={(e) => { e.stopPropagation(); setConfirmDel(c); }}
                          title="삭제"
                        >
                          <Icon name="trash" size={14} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {modalOpen && <ChildRegisterModal onClose={() => setModalOpen(false)} onSubmit={onRegister} />}
      {confirmDel && <DeleteConfirmModal child={confirmDel} onCancel={() => setConfirmDel(null)} onConfirm={onDelete} />}
    </>
  );
};

const EmptyChildren = ({ onAdd, hasQuery }) => (
  <div style={{ padding: '56px 24px', textAlign: 'center' }}>
    <div style={{ width: 64, height: 64, borderRadius: 16, background: '#ECF5EF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#2D6A4F', marginBottom: 14 }}>
      <Icon name="users" size={28} strokeWidth={1.8} />
    </div>
    <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>
      {hasQuery ? '검색 결과가 없습니다' : '아직 등록된 아동이 없습니다'}
    </div>
    <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, lineHeight: 1.6 }}>
      {hasQuery
        ? '다른 이름으로 다시 시도해보세요.'
        : '첫 아동을 등록하면 세션 분석을 시작할 수 있어요.'}
    </div>
    {!hasQuery && (
      <Button variant="primary" icon="plus" onClick={onAdd} style={{ marginTop: 16 }}>첫 아동 등록하기</Button>
    )}
  </div>
);

Object.assign(window, { ChildrenList, EmptyChildren, childrenData });
