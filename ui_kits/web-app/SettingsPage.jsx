// =============================================================
// Settings page — vertical tab list + right panel
// Tabs: 내 프로필 / 비밀번호 변경 / 알림 설정 (coming soon)
// =============================================================

const settingsStyles = {
  layout: { display: 'grid', gridTemplateColumns: '200px 1fr', gap: 20, padding: '0 32px 32px', alignItems: 'flex-start' },

  tabList: { display: 'flex', flexDirection: 'column', gap: 2 },
  tab: (active, disabled) => ({
    display: 'flex', alignItems: 'center', gap: 10,
    padding: '10px 12px', borderRadius: 8,
    fontSize: 13, fontWeight: active ? 600 : 500,
    color: disabled ? '#9AA3A0' : active ? '#1A3C34' : '#4B5650',
    background: active ? '#ECF5EF' : 'transparent',
    cursor: disabled ? 'not-allowed' : 'pointer',
    transition: 'all 120ms',
    textAlign: 'left',
    border: 'none', width: '100%',
    fontFamily: 'var(--font-sans)',
  }),
  comingBadge: {
    marginLeft: 'auto',
    fontSize: 9, fontWeight: 600,
    background: '#FEF3C7', color: '#B45309',
    padding: '2px 6px', borderRadius: 999,
    letterSpacing: '0.02em',
  },

  card: {
    background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12,
    boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
    overflow: 'hidden',
  },
  cardHeader: {
    padding: '16px 22px', borderBottom: '1px solid #EEF1EF',
  },
  cardTitle: { fontSize: 15, fontWeight: 600, color: '#1A1A1A' },
  cardSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  cardBody: { padding: 22 },

  // profile
  avatarRow: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 22, paddingBottom: 22, borderBottom: '1px solid #EEF1EF' },
  bigAvatar: {
    width: 72, height: 72, borderRadius: 999,
    background: 'linear-gradient(135deg, #1A3C34 0%, #2D6A4F 70%)',
    color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 28, fontWeight: 700, flexShrink: 0,
    boxShadow: '0 4px 8px -2px rgba(26,60,52,0.25)',
  },

  fieldGrid: { display: 'flex', flexDirection: 'column', gap: 18, maxWidth: 480 },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#1A1A1A', marginBottom: 6 },
  input: (focused, disabled) => ({
    width: '100%', height: 40, padding: '0 12px',
    border: focused ? '1.5px solid #2D6A4F' : '1px solid #C9CFCC',
    borderRadius: 6, fontSize: 13, color: disabled ? '#9AA3A0' : '#1A1A1A',
    fontFamily: 'var(--font-sans)', outline: 'none', boxSizing: 'border-box',
    background: disabled ? '#F6F8F7' : '#fff',
    cursor: disabled ? 'not-allowed' : 'text',
    boxShadow: focused ? '0 0 0 3px rgba(45,106,79,0.18)' : 'none',
    transition: 'all 120ms',
  }),
  inputWithIcon: { position: 'relative' },
  inputLockIcon: { position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: '#9AA3A0', pointerEvents: 'none' },
  helper: { fontSize: 11, color: '#9AA3A0', marginTop: 5, display: 'flex', alignItems: 'center', gap: 4 },
  roleBadge: {
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '5px 12px', borderRadius: 999,
    background: '#D8ECDF', color: '#1A3C34',
    fontSize: 12, fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  },
  readonlyText: { fontSize: 13, color: '#1A1A1A', fontWeight: 500 },

  footer: {
    display: 'flex', justifyContent: 'flex-end',
    padding: '14px 22px', background: '#F6F8F7', borderTop: '1px solid #EEF1EF',
  },

  // password show/hide
  pwWrap: { position: 'relative' },
  pwToggle: {
    position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
    background: 'transparent', border: 'none', color: '#9AA3A0', cursor: 'pointer',
    padding: 6, display: 'flex',
  },
};

// password field with toggle
const PwField = ({ value, onChange, placeholder, error, autoComplete }) => {
  const [show, setShow] = React.useState(false);
  const [focus, setFocus] = React.useState(false);
  return (
    <div>
      <div style={settingsStyles.pwWrap}>
        <input
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocus(true)}
          onBlur={() => setFocus(false)}
          style={{ ...settingsStyles.input(focus && !error, false), paddingRight: 40, ...(error ? { border: '1.5px solid #EF4444' } : {}) }}
        />
        <button type="button" style={settingsStyles.pwToggle} onClick={() => setShow((s) => !s)} tabIndex={-1}>
          {show ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
          )}
        </button>
      </div>
      {error && (
        <div style={{ fontSize: 11.5, color: '#B91C1C', marginTop: 6, fontWeight: 500, display: 'flex', alignItems: 'center', gap: 5 }}>
          <Icon name="alert" size={11} strokeWidth={2.5} /> {error}
        </div>
      )}
    </div>
  );
};

