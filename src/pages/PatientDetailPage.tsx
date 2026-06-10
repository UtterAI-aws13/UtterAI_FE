import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { patientsApi, type Patient } from '@/api/patients'
import { sessionsApi, type Session } from '@/api/sessions'
import { StatusBadge } from '@/components/common/StatusBadge'
import { Icon } from '@/components/common/Icon'
import { PatientFormModal } from '@/components/common/PatientFormModal'
import { cn, computeAge, formatDate } from '@/lib/utils'
import { useToast } from '@/hooks/useToast'

export default function PatientDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { showToast } = useToast()

  const [patient, setPatient] = useState<Patient | null>(null)
  const [sessions, setSessions] = useState<Session[]>([])
  const [loading, setLoading] = useState(true)
  const [showEdit, setShowEdit] = useState(false)

  useEffect(() => {
    if (!id) return
    Promise.all([
      patientsApi.get(id),
      sessionsApi.list({ patient_ref_id: id }),
    ])
      .then(([patientRes, sessionsRes]) => {
        setPatient(patientRes.data)
        setSessions(sessionsRes.data)
      })
      .catch(() => showToast({ title: '데이터를 불러오지 못했습니다', kind: 'error' }))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) {
    return <div className="px-8 pt-7 text-[13px] text-ink-400">불러오는 중…</div>
  }

  if (!patient) {
    return <div className="px-8 pt-7 text-[13px] text-ink-500">환자 정보를 찾을 수 없습니다.</div>
  }

  const genderLabel = patient.gender === 'F' ? '여성' : patient.gender === 'M' ? '남성' : '미입력'

  return (
    <div>
      <div className="px-8 pt-7 pb-5 flex items-center gap-4">
        <button
          onClick={() => navigate('/patients')}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-500 hover:bg-ink-100 transition-colors"
        >
          <Icon name="arrowLeft" size={16} />
        </button>
        <div>
          <h1 className="text-2xl font-bold text-ink-800 tracking-tight">{patient.name}</h1>
          <p className="text-[13px] text-ink-500 mt-0.5">
            {computeAge(patient.birth_date)} · {genderLabel} · 등록일 {formatDate(patient.created_at)}
          </p>
        </div>
      </div>

      <div className="px-8 pb-8 grid grid-cols-3 gap-5">
        {/* Info card */}
        <div className="col-span-1 flex flex-col gap-4">
          <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5">
            <div className="flex items-center gap-3 mb-4 pb-4 border-b border-ink-100">
              <div className={cn(
                'w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold',
                patient.gender === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700',
              )}>
                {patient.name[0]}
              </div>
              <div className="flex-1">
                <p className="font-bold text-[16px] text-ink-800">{patient.name}</p>
                <p className="text-[12px] text-ink-500">{formatDate(patient.birth_date)}</p>
              </div>
              <button
                onClick={() => setShowEdit(true)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-ink-400 hover:bg-ink-100 hover:text-ink-700 transition-colors"
                title="정보 수정"
              >
                <Icon name="edit" size={14} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { label: '성별',     value: genderLabel },
                { label: '전체 세션', value: `${sessions.length}회` },
                { label: '최근 세션', value: sessions.length > 0 ? formatDate(sessions[0].session_date) : '없음' },
              ].map((r) => (
                <div key={r.label} className="flex justify-between items-start">
                  <span className="text-[12px] text-ink-500">{r.label}</span>
                  <span className="text-[12px] font-semibold text-ink-800 text-right ml-4">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {patient.memo && (
            <div className="bg-white rounded-xl border border-ink-200 shadow-sm p-5">
              <p className="text-[13px] font-semibold text-ink-800 mb-2">메모</p>
              <p className="text-[12px] text-ink-500 leading-relaxed">{patient.memo}</p>
            </div>
          )}
        </div>

        {/* Session list */}
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

            {sessions.length === 0 ? (
              <div className="py-12 text-center text-[13px] text-ink-400">세션이 없습니다.</div>
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
                      <td className="px-5 py-3 font-mono-num text-ink-500">{formatDate(s.session_date)}</td>
                      <td className="px-5 py-3">
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold bg-ink-100 text-ink-600">
                          {s.session_type ?? '—'}
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

      {showEdit && patient && (
        <PatientFormModal
          patient={patient}
          onClose={() => setShowEdit(false)}
          onDone={(updated) => setPatient(updated)}
        />
      )}
    </div>
  )
}
