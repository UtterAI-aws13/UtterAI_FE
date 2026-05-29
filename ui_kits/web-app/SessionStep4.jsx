// =============================================================
// SessionDetailV2 — Step 4 (Report: SOAP + final report)
// =============================================================

const SOAP_SECTIONS = [
  { key: 'S', title: 'Subjective', kr: '주관적 정보', desc: '아동·보호자의 보고, 주관적 호소' },
  { key: 'O', title: 'Objective',  kr: '객관적 정보', desc: '관찰된 사실, 정량 지표' },
  { key: 'A', title: 'Assessment', kr: '평가',        desc: '임상적 판단, 진단적 인상' },
  { key: 'P', title: 'Plan',       kr: '계획',        desc: '다음 세션 목표, 권고 사항' },
];

const SOAP_STATE = {
  DRAFT:      { bg: '#FEF3C7', fg: '#B45309', label: 'DRAFT · 초안',        dot: '#F59E0B' },
  SAVED:      { bg: '#DBEAFE', fg: '#1D4ED8', label: 'SAVED · 저장됨',      dot: '#3B82F6' },
  FINALIZED:  { bg: '#1A3C34', fg: '#fff',    label: 'FINALIZED · 확정됨',  dot: '#B7DEC8' },
};

const reportStyles = {
  soapHeader: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '12px 14px', background: '#F4FAF6', borderRadius: 10,
    marginBottom: 14,
  },
  soapStatePill: (state) => ({
    display: 'inline-flex', alignItems: 'center', gap: 6,
    padding: '4px 10px', borderRadius: 999,
    background: SOAP_STATE[state].bg,
    color:      SOAP_STATE[state].fg,
    fontSize: 11, fontWeight: 600,
    fontFamily: "'JetBrains Mono', monospace",
  }),
  card: { border: '1px solid #E2E6E4', borderRadius: 10, overflow: 'hidden', marginBottom: 12 },
  cardHeader: {
    display: 'flex', alignItems: 'center', gap: 12,
    padding: '12px 14px', background: '#F6F8F7',
    borderBottom: '1px solid #EEF1EF',
  },
  letterBlock: {
    width: 30, height: 30, borderRadius: 8,
    background: '#1A3C34', color: '#fff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontFamily: "'JetBrains Mono', monospace", fontSize: 14, fontWeight: 700, flexShrink: 0,
  },
  cardTitle: { fontSize: 13, fontWeight: 600, color: '#1A1A1A', display: 'flex', alignItems: 'baseline', gap: 6 },
  cardSubtitle: { fontSize: 11, color: '#6B7280' },
  cardBody: { padding: 0 },
  textarea: (locked) => ({
    width: '100%', minHeight: 80, padding: '12px 14px',
    border: 'none', outline: 'none', resize: 'vertical',
    fontFamily: 'var(--font-sans)', fontSize: 13, color: '#1A1A1A',
    lineHeight: 1.65, boxSizing: 'border-box',
    background: locked ? '#F6F8F7' : '#fff',
    cursor: locked ? 'not-allowed' : 'text',
  }),
};

