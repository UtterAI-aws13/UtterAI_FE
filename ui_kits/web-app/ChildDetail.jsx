// =============================================================
// Child detail page + 세션 생성 modal
// =============================================================

const childDetailStyles = {
  layout: { display: 'grid', gridTemplateColumns: 'minmax(280px, 32%) 1fr', gap: 20, padding: '0 32px 32px', alignItems: 'flex-start' },
  card: { background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12, boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)' },

  profileTop: { padding: '24px 22px 18px', textAlign: 'center', borderBottom: '1px solid #EEF1EF' },
  bigAvatar: (g) => ({
    width: 80, height: 80, borderRadius: 999, margin: '0 auto 12px',
    background: g === 'F' ? '#FCE4EC' : g === 'M' ? '#DBEAFE' : '#D8ECDF',
    color:      g === 'F' ? '#B72B6B' : g === 'M' ? '#1D4ED8' : '#1A3C34',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 32, fontWeight: 700,
    boxShadow: '0 0 0 6px #fff, 0 0 0 7px #E2E6E4',
  }),
  name: { fontSize: 20, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' },
  age: { fontSize: 12, color: '#6B7280', marginTop: 4 },

  infoList: { padding: '14px 22px 4px' },
  infoRow: {
    display: 'grid', gridTemplateColumns: '90px 1fr',
    fontSize: 13, padding: '8px 0',
    borderBottom: '1px solid #F6F8F7',
    alignItems: 'baseline',
  },
  infoLabel: { fontSize: 11, color: '#6B7280', fontWeight: 500, letterSpacing: '0.02em' },
  infoValue: { color: '#1A1A1A', fontWeight: 500 },
  memoSection: { padding: '14px 22px 18px' },
  memoLabel: { fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 },
  memoBox: (editing) => ({
    background: editing ? '#fff' : '#F4FAF6',
    border: editing ? '1.5px solid #2D6A4F' : '1px solid #EEF1EF',
    borderRadius: 8, padding: '10px 12px',
    fontSize: 12.5, color: '#2E3733', lineHeight: 1.55,
    minHeight: 60,
    boxShadow: editing ? '0 0 0 3px rgba(45,106,79,0.18)' : 'none',
    transition: 'all 120ms',
    fontFamily: 'var(--font-sans)',
    width: '100%', boxSizing: 'border-box', resize: 'vertical', outline: 'none',
  }),

  actionsBar: { display: 'flex', gap: 8, padding: '14px 22px', borderTop: '1px solid #EEF1EF', background: '#F6F8F7' },

  sectionHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '1px solid #EEF1EF',
  },
  sectionTitle: { fontSize: 15, fontWeight: 600, color: '#1A1A1A' },
  countPill: {
    display: 'inline-block', marginLeft: 8,
    padding: '1px 9px', borderRadius: 999,
    background: '#ECF5EF', color: '#1A3C34',
    fontSize: 11, fontWeight: 600,
  },

  // session row (compact card style)
  sessionRow: {
    display: 'grid',
    gridTemplateColumns: '54px 1fr auto auto auto',
    gap: 14, alignItems: 'center',
    padding: '14px 18px', borderTop: '1px solid #EEF1EF',
    cursor: 'pointer', transition: 'background 120ms',
  },
  dateBadge: {
    background: '#F4FAF6', border: '1px solid #D8ECDF', borderRadius: 8,
    padding: '6px 4px', textAlign: 'center', minWidth: 54,
  },
  dateMonth: { fontSize: 10, fontWeight: 600, color: '#2D6A4F', textTransform: 'uppercase', letterSpacing: '0.04em' },
  dateDay: { fontSize: 17, fontWeight: 700, color: '#1A3C34', fontFamily: "'JetBrains Mono', monospace", lineHeight: 1.1, marginTop: 2 },
  sessionTitle: { fontSize: 13.5, fontWeight: 600, color: '#1A1A1A' },
  sessionMeta: { fontSize: 11, color: '#6B7280', marginTop: 2, display: 'flex', gap: 8, alignItems: 'center' },
  audioChip: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 6,
    background: '#ECF5EF', color: '#1A3C34',
    fontSize: 10.5, fontWeight: 500,
  },
};

