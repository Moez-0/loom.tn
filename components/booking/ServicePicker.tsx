type ServiceOption = {
  id: string
  name: string
  duration_minutes: number
}

type ServicePickerProps = {
  services: ServiceOption[]
  value: string
  onChange: (value: string) => void
  placeholder: string
  className?: string
}

export default function ServicePicker({ services, value, onChange, placeholder, className }: ServicePickerProps) {
  return (
    <select className={className ?? 'input'} value={value} onChange={(event) => onChange(event.target.value)}>
      <option value="">{placeholder}</option>
      {services.map((service) => (
        <option key={service.id} value={service.id}>
          {service.name} ({service.duration_minutes}m)
        </option>
      ))}
    </select>
  )
}
