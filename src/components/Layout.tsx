import { NavLink, Outlet } from 'react-router-dom'
import {
  Users,
  UsersRound,
  ShieldCheck,
  ScrollText,
  Activity,
} from 'lucide-react'
import { cn } from '@/lib/utils'

const navItems = [
  { to: '/users', label: 'User Directory', icon: Users },
  { to: '/groups', label: 'Group Directory', icon: UsersRound },
  { to: '/campaigns', label: 'Certification Campaigns', icon: ShieldCheck },
  { to: '/audit', label: 'Audit Log', icon: ScrollText },
  { to: '/events', label: 'Provisioning Events', icon: Activity },
]

export function Layout() {
  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 border-r bg-white flex flex-col">
        <div className="px-6 py-5 border-b">
          <h1 className="text-lg font-bold text-gray-900">SCIM Dashboard</h1>
          <p className="text-xs text-gray-500 mt-0.5">Identity Provisioning</p>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-blue-50 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                )
              }
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>
        <div className="px-6 py-4 border-t text-xs text-gray-400">
          SCIM 2.0 · RFC 7643 / 7644
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  )
}
