// =============================================================
// Session detail — Transcript / Metrics / SOAP / Report tabs
// =============================================================

const detailStyles = {
  layout: { display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 320px', gap: 20, padding: '0 32px 32px' },
  card: { background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12, overflow: 'hidden', boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)' },
  tabs: { display: 'flex', borderBottom: '1px solid #E2E6E4' },
  tab: (active, disabled) => ({
    padding: '12px 18px', fontSize: 13,
    fontWeight: active ? 600 : 500,
    color: disabled ? '#C9CFCC' : active ? '#1A3C34' : '#6B7280',
    borderBottom: active ? '2px solid #1A3C34' : '2px solid transparent',
    marginBottom: -1, cursor: disabled ? 'not-allowed' : 'pointer',
    background: 'transparent',
    transition: 'color 120ms',
  }),
  audioBar: {
    display: 'flex', alignItems: 'center', gap: 14,
    padding: '14px 18px', background: '#F4FAF6', borderBottom: '1px solid #EEF1EF',
  },
  playBtn: {
    width: 38, height: 38, borderRadius: 999,
    background: '#1A3C34', color: '#fff', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', flexShrink: 0,
  },
  waveform: { flex: 1, height: 28, display: 'flex', alignItems: 'center', gap: 2 },
  waveBar: (h, played) => ({
    flex: 1, height: `${h}%`, borderRadius: 2,
    background: played ? '#2D6A4F' : '#C9CFCC',
  }),
  time: { fontFamily: "'JetBrains Mono', monospace", fontSize: 11, color: '#6B7280', fontVariantNumeric: 'tabular-nums', minWidth: 80, textAlign: 'right' },
  sideCard: { background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12, padding: 18, boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)' },
  sideTitle: { fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 12 },
};

const generateWaveform = () => {
  const seed = 42;
  let s = seed;
  return Array.from({ length: 72 }, () => {
    s = (s * 9301 + 49297) % 233280;
    return 22 + Math.abs(Math.sin(s * 0.01)) * 75;
  });
};
const WAVEFORM = generateWaveform();

const SessionDetail = ({ session, onBack }) => {
  const [tab, setTab] = React.useState('transcript');
  const [playing, setPlaying] = React.useState(false);
  const [pos, setPos] = React.useState(0.35);
  const [activeUtt, setActiveUtt] = React.useState(2);

  React.useEffect(() => {
    if (!playing) return;
    const id = setInterval(() => {
      setPos((p) => (p >= 1 ? 0 : p + 0.01));
    }, 200);
    return () => clearInterval(id);
  }, [playing]);

  return (
    <>
      <PageHeader
        title={`${session.child} · 세션 #${String(session.id).padStart(3, '0')}`}
        subtitle={`${session.age} · ${session.date} ${session.time} · ${session.kind} 세션 · 60분`}
        breadcrumbs={[
          { label: '대시보드', onClick: onBack },
          { label: '세션', onClick: onBack },
          { label: `#${String(session.id).padStart(3, '0')}` },
        ]}
        actions={
          <>
            <StatusBadge status={session.status} />
            <Button variant="secondary" size="md" icon="download">PDF 내보내기</Button>
            <Button variant="primary" size="md" icon="check">보호자에게 공유</Button>
          </>
        }
      />

      <div style={detailStyles.layout}>
        {/* LEFT: tabbed content */}
        <div style={detailStyles.card}>
          <div style={detailStyles.tabs}>
            <div style={detailStyles.tab(tab === 'transcript')} onClick={() => setTab('transcript')}>Transcript</div>
            <div style={detailStyles.tab(tab === 'metrics')} onClick={() => setTab('metrics')}>
              언어 지표 <span style={{ display: 'inline-block', marginLeft: 4, padding: '1px 7px', background: tab === 'metrics' ? '#D8ECDF' : '#EEF1EF', color: tab === 'metrics' ? '#1A3C34' : '#4B5650', borderRadius: 999, fontSize: 10, fontWeight: 600 }}>4</span>
            </div>
            <div style={detailStyles.tab(tab === 'soap')} onClick={() => setTab('soap')}>SOAP Note</div>
            <div style={detailStyles.tab(tab === 'report')} onClick={() => setTab('report')}>리포트</div>
            <div style={detailStyles.tab(false, true)}>로그</div>
          </div>

          {/* Audio bar (transcript only) */}
          {tab === 'transcript' && (
            <div style={detailStyles.audioBar}>
              <button style={detailStyles.playBtn} onClick={() => setPlaying(!playing)}>
                <Icon name={playing ? 'pause' : 'play'} size={15} color="#fff" strokeWidth={0} />
              </button>
              <div style={detailStyles.waveform}>
                {WAVEFORM.map((h, i) => (
                  <div key={i} style={detailStyles.waveBar(h, i / WAVEFORM.length < pos)} />
                ))}
              </div>
              <div style={detailStyles.time}>
                <span style={{ color: '#1A3C34', fontWeight: 600 }}>{Math.floor(pos * 12)}:{String(Math.floor(pos * 768) % 60).padStart(2, '0')}</span>
                <span style={{ margin: '0 4px' }}>/</span>
                <span>12:48</span>
              </div>
            </div>
          )}

          <div style={{ padding: '18px 22px' }}>
            {tab === 'transcript' && (
              <Transcript utterances={UtterData.utterances} activeIndex={activeUtt} onSelect={setActiveUtt} />
            )}
            {tab === 'metrics' && <MetricsView />}
            {tab === 'soap' && <SOAPView />}
            {tab === 'report' && <ReportView session={session} />}
          </div>
        </div>

        {/* RIGHT: child profile + session info */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={detailStyles.sideCard}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#D8ECDF', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3C34', fontWeight: 700, fontSize: 18 }}>
                {session.child[0]}
              </div>
              <div>
                <div style={{ fontSize: 15, fontWeight: 700 }}>{session.child}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>{session.age} · 여</div>
              </div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 14, fontSize: 12 }}>
              <div><div style={{ color: '#6B7280', marginBottom: 2 }}>총 세션</div><div style={{ fontWeight: 600 }}>24회</div></div>
              <div><div style={{ color: '#6B7280', marginBottom: 2 }}>시작일</div><div style={{ fontWeight: 600 }}>2024.10</div></div>
              <div><div style={{ color: '#6B7280', marginBottom: 2 }}>주 진단</div><div style={{ fontWeight: 600 }}>표현언어 지연</div></div>
              <div><div style={{ color: '#6B7280', marginBottom: 2 }}>담당</div><div style={{ fontWeight: 600 }}>김지원</div></div>
            </div>
            <button style={{ marginTop: 14, width: '100%', padding: '8px 12px', background: 'transparent', border: '1px solid #E2E6E4', borderRadius: 999, color: '#1A3C34', fontWeight: 600, fontSize: 12, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>아동 프로필 보기</button>
          </div>

          <div style={detailStyles.sideCard}>
            <div style={detailStyles.sideTitle}>이번 세션 요약</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {UtterData.metrics.slice(0, 4).map((m) => (
                <div key={m.label} style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between' }}>
                  <div>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 11, fontWeight: 600, color: '#1A3C34' }}>{m.label}</span>
                    <span style={{ fontSize: 11, color: '#6B7280', marginLeft: 6 }}>{m.desc}</span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                    <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 600, fontVariantNumeric: 'tabular-nums', color: '#1A1A1A' }}>{m.value}</span>
                    <span style={{ fontSize: 10, fontWeight: 600, color: m.good ? '#15803D' : '#B45309' }}>
                      {m.dir === 'up' ? '▲' : '▼'} {m.delta}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ ...detailStyles.sideCard, background: '#ECF5EF', border: '1px solid #D8ECDF' }}>
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
              <div style={{ color: '#1A3C34', flexShrink: 0, marginTop: 1 }}><Icon name="info" size={16} strokeWidth={2} /></div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1A3C34' }}>AI 검토 제안</div>
                <div style={{ fontSize: 11, color: '#245249', lineHeight: 1.55, marginTop: 4 }}>
                  00:24.7 발화의 화자 분류 신뢰도가 76%입니다. 직접 확인 후 확정해주세요.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

// -------- Metrics view --------
const MetricsView = () => {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
      {UtterData.metrics.map((m) => (
        <div key={m.label} style={{ border: '1px solid #E2E6E4', borderRadius: 10, padding: 16 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 12, fontWeight: 600, color: '#1A3C34' }}>{m.label}</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 1 }}>{m.desc}</div>
            </div>
            <Icon name="chart" size={16} color="#9AA3A0" />
          </div>
          <div style={{ marginTop: 8, display: 'flex', alignItems: 'baseline', gap: 8 }}>
            <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 30, fontWeight: 500, color: '#1A3C34', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{m.value}</div>
            <div style={{ fontSize: 11, fontWeight: 600, color: m.good ? '#15803D' : '#B45309' }}>
              {m.dir === 'up' ? '▲' : '▼'} {m.delta}
            </div>
          </div>
          {/* Sparkline */}
          <svg viewBox="0 0 200 36" style={{ width: '100%', height: 36, marginTop: 8 }} preserveAspectRatio="none">
            <polyline
              points={Array.from({ length: 8 }, (_, i) => {
                const y = 30 - (Math.sin(i * 0.6 + m.label.length) * 8 + 8 + (m.dir === 'up' ? i * 1.5 : -i * 0.6));
                return `${i * (200 / 7)},${y}`;
              }).join(' ')}
              fill="none" stroke={m.good ? '#2D6A4F' : '#F59E0B'} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
            />
          </svg>
        </div>
      ))}
    </div>
  );
};

