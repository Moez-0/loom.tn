import StatusBadge from '@/components/dashboard/StatusBadge'

type ReservationStatus = 'pending' | 'confirmed' | 'cancelled' | 'no_show' | 'completed'
type ReservationSource = 'online' | 'phone' | 'whatsapp' | 'walk_in'

export type DashboardReservation = {
  id: string
  customer_name: string
  date: string
  time_slot: string
  party_size: number
  status: ReservationStatus
  source: ReservationSource
}

type ReservationTableProps = {
  reservations: DashboardReservation[]
  text: {
    date: string
    time: string
    guest: string
    party: string
    source: string
    status: string
    actions: string
    empty: string
    sourceLabel: Record<ReservationSource, string>
    statusLabel: Record<ReservationStatus, string>
    confirm: string
    cancel: string
    noShow: string
  }
  onUpdateStatus: (formData: FormData) => Promise<void>
}

export default function ReservationTable({ reservations, text, onUpdateStatus }: ReservationTableProps) {
  return (
    <div className="overflow-x-auto rounded-xl border border-loom-border bg-loom-surface">
      <table className="w-full border-collapse text-left text-[0.938rem]">
        <thead>
          <tr className="border-b border-loom-border bg-loom-surface">
            <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{text.date}</th>
            <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{text.time}</th>
            <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{text.guest}</th>
            <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{text.party}</th>
            <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{text.source}</th>
            <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{text.status}</th>
            <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{text.actions}</th>
          </tr>
        </thead>
        <tbody>
          {reservations.length === 0 ? (
            <tr>
              <td className="px-4 py-6 text-loom-muted" colSpan={7}>
                {text.empty}
              </td>
            </tr>
          ) : (
            reservations.map((reservation) => (
              <tr key={reservation.id} className="border-b border-loom-border last:border-b-0">
                <td className="px-4 py-3 font-mono text-sm text-loom-black">{reservation.date}</td>
                <td className="px-4 py-3 font-mono text-sm text-loom-black">{reservation.time_slot}</td>
                <td className="px-4 py-3 text-loom-black">{reservation.customer_name}</td>
                <td className="px-4 py-3 text-loom-muted">{reservation.party_size}</td>
                <td className="px-4 py-3 uppercase text-loom-muted">{text.sourceLabel[reservation.source]}</td>
                <td className="px-4 py-3">
                  <StatusBadge status={reservation.status} label={text.statusLabel[reservation.status]} />
                </td>
                <td className="px-4 py-3">
                  <form action={onUpdateStatus} className="flex flex-wrap gap-2">
                    <input type="hidden" name="reservationId" value={reservation.id} />
                    <button type="submit" name="status" value="confirmed" className="btn-secondary !px-3 !py-2 !text-xs">
                      {text.confirm}
                    </button>
                    <button type="submit" name="status" value="cancelled" className="btn-danger !px-3 !py-2 !text-xs">
                      {text.cancel}
                    </button>
                    <button type="submit" name="status" value="no_show" className="btn-danger !px-3 !py-2 !text-xs">
                      {text.noShow}
                    </button>
                  </form>
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  )
}
