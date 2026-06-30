import { useState, useRef, useEffect } from 'react'
import { reportsApi, type Report, type PatchProposal } from '@/api/reports'
import { Icon } from '@/components/common/Icon'
import { useToast } from '@/hooks/useToast'
import { cn } from '@/lib/utils'

interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  patch?: PatchProposal
}

interface Props {
  report: Report
  onPatchApplied: (newVersion: number, updatedSections: string[]) => void
}

const SECTION_LABELS: Record<string, string> = {
  S: 'S — Subjective',
  O: 'O — Objective',
  A: 'A — Assessment',
  P: 'P — Plan',
}

export function ReportChatPanel({ report, onPatchApplied }: Props) {
  const { showToast } = useToast()
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [input, setInput] = useState('')
  const [sending, setSending] = useState(false)
  const [applyingPatchId, setApplyingPatchId] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const handleSend = async () => {
    const trimmed = input.trim()
    if (!trimmed || sending) return

    setInput('')
    setSending(true)
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }])

    try {
      const { data } = await reportsApi.sendChatMessage(report.id, trimmed)
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: data.assistant_message,
          patch: data.patch_proposal ?? undefined,
        },
      ])
    } catch {
      showToast({ title: '메시지 전송에 실패했습니다', kind: 'error' })
      setMessages((prev) => prev.slice(0, -1))
      setInput(trimmed)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  const handleApplyPatch = async (patch: PatchProposal, msgIndex: number) => {
    setApplyingPatchId(patch.patch_id)
    try {
      const { data } = await reportsApi.applyPatch(patch.patch_id)
      onPatchApplied(data.version, data.updated_sections)
      setMessages((prev) =>
        prev.map((m, i) => (i === msgIndex ? { ...m, patch: undefined } : m)),
      )
      showToast({ title: '수정안이 리포트에 반영되었습니다', kind: 'success' })
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status
      if (status === 409) {
        showToast({
          title: '리포트가 변경되어 반영할 수 없습니다. 다시 요청해주세요.',
          kind: 'error',
        })
      } else {
        showToast({ title: '반영에 실패했습니다', kind: 'error' })
      }
    } finally {
      setApplyingPatchId(null)
    }
  }

  const handleDismissPatch = (msgIndex: number) => {
    setMessages((prev) =>
      prev.map((m, i) => (i === msgIndex ? { ...m, patch: undefined } : m)),
    )
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="flex flex-col h-full border-l border-ink-100">
      {/* header */}
      <div className="px-4 py-3 border-b border-ink-100 flex-shrink-0">
        <p className="text-[13px] font-bold text-ink-800">AI 보조</p>
        <p className="text-[11px] text-ink-400 mt-0.5">수정 제안을 요청하거나 근거를 확인하세요</p>
      </div>

      {/* messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 flex flex-col gap-3 min-h-0">
        {messages.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center gap-2 text-center py-8">
            <Icon name="clipboard" size={28} className="text-ink-300" />
            <p className="text-[12px] text-ink-400 leading-relaxed">
              섹션 수정, 근거 확인, 형식 검토 등을<br />자유롭게 요청하세요
            </p>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={cn('flex flex-col gap-2', msg.role === 'user' ? 'items-end' : 'items-start')}>
            <div
              className={cn(
                'px-3 py-2 rounded-2xl text-[12px] leading-relaxed max-w-[90%] whitespace-pre-wrap',
                msg.role === 'user'
                  ? 'bg-brand-700 text-white rounded-br-sm'
                  : 'bg-ink-50 text-ink-800 rounded-bl-sm',
              )}
            >
              {msg.content}
            </div>

            {/* patch proposal card */}
            {msg.patch && (
              <div className="w-full border border-brand-200 rounded-xl overflow-hidden bg-white shadow-sm">
                <div className="bg-brand-50 px-3 py-2 flex items-center gap-1.5">
                  <Icon name="edit" size={12} className="text-brand-700" />
                  <span className="text-[11px] font-bold text-brand-700">
                    수정 제안 — {SECTION_LABELS[msg.patch.target_section] ?? msg.patch.target_section}
                  </span>
                </div>

                <div className="px-3 py-2 flex flex-col gap-2">
                  <div>
                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-1">원문</p>
                    <p className="text-[11px] text-ink-500 leading-relaxed line-through whitespace-pre-wrap">
                      {msg.patch.original_text}
                    </p>
                  </div>
                  <div>
                    <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-1">수정안</p>
                    <p className="text-[11px] text-ink-800 leading-relaxed whitespace-pre-wrap">
                      {msg.patch.proposed_text}
                    </p>
                  </div>
                  {msg.patch.rationale && (
                    <div>
                      <p className="text-[10px] font-bold text-ink-400 uppercase tracking-wide mb-1">수정 이유</p>
                      <p className="text-[11px] text-ink-500 leading-relaxed">{msg.patch.rationale}</p>
                    </div>
                  )}
                </div>

                <div className="px-3 pb-3 flex gap-2">
                  <button
                    onClick={() => handleApplyPatch(msg.patch!, i)}
                    disabled={applyingPatchId !== null}
                    className="flex-1 py-1.5 bg-brand-700 text-white text-[11px] font-semibold rounded-lg hover:bg-brand-900 transition-colors disabled:opacity-60"
                  >
                    {applyingPatchId === msg.patch.patch_id ? '반영 중…' : '반영'}
                  </button>
                  <button
                    onClick={() => handleDismissPatch(i)}
                    disabled={applyingPatchId !== null}
                    className="flex-1 py-1.5 border border-ink-200 text-ink-600 text-[11px] font-semibold rounded-lg hover:bg-ink-50 transition-colors disabled:opacity-60"
                  >
                    무시
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}

        {sending && (
          <div className="flex items-start">
            <div className="bg-ink-50 px-3 py-2 rounded-2xl rounded-bl-sm">
              <span className="text-[12px] text-ink-400 animate-pulse">AI가 생각 중…</span>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* input */}
      <div className="px-3 pb-3 pt-2 flex-shrink-0 border-t border-ink-100">
        <div className="flex items-end gap-2 bg-ink-50 rounded-xl px-3 py-2">
          <textarea
            ref={textareaRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="요청을 입력하세요 (Shift+Enter로 줄바꿈)"
            rows={1}
            disabled={sending}
            className={cn(
              'flex-1 bg-transparent text-[12px] text-ink-800 placeholder-ink-400',
              'outline-none resize-none leading-relaxed max-h-24 overflow-y-auto',
              'disabled:opacity-60',
            )}
          />
          <button
            onClick={handleSend}
            disabled={!input.trim() || sending}
            className="flex-shrink-0 w-7 h-7 flex items-center justify-center bg-brand-700 text-white rounded-lg hover:bg-brand-900 transition-colors disabled:opacity-40"
          >
            <Icon name="send" size={13} />
          </button>
        </div>
        <p className="text-[10px] text-ink-300 mt-1.5 text-center">
          AI 제안은 반드시 치료사가 검토 후 반영하세요
        </p>
      </div>
    </div>
  )
}
