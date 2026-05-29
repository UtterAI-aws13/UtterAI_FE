// =============================================================
// Modals — Child registration, Delete confirm
// =============================================================

const modalStyles = {
  backdrop: {
    position: 'fixed', inset: 0, zIndex: 50,
    background: 'rgba(15, 42, 36, 0.45)',
    backdropFilter: 'blur(2px)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    animation: 'fadeIn 160ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  panel: {
    background: '#fff', borderRadius: 16,
    boxShadow: '0 24px 48px -12px rgba(15, 42, 36, 0.28)',
    width: 480, maxWidth: 'calc(100vw - 32px)',
    overflow: 'hidden',
    animation: 'slideUp 200ms cubic-bezier(0.22, 1, 0.36, 1)',
  },
  panelLg: { width: 540 },
  header: {
    display: 'flex', alignItems: 'center', justifyContent: 'space-between',
    padding: '18px 22px', borderBottom: '1px solid #EEF1EF',
  },
  title: { fontSize: 17, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.01em' },
  closeBtn: {
    width: 30, height: 30, borderRadius: 999, background: '#F6F8F7',
    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: '#4B5650', cursor: 'pointer',
  },
  body: { padding: '20px 22px' },
  footer: {
    display: 'flex', gap: 8, justifyContent: 'flex-end',
    padding: '14px 18px', background: '#F6F8F7', borderTop: '1px solid #EEF1EF',
  },
  fieldGroup: { display: 'flex', flexDirection: 'column', gap: 16 },
  label: { display: 'block', fontSize: 12, fontWeight: 500, color: '#1A1A1A', marginBottom: 6 },
  required: { color: '#EF4444', marginLeft: 3 },
  helper: { fontSize: 11, color: '#6B7280', marginTop: 5 },
  errorText: { fontSize: 11, color: '#B91C1C', fontWeight: 500, marginTop: 5 },
  input: (err) => ({
    width: '100%', height: 38, padding: '0 12px',
    border: err ? '1.5px solid #EF4444' : '1px solid #C9CFCC',
    borderRadius: 6,
    fontSize: 13, color: '#1A1A1A',
    fontFamily: 'var(--font-sans)', outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 120ms, box-shadow 120ms',
  }),
  inputFocus: { borderColor: '#2D6A4F', boxShadow: '0 0 0 3px rgba(45,106,79,0.20)' },
  textarea: {
    width: '100%', minHeight: 70, padding: '10px 12px',
    border: '1px solid #C9CFCC', borderRadius: 6,
    fontSize: 13, color: '#1A1A1A',
    fontFamily: 'var(--font-sans)', outline: 'none',
    boxSizing: 'border-box', resize: 'vertical',
    lineHeight: 1.5,
  },
  radioGroup: { display: 'flex', gap: 8 },
  radio: (active) => ({
    flex: 1, padding: '10px 12px',
    borderRadius: 8,
    border: active ? '1.5px solid #1A3C34' : '1px solid #C9CFCC',
    background: active ? '#ECF5EF' : '#fff',
    color: active ? '#1A3C34' : '#4B5650',
    fontSize: 13, fontWeight: active ? 600 : 500,
    cursor: 'pointer',
    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
    transition: 'all 120ms',
  }),
  radioDot: (active) => ({
    width: 14, height: 14, borderRadius: 999,
    border: active ? '4px solid #1A3C34' : '1.5px solid #C9CFCC',
    background: '#fff',
    transition: 'all 120ms',
  }),
};

const TextField = ({ label, required, value, onChange, placeholder, error, helper, type = 'text' }) => {
  const [focused, setFocused] = React.useState(false);
  return (
    <div>
      <label style={modalStyles.label}>{label}{required && <span style={modalStyles.required}>*</span>}</label>
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ ...modalStyles.input(error), ...(focused && !error ? modalStyles.inputFocus : {}) }}
      />
      {error
        ? <div style={modalStyles.errorText}>{error}</div>
        : helper && <div style={modalStyles.helper}>{helper}</div>}
    </div>
  );
};

const RadioGroup = ({ label, options, value, onChange }) => (
  <div>
    <label style={modalStyles.label}>{label}</label>
    <div style={modalStyles.radioGroup}>
      {options.map((o) => (
        <div key={o.value} style={modalStyles.radio(value === o.value)} onClick={() => onChange(o.value)}>
          <span style={modalStyles.radioDot(value === o.value)} />
          {o.label}
        </div>
      ))}
    </div>
  </div>
);