// Build session list scoped to this child (re-uses dashboard sessions + adds older ones)
const childSessions = [
  { id: 24, date: '2026.05.28', time: '14:00', kind: '언어치료', status: 'ANALYSIS_COMPLETED', duration: '60분', hasAudio: true,  utterances: 128 },
  { id: 20, date: '2026.05.21', time: '14:00', kind: '언어치료', status: 'REPORT_READY',       duration: '60분', hasAudio: true,  utterances: 104 },
  { id: 17, date: '2026.05.14', time: '14:00', kind: '언어평가', status: 'ANALYSIS_COMPLETED', duration: '90분', hasAudio: true,  utterances: 162 },
  { id: 14, date: '2026.05.07', time: '14:00', kind: '언어치료', status: 'REPORT_READY',       duration: '60분', hasAudio: true,  utterances: 96 },
  { id: 11, date: '2026.04.30', time: '14:00', kind: '언어치료', status: 'REPORT_READY',       duration: '60분', hasAudio: true,  utterances: 88 },
  { id: 8,  date: '2026.04.23', time: '14:00', kind: '기타',     status: 'CREATED',            duration: '30분', hasAudio: false, utterances: 0 },
];

const kindLabel = { '언어평가': { bg: '#FEF3C7', fg: '#B45309' }, '언어치료': { bg: '#ECF5EF', fg: '#1A3C34' }, '기타': { bg: '#EEF1EF', fg: '#4B5650' } };

const formatMonth = (date) => {
  const [, m, d] = date.split('.');
  return { m: `${parseInt(m, 10)}월`, d };
};

