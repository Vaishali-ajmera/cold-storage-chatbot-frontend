export const AUTH_ENDPOINTS = {
  SIGNUP: '/signup/',
  LOGIN: '/login/',
  FORGOT_PASSWORD: '/forgot-password/',
  VERIFY_OTP: '/verify-otp/',
  RESET_PASSWORD: '/reset-password/',
  REFRESH_TOKEN: '/token/refresh/',
  USER_PROFILE: '/user/profile/',
};

// Intake endpoints
export const INTAKE_ENDPOINTS = {
  SUBMIT_INTAKE: '/intake/',
};

// Chat endpoints
export const CHAT_ENDPOINTS = {
  ASK_QUESTION: '/ask/',
  ANSWER_MCQ: '/mcq-response/',
  LIST_SESSIONS: '/sessions/',
  GET_HISTORY: (sessionId: string) => `/history/${sessionId}/`,
  UPDATE_TITLE: (sessionId: string) => `/sessions/${sessionId}/title/`,
  GET_SESSION_INTAKE: (sessionId: string) => `/sessions/${sessionId}/intake/`,
};
