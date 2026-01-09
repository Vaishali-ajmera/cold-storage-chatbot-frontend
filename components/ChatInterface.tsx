
import React, { useState, useEffect, useRef } from 'react';
import { UserType, ChatMessage } from '../types';
import { Send, Bot, User, RefreshCw, AlertCircle, CloudSun, ExternalLink } from 'lucide-react';
import { sendMessageToGemini } from '../services/geminiService';

interface GroundingLink {
  uri: string;
  title: string;
}

interface ExtendedMessage extends ChatMessage {
  sources?: GroundingLink[];
}

interface Props {
  userType: UserType;
  contextData: any;
  onReset: () => void;
  suggestedQuestions?: string[];
}

export const ChatInterface: React.FC<Props> = ({ userType, contextData, onReset, suggestedQuestions = [] }) => {
  const [messages, setMessages] = useState<ExtendedMessage[]>([
    {
      id: 'welcome',
      role: 'model',
      text: `Connecting to PotatoGuard Advisory... Checking weather for ${contextData.location}.`
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    if (messages.length === 1 && messages[0].id === 'welcome') {
      handleSend("Initialize my facility context and give me a weather-aware storage advisory for my location.");
    }
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (text: string) => {
    if (!text.trim() || isLoading) return;
    const isAutoInit = text.includes("Initialize my facility context");
    if (!isAutoInit) {
      setMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', text }]);
    }
    setInputValue('');
    setIsLoading(true);
    const responseId = (Date.now() + 1).toString();
    setMessages(prev => [...prev, { id: responseId, role: 'model', text: '', isThinking: true }]);

    try {
      const response = await sendMessageToGemini(text);
      const sources: GroundingLink[] = [];
      const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
      if (chunks) {
        chunks.forEach((chunk: any) => {
          if (chunk.web?.uri) sources.push({ uri: chunk.web.uri, title: chunk.web.title || 'Source' });
        });
      }
      setMessages(prev => prev.map(msg => 
        msg.id === responseId 
          ? { ...msg, text: response.text || "No response.", isThinking: false, sources: sources.length > 0 ? sources : undefined } 
          : msg
      ));
    } catch (error) {
      setMessages(prev => prev.map(msg => msg.id === responseId ? { ...msg, text: "Error connecting to AI.", isThinking: false } : msg));
    } finally {
      setIsLoading(false);
    }
  };

  const parseBold = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) return <strong key={index} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
      return part;
    });
  };

  const renderMessageContent = (text: string) => {
     return text.split('\n').map((line, i) => {
        if (!line.trim()) return <div key={i} className="h-1" />;
        if (line.trim().startsWith('* ') || line.trim().startsWith('- ')) {
          const content = line.trim().replace(/^[\*\-] /, '');
          return (
            <div key={i} className="flex gap-1.5 ml-1 my-0.5">
              <span className="text-emerald-500 font-bold text-sm">•</span>
              <span className="text-gray-800 text-sm leading-relaxed">{parseBold(content)}</span>
            </div>
          );
        }
        return <p key={i} className="mb-1.5 text-gray-800 text-sm leading-relaxed">{parseBold(line)}</p>;
     });
  };

  return (
    <div className="flex h-full bg-white rounded-3xl apple-shadow overflow-hidden max-w-5xl mx-auto border border-gray-100">
      <div className="hidden lg:flex flex-col w-64 bg-gray-50/50 p-5 border-r border-gray-100">
        <h3 className="font-bold text-gray-900 mb-5 flex items-center gap-2 text-sm">
          <CloudSun className="w-4 h-4 text-emerald-600" /> Status
        </h3>
        <div className="mb-6 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
          <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest mb-0.5">Location</p>
          <p className="text-emerald-900 font-bold text-base leading-tight">{contextData.location}</p>
        </div>
        <h3 className="font-bold text-gray-900 mb-3 flex items-center gap-2 text-[11px] uppercase tracking-wider text-gray-400">Profile</h3>
        <div className="flex-1 overflow-y-auto space-y-3 text-[11px]">
          {Object.entries(contextData).map(([key, value]) => (
            key !== 'location' && (
              <div key={key}>
                <span className="text-gray-400 font-bold block">{key.replace(/([A-Z])/g, ' $1')}</span>
                <span className="text-gray-700 font-semibold block">{Array.isArray(value) ? value.join(', ') : String(value)}</span>
              </div>
            )
          ))}
        </div>
        <button onClick={onReset} className="mt-4 flex items-center justify-center gap-2 text-xs font-bold text-gray-400 hover:text-red-500 transition-colors p-3 rounded-xl hover:bg-red-50">
          <RefreshCw className="w-3.5 h-3.5" /> Reset
        </button>
      </div>

      <div className="flex-1 flex flex-col bg-white">
        <div className="flex-1 overflow-y-auto p-5 md:p-8 space-y-6 scrollbar-hide">
          {messages.map((msg) => (
            <div key={msg.id} className={`flex items-start gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0 ${msg.role === 'user' ? 'bg-black text-white' : 'bg-gray-100 text-gray-600'}`}>
                {msg.role === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>
              <div className="max-w-[85%] md:max-w-[80%] space-y-2">
                <div className={`rounded-2xl px-4 py-3 ${msg.role === 'user' ? 'bg-black text-white rounded-tr-none' : 'bg-gray-50 text-gray-800 rounded-tl-none border border-gray-100'}`}>
                  {msg.isThinking ? (
                    <div className="flex gap-1 items-center h-4">
                      <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce" />
                      <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1 h-1 bg-gray-300 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  ) : renderMessageContent(msg.text)}
                </div>
                {msg.sources && (
                  <div className="flex flex-wrap gap-1.5 px-1">
                    {msg.sources.map((s, idx) => (
                      <a key={idx} href={s.uri} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-[9px] font-bold bg-gray-50 text-gray-400 hover:text-emerald-600 px-1.5 py-0.5 rounded border border-gray-100">
                        <ExternalLink className="w-2 h-2" /> {s.title.substring(0, 15)}...
                      </a>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        <div className="p-5 md:p-8 pt-0">
          <div className="flex gap-1.5 overflow-x-auto pb-3 scrollbar-hide">
            {suggestedQuestions.map((q, idx) => (
              <button key={idx} onClick={() => handleSend(q)} className="whitespace-nowrap px-3 py-1.5 bg-gray-50 border border-gray-100 rounded-full text-[11px] font-medium text-gray-600 hover:bg-gray-100 transition-colors">
                {q}
              </button>
            ))}
          </div>
          <div className="relative flex items-center">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSend(inputValue)}
              placeholder="Ask anything..."
              className="w-full p-4 pr-12 bg-gray-50 border-none rounded-2xl focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm shadow-inner text-gray-900"
              disabled={isLoading}
            />
            <button onClick={() => handleSend(inputValue)} disabled={isLoading || !inputValue.trim()} className="absolute right-2.5 p-2 bg-black text-white rounded-xl hover:bg-emerald-600 disabled:opacity-10 active:scale-95 transition-all">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
