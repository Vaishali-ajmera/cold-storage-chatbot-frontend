import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { chatAPI, ChatMessage } from '../../api/chat.api';
import { MessageBubble } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { IntakeDetailsModal } from './IntakeDetailsModal';
import { SuggestedQuestions } from '../intake/SuggestedQuestions';

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
  const navigate = useNavigate();
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
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [sessions, setSessions] = useState<any[]>([]);
  const [isLoadingSessions, setIsLoadingSessions] = useState(false);
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
  }, [messages]);

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
        message_text: response.data.response_message,
        message_type: 'response',
        suggested_questions: response.data.suggestions,
        mcq_options: null,
        mcq_selected_option: null,
        created_at: new Date().toISOString(),
      };

      setMessages(prev => [...prev, botMessage]);

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

  const MenuOverlay = () => (
    <>
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsMenuOpen(false)} />
          <div className="menu-popover">
            {sessionId && (
              <>
                <button 
                  onClick={() => { setIsMenuOpen(false); onNewChatNeeded(); }}
                  className="menu-item"
                >
                  Chat List
                </button>
                <div className="menu-divider mx-3" />
              </>
            )}
            <button 
              onClick={() => { setIsMenuOpen(false); onGoToIntake(); }} 
              className="menu-item"
            >
              Intake Form
            </button>
            <div className="menu-divider mx-3" />
            <button 
              onClick={() => { setIsMenuOpen(false); /* logout etc via context? */ navigate('/login'); }}
              className="menu-item"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );

  // Chat List View
  if (!sessionId) {
    return (
      <div className="immersive-layout animate-fade-in relative flex flex-col h-full bg-[#FBFBFA]">
        <header className="px-6 py-4 border-b border-gray-100 z-50 bg-white">
          <div className="w-full flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white text-[10px]">PG</div>
              <span className="text-base font-black tracking-tighter text-gray-900">Potato Guru AI</span>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-black/5 rounded-full transition-all">
              <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <MenuOverlay />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 py-8">
          <div className="max-w-xl mx-auto">
            <div className="flex items-center justify-between mb-8">
              <h1 className="text-2xl font-bold text-gray-900">Chats</h1>
              <button 
                onClick={onNewChatNeeded}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-full text-sm font-bold shadow-sm active:scale-95 transition-all"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M12 4v16m8-8H4" />
                </svg>
                New Chat
              </button>
            </div>

            {isLoadingSessions ? (
              <div className="space-y-4">
                {[1, 2, 3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-2xl animate-pulse" />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div className="text-center py-20">
                <p className="text-gray-400 font-medium">No previous chats found</p>
              </div>
            ) : (
              <div className="space-y-1">
                {sessions.map((session) => (
                  <div 
                    key={session.id}
                    onClick={() => onSessionCreated(session.id)} // Parent handles session select
                    className="chat-list-item bg-white rounded-2xl mb-3 border border-gray-50 shadow-sm"
                  >
                    <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                      <svg className="w-6 h-6 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                      </svg>
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <h3 className="font-bold text-gray-900 truncate">{session.title || 'Previous Consultation'}</h3>
                        <span className="text-[10px] text-gray-400 font-medium whitespace-nowrap ml-2">
                          {new Date(session.started_at).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500 truncate">Stored details: {session.status === 'limit_reached' ? 'Completed' : 'Active conversation'}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Main Render (Individual Chat)
  return (
    <div className="immersive-layout animate-fade-in relative flex flex-col h-full bg-[#FBFBFA]">
      <header className="px-6 py-4 border-b border-gray-100 z-50 bg-white">
        <div className="w-full flex items-center justify-between relative">
          <div className="flex items-center gap-3">
            <button 
              onClick={onNewChatNeeded} // Goes back to list
              className="p-1 -ml-2 hover:bg-black/5 rounded-full transition-all"
            >
              <svg className="w-5 h-5 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white text-[10px]">PG</div>
              <span className="text-base font-black tracking-tighter text-gray-900">Chat</span>
            </div>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <MenuOverlay />
        </div>
      </header>

      {/* Messages Area */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto chat-scroll-area px-4 md:px-6 pt-6 space-y-6 bg-white"
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
              <svg className="w-4 h-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
              </svg>
            </div>
          )}

          {messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              onSuggestionClick={handleSendMessage}
              onMCQSelect={handleMCQSelect}
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

