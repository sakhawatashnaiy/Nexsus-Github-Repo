import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'

export function SettingsPage() {
  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <div>
        <h2 className="text-3xl font-bold italic tracking-tight">Settings</h2>
        <p className="mt-1 text-sm font-medium italic text-[rgb(var(--muted))]">Workspace configuration.</p>
      </div>

      <Card className="motion-safe:animate-fade-up">
        <CardHeader>
          <CardTitle className="text-base font-bold italic tracking-tight">Preferences</CardTitle>
        </CardHeader>
        <CardContent className="text-sm font-medium italic text-[rgb(var(--muted))]">
          Theme is available from the top bar.
        </CardContent>
      </Card>
    </div>
  )
}
