const STATUS_MAP = {
  CREATED:              { bg: '#EEF1EF', fg: '#4B5650', dot: '#9AA3A0', label: '생성됨' },
  AUDIO_UPLOADED:       { bg: '#DBEAFE', fg: '#1D4ED8', dot: '#3B82F6', label: '업로드 완료' },
  ANALYSIS_PROCESSING:  { bg: '#FEF3C7', fg: '#B45309', dot: '#F59E0B', label: '분석 중', spin: true },
  ANALYSIS_COMPLETED:   { bg: '#DCFCE7', fg: '#15803D', dot: '#22C55E', label: '분석 완료' },
  REPORT_READY:         { bg: '#1A3C34', fg: '#fff',    dot: '#B7DEC8', label: '리포트 준비됨', filled: true },
  FAILED:               { bg: '#FEE2E2', fg: '#B91C1C', dot: '#EF4444', label: '실패' },
};

const badgeStyles = {
  base: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    padding: '3px 10px',
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    lineHeight: 1.4,
    whiteSpace: 'nowrap',
  },
  dot: { width: 6, height: 6, borderRadius: 999, flexShrink: 0 },
  dotPulse: { boxShadow: '0 0 0 3px rgba(245,158,11,0.30)' },
};

const StatusBadge = ({ status, showEnum = true }) => {
  const s = STATUS_MAP[status];
  if (!s) return null;
  return (
    <span style={{ ...badgeStyles.base, background: s.bg, color: s.fg }}>
      <span style={{ ...badgeStyles.dot, background: s.dot, ...(s.spin ? badgeStyles.dotPulse : {}) }} />
      {showEnum && (
        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, opacity: 0.85, marginRight: 2 }}>
          {status}
        </span>
      )}
      {s.label}
    </span>
  );
};

Object.assign(window, { StatusBadge, STATUS_MAP });
