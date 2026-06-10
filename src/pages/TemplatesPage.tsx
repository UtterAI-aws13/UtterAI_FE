import { useState, useEffect } from 'react'
import { templatesApi, type Template, type TemplateType } from '@/api/templates'
import { Icon } from '@/components/common/Icon'
import { TemplateFormModal } from '@/components/common/TemplateFormModal'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const TYPE_LABEL: Record<TemplateType, string> = {
  SOAP_NOTE: 'SOAP Note',
  CUSTOM:    '커스텀',
}

const TYPE_FILTERS: Array<{ label: string; value: TemplateType | 'all' }> = [
  { label: '전체',      value: 'all' },
  { label: 'SOAP Note', value: 'SOAP_NOTE' },
  { label: '커스텀',    value: 'CUSTOM' },
]

export default function TemplatesPage() {
  const { showToast } = useToast()
  const [templates, setTemplates] = useState<Template[]>([])
  const [loading, setLoading] = useState(true)
  const [typeFilter, setTypeFilter] = useState<TemplateType | 'all'>('all')
  const [modal, setModal] = useState<null | 'create' | Template>(null)

  useEffect(() => {
    let ignore = false
    templatesApi.list()
      .then(({ data }) => { if (!ignore) setTemplates(data) })
      .catch(() => { if (!ignore) showToast({ title: '템플릿 목록을 불러오지 못했습니다', kind: 'error' }) })
      .finally(() => { if (!ignore) setLoading(false) })
    return () => { ignore = true }
  }, [])

  const filtered = templates.filter(
    (t) => typeFilter === 'all' || t.template_type === typeFilter,
  )

  return (
    <div>
      <div className="px-8 pt-7 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">템플릿 관리</h1>
          <p className="text-[13px] text-ink-500 mt-1">세션 및 리포트 템플릿을 관리합니다</p>
        </div>
        <button
          onClick={() => setModal('create')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors shadow-md"
        >
          <Icon name="plus" size={15} />새 템플릿
        </button>
      </div>

      <div className="px-8 pb-8">
        <div className="flex gap-2 mb-4">
          {TYPE_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setTypeFilter(f.value)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                typeFilter === f.value
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50',
              )}
            >
              {f.label}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center py-12 text-[13px] text-ink-400">불러오는 중…</div>
        ) : filtered.length === 0 ? (
          <div className="py-12 text-center text-[13px] text-ink-400">
            {typeFilter === 'all' ? '템플릿이 없습니다.' : `'${TYPE_LABEL[typeFilter as TemplateType]}' 유형에 템플릿이 없습니다.`}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filtered.map((t) => (
              <div
                key={t.id}
                className="bg-white rounded-xl border border-ink-200 shadow-sm p-5 hover:border-brand-300 hover:shadow-md transition-all cursor-pointer group"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                    <Icon name="fileText" size={20} strokeWidth={1.8} />
                  </div>
                  <span className="text-[11px] font-semibold bg-ink-100 text-ink-600 px-2 py-0.5 rounded-md">
                    {TYPE_LABEL[t.template_type]}
                  </span>
                </div>
                <h3 className="text-[14px] font-semibold text-ink-800 leading-snug">{t.name}</h3>
                {t.description && (
                  <p className="text-[12px] text-ink-500 mt-1 line-clamp-2">{t.description}</p>
                )}
                <div className="flex items-center justify-between mt-3">
                  <p className="text-[11px] text-ink-400">{t.is_system ? '시스템 템플릿' : '내 템플릿'}</p>
                  <p className="text-[11px] text-ink-500">
                    <span className="font-semibold text-ink-800">{t.use_count}</span>회 사용
                  </p>
                </div>
                {!t.is_system && (
                  <div className="mt-3 pt-3 border-t border-ink-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => setModal(t)}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold text-brand-700 bg-brand-50 hover:bg-brand-100 transition-colors"
                    >
                      <Icon name="edit" size={13} />편집
                    </button>
                    <button
                      onClick={() => showToast({ title: '템플릿 복사됨', kind: 'success' })}
                      className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-[12px] font-semibold text-ink-600 bg-ink-50 hover:bg-ink-100 transition-colors"
                    >
                      복사
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {modal !== null && (
        <TemplateFormModal
          template={modal === 'create' ? undefined : modal}
          onClose={() => setModal(null)}
          onSaved={(saved) => setTemplates((ts) =>
            modal === 'create'
              ? [saved, ...ts]
              : ts.map((t) => t.id === saved.id ? saved : t),
          )}
        />
      )}
    </div>
  )
}
