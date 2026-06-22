import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { ReactNode } from 'react';

// ─── Íconos SVG inline (sin dependencias extra) ───────────────────────────────

function IconDashboard() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

function IconTropels() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <circle cx="9" cy="8" r="3" />
      <circle cx="17" cy="10" r="2.5" />
      <path d="M3 20c0-3.314 2.686-5 6-5s6 1.686 6 5" />
      <path d="M17 15c1.657 0 3 1.12 3 3.333" />
    </svg>
  );
}

function IconSignals() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6 6 0 10-12 0v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}

function IconSectors() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <polygon points="12 2 22 8.5 22 15.5 12 22 2 15.5 2 8.5 12 2" />
      <line x1="12" y1="22" x2="12" y2="15.5" />
      <line x1="22" y1="8.5" x2="12" y2="15.5" />
      <line x1="2" y1="8.5" x2="12" y2="15.5" />
    </svg>
  );
}

function IconLogout() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
      <path d="M17 16l4-4m0 0l-4-4m4 4H7" />
      <path d="M9 20H5a2 2 0 01-2-2V6a2 2 0 012-2h4" />
    </svg>
  );
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard',  Icon: IconDashboard },
  { to: '/tropels',   label: 'Tropeles',   Icon: IconTropels   },
  { to: '/signals',   label: 'Señales',    Icon: IconSignals   },
  { to: '/sectors',   label: 'Sectores',   Icon: IconSectors   },
];

// ─── Sidebar ──────────────────────────────────────────────────────────────────

function Sidebar() {
  return (
    <aside className="flex h-screen w-56 flex-col bg-gray-900 border-r border-gray-800 shrink-0">
      {/* Logo */}
      <div className="flex items-center gap-2 px-5 py-5 border-b border-gray-800">
        <span className="text-xl font-bold text-emerald-400">TropelCare</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {NAV_ITEMS.map(({ to, label, Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-emerald-600/20 text-emerald-400'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`
            }
          >
            <Icon />
            {label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}

// ─── Topbar ───────────────────────────────────────────────────────────────────

function Topbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login', { replace: true });
  }

  return (
    <header className="flex h-14 items-center justify-between border-b border-gray-800 bg-gray-900 px-6 shrink-0">
      <p className="text-sm text-gray-400">
        Workspace{' '}
        <span className="font-semibold text-white">{user?.teamCode}</span>
      </p>

      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-300">{user?.displayName}</span>
        <button
          onClick={handleLogout}
          title="Cerrar sesión"
          className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm text-gray-400
                     hover:bg-gray-800 hover:text-red-400 transition-colors"
        >
          <IconLogout />
          <span>Salir</span>
        </button>
      </div>
    </header>
  );
}

// ─── Layout principal ─────────────────────────────────────────────────────────

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  return (
    <div className="flex h-screen bg-gray-950 text-white overflow-hidden">
      <Sidebar />

      <div className="flex flex-1 flex-col overflow-hidden">
        <Topbar />
        <main className="flex-1 overflow-y-auto p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
