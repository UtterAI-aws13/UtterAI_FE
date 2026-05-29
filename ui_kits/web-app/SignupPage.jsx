// =============================================================
// Signup page — shares LoginPage shell layout
// =============================================================

const signupStyles = {
  // Reuse LoginPage shell — duplicate keys we override
  card: {
    width: '100%',
    maxWidth: 440,
    background: '#fff',
    borderRadius: 20,
    boxShadow: '0 24px 48px -12px rgba(15, 42, 36, 0.10), 0 8px 16px -8px rgba(15, 42, 36, 0.06)',
    padding: '36px 36px 28px',
    display: 'flex', flexDirection: 'column',
    maxHeight: 'calc(100vh - 64px)',
    overflowY: 'auto',
  },
  heading: {
    fontSize: 24, fontWeight: 700,
    color: '#0F2A24',
    letterSpacing: '-0.015em',
    lineHeight: 1.3,
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
  fieldsWrap: { marginTop: 22, display: 'flex', flexDirection: 'column', gap: 10 },
  roleWrap: { marginTop: 4 },
  roleLabel: {
    fontSize: 11.5, fontWeight: 600, color: '#4B5650',
    letterSpacing: '0.02em', marginBottom: 8, paddingLeft: 4,
    display: 'block',
  },
  roleRow: { display: 'flex', gap: 8 },
  roleCard: (active) => ({
    flex: 1,
    padding: '12px 14px',
    borderRadius: 10,
    border: active ? '1.5px solid #1A3C34' : '1px solid #E2E6E4',
    background: active ? '#ECF5EF' : '#FAFCFB',
    cursor: 'pointer',
    transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
    display: 'flex', alignItems: 'center', gap: 10,
    boxShadow: active ? '0 0 0 3px rgba(45, 106, 79, 0.14)' : 'none',
  }),
  roleIcon: (active) => ({
    width: 30, height: 30, borderRadius: 8,
    background: active ? '#1A3C34' : '#fff',
    border: active ? 'none' : '1px solid #E2E6E4',
    color: active ? '#B7DEC8' : '#6B7280',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    flexShrink: 0,
    transition: 'all 120ms',
  }),
  roleName: (active) => ({
    fontSize: 13, fontWeight: active ? 600 : 500,
    color: active ? '#1A3C34' : '#1A1A1A',
    lineHeight: 1.2,
  }),
  roleDesc: (active) => ({
    fontSize: 10.5,
    color: active ? '#245249' : '#6B7280',
    marginTop: 2, lineHeight: 1.35,
  }),
  roleHelper: {
    fontSize: 10.5,
    color: '#9AA3A0',
    marginTop: 8, paddingLeft: 4,
    display: 'flex', alignItems: 'center', gap: 4,
  },
  submitBtn: {
    marginTop: 18,
    width: '100%',
    height: 48,
    borderRadius: 999,
    background: '#1A3C34',
    color: '#fff',
    border: 'none',
    fontSize: 14, fontWeight: 600,
    fontFamily: 'var(--font-sans)',
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    boxShadow: '0 8px 16px -4px rgba(26, 60, 52, 0.25)',
    transition: 'all 120ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  footerLine: {
    marginTop: 18,
    textAlign: 'center',
    fontSize: 12,
    color: '#6B7280',
    wordBreak: 'keep-all',
  },
  pwHint: {
    fontSize: 10.5,
    color: '#9AA3A0',
    marginTop: -4, marginBottom: -2, paddingLeft: 4,
    display: 'flex', alignItems: 'center', gap: 4,
  },
};

const ROLE_OPTIONS = [
  { value: 'therapist', name: '치료사',  desc: '세션 녹음·분석·리포트 작성', icon: 'user' },
  { value: 'admin',     name: '관리자',  desc: '기관·사용자 관리',           icon: 'shield' },
];

// Validate password strength → 0..3
const pwStrength = (pw) => {
  if (!pw) return 0;
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) score++;
  if (/\d/.test(pw) && /[^A-Za-z0-9]/.test(pw)) score++;
  return score;
};

