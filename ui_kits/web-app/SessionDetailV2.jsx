// =============================================================
// SessionDetailV2 — full 4-step workflow
// Steps: 음성 업로드 → AI 분석 → 전사 검토 → 리포트
// =============================================================

const sdStyles = {
  page: { padding: '0 32px 40px' },
  stepperWrap: {
    background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12,
    padding: '20px 24px', marginBottom: 20,
    boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
  },
  stepperRow: { display: 'flex', alignItems: 'center', gap: 0 },
  stepCol: { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, minWidth: 110, cursor: 'pointer' },
  stepCircle: ({ done, active, disabled }) => ({
    width: 32, height: 32, borderRadius: 999,
    background: done ? '#1A3C34' : active ? '#fff' : '#fff',
    border: done ? 'none' : active ? '2px solid #1A3C34' : '1.5px solid #C9CFCC',
    color: done ? '#fff' : active ? '#1A3C34' : '#9AA3A0',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: 13, fontWeight: 700,
    boxShadow: active ? '0 0 0 5px rgba(26,60,52,0.12)' : 'none',
    transition: 'all 160ms',
    cursor: disabled ? 'not-allowed' : 'pointer',
  }),
  stepLabel: ({ done, active }) => ({
    fontSize: 12, fontWeight: done || active ? 600 : 500,
    color: done || active ? '#1A1A1A' : '#6B7280',
    textAlign: 'center', whiteSpace: 'nowrap',
  }),
  stepSub: { fontSize: 10, color: '#9AA3A0', marginTop: 2 },
  stepConn: (done) => ({ flex: 1, height: 2, background: done ? '#1A3C34' : '#E2E6E4', marginTop: -28 }),

  pane: {
    background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12,
    boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
  },
  paneHeader: {
    padding: '18px 22px', borderBottom: '1px solid #EEF1EF',
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
  },
  paneTitle: { fontSize: 16, fontWeight: 600, color: '#1A1A1A' },
  paneSubtitle: { fontSize: 12, color: '#6B7280', marginTop: 2 },
  paneBody: { padding: 22 },
};

const STEPS = [
  { id: 1, label: '음성 업로드', sub: 'Upload' },
  { id: 2, label: 'AI 분석',     sub: 'Analyze' },
  { id: 3, label: '전사 검토',    sub: 'Review' },
  { id: 4, label: '리포트',       sub: 'Report' },
];

// Map status → which step the user is currently on
const statusToStep = (s) => {
  if (s === 'CREATED') return 1;
  if (s === 'AUDIO_UPLOADED') return 2;
  if (s === 'ANALYSIS_PROCESSING') return 2;
  if (s === 'ANALYSIS_COMPLETED') return 3;
  if (s === 'REPORT_READY') return 4;
  if (s === 'FAILED') return 2;
  return 1;
};

