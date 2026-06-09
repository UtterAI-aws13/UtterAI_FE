import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { childrenApi, type Child } from '@/api/children'
import { Icon } from '@/components/common/Icon'
import { ChildFormModal } from '@/components/common/ChildFormModal'
import { useToast } from '@/hooks/useToast'
import { cn, computeAge, formatDate } from '@/lib/utils'

const GENDER_LABEL: Record<string, string> = { M: '남아', F: '여아', U: '미입력' }

function avatarClass(g: string | null) {
  return cn(
    'w-8 h-8 rounded-full flex items-center justify-center text-[13px] font-bold flex-shrink-0',
    g === 'F' ? 'bg-pink-100 text-pink-700' : g === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-ink-100 text-ink-600',
  )
}

function genderChipClass(g: string | null) {
  return cn(
    'inline-block px-2 py-0.5 rounded-md text-[11px] font-semibold',
    g === 'F' ? 'bg-pink-100 text-pink-700' : g === 'M' ? 'bg-blue-100 text-blue-700' : 'bg-ink-100 text-ink-600',
  )
}

export default function ChildrenPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [children, setChildren] = useState<Child[]>([])
  const [loading, setLoading] = useState(true)
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'new'>('all')
  const [showModal, setShowModal] = useState(false)

  useEffect(() => {
    childrenApi.list()
      .then(({ data }) => setChildren(data))
      .catch(() => showToast({ title: '아동 목록을 불러오지 못했습니다', kind: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  const filtered = children.filter((c) => {
    if (query && !c.name.includes(query)) return false
    if (filter === 'new') {
      if (new Date(c.created_at) < new Date(Date.now() - 90 * 24 * 60 * 60 * 1000)) return false
    }
    return true
  })

  const handleDelete = async (c: Child, e: React.MouseEvent) => {
    e.stopPropagation()
    try {
      await childrenApi.delete(c.id)
      setChildren((cs) => cs.filter((x) => x.id !== c.id))
      showToast({ title: '아동 정보가 삭제되었습니다', body: `${c.name} 아동 정보가 삭제되었어요.`, kind: 'success' })
    } catch {
      showToast({ title: '삭제에 실패했습니다', kind: 'error' })
    }
  }

  const CHIPS = [
    { label: '전체',     value: 'all' as const },
    { label: '최근 등록', value: 'new' as const },
  ]

  return (
    <div>
      <div className="px-8 pt-7 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">아동 관리</h1>
          <p className="text-[13px] text-ink-500 mt-1">총 {children.length}명의 아동</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors shadow-md"
        >
          <Icon name="plus" size={15} />아동 등록
        </button>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3.5 border-b border-ink-100">
            <div className="relative flex-1 max-w-[320px]">
              <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none">
                <Icon name="search" size={14} />
              </span>
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="아동 이름 검색…"
                className="w-full h-9 pl-8 pr-3 border border-ink-200 rounded-lg text-[13px] outline-none focus:border-brand-500 font-sans"
              />
            </div>
            <div className="flex gap-1.5 ml-auto">
              {CHIPS.map((c) => (
                <button
                  key={c.value}
                  onClick={() => setFilter(c.value)}
                  className={cn(
                    'px-3 py-1.5 rounded-full text-[12px] font-medium border transition-all',
                    filter === c.value
                      ? 'bg-brand-700 text-white border-brand-700'
                      : 'bg-transparent text-ink-600 border-ink-200 hover:bg-ink-50',
                  )}
                >
                  {c.label}
                </button>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="py-16 text-center text-[13px] text-ink-400">불러오는 중…</div>
          ) : filtered.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center text-brand-600 mx-auto mb-4">
                <Icon name="users" size={28} strokeWidth={1.8} />
              </div>
              <p className="text-[15px] font-semibold text-ink-800">
                {query ? '검색 결과가 없습니다' : '아직 등록된 아동이 없습니다'}
              </p>
              <p className="text-[12px] text-ink-500 mt-1.5">
                {query ? '다른 이름으로 다시 시도해보세요.' : '첫 아동을 등록하면 세션 분석을 시작할 수 있어요.'}
              </p>
            </div>
          ) : (
            <table className="w-full text-[13px] border-collapse">
              <thead>
                <tr className="bg-ink-50">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100">이름</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100">생년월일</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100">성별</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100">메모</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100">등록일</th>
                  <th className="text-right px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100">액션</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr
                    key={c.id}
                    onClick={() => navigate(`/children/${c.id}`)}
                    className="border-t border-ink-100 hover:bg-brand-25 cursor-pointer transition-colors group"
                  >
                    <td className="px-5 py-3">
                      <div className="flex items-center gap-2.5">
                        <div className={avatarClass(c.gender)}>{c.name[0]}</div>
                        <div>
                          <p className="font-semibold text-ink-800">{c.name}</p>
                          <p className="text-[11px] text-ink-500 mt-0.5">{computeAge(c.birth_date)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono-num text-ink-500">{formatDate(c.birth_date)}</td>
                    <td className="px-5 py-3">
                      <span className={genderChipClass(c.gender)}>{GENDER_LABEL[c.gender ?? 'U'] ?? '미입력'}</span>
                    </td>
                    <td className="px-5 py-3 text-ink-500 max-w-[180px] truncate">{c.memo ?? '—'}</td>
                    <td className="px-5 py-3 font-mono-num text-ink-500">{formatDate(c.created_at)}</td>
                    <td className="px-5 py-3 text-right">
                      <div className="inline-flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => { e.stopPropagation(); navigate(`/children/${c.id}`) }}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:bg-brand-50 hover:text-brand-700 transition-colors"
                          title="상세 보기"
                        >
                          <Icon name="chevronRight" size={14} strokeWidth={2.2} />
                        </button>
                        <button
                          onClick={(e) => handleDelete(c, e)}
                          className="w-7 h-7 rounded-lg flex items-center justify-center text-ink-500 hover:bg-red-50 hover:text-red-700 transition-colors"
                          title="삭제"
                        >
                          <Icon name="trash" size={14} strokeWidth={2.2} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {showModal && (
        <ChildFormModal
          onClose={() => setShowModal(false)}
          onDone={(child) => setChildren((cs) => [child, ...cs])}
        />
      )}
    </div>
  )
}
