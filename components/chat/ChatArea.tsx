import React, { useState, useEffect, useRef } from 'react';
import { chatAPI, ChatMessage } from '../../api/chat.api';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { IntakeDetailsModal } from './IntakeDetailsModal';
import { GlobalHeader } from '../layout/GlobalHeader';

interface ChatAreaProps {
  sessionId: string | null;
  suggestedQuestions: string[];
  onSessionCreated: (sessionId: string) => void;
  onNewChatNeeded: () => void;
  onGoToIntake: () => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  sessionId,
  suggestedQuestions,
  onSessionCreated,
  onNewChatNeeded,
  onGoToIntake,
}) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [remainingQuestions, setRemainingQuestions] = useState(4);
  const [canAskQuestion, setCanAskQuestion] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [waitingForMCQ, setWaitingForMCQ] = useState(false);
  const [currentMCQMessageId, setCurrentMCQMessageId] = useState<string | null>(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [intakeData, setIntakeData] = useState<any>(null);
  const [userChoice, setUserChoice] = useState<string>('');
  const [isLoadingIntake, setIsLoadingIntake] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
  const [isCreatingSession, setIsCreatingSession] = useState(false);
  const [welcomeMessage, setWelcomeMessage] = useState<string>('');
  const [displayedWelcome, setDisplayedWelcome] = useState<string>('');
  const [isWelcomeTyping, setIsWelcomeTyping] = useState(false);
  const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    if (sessionId) {
      loadChatHistory(sessionId);
      loadIntakePreview(sessionId);
    } else {
      setMessages([]);
      setRemainingQuestions(4);
      setCanAskQuestion(true);
      setWelcomeMessage('');
      setDisplayedWelcome('');
      setIsWelcomeTyping(false);
      fetchSessions();
    }
  }, [sessionId]);

  const fetchSessions = async () => {
    setIsLoadingSessions(true);
    try {
      const response = await chatAPI.listSessions();
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to fetch sessions:', error);
    } finally {
      setIsLoadingSessions(false);
    }
  };

  // Typing effect for welcome message
  useEffect(() => {
    if (welcomeMessage && isWelcomeTyping) {
      if (displayedWelcome.length < welcomeMessage.length) {
        const timeout = setTimeout(() => {
          setDisplayedWelcome(welcomeMessage.slice(0, displayedWelcome.length + 1));
        }, 20); // Speed of typing (20ms per character)
        return () => clearTimeout(timeout);
      } else {
        setIsWelcomeTyping(false);
      }
    }
  }, [welcomeMessage, displayedWelcome, isWelcomeTyping]);

  // Handle creating a new chat session
  const handleCreateNewSession = async () => {
    setIsCreatingSession(true);
    try {
      const response = await chatAPI.createSession();
      const newSessionId = response.data.session_id;
      const welcome = response.data.welcome_message || "Hello! I'm Potato Guru, your expert advisor for cold storage. How can I help you today?";
      
      // Set welcome message and start typing effect
      setWelcomeMessage(welcome);
      setDisplayedWelcome('');
      setIsWelcomeTyping(true);
      
      // Navigate to the new session
      onSessionCreated(newSessionId);
    } catch (error) {
      console.error('Failed to create session:', error);
    } finally {
      setIsCreatingSession(false);
    }
  };

  const loadIntakePreview = async (sid: string) => {
    try {
      const response = await chatAPI.getSessionIntake(sid);
      setIntakeData(response.data.intake.intake_data);
      setUserChoice(response.data.intake.user_choice);
    } catch (error) {
      console.error('Failed to load intake preview:', error);
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, displayedWelcome]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const loadChatHistory = async (sid: string) => {
    setIsLoading(true);
    try {
      const response = await chatAPI.getChatHistory(sid);
      setMessages(response.data.messages);
      setRemainingQuestions(response.data.session.remaining_questions);
      setCanAskQuestion(response.data.session.can_ask_question);

      // Check if waiting for MCQ response
      const lastMessage = response.data.messages[response.data.messages.length - 1];
      if (lastMessage?.mcq_options && !lastMessage.mcq_selected_option) {
        setWaitingForMCQ(true);
        setCurrentMCQMessageId(lastMessage.id);
      }
    } catch (error) {
      console.error('Failed to load chat history:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (question: string) => {
    if (!canAskQuestion || waitingForMCQ) return;

    // Add user message optimistically
    const tempUserMessage: ChatMessage = {
      id: `temp-${Date.now()}`,
      sequence_number: messages.length + 1,
      sender: 'user',
      message_text: question,
      message_type: 'question',
      suggested_questions: null,
      mcq_options: null,
      mcq_selected_option: null,
      created_at: new Date().toISOString(),
    };

    setMessages(prev => [...prev, tempUserMessage]);
    setIsLoading(true);

    try {
      const response = await chatAPI.askQuestion(question, sessionId);
      
      // If new session created, notify parent
      if (!sessionId && response.data?.session_id) {
        onSessionCreated(response.data.session_id);
      }

      if (response.data) {
        // Update remaining questions
        setRemainingQuestions(response.data.remaining_questions);

        // Add bot response
        const botMessage: ChatMessage = {
          id: response.data.mcq_message_id || `bot-${Date.now()}`,
          sequence_number: messages.length + 2,
          sender: 'bot',
          message_text: response.data.response_message,
          message_type: 'response',
          suggested_questions: response.data.suggestions,
          mcq_options: response.data.mcq,
          mcq_selected_option: null,
          created_at: new Date().toISOString(),
        };

        setMessages(prev => [...prev.slice(0, -1), tempUserMessage, botMessage]);
        
        // Start typing effect for the new bot message
        setTypingMessageId(botMessage.id);

        // Check if MCQ
        if (response.data.type === 'mcq' && response.data.mcq_message_id) {
          setWaitingForMCQ(true);
          setCurrentMCQMessageId(response.data.mcq_message_id);
        }

        // Check if limit reached
        if (response.data.remaining_questions === 0) {
          setCanAskQuestion(false);
        }
      }
    } catch (error: any) {
      console.error('Failed to send message:', error);
      
      // Check if limit reached error
      if (error.response?.data?.message?.includes('maximum')) {
        setCanAskQuestion(false);
        setRemainingQuestions(0);
      }
      
      // Remove optimistic message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setIsLoading(false);
    }
  };

  const handleMCQSelect = async (messageId: string, selectedValue: string) => {
    if (!currentMCQMessageId) return;

    // Update message to show selection
    setMessages(prev =>
      prev.map(msg =>
        msg.id === messageId
          ? { ...msg, mcq_selected_option: selectedValue }
          : msg
      )
    );

    setIsLoading(true);
    setWaitingForMCQ(false);

    try {
      const response = await chatAPI.answerMCQ(currentMCQMessageId, selectedValue);
      
      setRemainingQuestions(response.data.remaining_questions);
      setCurrentMCQMessageId(null);

      // Add bot follow-up response
      const botMessage: ChatMessage = {
        id: `bot-${Date.now()}`,
        sequence_number: messages.length + 1,
        sender: 'bot',
        message_text: response.data.message,
        message_type: 'response',
        suggested_questions: response.data.suggestions,
        mcq_options: null,
        mcq_selected_option: null,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);
      
      // Start typing effect for the new bot message
      setTypingMessageId(botMessage.id);

      if (response.data.remaining_questions === 0) {
        setCanAskQuestion(false);
      }
    } catch (error) {
      console.error('Failed to submit MCQ response:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleViewIntake = async () => {
    if (!sessionId) return;

    setIsLoadingIntake(true);
    try {
      const response = await chatAPI.getSessionIntake(sessionId);
      setIntakeData(response.data.intake.intake_data);
      setUserChoice(response.data.intake.user_choice);
      setShowIntakeModal(true);
    } catch (error) {
      console.error('Failed to load intake data:', error);
    } finally {
      setIsLoadingIntake(false);
    }
  };

  // Chat List View
  if (!sessionId) {
    return (
      <div className="immersive-layout animate-fade-in relative flex flex-col h-full bg-transparent">
        <GlobalHeader 
          navItems={[
            { label: 'Intake Form', onClick: onGoToIntake }
          ]}
        />

        <div className="flex-1 overflow-y-auto px-6 py-6">
          <div className="max-w-lg mx-auto">
            {/* Header with New Chat Button */}
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h1 className="text-xl font-bold text-gray-900">Chats</h1>
                <p className="text-sm text-gray-500">Ask Potato Guru anything about storage</p>
              </div>
              
              {/* New Chat Button - Desktop only */}
              <button
                onClick={handleCreateNewSession}
                disabled={isCreatingSession}
                className="hidden md:flex items-center gap-2 px-4 py-2.5 bg-emerald-600 text-white rounded-full hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 shadow-md disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
              >
                {isCreatingSession ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                  </svg>
                )}
                <span className="text-sm font-semibold">{isCreatingSession ? 'Creating...' : 'New Chat'}</span>
              </button>
            </div>

            {isLoadingSessions ? (
              <div className="space-y-3">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-16 bg-white border border-gray-200 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="py-16 text-center">
                <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                  <svg className="w-7 h-7 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <h3 className="text-gray-900 font-medium mb-1">No conversations yet</h3>
                <p className="text-sm text-gray-500 md:hidden">Tap the button below to start your first chat</p>
                <p className="text-sm text-gray-500 hidden md:block">Click the button above to start your first chat</p>
              </div>
            ) : (
              <div className="space-y-2">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => onSessionCreated(session.id)}
                    className="selection-card"
                  >
                    <div className="w-10 h-10 bg-emerald-50 rounded-full flex items-center justify-center shrink-0">
                      <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="truncate text-sm font-medium text-gray-900">{session.title || 'Consultation'}</h3>
                      <p className="text-xs text-gray-400">
                        {new Date(session.started_at).toLocaleDateString()}
                      </p>
                    </div>
                    <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Floating Action Button - Mobile only */}
        <button 
          onClick={handleCreateNewSession}
          disabled={isCreatingSession}
          className="md:hidden fixed bottom-6 right-6 w-14 h-14 bg-emerald-600 text-white rounded-full shadow-lg hover:bg-emerald-700 transition-all hover:scale-105 active:scale-95 flex items-center justify-center z-50 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
          title="New Chat"
        >
          {isCreatingSession ? (
            <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
            </svg>
          )}
        </button>
      </div>
    );
  }

  return (
    <div className="immersive-layout animate-fade-in relative flex flex-col h-full bg-transparent">
      <GlobalHeader 
        showBackButton={true}
        onBackClick={onNewChatNeeded}
        navItems={[
          { label: 'Chat List', onClick: onNewChatNeeded },
          { label: 'Intake Form', onClick: onGoToIntake }
        ]}
      />

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scroll-area px-4 md:px-6 pt-6 space-y-8 bg-transparent"
      >
        {!canAskQuestion && remainingQuestions === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 px-6 text-center animate-fade-in">
            <div className="w-16 h-16 bg-yellow-50 rounded-2xl flex items-center justify-center mb-4 shadow-sm">
              <svg className="w-8 h-8 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Maximum limit reached</h3>
            <p className="text-sm text-gray-500 max-w-xs mb-8">
              This session has reached its limit of 4 questions. You can start a new consultation anytime.
            </p>
            {messages.map((message) => (
              <MessageBubble
                key={message.id}
                message={message}
                onSuggestionClick={handleSendMessage}
                onMCQSelect={handleMCQSelect}
              />
            ))}
            <div ref={messagesEndRef} className="h-32" />
          </div>
        ) : sessionId ? (
          <div className="max-w-4xl mx-auto w-full pb-32">
          {intakeData && (
            <div 
              onClick={handleViewIntake}
              className="intake-summary-card animate-slide-up"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-emerald-50 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <h4 className="text-sm font-bold text-gray-900">Intake Summary</h4>
                  <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Tap to view details</p>
                </div>
              </div>
            </div>
          )}

          {/* Welcome Message with Typing Effect */}
          {welcomeMessage && messages.length === 0 && (
            <div className="flex w-full mb-8 justify-start animate-fade-in">
              <div className="flex gap-3 max-w-[85%] md:max-w-[75%] flex-row">
                {/* Bot Avatar */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/50 bg-emerald-600">
                  <span className="text-[9px] font-black text-white">PG</span>
                </div>
                
                {/* Welcome Message Bubble */}
                <div className="flex flex-col items-start">
                  <div className="px-4 py-3 bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm shadow-sm">
                    <div className="text-sm leading-relaxed">
                      {displayedWelcome}
                      {isWelcomeTyping && (
                        <span className="inline-block w-0.5 h-4 bg-emerald-600 ml-0.5 animate-pulse" />
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSuggestionClick={handleSendMessage}
              onMCQSelect={handleMCQSelect}
              isTyping={message.id === typingMessageId && message.sender === 'bot'}
              onTypingComplete={() => setTypingMessageId(null)}
            />
          ))}

            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start mb-6 animate-fade-in">
                <div className="bg-gray-50 border border-gray-100 rounded-2xl px-5 py-3 shadow-sm">
                  <div className="flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce" />
                    <span className="ml-2 text-[10px] font-bold text-gray-400 uppercase tracking-widest">Assistant is thinking</span>
                  </div>
                </div>
              </div>
            )}

            {/* Starting Suggestions */}
            {suggestedQuestions.length > 0 && messages.length < 2 && !isLoading && (
              <div className="mt-8 animate-slide-in-bottom">
                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3 pl-1">Starting suggestions</p>
                <div className="flex flex-wrap gap-2">
                  {suggestedQuestions.map((question, index) => (
                    <button
                      key={index}
                      onClick={() => handleSendMessage(question)}
                      className="px-4 py-2 bg-white border border-emerald-100 text-emerald-700 rounded-full text-sm font-semibold hover:border-emerald-500 hover:bg-emerald-50 transition-all shadow-sm active:scale-95"
                    >
                      {question}
                    </button>
                  ))}
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>
        ) : (
          <div className="h-full flex flex-col items-center justify-center p-8 text-center max-w-sm mx-auto">
            <div className="w-20 h-20 bg-emerald-50 rounded-3xl flex items-center justify-center mb-6 shadow-inner animate-fade-in">
              <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Expert Consultation</h3>
            <p className="text-sm font-medium text-gray-500 leading-relaxed mb-8">
              Start a new conversation to optimize your cold storage strategy with our AI expert.
            </p>
            <button
              onClick={onNewChatNeeded}
              className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-200 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
              </svg>
              Start New Chat
            </button>
          </div>
        )}
      </div>

      {/* Floating Input Area */}
      <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-white via-white to-transparent pt-12 pb-2 md:pb-4 z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto">
          <ChatInput
            onSend={handleSendMessage}
            disabled={waitingForMCQ || (!canAskQuestion && remainingQuestions === 0)}
            remainingQuestions={remainingQuestions}
            isLoading={isLoading}
          />
        </div>
      </div>

      <IntakeDetailsModal
        isOpen={showIntakeModal}
        onClose={() => setShowIntakeModal(false)}
        intakeData={intakeData}
        userChoice={userChoice}
      />
    </div>
  );
};

