// =============================================================
// Login screen — split layout (60% organic green / 40% white card)
// =============================================================

const loginStyles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F4FAF6',
    fontFamily: 'var(--font-sans)',
    color: '#1A1A1A',
    wordBreak: 'keep-all',
  },
  leftPanel: {
    flex: '0 0 60%',
    position: 'relative',
    background: 'linear-gradient(135deg, #0F2A24 0%, #1A3C34 45%, #245249 100%)',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
    padding: '48px 56px',
    color: '#fff',
  },
  rightPanel: {
    flex: 1,
    minWidth: 0,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    background: '#F4FAF6',
  },
  card: {
    width: '100%',
    maxWidth: 420,
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 24px 48px -12px rgba(15, 42, 36, 0.10), 0 8px 16px -8px rgba(15, 42, 36, 0.06)',
    padding: '40px 36px 32px',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'stretch',
  },
  logoCircle: {
    width: 64, height: 64,
    borderRadius: 999,
    background: 'linear-gradient(135deg, #1A3C34 0%, #2D6A4F 60%, #4D8A6F 100%)',
    boxShadow: '0 8px 16px -4px rgba(26, 60, 52, 0.30), inset 0 -2px 4px rgba(255,255,255,0.10)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    margin: '0 auto 12px',
    color: '#fff',
  },
  brandName: {
    fontSize: 11, fontWeight: 700,
    letterSpacing: '0.18em',
    color: '#2D6A4F',
    textAlign: 'center',
    textTransform: 'uppercase',
    marginBottom: 22,
  },
  heading: {
    fontSize: 24, fontWeight: 700,
    color: '#0F2A24',
    letterSpacing: '-0.015em',
    lineHeight: 1.4,
    textAlign: 'center',
    margin: 0,
    wordBreak: 'keep-all',
  },
  subtext: {
    fontSize: 12.5,
    color: '#6B7280',
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 1.6,
    wordBreak: 'keep-all',
  },
  fieldsWrap: { marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 },
  fieldWrap: { position: 'relative' },
  fieldIcon: {
    position: 'absolute',
    left: 14, top: '50%',
    transform: 'translateY(-50%)',
    color: '#9AA3A0',
    pointerEvents: 'none',
  },
  input: (focused, hasError) => ({
    width: '100%',
    height: 46,
    padding: '0 14px 0 42px',
    border: hasError
      ? '1.5px solid #EF4444'
      : focused
        ? '1.5px solid #2D6A4F'
        : '1px solid #E2E6E4',
    borderRadius: 10,
    background: '#FAFCFB',
    fontSize: 13.5,
    color: '#1A1A1A',
    fontFamily: 'var(--font-sans)',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
    boxShadow: focused && !hasError ? '0 0 0 3px rgba(45, 106, 79, 0.16)' : 'none',
  }),
  errorMsg: {
    fontSize: 11.5,
    color: '#B91C1C',
    marginTop: 6,
    paddingLeft: 4,
    fontWeight: 500,
    display: 'flex',
    alignItems: 'center',
    gap: 5,
  },
  togglePw: {
    position: 'absolute',
    right: 12, top: '50%',
    transform: 'translateY(-50%)',
    background: 'transparent',
    border: 'none',
    color: '#9AA3A0',
    cursor: 'pointer',
    padding: 6, borderRadius: 6,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  },
  submitBtn: {
    marginTop: 18,
    width: '100%',
    height: 48,
    borderRadius: 999,
    background: '#1A3C34',
    color: '#fff',
    border: 'none',
    fontSize: 14,
    fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    boxShadow: '0 8px 16px -4px rgba(26, 60, 52, 0.25)',
    transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  bottomRow: {
    marginTop: 22,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: 8,
    fontSize: 12,
    flexWrap: 'wrap',
    wordBreak: 'keep-all',
  },
  link: {
    color: '#6B7280',
    textDecoration: 'none',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'color 120ms',
  },
  linkBrand: {
    color: '#1A3C34',
    fontWeight: 600,
    textDecoration: 'none',
    cursor: 'pointer',
  },
  brandFooter: {
    position: 'relative', zIndex: 2,
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    fontSize: 11, color: 'rgba(183, 222, 200, 0.55)',
    fontWeight: 500,
  },
};

