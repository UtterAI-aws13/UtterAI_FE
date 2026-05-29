// =============================================================
// SOAP Template management
// Sidebar item: "템플릿 관리" — Settings sub-page
// Layout: list left 35% / editor right 65%
// =============================================================

const initialTemplates = [
  {
    id: 'sys-default',
    name: '기본 시스템 템플릿',
    isSystem: true,
    isDefault: false,
    updatedAt: '2025.12.01',
    sections: {
      S: { title: '주관적 정보', prompt: '아동·보호자가 보고한 호소, 일상 생활에서의 변화, 자발 발화 등 주관적 정보를 정리합니다.', defaultContent: '', limit: 600 },
      O: { title: '객관적 정보', prompt: '세션 중 관찰된 사실, 발화 횟수, 정량 지표(MLU, TTR 등), 시도된 활동과 결과를 객관적으로 기술합니다.', defaultContent: '', limit: 800 },
      A: { title: '평가',       prompt: '관찰한 객관적 정보를 바탕으로 임상적 판단을 작성합니다. 발달 수준, 강·약점, 진단적 인상을 포함합니다.', defaultContent: '', limit: 600 },
      P: { title: '계획',       prompt: '다음 세션의 목표, 보호자 안내 사항, 가정 내 모델링 권고 사항을 구체적으로 작성합니다.', defaultContent: '', limit: 600 },
    },
  },
  {
    id: 'tpl-1',
    name: '언어치료 표준 (개별)',
    isSystem: false,
    isDefault: true,
    updatedAt: '2026.05.14',
    sections: {
      S: { title: '주관적 보고', prompt: '보호자 면담 내용, 아동의 자발 발화에서 드러난 감정·일상 보고를 중심으로 작성. 또래 관계, 어린이집 적응 상황을 함께 다룬다.', defaultContent: '보호자 보고: \n아동 자발 발화: ', limit: 500 },
      O: { title: '관찰된 사실', prompt: 'MLU, TTR, 발화 빈도, 새로 사용된 어휘를 우선 기술. 사용된 활동(그림 카드, 책 읽기 등)과 아동의 반응 정도를 함께 포함.', defaultContent: '세션 시간: 60분\nMLU: \nTTR: \n새 어휘: ', limit: 800 },
      A: { title: '평가',       prompt: '또래 평균 범위(MLU 기준)와 비교한 발달 위치, 복문 사용 빈도, 정서 어휘 확장 정도를 평가.', defaultContent: '', limit: 500 },
      P: { title: '다음 세션 계획', prompt: '구체적인 활동(그림책 활용 등), 가정 내 모델링 권고, 다음 회기 목표를 항목으로 구분해 작성.', defaultContent: '• 다음 세션 활동: \n• 가정 권고: \n• 다음 회기 목표: ', limit: 600 },
    },
  },
  {
    id: 'tpl-2',
    name: '언어평가 (초기 평가)',
    isSystem: false,
    isDefault: false,
    updatedAt: '2026.04.22',
    sections: {
      S: { title: '주호소 및 발달 이력', prompt: '보호자가 보고한 주호소, 출생력, 발달 이정표, 가족력을 포함.', defaultContent: '', limit: 800 },
      O: { title: '평가 결과', prompt: '시행된 표준화 검사(K-MB CDI, PRES 등)의 점수와 백분위, 자발 발화 샘플 분석 결과.', defaultContent: '시행 검사: \n점수/백분위: ', limit: 1000 },
      A: { title: '진단적 인상', prompt: '평가 결과를 바탕으로 한 진단적 인상, 강·약점, 예후.', defaultContent: '', limit: 500 },
      P: { title: '치료 권고', prompt: '치료 회기 권고(주 횟수, 회당 시간), 가정 내 자극 권고, 재평가 시점.', defaultContent: '권고 회기: 주 2회, 회당 50분\n가정 권고: \n재평가 시점: ', limit: 500 },
    },
  },
  {
    id: 'tpl-3',
    name: '그룹 세션',
    isSystem: false,
    isDefault: false,
    updatedAt: '2026.03.08',
    sections: {
      S: { title: '주관적 정보', prompt: '그룹 내 또래 상호작용, 보호자 보고 사항.', defaultContent: '', limit: 400 },
      O: { title: '관찰',       prompt: '그룹 내 발화 빈도, 차례 지키기, 또래 모방 정도. 개별 활동 시 행동.', defaultContent: '', limit: 600 },
      A: { title: '평가',       prompt: '사회적 의사소통 능력 평가.', defaultContent: '', limit: 400 },
      P: { title: '계획',       prompt: '그룹·개별 목표, 다음 회기 활동.', defaultContent: '', limit: 400 },
    },
  },
];

