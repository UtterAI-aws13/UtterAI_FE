// =============================================================
// Report side panel — slide in from right
// =============================================================

const sideStyles = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 60,
    background: 'rgba(15, 42, 36, 0.35)',
    animation: 'fadeIn 200ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  panel: {
    position: 'fixed', top: 0, right: 0, bottom: 0,
    width: 'min(640px, 96vw)', zIndex: 61,
    background: '#fff',
    boxShadow: '-24px 0 48px -12px rgba(15, 42, 36, 0.18)',
    display: 'flex', flexDirection: 'column',
    animation: 'slideInRight 240ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  header: {
    padding: '18px 22px 16px',
    borderBottom: '1px solid #EEF1EF',
    flexShrink: 0,
  },
  topRow: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 14,
  },
  closeBtn: {
    width: 32, height: 32, borderRadius: 999,
    background: '#F6F8F7', border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#4B5650', cursor: 'pointer',
  },
  body: {
    flex: 1, overflow: 'auto',
    padding: '22px 24px 32px',
    background: '#F4FAF6',
  },
  doc: {
    background: '#fff', border: '1px solid #E2E6E4', borderRadius: 12,
    padding: 28, boxShadow: '0 1px 2px rgba(15,42,36,0.04), 0 1px 3px rgba(15,42,36,0.06)',
  },
  footer: {
    flexShrink: 0,
    padding: '14px 22px',
    background: '#F6F8F7', borderTop: '1px solid #EEF1EF',
    display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8,
  },
  sectionTitle: {
    fontSize: 11, fontWeight: 600, color: '#6B7280',
    letterSpacing: '0.06em', textTransform: 'uppercase',
    marginBottom: 8,
  },
  memoBox: {
    width: '100%',
    background: '#fff', border: '1px solid #E2E6E4', borderRadius: 10,
    padding: '10px 12px',
    fontSize: 12.5, color: '#2E3733', lineHeight: 1.55,
    minHeight: 60,
    fontFamily: 'var(--font-sans)',
    outline: 'none', resize: 'vertical',
    boxSizing: 'border-box',
  },
};

