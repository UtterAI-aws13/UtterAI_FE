import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—'
  return dateStr.slice(0, 10).replace(/-/g, '.')
}

export function computeAge(birthDate: string | null | undefined): string {
  if (!birthDate) return '미입력'
  const birth = new Date(birthDate)
  const now = new Date()
  const totalMonths =
    (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth())
  if (totalMonths < 0) return '미입력'
  const y = Math.floor(totalMonths / 12)
  const m = totalMonths % 12
  if (y === 0) return `${m}개월`
  if (m === 0) return `${y}세`
  return `${y}세 ${m}개월`
}

export function formatSeconds(seconds: number | null | undefined): string {
  if (seconds == null) return ''
  const m = Math.floor(seconds / 60)
  const s = (seconds % 60).toFixed(1)
  return `${String(m).padStart(2, '0')}:${s.padStart(4, '0')}`
}

export function formatMs(ms: number | null | undefined): string {
  if (ms == null) return ''
  const totalSec = Math.floor(ms / 1000)
  const m = Math.floor(totalSec / 60)
  const s = String(totalSec % 60).padStart(2, '0')
  return `${m}:${s}`
}

export function maskName(name: string): string {
  const chars = [...name]
  if (chars.length <= 1) return name
  if (chars.length === 2) return chars[0] + '*'
  return chars[0] + '*'.repeat(chars.length - 2) + chars[chars.length - 1]
}