// ---------- Logo mark (gradient circle + speech bubble + soundwave) ----------
const LogoMark = ({ size = 64 }) => (
  <div style={{ ...loginStyles.logoCircle, width: size, height: size }}>
    <svg width={size * 0.55} height={size * 0.55} viewBox="0 0 32 32" fill="none">
      {/* speech bubble outline */}
      <path
        d="M6 9 a4 4 0 0 1 4-4 h12 a4 4 0 0 1 4 4 v8 a4 4 0 0 1 -4 4 h-8 l-5 4 v-4 h-3 a-2 -2 0 0 1 -2 -2 z"
        stroke="#B7DEC8" strokeWidth="1.8" strokeLinejoin="round" fill="none"
      />
      {/* soundwave bars inside bubble */}
      <rect x="11" y="11" width="2" height="4"  rx="1" fill="#B7DEC8"/>
      <rect x="14" y="9"  width="2" height="8"  rx="1" fill="#D8ECDF"/>
      <rect x="17" y="7"  width="2" height="12" rx="1" fill="#fff"/>
      <rect x="20" y="10" width="2" height="6"  rx="1" fill="#D8ECDF"/>
    </svg>
  </div>
);

// ---------- Left panel: animated organic blobs ----------
const OrganicBackdrop = () => (
  <svg
    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', pointerEvents: 'none' }}
    viewBox="0 0 800 900"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <radialGradient id="blob-a" cx="35%" cy="30%" r="60%">
        <stop offset="0%"  stopColor="#4D8A6F" stopOpacity="0.55" />
        <stop offset="100%" stopColor="#1A3C34" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="blob-b" cx="75%" cy="75%" r="50%">
        <stop offset="0%"  stopColor="#7FB196" stopOpacity="0.42" />
        <stop offset="100%" stopColor="#1A3C34" stopOpacity="0" />
      </radialGradient>
      <radialGradient id="blob-c" cx="80%" cy="20%" r="40%">
        <stop offset="0%"  stopColor="#B7DEC8" stopOpacity="0.25" />
        <stop offset="100%" stopColor="#1A3C34" stopOpacity="0" />
      </radialGradient>
    </defs>

    {/* Big soft blobs */}
    <ellipse cx="180"  cy="280" rx="380" ry="260" fill="url(#blob-a)" />
    <ellipse cx="640"  cy="700" rx="320" ry="240" fill="url(#blob-b)" />
    <ellipse cx="620"  cy="180" rx="220" ry="180" fill="url(#blob-c)" />

    {/* Wave lines */}
    <path
      d="M -20 540 Q 200 480 400 540 T 820 540"
      stroke="rgba(183, 222, 200, 0.22)" strokeWidth="1.4" fill="none"
    />
    <path
      d="M -20 580 Q 200 530 400 580 T 820 580"
      stroke="rgba(183, 222, 200, 0.14)" strokeWidth="1.2" fill="none"
    />
    <path
      d="M -20 620 Q 200 580 400 620 T 820 620"
      stroke="rgba(183, 222, 200, 0.08)" strokeWidth="1" fill="none"
    />

    {/* Waveform bars cluster (center) */}
    <g transform="translate(220, 380)" opacity="0.6">
      {[12, 22, 38, 52, 70, 86, 70, 52, 38, 22, 12].map((h, i) => (
        <rect key={i} x={i * 18} y={50 - h / 2} width="6" height={h} rx="3" fill="#B7DEC8" opacity={0.35 + (i % 5) * 0.08} />
      ))}
    </g>

    {/* small dots */}
    <circle cx="120" cy="120" r="2.5" fill="#B7DEC8" opacity="0.45" />
    <circle cx="540" cy="120" r="3"   fill="#B7DEC8" opacity="0.30" />
    <circle cx="700" cy="380" r="2"   fill="#B7DEC8" opacity="0.40" />
    <circle cx="80"  cy="700" r="3.5" fill="#B7DEC8" opacity="0.30" />
    <circle cx="500" cy="820" r="2.5" fill="#B7DEC8" opacity="0.40" />
  </svg>
);