const ReportSidePanel = ({ report, gender, onClose, onToast }) => {
  const [memo, setMemo] = React.useState('보호자 면담 시 일상 대화 모델링에 대해 함께 이야기할 것.');

  // ESC to close
  React.useEffect(() => {
    const h = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', h);
    return () => window.removeEventListener('keydown', h);
  }, []);

  return (
    <>
      <div style={sideStyles.backdrop} onClick={onClose} />
      <div style={sideStyles.panel} onClick={(e) => e.stopPropagation()}>

        {/* Header */}
        <div style={sideStyles.header}>
          <div style={sideStyles.topRow}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 10, color: '#9AA3A0', fontFamily: "'JetBrains Mono', monospace", fontWeight: 600, letterSpacing: '0.04em' }}>{report.id}</span>
              <ReportStateChip state={report.state} />
              {report.sharedWith === '보호자' && (
                <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '3px 9px', borderRadius: 999, background: '#D8ECDF', color: '#1A3C34', fontSize: 11, fontWeight: 600 }}>
                  <Icon name="check" size={11} strokeWidth={3} /> 보호자 공유됨
                </span>
              )}
            </div>
            <button style={sideStyles.closeBtn} onClick={onClose} title="닫기 (Esc)">
              <Icon name="x" size={14} strokeWidth={2.4} />
            </button>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ ...reportsStyles.cardAvatar(gender), width: 36, height: 36, fontSize: 14 }}>{report.child[0]}</span>
            <div>
              <div style={{ fontSize: 17, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' }}>{report.title}</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>
                <b style={{ color: '#1A1A1A' }}>{report.child}</b> · {report.age} · 세션 {report.sessionDate}
              </div>
            </div>
          </div>
        </div>

        {/* Body (scrolling) */}
        <div style={sideStyles.body}>
          <div style={sideStyles.doc}>
            {report.state === 'DELETED' ? (
              <div style={{ padding: '40px 0', textAlign: 'center', color: '#6B7280' }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: '#FEE2E2', color: '#B91C1C', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
                  <Icon name="trash" size={22} strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>이 리포트는 삭제되었습니다</div>
                <div style={{ fontSize: 12, marginTop: 6 }}>삭제된 리포트의 내용은 더 이상 조회할 수 없습니다.</div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  SESSION REPORT
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 4px', letterSpacing: '-0.01em', color: '#1A1A1A' }}>
                  {report.child} · {report.sessionDate} 세션 리포트
                </h2>
                <div style={{ fontSize: 12, color: '#6B7280' }}>{report.age} · 언어치료 · 60분 · 작성자 {UtterData.me.name}</div>

                <div style={{ marginTop: 22, padding: 18, background: '#F4FAF6', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A3C34', marginBottom: 8 }}>오늘의 한 줄</div>
                  <div style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.7, wordBreak: 'keep-all' }}>
                    {report.child[0]}{report.child.slice(1)}이는 어린이집에서 있었던 일을 자발적으로 길게 이야기해주었고, 슬픈 감정도 솔직하게 표현했어요. 이야기 길이가 또래 평균 범위에서 안정적으로 자라고 있습니다.
                  </div>
                </div>

                {/* Metrics */}
                <div style={{ marginTop: 22 }}>
                  <div style={sideStyles.sectionTitle}>이번 세션 지표</div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 10 }}>
                    {UtterData.metrics.map((m) => (
                      <div key={m.label} style={{ border: '1px solid #E2E6E4', borderRadius: 10, padding: 14 }}>
                        <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{m.label}</div>
                        <div style={{ fontSize: 10.5, color: '#9AA3A0', marginTop: 1 }}>{m.desc}</div>
                        <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 6 }}>
                          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 22, fontWeight: 600, color: '#1A3C34', fontVariantNumeric: 'tabular-nums' }}>{m.value}</span>
                          <span style={{ fontSize: 11, fontWeight: 600, color: m.good ? '#15803D' : '#B45309' }}>
                            {m.dir === 'up' ? '▲' : '▼'} {m.delta}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* SOAP-derived narrative */}
                <div style={{ marginTop: 22 }}>
                  <div style={sideStyles.sectionTitle}>관찰 내용</div>
                  <p style={{ fontSize: 13, color: '#2E3733', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>
                    60분 세션, MLU {report.mlu ?? '4.27'} (또래 평균 3.8–4.5 범위), TTR 0.62. 자발 발화 빈도 평소 대비 27% 증가. 다음절 어휘 사용 관찰됨("차고지", "구급차"). 정서 어휘는 점진적 확장 중.
                  </p>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={sideStyles.sectionTitle}>치료사 평가</div>
                  <p style={{ fontSize: 13, color: '#2E3733', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>
                    발화 길이와 어휘 다양도는 또래 평균 범위 내에서 안정적 발달을 보이고 있으나, 복문 사용 빈도는 다소 낮음.
                  </p>
                </div>

                <div style={{ marginTop: 18 }}>
                  <div style={sideStyles.sectionTitle}>다음 세션 계획</div>
                  <p style={{ fontSize: 13, color: '#2E3733', lineHeight: 1.7, margin: 0, wordBreak: 'keep-all' }}>
                    다음 세션에서 그림책 활용한 복문 산출 활동 진행. 보호자에게 가정 내 일상 대화에서 "왜냐하면", "그래서" 사용 모델링 안내.
                  </p>
                </div>

                <div style={{ marginTop: 26, paddingTop: 16, borderTop: '1px solid #EEF1EF', fontSize: 11, color: '#9AA3A0', display: 'flex', justifyContent: 'space-between' }}>
                  <span>UtterAI로 작성됨 · {report.createdAt} 생성</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{report.id}</span>
                </div>
              </>
            )}
          </div>

          {/* Memo */}
          {report.state !== 'DELETED' && (
            <div style={{ marginTop: 18 }}>
              <div style={sideStyles.sectionTitle}>내부 메모 <span style={{ color: '#9AA3A0', fontWeight: 500, letterSpacing: 0, textTransform: 'none' }}>(보호자에게 공유되지 않음)</span></div>
              <textarea
                style={sideStyles.memoBox}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="이 리포트에 대한 내부 메모를 작성하세요."
              />
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div style={sideStyles.footer}>
          <div style={{ fontSize: 11, color: '#6B7280' }}>
            ⌘ Esc 누르면 닫힙니다
          </div>
          {report.state === 'READY' ? (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="ghost" size="md" icon="edit" onClick={() => onToast && onToast({ title: '리포트 편집 모드로 이동' })}>편집</Button>
              <Button variant="secondary" size="md" icon="download" onClick={() => onToast && onToast({ title: 'PDF 다운로드 시작', body: `${report.id} 리포트` })}>PDF</Button>
              <Button variant="primary" size="md" icon="check" onClick={() => onToast && onToast({ title: '보호자에게 공유 링크가 전송되었습니다' })}>보호자 공유</Button>
            </div>
          ) : (
            <Button variant="secondary" size="md" icon="activity" onClick={() => onToast && onToast({ title: '복원 요청을 보냈습니다' })}>복원 요청</Button>
          )}
        </div>
      </div>
    </>
  );
};

Object.assign(window, { ReportSidePanel });
