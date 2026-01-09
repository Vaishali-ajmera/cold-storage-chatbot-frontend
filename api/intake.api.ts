import apiClient from './config';
import { INTAKE_ENDPOINTS } from './constants';

// User choice types
export const USER_CHOICE_EXISTING = 'existing';
export const USER_CHOICE_BUILD = 'build';

export type UserChoiceType = typeof USER_CHOICE_EXISTING | typeof USER_CHOICE_BUILD;

export interface SuggestedQuestion {
  id: number;
  text: string;
}

export interface IntakeData {
  location: string;
  variety?: string;
  capacity_mt?: number;
  storage_goal?: string;
  current_problems?: string;
  current_temperature?: string;
  [key: string]: any; // For any additional fields
}

interface SubmitIntakeResponse {
  status: boolean;
  message: string;
  data: {
    session_id: string;
    intake: {
      user_choice: string;
      intake_data: IntakeData;
      is_active: boolean;
    };
    suggested_questions: SuggestedQuestion[];
  };
}

export const intakeAPI = {
  submitIntake: async (userChoice: string, intakeData: IntakeData): Promise<SubmitIntakeResponse> => {
    const response = await apiClient.post(INTAKE_ENDPOINTS.SUBMIT_INTAKE, {
      user_choice: userChoice,
      intake_data: intakeData,
    });
    return response.data;
  },
};

