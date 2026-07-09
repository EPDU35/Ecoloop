import { Link } from 'react-router-dom';

export type NavItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
};

export type SidebarUser = {
  name: string;
  role: string;
};

export const DashboardIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <rect x="3" y="3" width="7" height="7" /><rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" /><rect x="3" y="14" width="7" height="7" />
  </svg>
);
export const MarketplaceIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M3 3h18M3 9h18M5 3l1 6M19 3l-1 6M4 9v11a1 1 0 001 1h14a1 1 0 001-1V9" />
  </svg>
);
export const SuppliersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <circle cx="9" cy="8" r="3" /><path d="M2 20c0-3.3 3-6 7-6s7 2.7 7 6" />
    <circle cx="17" cy="7" r="2.5" /><path d="M15.5 12.3c2.6.5 4.5 2.5 4.5 5.2" />
  </svg>
);
export const ContractsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M8 3h8l4 4v14H4V3z" /><path d="M8 12h8M8 16h5" />
  </svg>
);
export const OrdersIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M6 2l1.5 3h9L18 2" /><path d="M4 6h16l-1.5 13a2 2 0 01-2 2h-9a2 2 0 01-2-2L4 6z" />
  </svg>
);
export const ReportsIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
    <path d="M4 19V6M10 19V3M16 19v-9M22 19H2" />
  </svg>
);

function initials(name: string) {
  return name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

type SidebarProps = {
  items: NavItem[];
  activeKey: string;
  onSelect: (key: string) => void;
  user: SidebarUser;
  open: boolean;
  onClose: () => void;
};

export default function Sidebar({ items, activeKey, onSelect, user, open, onClose }: SidebarProps) {
  const handleSelect = (key: string) => {
    onSelect(key);
    onClose();
  };

  return (
    <>
      <div className={`el-sidebar-backdrop${open ? ' open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside className={`el-sidebar${open ? ' open' : ''}`}>
        <Link to="/" className="el-sidebar-brand" style={{ textDecoration: 'none', color: 'inherit' }}>
          <span className="dot" aria-hidden="true" />
          EcoLoop
        </Link>

        <div>
          <div className="el-sidebar-section-label">Menu</div>
          <nav className="el-nav">
            {items.map((item) => (
              <button
                key={item.key}
                type="button"
                className={`el-nav-item${item.key === activeKey ? ' active' : ''}`}
                onClick={() => handleSelect(item.key)}
                aria-current={item.key === activeKey ? 'page' : undefined}
              >
                <span aria-hidden="true" style={{ display: 'inline-flex', alignItems: 'center' }}>
                  {item.icon}
                </span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="el-sidebar-footer">
          <div className="el-avatar" aria-hidden="true">{initials(user.name)}</div>
          <div className="el-sidebar-footer-text">
            <div className="el-sidebar-footer-name">{user.name}</div>
            <div className="el-sidebar-footer-role">{user.role}</div>
          </div>
        </div>
      </aside>
    </>
  );
}
