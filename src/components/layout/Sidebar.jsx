import { NavLink } from 'react-router-dom'
import Logo from '../ui/Logo.jsx'
import { navSections } from '../../config/navigation.js'

function linkClass({ isActive }) {
  return isActive ? 'admin-nav-link admin-nav-link--active' : 'admin-nav-link'
}

export default function Sidebar({ onNavigate }) {
  return (
    <aside className="border-line bg-paper flex h-full flex-col border-r">
      <div className="border-line border-b px-4 py-5">
        <Logo />
      </div>
      <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label="Admin navigation">
        {navSections.map((section) => (
          <div key={section.id} className="mb-6 last:mb-0">
            <p className="text-muted mb-2 px-3 text-[0.65rem] font-bold tracking-[0.12em] uppercase">
              {section.label}
            </p>
            <ul className="space-y-0.5">
              {section.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={linkClass}
                    onClick={onNavigate}
                  >
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}
