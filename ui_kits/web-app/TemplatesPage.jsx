// =============================================================
// SOAP Templates page (편집기 + 새 템플릿 모달)
// =============================================================

const TemplatesPage = ({ onToast }) => {
  const [templates, setTemplates] = React.useState(initialTemplates);
  const [activeId, setActiveId] = React.useState(initialTemplates.find((t) => t.isDefault)?.id || 'tpl-1');
  const [draft, setDraft] = React.useState(null); // working copy
  const [dirty, setDirty] = React.useState(false);
  const [newModal, setNewModal] = React.useState(false);
  const [confirmDel, setConfirmDel] = React.useState(null);

  const active = templates.find((t) => t.id === activeId);

  // Sync draft when active changes
  React.useEffect(() => {
    setDraft(JSON.parse(JSON.stringify(active || {})));
    setDirty(false);
  }, [activeId]);

  const updateDraft = (mut) => {
    setDraft((d) => {
      const next = typeof mut === 'function' ? mut(d) : { ...d, ...mut };
      return next;
    });
    setDirty(true);
  };

  const updateSection = (k, patch) => {
    setDraft((d) => ({ ...d, sections: { ...d.sections, [k]: { ...d.sections[k], ...patch } } }));
    setDirty(true);
  };

  const handleSave = () => {
    setTemplates((arr) => arr.map((t) => {
      if (t.id === activeId) return { ...draft, updatedAt: '2026.05.29' };
      // toggle default off on others if draft is now default
      if (draft.isDefault && t.id !== activeId && t.isDefault) return { ...t, isDefault: false };
      return t;
    }));
    setDirty(false);
    onToast && onToast({ title: '템플릿이 저장되었습니다', body: `"${draft.name}" 변경사항이 반영되었어요.` });
  };

  const handleCancel = () => {
    setDraft(JSON.parse(JSON.stringify(active)));
    setDirty(false);
  };

  const setDefault = (id) => {
    setTemplates((arr) => arr.map((t) => ({ ...t, isDefault: t.id === id })));
    onToast && onToast({ title: '기본 템플릿이 변경되었습니다' });
  };

  const duplicate = (id) => {
    const src = templates.find((t) => t.id === id);
    const copy = { ...JSON.parse(JSON.stringify(src)), id: `tpl-${Date.now()}`, name: `${src.name} 복사본`, isSystem: false, isDefault: false, updatedAt: '2026.05.29' };
    setTemplates((arr) => [...arr.slice(0, 1), copy, ...arr.slice(1)]);
    setActiveId(copy.id);
    onToast && onToast({ title: '템플릿이 복제되었습니다' });
  };

  const handleDelete = () => {
    const id = confirmDel.id;
    setTemplates((arr) => arr.filter((t) => t.id !== id));
    if (activeId === id) setActiveId(templates.find((t) => t.id !== id && !t.isSystem)?.id || 'sys-default');
    setConfirmDel(null);
    onToast && onToast({ title: '템플릿이 삭제되었습니다' });
  };

  const handleCreate = ({ name, basedOn }) => {
    let sections;
    if (basedOn === 'empty') {
      sections = {
        S: { title: '주관적 정보', prompt: '', defaultContent: '', limit: 500 },
        O: { title: '객관적 정보', prompt: '', defaultContent: '', limit: 500 },
        A: { title: '평가',       prompt: '', defaultContent: '', limit: 500 },
        P: { title: '계획',       prompt: '', defaultContent: '', limit: 500 },
      };
    } else {
      const src = templates.find((t) => t.id === basedOn);
      sections = JSON.parse(JSON.stringify(src.sections));
    }
    const next = { id: `tpl-${Date.now()}`, name, sections, isSystem: false, isDefault: false, updatedAt: '2026.05.29' };
    setTemplates((arr) => [...arr.slice(0, 1), next, ...arr.slice(1)]);
    setActiveId(next.id);
    setNewModal(false);
    onToast && onToast({ title: '새 템플릿이 생성되었습니다', body: `"${name}" 편집을 시작하세요.` });
  };

  if (!draft) return null;

  return (
    <>
      <PageHeader
        title="SOAP 템플릿 관리"
        subtitle="세션 분석 시 AI가 SOAP Note 초안을 생성할 때 사용할 템플릿을 만들고 관리합니다."
        breadcrumbs={[
          { label: '설정', onClick: () => {} },
          { label: 'SOAP 템플릿' },
        ]}
        actions={
          <Button variant="ghost" icon="info" onClick={() => onToast && onToast({ title: '템플릿 도움말', body: '각 섹션의 "AI 지침"이 SOAP 초안 생성 품질을 결정합니다.' })}>도움말</Button>
        }
      />

      <div style={tplStyles.layout}>
        {/* LEFT — list */}
        <div style={tplStyles.pane}>
          <div style={tplStyles.paneHeader}>
            <div>
              <div style={tplStyles.paneTitle}>내 SOAP 템플릿</div>
              <div style={tplStyles.paneSubtitle}>{templates.filter((t) => !t.isSystem).length}개의 사용자 템플릿</div>
            </div>
            <Button variant="primary" size="sm" icon="plus" onClick={() => setNewModal(true)}>새 템플릿</Button>
          </div>

          <div style={tplStyles.paneBody}>
            {templates.length === 0 ? (
              <div style={{ padding: '40px 16px', textAlign: 'center' }}>
                <div style={{ width: 44, height: 44, borderRadius: 12, background: '#ECF5EF', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', color: '#2D6A4F', marginBottom: 12 }}>
                  <Icon name="report" size={20} strokeWidth={1.8} />
                </div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>아직 템플릿이 없습니다</div>
                <div style={{ fontSize: 11, color: '#6B7280', marginTop: 6 }}>새 템플릿을 만들어보세요.</div>
              </div>
            ) : (
              templates.map((tpl) => (
                <TemplateListCard
                  key={tpl.id}
                  tpl={tpl}
                  active={tpl.id === activeId}
                  onClick={() => {
                    if (dirty && !confirm('저장하지 않은 변경사항이 있습니다. 정말 다른 템플릿으로 이동하시겠습니까?')) return;
                    setActiveId(tpl.id);
                  }}
                  onDelete={() => setConfirmDel(tpl)}
                  onSetDefault={() => setDefault(tpl.id)}
                  onDuplicate={() => duplicate(tpl.id)}
                />
              ))
            )}
          </div>
        </div>

        {/* RIGHT — editor */}
        <div style={tplStyles.pane}>
          <div style={tplStyles.paneHeader}>
            <div style={{ flex: 1, minWidth: 0 }}>
              {draft.isSystem ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' }}>{draft.name}</span>
                  <span style={tplStyles.lockChip}>
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                    잠김 · 읽기 전용
                  </span>
                </div>
              ) : (
                <input
                  value={draft.name}
                  onChange={(e) => updateDraft({ name: e.target.value })}
                  style={tplStyles.nameInput}
                  onFocus={(e) => { e.target.style.borderColor = '#C9CFCC'; e.target.style.background = '#fff'; }}
                  onBlur={(e) => { e.target.style.borderColor = 'transparent'; e.target.style.background = 'transparent'; }}
                />
              )}
              <div style={{ fontSize: 11, color: '#6B7280', padding: '0 10px' }}>
                마지막 수정 <span style={{ fontFamily: "'JetBrains Mono', monospace" }}>{draft.updatedAt}</span>
                {dirty && <span style={{ color: '#B45309', marginLeft: 8, fontWeight: 600 }}>● 저장되지 않은 변경사항</span>}
              </div>
            </div>

            {!draft.isSystem && (
              <div style={tplStyles.switchWrap}>
                <span style={{ fontSize: 12, fontWeight: 500, color: '#4B5650' }}>기본 템플릿으로 설정</span>
                <Switch on={draft.isDefault} onChange={() => updateDraft({ isDefault: !draft.isDefault })} />
              </div>
            )}
          </div>

          <div style={{ padding: 22, background: '#F4FAF6', maxHeight: 'calc(100vh - 280px)', overflow: 'auto' }}>
            {Object.entries(draft.sections).map(([k, sec]) => (
              <SectionEditor
                key={k}
                k={k}
                section={sec}
                locked={draft.isSystem}
                onChange={(patch) => updateSection(k, patch)}
              />
            ))}
          </div>

          {!draft.isSystem && (
            <div style={tplStyles.footer}>
              <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                <Icon name="info" size={12} /> 저장 시 진행 중인 세션 분석에는 영향을 주지 않으며, 다음 분석부터 적용됩니다.
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Button variant="ghost" onClick={handleCancel} disabled={!dirty}>취소</Button>
                <Button variant="primary" icon="check" onClick={handleSave} disabled={!dirty}>저장</Button>
              </div>
            </div>
          )}
          {draft.isSystem && (
            <div style={tplStyles.footer}>
              <div style={{ fontSize: 11, color: '#6B7280', display: 'flex', alignItems: 'center', gap: 6 }}>
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" /><path d="M7 11V7a5 5 0 0 1 10 0v4" /></svg>
                시스템 템플릿은 수정할 수 없습니다. 복제해서 새 템플릿으로 만드세요.
              </div>
              <Button variant="secondary" icon="plus" onClick={() => duplicate(draft.id)}>복제해서 편집</Button>
            </div>
          )}
        </div>
      </div>

      {newModal && (
        <NewTemplateModal
          templates={templates.filter((t) => !t.isSystem || t.id === 'sys-default')}
          onClose={() => setNewModal(false)}
          onSubmit={handleCreate}
        />
      )}

      {confirmDel && (
        <div style={modalStyles.backdrop} onClick={() => setConfirmDel(null)}>
          <div style={{ ...modalStyles.panel, width: 420 }} onClick={(e) => e.stopPropagation()}>
            <div style={{ padding: '22px 22px 0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon name="alert" size={18} strokeWidth={2} />
                </div>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>템플릿을 삭제하시겠습니까?</div>
                  <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.55 }}>
                    <b style={{ color: '#1A1A1A' }}>{confirmDel.name}</b> 템플릿이 삭제됩니다. 이 템플릿으로 이미 생성된 SOAP Note에는 영향이 없어요. 이 작업은 되돌릴 수 없습니다.
                  </div>
                </div>
              </div>
            </div>
            <div style={{ ...modalStyles.footer, marginTop: 20 }}>
              <Button variant="secondary" onClick={() => setConfirmDel(null)}>취소</Button>
              <Button variant="danger" icon="trash" onClick={handleDelete}>영구 삭제</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

// -------- Section editor (S/O/A/P) --------
const SectionEditor = ({ k, section, locked, onChange }) => {
  const accent = SECTION_ACCENTS[k];
  const promptLen = (section.prompt || '').length;
  return (
    <div style={{ ...tplStyles.section, background: '#fff' }}>
      <div style={tplStyles.sectionHead}>
        <div style={tplStyles.sectionLetter(k)}>{k}</div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={tplStyles.sectionAccentName(k)}>{accent.name}</div>
          {locked ? (
            <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginTop: 2 }}>{section.title}</div>
          ) : (
            <input
              value={section.title}
              onChange={(e) => onChange({ title: e.target.value })}
              placeholder="섹션 제목"
              style={{
                width: '100%', fontSize: 14, fontWeight: 600, color: '#1A1A1A',
                border: 'none', background: 'transparent', outline: 'none',
                padding: '2px 0', marginTop: 2, fontFamily: 'var(--font-sans)',
              }}
            />
          )}
        </div>
      </div>

      <div style={tplStyles.sectionBody}>
        <div>
          <label style={tplStyles.fieldLabel}>AI 생성 지침 (Prompt)</label>
          {locked ? (
            <div style={{ ...tplStyles.textArea(false), minHeight: 'auto', background: '#F6F8F7', color: '#4B5650', whiteSpace: 'pre-wrap' }}>
              {section.prompt || <span style={{ color: '#9AA3A0' }}>지침 없음</span>}
            </div>
          ) : (
            <FocusInput
              multiline
              value={section.prompt}
              onChange={(v) => onChange({ prompt: v })}
              placeholder="AI가 이 섹션을 생성할 때 참고할 지침을 입력하세요 (예: 아동이 보인 언어 행동, 보호자 보고, 치료사 관찰 내용을 중심으로 작성)"
              rows={3}
            />
          )}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
            <div style={tplStyles.helper}>이 지침은 AI에게만 전달되며, 최종 SOAP Note에는 노출되지 않습니다.</div>
            {!locked && (
              <div style={tplStyles.charLimit(promptLen, 500)}>{promptLen}/500</div>
            )}
          </div>
        </div>

        <div style={{ marginTop: 14 }}>
          <label style={tplStyles.fieldLabel}>기본 시작 문구 <span style={{ color: '#9AA3A0', fontWeight: 400 }}>(선택)</span></label>
          {locked ? (
            <div style={{ ...tplStyles.textArea(false), minHeight: 'auto', background: '#F6F8F7', color: '#4B5650', whiteSpace: 'pre-wrap' }}>
              {section.defaultContent || <span style={{ color: '#9AA3A0' }}>없음</span>}
            </div>
          ) : (
            <FocusInput
              multiline
              value={section.defaultContent}
              onChange={(v) => onChange({ defaultContent: v })}
              placeholder="이 섹션의 시작 문구나 형식 (예: '보호자 보고:' 같은 머리말 또는 양식)"
              rows={2}
            />
          )}
        </div>

        <div style={{ marginTop: 14, display: 'flex', gap: 14, alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label style={tplStyles.fieldLabel}>글자 수 제한</label>
            {locked ? (
              <div style={{ fontSize: 13, color: '#4B5650', fontFamily: "'JetBrains Mono', monospace" }}>{section.limit}자</div>
            ) : (
              <FocusInput
                value={String(section.limit)}
                onChange={(v) => onChange({ limit: parseInt(v.replace(/\D/g, ''), 10) || 0 })}
                placeholder="500"
              />
            )}
            <div style={tplStyles.helper}>AI가 생성할 텍스트의 최대 글자 수</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// -------- New template modal --------
const NewTemplateModal = ({ templates, onClose, onSubmit }) => {
  const [name, setName] = React.useState('');
  const [basedOn, setBasedOn] = React.useState('empty');
  const [copyFrom, setCopyFrom] = React.useState(templates.find((t) => !t.isSystem)?.id || 'sys-default');
  const [errors, setErrors] = React.useState({});

  const submit = () => {
    const errs = {};
    if (!name.trim()) errs.name = '템플릿 이름을 입력해주세요.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({ name: name.trim(), basedOn: basedOn === 'empty' ? 'empty' : copyFrom });
  };

  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div style={modalStyles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div>
            <div style={modalStyles.title}>새 SOAP 템플릿</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>빈 템플릿으로 시작하거나 기존 템플릿을 복사할 수 있어요.</div>
          </div>
          <button style={modalStyles.closeBtn} onClick={onClose}>
            <Icon name="x" size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div style={modalStyles.body}>
          <div style={modalStyles.fieldGroup}>
            <TextField
              label="템플릿 이름" required
              value={name} onChange={setName}
              placeholder="예: 5세 미만 언어치료 템플릿"
              error={errors.name}
              helper="이 이름은 SOAP 생성 시 선택 목록에 표시됩니다."
            />

            <div>
              <label style={modalStyles.label}>복사 기준</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                <div
                  style={{
                    padding: '12px 14px', borderRadius: 8,
                    border: basedOn === 'empty' ? '1.5px solid #1A3C34' : '1px solid #C9CFCC',
                    background: basedOn === 'empty' ? '#ECF5EF' : '#fff',
                    cursor: 'pointer',
                    display: 'flex', alignItems: 'flex-start', gap: 10,
                    transition: 'all 120ms',
                  }}
                  onClick={() => setBasedOn('empty')}
                >
                  <span style={modalStyles.radioDot(basedOn === 'empty')} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 13, fontWeight: basedOn === 'empty' ? 600 : 500, color: basedOn === 'empty' ? '#1A3C34' : '#1A1A1A' }}>빈 템플릿</div>
                    <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>모든 섹션을 처음부터 작성합니다.</div>
                  </div>
                </div>

                <div
                  style={{
                    padding: '12px 14px', borderRadius: 8,
                    border: basedOn === 'copy' ? '1.5px solid #1A3C34' : '1px solid #C9CFCC',
                    background: basedOn === 'copy' ? '#ECF5EF' : '#fff',
                    cursor: 'pointer',
                    transition: 'all 120ms',
                  }}
                  onClick={() => setBasedOn('copy')}
                >
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                    <span style={modalStyles.radioDot(basedOn === 'copy')} />
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 13, fontWeight: basedOn === 'copy' ? 600 : 500, color: basedOn === 'copy' ? '#1A3C34' : '#1A1A1A' }}>기존 템플릿에서 복사</div>
                      <div style={{ fontSize: 11, color: '#6B7280', marginTop: 2 }}>선택한 템플릿의 모든 섹션 내용을 복사합니다.</div>
                    </div>
                  </div>
                  {basedOn === 'copy' && (
                    <select
                      value={copyFrom}
                      onChange={(e) => setCopyFrom(e.target.value)}
                      onClick={(e) => e.stopPropagation()}
                      style={{
                        ...modalStyles.input(false), marginTop: 10,
                        background: '#fff', cursor: 'pointer', appearance: 'none',
                        backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236B7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpolyline points=%276 9 12 15 18 9%27/%3E%3C/svg%3E")',
                        backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32,
                      }}
                    >
                      {templates.map((t) => (
                        <option key={t.id} value={t.id}>{t.name}{t.isSystem ? ' (시스템)' : ''}{t.isDefault ? ' · 기본' : ''}</option>
                      ))}
                    </select>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" icon="plus" onClick={submit}>만들기</Button>
        </div>
      </div>
    </div>
  );
};

Object.assign(window, { TemplatesPage, SectionEditor, NewTemplateModal });
