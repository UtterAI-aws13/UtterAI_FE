import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { sessionsApi, type Session } from '@/api/sessions'
import { patientsApi, type Patient } from '@/api/patients'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Icon } from '@/components/common/Icon'
import { useAuthStore } from '@/store/authStore'
import { cn, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

function StatCard({ label, value, delta, tone }: { label: string; value: number; delta: string; tone: 'pos' | 'neutral' }) {
  return (
    <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5 flex flex-col gap-2">
      <p className="text-[12px] font-semibold text-ink-500 uppercase tracking-wide">{label}</p>
      <p className="text-3xl font-bold text-ink-800 font-mono-num">{value}</p>
      <p className={cn('text-[12px] font-medium', tone === 'pos' ? 'text-brand-500' : 'text-ink-400')}>{delta}</p>
    </div>
  )
}

export default function DashboardPage() {
  const navigate = useNavigate()
  const { showToast } = useToast()
  const user = useAuthStore((s) => s.user)

  const [sessions, setSessions] = useState<Session[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [patientMap, setPatientMap] = useState<Record<string, Patient>>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([sessionsApi.list(), patientsApi.list()])
      .then(([sessRes, patientRes]) => {
        const sess = Array.isArray(sessRes.data) ? sessRes.data : []
        const pats = Array.isArray(patientRes.data) ? patientRes.data : []
        setSessions(sess)
        setPatients(pats)
        const map: Record<string, Patient> = {}
        pats.forEach((p) => { map[p.id] = p })
        setPatientMap(map)
      })
      .catch(() => showToast({ title: '데이터를 불러오지 못했습니다', kind: 'error' }))
      .finally(() => setLoading(false))
  }, [])

  const now = new Date()
  const thisMonthSessions = sessions.filter((s) => {
    const d = new Date(s.created_at)
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth()
  })
  const processingCount = sessions.filter((s) => s.status === 'ANALYSIS_PROCESSING').length
  const recentSessions = [...sessions]
    .sort((a, b) => b.created_at.localeCompare(a.created_at))
    .slice(0, 5)

  const stats = [
    { id: 'patients', label: '담당 환자',    value: patients.length,          delta: `전체 ${patients.length}명`,          tone: 'pos' as const },
    { id: 'sessions', label: '이번 달 세션',  value: thisMonthSessions.length, delta: `이번 달 ${thisMonthSessions.length}회`, tone: 'pos' as const },
    { id: 'queue',    label: '분석 진행 중',  value: processingCount,          delta: '현재 진행 중',                         tone: 'neutral' as const },
  ]

  return (
    <div>
      <div className="px-8 pt-7 pb-5 flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">대시보드</h1>
          <p className="text-[13px] text-ink-500 mt-1">
            안녕하세요, {user?.name ?? '선생님'}. 오늘도 좋은 하루 되세요.
          </p>
        </div>
        <button
          onClick={() => navigate('/sessions/new')}
          className="flex items-center gap-2 px-4 py-2 bg-brand-700 text-white rounded-full text-[13px] font-semibold hover:bg-brand-900 transition-colors shadow-md"
        >
          <Icon name="plus" size={15} />새 세션
        </button>
      </div>

      <div className="px-8 pb-8 flex flex-col gap-6">
        {/* Stats */}
        <div className="grid grid-cols-3 gap-4">
          {stats.map((s) => <StatCard key={s.id} {...s} />)}
        </div>

        {/* Recent sessions */}
        <div className="bg-white rounded-xl border border-ink-200 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-4 border-b border-ink-100">
            <div>
              <h2 className="text-[15px] font-semibold text-ink-800">최근 세션</h2>
              <p className="text-[12px] text-ink-500 mt-0.5">최근 5개 세션을 표시합니다</p>
            </div>
            <button
              onClick={() => navigate('/sessions')}
              className="text-[12px] text-brand-600 font-semibold hover:text-brand-800 flex items-center gap-1"
            >
              전체 보기 <Icon name="chevronRight" size={13} strokeWidth={2.2} />
            </button>
          </div>

          {loading ? (
            <div className="py-10 text-center text-[13px] text-ink-400">불러오는 중…</div>
          ) : recentSessions.length === 0 ? (
            <div className="py-10 text-center text-[13px] text-ink-400">세션이 없습니다.</div>
          ) : (
            <table className="w-full text-[13px]">
              <thead>
                <tr className="bg-ink-50 border-b border-ink-100">
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">환자</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">날짜</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">유형</th>
                  <th className="text-left px-5 py-2.5 text-[11px] font-semibold text-ink-500 uppercase tracking-wider">상태</th>
                </tr>
              </thead>
              <tbody>
                {recentSessions.map((s) => {
                  const patient = patientMap[s.patient_ref_id]
                  return (
                    <tr
                      key={s.id}
                      onClick={() => navigate(`/sessions/${s.id}`)}
                      className="border-t border-ink-100 hover:bg-brand-25 cursor-pointer transition-colors"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-[13px] font-bold">
                            {patient ? patient.name[0] : '?'}
                          </div>
                          <p className="font-semibold text-ink-800">{patient?.name ?? '—'}</p>
                        </div>
                      </td>
                      <td className="px-5 py-3 font-mono-num text-ink-500">{formatDate(s.session_date)}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-ink-100 text-ink-600">
                          {s.session_type ?? '—'}
                        </span>
                      </td>
                      <td className="px-5 py-3"><StatusBadge status={s.status} /></td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
