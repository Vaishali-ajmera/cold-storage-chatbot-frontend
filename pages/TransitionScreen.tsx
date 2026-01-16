import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { intakeAPI } from '../api/intake.api';

export const TransitionScreen: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { userChoice, intakeData } = location.state || {};
  
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(true);

  useEffect(() => {
    const submitIntake = async () => {
      // If no form data, redirect back to intake
      if (!userChoice || !intakeData) {
        navigate('/intake', { replace: true });
        return;
      }

      try {
        const response = await intakeAPI.submitIntake(userChoice, intakeData);
        const sessionId = response.data.session_id;
        const questionTexts = response.data.suggested_questions.map((q: any) => q.text);
        
        // Success - navigate to dashboard with chat
        navigate('/dashboard', { 
          state: { 
            sessionId, 
            suggestedQuestions: questionTexts,
            showChat: true 
          },
          replace: true
        });
      } catch (err: any) {
        console.error('Failed to submit intake:', err);
        setError(err.response?.data?.message || 'Something went wrong. Please try again.');
        setIsSubmitting(false);
      }
    };

    submitIntake();
  }, [navigate, userChoice, intakeData]);

  // Error state
  if (error) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white px-6">
        <div className="relative z-10 flex flex-col items-center max-w-sm text-center">
          {/* Error Icon */}
          <div className="w-20 h-20 bg-red-50 rounded-[28px] flex items-center justify-center mb-8 shadow-lg">
            <svg className="w-10 h-10 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          
          {/* Error Text */}
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-3">
            Oops! Something went wrong
          </h1>
          <p className="text-sm text-gray-500 mb-8">
            {error}
          </p>
          
          {/* Action Buttons */}
          <div className="flex flex-col gap-3 w-full">
            <button
              onClick={() => {
                setError(null);
                setIsSubmitting(true);
                // Retry the submission
                window.location.reload();
              }}
              className="w-full py-3 px-6 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-colors"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/intake', { replace: true })}
              className="w-full py-3 px-6 bg-gray-100 text-gray-700 font-semibold rounded-xl hover:bg-gray-200 transition-colors"
            >
              Go Back to Form
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Loading state
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-white">
      {/* Animated Background Circles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-emerald-50 rounded-full animate-pulse-slow opacity-50" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-emerald-100 rounded-full animate-pulse-slow opacity-30" style={{ animationDelay: '0.2s' }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] bg-emerald-200 rounded-full animate-pulse-slow opacity-20" style={{ animationDelay: '0.4s' }} />
      </div>
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center animate-fade-in">
        {/* Logo with Zoom Animation */}
        <div className="w-20 h-20 bg-emerald-600 rounded-[28px] flex items-center justify-center mb-8 animate-zoom-in shadow-xl shadow-emerald-200">
          <span className="text-white font-black text-2xl">PG</span>
        </div>
        
        {/* Text Content */}
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight mb-3 animate-slide-up">
          Getting things ready
        </h1>
        <p className="text-sm text-gray-500 mb-12 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          We're preparing your personalized consultation
        </p>
        
        {/* Animated Dots */}
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0s' }} />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }} />
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }} />
        </div>
        
        {/* Status Badge */}
        <div className="mt-12 px-4 py-2 bg-emerald-50 rounded-full animate-fade-in" style={{ animationDelay: '0.3s' }}>
          <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest">
            Connecting to Potato Guru AI
          </p>
        </div>
      </div>
    </div>
  );
};
