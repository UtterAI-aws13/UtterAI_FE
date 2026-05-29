// =============================================================
// SessionDetailV2 — Step 3 (Review/Transcript)
// =============================================================

const SPEAKER_OPTIONS = [
  { value: 'CHILD', label: '아동' },
  { value: 'THERAPIST', label: '치료사' },
  { value: 'UNKNOWN', label: '미상' },
];

const reviewStyles = {
  toolbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 16px', background: '#F4FAF6',
    borderRadius: 10, marginBottom: 14, gap: 12, flexWrap: 'wrap',
  },
  toolbarLeft: { display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: '#4B5650' },
  progressPill: {
    display: 'inline-flex', alignItems: 'center', gap: 8,
    padding: '4px 12px', background: '#fff', borderRadius: 999,
    border: '1px solid #D8ECDF',
    fontSize: 12, fontWeight: 600, color: '#1A3C34',
  },
  utt: ({ selected, editing }) => ({
    display: 'grid',
    gridTemplateColumns: '32px 60px 90px 1fr 80px',
    gap: 12, alignItems: 'flex-start',
    padding: '12px 14px',
    background: selected ? '#ECF5EF' : '#fff',
    border: editing ? '1.5px solid #2D6A4F' : selected ? '1px solid #B7DEC8' : '1px solid #EEF1EF',
    borderRadius: 10, marginBottom: 6,
    boxShadow: editing ? '0 0 0 3px rgba(45,106,79,0.12)' : 'none',
    transition: 'all 120ms',
  }),
  checkbox: (checked) => ({
    width: 18, height: 18, borderRadius: 4,
    border: checked ? 'none' : '1.5px solid #C9CFCC',
    background: checked ? '#1A3C34' : '#fff',
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    color: '#fff', cursor: 'pointer', marginTop: 2, flexShrink: 0,
    transition: 'all 120ms',
  }),
  ts: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6B7280', fontVariantNumeric: 'tabular-nums', paddingTop: 4 },
  textArea: {
    width: '100%', minHeight: 50, padding: '6px 10px',
    border: '1px solid #C9CFCC', borderRadius: 6,
    fontSize: 13.5, color: '#1A1A1A', lineHeight: 1.5,
    fontFamily: 'var(--font-sans)', outline: 'none',
    boxSizing: 'border-box', resize: 'vertical',
  },
  text: { fontSize: 13.5, color: '#1A1A1A', lineHeight: 1.5, padding: '4px 0', cursor: 'text' },
  textMuted: { color: '#6B7280', fontStyle: 'italic' },
  reviewedBadge: (reviewed) => ({
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 999,
    background: reviewed ? '#DCFCE7' : '#FEF3C7',
    color: reviewed ? '#15803D' : '#B45309',
    fontSize: 10.5, fontWeight: 600,
    height: 22,
  }),
  // Speaker menu
  speakerWrap: { position: 'relative' },
  speakerBtn: (sp) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '0 9px', height: 24, borderRadius: 999,
    background: SPEAKER_STYLES[sp].bg,
    color:      SPEAKER_STYLES[sp].fg,
    fontSize: 11, fontWeight: 600,
    border: 'none', cursor: 'pointer',
    whiteSpace: 'nowrap',
  }),
  menu: {
    position: 'absolute', top: 'calc(100% + 4px)', left: 0, zIndex: 20,
    background: '#fff', borderRadius: 10,
    boxShadow: '0 12px 24px -8px rgba(15,42,36,0.16), 0 4px 8px -4px rgba(15,42,36,0.08)',
    border: '1px solid #E2E6E4',
    padding: 4, minWidth: 130,
  },
  menuItem: (active) => ({
    display: 'flex', alignItems: 'center', gap: 8,
    padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
    fontSize: 12, fontWeight: 500,
    background: active ? '#ECF5EF' : 'transparent',
    color: active ? '#1A3C34' : '#1A1A1A',
  }),
  // Bulk action bar
  bulkBar: {
    position: 'sticky', top: 64, zIndex: 8,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '10px 14px', marginBottom: 12,
    background: '#1A3C34', borderRadius: 10,
    color: '#fff',
    boxShadow: '0 8px 16px -4px rgba(15,42,36,0.20)',
  },
};

