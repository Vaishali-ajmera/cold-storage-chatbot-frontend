import React, { useState } from 'react';
import { MainLayout } from '../components/layout/MainLayout';
import { IntakeForm } from '../components/intake/IntakeForm';
import { ChatArea } from '../components/chat/ChatArea';

type DashboardView = 'intake' | 'chat';

export const Dashboard: React.FC = () => {
  const [currentView, setCurrentView] = useState<DashboardView>('intake');
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [suggestedQuestions, setSuggestedQuestions] = useState<string[]>([]);

  const handleIntakeComplete = (sessionId: string, questions: string[]) => {
    // Set the session ID from intake response
    setCurrentSessionId(sessionId);
    // Pass all suggested questions to chat
    setSuggestedQuestions(questions);
    setCurrentView('chat');
  };

  const handleSessionCreated = (sessionId: string) => {
    setCurrentSessionId(sessionId);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSessionId(sessionId);
    setSuggestedQuestions([]); // Clear suggestions when switching sessions
    setCurrentView('chat');
  };

  const handleGoToIntake = () => {
    setCurrentView('intake');
  };

  const handleGoToChats = () => {
    setCurrentView('chat');
  };

  const handleNewChat = () => {
    setCurrentSessionId(null);
    setSuggestedQuestions([]); // Clear suggestions for new chat
    setCurrentView('chat');
  };

  return (
    <MainLayout
      currentView={currentView}
      currentSessionId={currentSessionId}
      onSessionSelect={handleSessionSelect}
      onNewChat={handleNewChat}
      onGoToIntake={handleGoToIntake}
      onGoToChats={handleGoToChats}
    >
      {currentView === 'intake' && (
        <IntakeForm 
          onComplete={handleIntakeComplete} 
          onViewHistory={handleGoToChats} 
        />
      )}
      
      {currentView === 'chat' && (
        <ChatArea
          sessionId={currentSessionId}
          suggestedQuestions={suggestedQuestions}
          onSessionCreated={handleSessionCreated}
          onNewChatNeeded={handleNewChat}
          onGoToIntake={handleGoToIntake}
        />
      )}
    </MainLayout>
  );
};
