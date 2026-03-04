type StaffOption = {
  id: string
  name: string
  role?: string | null
}

type StaffPickerProps = {
  staff: StaffOption[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export default function StaffPicker({ staff, value, onChange, placeholder, className }: StaffPickerProps) {
  return (
    <select className={className ?? 'input'} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {staff.map((member) => (
        <option key={member.id} value={member.id}>
          {member.name}{member.role ? ` — ${member.role}` : ''}
        </option>
      ))}
    </select>
  )
}