// ---------- Input field with icon ----------
const AuthField = ({ icon, type = 'text', value, onChange, placeholder, error, autoComplete }) => {
  const [focused, setFocused] = React.useState(false);
  const [showPw, setShowPw] = React.useState(false);
  const isPw = type === 'password';
  const inputType = isPw ? (showPw ? 'text' : 'password') : type;

  return (
    <div>
      <div style={loginStyles.fieldWrap}>
        <span style={loginStyles.fieldIcon}>
          <Icon name={icon} size={16} strokeWidth={1.8} />
        </span>
        <input
          type={inputType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          autoComplete={autoComplete}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          style={loginStyles.input(focused, !!error)}
        />
        {isPw && (
          <button
            type="button"
            style={loginStyles.togglePw}
            onClick={() => setShowPw((s) => !s)}
            tabIndex={-1}
            title={showPw ? '비밀번호 숨기기' : '비밀번호 표시'}
          >
            {showPw ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                <line x1="1" y1="1" x2="23" y2="23" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                <circle cx="12" cy="12" r="3" />
              </svg>
            )}
          </button>
        )}
      </div>
      {error && (
        <div style={loginStyles.errorMsg}>
          <Icon name="alert" size={11} strokeWidth={2.5} />
          {error}
        </div>
      )}
    </div>
  );
};

