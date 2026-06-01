import { useRef, useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import {
  templatesApi,
  type Template,
  type TemplateCategory,
  type CreateTemplatePayload,
  type UpdateTemplatePayload,
} from '@/api/templates'

const CATEGORIES: Array<{ label: string; value: TemplateCategory | 'all' }> = [
  { label: '전체',   value: 'all' },
  { label: '세션',   value: 'SESSION' },
  { label: '평가',   value: 'ASSESSMENT' },
  { label: '리포트', value: 'REPORT' },
]

const CATEGORY_LABEL: Record<TemplateCategory, string> = {
  SESSION: '세션',
  ASSESSMENT: '평가',
  REPORT: '리포트',
}

const ALLOWED_TYPES = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
const ALLOWED_EXT = ['.pdf', '.docx', '.txt']

type ModalMode = 'text' | 'file'

function TemplateModal({
  initial,
  onClose,
}: {
  initial?: Template
  onClose: () => void
}) {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const isEdit = !!initial
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [mode, setMode] = useState<ModalMode>(
    initial?.file_original_name ? 'file' : 'text',
  )
  const [name, setName] = useState(initial?.name ?? '')
  const [category, setCategory] = useState<TemplateCategory>(initial?.category ?? 'SESSION')
  const [content, setContent] = useState(initial?.content ?? '')
  const [pickedFile, setPickedFile] = useState<File | null>(null)

  const saveText = useMutation({
    mutationFn: () => {
      const payload: CreateTemplatePayload | UpdateTemplatePayload = { name, category, content }
      return isEdit
        ? templatesApi.update(initial!.id, payload as UpdateTemplatePayload).then((r) => r.data)
        : templatesApi.create(payload as CreateTemplatePayload).then((r) => r.data)
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      showToast({ title: isEdit ? '템플릿이 수정되었습니다' : '템플릿이 생성되었습니다', kind: 'success' })
      onClose()
    },
    onError: () => showToast({ title: '저장에 실패했습니다', kind: 'error' }),
  })

  const saveFile = useMutation({
    mutationFn: () => templatesApi.uploadFile(pickedFile!, name, category).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['templates'] })
      showToast({ title: '파일 템플릿이 업로드되었습니다', kind: 'success' })
      onClose()
    },
    onError: () => showToast({ title: '업로드에 실패했습니다', kind: 'error' }),
  })

  const isPending = saveText.isPending || saveFile.isPending

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0]
    if (!f) return
    const ext = '.' + f.name.split('.').pop()!.toLowerCase()
    if (!ALLOWED_TYPES.includes(f.type) && !ALLOWED_EXT.includes(ext)) {
      showToast({ title: 'PDF, DOCX, TXT 파일만 업로드할 수 있습니다', kind: 'error' })
      return
    }
    setPickedFile(f)
    if (!name.trim()) setName(f.name.replace(/\.[^.]+$/, ''))
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault()
    const f = e.dataTransfer.files[0]
    if (!f) return
    const fakeEvent = { target: { files: [f] } } as unknown as React.ChangeEvent<HTMLInputElement>
    handleFileChange(fakeEvent)
  }

  const canSave = mode === 'text'
    ? name.trim() && content.trim()
    : (pickedFile || initial?.file_original_name) && name.trim()

  const inputClass =
    'w-full px-3 border border-ink-300 rounded-lg text-[13px] outline-none focus:border-brand-500 font-sans'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl p-6 w-[560px] max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="text-[16px] font-bold text-ink-800 mb-5">
          {isEdit ? '템플릿 편집' : '새 템플릿'}
        </h2>

        {/* Mode toggle — only for new templates */}
        {!isEdit && (
          <div className="flex gap-1 mb-5 bg-ink-100 rounded-lg p-1">
            {(['text', 'file'] as ModalMode[]).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 rounded-md text-[12px] font-semibold transition-all',
                  mode === m ? 'bg-white text-brand-700 shadow-sm' : 'text-ink-500 hover:text-ink-700',
                )}
              >
                <Icon name={m === 'text' ? 'edit' : 'upload'} size={13} />
                {m === 'text' ? '직접 입력' : '파일 업로드'}
              </button>
            ))}
          </div>
        )}

        <div className="flex flex-col gap-4 overflow-y-auto flex-1">
          {/* Name */}
          <div>
            <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
              이름 <span className="text-red-500">*</span>
            </label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="템플릿 이름"
              className={inputClass + ' h-10'}
            />
          </div>

          {/* Category */}
          <div>
            <label className="block text-[12px] font-medium text-ink-700 mb-1.5">카테고리</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value as TemplateCategory)}
              className={inputClass + ' h-10 cursor-pointer'}
            >
              <option value="SESSION">세션</option>
              <option value="ASSESSMENT">평가</option>
              <option value="REPORT">리포트</option>
            </select>
          </div>

          {/* Content or File */}
          {mode === 'text' ? (
            <div>
              <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
                템플릿 내용 <span className="text-red-500">*</span>
              </label>
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="AI 분석에 사용할 지시문이나 평가 기준을 입력하세요"
                rows={10}
                className={inputClass + ' py-2 resize-none'}
              />
            </div>
          ) : (
            <div>
              <label className="block text-[12px] font-medium text-ink-700 mb-1.5">
                파일 <span className="text-red-500">*</span>
                <span className="text-ink-400 font-normal ml-1">(PDF · DOCX · TXT)</span>
              </label>

              {pickedFile || initial?.file_original_name ? (
                <div className="flex items-center gap-3 px-4 py-3 border border-brand-300 bg-brand-50 rounded-lg">
                  <div className="w-9 h-9 rounded-lg bg-brand-100 flex items-center justify-center text-brand-600 flex-shrink-0">
                    <Icon name="fileText" size={18} strokeWidth={1.8} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-ink-800 truncate">
                      {pickedFile?.name ?? initial?.file_original_name}
                    </p>
                    {pickedFile && (
                      <p className="text-[11px] text-ink-500 mt-0.5">
                        {(pickedFile.size / 1024).toFixed(1)} KB
                      </p>
                    )}
                  </div>
                  <button
                    onClick={() => { setPickedFile(null); if (fileInputRef.current) fileInputRef.current.value = '' }}
                    className="text-ink-400 hover:text-red-500 transition-colors"
                  >
                    <Icon name="x" size={16} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={handleDrop}
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-ink-300 rounded-xl py-10 flex flex-col items-center gap-2 cursor-pointer hover:border-brand-400 hover:bg-brand-50/50 transition-all"
                >
                  <div className="w-12 h-12 rounded-2xl bg-ink-100 flex items-center justify-center text-ink-400">
                    <Icon name="upload" size={22} strokeWidth={1.5} />
                  </div>
                  <p className="text-[13px] font-semibold text-ink-700">파일을 드래그하거나 클릭해 선택</p>
                  <p className="text-[11px] text-ink-400">PDF, DOCX, TXT</p>
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,.docx,.txt"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>
          )}
        </div>

        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-ink-200 text-ink-600 rounded-full text-[13px] font-semibold hover:bg-ink-50"
          >
            취소
          </button>
          <button
            onClick={() => mode === 'file' ? saveFile.mutate() : saveText.mutate()}
            disabled={!canSave || isPending}
            className="px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 disabled:opacity-50 disabled:cursor-wait"
          >
            {isPending ? '저장 중…' : '저장'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function TemplatesPage() {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const [category, setCategory] = useState<TemplateCategory | 'all'>('all')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState<Template | null>(null)

  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates'],
    queryFn: () => templatesApi.list().then((r) => r.data),
  })

  const deleteTemplate = useMutation({
    mutationFn: (id: string) => templatesApi.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Template[]>(['templates'], (prev) => prev?.filter((t) => t.id !== id) ?? [])
      showToast({ title: '템플릿이 삭제되었습니다', kind: 'success' })
    },
    onError: () => showToast({ title: '삭제에 실패했습니다', kind: 'error' }),
  })

  const downloadFile = useMutation({
    mutationFn: (id: string) => templatesApi.getFileUrl(id).then((r) => r.data.url),
    onSuccess: (url) => {
      window.open(url, '_blank')
    },
    onError: () => showToast({ title: '파일 다운로드에 실패했습니다', kind: 'error' }),
  })

  const filtered = templates.filter(
    (t) => category === 'all' || t.category === category,
  )

  return (
    <div>
      {(showCreate || editing) && (
        <TemplateModal
          initial={editing ?? undefined}
          onClose={() => { setShowCreate(false); setEditing(null) }}
        />
      )}

      <div className="px-8 pt-7 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">템플릿 관리</h1>
          <p className="text-[13px] text-ink-500 mt-1">세션 및 리포트 템플릿을 관리합니다</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors shadow-md"
        >
          <Icon name="plus" size={15} />새 템플릿
        </button>
      </div>

      <div className="px-8 pb-8">
        <div className="flex gap-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                category === c.value
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50',
              )}
            >
              {c.label}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="py-16 text-center text-ink-400 text-[13px]">불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div className="py-16 text-center">
            <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-4">
              <Icon name="fileText" size={28} strokeWidth={1.8} />
            </div>
            <p className="text-[15px] font-semibold text-ink-800">템플릿이 없습니다</p>
            <p className="text-[12px] text-ink-500 mt-1.5">새 템플릿을 만들어 AI 분석에 활용해보세요.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((t) => (
              <div
                key={t.id}
                className={cn(
                  'bg-white rounded-xl border shadow-sm p-5 transition-all group',
                  t.is_system
                    ? 'border-brand-200 bg-brand-25'
                    : 'border-ink-200 hover:border-brand-300 hover:shadow-md',
                )}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className={cn(
                    'w-10 h-10 rounded-xl flex items-center justify-center',
                    t.file_original_name ? 'bg-amber-50 text-amber-600' : 'bg-brand-50 text-brand-600',
                  )}>
                    <Icon name={t.file_original_name ? 'upload' : 'fileText'} size={20} strokeWidth={1.8} />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {t.is_system && (
                      <span className="text-[10px] font-bold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full">
                        기본
                      </span>
                    )}
                    <span className="text-[11px] font-semibold bg-ink-100 text-ink-600 px-2 py-0.5 rounded-md">
                      {CATEGORY_LABEL[t.category]}
                    </span>
                  </div>
                </div>

                <h3 className="text-[14px] font-semibold text-ink-800 leading-snug">{t.name}</h3>

                {t.file_original_name ? (
                  <p className="text-[12px] text-ink-400 mt-1.5 flex items-center gap-1">
                    <Icon name="fileText" size={12} />
                    {t.file_original_name}
                  </p>
                ) : (
                  <p className="text-[12px] text-ink-500 mt-1.5 line-clamp-2 leading-relaxed">
                    {t.content ?? ''}
                  </p>
                )}

                <div className="flex items-center justify-between mt-3">
                  <p className="text-[11px] text-ink-400 font-mono-num">
                    {t.updated_at.slice(0, 10).replaceAll('-', '.')} 업데이트
                  </p>
                  <p className="text-[11px] text-ink-500">
                    <span className="font-semibold text-ink-800">{t.use_count}</span>회 사용
                  </p>
                </div>

                {!t.is_system && (
                  <div className="mt-3 pt-3 border-t border-ink-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setEditing(t)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                    >
                      <Icon name="edit" size={13} />편집
                    </button>
                    {t.file_original_name && (
                      <button
                        onClick={() => downloadFile.mutate(t.id)}
                        className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold text-ink-600 bg-ink-50 hover:bg-ink-100 transition-colors"
                      >
                        <Icon name="download" size={13} />다운로드
                      </button>
                    )}
                    <button
                      onClick={() => deleteTemplate.mutate(t.id)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                    >
                      삭제
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
