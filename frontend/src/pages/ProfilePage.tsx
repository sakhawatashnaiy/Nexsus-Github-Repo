
import { useAppSelector } from '@/app/hooks'
import { selectAccessToken, selectCurrentUser } from '@/features/auth/authSlice'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Badge } from '@/components/ui/Badge'

export function ProfilePage() {
  const user = useAppSelector(selectCurrentUser)
  const token = useAppSelector(selectAccessToken)

  return (
    <div className="space-y-8 motion-safe:animate-fade-up">
      <div>
        <h2 className="text-3xl font-bold italic tracking-tight">Profile</h2>
        <p className="mt-1 text-sm font-medium italic text-[rgb(var(--muted))]">Account details.</p>
      </div>

      <Card className="motion-safe:animate-fade-up">
        <CardHeader>
          <CardTitle className="text-base font-bold italic tracking-tight">Identity</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="text-sm">
            <div className="font-medium italic text-[rgb(var(--muted))]">Name</div>
            <div className="font-medium">{user?.name ?? '—'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium italic text-[rgb(var(--muted))]">Email</div>
            <div className="font-medium">{user?.email ?? '—'}</div>
          </div>
          <div className="text-sm">
            <div className="font-medium italic text-[rgb(var(--muted))]">Session</div>
            <div>
              <Badge variant="muted">{token ? 'Authenticated' : 'Not authenticated'}</Badge>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
