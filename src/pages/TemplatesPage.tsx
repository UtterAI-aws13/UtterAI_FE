import { useState } from 'react'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

const MOCK_TEMPLATES = [
  { id: 1, name: '표현언어 지연 — 초기 평가', category: '평가', updatedAt: '2026.05.20', sessions: 12 },
  { id: 2, name: 'SOAP Note 기본 템플릿',    category: '리포트', updatedAt: '2026.05.18', sessions: 38 },
  { id: 3, name: '어휘 확장 — 중기 세션',     category: '세션',  updatedAt: '2026.05.10', sessions: 7 },
  { id: 4, name: '보호자 피드백 레터',         category: '리포트', updatedAt: '2026.04.30', sessions: 22 },
]

const CATEGORIES = ['전체', '세션', '평가', '리포트']

export default function TemplatesPage() {
  const { showToast } = useToast()
  const [category, setCategory] = useState('전체')

  const filtered = MOCK_TEMPLATES.filter(
    (t) => category === '전체' || t.category === category,
  )

  return (
    <div>
      <div className="px-8 pt-7 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">템플릿 관리</h1>
          <p className="text-[13px] text-ink-500 mt-1">세션 및 리포트 템플릿을 관리합니다</p>
        </div>
        <button
          onClick={() => showToast({ title: '새 템플릿 생성', body: '기능 준비 중입니다.', kind: 'info' })}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors shadow-md"
        >
          <Icon name="plus" size={15} />새 템플릿
        </button>
      </div>

      <div className="px-8 pb-8">
        {/* Category filter */}
        <div className="flex gap-2 mb-4">
          {CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => setCategory(c)}
              className={cn(
                'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                category === c
                  ? 'bg-brand-700 text-white border-brand-700'
                  : 'bg-white text-ink-600 border-ink-200 hover:bg-ink-50',
              )}
            >
              {c}
            </button>
          ))}
        </div>

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
                  {t.category}
                </span>
              </div>
              <h3 className="text-[14px] font-semibold text-ink-800 leading-snug">{t.name}</h3>
              <div className="flex items-center justify-between mt-3">
                <p className="text-[11px] text-ink-400 font-mono-num">{t.updatedAt} 업데이트</p>
                <p className="text-[11px] text-ink-500">
                  <span className="font-semibold text-ink-800">{t.sessions}</span>회 사용
                </p>
              </div>
              <div className="mt-3 pt-3 border-t border-ink-100 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => showToast({ title: '템플릿 편집', body: '기능 준비 중입니다.' })}
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
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
