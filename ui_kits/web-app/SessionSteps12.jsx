// =============================================================
// SessionDetailV2 — Step 1 (Upload) + Step 2 (Analysis)
// =============================================================

// ---------- Step 1: Upload ----------
const StepUpload = ({ file, onFile, onDelete, onStartAnalysis }) => {
  const [dragOver, setDragOver] = React.useState(false);

  const handlePick = () => {
    onFile({
      name: 'session-024-park-seoyoon.wav',
      size: '42.3 MB',
      duration: '12:48',
      state: 'UPLOADED',
    });
  };

  return (
    <div style={sdStyles.pane}>
      <div style={sdStyles.paneHeader}>
        <div>
          <div style={sdStyles.paneTitle}>음성 파일 업로드</div>
          <div style={sdStyles.paneSubtitle}>녹음된 세션 오디오를 업로드하면 다음 단계에서 AI가 자동으로 분석합니다.</div>
        </div>
        <Button
          variant="primary"
          icon="activity"
          disabled={!file || file.state !== 'UPLOADED'}
          onClick={onStartAnalysis}
        >
          AI 분석 시작
        </Button>
      </div>

      <div style={sdStyles.paneBody}>
        {/* Dropzone */}
        <div
          onClick={handlePick}
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); handlePick(); }}
          style={{
            border: dragOver ? '2px dashed #1A3C34' : '2px dashed #7FB196',
            borderRadius: 12,
            background: dragOver ? '#ECF5EF' : '#F4FAF6',
            padding: 44, textAlign: 'center', cursor: 'pointer',
            transition: 'all 120ms',
          }}
        >
          <div style={{
            width: 56, height: 56, borderRadius: 14, background: '#D8ECDF',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            color: '#1A3C34', marginBottom: 12,
          }}>
            <Icon name="upload" size={26} strokeWidth={1.8} />
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A' }}>
            음성 파일을 여기에 드래그하거나{' '}
            <span style={{ color: '#2D6A4F', textDecoration: 'underline' }}>클릭해서 선택하세요</span>
          </div>
          <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>
            지원 형식: <b style={{ color: '#1A1A1A' }}>WAV · MP3 · M4A</b> · 최대 500MB
          </div>
        </div>

        {/* Uploaded file row */}
        {file && (
          <div style={{ marginTop: 16 }}>
            <div style={{ fontSize: 11, color: '#6B7280', fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: 8 }}>업로드된 파일</div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 14,
              padding: '14px 16px', background: '#fff',
              border: '1px solid #E2E6E4', borderRadius: 10,
            }}>
              <div style={{
                width: 40, height: 40, borderRadius: 10, background: '#ECF5EF',
                display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#1A3C34', flexShrink: 0,
              }}>
                <Icon name="audio" size={20} strokeWidth={1.9} />
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13.5, fontWeight: 600, color: '#1A1A1A', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{file.name}</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2, display: 'flex', gap: 8 }}>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{file.size}</span>
                  <span style={{ color: '#C9CFCC' }}>·</span>
                  <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{file.duration}</span>
                </div>
              </div>
              <FileStateChip state={file.state} />
              <button
                onClick={onDelete}
                style={{
                  width: 30, height: 30, borderRadius: 8, background: '#F6F8F7',
                  border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  color: '#6B7280', cursor: 'pointer', flexShrink: 0,
                }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#FEE2E2'; e.currentTarget.style.color = '#B91C1C'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = '#F6F8F7'; e.currentTarget.style.color = '#6B7280'; }}
                title="삭제"
              >
                <Icon name="trash" size={14} strokeWidth={2} />
              </button>
            </div>
          </div>
        )}

        {!file && (
          <div style={{ marginTop: 16, padding: '12px 14px', background: '#F6F8F7', borderRadius: 8, fontSize: 12, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 10 }}>
            <Icon name="info" size={14} color="#6B7280" /> 업로드 전에는 분석을 시작할 수 없어요.
          </div>
        )}
      </div>
    </div>
  );
};

const FileStateChip = ({ state }) => {
  const map = {
    PENDING:  { bg: '#FEF3C7', fg: '#B45309', label: 'PENDING · 처리 대기' },
    UPLOADED: { bg: '#DCFCE7', fg: '#15803D', label: 'UPLOADED · 업로드 완료' },
    DELETED:  { bg: '#FEE2E2', fg: '#B91C1C', label: 'DELETED · 삭제됨' },
  };
  const s = map[state] || map.UPLOADED;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', gap: 5,
      padding: '4px 10px', borderRadius: 999,
      background: s.bg, color: s.fg,
      fontSize: 11, fontWeight: 600, fontFamily: 'var(--font-sans)',
      whiteSpace: 'nowrap',
    }}>
      <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: 10 }}>{s.label}</span>
    </span>
  );
};

