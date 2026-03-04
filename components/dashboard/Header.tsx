import LocaleSwitcher from '@/components/i18n/LocaleSwitcher'

type HeaderProps = {
  label: string
  locale: 'en' | 'fr' | 'ar'
}

export default function Header({ label, locale }: HeaderProps) {
  return (
    <header className="h-14 border-b border-loom-border bg-loom-surface">
      <div className="flex h-full items-center justify-between px-8">
        <p className="section-label">{label}</p>
        <LocaleSwitcher currentLocale={locale} />
      </div>
    </header>
  )
}
