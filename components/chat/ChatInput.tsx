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
        {remainingQuestions !== undefined && (
          <div className="mb-2 px-4 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <div className={`w-1.5 h-1.5 rounded-full ${remainingQuestions > 0 ? 'bg-emerald-500 animate-pulse' : 'bg-red-500'}`} />
              <span className={`text-[10px] font-bold uppercase tracking-widest ${
                remainingQuestions === 0 ? 'text-red-600' : 'text-gray-400'
              }`}>
                {remainingQuestions > 0 
                  ? `${remainingQuestions} Queries Left`
                  : 'Limit Reached'
                }
              </span>
            </div>
          </div>
        )}

        <div className={`relative flex items-end gap-2 p-2 bg-white border-2 rounded-[24px] transition-all duration-300 ${
          disabled ? 'bg-gray-50 border-gray-100 opacity-60' : 'border-gray-100 focus-within:border-emerald-500 focus-within:shadow-xl focus-within:shadow-emerald-50'
        }`}>
          {/* Action/Attachment Button */}
          <button
            type="button"
            className="p-2.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
            title="Attach file"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.172 7l-6.586 6.586a2 2 0 102.828 2.828l6.414-6.414a4 4 0 00-5.656-5.656l-6.415 6.415a6 6 0 108.486 8.486L20.5 13" />
            </svg>
          </button>

          {/* Text Input */}
          <textarea
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={disabled ? "Select an option..." : "Ask me anything..."}
            disabled={disabled || isLoading}
            rows={1}
            className="flex-1 bg-transparent px-2 py-2.5 text-[15px] font-medium text-gray-900 placeholder:text-gray-400 border-none focus:ring-0 resize-none max-h-32 overflow-y-auto"
          />

          {/* Grouped Actions: Voice & Send */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              className="p-2.5 text-gray-400 hover:text-emerald-600 transition-colors rounded-full hover:bg-emerald-50"
              title="Voice input"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
              </svg>
            </button>

            <button
              onClick={() => handleSubmit()}
              disabled={!message.trim() || disabled || isLoading}
              className={`p-2.5 rounded-full transition-all duration-300 ${
                message.trim() && !disabled && !isLoading
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-200 hover:scale-105 active:scale-95'
                  : 'bg-gray-100 text-gray-300'
              }`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                </svg>
              )}
            </button>
          </div>
        </div>
        <p className="mt-2 text-[10px] text-gray-400 text-center font-bold tracking-widest uppercase">
          AI may provide helpful store design insights
        </p>
      </div>
    </div>
  );
};