const SessionDetailV2 = ({ session, onBack, onToast }) => {
  const initialStep = statusToStep(session.status);
  const [step, setStep] = React.useState(initialStep);
  const [status, setStatus] = React.useState(session.status);

  // Step 1 — upload
  const [file, setFile] = React.useState(
    initialStep >= 2
      ? { name: 'session-024-park-seoyoon.wav', size: '42.3 MB', duration: '12:48', state: 'UPLOADED' }
      : null
  );

  // Step 2 — analysis
  const [analysisState, setAnalysisState] = React.useState(
    initialStep >= 3 ? 'COMPLETED' : (status === 'ANALYSIS_PROCESSING' ? 'PROCESSING' : 'IDLE')
  );
  const [progress, setProgress] = React.useState(initialStep >= 3 ? 100 : 0);
  const [stage, setStage] = React.useState('대기 중');

  // Step 3 — transcript editing
  const [utts, setUtts] = React.useState(UtterData.utterances.map((u, i) => ({ ...u, id: i, reviewed: i < 5 })));
  const [editingId, setEditingId] = React.useState(null);
  const [openSpeakerMenu, setOpenSpeakerMenu] = React.useState(null);
  const [selectedIds, setSelectedIds] = React.useState(new Set());

  // Step 4 — SOAP + report
  const [soap, setSoap] = React.useState({ ...UtterData.soap });
  const [soapState, setSoapState] = React.useState(initialStep === 4 ? 'SAVED' : 'DRAFT'); // DRAFT | SAVED | FINALIZED
  const [report, setReport] = React.useState(initialStep === 4 && session.status === 'REPORT_READY' ? { generated: true } : { generated: false });

  // ---- analysis simulation ----
  React.useEffect(() => {
    if (analysisState !== 'PROCESSING') return;
    const stages = ['음성 정제', '화자 분리', '발화 단위 분할', '전사 생성', '언어 지표 산출'];
    let p = progress;
    const id = setInterval(() => {
      p += 3.5;
      if (p >= 100) {
        clearInterval(id);
        setProgress(100); setStage('완료');
        setAnalysisState('COMPLETED'); setStatus('ANALYSIS_COMPLETED');
        onToast && onToast({ title: '분석이 완료되었습니다', body: '전사 검토 단계로 진행하세요.' });
        return;
      }
      setProgress(Math.min(100, Math.round(p)));
      setStage(stages[Math.min(stages.length - 1, Math.floor((p / 100) * stages.length))]);
    }, 250);
    return () => clearInterval(id);
  }, [analysisState]);

  // ---- Stepper widget ----
  const stepper = (
    <div style={sdStyles.stepperWrap}>
      <div style={sdStyles.stepperRow}>
        {STEPS.map((s, i) => {
          const currentStep = statusToStep(status);
          const done = s.id < currentStep || (s.id === currentStep && analysisState === 'COMPLETED' && currentStep === 3);
          const active = s.id === step;
          const disabled = s.id > currentStep && !(s.id === 2 && file?.state === 'UPLOADED') && !(s.id === 4 && status === 'REPORT_READY');
          return (
            <React.Fragment key={s.id}>
              <div style={sdStyles.stepCol} onClick={() => !disabled && setStep(s.id)}>
                <div style={sdStyles.stepCircle({ done, active, disabled })}>
                  {done ? <Icon name="check" size={14} strokeWidth={3} /> : s.id}
                </div>
                <div>
                  <div style={sdStyles.stepLabel({ done, active })}>{s.label}</div>
                  <div style={sdStyles.stepSub}>{s.sub}</div>
                </div>
              </div>
              {i < STEPS.length - 1 && <div style={sdStyles.stepConn(s.id < currentStep)} />}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );

  return (
    <>
      <PageHeader
        title={`세션 #${String(session.id).padStart(3, '0')}`}
        subtitle={`${session.date} ${session.time || '14:00'} · ${session.kind || '언어치료'} · ${session.duration || '60분'}`}
        breadcrumbs={[
          { label: '대시보드', onClick: () => onBack && onBack('dashboard') },
          { label: '아동 관리', onClick: () => onBack && onBack('children') },
          { label: session.child, onClick: () => onBack && onBack() },
          { label: `#${String(session.id).padStart(3, '0')}` },
        ]}
        actions={
          <>
            <StatusBadge status={status} />
            <Button variant="ghost" icon="arrowLeft" onClick={() => onBack && onBack()}>아동 프로필</Button>
          </>
        }
      />

      <div style={sdStyles.page}>
        {stepper}

        {step === 1 && (
          <StepUpload
            file={file}
            onFile={(f) => { setFile(f); setStatus('AUDIO_UPLOADED'); onToast && onToast({ title: '파일이 업로드되었습니다' }); }}
            onDelete={() => { setFile(null); setStatus('CREATED'); }}
            onStartAnalysis={() => { setStep(2); setAnalysisState('PROCESSING'); setStatus('ANALYSIS_PROCESSING'); setProgress(0); }}
          />
        )}

        {step === 2 && (
          <StepAnalysis
            state={analysisState}
            progress={progress}
            stage={stage}
            onCancel={() => { setAnalysisState('IDLE'); setProgress(0); setStatus('AUDIO_UPLOADED'); }}
            onRetry={() => { setAnalysisState('PROCESSING'); setProgress(0); setStatus('ANALYSIS_PROCESSING'); }}
            onNext={() => setStep(3)}
          />
        )}

        {step === 3 && (
          <StepReview
            utts={utts}
            setUtts={setUtts}
            editingId={editingId}
            setEditingId={setEditingId}
            openSpeakerMenu={openSpeakerMenu}
            setOpenSpeakerMenu={setOpenSpeakerMenu}
            selectedIds={selectedIds}
            setSelectedIds={setSelectedIds}
            onFinalize={() => {
              setUtts((arr) => arr.map((u) => ({ ...u, reviewed: true })));
              setStep(4);
              onToast && onToast({ title: '전사가 확정되었습니다', body: 'SOAP Note 초안이 생성되고 있어요.' });
            }}
          />
        )}

        {step === 4 && (
          <StepReport
            soap={soap}
            setSoap={setSoap}
            soapState={soapState}
            setSoapState={setSoapState}
            report={report}
            setReport={setReport}
            session={session}
            onSetStatus={(s) => setStatus(s)}
            onToast={onToast}
          />
        )}
      </div>
    </>
  );
};

Object.assign(window, { SessionDetailV2, STEPS, statusToStep });