const SECTION_ACCENTS = {
  S: { bg: '#DBEAFE', fg: '#1D4ED8', dot: '#3B82F6', name: 'Subjective' },
  O: { bg: '#DCFCE7', fg: '#15803D', dot: '#22C55E', name: 'Objective' },
  A: { bg: '#FEF3C7', fg: '#B45309', dot: '#F59E0B', name: 'Assessment' },
  P: { bg: '#D8ECDF', fg: '#1A3C34', dot: '#2D6A4F', name: 'Plan' },
};

const tplStyles = {
  layout: { display: 'grid', gridTemplateColumns: '35% 1fr', gap: 20, padding: '0 32px 32px', alignItems: 'flex-start' },
  pane: {
    background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12,
    boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
    overflow: 'hidden',
  },
  paneHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '14px 18px', borderBottom: '1px solid #EEF1EF',
  },
  paneTitle: { fontSize: 14, fontWeight: 600, color: '#1A1A1A' },
  paneSubtitle: { fontSize: 11, color: '#6B7280', marginTop: 2 },
  paneBody: { padding: '8px 12px' },

  // -- list cards
  tplCard: ({ active, locked }) => ({
    position: 'relative',
    padding: '12px 14px',
    margin: '4px 0',
    border: active ? '1.5px solid #2D6A4F' : '1px solid #EEF1EF',
    background: active ? '#F4FAF6' : '#fff',
    borderRadius: 10,
    cursor: 'pointer',
    transition: 'all 120ms',
    boxShadow: active ? '0 0 0 3px rgba(45,106,79,0.10)' : 'none',
  }),
  tplName: { fontSize: 13.5, fontWeight: 600, color: '#1A1A1A', display: 'flex', alignItems: 'center', gap: 6 },
  tplMeta: { fontSize: 11, color: '#6B7280', marginTop: 4, fontFamily: "'JetBrains Mono', monospace" },
  defaultBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 999,
    background: '#1A3C34', color: '#fff',
    fontSize: 10, fontWeight: 600,
  },
  lockChip: {
    display: 'inline-flex', alignItems: 'center', gap: 4,
    padding: '2px 8px', borderRadius: 999,
    background: '#EEF1EF', color: '#4B5650',
    fontSize: 10, fontWeight: 600,
  },
  hoverActions: (visible) => ({
    position: 'absolute', top: 10, right: 10,
    display: 'flex', gap: 2,
    opacity: visible ? 1 : 0,
    transition: 'opacity 120ms',
    pointerEvents: visible ? 'auto' : 'none',
  }),
  iconAction: {
    width: 26, height: 26, borderRadius: 6,
    background: '#fff', border: '1px solid #E2E6E4',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#4B5650', cursor: 'pointer',
    boxShadow: '0 1px 2px rgba(15,42,36,0.06)',
  },

  // -- editor
  nameInput: {
    flex: 1, fontSize: 16, fontWeight: 700, color: '#1A1A1A',
    border: '1px solid transparent', background: 'transparent',
    padding: '6px 10px', borderRadius: 8, outline: 'none',
    fontFamily: 'var(--font-sans)', letterSpacing: '-0.01em',
    width: '100%', boxSizing: 'border-box',
  },
  switchWrap: { display: 'flex', alignItems: 'center', gap: 10 },
  switch: (on) => ({
    width: 36, height: 20, borderRadius: 999,
    background: on ? '#1A3C34' : '#C9CFCC',
    position: 'relative', cursor: 'pointer',
    transition: 'background 160ms',
  }),
  switchThumb: (on) => ({
    position: 'absolute', top: 2, left: on ? 18 : 2,
    width: 16, height: 16, borderRadius: 999, background: '#fff',
    transition: 'left 160ms cubic-bezier(0.22, 1, 0.36, 1)',
    boxShadow: '0 1px 2px rgba(0,0,0,0.18)',
  }),

  // -- section editor
  section: { border: '1px solid #E2E6E4', borderRadius: 10, marginBottom: 14, overflow: 'hidden' },
  sectionHead: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px', background: '#F6F8F7', borderBottom: '1px solid #EEF1EF',
  },
  sectionLetter: (k) => ({
    width: 30, height: 30, borderRadius: 8,
    background: SECTION_ACCENTS[k].fg, color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace", fontWeight: 700, fontSize: 14,
    flexShrink: 0,
  }),
  sectionAccentName: (k) => ({
    fontSize: 10, fontWeight: 600, color: SECTION_ACCENTS[k].fg,
    letterSpacing: '0.04em', textTransform: 'uppercase',
  }),
  sectionBody: { padding: 16 },
  fieldLabel: { display: 'block', fontSize: 11, fontWeight: 600, color: '#4B5650', letterSpacing: '0.02em', marginBottom: 6 },
  textInput: (focused) => ({
    width: '100%', height: 36, padding: '0 12px',
    border: focused ? '1.5px solid #2D6A4F' : '1px solid #C9CFCC',
    borderRadius: 6,
    fontSize: 13, color: '#1A1A1A',
    fontFamily: 'var(--font-sans)', outline: 'none',
    boxSizing: 'border-box',
    boxShadow: focused ? '0 0 0 3px rgba(45,106,79,0.18)' : 'none',
    transition: 'all 120ms',
  }),
  textArea: (focused) => ({
    width: '100%', minHeight: 60, padding: '10px 12px',
    border: focused ? '1.5px solid #2D6A4F' : '1px solid #C9CFCC',
    borderRadius: 6,
    fontSize: 13, color: '#1A1A1A', lineHeight: 1.55,
    fontFamily: 'var(--font-sans)', outline: 'none',
    boxSizing: 'border-box', resize: 'vertical',
    boxShadow: focused ? '0 0 0 3px rgba(45,106,79,0.18)' : 'none',
    transition: 'all 120ms',
  }),
  helper: { fontSize: 11, color: '#6B7280', marginTop: 5 },
  charLimit: (current, max) => ({
    fontSize: 10, fontFamily: "'JetBrains Mono', monospace",
    color: current > max * 0.9 ? '#B45309' : '#9AA3A0',
    marginTop: 5, textAlign: 'right',
  }),

  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '14px 18px', background: '#F6F8F7', borderTop: '1px solid #EEF1EF',
  },
};

