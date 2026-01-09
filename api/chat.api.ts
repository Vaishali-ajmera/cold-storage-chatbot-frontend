import apiClient from './config';
import { CHAT_ENDPOINTS } from './constants';

export interface MCQOption {
  question: string;
  options: string[];
}

export interface ChatMessage {
  id: string;
  sequence_number: number;
  sender: 'user' | 'bot';
  message_text: string;
  message_type: 'question' | 'response' | 'mcq_response';
  suggested_questions: string[] | null;
  mcq_options: MCQOption | null;
  mcq_selected_option: string | null;
  created_at: string;
}

export interface ChatSession {
  id: string;
  title: string;
  started_at: string;
  status: 'active' | 'limit_reached';
}

interface AskQuestionResponse {
  message: string;
  data?: {
    session_id: string;
    type: 'text' | 'mcq';
    response_message: string;
    suggestions: string[] | null;
    mcq: MCQOption | null;
    mcq_message_id: string | null;
    remaining_questions: number;
  };
}

interface AnswerMCQResponse {
  message: string;
  data: {
    session_id: string;
    type: 'text';
    response_message: string;
    suggestions: string[];
    remaining_questions: number;
  };
}

interface ListSessionsResponse {
  message: string;
  data: {
    sessions: ChatSession[];
  };
}

interface GetChatHistoryResponse {
  message: string;
  data: {
    session: {
      id: string;
      user_questions_count: number;
      remaining_questions: number;
      can_ask_question: boolean;
      status: 'active' | 'limit_reached';
    };
    messages: ChatMessage[];
  };
}

interface UpdateSessionTitleResponse {
  message: string;
  data: {
    id: string;
    title: string;
  };
}

interface GetSessionIntakeResponse {
  status: boolean;
  message: string;
  data: {
    intake: {
      user_choice: string;
      intake_data: any;
      is_active: boolean;
    };
  };
}

export const chatAPI = {
  askQuestion: async (question: string, sessionId: string | null = null): Promise<AskQuestionResponse> => {
    const payload: any = { question };
    if (sessionId) payload.session_id = sessionId;
    
    const response = await apiClient.post(CHAT_ENDPOINTS.ASK_QUESTION, payload);
    return response.data;
  },

  answerMCQ: async (mcqMessageId: string, selectedValue: string): Promise<AnswerMCQResponse> => {
    const response = await apiClient.post(CHAT_ENDPOINTS.ANSWER_MCQ, {
      mcq_message_id: mcqMessageId,
      selected_value: selectedValue,
    });
    return response.data;
  },

  listSessions: async (): Promise<ListSessionsResponse> => {
    const response = await apiClient.get(CHAT_ENDPOINTS.LIST_SESSIONS);
    return response.data;
  },

  getChatHistory: async (sessionId: string): Promise<GetChatHistoryResponse> => {
    const response = await apiClient.get(CHAT_ENDPOINTS.GET_HISTORY(sessionId));
    return response.data;
  },

  updateSessionTitle: async (sessionId: string, title: string): Promise<UpdateSessionTitleResponse> => {
    const response = await apiClient.patch(
      CHAT_ENDPOINTS.UPDATE_TITLE(sessionId),
      { title }
    );
    return response.data;
  },

  getSessionIntake: async (sessionId: string): Promise<GetSessionIntakeResponse> => {
    const response = await apiClient.get(CHAT_ENDPOINTS.GET_SESSION_INTAKE(sessionId));
    return response.data;
  },
};

