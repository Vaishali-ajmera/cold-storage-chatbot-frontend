import React, { useState, useEffect } from 'react';
import { chatAPI, ChatSession } from '../../api/chat.api';
import { formatRelativeTime } from '../../utils/dateFormatter';

interface SidebarProps {
  currentSessionId: string | null;
  onSessionSelect: (sessionId: string) => void;
  onNewChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ currentSessionId, onSessionSelect, onNewChat }) => {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingSessionId, setEditingSessionId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    try {
      const response = await chatAPI.listSessions();
      setSessions(response.data.sessions);
    } catch (error) {
      console.error('Failed to load sessions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRename = async (sessionId: string) => {
    if (!editTitle.trim()) return;

    try {
      await chatAPI.updateSessionTitle(sessionId, editTitle);
      setSessions(sessions.map(s => 
        s.id === sessionId ? { ...s, title: editTitle } : s
      ));
      setEditingSessionId(null);
      setEditTitle('');
    } catch (error) {
      console.error('Failed to rename session:', error);
    }
  };

  const startEditing = (session: ChatSession) => {
    setEditingSessionId(session.id);
    setEditTitle(session.title);
  };

  return (
    <aside className="w-80 bg-gray-50 border-r border-gray-200 flex flex-col h-full">
      {/* New Chat Button */}
      <div className="p-4 border-b border-gray-200">
        <button
          onClick={onNewChat}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          New Chat
        </button>
      </div>

      {/* Sessions List */}
      <div className="flex-1 overflow-y-auto p-4">
        {isLoading ? (
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-200 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : sessions.length === 0 ? (
          <div className="text-center py-8 text-gray-500 text-sm">
            No chat sessions yet.<br />Start a new chat!
          </div>
        ) : (
          <div className="space-y-2">
            <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
              Chat History
            </h3>
            {sessions.map((session) => (
              <div
                key={session.id}
                className={`group relative rounded-xl transition-all duration-200 cursor-pointer border ${
                  currentSessionId === session.id
                    ? 'bg-emerald-50 border-emerald-200 shadow-sm'
                    : 'bg-white border-transparent hover:border-gray-200 hover:shadow-md hover:-translate-y-0.5'
                }`}
              >
                {editingSessionId === session.id ? (
                  <div className="p-3">
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      onBlur={() => handleRename(session.id)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleRename(session.id);
                        if (e.key === 'Escape') setEditingSessionId(null);
                      }}
                      className="w-full px-2 py-1 text-sm border border-emerald-300 rounded focus:outline-none focus:ring-2 focus:ring-emerald-500"
                      autoFocus
                    />
                  </div>
                ) : (
                  <div
                    onClick={() => onSessionSelect(session.id)}
                    className="p-3 flex items-start justify-between gap-2"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {session.title}
                      </p>
                      {/* <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-gray-500">
                          {formatRelativeTime(session.started_at)}
                        </span>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          session.status === 'active'
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          {session.status === 'active' ? 'Active' : 'Complete'}
                        </span>
                      </div> */}
                    </div>

                    {/* Action Menu */}
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(session);
                      }}
                      className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-100 rounded transition"
                    >
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                      </svg>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
};
