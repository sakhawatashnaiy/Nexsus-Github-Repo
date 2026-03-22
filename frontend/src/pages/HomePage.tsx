import { Link } from 'react-router-dom'
import { Button } from '@/components/ui/Button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function HomePage() {
  return (
    <div className="min-h-dvh bg-[rgb(var(--bg))] text-[rgb(var(--fg))]">
      <div className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -top-24 left-1/2 h-80 w-[42rem] -translate-x-1/2 rounded-full bg-black/[0.04] blur-3xl dark:bg-white/[0.05]" />
          <div className="absolute -bottom-24 right-[-6rem] h-72 w-72 rounded-full bg-black/[0.03] blur-3xl dark:bg-white/[0.04]" />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(0,0,0,0.04),transparent_55%)] dark:bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.05),transparent_55%)]" />
        </div>

        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <header className="flex items-center justify-between gap-3">
            <div className="shrink-0 cursor-default select-none font-sans text-[30px] font-bold italic leading-none tracking-[0.18em] text-[rgb(var(--fg))] drop-shadow-sm motion-safe:animate-fade-in transition-transform duration-300 ease-out will-change-transform hover:-translate-y-0.5 hover:scale-[1.03] hover:animate-pop active:scale-[0.99]">
              NEXSUS
            </div>

            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="secondary" size="sm">
                  Login
                </Button>
              </Link>
              <Link to="/register">
                <Button size="sm">Create account</Button>
              </Link>
            </div>
          </header>

          <main className="mt-10 space-y-10">
            <section className="animate-fade-up rounded-2xl border border-[rgb(var(--border))] bg-black px-6 py-10 text-white shadow-sm sm:px-10">
              <div className="mx-auto max-w-3xl text-center space-y-5">
                <h1 className="text-[45px] italic leading-[1.04] font-bold tracking-tight">
                  NEXSUS Platform
                </h1>

                <p className="text-xl font-semibold italic leading-relaxed text-white">
                  Nexsus helps founders and investors collaborate with less friction: projects, documents,
                  meetings, and payments in a single, audit-friendly platform.
                </p>

                <div className="flex flex-wrap justify-center gap-2 pt-1">
                  <Link to="/register">
                    <Button size="lg">Create account</Button>
                  </Link>
                  <Link to="/login">
                    <Button size="lg" variant="secondary">
                      Sign in
                    </Button>
                  </Link>
                </div>
              </div>
            </section>

            <section className="grid gap-6 md:grid-cols-12 md:items-start">
              <div className="md:col-span-12">
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  <Card className="bg-black p-5 text-white hover:shadow">
                    <CardHeader className="px-0 py-0">
                      <CardTitle className="text-base font-bold italic sm:text-lg">Projects</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 pt-3">
                      <p className="text-base font-semibold italic leading-relaxed text-white">
                        Clear status, ownership, and updates that investors can scan in seconds.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="muted">Track</Badge>
                        <Badge variant="muted">Prioritize</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black p-5 text-white hover:shadow">
                    <CardHeader className="px-0 py-0">
                      <CardTitle className="text-base font-bold italic sm:text-lg">Documents</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 pt-3">
                      <p className="text-base font-semibold italic leading-relaxed text-white">
                        PDF preview, metadata, versions, and signature images — clean audit trail.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="muted">Vault</Badge>
                        <Badge variant="muted">Sign</Badge>
                      </div>
                    </CardContent>
                  </Card>

                  <Card className="bg-black p-5 text-white hover:shadow sm:col-span-2 lg:col-span-1">
                    <CardHeader className="px-0 py-0">
                      <CardTitle className="text-base font-bold italic sm:text-lg">Meetings + Payments</CardTitle>
                    </CardHeader>
                    <CardContent className="px-0 pb-0 pt-3">
                      <p className="text-base font-semibold italic leading-relaxed text-white">
                        Keep schedules and transactions connected to the same workspace context.
                      </p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="muted">Calendar</Badge>
                        <Badge variant="muted">History</Badge>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </section>

            <section className="grid gap-4 md:grid-cols-3">
              <Card className="bg-black text-white hover:shadow">
                <CardHeader>
                  <CardTitle className="text-base font-bold italic sm:text-lg">Investor-ready collaboration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-semibold italic leading-relaxed text-white">
                    Keep updates structured and progress visible—so investors see momentum, not noise.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black text-white hover:shadow">
                <CardHeader>
                  <CardTitle className="text-base font-bold italic sm:text-lg">Compliance-friendly history</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-semibold italic leading-relaxed text-white">
                    Versions, signatures, and metadata stay attached to each document for a clean trail.
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-black text-white hover:shadow">
                <CardHeader>
                  <CardTitle className="text-base font-bold italic sm:text-lg">Fewer tools, faster execution</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-base font-semibold italic leading-relaxed text-white">
                    Projects, docs, meetings, and payments together—so teams ship faster with less context switching.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="rounded-lg border border-[rgb(var(--border))] bg-black p-6 text-white shadow-sm">
              <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
                <div>
                  <div className="text-sm font-bold italic tracking-tight">Ready to start?</div>
                  <div className="mt-1 text-base font-semibold italic leading-relaxed text-white">
                    Create an account and set up your workspace in minutes.
                  </div>
                </div>
                <div className="flex flex-wrap gap-2">
                  <Link to="/register">
                    <Button>Create account</Button>
                  </Link>
                  <Link to="/login">
                    <Button variant="secondary">Sign in</Button>
                  </Link>
                </div>
              </div>
            </section>
          </main>

          <footer className="mt-12 border-t border-[rgb(var(--border))] pt-6 text-xs text-[rgb(var(--muted))]">
            © {new Date().getFullYear()} Nexsus
          </footer>
        </div>
      </div>
    </div>
  )
}
