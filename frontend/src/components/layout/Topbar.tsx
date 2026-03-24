import { Bell, Menu, Moon, Sun } from 'lucide-react'
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '@/app/hooks'
import { logout, selectCurrentUser } from '@/features/auth/authSlice'
import { Button } from '@/components/ui/Button'
import { Dropdown, DropdownItem } from '@/components/ui/Dropdown'
import { useTheme } from '@/hooks/useTheme'
import { useListMeetingsQuery } from '@/features/meetings/meetingsApi'

export function Topbar({ onMenuClick }: { onMenuClick: () => void }) {
  const user = useAppSelector(selectCurrentUser)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { theme, toggleTheme } = useTheme()
  const initial = user?.name?.trim()?.[0]?.toUpperCase() ?? 'A'

  const upcomingRange = useMemo(() => {
    const now = new Date()
    const to = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
    return { from: now.toISOString(), to: to.toISOString(), status: 'pending' as const }
  }, [])

  const { data: pendingMeetings } = useListMeetingsQuery(upcomingRange, { skip: !user })
  const pendingCount = pendingMeetings?.length ?? 0

  return (
    <header className="sticky top-0 z-30 border-b border-[rgb(var(--border))] bg-[rgb(var(--bg))]/80 backdrop-blur">
      <div className="flex h-14 items-center justify-between gap-3 px-3 sm:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm" className="sm:hidden" onClick={onMenuClick}>
            <Menu className="h-4 w-4" />
          </Button>
          <div className="text-sm font-semibold tracking-tight">Nexsus</div>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            trigger={
              <div
                className="relative inline-flex h-8 w-8 items-center justify-center rounded-md text-sm font-medium text-[rgb(var(--fg))] transition-all duration-150 ease-out hover:-translate-y-px hover:bg-black/5 active:translate-y-0 dark:hover:bg-white/5"
                aria-label="Notifications"
              >
                <Bell className="h-4 w-4" />
                {pendingCount > 0 ? (
                  <span className="absolute -right-1 -top-1 inline-flex min-w-4 items-center justify-center rounded-full bg-[rgb(var(--danger))] px-1 text-[10px] font-extrabold leading-4 text-[rgb(var(--danger-fg))] motion-safe:animate-pop">
                    {pendingCount > 99 ? '99+' : pendingCount}
                  </span>
                ) : null}
              </div>
            }
            align="right"
          >
            {pendingCount > 0 ? (
              <>
                <DropdownItem onClick={() => navigate('/meetings')}>
                  Pending meetings: {pendingCount}
                </DropdownItem>
                <DropdownItem className="text-[rgb(var(--muted))]" onClick={() => navigate('/meetings')}>
                  View calendar
                </DropdownItem>
              </>
            ) : (
              <div className="px-3 py-2 text-sm font-medium text-[rgb(var(--muted))]">
                You’re all caught up.
              </div>
            )}
          </Dropdown>

          <Button variant="ghost" size="sm" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          <Dropdown
            trigger={
              <div className="flex items-center gap-2 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-2 py-1.5 text-sm shadow-sm transition-shadow duration-150 ease-out hover:shadow sm:px-3 sm:py-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-xs font-semibold text-[rgb(var(--primary-fg))]">
                  {initial}
                </div>
                <div className="hidden max-w-[10rem] truncate sm:block">
                  {user?.name ?? 'Account'}
                </div>
              </div>
            }
          >
            <DropdownItem onClick={() => navigate('/profile')}>Profile</DropdownItem>
            <DropdownItem onClick={() => navigate('/settings')}>Settings</DropdownItem>
            <DropdownItem
              className="text-[rgb(var(--danger))]"
              onClick={() => {
                dispatch(logout())
                navigate('/login', { replace: true })
              }}
            >
              Logout
            </DropdownItem>
          </Dropdown>
        </div>
      </div>
    </header>
  )
}
