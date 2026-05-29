// =============================================================
// UtterAI — Click-thru prototype
// Screens: Dashboard → Sessions list → Session detail (Transcript/SOAP/Report)
//                  → New session upload
// =============================================================

const appStyles = {
  shell: {
    display: 'flex',
    minHeight: '100vh',
    background: '#F4FAF6',
    fontFamily: 'var(--font-sans)',
    color: '#1A1A1A',
  },
  main: { flex: 1, minWidth: 0, paddingBottom: 60 },
  topbar: {
    display: 'flex', alignItems: 'center', justifyContent: 'flex-end',
    gap: 14, padding: '14px 32px',
    borderBottom: '1px solid #E2E6E4',
    background: 'rgba(244, 250, 246, 0.85)',
    backdropFilter: 'blur(8px)',
    position: 'sticky', top: 0, zIndex: 10,
  },
  iconBtn: {
    width: 34, height: 34, borderRadius: 999,
    border: '1px solid #E2E6E4', background: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', color: '#4B5650',
  },
  todayPill: {
    fontSize: 12, color: '#6B7280', fontWeight: 500,
    background: '#fff', border: '1px solid #E2E6E4', borderRadius: 999,
    padding: '5px 12px',
  },
  page: { padding: '0 32px 32px' },
  statsRow: {
    display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)',
    gap: 16, marginBottom: 24,
  },
};

const today = () => {
  const d = new Date('2026-05-28');
  return `${d.getFullYear()}년 ${d.getMonth() + 1}월 ${d.getDate()}일 목요일`;
};

// -------- Dashboard --------
const Dashboard = ({ onOpenSession, onNewSession }) => {
  return (
    <>
      <PageHeader
        title={`안녕하세요, ${UtterData.me.name} 선생님`}
        subtitle={`${today()} · 오늘은 4건의 세션이 예정되어 있어요.`}
        actions={
          <>
            <Button variant="secondary" size="md" icon="plus">아동 등록</Button>
            <Button variant="primary" size="md" icon="mic" onClick={onNewSession}>세션 생성</Button>
          </>
        }
      />
      <div style={appStyles.page}>
        <div style={appStyles.statsRow}>
          <StatCard label="담당 아동" value={UtterData.stats[0].value} delta={UtterData.stats[0].delta} tone="pos" icon="users" />
          <StatCard label="이번 달 세션" value={UtterData.stats[1].value} delta={UtterData.stats[1].delta} tone="pos" icon="audio" />
          <StatCard label="분석 대기" value={UtterData.stats[2].value} delta={UtterData.stats[2].delta} tone="neutral" icon="clock" />
        </div>
        <SessionTable sessions={UtterData.sessions} onOpen={onOpenSession} />
      </div>
    </>
  );
};

// -------- Sessions list (full page) --------
const SessionsList = ({ onOpenSession, onNewSession }) => {
  return (
    <>
      <PageHeader
        title="세션 관리"
        subtitle="총 38건의 세션"
        actions={<Button variant="primary" icon="mic" onClick={onNewSession}>세션 생성</Button>}
      />
      <div style={appStyles.page}>
        <SessionTable sessions={UtterData.sessions} title="모든 세션" onOpen={onOpenSession} />
      </div>
    </>
  );
};

