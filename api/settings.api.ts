import apiClient from './config';
import { SETTINGS_ENDPOINTS } from './constants';

export interface AIConfig {
  response_tone: string;
  response_length: string;
  max_daily_questions: number;
  additional_context: string;
  custom_instructions: string;
}

export interface ConfigChoices {
  tones: { value: string; label: string }[];
  lengths: { value: string; label: string }[];
}

export interface SystemStats {
  total_users: number;
  total_sessions: number;
  total_messages: number;
  questions_today: number;
  avg_questions_per_user: number;
}

export const settingsAPI = {
  /**
   * Fetch current AI configuration
   */
  getConfig: async (): Promise<{ data: AIConfig }> => {
    const response = await apiClient.get(SETTINGS_ENDPOINTS.CONFIG);
    return response.data;
  },

  /**
   * Update AI configuration
   */
  updateConfig: async (config: AIConfig): Promise<{ message: string }> => {
    const response = await apiClient.post(SETTINGS_ENDPOINTS.CONFIG, config);
    return response.data;
  },

  /**
   * Fetch configuration choices (tones and lengths)
   */
  getChoices: async (): Promise<{ data: ConfigChoices }> => {
    const response = await apiClient.get(SETTINGS_ENDPOINTS.CHOICES);
    return response.data;
  },

  /**
   * Fetch system usage statistics
   */
  getStats: async (): Promise<{ data: SystemStats }> => {
    const response = await apiClient.get(SETTINGS_ENDPOINTS.STATS);
    return response.data;
  },
};
