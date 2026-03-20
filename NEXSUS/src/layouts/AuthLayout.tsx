import { Outlet } from 'react-router-dom'

export function AuthLayout() {
  return (
    <div className="min-h-dvh bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-black/[0.04] blur-3xl dark:bg-white/[0.05]" />
          <div className="absolute -bottom-28 right-[-7rem] h-72 w-72 rounded-full bg-black/[0.03] blur-3xl dark:bg-white/[0.04]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_55%)]" />
        </div>

        <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-6 py-10">
          <div className="motion-safe:animate-fade-up">
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  )
}