// ---------- Step 2: Analysis ----------
const StepAnalysis = ({ state, progress, stage, onCancel, onRetry, onNext }) => {
  return (
    <div style={sdStyles.pane}>
      <div style={sdStyles.paneHeader}>
        <div>
          <div style={sdStyles.paneTitle}>AI 분석</div>
          <div style={sdStyles.paneSubtitle}>화자 분리 · 발화 단위 분할 · 전사 · 언어 지표 산출이 자동으로 진행됩니다.</div>
        </div>
        {state === 'COMPLETED' && (
          <Button variant="primary" iconRight="chevronRight" onClick={onNext}>전사 검토</Button>
        )}
        {state === 'PROCESSING' && (
          <Button variant="ghost" icon="x" onClick={onCancel}>분석 취소</Button>
        )}
        {state === 'FAILED' && (
          <Button variant="primary" icon="activity" onClick={onRetry}>재시도</Button>
        )}
      </div>

      <div style={sdStyles.paneBody}>
        {state === 'IDLE' && (
          <div style={{ textAlign: 'center', padding: '40px 20px' }}>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: '#F6F8F7', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#9AA3A0', marginBottom: 14 }}>
              <Icon name="activity" size={24} strokeWidth={1.8} />
            </div>
            <div style={{ fontSize: 14, fontWeight: 600 }}>분석이 시작되지 않았습니다</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 6 }}>1단계로 돌아가 분석을 시작하세요.</div>
          </div>
        )}

        {state === 'PROCESSING' && (
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16 }}>
              <div style={{ position: 'relative', width: 44, height: 44, flexShrink: 0 }}>
                <svg width="44" height="44" viewBox="0 0 44 44">
                  <circle cx="22" cy="22" r="18" stroke="#D8ECDF" strokeWidth="4" fill="none" />
                  <circle cx="22" cy="22" r="18" stroke="#2D6A4F" strokeWidth="4" fill="none" strokeLinecap="round"
                    strokeDasharray="113" strokeDashoffset={113 * (1 - progress / 100)}
                    transform="rotate(-90 22 22)" style={{ transition: 'stroke-dashoffset 250ms' }} />
                </svg>
                <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'JetBrains Mono', monospace", fontSize: 10, fontWeight: 600, color: '#1A3C34' }}>{progress}%</div>
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 14, fontWeight: 600 }}>분석 진행 중</div>
                <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>현재 단계: <b style={{ color: '#1A1A1A' }}>{stage}</b></div>
              </div>
              <StatusBadge status="ANALYSIS_PROCESSING" showEnum={false} />
            </div>

            <div style={{ height: 8, background: '#EEF1EF', borderRadius: 999, overflow: 'hidden' }}>
              <div style={{
                width: `${progress}%`, height: '100%',
                background: 'linear-gradient(90deg, #2D6A4F, #4D8A6F)',
                borderRadius: 999, transition: 'width 250ms',
              }} />
            </div>

            <div style={{ marginTop: 18, display: 'flex', flexDirection: 'column', gap: 6 }}>
              {['음성 정제', '화자 분리', '발화 단위 분할', '전사 생성', '언어 지표 산출'].map((s, i) => {
                const stageIdx = Math.floor((progress / 100) * 5);
                const sDone = i < stageIdx; const sActive = i === stageIdx;
                return (
                  <div key={s} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '6px 10px', borderRadius: 6, background: sActive ? '#ECF5EF' : 'transparent' }}>
                    <div style={{ width: 18, height: 18, borderRadius: 999, background: sDone ? '#1A3C34' : sActive ? '#fff' : '#EEF1EF', border: sActive ? '2px solid #2D6A4F' : 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', color: sDone ? '#fff' : '#9AA3A0' }}>
                      {sDone && <Icon name="check" size={10} strokeWidth={3.5} />}
                    </div>
                    <span style={{ fontSize: 12, color: sDone || sActive ? '#1A1A1A' : '#9AA3A0', fontWeight: sDone || sActive ? 600 : 500 }}>{s}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {state === 'COMPLETED' && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 16,
            padding: 20, background: '#ECF5EF',
            border: '1px solid #D8ECDF', borderRadius: 10,
          }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: '#1A3C34', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Icon name="check" size={22} strokeWidth={3} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1A3C34' }}>분석이 완료되었습니다</div>
              <div style={{ fontSize: 12, color: '#245249', marginTop: 4, lineHeight: 1.55 }}>
                128개 발화가 추출되었고, 화자 분리 신뢰도는 평균 92%입니다. 다음 단계에서 검토해주세요.
              </div>
            </div>
            <Button variant="primary" iconRight="chevronRight" onClick={onNext}>전사 검토</Button>
          </div>
        )}

        {state === 'FAILED' && (
          <div style={{
            display: 'flex', alignItems: 'flex-start', gap: 14,
            padding: 18, background: '#FEE2E2',
            border: '1px solid #FECACA', borderRadius: 10,
          }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, border: '1px solid #FCA5A5' }}>
              <Icon name="alert" size={18} strokeWidth={2} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#B91C1C' }}>분석에 실패했습니다</div>
              <div style={{ fontSize: 12, color: '#7F1D1D', marginTop: 4, lineHeight: 1.55 }}>
                오디오 파일이 손상되었거나 너무 길어서 처리할 수 없습니다. 다른 파일을 업로드하거나 잠시 후 다시 시도해주세요.
              </div>
            </div>
            <Button variant="primary" icon="activity" onClick={onRetry}>재시도</Button>
          </div>
        )}
      </div>
    </div>
  );
};

Object.assign(window, { StepUpload, StepAnalysis, FileStateChip });
