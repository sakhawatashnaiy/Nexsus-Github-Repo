import { NavLink } from 'react-router-dom'
import { CalendarDays, FileText, FolderKanban, LayoutDashboard, Settings, User } from 'lucide-react'
import { useAppSelector } from '@/app/hooks'
import { selectCurrentUser } from '@/features/auth/authSlice'
import { Badge } from '@/components/ui/Badge'
import { cn } from '@/utils/cn'

const linkBase =
  'flex items-center gap-2 rounded-md px-3 py-2 text-base font-medium text-[rgb(var(--muted))] transition-colors duration-150 ease-out hover:bg-black/5 hover:text-[rgb(var(--fg))] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--primary))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--card))] dark:hover:bg-white/5 sm:text-sm'

export function Sidebar({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
}) {
  return (
    <>
      <div className="hidden w-64 flex-shrink-0 border-r border-[rgb(var(--border))] bg-[rgb(var(--card))] sm:block">
        <SidebarContent />
      </div>

      {open ? (
        <div className="fixed inset-0 z-40 sm:hidden">
          <button
            aria-label="Close sidebar"
            className="absolute inset-0 animate-fade-in bg-black/40"
            onClick={() => onOpenChange(false)}
          />
          <div className="absolute left-0 top-0 h-full w-[85vw] max-w-[320px] animate-slide-in-left overflow-y-auto bg-[rgb(var(--card))] shadow-sm">
            <SidebarContent onNavigate={() => onOpenChange(false)} />
          </div>
        </div>
      ) : null}
    </>
  )
}

function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const user = useAppSelector(selectCurrentUser)
  const canAccessEntrepreneurFeatures = user?.role === 'entrepreneur' || user?.role === 'admin'

  return (
    <div className="flex h-full flex-col">
      <div className="border-b border-[rgb(var(--border))] px-4 py-4">
        <div className="text-sm font-extrabold italic tracking-wider text-[rgb(var(--muted))] sm:text-xs">
          NEXSUS
        </div>
        <div className="mt-1 flex items-center justify-between gap-2 text-base font-bold italic tracking-tight sm:text-sm">
          <div>Workspace</div>
          {user?.role ? (
            <Badge variant="muted" className="capitalize">
              {user.role}
            </Badge>
          ) : null}
        </div>
      </div>

      <nav className="flex flex-1 flex-col gap-1 p-2">
        <NavLink
          to="/dashboard"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(linkBase, isActive && 'bg-black/5 text-[rgb(var(--fg))] dark:bg-white/5')
          }
        >
          <LayoutDashboard className="h-4 w-4" />
          Dashboard
        </NavLink>

        {canAccessEntrepreneurFeatures ? (
          <NavLink
            to="/projects"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(linkBase, isActive && 'bg-black/5 text-[rgb(var(--fg))] dark:bg-white/5')
            }
          >
            <FolderKanban className="h-4 w-4" />
            Projects
          </NavLink>
        ) : null}

        <NavLink
          to="/meetings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(linkBase, isActive && 'bg-black/5 text-[rgb(var(--fg))] dark:bg-white/5')
          }
        >
          <CalendarDays className="h-4 w-4" />
          Meetings
        </NavLink>

        {canAccessEntrepreneurFeatures ? (
          <NavLink
            to="/documents"
            onClick={onNavigate}
            className={({ isActive }) =>
              cn(linkBase, isActive && 'bg-black/5 text-[rgb(var(--fg))] dark:bg-white/5')
            }
          >
            <FileText className="h-4 w-4" />
            Documents
          </NavLink>
        ) : null}

        <NavLink
          to="/profile"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(linkBase, isActive && 'bg-black/5 text-[rgb(var(--fg))] dark:bg-white/5')
          }
        >
          <User className="h-4 w-4" />
          Profile
        </NavLink>

        <NavLink
          to="/settings"
          onClick={onNavigate}
          className={({ isActive }) =>
            cn(linkBase, isActive && 'bg-black/5 text-[rgb(var(--fg))] dark:bg-white/5')
          }
        >
          <Settings className="h-4 w-4" />
          Settings
        </NavLink>
      </nav>

      <div className="border-t border-[rgb(var(--border))] p-4 text-xs text-[rgb(var(--muted))]">
        Nexus Platform
      </div>
    </div>
  )
}
