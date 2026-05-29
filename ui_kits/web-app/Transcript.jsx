const SPEAKER_STYLES = {
  CHILD:     { bg: '#D8ECDF', fg: '#1A3C34', dot: '#2D6A4F', label: '아동' },
  THERAPIST: { bg: '#DBEAFE', fg: '#1D4ED8', dot: '#3B82F6', label: '치료사' },
  UNKNOWN:   { bg: '#EEF1EF', fg: '#4B5650', dot: '#9AA3A0', label: '미상' },
};

const transcriptStyles = {
  row: (active) => ({
    display: 'flex', gap: 14,
    padding: '12px 14px',
    borderRadius: 10,
    background: active ? '#fff' : '#fff',
    border: active ? '1.5px solid #2D6A4F' : '1px solid #EEF1EF',
    boxShadow: active ? '0 0 0 3px rgba(45,106,79,0.12)' : 'none',
    cursor: 'pointer',
    transition: 'all 120ms',
  }),
  rowAlt: { background: '#F4FAF6', border: '1px solid #ECF5EF' },
  ts: {
    fontFamily: "'JetBrains Mono', monospace",
    fontSize: 11, color: '#6B7280',
    fontVariantNumeric: 'tabular-nums',
    paddingTop: 4, minWidth: 56, flexShrink: 0,
  },
  chip: (sp) => ({
    display: 'inline-flex', alignItems: 'center', gap: 5,
    padding: '0 9px', height: 22, borderRadius: 999,
    background: SPEAKER_STYLES[sp].bg,
    color:      SPEAKER_STYLES[sp].fg,
    fontSize: 11, fontWeight: 600,
    alignSelf: 'flex-start', marginTop: 1, flexShrink: 0,
    whiteSpace: 'nowrap',
  }),
  dot: (sp) => ({ width: 5, height: 5, borderRadius: 999, background: SPEAKER_STYLES[sp].dot }),
  text: { flex: 1, fontSize: 13.5, color: '#1A1A1A', lineHeight: 1.55 },
  textMuted: { color: '#6B7280', fontStyle: 'italic' },
  editFlag: { background: '#FEF3C7', borderRadius: 3, padding: '0 3px' },
  editIcon: { color: '#6B7280', padding: 4, opacity: 0, transition: 'opacity 120ms' },
};

const Transcript = ({ utterances, activeIndex, onSelect }) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      {utterances.map((u, i) => {
        const sp = SPEAKER_STYLES[u.speaker];
        const isAlt = u.speaker === 'THERAPIST';
        const active = i === activeIndex;
        return (
          <div
            key={i}
            style={{
              ...transcriptStyles.row(active),
              ...(isAlt && !active ? transcriptStyles.rowAlt : {}),
            }}
            onClick={() => onSelect && onSelect(i)}
          >
            <div style={transcriptStyles.ts}>{u.t}</div>
            <span style={transcriptStyles.chip(u.speaker)}>
              <span style={transcriptStyles.dot(u.speaker)} />
              {sp.label}
            </span>
            <div style={{ ...transcriptStyles.text, ...(u.speaker === 'UNKNOWN' ? transcriptStyles.textMuted : {}) }}>
              {u.edited
                ? <>큰… <span style={transcriptStyles.editFlag}>차고지를</span> 만들었어요 빨간색이랑 파란색이랑.</>
                : u.text
              }
            </div>
          </div>
        );
      })}
    </div>
  );
};

Object.assign(window, { Transcript, SPEAKER_STYLES });
