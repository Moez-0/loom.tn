'use client'

import Link from 'next/link'
import { useState } from 'react'

type LandingMobileMenuProps = {
  productLabel: string
  solutionsLabel: string
  pricingLabel: string
  resourcesLabel: string
  contactLabel: string
  loginLabel: string
  startTrialLabel: string
}

export default function LandingMobileMenu({
  productLabel,
  solutionsLabel,
  pricingLabel,
  resourcesLabel,
  contactLabel,
  loginLabel,
  startTrialLabel,
}: LandingMobileMenuProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button
        type="button"
        className="flex h-10 w-10 items-center justify-center rounded-md border border-white/10 bg-[#111111] text-white transition hover:bg-zinc-800"
        aria-label="Open menu"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open ? (
        <div className="absolute right-0 top-12 z-50 w-[280px] rounded-xl border border-white/10 bg-[#0b0b0b] p-3 shadow-2xl">
          <div className="flex flex-col text-sm font-medium text-[#888888]">
            <a className="rounded-md px-3 py-2 transition hover:bg-[#111111] hover:text-white" href="#product" onClick={() => setOpen(false)}>
              {productLabel}
            </a>
            <a className="rounded-md px-3 py-2 transition hover:bg-[#111111] hover:text-white" href="#solutions" onClick={() => setOpen(false)}>
              {solutionsLabel}
            </a>
            <a className="rounded-md px-3 py-2 transition hover:bg-[#111111] hover:text-white" href="#pricing" onClick={() => setOpen(false)}>
              {pricingLabel}
            </a>
            <a className="rounded-md px-3 py-2 transition hover:bg-[#111111] hover:text-white" href="#resources" onClick={() => setOpen(false)}>
              {resourcesLabel}
            </a>
            <a className="rounded-md px-3 py-2 transition hover:bg-[#111111] hover:text-white" href="#contact" onClick={() => setOpen(false)}>
              {contactLabel}
            </a>
          </div>
          <div className="mt-3 grid gap-2 border-t border-white/10 pt-3">
            <Link
              className="rounded-md border border-white/15 px-4 py-2 text-center text-sm font-medium text-white"
              href="/auth/login"
              onClick={() => setOpen(false)}
            >
              {loginLabel}
            </Link>
            <Link
              className="rounded-md bg-[#0067b0] px-4 py-2 text-center text-sm font-semibold text-white transition hover:bg-blue-600"
              href="/auth/signup"
              onClick={() => setOpen(false)}
            >
              {startTrialLabel}
            </Link>
          </div>
        </div>
      ) : null}
    </div>
  )
}
