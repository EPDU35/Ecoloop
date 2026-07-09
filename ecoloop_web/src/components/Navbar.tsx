import React from 'react';
import './dashboard.css';

const SearchIcon = () => (
  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="11" cy="11" r="8" />
    <path d="M21 21l-4.35-4.35" />
  </svg>
);

const BellIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M18 8a6 6 0 10-12 0c0 7-3 9-3 9h18s-3-2-3-9" />
    <path d="M13.73 21a2 2 0 01-3.46 0" />
  </svg>
);

const MenuIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 7h16M4 12h16M4 17h16" />
  </svg>
);

type NavbarProps = {
  title: string;
  searchOpen: boolean;
  onToggleSearch: () => void;
  onOpenSidebar: () => void;
  hasNotifications?: boolean;
};

export default function Navbar({
  title,
  searchOpen,
  onToggleSearch,
  onOpenSidebar,
  hasNotifications = true,
}: NavbarProps) {
  return (
    <header className="el-topbar">
      <button className="el-hamburger" type="button" aria-label="Ouvrir le menu" onClick={onOpenSidebar}>
        <MenuIcon />
      </button>

      <div className="el-topbar-title">{title}</div>

      <div className={`el-search${searchOpen ? ' open' : ''}`}>
        <SearchIcon />
        <input type="text" placeholder="Rechercher un lot, un fournisseur..." />
      </div>

      <div className="el-topbar-actions">
        <button className="el-icon-btn el-search-toggle" type="button" onClick={onToggleSearch} aria-label="Rechercher">
          <SearchIcon />
        </button>
        <button className="el-icon-btn" type="button" aria-label="Notifications">
          <BellIcon />
          {hasNotifications && <span className="badge" />}
        </button>
      </div>
    </header>
  );
}