// -------- New session: upload --------
const NewSession = ({ onBack, onStartAnalysis }) => {
  const [step, setStep] = React.useState(0); // 0=upload 1=processing
  const [progress, setProgress] = React.useState(0);

  React.useEffect(() => {
    if (step !== 1) return;
    const id = setInterval(() => {
      setProgress((p) => {
        if (p >= 100) { clearInterval(id); setTimeout(onStartAnalysis, 600); return 100; }
        return p + 4;
      });
    }, 120);
    return () => clearInterval(id);
  }, [step]);

  const stepStyle = (s, st) => {
    const done = s < st;
    const active = s === st;
    return {
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 100,
    };
  };

  return (
    <>
      <PageHeader
        title="새 세션 생성"
        breadcrumbs={[
          { label: '대시보드', onClick: onBack },
          { label: '새 세션' },
        ]}
        actions={<Button variant="ghost" icon="x" onClick={onBack}>취소</Button>}
      />
      <div style={{ ...appStyles.page, maxWidth: 720, margin: '0 auto' }}>

        {/* Stepper */}
        <div style={{ display: 'flex', alignItems: 'center', padding: '8px 0 24px' }}>
          {['업로드', '분석', '검토', '리포트'].map((label, i) => {
            const stage = step === 1 ? 1 : 0;
            const done = i < stage;
            const active = i === stage;
            return (
              <React.Fragment key={label}>
                <div style={stepStyle(i, stage)}>
                  <div style={{
                    width: 28, height: 28, borderRadius: 999,
                    background: done ? '#1A3C34' : '#fff',
                    border: done ? 'none' : active ? '2px solid #1A3C34' : '1.5px solid #C9CFCC',
                    color: done ? '#fff' : active ? '#1A3C34' : '#9AA3A0',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, fontWeight: 700,
                    boxShadow: active ? '0 0 0 4px rgba(26,60,52,0.12)' : 'none',
                  }}>
                    {done ? <Icon name="check" size={14} strokeWidth={3} /> : (i + 1)}
                  </div>
                  <div style={{ fontSize: 11, fontWeight: active || done ? 600 : 500, color: active || done ? '#1A1A1A' : '#6B7280' }}>{label}</div>
                </div>
                {i < 3 && <div style={{ flex: 1, height: 2, background: i < stage ? '#1A3C34' : '#E2E6E4', marginBottom: 18 }} />}
              </React.Fragment>
            );
          })}
        </div>

        {/* Form */}
        <div style={{ background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12, padding: 22, marginBottom: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>세션 정보</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Field label="대상 아동" value="박서윤 (6세 2개월)" />
            <Field label="세션 유형" value="개별 · 60분" />
            <Field label="세션 날짜" value="2026.05.28 14:00" />
            <Field label="회기" value="회기 #024" />
          </div>
        </div>

        {/* Dropzone or Progress */}
        {step === 0 ? (
          <div style={{ background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12, padding: 22 }}>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 14 }}>오디오 파일</div>
            <div
              onClick={() => setStep(1)}
              style={{
                border: '2px dashed #7FB196', borderRadius: 12, background: '#F4FAF6',
                padding: 32, textAlign: 'center', cursor: 'pointer',
              }}
            >
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#D8ECDF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#1A3C34', marginBottom: 10 }}>
                <Icon name="upload" size={22} strokeWidth={2} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>
                오디오 파일을 드래그하거나{' '}
                <span style={{ color: '#2D6A4F', textDecoration: 'underline' }}>클릭하여 업로드</span>
              </div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 5 }}>WAV · MP3 · M4A · 최대 200MB</div>
            </div>
          </div>
        ) : (
          <div style={{ background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12, padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 8, background: '#ECF5EF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3C34' }}>
                <Icon name="audio" size={18} strokeWidth={2} />
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 600 }}>session-024-park-seoyoon.wav</div>
                <div style={{ fontSize: 11, color: '#6B7280' }}>42.3 MB · 12:48</div>
              </div>
              <StatusBadge status={progress < 100 ? 'ANALYSIS_PROCESSING' : 'ANALYSIS_COMPLETED'} />
            </div>
            <div style={{ height: 6, background: '#EEF1EF', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{ width: `${progress}%`, height: '100%', background: 'linear-gradient(90deg, #2D6A4F, #4D8A6F)', borderRadius: 999, transition: 'width 120ms' }} />
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 8, fontSize: 11, color: '#6B7280' }}>
              <span>화자 분리 · 발화 단위 분할 · 언어 지표 산출 중…</span>
              <span style={{ fontFamily: "'JetBrains Mono', monospace", color: '#1A3C34', fontWeight: 600 }}>{progress}%</span>
            </div>
          </div>
        )}

      </div>
    </>
  );
};

const Field = ({ label, value }) => (
  <div>
    <div style={{ fontSize: 11, fontWeight: 500, color: '#6B7280', marginBottom: 4, letterSpacing: '0.02em' }}>{label}</div>
    <div style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1A' }}>{value}</div>
  </div>
);

Object.assign(window, { Dashboard, SessionsList, NewSession, Field, appStyles, today });
