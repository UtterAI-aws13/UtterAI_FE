import { useRef, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { templatesApi, resolveContentType, type Template, type TemplateType } from '@/api/templates'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const ACCEPTED_EXTENSIONS = [
  '.pdf',
  '.doc', '.docx',
  '.xls', '.xlsx',
  '.ppt', '.pptx',
  '.hwp', '.hwpx',
  '.txt', '.rtf', '.csv',
  '.odt', '.ods', '.odp',
]
const ACCEPTED_MIME = ACCEPTED_EXTENSIONS.join(',')

const TEMPLATE_TYPES: Array<{ value: TemplateType; label: string }> = [
  { value: 'SOAP_NOTE', label: 'SOAP Note' },
  { value: 'CUSTOM',    label: '커스텀' },
]

const createSchema = z.object({
  name:          z.string().optional(),
  template_type: z.enum(['SOAP_NOTE', 'CUSTOM']),
  description:   z.string().optional(),
})
const editSchema = z.object({
  name:        z.string().min(1, '템플릿 이름을 입력해주세요.'),
  description: z.string().optional(),
})
type CreateValues = z.infer<typeof createSchema>
type EditValues   = z.infer<typeof editSchema>

interface Props {
  template?: Template
  onClose:   () => void
  onSaved:   (template: Template) => void
}

function fileBaseName(filename: string) {
  return filename.replace(/\.[^.]+$/, '')
}

function isValidExtension(filename: string) {
  const ext = filename.slice(filename.lastIndexOf('.')).toLowerCase()
  return ACCEPTED_EXTENSIONS.includes(ext)
}

export function TemplateFormModal({ template, onClose, onSaved }: Props) {
  const { showToast } = useToast()
  const isEdit = !!template

  const [file, setFile]           = useState<File | null>(null)
  const [dragging, setDragging]   = useState(false)
  const [uploadStep, setUploadStep] = useState<'idle' | 'uploading' | 'confirming'>('idle')
  const inputRef = useRef<HTMLInputElement>(null)

  const createForm = useForm<CreateValues>({
    resolver:      zodResolver(createSchema),
    defaultValues: { name: '', template_type: 'SOAP_NOTE', description: '' },
  })
  const editForm = useForm<EditValues>({
    resolver:      zodResolver(editSchema),
    defaultValues: { name: template?.name ?? '', description: template?.description ?? '' },
  })

  const inputCls = (err?: boolean) => cn(
    'w-full h-10 px-3 rounded-lg text-[13px] outline-none transition-all border font-sans',
    err
      ? 'border-red-400 bg-white'
      : 'border-ink-300 bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/16',
  )

  const handleFileSelect = (selected: File) => {
    if (!isValidExtension(selected.name)) {
      showToast({ title: '지원하지 않는 파일 형식입니다. (pdf, docx, xlsx, hwp)', kind: 'error' })
      return
    }
    setFile(selected)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragging(false)
    const dropped = e.dataTransfer.files[0]
    if (dropped) handleFileSelect(dropped)
  }

  const handleCreateSubmit = async (values: CreateValues) => {
    if (!file) {
      showToast({ title: '업로드할 파일을 선택해주세요.', kind: 'error' })
      return
    }
    const contentType = resolveContentType(file)
    const name = (values.name?.trim() || fileBaseName(file.name)).trim() || file.name

    try {
      setUploadStep('uploading')
      const { data: presigned } = await templatesApi.presignedUrl({
        file_name:     file.name,
        content_type:  contentType,
        name,
        template_type: values.template_type,
      })

      await fetch(presigned.upload_url, {
        method:  'PUT',
        headers: { 'Content-Type': contentType },
        body:    file,
      })

      setUploadStep('confirming')
      const { data: confirmed } = await templatesApi.confirm(presigned.template_id, {
        actual_size_bytes: file.size,
      })

      showToast({ title: '템플릿이 업로드되었습니다', kind: 'success' })
      onSaved(confirmed)
      onClose()
    } catch {
      showToast({ title: '템플릿 업로드에 실패했습니다', kind: 'error' })
    } finally {
      setUploadStep('idle')
    }
  }

  const handleEditSubmit = async (values: EditValues) => {
    try {
      const { data } = await templatesApi.update(template!.id, {
        name:        values.name,
        description: values.description || undefined,
      })
      showToast({ title: '템플릿이 수정되었습니다', kind: 'success' })
      onSaved(data)
      onClose()
    } catch {
      showToast({ title: '템플릿 수정에 실패했습니다', kind: 'error' })
    }
  }

  const isSubmitting = isEdit
    ? editForm.formState.isSubmitting
    : createForm.formState.isSubmitting || uploadStep !== 'idle'

  const submitLabel = isEdit
    ? (isSubmitting ? '저장 중…' : '저장')
    : uploadStep === 'uploading'  ? 'S3 업로드 중…'
    : uploadStep === 'confirming' ? '확인 중…'
    : '업로드'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-[480px] mx-4 max-h-[90vh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-ink-100">
          <h2 className="text-[16px] font-bold text-ink-800">
            {isEdit ? '템플릿 편집' : '새 템플릿'}
          </h2>
          <button
            onClick={onClose}
            className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 transition-colors"
          >
            <Icon name="x" size={16} />
          </button>
        </div>

        {isEdit ? (
          <form onSubmit={editForm.handleSubmit(handleEditSubmit)} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
            <div>
              <label className="block text-[12px] font-medium text-ink-800 mb-1.5">
                템플릿 이름 <span className="text-red-500">*</span>
              </label>
              <input
                {...editForm.register('name')}
                placeholder="템플릿 이름을 입력하세요"
                className={inputCls(!!editForm.formState.errors.name)}
              />
              {editForm.formState.errors.name && (
                <p className="mt-1 text-[11px] text-red-700">{editForm.formState.errors.name.message}</p>
              )}
            </div>
            <div>
              <label className="block text-[12px] font-medium text-ink-800 mb-1.5">설명 (선택)</label>
              <textarea
                {...editForm.register('description')}
                rows={3}
                placeholder="템플릿에 대한 설명을 입력하세요"
                className={cn(inputCls(), 'h-auto py-2 resize-none')}
              />
            </div>
            <div className="pt-1 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-ink-200 text-ink-600 rounded-full text-[13px] font-semibold hover:bg-ink-50 transition-colors">
                취소
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60">
                {submitLabel}
              </button>
            </div>
          </form>
        ) : (
          <form onSubmit={createForm.handleSubmit(handleCreateSubmit)} className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
            {/* 파일 업로드 영역 */}
            <div>
              <label className="block text-[12px] font-medium text-ink-800 mb-1.5">
                파일 <span className="text-red-500">*</span>
                <span className="ml-1.5 text-ink-400 font-normal">pdf, docx, xlsx, hwp, hwpx 등 문서 파일</span>
              </label>
              {file ? (
                <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-brand-300 bg-brand-50">
                  <Icon name="fileText" size={18} className="text-brand-600 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-medium text-ink-800 truncate">{file.name}</p>
                    <p className="text-[11px] text-ink-400">{(file.size / 1024).toFixed(0)} KB</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="w-6 h-6 flex items-center justify-center rounded-md text-ink-400 hover:bg-brand-100 transition-colors"
                  >
                    <Icon name="x" size={13} />
                  </button>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={handleDrop}
                  onClick={() => inputRef.current?.click()}
                  className={cn(
                    'flex flex-col items-center justify-center gap-2 py-8 rounded-lg border-2 border-dashed cursor-pointer transition-all',
                    dragging ? 'border-brand-500 bg-brand-50' : 'border-ink-200 bg-ink-50 hover:border-brand-400 hover:bg-brand-50',
                  )}
                >
                  <Icon name="upload" size={22} className="text-ink-400" />
                  <p className="text-[13px] text-ink-500">
                    파일을 드래그하거나 <span className="text-brand-600 font-semibold">클릭해서 선택</span>
                  </p>
                </div>
              )}
              <input
                ref={inputRef}
                type="file"
                accept={ACCEPTED_MIME}
                className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFileSelect(f) }}
              />
            </div>

            {/* 템플릿 이름 */}
            <div>
              <label className="block text-[12px] font-medium text-ink-800 mb-1.5">
                템플릿 이름
                <span className="ml-1.5 text-ink-400 font-normal">미입력 시 파일명으로 자동 설정</span>
              </label>
              <input
                {...createForm.register('name')}
                placeholder={file ? fileBaseName(file.name) : '템플릿 이름 (선택)'}
                className={inputCls()}
              />
            </div>

            {/* 유형 */}
            <div>
              <label className="block text-[12px] font-medium text-ink-800 mb-2">유형</label>
              <div className="flex gap-3">
                {TEMPLATE_TYPES.map(({ value, label }) => (
                  <label key={value} className="flex items-center gap-2 cursor-pointer">
                    <input type="radio" {...createForm.register('template_type')} value={value} className="accent-brand-700" />
                    <span className="text-[13px] text-ink-800">{label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* 설명 */}
            <div>
              <label className="block text-[12px] font-medium text-ink-800 mb-1.5">설명 (선택)</label>
              <textarea
                {...createForm.register('description')}
                rows={3}
                placeholder="템플릿에 대한 설명을 입력하세요"
                className={cn(inputCls(), 'h-auto py-2 resize-none')}
              />
            </div>

            <div className="pt-1 flex justify-end gap-2">
              <button type="button" onClick={onClose} className="px-4 py-2 border border-ink-200 text-ink-600 rounded-full text-[13px] font-semibold hover:bg-ink-50 transition-colors">
                취소
              </button>
              <button type="submit" disabled={isSubmitting} className="px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors disabled:opacity-60">
                {submitLabel}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
