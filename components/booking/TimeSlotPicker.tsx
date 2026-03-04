import { useTranslations } from 'next-intl'

type TimeSlotPickerProps = {
  slots: string[]
  value: string
  onChange: (slot: string) => void
  activeClassName?: string
  defaultClassName?: string
}

export default function TimeSlotPicker({
  slots,
  value,
  onChange,
  activeClassName,
  defaultClassName,
}: TimeSlotPickerProps) {
  const t = useTranslations('booking')

  if (slots.length === 0) {
    return <p className="text-sm text-loom-muted">{t('noSlots')}</p>
  }

  return (
    <div className="grid grid-cols-3 gap-2 md:grid-cols-5">
      {slots.map((slot) => {
        const active = value === slot
        return (
          <button
            key={slot}
            type="button"
            onClick={() => onChange(slot)}
            className={`border px-3 py-2 font-mono text-sm transition-colors ${
              active
                ? (activeClassName ?? 'border-loom-black bg-loom-black text-loom-white')
                : (defaultClassName ?? 'border-loom-border bg-loom-white text-loom-black hover:border-loom-border-dk')
            }`}
          >
            {slot}
          </button>
        )
      })}
    </div>
  )
}