// -------- SOAP view --------
const SOAPView = () => {
  const sections = [
    { key: 'S', title: 'Subjective · 주관적', desc: '아동·보호자 보고 사항' },
    { key: 'O', title: 'Objective · 객관적',  desc: '관찰된 사실, 지표' },
    { key: 'A', title: 'Assessment · 평가',    desc: '치료사의 임상적 판단' },
    { key: 'P', title: 'Plan · 계획',          desc: '다음 세션, 권고 사항' },
  ];
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, padding: '3px 10px', borderRadius: 999, background: '#ECF5EF', color: '#1A3C34', fontSize: 11, fontWeight: 600 }}>
            <Icon name="check" size={11} strokeWidth={3} /> AI 초안 · 자동 생성됨
          </span>
          <span style={{ fontSize: 11, color: '#6B7280' }}>14:32 저장됨</span>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          <Button size="sm" variant="ghost" icon="edit">편집</Button>
          <Button size="sm" variant="primary" icon="check">확정 서명</Button>
        </div>
      </div>

      {sections.map((s) => (
        <div key={s.key} style={{ border: '1px solid #E2E6E4', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 14px', background: '#F6F8F7', borderBottom: '1px solid #EEF1EF' }}>
            <div style={{ width: 26, height: 26, borderRadius: 8, background: '#1A3C34', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 13, fontWeight: 700 }}>{s.key}</div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>{s.title}</div>
              <div style={{ fontSize: 11, color: '#6B7280' }}>{s.desc}</div>
            </div>
          </div>
          <div style={{ padding: '12px 14px', fontSize: 13, color: '#1A1A1A', lineHeight: 1.6 }}>
            {UtterData.soap[s.key]}
          </div>
        </div>
      ))}
    </div>
  );
};

