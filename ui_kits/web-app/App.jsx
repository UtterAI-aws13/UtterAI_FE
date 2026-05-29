// =============================================================
// UtterAI App — top-level router
// =============================================================

const App = () => {
  const [route, setRoute] = React.useState({ name: 'dashboard' });
  const [authed, setAuthed] = React.useState(false);
  const [toast, setToast] = React.useState(null);

  const navigate = (name, params = {}) => setRoute({ name, ...params });

  const showToast = (t) => {
    setToast(t);
    setTimeout(() => setToast(null), 4000);
  };

  // Render login outside the shell
  if (!authed) {
    if (route.name === 'signup') {
      return (
        <>
          <SignupPage
            onSignedUp={() => navigate('login')}
            onSwitchToLogin={() => navigate('login')}
            onToast={showToast}
          />
          {toast && (
            <div style={{
              position: 'fixed', top: 20, right: 24, zIndex: 100,
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '12px 14px', background: '#fff', borderRadius: 12,
              boxShadow: '0 12px 24px -8px rgba(15,42,36,0.10), 0 4px 8px -4px rgba(15,42,36,0.06)',
              border: '1px solid #DCFCE7', maxWidth: 340,
              animation: 'slideIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
            }}>
              <div style={{ width: 24, height: 24, borderRadius: 999, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="check" size={14} strokeWidth={3} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{toast.title}</div>
                {toast.body && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{toast.body}</div>}
              </div>
            </div>
          )}
        </>
      );
    }

    return (
      <>
        <LoginPage
          onLogin={() => { setAuthed(true); navigate('dashboard'); }}
          onSignup={() => navigate('signup')}
          onForgot={() => showToast({ title: '비밀번호 재설정 이메일을 전송했어요' })}
          onToast={showToast}
        />
        {toast && (
          <div style={{
            position: 'fixed', top: 20, right: 24, zIndex: 100,
            display: 'flex', alignItems: 'flex-start', gap: 12,
            padding: '12px 14px', background: '#fff', borderRadius: 12,
            boxShadow: '0 12px 24px -8px rgba(15,42,36,0.10), 0 4px 8px -4px rgba(15,42,36,0.06)',
            border: '1px solid #DCFCE7', maxWidth: 340,
            animation: 'slideIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
          }}>
            <div style={{ width: 24, height: 24, borderRadius: 999, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={14} strokeWidth={3} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{toast.title}</div>
              {toast.body && <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{toast.body}</div>}
            </div>
          </div>
        )}
      </>
    );
  }

  const openSession = (session) => navigate('detail', { session });

  let content = null;
  let activeNav = 'dashboard';

  switch (route.name) {
    case 'dashboard':
      activeNav = 'dashboard';
      content = <Dashboard onOpenSession={openSession} onNewSession={() => navigate('new')} />;
      break;
    case 'sessions':
      activeNav = 'sessions';
      content = <SessionsList onOpenSession={openSession} onNewSession={() => navigate('new')} />;
      break;
    case 'new':
      activeNav = 'sessions';
      content = (
        <NewSession
          onBack={() => navigate('dashboard')}
          onStartAnalysis={() => { showToast({ kind: 'success', title: '분석이 완료되었습니다', body: '박서윤 세션 #024의 리포트를 확인할 수 있습니다.' }); navigate('detail', { session: UtterData.sessions[0] }); }}
        />
      );
      break;
    case 'detail':
      activeNav = 'sessions';
      content = <SessionDetailV2 session={route.session} onBack={(to) => navigate(to || 'dashboard')} onToast={showToast} />;
      break;
    case 'children':
      activeNav = 'children';
      content = <ChildrenList onOpenChild={(c) => navigate('child', { child: c })} onToast={showToast} />;
      break;
    case 'child':
      activeNav = 'children';
      content = (
        <ChildDetail
          child={route.child}
          onBack={(to) => navigate(to || 'children')}
          onOpenSession={(s) => navigate('detail', { session: s })}
          onToast={showToast}
        />
      );
      break;
    case 'reports':
      activeNav = 'reports';
      content = <ReportsList onToast={showToast} />;
      break;
    case 'templates':
      activeNav = 'templates';
      content = <TemplatesPage onToast={showToast} />;
      break;
    case 'settings':
      activeNav = 'settings';
      content = <SettingsPage onToast={showToast} onLogout={() => { setAuthed(false); navigate('dashboard'); }} />;
      break;
  }

  return (
    <div style={appStyles.shell}>
      <Sidebar active={activeNav} onNavigate={navigate} me={UtterData.me} onLogout={() => { setAuthed(false); navigate('dashboard'); }} />
      <main style={appStyles.main}>
        <div style={appStyles.topbar}>
          <div style={appStyles.todayPill}>📅 2026.05.28 (목)</div>
          <button style={appStyles.iconBtn}><Icon name="bell" size={16} /></button>
          <button style={appStyles.iconBtn}><Icon name="search" size={16} /></button>
        </div>
        {content}
      </main>

      {/* Toast */}
      {toast && (
        <div style={{
          position: 'fixed', top: 20, right: 24, zIndex: 100,
          display: 'flex', alignItems: 'flex-start', gap: 12,
          padding: '12px 14px', background: '#fff', borderRadius: 12,
          boxShadow: '0 12px 24px -8px rgba(15,42,36,0.10), 0 4px 8px -4px rgba(15,42,36,0.06)',
          border: '1px solid #DCFCE7', maxWidth: 340,
          animation: 'slideIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
        }}>
          <div style={{ width: 24, height: 24, borderRadius: 999, background: '#DCFCE7', color: '#15803D', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="check" size={14} strokeWidth={3} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>{toast.title}</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>{toast.body}</div>
          </div>
        </div>
      )}
    </div>
  );
};

const PlaceholderScreen = ({ title, subtitle, icon }) => (
  <>
    <PageHeader title={title} subtitle={subtitle} />
    <div style={{ ...appStyles.page, display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 360 }}>
      <div style={{ background: '#fff', border: '1px dashed #C9CFCC', borderRadius: 12, padding: '48px 36px', textAlign: 'center', maxWidth: 420 }}>
        <div style={{ width: 56, height: 56, borderRadius: 14, background: '#ECF5EF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#2D6A4F', marginBottom: 14 }}>
          <Icon name={icon} size={24} strokeWidth={1.8} />
        </div>
        <div style={{ fontSize: 15, fontWeight: 600 }}>{title}</div>
        <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, lineHeight: 1.6 }}>
          이 화면은 UI 키트의 다음 라운드에서 채워집니다.
        </div>
      </div>
    </div>
  </>
);

ReactDOM.createRoot(document.getElementById('root')).render(<App />);
