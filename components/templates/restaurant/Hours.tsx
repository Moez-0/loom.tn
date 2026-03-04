import type { Business } from '@/types'
import { getTranslations } from 'next-intl/server'

type HoursProps = {
  business: Business
}

export default async function Hours({ business }: HoursProps) {
  const t = await getTranslations('public')
  const days = [
    t('days.monday'),
    t('days.tuesday'),
    t('days.wednesday'),
    t('days.thursday'),
    t('days.friday'),
    t('days.saturday'),
    t('days.sunday'),
  ]

  return (
    <section className="border-b border-loom-border py-20">
      <div className="mx-auto w-full max-w-[1200px] px-6">
        <p className="section-label">{t('hoursLabel')}</p>
        <div className="mt-6 overflow-x-auto border border-loom-border bg-loom-white">
          <table className="w-full border-collapse text-left text-[0.938rem]">
            <thead>
              <tr className="border-b border-loom-border bg-loom-surface">
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('dayLabel')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('openLabel')}</th>
                <th className="px-4 py-3 text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{t('closeLabel')}</th>
              </tr>
            </thead>
            <tbody>
              {days.map((day) => (
                <tr key={day} className="border-b border-loom-border last:border-b-0">
                  <td className="px-4 py-3 text-loom-black">{day}</td>
                  <td className="px-4 py-3 font-mono text-sm text-loom-black">{business.opening_time}</td>
                  <td className="px-4 py-3 font-mono text-sm text-loom-black">{business.closing_time}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}
