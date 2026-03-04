"use client"

import Link from 'next/link'
import { usePathname } from 'next/navigation'

type DashboardLink = {
  href: string
  label: string
}

type SidebarProps = {
  sectionLabel: string
  links: DashboardLink[]
}

export default function Sidebar({ sectionLabel, links }: SidebarProps) {
  const pathname = usePathname()

  return (
    <aside className="fixed left-0 top-0 hidden h-screen w-[256px] border-r border-loom-border bg-loom-off-white px-5 py-6 lg:block">
      <div className="mb-6 flex items-center justify-between px-1">
        <p className="text-xl font-bold tracking-tight text-loom-black">LOOM</p>
        <span className="rounded-md border border-loom-border bg-loom-surface px-2 py-1 text-[10px] uppercase tracking-widest text-loom-faint">
          Owner
        </span>
      </div>

      <div className="rounded-xl border border-loom-border bg-loom-surface px-4 py-4">
        <p className="text-[0.70rem] uppercase tracking-[0.12em] text-loom-faint">{sectionLabel}</p>
      </div>

      <nav className="mt-6 space-y-2">
        {links.map((link) => {
          const isActive = pathname === link.href || pathname.startsWith(`${link.href}/`)

          return (
            <Link key={link.href} href={link.href} className={`block rounded-md border px-4 py-3 text-[0.813rem] uppercase tracking-[0.06em] transition ${isActive ? 'border-loom-accent bg-loom-accent/15 text-white' : 'border-loom-border bg-loom-surface text-loom-muted hover:border-loom-accent hover:text-white'}`}>
              {link.label}
            </Link>
          )
        })}
      </nav>
    </aside>
  )
}
