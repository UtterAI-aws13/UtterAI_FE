import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'
import { childrenApi, type Child, type CreateChildPayload } from '@/api/children'

const GENDER_LABEL: Record<string, string> = { M: '남아', F: '여아' }

function calcAge(birthDate: string | null): string {
  if (!birthDate) return ''
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  return `${Math.floor(totalMonths / 12)}세 ${totalMonths % 12}개월`
}

function fmtDate(iso: string) {
  return iso.slice(0, 10).replaceAll('-', '.')
}

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

function CreateChildModal({ onClose }: { onClose: () => void }) {
  const { showToast } = useToast()
  const qc = useQueryClient()
  const [form, setForm] = useState<CreateChildPayload>({ name: '', birth_date: null, gender: null, memo: null })

  const create = useMutation({
    mutationFn: () => childrenApi.create(form).then((r) => r.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['children'] })
      showToast({ title: '아동이 등록되었습니다', kind: 'success' })
      onClose()
    },
    onError: () => showToast({ title: '등록에 실패했습니다', kind: 'error' }),
  })

  const inputClass = 'w-full h-10 px-3 border border-ink-300 rounded-lg text-[13px] outline-none focus:border-brand-500 font-sans'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-xl p-6 w-[420px]" onClick={(e) => e.stopPropagation()}>
        <h2 className="text-[16px] font-bold text-ink-800 mb-5">아동 등록</h2>
        <div className="flex flex-col gap-4">
          <div>
            <label className="block text-[12px] font-medium text-ink-700 mb-1.5">이름 <span className="text-red-500">*</span></label>
            <input
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              placeholder="홍길동"
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink-700 mb-1.5">생년월일</label>
            <input
              type="date"
              value={form.birth_date ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, birth_date: e.target.value || null }))}
              className={inputClass}
            />
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink-700 mb-1.5">성별</label>
            <select
              value={form.gender ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, gender: (e.target.value as 'M' | 'F') || null }))}
              className={inputClass + ' cursor-pointer'}
            >
              <option value="">선택 안 함</option>
              <option value="M">남아</option>
              <option value="F">여아</option>
            </select>
          </div>
          <div>
            <label className="block text-[12px] font-medium text-ink-700 mb-1.5">치료 목표 / 메모</label>
            <textarea
              value={form.memo ?? ''}
              onChange={(e) => setForm((f) => ({ ...f, memo: e.target.value || null }))}
              placeholder="주요 치료 목표나 메모를 입력하세요"
              rows={3}
              className="w-full px-3 py-2 border border-ink-300 rounded-lg text-[13px] outline-none focus:border-brand-500 font-sans resize-none"
            />
          </div>
        </div>
        <div className="flex gap-3 mt-6 justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 border border-ink-200 text-ink-600 rounded-full text-[13px] font-semibold hover:bg-ink-50"
          >
            취소
          </button>
          <button
            onClick={() => create.mutate()}
            disabled={!form.name.trim() || create.isPending}
            className="px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 disabled:opacity-50 disabled:cursor-wait"
          >
            {create.isPending ? '등록 중…' : '등록'}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function ChildrenPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const qc = useQueryClient()
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState<'all' | 'new'>('all')
  const [showCreate, setShowCreate] = useState(false)

  const { data: children = [], isLoading } = useQuery({
    queryKey: ['children'],
    queryFn: () => childrenApi.list().then((r) => r.data),
  })

  const deleteChild = useMutation({
    mutationFn: (id: string) => childrenApi.delete(id),
    onSuccess: (_, id) => {
      qc.setQueryData<Child[]>(['children'], (prev) => prev?.filter((c) => c.id !== id) ?? [])
      showToast({ title: '아동 정보가 삭제되었습니다', kind: 'success' })
    },
    onError: () => showToast({ title: '삭제에 실패했습니다', kind: 'error' }),
  })

  const filtered = children.filter((c) => {
    if (c.status === 'DELETED') return false
    if (query && !c.name.includes(query)) return false
    if (filter === 'new') {
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      if (new Date(c.created_at) < thirtyDaysAgo) return false
    }
    return true
  })

  const handleDelete = (c: Child, e: React.MouseEvent) => {
    e.stopPropagation()
    deleteChild.mutate(c.id)
  }

  const CHIPS = [
    { label: '전체',    value: 'all' as const },
    { label: '최근 등록', value: 'new' as const },
  ]

  return (
    <div>
      {showCreate && <CreateChildModal onClose={() => setShowCreate(false)} />}

      <div className="px-8 pt-7 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">아동 관리</h1>
          <p className="text-[13px] text-ink-500 mt-1">총 {filtered.length}명의 아동</p>
        </div>
        <button
          onClick={() => setShowCreate(true)}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors shadow-md"
        >
          <Icon name="plus" size={15} />아동 등록
        </button>
      </div>

      <div className="px-8 pb-8">
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
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

          {isLoading ? (
            <div className="py-16 text-center text-ink-400 text-[13px]">불러오는 중…</div>
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
                  {['이름', '생년월일', '성별', '메모', '등록일', '액션'].map((h, i) => (
                    <th
                      key={h}
                      className={cn(
                        'py-2.5 px-5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider border-b border-ink-100',
                        i === 5 ? 'text-right' : 'text-left',
                      )}
                    >
                      {h}
                    </th>
                  ))}
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
                          <p className="text-[11px] text-ink-500 mt-0.5">{calcAge(c.birth_date)}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3 font-mono-num text-ink-500">
                      {c.birth_date ? fmtDate(c.birth_date) : '—'}
                    </td>
                    <td className="px-5 py-3">
                      <span className={genderChipClass(c.gender)}>
                        {GENDER_LABEL[c.gender ?? ''] ?? '미입력'}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-ink-600 max-w-[200px] truncate">{c.memo ?? '—'}</td>
                    <td className="px-5 py-3 font-mono-num text-ink-500">{fmtDate(c.created_at)}</td>
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
    </div>
  )
}