// ---------- Login page ----------
const LoginPage = ({ onLogin, onSignup, onForgot, onToast }) => {
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [errors, setErrors] = React.useState({});
  const [loading, setLoading] = React.useState(false);

  const submit = () => {
    const errs = {};
    if (!email.trim()) errs.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '올바른 이메일 형식이 아닙니다.';
    if (!password) errs.password = '비밀번호를 입력해주세요.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onToast && onToast({ title: '환영합니다, 김지원 선생님', body: '오늘 4건의 세션이 예정되어 있어요.' });
      onLogin && onLogin();
    }, 800);
  };

  const onKeyDown = (e) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div style={loginStyles.shell}>
      {/* LEFT — organic green panel */}
      <div style={loginStyles.leftPanel}>
        <OrganicBackdrop />

        <div style={{ position: 'relative', zIndex: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'rgba(255,255,255,0.10)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="14" height="14" viewBox="0 0 64 64" fill="none">
              <rect x="6"  y="26" width="6" height="12" rx="3" fill="#B7DEC8"/>
              <rect x="16" y="18" width="6" height="28" rx="3" fill="#B7DEC8"/>
              <rect x="26" y="10" width="6" height="44" rx="3" fill="#fff"/>
              <rect x="36" y="16" width="6" height="32" rx="3" fill="#B7DEC8"/>
              <rect x="46" y="24" width="6" height="16" rx="3" fill="#B7DEC8"/>
            </svg>
          </div>
          <span style={{ fontSize: 14, fontWeight: 700, color: '#fff', letterSpacing: '-0.01em' }}>UtterAI</span>
        </div>

        <div style={{ position: 'relative', zIndex: 2, maxWidth: 460 }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: 6,
            padding: '4px 12px', borderRadius: 999,
            background: 'rgba(183, 222, 200, 0.12)',
            border: '1px solid rgba(183, 222, 200, 0.20)',
            color: '#B7DEC8',
            fontSize: 11, fontWeight: 600, letterSpacing: '0.02em',
            marginBottom: 18, whiteSpace: 'nowrap',
          }}>
            <span style={{ width: 5, height: 5, borderRadius: 999, background: '#B7DEC8' }} />
            아동 언어치료 AI 분석 플랫폼
          </div>
          <h2 style={{
            fontSize: 36, fontWeight: 700, lineHeight: 1.25,
            margin: 0, letterSpacing: '-0.02em', color: '#fff',
            wordBreak: 'keep-all',
          }}>
            매 세션의 작은 발화까지<br />
            <span style={{ color: '#B7DEC8' }}>꼼꼼히 듣고 기록합니다.</span>
          </h2>
          <p style={{
            marginTop: 16, fontSize: 14, lineHeight: 1.65,
            color: 'rgba(216, 236, 223, 0.78)', maxWidth: 420,
            wordBreak: 'keep-all',
          }}>
            UtterAI는 치료사가 더 깊이 듣고, 보호자가 더 잘 이해할 수 있도록<br />
            음성 분석 · 전사 · 언어 지표 · 리포트를 자동으로 정리해드립니다.
          </p>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { t: '실시간 화자 분리', d: '아동 · 치료사 · 미상 자동 식별' },
              { t: '언어 지표 자동 산출', d: 'MLU · TTR · 어휘 다양도' },
              { t: 'SOAP Note 초안 생성', d: '치료사 톤으로 맞춤 작성' },
            ].map((f) => (
              <div key={f.t} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 999,
                  background: 'rgba(183, 222, 200, 0.16)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#B7DEC8', flexShrink: 0, marginTop: 1,
                }}>
                  <Icon name="check" size={12} strokeWidth={2.8} />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{f.t}</div>
                  <div style={{ fontSize: 11.5, color: 'rgba(216, 236, 223, 0.65)', marginTop: 1 }}>{f.d}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div style={loginStyles.brandFooter}>
          <span>© 2026 UtterAI · All rights reserved</span>
          <div style={{ display: 'flex', gap: 16 }}>
            <span style={{ cursor: 'pointer' }}>이용약관</span>
            <span style={{ cursor: 'pointer' }}>개인정보처리방침</span>
          </div>
        </div>
      </div>

      {/* RIGHT — auth card */}
      <div style={loginStyles.rightPanel}>
        <div style={loginStyles.card} onKeyDown={onKeyDown}>
          <LogoMark size={64} />
          <div style={loginStyles.brandName}>UTTER AI</div>

          <h1 style={loginStyles.heading}>
            당신의 언어 성장을<br />
            더 따뜻하게 기록하다
          </h1>
          <p style={loginStyles.subtext}>
            치료 기록, 음성 분석, 발화 데이터를<br />
            한 곳에서 안전하게 관리하세요.
          </p>

          <div style={loginStyles.fieldsWrap}>
            <AuthField
              icon="mail"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
              placeholder="이메일 주소"
              error={errors.email}
              autoComplete="email"
            />
            <AuthField
              icon="lock"
              type="password"
              value={password}
              onChange={(v) => { setPassword(v); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
              placeholder="비밀번호"
              error={errors.password}
              autoComplete="current-password"
            />
          </div>

          <button
            style={{ ...loginStyles.submitBtn, ...(loading ? { background: '#245249', cursor: 'wait' } : {}) }}
            onClick={submit}
            disabled={loading}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.background = '#0F2A24'; }}
            onMouseLeave={(e) => { if (!loading) e.currentTarget.style.background = '#1A3C34'; }}
          >
            {loading ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/>
                  <path d="M21 12 a9 9 0 0 0 -9 -9" strokeLinecap="round" />
                </svg>
                로그인 중…
              </>
            ) : (
              <>
                안전하게 로그인 <Icon name="chevronRight" size={15} strokeWidth={2.4} />
              </>
            )}
          </button>

          <div style={loginStyles.bottomRow}>
            <a
              style={loginStyles.link}
              onClick={onForgot}
              onMouseEnter={(e) => e.currentTarget.style.color = '#1A3C34'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#6B7280'}
            >
              비밀번호를 잊으셨나요?
            </a>
            <span style={{ color: '#6B7280', whiteSpace: 'nowrap' }}>
              처음 방문하셨나요?{' '}
              <a
                style={loginStyles.linkBrand}
                onClick={onSignup}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0F2A24'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1A3C34'}
              >
                회원 가입
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { LoginPage, AuthField, LogoMark, OrganicBackdrop });
