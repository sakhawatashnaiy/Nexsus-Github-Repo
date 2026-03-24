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
      <div className="flex h-16 items-center justify-between gap-3 px-3 sm:h-14 sm:px-6">
        <div className="flex items-center gap-2">
          <Button variant="ghost" size="md" className="sm:hidden" onClick={onMenuClick}>
            <Menu className="h-5 w-5" />
          </Button>
          <div className="text-base font-extrabold italic tracking-[0.18em] sm:text-sm">
            <span className="font-serif">Nexsus</span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Dropdown
            trigger={
              <div
                className="relative inline-flex h-9 w-9 items-center justify-center rounded-md text-sm font-medium text-[rgb(var(--fg))] transition-all duration-150 ease-out hover:-translate-y-px hover:bg-black/5 active:translate-y-0 dark:hover:bg-white/5 sm:h-8 sm:w-8"
                aria-label="Notifications"
              >
                <Bell className="h-5 w-5 sm:h-4 sm:w-4" />
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

          <Button variant="ghost" size="md" aria-label="Toggle theme" onClick={toggleTheme}>
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          <Dropdown
            trigger={
              <div className="flex items-center gap-2 rounded-md border border-[rgb(var(--border))] bg-[rgb(var(--card))] px-2 py-2 text-base shadow-sm transition-shadow duration-150 ease-out hover:shadow sm:px-3 sm:py-2 sm:text-sm">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[rgb(var(--primary))] text-sm font-semibold text-[rgb(var(--primary-fg))] sm:h-7 sm:w-7 sm:text-xs">
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