const StepReview = ({ utts, setUtts, editingId, setEditingId, openSpeakerMenu, setOpenSpeakerMenu, selectedIds, setSelectedIds, onFinalize }) => {
  const total = utts.length;
  const reviewed = utts.filter((u) => u.reviewed).length;
  const allReviewed = reviewed === total;

  // close speaker menus on outside click
  React.useEffect(() => {
    const handler = (e) => {
      if (!e.target.closest('[data-speaker-menu]')) setOpenSpeakerMenu(null);
    };
    if (openSpeakerMenu !== null) document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [openSpeakerMenu]);

  const toggleSelect = (id) => {
    setSelectedIds((s) => {
      const next = new Set(s);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const toggleAll = () => {
    if (selectedIds.size === utts.length) setSelectedIds(new Set());
    else setSelectedIds(new Set(utts.map((u) => u.id)));
  };

  const changeSpeaker = (id, speaker) => {
    setUtts((arr) => arr.map((u) => u.id === id ? { ...u, speaker, reviewed: true } : u));
    setOpenSpeakerMenu(null);
  };

  const bulkSetSpeaker = (speaker) => {
    setUtts((arr) => arr.map((u) => selectedIds.has(u.id) ? { ...u, speaker, reviewed: true } : u));
    setSelectedIds(new Set());
  };

  const editText = (id, text) => {
    setUtts((arr) => arr.map((u) => u.id === id ? { ...u, text, reviewed: true } : u));
  };

  const addUtt = () => {
    const next = {
      id: Date.now(),
      t: '신규',
      speaker: 'CHILD',
      text: '새 발화 구간을 입력해주세요…',
      reviewed: false,
    };
    setUtts((arr) => [...arr, next]);
    setEditingId(next.id);
  };

  const markReviewed = (id) => setUtts((arr) => arr.map((u) => u.id === id ? { ...u, reviewed: true } : u));

  return (
    <div style={sdStyles.pane}>
      <div style={sdStyles.paneHeader}>
        <div>
          <div style={sdStyles.paneTitle}>전사 검토</div>
          <div style={sdStyles.paneSubtitle}>AI가 생성한 전사를 검토하고 화자·발화 내용을 수정해주세요.</div>
        </div>
        <Button variant="primary" icon="check" disabled={!allReviewed} onClick={onFinalize}>전사 확정</Button>
      </div>

      <div style={sdStyles.paneBody}>
        {/* Toolbar */}
        <div style={reviewStyles.toolbar}>
          <div style={reviewStyles.toolbarLeft}>
            <span style={reviewStyles.progressPill}>
              <Icon name="check" size={12} strokeWidth={3} />
              검토 진행률 · <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{reviewed}/{total}</span>
            </span>
            <div style={{ width: 140, height: 6, background: '#fff', borderRadius: 999, border: '1px solid #D8ECDF', overflow: 'hidden' }}>
              <div style={{ width: `${(reviewed / total) * 100}%`, height: '100%', background: '#2D6A4F', transition: 'width 200ms' }} />
            </div>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#6B7280' }}>
              {selectedIds.size > 0 ? `${selectedIds.size}개 선택됨` : `${total}개 발화`}
            </span>
            <Button variant="ghost" size="sm" onClick={toggleAll}>
              {selectedIds.size === utts.length ? '전체 선택 해제' : '전체 선택'}
            </Button>
          </div>
        </div>

        {/* Bulk action bar (only when something selected) */}
        {selectedIds.size > 0 && (
          <div style={reviewStyles.bulkBar}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, fontWeight: 600 }}>
              <Icon name="check" size={15} strokeWidth={3} />
              {selectedIds.size}개 발화 선택됨
            </div>
            <div style={{ display: 'flex', gap: 6, alignItems: 'center' }}>
              <span style={{ fontSize: 11, opacity: 0.8, marginRight: 4 }}>일괄 화자 변경:</span>
              {SPEAKER_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => bulkSetSpeaker(opt.value)}
                  style={{
                    padding: '4px 12px', borderRadius: 999, border: 'none', cursor: 'pointer',
                    background: SPEAKER_STYLES[opt.value].bg,
                    color: SPEAKER_STYLES[opt.value].fg,
                    fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)',
                  }}
                >
                  {opt.label}
                </button>
              ))}
              <button
                onClick={() => setSelectedIds(new Set())}
                style={{ marginLeft: 6, padding: 6, borderRadius: 6, background: 'transparent', border: 'none', color: '#fff', opacity: 0.7, cursor: 'pointer' }}
              ><Icon name="x" size={14} strokeWidth={2.4} /></button>
            </div>
          </div>
        )}

        {/* Utterances */}
        <div>
          {utts.map((u) => {
            const isEditing = editingId === u.id;
            const isSelected = selectedIds.has(u.id);
            const isMenuOpen = openSpeakerMenu === u.id;
            return (
              <div key={u.id} style={reviewStyles.utt({ selected: isSelected, editing: isEditing })}>
                {/* Checkbox */}
                <div style={reviewStyles.checkbox(isSelected)} onClick={() => toggleSelect(u.id)}>
                  {isSelected && <Icon name="check" size={11} strokeWidth={3.5} color="#fff" />}
                </div>

                {/* Timestamp */}
                <div style={reviewStyles.ts}>{u.t}</div>

                {/* Speaker dropdown */}
                <div style={reviewStyles.speakerWrap} data-speaker-menu>
                  <button
                    style={reviewStyles.speakerBtn(u.speaker)}
                    onClick={(e) => { e.stopPropagation(); setOpenSpeakerMenu(isMenuOpen ? null : u.id); }}
                  >
                    <span style={{ width: 5, height: 5, borderRadius: 999, background: SPEAKER_STYLES[u.speaker].dot }} />
                    {SPEAKER_STYLES[u.speaker].label}
                    <Icon name="chevronDown" size={11} strokeWidth={2.2} />
                  </button>
                  {isMenuOpen && (
                    <div style={reviewStyles.menu}>
                      {SPEAKER_OPTIONS.map((opt) => (
                        <div
                          key={opt.value}
                          style={reviewStyles.menuItem(u.speaker === opt.value)}
                          onClick={(e) => { e.stopPropagation(); changeSpeaker(u.id, opt.value); }}
                        >
                          <span style={{ width: 8, height: 8, borderRadius: 999, background: SPEAKER_STYLES[opt.value].dot }} />
                          {opt.label}
                          {u.speaker === opt.value && (
                            <Icon name="check" size={12} strokeWidth={2.5} color="#1A3C34" style={{ marginLeft: 'auto' }} />
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Text — click to edit */}
                {isEditing ? (
                  <textarea
                    style={reviewStyles.textArea}
                    defaultValue={u.text}
                    autoFocus
                    onBlur={(e) => { editText(u.id, e.target.value); setEditingId(null); }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                        editText(u.id, e.target.value); setEditingId(null);
                      }
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                  />
                ) : (
                  <div
                    style={{ ...reviewStyles.text, ...(u.speaker === 'UNKNOWN' ? reviewStyles.textMuted : {}) }}
                    onClick={() => { setEditingId(u.id); markReviewed(u.id); }}
                    title="클릭하여 편집"
                  >
                    {u.text}
                  </div>
                )}

                {/* Review badge */}
                <span style={reviewStyles.reviewedBadge(u.reviewed)}>
                  {u.reviewed ? <><Icon name="check" size={10} strokeWidth={3.5} /> 검토</> : '미검토'}
                </span>
              </div>
            );
          })}

          <button
            onClick={addUtt}
            style={{
              width: '100%', marginTop: 8, padding: '12px',
              background: 'transparent', border: '1.5px dashed #C9CFCC',
              borderRadius: 10, cursor: 'pointer',
              color: '#2D6A4F', fontWeight: 600, fontSize: 13,
              fontFamily: 'var(--font-sans)',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              transition: 'all 120ms',
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#F4FAF6'; e.currentTarget.style.borderColor = '#7FB196'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.borderColor = '#C9CFCC'; }}
          >
            <Icon name="plus" size={14} strokeWidth={2.4} /> 구간 추가
          </button>
        </div>

        {!allReviewed && (
          <div style={{ marginTop: 16, padding: '12px 14px', background: '#FEF3C7', borderRadius: 8, fontSize: 12, color: '#92400E', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="info" size={14} color="#B45309" />
            <span>아직 검토되지 않은 발화가 <b>{total - reviewed}개</b> 있습니다. 모든 발화를 검토해야 전사를 확정할 수 있어요.</span>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { StepReview, SPEAKER_OPTIONS });
