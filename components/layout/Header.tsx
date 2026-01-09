import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface HeaderProps {
  currentView?: 'intake' | 'chat';
  onGoToIntake?: () => void;
  onGoToChats?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ 
  currentView, 
  onGoToIntake, 
  onGoToChats 
}) => {
  const { user, logout } = useAuth();

  return (
    <header className="bg-white/80 backdrop-blur-md sticky top-0 z-50 border-b border-gray-100 px-4 md:px-6 py-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 md:w-9 md:h-9 bg-emerald-600 rounded-xl flex items-center justify-center shadow-lg shadow-emerald-100">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h1 className="text-base md:text-lg font-bold text-gray-900 tracking-tight">Cold Storage Advisory</h1>
          </div>

          {/* Navigation Tabs - Hidden on mobile, moved to Bottom Nav */}
          {currentView && onGoToIntake && onGoToChats && (
            <div className="hidden md:flex items-center gap-1 ml-6 bg-gray-100 rounded-lg p-1">
              <button
                onClick={onGoToIntake}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                  currentView === 'intake'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Intake Form
              </button>
              <button
                onClick={onGoToChats}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition ${
                  currentView === 'chat'
                    ? 'bg-white text-gray-900 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                My Chats
              </button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3">
          <div className="hidden sm:block text-right">
            <p className="text-[10px] uppercase tracking-wider text-gray-400 font-bold">Account</p>
            <p className="text-xs font-semibold text-gray-900">{user?.email?.split('@')[0]}</p>
          </div>
          
          <button
            onClick={logout}
            className="p-2 md:px-3 md:py-1.5 text-xs font-medium text-gray-500 hover:text-gray-900 hover:bg-gray-50 rounded-xl transition border border-gray-100"
          >
            <span className="hidden md:inline">Logout</span>
            <svg className="w-5 h-5 md:hidden" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
          </button>
        </div>
      </div>
    </header>
  );
};