// -------- Field with focus ring --------
const FocusInput = ({ value, onChange, multiline, ...rest }) => {
  const [focus, setFocus] = React.useState(false);
  const Tag = multiline ? 'textarea' : 'input';
  return (
    <Tag
      value={value}
      onChange={(e) => onChange(e.target.value)}
      onFocus={() => setFocus(true)}
      onBlur={() => setFocus(false)}
      style={multiline ? tplStyles.textArea(focus) : tplStyles.textInput(focus)}
      {...rest}
    />
  );
};

const Switch = ({ on, onChange, disabled }) => (
  <div
    style={{ ...tplStyles.switch(on), ...(disabled ? { opacity: 0.5, cursor: 'not-allowed' } : {}) }}
    onClick={disabled ? undefined : onChange}
  >
    <div style={tplStyles.switchThumb(on)} />
  </div>
);

// -------- Template list card --------
const TemplateListCard = ({ tpl, active, onClick, onDelete, onSetDefault, onDuplicate }) => {
  const [hover, setHover] = React.useState(false);
  return (
    <div
      style={tplStyles.tplCard({ active, locked: tpl.isSystem })}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div style={tplStyles.tplName}>
        {tpl.isSystem && (
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        )}
        {tpl.name}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 6 }}>
        {tpl.isDefault && (
          <span style={tplStyles.defaultBadge}>
            <Icon name="check" size={9} strokeWidth={3.5} /> 기본 템플릿
          </span>
        )}
        {tpl.isSystem && (
          <span style={tplStyles.lockChip}>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
            잠김 · 읽기 전용
          </span>
        )}
        <span style={{ marginLeft: 'auto', fontSize: 10.5, color: '#9AA3A0', fontFamily: "'JetBrains Mono', monospace" }}>
          {tpl.updatedAt}
        </span>
      </div>

      {!tpl.isSystem && (
        <div style={tplStyles.hoverActions(hover || active)}>
          {!tpl.isDefault && (
            <button
              style={tplStyles.iconAction}
              title="기본 템플릿으로 설정"
              onClick={(e) => { e.stopPropagation(); onSetDefault(); }}
              onMouseEnter={(e) => { e.currentTarget.style.background = '#ECF5EF'; e.currentTarget.style.color = '#1A3C34'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#4B5650'; }}
            >
              <Icon name="check" size={13} strokeWidth={2.4} />
            </button>
          )}
          <button
            style={tplStyles.iconAction}
            title="복제"
            onClick={(e) => { e.stopPropagation(); onDuplicate(); }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#ECF5EF'; e.currentTarget.style.color = '#1A3C34'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#4B5650'; }}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
          </button>
          <button
            style={tplStyles.iconAction}
            title="삭제"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#B91C1C'; e.currentTarget.style.borderColor = '#FCA5A5'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#4B5650'; e.currentTarget.style.borderColor = '#E2E6E4'; }}
          >
            <Icon name="trash" size={13} strokeWidth={2} />
          </button>
        </div>
      )}
    </div>
  );
};

Object.assign(window, { initialTemplates, SECTION_ACCENTS, tplStyles, FocusInput, Switch, TemplateListCard });
