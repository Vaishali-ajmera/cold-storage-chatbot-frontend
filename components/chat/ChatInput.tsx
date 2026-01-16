import React, { useState, useRef, useEffect } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
  remainingQuestions?: number;
  isLoading?: boolean;
}

export const ChatInput: React.FC<ChatInputProps> = ({
  onSend,
  disabled = false,
  remainingQuestions,
  isLoading = false,
}) => {
  const [message, setMessage] = useState('');
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  }, [message]);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (message.trim() && !disabled && !isLoading) {
      onSend(message.trim());
      setMessage('');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  return (
    <div className="w-full px-4 pb-4 md:pb-6">
      <div className="max-w-4xl mx-auto">
        {/* {remainingQuestions !== undefined && (
          <div className="mb-2 px-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${remainingQuestions > 0 ? 'bg-[#10B981]' : 'bg-red-500'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-[0.15em] ${
                remainingQuestions === 0 ? 'text-red-600' : 'text-[#94A3B8]'
              }`}>
                {remainingQuestions > 0 
                  ? `${remainingQuestions} Queries Left`
                  : 'Limit reached'
                }
              </span>
            </div>
          </div>
        )} */}

        <div className="flex items-center gap-3 p-1.5 bg-gray-100 rounded-full border border-gray-200 transition-all">
          {/* Attachment Button */}
          <button
            type="button"
            className="p-2.5 text-gray-500 hover:text-emerald-600 transition-colors rounded-full"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type here..."
            disabled={disabled || isLoading}
            rows={1}
            className="flex-1 outline-none bg-transparent px-1 py-1 text-sm text-gray-900 placeholder:text-gray-400 border-none focus:ring-0 resize-none max-h-32 overflow-y-auto scrollbar-hide"
          />

          {/* Grouped Actions: Voice & Send */}
          <div className="flex items-center gap-2 pr-1">
            <button
              type="button"
              className="p-2 text-gray-500 hover:text-emerald-600 transition-colors rounded-full"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <button
              onClick={() => handleSubmit()}
              disabled={disabled || isLoading}
              className={`group flex items-center gap-0 hover:gap-2 px-3 hover:px-4 py-2 rounded-full transition-all duration-200 ${
                message.trim() && !disabled && !isLoading
                  ? 'bg-emerald-600 text-white'
                  : 'bg-gray-300 text-white'
              }`}
            >
              {isLoading ? (
                <div className="w-3 h-3 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <svg className="w-3.5 h-3.5 rotate-90 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                  </svg>
                  <span className="text-xs font-semibold max-w-0 overflow-hidden group-hover:max-w-[50px] transition-all duration-200 whitespace-nowrap">Send</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

