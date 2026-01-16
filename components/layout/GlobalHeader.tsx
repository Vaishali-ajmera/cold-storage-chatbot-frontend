import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

interface GlobalHeaderProps {
  showBackButton?: boolean;
  onBackClick?: () => void;
  navItems?: {
    label: string;
    onClick: () => void;
  }[];
}

export const GlobalHeader: React.FC<GlobalHeaderProps> = ({
  showBackButton = false,
  onBackClick,
  navItems = [],
}) => {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleSignOut = () => {
    logout();
    navigate('/login');
  };

  return (
    <>
      <header className="px-6 py-4 z-50 sticky top-0 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            {/* {showBackButton && onBackClick && (
              <button 
                onClick={onBackClick}
                className="p-1 -ml-2 hover:bg-gray-100 rounded-full transition-colors"
              >
                <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
                </svg>
              </button>
            )} */}
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white text-xs">PG</div>
              <span className="text-lg font-bold tracking-tight text-gray-900">Potato Guru AI</span>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item, index) => (
              <button 
                key={index}
                onClick={item.onClick}
                className="text-sm font-medium text-gray-500 hover:text-emerald-600 transition-colors"
              >
                {item.label}
              </button>
            ))}
            <button 
              onClick={handleSignOut}
              className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors"
            >
              Sign Out
            </button>
          </div>

          {/* Mobile Hamburger */}
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            className="md:hidden p-2 hover:bg-black/5 rounded-full transition-all"
          >
            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>

          {/* Mobile Menu Overlay */}
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-[90]" onClick={() => setIsMenuOpen(false)} />
              <div className="menu-popover">
                {navItems.map((item, index) => (
                  <React.Fragment key={index}>
                    <button 
                      onClick={() => { setIsMenuOpen(false); item.onClick(); }}
                      className="menu-item"
                    >
                      {item.label}
                    </button>
                    {index < navItems.length - 1 && <div className="menu-divider" />}
                  </React.Fragment>
                ))}
                {navItems.length > 0 && <div className="menu-divider mx-4" />}
                <button 
                  onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                  className="menu-item"
                >
                  Sign Out
                </button>
              </div>
            </>
          )}
        </div>
      </header>
    </>
  );
};
