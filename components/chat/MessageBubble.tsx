import React from 'react';
import { ChatMessage as ChatMessageType, MCQOption } from '../../api/chat.api';
import { formatTimestamp } from '../../utils/dateFormatter';

interface MessageBubbleProps {
  message: ChatMessageType;
  onSuggestionClick?: (question: string) => void;
  onMCQSelect?: (messageId: string, option: string) => void;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  onSuggestionClick,
  onMCQSelect,
}) => {
  const isUser = message.sender === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} w-full animate-fade-in`}>
      <div className={`flex flex-col max-w-[85%] md:max-w-[75%] ${isUser ? 'items-end' : 'items-start'}`}>
        {/* Message Container */}
        <div
          className={`relative px-4 py-3 rounded-2xl shadow-sm ${
            isUser
              ? 'bg-emerald-600 text-white rounded-tr-none'
              : 'bg-gray-50 text-gray-800 border border-gray-100 rounded-tl-none'
          }`}
        >
          <div className={`text-[15px] leading-relaxed whitespace-pre-wrap font-medium ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {message.message_text}
          </div>
          
          {/* Subtle Timestamp */}
          <div className={`mt-2 text-[10px] font-bold uppercase tracking-wider ${isUser ? 'text-emerald-100/70' : 'text-gray-400'}`}>
            {formatTimestamp(message.created_at)}
          </div>
        </div>

        {/* MCQ Options - Rendered as Structured Cards */}
        {message.mcq_options && (
          <div className="mt-4 w-full space-y-2.5 animate-slide-in-bottom">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest pl-1">Choose an option</p>
            {message.mcq_options.options.map((option, index) => (
              <button
                key={index}
                onClick={() => onMCQSelect?.(message.id, option)}
                disabled={!!message.mcq_selected_option}
                className={`w-full text-left px-5 py-3.5 rounded-2xl border transition-all duration-200 active:scale-[0.98] ${
                  message.mcq_selected_option === option
                    ? 'border-emerald-500 bg-emerald-50 text-emerald-900 shadow-md shadow-emerald-100'
                    : message.mcq_selected_option
                    ? 'border-gray-100 bg-gray-50 text-gray-400 cursor-not-allowed'
                    : 'border-emerald-100 bg-white hover:border-emerald-500 hover:shadow-lg hover:shadow-emerald-50 text-gray-700 shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-sm">{option}</span>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                    message.mcq_selected_option === option
                      ? 'border-emerald-500 bg-emerald-500'
                      : 'border-emerald-200 bg-white'
                  }`}>
                    {message.mcq_selected_option === option && (
                      <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Suggested Questions - Styled as Pills */}
        {message.suggested_questions && message.suggested_questions.length > 0 && !message.mcq_options && (
          <div className="mt-4 flex flex-wrap gap-2">
            {message.suggested_questions.map((question, index) => (
              <button
                key={index}
                onClick={() => onSuggestionClick?.(question)}
                className="px-4 py-2 bg-white border border-emerald-100 rounded-full text-sm font-semibold text-emerald-700 hover:bg-emerald-50 hover:border-emerald-500 hover:shadow-md transition-all active:scale-95 shadow-sm"
              >
                {question}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );

};
