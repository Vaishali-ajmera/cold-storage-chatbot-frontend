import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ChatMessage as ChatMessageType } from '../../api/chat.api';
import { formatTimestamp } from '../../utils/dateFormatter';

interface MessageBubbleProps {
  message: ChatMessageType;
  onSuggestionClick?: (question: string) => void;
  onMCQSelect?: (messageId: string, option: string) => void;
  isTyping?: boolean;
  onTypingComplete?: () => void;
}

// Preprocess markdown text to ensure proper rendering
const preprocessMarkdown = (text: string): string => {
  if (!text) return '';
  
  // Unescape common escaped markdown characters
  let processed = text
    .replace(/\\\*\\\*/g, '**')  // Unescape bold
    .replace(/\\\*/g, '*')        // Unescape italic/list
    .replace(/\\#/g, '#')         // Unescape headers
    .replace(/\\_/g, '_')         // Unescape underscores
    .replace(/\\`/g, '`');        // Unescape code
  
  // Handle inline bullet points - convert "• " to proper markdown list items
  // First, convert inline bullets (after ":" or "." followed by "•") to proper line breaks
  processed = processed.replace(/([.:])\s*•\s*/g, '$1\n\n• ');
  // Convert remaining inline bullets to line breaks
  processed = processed.replace(/\s+•\s+/g, '\n\n• ');
  // Convert bullet character to markdown asterisk for proper rendering
  processed = processed.replace(/^•\s*/gm, '* ');
  processed = processed.replace(/\n•\s*/g, '\n* ');
  
  // Ensure proper line breaks for lists (need blank line before list)
  processed = processed.replace(/([^\n])\n\* /g, '$1\n\n* ');
  processed = processed.replace(/([^\n])\n- /g, '$1\n\n- ');
  processed = processed.replace(/([^\n])\n(\d+)\. /g, '$1\n\n$2. ');
  
  return processed;
};

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSuggestionClick,
  onMCQSelect,
  isTyping = false,
  onTypingComplete,
}) => {
  const isUser = message.sender === 'user';
  const [displayedText, setDisplayedText] = useState<string>('');
  const [typingDone, setTypingDone] = useState(!isTyping);
  
  const fullText = message.message_text || '';

  // Typing effect for bot messages
  useEffect(() => {
    if (!isUser && isTyping && fullText) {
      setDisplayedText('');
      setTypingDone(false);
      
      let currentIndex = 0;
      const typingInterval = setInterval(() => {
        if (currentIndex < fullText.length) {
          setDisplayedText(fullText.slice(0, currentIndex + 1));
          currentIndex++;
        } else {
          clearInterval(typingInterval);
          setTypingDone(true);
          onTypingComplete?.();
        }
      }, 15); // 15ms per character for smooth typing
      
      return () => clearInterval(typingInterval);
    } else if (!isTyping) {
      setDisplayedText(fullText);
      setTypingDone(true);
    }
  }, [isUser, isTyping, fullText, onTypingComplete]);

  const textToShow = isUser ? fullText : (isTyping && !typingDone ? displayedText : fullText);

  return (
    <div className={`flex w-full mb-8 ${isUser ? 'justify-end' : 'justify-start'} animate-fade-in`}>
      <div className={`flex gap-3 max-w-[85%] md:max-w-[75%] ${isUser ? 'flex-row-reverse' : 'flex-row'}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm border border-white/50 ${
          isUser ? 'bg-[#10B981] text-white' : 'bg-emerald-600'
        }`}>
          {isUser ? (
            <span className="text-[9px] font-bold">YOU</span>
          ) : (
            <span className="text-[9px] font-black text-white">PG</span>
          )}
        </div>

        {/* Message Content Area */}
        <div className={`flex flex-col ${isUser ? 'items-end' : 'items-start'}`}>
          {/* Main Bubble - Only show if there's message text */}
          {fullText && fullText.trim() && (
            <div
              className={`px-4 py-3 ${
                isUser
                  ? 'bg-emerald-600 text-white rounded-2xl rounded-tr-sm'
                  : 'bg-white border border-gray-200 text-gray-900 rounded-2xl rounded-tl-sm shadow-sm'
              }`}
            >
              {isUser ? (
                <div className="text-sm leading-relaxed whitespace-pre-wrap">
                  {textToShow}
                </div>
              ) : (
                <div className="markdown-content">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {preprocessMarkdown(textToShow)}
                  </ReactMarkdown>
                  {/* Blinking cursor while typing */}
                  {isTyping && !typingDone && (
                    <span className="inline-block w-0.5 h-4 bg-emerald-600 ml-0.5 animate-pulse align-middle" />
                  )}
                </div>
              )}
              
              {/* Only show timestamp when typing is done */}
              {typingDone && (
                <div className={`mt-1.5 text-[10px] font-medium ${isUser ? 'text-white/60' : 'text-gray-400'}`}>
                  {formatTimestamp(message.created_at)}
                </div>
              )}
            </div>
          )}

          {/* MCQ Options - Only for bot messages */}
          {message.mcq_options && !isUser && (
            <div className="mt-6 w-full space-y-3 animate-slide-up">
              {/* MCQ Question */}
              {message.mcq_options.question && (
                <p className="text-[15px] font-bold text-gray-900 mb-3">
                  {message.mcq_options.question}
                </p>
              )}

              {/* Show options only if not yet selected */}
              {!message.mcq_selected_option && (
                <>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Choose an option</p>
                  {message.mcq_options.options.map((option, index) => (
                    <div
                      key={index}
                      onClick={() => onMCQSelect?.(message.id, option)}
                      className="selection-card"
                    >
                      <span className="text-[14px] font-bold">{option}</span>
                    </div>
                  ))}
                </>
              )}

              {/* Show selected option as a styled indicator (not as a user message) */}
              {message.mcq_selected_option && (
                <div className="flex items-center gap-2 text-sm text-emerald-600 font-medium">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                  <span>Selected: {message.mcq_selected_option}</span>
                </div>
              )}
            </div>
          )}

          {/* Suggested Questions - Only for bot messages, show only after typing is complete */}
          {message.suggested_questions && message.suggested_questions.length > 0 && !message.mcq_options && !isUser && typingDone && (
            <div className="mt-6 w-full space-y-3 animate-slide-up">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest ml-1">Suggested for you</p>
              {message.suggested_questions.map((question, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => onSuggestionClick?.(question)}
                  className="selection-card transition-all duration-300"
                >
                  <div className="w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center shrink-0">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                      <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <span className="text-[14px] font-bold text-left">{question}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