const StepReport = ({ soap, setSoap, soapState, setSoapState, report, setReport, session, onSetStatus, onToast }) => {
  const [generating, setGenerating] = React.useState(false);
  const [templateId, setTemplateId] = React.useState(() => {
    const tpls = (typeof initialTemplates !== 'undefined') ? initialTemplates : [];
    return (tpls.find((t) => t.isDefault) || tpls[0] || { id: 'sys-default' }).id;
  });
  const [tplMenuOpen, setTplMenuOpen] = React.useState(false);
  const locked = soapState === 'FINALIZED';

  const availableTemplates = (typeof initialTemplates !== 'undefined') ? initialTemplates : [];
  const selectedTpl = availableTemplates.find((t) => t.id === templateId) || availableTemplates[0];

  const regenerateWithTemplate = (id) => {
    setTemplateId(id);
    setTplMenuOpen(false);
    const tpl = availableTemplates.find((t) => t.id === id);
    onToast && onToast({ title: '템플릿으로 재생성 중', body: `"${tpl?.name}" 템플릿이 적용됩니다.` });
  };

  const saveDraft = () => {
    setSoapState('SAVED');
    onToast && onToast({ title: 'SOAP Note가 저장되었습니다' });
  };

  const finalize = () => {
    setSoapState('FINALIZED');
    onToast && onToast({ title: 'SOAP Note가 확정되었습니다', body: '이제 보호자용 리포트를 생성할 수 있어요.' });
  };

  const reopen = () => {
    setSoapState('SAVED');
  };

  const generateReport = () => {
    setGenerating(true);
    setTimeout(() => {
      setGenerating(false);
      setReport({ generated: true });
      onSetStatus && onSetStatus('REPORT_READY');
      onToast && onToast({ title: '리포트가 생성되었습니다', body: '보호자에게 공유할 수 있어요.' });
    }, 1400);
  };

  return (
    <>
      {/* SOAP Note pane */}
      <div style={{ ...sdStyles.pane, marginBottom: 16 }}>
        <div style={sdStyles.paneHeader}>
          <div>
            <div style={sdStyles.paneTitle}>SOAP Note</div>
            <div style={sdStyles.paneSubtitle}>AI가 생성한 초안을 검토·편집한 뒤 확정해주세요.</div>
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            {soapState !== 'FINALIZED' && <Button variant="ghost" icon="download" size="md">초안 저장</Button>}
            {soapState === 'DRAFT' && <Button variant="secondary" icon="check" onClick={saveDraft}>저장</Button>}
            {(soapState === 'SAVED' || soapState === 'DRAFT') && (
              <Button variant="primary" icon="check" onClick={finalize}>확정 서명</Button>
            )}
            {soapState === 'FINALIZED' && (
              <Button variant="secondary" icon="edit" onClick={reopen}>다시 편집</Button>
            )}
          </div>
        </div>

        <div style={sdStyles.paneBody}>
          {/* Template selector — shown above SOAP draft */}
          {soapState !== 'FINALIZED' && (
            <div style={{
              display: 'flex', alignItems: 'center', gap: 12,
              padding: '10px 14px', marginBottom: 14,
              background: '#fff', border: '1px solid #D8ECDF', borderRadius: 10,
            }}>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: '#ECF5EF', color: '#1A3C34', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Icon name="fileText" size={16} strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 11, fontWeight: 600, color: '#6B7280', letterSpacing: '0.04em', textTransform: 'uppercase' }}>사용 중인 SOAP 템플릿</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginTop: 2, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {selectedTpl?.name}
                  {selectedTpl?.isDefault && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#1A3C34', background: '#D8ECDF', padding: '1px 7px', borderRadius: 999 }}>기본</span>
                  )}
                  {selectedTpl?.isSystem && (
                    <span style={{ fontSize: 10, fontWeight: 600, color: '#4B5650', background: '#EEF1EF', padding: '1px 7px', borderRadius: 999 }}>시스템</span>
                  )}
                </div>
              </div>
              <div style={{ position: 'relative' }} data-template-menu>
                <Button
                  size="sm" variant="secondary"
                  iconRight={tplMenuOpen ? 'chevronDown' : 'chevronDown'}
                  onClick={() => setTplMenuOpen((v) => !v)}
                >
                  템플릿 변경
                </Button>
                {tplMenuOpen && (
                  <>
                    <div
                      onClick={() => setTplMenuOpen(false)}
                      style={{ position: 'fixed', inset: 0, zIndex: 19 }}
                    />
                    <div style={{
                      position: 'absolute', top: 'calc(100% + 6px)', right: 0, zIndex: 20,
                      background: '#fff', borderRadius: 10,
                      boxShadow: '0 12px 24px -8px rgba(15,42,36,0.16), 0 4px 8px -4px rgba(15,42,36,0.08)',
                      border: '1px solid #E2E6E4', padding: 6, minWidth: 280,
                    }}>
                      <div style={{ fontSize: 10, fontWeight: 600, color: '#9AA3A0', letterSpacing: '0.06em', textTransform: 'uppercase', padding: '6px 10px 4px' }}>사용할 템플릿 선택</div>
                      {availableTemplates.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => regenerateWithTemplate(t.id)}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                            background: t.id === templateId ? '#ECF5EF' : 'transparent',
                          }}
                          onMouseEnter={(e) => { if (t.id !== templateId) e.currentTarget.style.background = '#F6F8F7'; }}
                          onMouseLeave={(e) => { if (t.id !== templateId) e.currentTarget.style.background = 'transparent'; }}
                        >
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontSize: 12.5, fontWeight: t.id === templateId ? 600 : 500, color: t.id === templateId ? '#1A3C34' : '#1A1A1A' }}>{t.name}</div>
                            <div style={{ fontSize: 10.5, color: '#6B7280', marginTop: 1, display: 'flex', gap: 4 }}>
                              {t.isSystem && <span>시스템</span>}
                              {t.isDefault && <span style={{ color: '#1A3C34', fontWeight: 600 }}>· 기본</span>}
                              {!t.isSystem && <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>· {t.updatedAt}</span>}
                            </div>
                          </div>
                          {t.id === templateId && <Icon name="check" size={13} strokeWidth={2.5} color="#1A3C34" />}
                        </div>
                      ))}
                      <div style={{ borderTop: '1px solid #EEF1EF', marginTop: 4, paddingTop: 4 }}>
                        <div
                          onClick={() => { setTplMenuOpen(false); onToast && onToast({ title: '템플릿 관리로 이동', body: '사이드바 → 템플릿 관리에서 편집할 수 있어요.' }); }}
                          style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '8px 10px', borderRadius: 6, cursor: 'pointer',
                            color: '#2D6A4F', fontSize: 12, fontWeight: 600,
                          }}
                          onMouseEnter={(e) => e.currentTarget.style.background = '#F6F8F7'}
                          onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                        >
                          <Icon name="settings" size={13} strokeWidth={2} />
                          템플릿 관리…
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}

          <div style={reportStyles.soapHeader}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={reportStyles.soapStatePill(soapState)}>
                <span style={{ width: 6, height: 6, borderRadius: 999, background: SOAP_STATE[soapState].dot }} />
                {SOAP_STATE[soapState].label}
              </span>
              <span style={{ fontSize: 11, color: '#6B7280' }}>
                {soapState === 'DRAFT'    && 'AI가 자동 생성한 초안입니다.'}
                {soapState === 'SAVED'    && '14:32 저장됨 · 자동 저장 활성'}
                {soapState === 'FINALIZED' && '14:48 확정됨 · 변경하려면 "다시 편집"을 누르세요.'}
              </span>
            </div>
            {soapState === 'DRAFT' && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, fontSize: 11, color: '#1A3C34', fontWeight: 600 }}>
                <Icon name="info" size={12} /> 편집 후 자동 저장됩니다
              </span>
            )}
          </div>

          {SOAP_SECTIONS.map((s) => (
            <div key={s.key} style={reportStyles.card}>
              <div style={reportStyles.cardHeader}>
                <div style={reportStyles.letterBlock}>{s.key}</div>
                <div>
                  <div style={reportStyles.cardTitle}>
                    {s.title}
                    <span style={{ fontSize: 11, color: '#6B7280', fontWeight: 500 }}>· {s.kr}</span>
                  </div>
                  <div style={reportStyles.cardSubtitle}>{s.desc}</div>
                </div>
                {locked && (
                  <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 4, fontSize: 10.5, color: '#6B7280', fontWeight: 600 }}>
                    <Icon name="check" size={11} strokeWidth={3} /> 잠김
                  </span>
                )}
              </div>
              <textarea
                style={reportStyles.textarea(locked)}
                value={soap[s.key] || ''}
                readOnly={locked}
                onChange={(e) => { setSoap({ ...soap, [s.key]: e.target.value }); if (soapState === 'DRAFT') setSoapState('DRAFT'); else if (soapState === 'SAVED') setSoapState('DRAFT'); }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Report pane */}
      <div style={sdStyles.pane}>
        <div style={sdStyles.paneHeader}>
          <div>
            <div style={sdStyles.paneTitle}>보호자 리포트</div>
            <div style={sdStyles.paneSubtitle}>확정된 SOAP Note를 기반으로 보호자가 이해하기 쉬운 형식의 리포트를 생성합니다.</div>
          </div>
          {!report.generated && (
            <Button
              variant="primary"
              icon="activity"
              onClick={generateReport}
              disabled={soapState !== 'FINALIZED' || generating}
            >
              {generating ? '생성 중…' : '리포트 생성'}
            </Button>
          )}
          {report.generated && (
            <div style={{ display: 'flex', gap: 8 }}>
              <Button variant="secondary" icon="edit">수정</Button>
              <Button variant="primary" icon="download">PDF 다운로드</Button>
            </div>
          )}
        </div>

        <div style={sdStyles.paneBody}>
          {soapState !== 'FINALIZED' && !report.generated && (
            <div style={{
              padding: '36px 20px', textAlign: 'center',
              background: '#F6F8F7', borderRadius: 10,
              border: '1px dashed #C9CFCC',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#EEF1EF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3A0', marginBottom: 12 }}>
                <Icon name="report" size={22} strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>SOAP Note 확정 후 리포트를 생성할 수 있어요</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>위에서 SOAP Note를 "확정 서명"한 뒤 다시 시도해주세요.</div>
            </div>
          )}

          {soapState === 'FINALIZED' && !report.generated && !generating && (
            <div style={{
              padding: '36px 20px', textAlign: 'center',
              background: '#F4FAF6', borderRadius: 10,
              border: '1px dashed #7FB196',
            }}>
              <div style={{ width: 48, height: 48, borderRadius: 12, background: '#D8ECDF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#1A3C34', marginBottom: 12 }}>
                <Icon name="report" size={22} strokeWidth={1.8} />
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>리포트 생성 준비 완료</div>
              <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6, lineHeight: 1.6 }}>
                "리포트 생성" 버튼을 누르면 보호자가 이해하기 쉬운 형식으로 자동 변환됩니다.
              </div>
            </div>
          )}

          {generating && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <div style={{ position: 'relative', width: 44, height: 44, margin: '0 auto 14px' }}>
                <svg width="44" height="44" viewBox="0 0 44 44" style={{ animation: 'spin 1s linear infinite' }}>
                  <circle cx="22" cy="22" r="18" stroke="#D8ECDF" strokeWidth="3" fill="none" />
                  <circle cx="22" cy="22" r="18" stroke="#2D6A4F" strokeWidth="3" fill="none" strokeLinecap="round" strokeDasharray="113" strokeDashoffset="80" />
                </svg>
              </div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>리포트를 생성하고 있어요…</div>
              <div style={{ fontSize: 11, color: '#6B7280', marginTop: 4 }}>잠시만 기다려주세요.</div>
            </div>
          )}

          {report.generated && (
            <div style={{ border: '1px solid #E2E6E4', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: 28, background: '#fff' }}>
                <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase' }}>
                  SESSION REPORT · #{String(session.id).padStart(3, '0')}
                </div>
                <h2 style={{ fontSize: 22, fontWeight: 700, margin: '6px 0 4px', letterSpacing: '-0.01em' }}>
                  {session.child} · {session.date} 세션 리포트
                </h2>
                <div style={{ fontSize: 12, color: '#6B7280' }}>
                  {session.age || '6세 2개월'} · {session.kind || '언어치료'} · 60분 · 작성자 {UtterData.me.name}
                </div>

                <div style={{ marginTop: 22, padding: 16, background: '#F4FAF6', borderRadius: 10 }}>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#1A3C34', marginBottom: 8 }}>오늘의 한 줄</div>
                  <div style={{ fontSize: 14, color: '#1A1A1A', lineHeight: 1.65 }}>
                    서윤이는 어린이집에서 있었던 일을 자발적으로 길게 이야기해주었고, 슬픈 감정도 솔직하게 표현했어요. 이야기 길이가 또래 평균 범위에서 안정적으로 자라고 있습니다.
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10, marginTop: 18 }}>
                  {UtterData.metrics.map((m) => (
                    <div key={m.label} style={{ border: '1px solid #E2E6E4', borderRadius: 8, padding: 12 }}>
                      <div style={{ fontSize: 10, color: '#6B7280', fontWeight: 600, letterSpacing: '0.04em', textTransform: 'uppercase' }}>{m.label}</div>
                      <div style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 18, fontWeight: 600, color: '#1A3C34', marginTop: 4, fontVariantNumeric: 'tabular-nums' }}>{m.value}</div>
                      <div style={{ fontSize: 10, color: m.good ? '#15803D' : '#B45309', marginTop: 2, fontWeight: 600 }}>
                        {m.dir === 'up' ? '▲' : '▼'} {m.delta}
                      </div>
                    </div>
                  ))}
                </div>

                <div style={{ marginTop: 18, fontSize: 12.5, color: '#4B5650', lineHeight: 1.7 }}>
                  <b style={{ color: '#1A1A1A' }}>다음 세션 계획:</b> 그림책을 활용한 복문 산출 활동을 진행할 예정입니다. 가정에서는 일상 대화 중 "왜냐하면", "그래서"를 함께 사용해보세요.
                </div>
              </div>

              <div style={{ padding: '14px 18px', background: '#F6F8F7', borderTop: '1px solid #EEF1EF', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 11, color: '#6B7280' }}>
                  <Icon name="check" size={11} strokeWidth={3} color="#15803D" /> 14:48 생성됨 · 보호자에게 아직 공유되지 않음
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <Button size="sm" variant="ghost" icon="edit">수정</Button>
                  <Button size="sm" variant="ghost" icon="download">PDF</Button>
                  <Button size="sm" variant="primary" icon="check">보호자에게 공유</Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
};

Object.assign(window, { StepReport, SOAP_SECTIONS, SOAP_STATE });
