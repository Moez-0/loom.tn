import Image from 'next/image'

type BrandSplashProps = {
  title?: string
  subtitle?: string
  fullScreen?: boolean
}

export default function BrandSplash({
  title = 'LOOM',
  subtitle = 'Loading your workspace... ',
  fullScreen = true,
}: BrandSplashProps) {
  return (
    <div className={fullScreen ? 'grid min-h-screen place-items-center bg-[#0b0b0b] px-4' : 'grid min-h-[50vh] place-items-center px-4'}>
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-[#111111]/70 p-8 text-center shadow-2xl backdrop-blur-xl">
        <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-xl border border-white/10 bg-[#0b0b0b]">
          <Image src="/loom-mark.svg" alt="Loom" width={28} height={28} priority />
        </div>

        <p className="text-lg font-bold tracking-tight text-white">{title}</p>
        <p className="mt-2 text-sm text-[#888888]">{subtitle}</p>

        <div className="mt-6 flex items-center justify-center gap-2">
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0067b0]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0067b0]/75 [animation-delay:120ms]" />
          <span className="h-2 w-2 animate-pulse rounded-full bg-[#0067b0]/50 [animation-delay:240ms]" />
        </div>
      </div>
    </div>
  )
}
