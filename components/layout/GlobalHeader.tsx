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

  const { user } = useAuth();
  const initials = user ? `${user.first_name?.[0] || ''}${user.last_name?.[0] || ''}`.toUpperCase() : 'U';

  return (
    <>
      <header className="px-6 py-4 z-50 sticky top-0 bg-white border-b border-gray-200">
        <div className="max-w-7xl mx-auto w-full flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <div 
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate('/dashboard')}
            >
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white text-sm shadow-lg shadow-emerald-100">PG</div>
              <span className="text-lg font-bold tracking-tight text-gray-900 hidden sm:block">Potato Guru AI</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Nav Items */}
            <div className="hidden md:flex items-center gap-6 mr-2">
              {navItems.map((item, index) => (
                <button 
                  key={index}
                  onClick={item.onClick}
                  className="text-sm font-semibold text-gray-500 hover:text-emerald-600 transition-colors"
                >
                  {item.label}
                </button>
              ))}
            </div>

            {/* Profile/Menu Button */}
            <div className="relative">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className={`flex items-center gap-2 p-1 pr-3 rounded-full border transition-all ${
                  isMenuOpen ? 'bg-gray-50 border-emerald-200 shadow-sm' : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-[11px] font-bold text-gray-600 border border-white">
                  {initials}
                </div>
                <div className="flex flex-col items-start hidden sm:flex">
                  <span className="text-[11px] font-bold text-gray-900 leading-tight">
                    {user?.first_name || 'My Account'}
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest leading-none">
                    Settings
                  </span>
                </div>
                <svg className={`w-4 h-4 text-gray-400 transition-transform duration-200 ${isMenuOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Menu Dropdown */}
              {isMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)} />
                  <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl border border-gray-100 shadow-xl shadow-gray-200/50 p-2 z-50 animate-zoom-in">
                    <div className="px-4 py-3 border-b border-gray-50 mb-1">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-0.5">Signed in as</p>
                      <p className="text-sm font-bold text-gray-900 truncate">{user?.email}</p>
                    </div>

                    <button 
                      onClick={() => { setIsMenuOpen(false); navigate('/profile'); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-all group"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 group-hover:bg-emerald-100 flex items-center justify-center transition-colors">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </div>
                      <span className="text-sm font-bold">Manage Profile</span>
                    </button>

                    {navItems.map((item, index) => (
                      <button 
                        key={index}
                        onClick={() => { setIsMenuOpen(false); item.onClick(); }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-emerald-50 text-gray-700 hover:text-emerald-700 transition-all md:hidden"
                      >
                         <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16m-7 6h7" />
                          </svg>
                        </div>
                        <span className="text-sm font-bold">{item.label}</span>
                      </button>
                    ))}

                    <div className="my-1 border-t border-gray-50" />
                    
                    <button 
                      onClick={() => { setIsMenuOpen(false); handleSignOut(); }}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-red-50 text-gray-700 hover:text-red-600 transition-all font-bold"
                    >
                      <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                        </svg>
                      </div>
                      <span className="text-sm">Sign Out</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </header>
    </>
  );
};