const SETTINGS_TABS = [
  { id: 'profile',  label: '내 프로필', icon: 'user' },
  { id: 'password', label: '비밀번호 변경', icon: 'lock' },
  { id: 'notify',   label: '알림 설정', icon: 'bell', coming: true },
];

const SettingsPage = ({ onToast, onLogout }) => {
  const [tab, setTab] = React.useState('profile');

  return (
    <>
      <PageHeader
        title="설정"
        subtitle="프로필과 계정 보안을 관리합니다."
      />
      <div style={settingsStyles.layout}>
        {/* Left vertical tabs */}
        <div style={settingsStyles.tabList}>
          {SETTINGS_TABS.map((t) => (
            <button
              key={t.id}
              style={settingsStyles.tab(tab === t.id, t.coming)}
              onClick={() => !t.coming && setTab(t.id)}
            >
              <Icon name={t.icon} size={16} strokeWidth={1.9} />
              {t.label}
              {t.coming && <span style={settingsStyles.comingBadge}>준비 중</span>}
            </button>
          ))}
        </div>

        {/* Right panel */}
        <div>
          {tab === 'profile'  && <ProfileTab onToast={onToast} />}
          {tab === 'password' && <PasswordTab onToast={onToast} onLogout={onLogout} />}
          {tab === 'notify'   && <NotifyTab />}
        </div>
      </div>
    </>
  );
};

// -------- Tab 1: Profile --------
const ProfileTab = ({ onToast }) => {
  const me = UtterData.me;
  const [name, setName] = React.useState(me.name);
  const [focus, setFocus] = React.useState(false);
  const dirty = name.trim() !== me.name && name.trim() !== '';

  const save = () => {
    onToast && onToast({ title: '프로필이 업데이트되었습니다' });
  };

  return (
    <div style={settingsStyles.card}>
      <div style={settingsStyles.cardHeader}>
        <div style={settingsStyles.cardTitle}>기본 정보</div>
        <div style={settingsStyles.cardSubtitle}>이름과 프로필 사진을 관리합니다.</div>
      </div>
      <div style={settingsStyles.cardBody}>
        <div style={settingsStyles.avatarRow}>
          <div style={settingsStyles.bigAvatar}>{me.initial}</div>
          <div>
            <Button variant="ghost" size="sm" icon="upload" disabled>사진 변경</Button>
            <div style={{ fontSize: 11, color: '#9AA3A0', marginTop: 6 }}>JPG, PNG · 최대 2MB · (준비 중)</div>
          </div>
        </div>

        <div style={settingsStyles.fieldGrid}>
          <div>
            <label style={settingsStyles.label}>이름</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              onFocus={() => setFocus(true)}
              onBlur={() => setFocus(false)}
              style={settingsStyles.input(focus, false)}
            />
          </div>

          <div>
            <label style={settingsStyles.label}>이메일</label>
            <div style={settingsStyles.inputWithIcon}>
              <input value="jiwon.kim@somang-center.kr" disabled style={settingsStyles.input(false, true)} />
              <span style={settingsStyles.inputLockIcon}><Icon name="lock" size={14} /></span>
            </div>
            <div style={settingsStyles.helper}><Icon name="info" size={11} strokeWidth={2} /> 이메일은 변경할 수 없습니다.</div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 18 }}>
            <div>
              <label style={settingsStyles.label}>역할</label>
              <div><span style={settingsStyles.roleBadge}>THERAPIST</span></div>
            </div>
            <div>
              <label style={settingsStyles.label}>가입일</label>
              <div style={{ ...settingsStyles.readonlyText, paddingTop: 7, fontFamily: "'JetBrains Mono', monospace", color: '#4B5650' }}>2026년 1월 15일</div>
            </div>
          </div>
        </div>
      </div>
      <div style={settingsStyles.footer}>
        <Button variant="primary" icon="check" disabled={!dirty} onClick={save}>변경 저장</Button>
      </div>
    </div>
  );
};