const SignupPage = ({ onSignedUp, onSwitchToLogin, onToast }) => {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirm, setConfirm] = React.useState('');
  const [role, setRole] = React.useState('therapist');
  const [errors, setErrors] = React.useState({});
  const [submitting, setSubmitting] = React.useState(false);

  const strength = pwStrength(password);
  const strengthLabel = ['', '약함', '보통', '강함'][strength];
  const strengthColor = ['#E2E6E4', '#EF4444', '#F59E0B', '#15803D'][strength];

  const submit = () => {
    const errs = {};
    if (!name.trim()) errs.name = '이름을 입력해주세요.';
    if (!email.trim()) errs.email = '이메일을 입력해주세요.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) errs.email = '올바른 이메일 형식을 입력해주세요.';
    if (!password) errs.password = '비밀번호를 입력해주세요.';
    else if (password.length < 8) errs.password = '비밀번호는 8자 이상이어야 합니다.';
    if (!confirm) errs.confirm = '비밀번호를 한 번 더 입력해주세요.';
    else if (password !== confirm) errs.confirm = '비밀번호가 일치하지 않습니다.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    setSubmitting(true);
    setTimeout(() => {
      setSubmitting(false);
      onSignedUp && onSignedUp();
      onToast && onToast({ title: '계정이 생성되었습니다', body: '로그인 페이지에서 로그인해주세요.' });
    }, 900);
  };

  const onKeyDown = (e) => { if (e.key === 'Enter') submit(); };

  return (
    <div style={loginStyles.shell}>
      {/* LEFT — organic green panel (same as login) */}
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
            지금 합류하세요
          </div>
          <h2 style={{
            fontSize: 36, fontWeight: 700, lineHeight: 1.25,
            margin: 0, letterSpacing: '-0.02em', color: '#fff',
            wordBreak: 'keep-all',
          }}>
            치료 기록을 위한<br />
            <span style={{ color: '#B7DEC8' }}>가장 따뜻한 도구.</span>
          </h2>
          <p style={{
            marginTop: 16, fontSize: 14, lineHeight: 1.65,
            color: 'rgba(216, 236, 223, 0.78)', maxWidth: 420,
            wordBreak: 'keep-all',
          }}>
            전국 200여 개 발달센터의 언어치료사가 UtterAI로 세션을 기록하고<br />
            보호자에게 더 명확한 리포트를 전달하고 있어요.
          </p>

          <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { t: '14일 무료 체험', d: '카드 등록 없이 모든 기능 사용' },
              { t: '의료급여법 준수', d: '국내 서버 · 암호화 보관' },
              { t: '언제든 해지 가능', d: '데이터는 30일간 보관 후 자동 삭제' },
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

      {/* RIGHT — signup card */}
      <div style={{ ...loginStyles.rightPanel, padding: '32px 32px 24px' }}>
        <div style={signupStyles.card} onKeyDown={onKeyDown}>
          <LogoMark size={56} />
          <div style={{ ...loginStyles.brandName, marginBottom: 18 }}>UTTER AI</div>

          <h1 style={signupStyles.heading}>계정을 만들어보세요</h1>
          <p style={signupStyles.subtext}>
            UtterAI와 함께 더 체계적인<br />
            언어 치료를 시작하세요.
          </p>

          <div style={signupStyles.fieldsWrap}>
            <AuthField
              icon="user"
              value={name}
              onChange={(v) => { setName(v); if (errors.name) setErrors((e) => ({ ...e, name: undefined })); }}
              placeholder="홍길동"
              error={errors.name}
              autoComplete="name"
            />
            <AuthField
              icon="mail"
              type="email"
              value={email}
              onChange={(v) => { setEmail(v); if (errors.email) setErrors((e) => ({ ...e, email: undefined })); }}
              placeholder="example@email.com"
              error={errors.email}
              autoComplete="email"
            />
            <div>
              <AuthField
                icon="lock"
                type="password"
                value={password}
                onChange={(v) => { setPassword(v); if (errors.password) setErrors((e) => ({ ...e, password: undefined })); }}
                placeholder="비밀번호 (8자 이상)"
                error={errors.password}
                autoComplete="new-password"
              />
              {/* Strength meter */}
              {password && !errors.password && (
                <div style={{ marginTop: 6, paddingLeft: 4 }}>
                  <div style={{ display: 'flex', gap: 4 }}>
                    {[0, 1, 2].map((i) => (
                      <div key={i} style={{
                        flex: 1, height: 3, borderRadius: 999,
                        background: i < strength ? strengthColor : '#E2E6E4',
                        transition: 'background 120ms',
                      }} />
                    ))}
                  </div>
                  <div style={{ fontSize: 10.5, color: strengthColor, marginTop: 4, fontWeight: 600 }}>
                    비밀번호 강도: {strengthLabel}
                  </div>
                </div>
              )}
            </div>
            <AuthField
              icon="lock"
              type="password"
              value={confirm}
              onChange={(v) => { setConfirm(v); if (errors.confirm) setErrors((e) => ({ ...e, confirm: undefined })); }}
              placeholder="비밀번호 확인"
              error={errors.confirm}
              autoComplete="new-password"
            />

            {/* Role selection */}
            <div style={signupStyles.roleWrap}>
              <label style={signupStyles.roleLabel}>역할 선택</label>
              <div style={signupStyles.roleRow}>
                {ROLE_OPTIONS.map((opt) => (
                  <div
                    key={opt.value}
                    style={signupStyles.roleCard(role === opt.value)}
                    onClick={() => setRole(opt.value)}
                  >
                    <div style={signupStyles.roleIcon(role === opt.value)}>
                      <Icon name={opt.icon} size={15} strokeWidth={2} />
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={signupStyles.roleName(role === opt.value)}>{opt.name}</div>
                      <div style={signupStyles.roleDesc(role === opt.value)}>{opt.desc}</div>
                    </div>
                    <span style={{
                      width: 14, height: 14, borderRadius: 999, flexShrink: 0,
                      border: role === opt.value ? '4px solid #1A3C34' : '1.5px solid #C9CFCC',
                      background: '#fff',
                      transition: 'all 120ms',
                    }} />
                  </div>
                ))}
              </div>
              <div style={signupStyles.roleHelper}>
                <Icon name="info" size={11} strokeWidth={2} />
                역할은 가입 후 변경할 수 없습니다.
              </div>
            </div>
          </div>

          <button
            style={{ ...signupStyles.submitBtn, ...(submitting ? { background: '#245249', cursor: 'wait' } : {}) }}
            onClick={submit}
            disabled={submitting}
            onMouseEnter={(e) => { if (!submitting) e.currentTarget.style.background = '#0F2A24'; }}
            onMouseLeave={(e) => { if (!submitting) e.currentTarget.style.background = '#1A3C34'; }}
          >
            {submitting ? (
              <>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.4" style={{ animation: 'spin 0.8s linear infinite' }}>
                  <circle cx="12" cy="12" r="9" strokeOpacity="0.25"/>
                  <path d="M21 12 a9 9 0 0 0 -9 -9" strokeLinecap="round" />
                </svg>
                가입 중…
              </>
            ) : (
              <>
                회원가입 <Icon name="chevronRight" size={15} strokeWidth={2.4} />
              </>
            )}
          </button>

          <div style={signupStyles.footerLine}>
            <span style={{ whiteSpace: 'nowrap' }}>
              이미 계정이 있으신가요?{' '}
              <a
                style={loginStyles.linkBrand}
                onClick={onSwitchToLogin}
                onMouseEnter={(e) => e.currentTarget.style.color = '#0F2A24'}
                onMouseLeave={(e) => e.currentTarget.style.color = '#1A3C34'}
              >
                로그인
              </a>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { SignupPage, ROLE_OPTIONS, pwStrength });
