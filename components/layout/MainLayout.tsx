import React, { ReactNode } from 'react';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';

interface MainLayoutProps {
  children: ReactNode;
  currentView: 'intake' | 'chat';
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
  onGoToIntake: () => void;
  onGoToChats: () => void;
}

export const MainLayout: React.FC<MainLayoutProps> = ({
  children,
}) => {
  return (
    <div className="h-screen flex flex-col bg-[#FBFBFA] overflow-hidden">
      <div className="flex-1 flex overflow-hidden relative">
        <main className="flex-1 overflow-hidden h-full">
          {children}
        </main>
      </div>
    </div>
  );
};

