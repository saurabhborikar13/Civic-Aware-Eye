import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutGrid, FilePlus2, FileStack, Map, Award, Gift, User, Settings, LogOut, Landmark,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV = [
  { to: '/dashboard', label: 'Dashboard', icon: LayoutGrid },
  { to: '/report', label: 'File a Report', icon: FilePlus2 },
  { to: '/my-reports', label: 'My Reports', icon: FileStack },
  { to: '/map', label: 'Live Map', icon: Map },
  { to: '/achievements', label: 'Achievements', icon: Award },
  { to: '/rewards', label: 'Rewards', icon: Gift },
];

const NAV_BOTTOM = [
  { to: '/profile', label: 'Profile', icon: User },
  { to: '/settings', label: 'Settings', icon: Settings },
];

export default function DashboardShell({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const linkCls = ({ isActive }) =>
    `flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-semibold transition-colors ${
      isActive ? 'bg-ink text-paper' : 'text-ink/70 hover:bg-ink/5 hover:text-ink'
    }`;

  return (
    <div className="min-h-screen bg-paper md:flex">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-ink/10 bg-card px-4 py-6 md:flex">
        <div className="mb-8 flex items-center gap-2 px-2 font-display text-lg font-bold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-ink text-amber">
            <Landmark size={18} />
          </span>
          CivicSense
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkCls}>
              <item.icon size={17} /> {item.label}
            </NavLink>
          ))}
          <div className="my-3 h-px bg-ink/10" />
          {NAV_BOTTOM.map((item) => (
            <NavLink key={item.to} to={item.to} className={linkCls}>
              <item.icon size={17} /> {item.label}
            </NavLink>
          ))}
        </nav>
        <div className="mt-4 rounded-lg bg-paper-dim px-3 py-3">
          <p className="truncate text-sm font-bold text-ink">
            {user?.firstName} {user?.lastName}
          </p>
          <p className="truncate text-xs text-ink/50">{user?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-status-rejected hover:underline"
          >
            <LogOut size={13} /> Log out
          </button>
        </div>
      </aside>

      {/* Mobile top bar */}
      <div className="flex items-center justify-between border-b border-ink/10 bg-card px-4 py-3 md:hidden">
        <div className="flex items-center gap-2 font-display text-base font-bold text-ink">
          <Landmark size={18} className="text-amber" /> CivicSense
        </div>
        <button onClick={handleLogout} className="text-xs font-semibold text-status-rejected">
          Log out
        </button>
      </div>
      <nav className="flex justify-around border-b border-ink/10 bg-card py-2 md:hidden">
        {NAV.slice(0, 5).map((item) => (
          <NavLink key={item.to} to={item.to} className={({ isActive }) => `p-2 rounded-md ${isActive ? 'text-teal' : 'text-ink/50'}`}>
            <item.icon size={19} />
          </NavLink>
        ))}
      </nav>

      <main className="flex-1 px-5 py-6 md:px-10 md:py-8">{children}</main>
    </div>
  );
}
