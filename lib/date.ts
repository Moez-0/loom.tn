export function formatLocalDate(date: Date): string {
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

export function addDays(baseDate: Date, days: number): Date {
  const date = new Date(baseDate)
  date.setDate(date.getDate() + days)
  return date
}

export function getLastLocalDates(days: number, now = new Date()): string[] {
  const output: string[] = []

  for (let i = days - 1; i >= 0; i -= 1) {
    output.push(formatLocalDate(addDays(now, -i)))
  }

  return output
}

export function normalizeReservationDate(value: string): string | null {
  const input = value.trim()

  const isoPrefix = input.match(/^(\d{4})-(\d{2})-(\d{2})/)
  if (isoPrefix) {
    return `${isoPrefix[1]}-${isoPrefix[2]}-${isoPrefix[3]}`
  }

  const looseIso = input.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/)
  if (looseIso) {
    const month = looseIso[2].padStart(2, '0')
    const day = looseIso[3].padStart(2, '0')
    return `${looseIso[1]}-${month}-${day}`
  }

  const parsed = new Date(input)
  if (Number.isNaN(parsed.getTime())) {
    return null
  }

  return formatLocalDate(parsed)
}

export function isDateWithinRange(date: string, start: string, end: string): boolean {
  return date >= start && date <= end
}