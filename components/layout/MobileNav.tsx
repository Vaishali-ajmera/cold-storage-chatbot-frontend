import React from 'react';

interface MobileNavProps {
  currentView: 'intake' | 'chat';
  onGoToIntake: () => void;
  onGoToChats: () => void;
  onNewChat: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  currentView,
  onGoToIntake,
  onGoToChats,
  onNewChat
}) => {
  return (
    <nav className="md:hidden sticky bottom-0 left-0 right-0 bg-white/80 backdrop-blur-lg border-t border-gray-100 px-6 py-3 safe-bottom z-50">
      <div className="flex items-center justify-between max-w-lg mx-auto">
        <button
          onClick={onGoToIntake}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'intake' ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <span className="text-[10px] font-medium">Intake</span>
        </button>

        <button
          onClick={onNewChat}
          className="relative -top-6 flex items-center justify-center w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg shadow-emerald-200 active:scale-95 transition"
        >
          <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
        </button>

        <button
          onClick={onGoToChats}
          className={`flex flex-col items-center gap-1 transition ${
            currentView === 'chat' ? 'text-emerald-600' : 'text-gray-400'
          }`}
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
          <span className="text-[10px] font-medium">Chats</span>
        </button>
      </div>
    </nav>
  );
};
