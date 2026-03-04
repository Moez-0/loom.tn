type DatePickerProps = {
  value: string
  onChange: (value: string) => void
  className?: string
}

export default function DatePicker({ value, onChange, className }: DatePickerProps) {
  const today = new Date().toISOString().slice(0, 10)

  return (
    <input
      type="date"
      className={className ?? 'input font-mono'}
      min={today}
      value={value}
      onChange={(event) => onChange(event.target.value)}
      required
    />
  )
}