// -------- Tab 2: Password --------
const PasswordTab = ({ onToast, onLogout }) => {
  const [current, setCurrent] = React.useState('');
  const [next, setNext] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const strength = pwStrength(next);
  const strengthLabel = ['', '약함', '보통', '강함'][strength];
  const strengthColor = ['#E2E6E4', '#EF4444', '#F59E0B', '#15803D'][strength];

  const submit = () => {
    const errs = {};
    if (!current) errs.current = '현재 비밀번호를 입력해주세요.';
    // demo: "wrong" triggers error; treat "password" as the only correct one
    else if (current !== 'password') errs.current = '현재 비밀번호가 올바르지 않습니다.';
    if (!next) errs.next = '새 비밀번호를 입력해주세요.';
    else if (next.length < 8) errs.next = '비밀번호는 8자 이상이어야 합니다.';
    if (next !== confirm) errs.confirm = '비밀번호가 일치하지 않습니다.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onToast && onToast({ title: '비밀번호가 변경되었습니다', body: '잠시 후 다시 로그인해주세요.' });
      setTimeout(() => onLogout && onLogout(), 3000);
    }, 800);
  };

  return (
    <div style={settingsStyles.card}>
      <div style={settingsStyles.cardHeader}>
        <div style={settingsStyles.cardTitle}>비밀번호 변경</div>
        <div style={settingsStyles.cardSubtitle}>보안을 위해 주기적으로 비밀번호를 변경해주세요.</div>
      </div>
      <div style={settingsStyles.cardBody}>
        <div style={{ ...settingsStyles.fieldGrid, maxWidth: 420 }}>
          <div>
            <label style={settingsStyles.label}>현재 비밀번호</label>
            <PwField value={current} onChange={(v) => { setCurrent(v); if (errors.current) setErrors((e) => ({ ...e, current: undefined })); }} placeholder="현재 비밀번호" error={errors.current} autoComplete="current-password" />
            <div style={{ ...settingsStyles.helper, color: '#9AA3A0' }}>데모: 현재 비밀번호는 "password" 입니다.</div>
          </div>

          <div>
            <label style={settingsStyles.label}>새 비밀번호</label>
            <PwField value={next} onChange={(v) => { setNext(v); if (errors.next) setErrors((e) => ({ ...e, next: undefined })); }} placeholder="새 비밀번호 (8자 이상)" error={errors.next} autoComplete="new-password" />
            {next && !errors.next && (
              <div style={{ marginTop: 8 }}>
                <div style={{ display: 'flex', gap: 4 }}>
                  {[0, 1, 2].map((i) => (
                    <div key={i} style={{ flex: 1, height: 3, borderRadius: 999, background: i < strength ? strengthColor : '#E2E6E4', transition: 'background 120ms' }} />
                  ))}
                </div>
                <div style={{ fontSize: 10.5, color: strengthColor, marginTop: 4, fontWeight: 600 }}>비밀번호 강도: {strengthLabel}</div>
              </div>
            )}
          </div>

          <div>
            <label style={settingsStyles.label}>새 비밀번호 확인</label>
            <PwField value={confirm} onChange={(v) => { setConfirm(v); if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined })); }} placeholder="새 비밀번호 확인" error={errors.confirm} autoComplete="new-password" />
          </div>
        </div>
      </div>
      <div style={settingsStyles.footer}>
        <Button variant="primary" icon="lock" disabled={submitting} onClick={submit}>
          {submitting ? '변경 중…' : '비밀번호 변경'}
        </Button>
      </div>
    </div>
  );
};

// -------- Tab 3: Notify (coming soon) --------
const NotifyTab = () => (
  <div style={settingsStyles.card}>
    <div style={{ padding: '64px 24px', textAlign: 'center', opacity: 0.9 }}>
      <div style={{ width: 64, height: 64, borderRadius: 16, background: '#F6F8F7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3A0', marginBottom: 16 }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round"><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/><path d="M12 2L2 7l10 5 10-5-10-5z"/></svg>
      </div>
      <div style={{ fontSize: 16, fontWeight: 600, color: '#1A1A1A' }}>준비 중입니다</div>
      <div style={{ fontSize: 12.5, color: '#6B7280', marginTop: 8, lineHeight: 1.6, maxWidth: 320, marginInline: 'auto' }}>
        세션 분석 완료, 리포트 공유, 보호자 열람 등의 알림 설정을 곧 제공할 예정입니다.
      </div>
      <span style={{ display: 'inline-block', marginTop: 16, fontSize: 11, fontWeight: 600, background: '#FEF3C7', color: '#B45309', padding: '4px 12px', borderRadius: 999 }}>COMING SOON</span>
    </div>
  </div>
);

Object.assign(window, { SettingsPage, ProfileTab, PasswordTab, NotifyTab, PwField, SETTINGS_TABS });
