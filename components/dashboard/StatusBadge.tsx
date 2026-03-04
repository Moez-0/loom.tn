type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'

type StatusBadgeProps = {
  status: ReservationStatus
  label: string
}

const statusClass: Record<ReservationStatus, string> = {
  pending: 'badge-pending',
  confirmed: 'badge-confirmed',
  cancelled: 'badge-cancelled',
  no_show: 'badge-no-show',
  completed: 'badge-completed',
}

export default function StatusBadge({ status, label }: StatusBadgeProps) {
  return <span className={`badge ${statusClass[status]}`}>{label}</span>
}
