import { useState } from 'react';

export type SmartVariPage =
  | 'home'
  | 'about'
  | 'contact'
  | 'help'
  | 'live-wari'
  | 'warkari'
  | 'dindi'
  | 'provider';

type SmartVariNavbarProps = {
  currentPage: SmartVariPage;
  onNavigate: (page: SmartVariPage) => void;
};

const navItems: Array<{ key: 'home' | 'about' | 'contact' | 'help'; label: string }> = [
  { key: 'home', label: 'Home' },
  { key: 'about', label: 'About Us' },
  { key: 'contact', label: 'Contact Us' },
  { key: 'help', label: 'Help' },
];

export default function SmartVariNavbar({ currentPage, onNavigate }: SmartVariNavbarProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (page: SmartVariPage) => {
    setIsMenuOpen(false);
    onNavigate(page);
  };

  return (
    <header className="smartvari-navbar">
      <div className="smartvari-navbar-inner">
        <button type="button" className="smartvari-brand" onClick={() => handleNavClick('home')}>
          <span className="smartvari-brand-mark">SW</span>
          <span className="smartvari-brand-text">SmartVari</span>
        </button>

        <nav className={`smartvari-nav ${isMenuOpen ? 'is-open' : ''}`} aria-label="Main navigation">
          {navItems.map((item) => {
            const isActive = currentPage === item.key;

            return (
              <button
                key={item.key}
                type="button"
                className={`smartvari-nav-link ${isActive ? 'active' : ''}`}
                onClick={() => handleNavClick(item.key)}
                aria-current={isActive ? 'page' : undefined}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        <button type="button" className="smartvari-login-button" onClick={() => handleNavClick('home')}>
          Login
        </button>

        <button
          type="button"
          className="smartvari-mobile-toggle"
          aria-label="Toggle navigation"
          onClick={() => setIsMenuOpen((open) => !open)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>
    </header>
  );
}
