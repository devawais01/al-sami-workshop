import { NavLink } from 'react-router-dom'
import { Users, Package, FileText } from 'lucide-react'
import { t } from '../lib/strings'

const items = [
  { to: '/', label: t.nav.workers, Icon: Users },
  { to: '/lot', label: t.nav.lots, Icon: Package },
  { to: '/hisaab', label: t.nav.report, Icon: FileText },
]

export default function Nav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-line bg-surface">
      <div className="mx-auto flex max-w-lg">
        {items.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex flex-1 flex-col items-center gap-0.5 py-3 text-xs ${
                isActive ? 'text-indigo' : 'text-muted'
              }`
            }
          >
            <Icon size={20} />
            {label}
          </NavLink>
        ))}
      </div>
    </nav>
  )
}