// -------- Report view --------
const ReportView = ({ session }) => {
  return (
    <div>
      <div style={{ background: '#F4FAF6', border: '1px solid #D8ECDF', borderRadius: 10, padding: 16, marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12 }}>
        <Icon name="info" size={18} color="#2D6A4F" />
        <div style={{ flex: 1, fontSize: 12, color: '#245249' }}>
          이 리포트는 보호자에게 공유 가능한 형식입니다. 공유 후에는 PDF 사본이 자동 보관됩니다.
        </div>
        <Button size="sm" variant="primary">보호자에게 공유</Button>
      </div>

      <div style={{ background: '#fff', border: '1px solid #E2E6E4', borderRadius: 10, padding: 24 }}>
        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>SESSION REPORT · #{String(session.id).padStart(3, '0')}</div>
        <h2 style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 4px', letterSpacing: '-0.01em' }}>{session.child} · {session.date} 세션 리포트</h2>
        <div style={{ fontSize: 12, color: '#6B7280' }}>{session.age} · {session.kind} · 60분 · 작성자 김지원</div>

        <div style={{ marginTop: 22, padding: 16, background: '#F4FAF6', borderRadius: 10 }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#1A3C34', marginBottom: 8 }}>오늘의 한 줄</div>
          <div style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.6 }}>
            서윤이는 어린이집에서 있었던 일을 자발적으로 길게 이야기해주었고, 슬픈 감정도 솔직하게 표현했어요. 이야기 길이가 또래 평균 범위에서 안정적으로 자라고 있습니다.
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 12, marginTop: 20 }}>
          <ReportStat label="이번 세션 MLU" value="4.27" delta="+0.34" good />
          <ReportStat label="새로 사용한 어휘" value="9개" delta="차고지, 구급차…" />
        </div>

        <div style={{ marginTop: 20, fontSize: 12, color: '#6B7280', lineHeight: 1.6 }}>
          다음 세션에서는 그림책을 활용한 복문 산출 활동을 진행할 예정입니다. 가정에서는 일상 대화 중 "왜냐하면", "그래서"를 함께 사용해보세요.
        </div>
      </div>
    </div>
  );
};

const ReportStat = ({ label, value, delta, good }) => (
  <div style={{ border: '1px solid #E2E6E4', borderRadius: 10, padding: 14 }}>
    <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{label}</div>
    <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 24, fontWeight: 500, color: '#1A3C34', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{value}</div>
    <div style={{ fontSize: 11, color: good ? '#15803D' : '#6B7280', marginTop: 2 }}>{delta}</div>
  </div>
);

Object.assign(window, { SessionDetail, MetricsView, SOAPView, ReportView });
