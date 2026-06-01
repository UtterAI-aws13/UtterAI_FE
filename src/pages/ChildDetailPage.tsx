import { useParams, useNavigate } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Icon } from '@/components/common/Icon'
import { cn } from '@/lib/utils'
import { childrenApi } from '@/api/children'
import { sessionsApi } from '@/api/sessions'

const SESSION_TYPE_LABEL: Record<string, string> = { INDIVIDUAL: '개별', GROUP: '그룹' }

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

export default function ChildDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const { data: child, isLoading: childLoading } = useQuery({
    queryKey: ['child', id],
    queryFn: () => childrenApi.get(id!).then((r) => r.data),
    enabled: !!id,
  })

  const { data: sessions = [], isLoading: sessionsLoading } = useQuery({
    queryKey: ['sessions', { child_id: id }],
    queryFn: () => sessionsApi.list({ child_id: id }).then((r) => r.data),
    enabled: !!id,
  })

  if (childLoading) {
    return (
      <div className="px-8 pt-7">
        <div className="text-ink-400 text-[13px]">불러오는 중…</div>
      </div>
    )
  }

  if (!child) {
    return (
      <div className="px-8 pt-7">
        <div className="text-red-500 text-[13px]">아동 정보를 불러올 수 없습니다.</div>
      </div>
    )
  }

  const genderLabel = child.gender === 'F' ? '여아' : child.gender === 'M' ? '남아' : '미입력'
  const age = calcAge(child.birth_date)

  return (
    <div>
      <div className="px-8 pt-7 pb-5 flex items-center gap-4">
        <button
          onClick={() => navigate('/children')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <Icon name="arrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">{child.name}</h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            {age}{age ? ' · ' : ''}{genderLabel} · 등록일 {fmtDate(child.created_at)}
          </p>
        </div>
      </div>

      <div className="px-8 pb-8 grid grid-cols-3 gap-5">
        {/* Left: Info card */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-ink-100">
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold',
                child.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700',
              )}>
                {child.name[0]}
              </div>
              <div>
                <p className="font-bold text-[16px] text-ink-800">{child.name}</p>
                <p className="text-[12px] text-ink-500">{child.birth_date ? fmtDate(child.birth_date) : '생년월일 미입력'}</p>
              </div>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: '나이',      value: age || '—' },
                { label: '성별',      value: genderLabel },
                { label: '전체 세션', value: `${sessions.length}회` },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-start">
                  <span className="text-[12px] text-ink-500">{r.label}</span>
                  <span className="text-[12px] font-semibold text-ink-800 text-right ml-4">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {child.memo && (
            <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5">
              <p className="text-[13px] font-semibold text-ink-800 mb-2">메모</p>
              <p className="text-[12px] text-ink-500 leading-relaxed">{child.memo}</p>
            </div>
          )}
        </div>

        {/* Right: Session list */}
        <div className="col-span-2">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
            <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
              <h2 className="text-[15px] font-semibold text-ink-800">세션 기록</h2>
              <button
                onClick={() => navigate('/sessions/new')}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-brand-700 text-white rounded-full text-[12px] font-semibold hover:bg-brand-900 transition-colors"
              >
                <Icon name="plus" size={13} />새 세션
              </button>
            </div>

            {sessionsLoading ? (
              <div className="py-12 text-center text-ink-400 text-[13px]">불러오는 중…</div>
            ) : sessions.length === 0 ? (
              <div className="py-12 text-center text-ink-400 text-[13px]">아직 세션이 없습니다.</div>
            ) : (
              <table className="w-full text-[13px]">
                <thead>
                  <tr className="bg-ink-50 border-b border-ink-100">
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">날짜</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">유형</th>
                    <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">상태</th>
                  </tr>
                </thead>
                <tbody>
                  {sessions.map((s) => (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/sessions/${s.id}`)}
                      className="border-t border-ink-100 hover:bg-brand-25 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3 font-mono-num text-ink-500">{fmtDate(s.session_date)}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-ink-100 text-ink-600">
                          {SESSION_TYPE_LABEL[s.session_type ?? ''] ?? s.session_type ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
