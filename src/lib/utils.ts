import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

const currencyFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
})

const currencyFmtCents = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

export function formatCurrency(value: number, cents = false) {
  return (cents ? currencyFmtCents : currencyFmt).format(value)
}

export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value)
}

/** Compact form: 12.4k, 1.2M */
export function formatCompact(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)
}

export function formatDate(iso: string, opts?: Intl.DateTimeFormatOptions) {
  return new Date(iso).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    ...opts,
  })
}

/** Stable, human-readable id like WO-2041 */
export function makeId(prefix: string) {
  return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}`
}