const ChildDetail = ({ child, onBack, onOpenSession, onToast }) => {
  const [editingMemo, setEditingMemo] = React.useState(false);
  const [memo, setMemo] = React.useState(child.memo || '활발하고 호기심이 많은 아동입니다. 인형이나 동물 카드에 흥미를 잘 보입니다. 보호자는 어머니 (010-****-3214) 주 연락처.');
  const [hoverRow, setHoverRow] = React.useState(null);
  const [createOpen, setCreateOpen] = React.useState(false);
  const [sessions, setSessions] = React.useState(childSessions);

  const handleCreate = (s) => {
    setSessions((arr) => [{
      id: 25, date: s.date, time: '14:00', kind: s.kind,
      status: 'CREATED', duration: '60분', hasAudio: false, utterances: 0,
    }, ...arr]);
    setCreateOpen(false);
    onToast && onToast({ title: '세션이 생성되었습니다', body: '이제 오디오 파일을 업로드해서 분석을 시작하세요.' });
  };

  return (
    <>
      <PageHeader
        title={`${child.name} · 아동 프로필`}
        subtitle={`${child.age} · 등록일 ${child.registered}`}
        breadcrumbs={[
          { label: '대시보드', onClick: () => onBack && onBack('dashboard') },
          { label: '아동 관리', onClick: () => onBack && onBack('children') },
          { label: child.name },
        ]}
        actions={
          <>
            <Button variant="ghost" icon="arrowLeft" onClick={() => onBack && onBack('children')}>목록으로</Button>
            <Button variant="primary" icon="mic" onClick={() => setCreateOpen(true)}>세션 생성</Button>
          </>
        }
      />

      <div style={childDetailStyles.layout}>
        {/* LEFT: profile card */}
        <div style={childDetailStyles.card}>
          <div style={childDetailStyles.profileTop}>
            <div style={childDetailStyles.bigAvatar(child.gender)}>{child.name[0]}</div>
            <div style={childDetailStyles.name}>{child.name}</div>
            <div style={childDetailStyles.age}>
              {child.dob} · {child.age} · {genderLabel[child.gender]}
            </div>
          </div>

          <div style={childDetailStyles.infoList}>
            <div style={childDetailStyles.infoRow}>
              <span style={childDetailStyles.infoLabel}>주 목표</span>
              <span style={childDetailStyles.infoValue}>{child.primaryGoal}</span>
            </div>
            <div style={childDetailStyles.infoRow}>
              <span style={childDetailStyles.infoLabel}>담당 치료사</span>
              <span style={childDetailStyles.infoValue}>{UtterData.me.name} {UtterData.me.role}</span>
            </div>
            <div style={childDetailStyles.infoRow}>
              <span style={childDetailStyles.infoLabel}>총 세션</span>
              <span style={childDetailStyles.infoValue}>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontVariantNumeric: 'tabular-nums', fontWeight: 600 }}>{child.sessions}</span>
                <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 3 }}>회</span>
              </span>
            </div>
            <div style={{ ...childDetailStyles.infoRow, borderBottom: 'none' }}>
              <span style={childDetailStyles.infoLabel}>최근 세션</span>
              <span style={{ ...childDetailStyles.infoValue, fontFamily: "'JetBrains Mono', monospace", color: '#4B5650' }}>{child.lastSession}</span>
            </div>
          </div>

          <div style={childDetailStyles.memoSection}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ ...childDetailStyles.memoLabel, marginBottom: 0 }}>메모</span>
              {!editingMemo ? (
                <button
                  onClick={() => setEditingMemo(true)}
                  style={{ background: 'transparent', border: 'none', color: '#2D6A4F', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, padding: 0, fontFamily: 'var(--font-sans)' }}
                >
                  <Icon name="edit" size={12} strokeWidth={2} /> 편집
                </button>
              ) : (
                <button
                  onClick={() => { setEditingMemo(false); onToast && onToast({ title: '메모가 저장되었습니다' }); }}
                  style={{ background: 'transparent', border: 'none', color: '#1A3C34', fontSize: 11, fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 3, padding: 0, fontFamily: 'var(--font-sans)' }}
                >
                  <Icon name="check" size={12} strokeWidth={2.5} /> 저장
                </button>
              )}
            </div>
            {editingMemo ? (
              <textarea
                style={childDetailStyles.memoBox(true)}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                autoFocus
                rows={4}
              />
            ) : (
              <div style={childDetailStyles.memoBox(false)}>{memo || <span style={{ color: '#9AA3A0' }}>메모가 없습니다.</span>}</div>
            )}
          </div>

          <div style={childDetailStyles.actionsBar}>
            <Button variant="ghost" size="sm" icon="edit" style={{ flex: 1 }}>정보 수정</Button>
            <Button variant="ghost" size="sm" icon="download" style={{ flex: 1 }}>전체 리포트</Button>
          </div>
        </div>

        {/* RIGHT: sessions */}
        <div style={childDetailStyles.card}>
          <div style={childDetailStyles.sectionHeader}>
            <div>
              <span style={childDetailStyles.sectionTitle}>세션 목록</span>
              <span style={childDetailStyles.countPill}>{sessions.length}</span>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="sm" icon="calendar">최근 6개월</Button>
              <Button variant="primary" size="sm" icon="plus" onClick={() => setCreateOpen(true)}>세션 생성</Button>
            </div>
          </div>

          {sessions.map((s) => {
            const f = formatMonth(s.date);
            const k = kindLabel[s.kind];
            return (
              <div
                key={s.id}
                style={{ ...childDetailStyles.sessionRow, ...(hoverRow === s.id ? { background: '#F4FAF6' } : {}) }}
                onMouseEnter={() => setHoverRow(s.id)}
                onMouseLeave={() => setHoverRow(null)}
                onClick={() => onOpenSession && onOpenSession({ ...s, child: child.name, age: child.age })}
              >
                <div style={childDetailStyles.dateBadge}>
                  <div style={childDetailStyles.dateMonth}>{f.m}</div>
                  <div style={childDetailStyles.dateDay}>{f.d}</div>
                </div>
                <div>
                  <div style={childDetailStyles.sessionTitle}>
                    세션 #{String(s.id).padStart(3, '0')} · <span style={{ display: 'inline-block', padding: '1px 7px', borderRadius: 5, background: k.bg, color: k.fg, fontSize: 11, fontWeight: 500, marginLeft: 2 }}>{s.kind}</span>
                  </div>
                  <div style={childDetailStyles.sessionMeta}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{s.time}</span>
                    <span style={{ color: '#C9CFCC' }}>·</span>
                    <span>{s.duration}</span>
                    {s.utterances > 0 && <>
                      <span style={{ color: '#C9CFCC' }}>·</span>
                      <span>{s.utterances}개 발화</span>
                    </>}
                  </div>
                </div>
                {s.hasAudio && (
                  <span style={childDetailStyles.audioChip}>
                    <Icon name="audio" size={10} strokeWidth={2} /> 오디오
                  </span>
                )}
                <StatusBadge status={s.status} showEnum={false} />
                <button
                  onClick={(e) => { e.stopPropagation(); onOpenSession && onOpenSession({ ...s, child: child.name, age: child.age }); }}
                  style={{ background: 'transparent', border: 'none', color: '#2D6A4F', fontWeight: 600, fontSize: 12, cursor: 'pointer', padding: '4px 6px', display: 'inline-flex', alignItems: 'center', gap: 3, fontFamily: 'var(--font-sans)' }}
                >
                  상세 보기 <Icon name="chevronRight" size={12} strokeWidth={2.2} />
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {createOpen && (
        <SessionCreateModal
          childName={child.name}
          onClose={() => setCreateOpen(false)}
          onSubmit={handleCreate}
        />
      )}
    </>
  );
};

// -------- Session create modal --------
const SessionCreateModal = ({ childName, onClose, onSubmit }) => {
  const [date, setDate] = React.useState('2026.05.28');
  const [kind, setKind] = React.useState('언어치료');
  const [memo, setMemo] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const submit = () => {
    const errs = {};
    if (!date) errs.date = '세션 날짜를 선택해주세요.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({ date, kind, memo });
  };

  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div style={modalStyles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div>
            <div style={modalStyles.title}>새 세션 생성</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{childName} 아동의 새 세션을 생성합니다.</div>
          </div>
          <button style={modalStyles.closeBtn} onClick={onClose}>
            <Icon name="x" size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div style={modalStyles.body}>
          <div style={modalStyles.fieldGroup}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <TextField
                label="세션 날짜" required
                value={date} onChange={setDate}
                placeholder="2026.05.28"
                error={errors.date}
              />
              <div>
                <label style={modalStyles.label}>세션 유형 <span style={modalStyles.required}>*</span></label>
                <select
                  value={kind}
                  onChange={(e) => setKind(e.target.value)}
                  style={{ ...modalStyles.input(false), background: '#fff', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236B7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpolyline points=%276 9 12 15 18 9%27/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
                >
                  <option>언어평가</option>
                  <option>언어치료</option>
                  <option>기타</option>
                </select>
              </div>
            </div>

            <div>
              <label style={modalStyles.label}>메모 <span style={{ color: '#9AA3A0', fontWeight: 400 }}>(선택)</span></label>
              <textarea
                style={modalStyles.textarea}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="이번 세션에서 다룰 목표·활동·주의 사항 등"
              />
            </div>

            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10, padding: 12, background: '#ECF5EF', borderRadius: 8 }}>
              <div style={{ color: '#1A3C34', flexShrink: 0, marginTop: 1 }}><Icon name="info" size={14} strokeWidth={2} /></div>
              <div style={{ fontSize: 11.5, color: '#245249', lineHeight: 1.55 }}>
                세션 생성 후 오디오 파일을 업로드하면 AI 분석이 자동으로 시작됩니다. 파일은 한 번 업로드된 후 90일간 보관됩니다.
              </div>
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" icon="plus" onClick={submit}>세션 생성</Button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { ChildDetail, SessionCreateModal, childSessions });