const ChildRegisterModal = ({ onClose, onSubmit }) => {
  const [name, setName] = React.useState('');
  const [dob, setDob] = React.useState('');
  const [gender, setGender] = React.useState('U');
  const [goal, setGoal] = React.useState('');
  const [memo, setMemo] = React.useState('');
  const [errors, setErrors] = React.useState({});

  const handleSubmit = () => {
    const errs = {};
    if (!name.trim()) errs.name = '아동 이름을 입력해주세요.';
    if (dob && !/^\d{4}\.\d{2}\.\d{2}$/.test(dob)) errs.dob = 'YYYY.MM.DD 형식으로 입력해주세요.';
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;
    onSubmit({ name: name.trim(), dob: dob || '—', gender, primaryGoal: goal || '—', memo });
  };

  return (
    <div style={modalStyles.backdrop} onClick={onClose}>
      <div style={modalStyles.panel} onClick={(e) => e.stopPropagation()}>
        <div style={modalStyles.header}>
          <div>
            <div style={modalStyles.title}>새 아동 등록</div>
            <div style={{ fontSize: 12, color: '#6B7280', marginTop: 2 }}>등록 후 첫 세션을 시작할 수 있어요.</div>
          </div>
          <button style={modalStyles.closeBtn} onClick={onClose}>
            <Icon name="x" size={14} strokeWidth={2.5} />
          </button>
        </div>

        <div style={modalStyles.body}>
          <div style={modalStyles.fieldGroup}>
            <TextField
              label="아동 이름" required
              value={name} onChange={setName}
              placeholder="예: 박서윤"
              error={errors.name}
              helper="실명 또는 가명을 사용할 수 있어요."
            />
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <TextField
                label="생년월일"
                value={dob} onChange={setDob}
                placeholder="2020.04.15"
                error={errors.dob}
              />
              <div>
                <label style={modalStyles.label}>주 치료 목표</label>
                <select
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  style={{ ...modalStyles.input(false), background: '#fff', cursor: 'pointer', appearance: 'none', backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=%27http://www.w3.org/2000/svg%27 width=%2712%27 height=%2712%27 viewBox=%270 0 24 24%27 fill=%27none%27 stroke=%27%236B7280%27 stroke-width=%272%27 stroke-linecap=%27round%27 stroke-linejoin=%27round%27%3E%3Cpolyline points=%276 9 12 15 18 9%27/%3E%3C/svg%3E")', backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: 32 }}
                >
                  <option value="">선택…</option>
                  <option>표현언어 지연</option>
                  <option>수용언어 지연</option>
                  <option>조음 오류</option>
                  <option>말 유창성</option>
                  <option>화용 언어</option>
                  <option>어휘 확장</option>
                  <option>문장 구성</option>
                </select>
              </div>
            </div>
            <RadioGroup
              label="성별"
              options={[
                { value: 'M', label: '남아' },
                { value: 'F', label: '여아' },
                { value: 'U', label: '미입력' },
              ]}
              value={gender}
              onChange={setGender}
            />
            <div>
              <label style={modalStyles.label}>메모 <span style={{ color: '#9AA3A0', fontWeight: 400 }}>(선택)</span></label>
              <textarea
                style={modalStyles.textarea}
                value={memo}
                onChange={(e) => setMemo(e.target.value)}
                placeholder="아동 특성, 보호자 연락처, 주의 사항 등을 자유롭게 적어주세요."
              />
            </div>
          </div>
        </div>

        <div style={modalStyles.footer}>
          <Button variant="secondary" onClick={onClose}>취소</Button>
          <Button variant="primary" icon="check" onClick={handleSubmit}>등록</Button>
        </div>
      </div>
    </div>
  );
};

const DeleteConfirmModal = ({ child, onCancel, onConfirm }) => (
  <div style={modalStyles.backdrop} onClick={onCancel}>
    <div style={{ ...modalStyles.panel, width: 420 }} onClick={(e) => e.stopPropagation()}>
      <div style={{ padding: '22px 22px 0' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FEE2E2', color: '#B91C1C', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <Icon name="alert" size={18} strokeWidth={2} />
          </div>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A' }}>아동 정보를 삭제하시겠습니까?</div>
            <div style={{ fontSize: 13, color: '#6B7280', marginTop: 6, lineHeight: 1.55 }}>
              <b style={{ color: '#1A1A1A' }}>{child.name}</b> 아동의 프로필과 관련된 모든 세션·전사·리포트가 함께 삭제됩니다. 이 작업은 되돌릴 수 없어요.
            </div>
          </div>
        </div>
      </div>
      <div style={{ ...modalStyles.footer, marginTop: 20 }}>
        <Button variant="secondary" onClick={onCancel}>취소</Button>
        <Button variant="danger" icon="trash" onClick={onConfirm}>영구 삭제</Button>
      </div>
    </div>
  </div>
);

Object.assign(window, { ChildRegisterModal, DeleteConfirmModal, TextField, RadioGroup });
