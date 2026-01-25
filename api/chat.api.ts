import apiClient from './config';
import { CHAT_ENDPOINTS } from './constants';

const POLL_INTERVAL_MS = 1500;
const MAX_POLL_ATTEMPTS = 100;

export interface MCQOption {
  question: string;
  options: string[];
}

export interface ChatMessage {
  id: string;
  sequence_number: number;
  sender: 'user' | 'bot';
  message_text: string;
  message_type: 'question' | 'response' | 'mcq_response' | 'bot_answer';
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

type TaskStatus = 'PENDING' | 'STARTED' | 'SUCCESS' | 'FAILURE' | 'RETRY';

interface TaskSubmitResponse {
  message: string;
  async?: boolean;
  data?: {
    task_id: string;
    session_id: string;
    status: TaskStatus;
  };
}

interface TaskStatusResponse {
  task_id: string;
  task_status: TaskStatus;
  session_id?: string;
  type?: 'answer' | 'meta' | 'mcq' | 'rejection' | 'text';
  response_message?: string;
  suggestions?: string[] | null;
  mcq?: MCQOption | null;
  mcq_message_id?: string | null;
  remaining_daily_questions?: number;
  message?: string;
  error?: string;
}

export interface AsyncChatResult {
  success: boolean;
  sessionId?: string;
  type?: 'answer' | 'meta' | 'mcq' | 'rejection' | 'text';
  message?: string;
  suggestions?: string[];
  mcq?: MCQOption | null;
  mcqMessageId?: string | null;
  remainingQuestions?: number;
  error?: string;
  isSessionLimitReached?: boolean;
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

interface CreateSessionResponse {
  status: boolean;
  message: string;
  data: {
    session_id: string;
    welcome_message: string;
  };
}

interface ApiResponse<T> {
  data: T;
  status: boolean;
  message: string;
}

const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

const pollTaskResult = async (taskId: string, sessionId: string): Promise<AsyncChatResult> => {
  let attempts = 0;
  
  while (attempts < MAX_POLL_ATTEMPTS) {
    attempts++;
    
    try {
      const response = await apiClient.get<ApiResponse<TaskStatusResponse>>(CHAT_ENDPOINTS.TASK_STATUS(taskId));
      
      // Add console logs to debug
      console.log('Poll attempt:', attempts);
      console.log('Full response:', JSON.stringify(response.data, null, 2));
      
      const taskData = response.data.data; // This gets the TaskStatusResponse
      console.log('Task status:', taskData.task_status);
      
      if (taskData.task_status === 'SUCCESS') {
        console.log('✅ SUCCESS - Returning result');
        return {
          success: true,
          sessionId: taskData.session_id,
          type: taskData.type,
          message: taskData.response_message,
          suggestions: taskData.suggestions || [],
          mcq: taskData.mcq,
          mcqMessageId: taskData.mcq_message_id,
          remainingQuestions: taskData.remaining_daily_questions,
        };
      }
      
      if (taskData.task_status === 'FAILURE') {
        console.error('❌ FAILURE - Task failed:', taskData.error);
        return {
          success: false,
          error: taskData.error || 'Something went wrong. Please try again later.',
        };
      }
      
      // Still pending
      console.log('⏳ Still polling... Status:', taskData.task_status);
      await sleep(POLL_INTERVAL_MS);
      
    } catch (err) {
      console.error('❌ Polling error:', err);
      await sleep(POLL_INTERVAL_MS);
    }
  }
  
  console.error('⏱️ Max polling attempts reached');
  return {
    success: false,
    error: 'Request timed out. Please try again later.',
  };
};

export const chatAPI = {
  createSession: async (): Promise<CreateSessionResponse> => {
    const response = await apiClient.post(CHAT_ENDPOINTS.CREATE_SESSION, {});
    return response.data;
  },

  askQuestion: async (question: string, sessionId: string | null = null): Promise<AsyncChatResult> => {
    const payload: any = { question };
    if (sessionId) payload.session_id = sessionId;
    
    try {
      const response = await apiClient.post<TaskSubmitResponse>(CHAT_ENDPOINTS.ASK_QUESTION, payload);
      
      if (response.data.async === false) {
        return {
          success: false,
          error: response.data.message,
          isSessionLimitReached: true,
        };
      }
      
      if (!response.data.data) {
        return {
          success: false,
          error: 'Invalid response from server.',
        };
      }
      
      const { task_id, session_id } = response.data.data;
      return await pollTaskResult(task_id, session_id);
      
    } catch (err: any) {
      console.error('Ask question error:', err);
      
      if (err.response?.data?.message?.includes('maximum')) {
        return {
          success: false,
          error: err.response.data.message,
          isSessionLimitReached: true,
        };
      }
      
      return {
        success: false,
        error: 'Unable to send message. Please try again.',
      };
    }
  },

  answerMCQ: async (mcqMessageId: string, selectedValue: string): Promise<AsyncChatResult> => {
    try {
      const response = await apiClient.post<TaskSubmitResponse>(CHAT_ENDPOINTS.ANSWER_MCQ, {
        mcq_message_id: mcqMessageId,
        selected_value: selectedValue,
      });
      
      if (!response.data.data) {
        return {
          success: false,
          error: 'Invalid response from server.',
        };
      }
      
      const { task_id, session_id } = response.data.data;
      return await pollTaskResult(task_id, session_id);
      
    } catch (err: any) {
      console.error('Answer MCQ error:', err);
      return {
        success: false,
        error: 'Unable to submit your response. Please try again.',
      };
    }
  },

  getTaskStatus: async (taskId: string): Promise<TaskStatusResponse> => {
    const response = await apiClient.get<TaskStatusResponse>(CHAT_ENDPOINTS.TASK_STATUS(taskId));
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
