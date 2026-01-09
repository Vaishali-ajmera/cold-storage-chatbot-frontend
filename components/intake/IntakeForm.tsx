import React, { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import formData from '../../form-data.json';
import { LocationAutocomplete } from './LocationAutocomplete';
import { intakeAPI, SuggestedQuestion, USER_CHOICE_EXISTING, USER_CHOICE_BUILD } from '../../api/intake.api';

interface IntakeFormProps {
  onComplete: (sessionId: string, suggestedQuestions: string[]) => void;
  onViewHistory: () => void;
}

interface FormField {
  id: string;
  key: string;
  question: string;
  subtext?: string;
  type: 'text' | 'selection' | 'multi-selection';
  placeholder?: string;
  options?: string[];
}

type UserType = 'owner' | 'builder' | null;

export const IntakeForm: React.FC<IntakeFormProps> = ({ onComplete, onViewHistory }) => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [showSplash, setShowSplash] = useState(true);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  const formFields: FormField[] = userType === 'owner' 
    ? (formData.ownerFlow as FormField[])
    : userType === 'builder' 
    ? (formData.builderFlow as FormField[])
    : [];

  const currentField = formFields[currentStepIndex];

  const handleSelection = (option: string) => {
    setFormValues(prev => ({ ...prev, [currentField.key]: option }));
  };

  const handleNext = async () => {
    const currentVal = currentField.type === 'multi-selection' 
      ? multiSelectValues 
      : formValues[currentField.key];

    performNextStep(currentVal);
  };

  const getCurrentFieldOptions = (): string[] => {
    if (!currentField) return [];
    if (currentField.id === 'variety' && formValues.category) {
      const category = formValues.category as keyof typeof formData.potatoCategories;
      return formData.potatoCategories[category] || [];
    }
    return currentField.options || [];
  };

  useEffect(() => {
    if (formValues.category && formValues.variety) {
      const category = formValues.category as keyof typeof formData.potatoCategories;
      const validVarieties = formData.potatoCategories[category] || [];
      if (!validVarieties.includes(formValues.variety)) {
        setFormValues(prev => {
          const { variety, ...rest } = prev;
          return rest;
        });
      }
    }
  }, [formValues.category]);

  const handleUserTypeSelect = (type: UserType) => {
    setUserType(type);
    setCurrentStepIndex(0);
    setFormValues({});
    setMultiSelectValues([]);
  };

  const handleTextInput = (value: string) => {
    setFormValues(prev => ({ ...prev, [currentField.key]: value }));
  };

  const handleMultiSelection = (option: string) => {
    if (multiSelectValues.includes(option)) {
      setMultiSelectValues(multiSelectValues.filter(v => v !== option));
    } else {
      setMultiSelectValues([...multiSelectValues, option]);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      setUserType(null);
    }
  };

  const performNextStep = async (finalValue: any) => {
    if (isSubmitting) return;

    if (currentField.type === 'multi-selection') {
      setFormValues(prev => ({ ...prev, [currentField.key]: finalValue }));
    }

    if (currentStepIndex < formFields.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
      setMultiSelectValues([]);
    } else {
      setIsSubmitting(true);
      setError(null);
      
      try {
        const finalFormData = {
          ...formValues,
          [currentField.key]: finalValue
        };
        const userChoice = userType === 'owner' ? USER_CHOICE_EXISTING : USER_CHOICE_BUILD;
        const response = await intakeAPI.submitIntake(userChoice, finalFormData);
        const sessionId = response.data.session_id;
        const questionTexts = response.data.suggested_questions.map(q => q.text);
        
        // Show success screen before complete
        setIsSubmitting(false);
        setIsSubmitted(true);
        
        // Engaging delay
        setTimeout(() => {
          onComplete(sessionId, questionTexts);
        }, 3000);
      } catch (err: any) {
        console.error('Failed to submit intake:', err);
        setError(err.response?.data?.message || 'Failed to submit form. Please try again.');
        setIsSubmitting(false);
      }
    }
  };

  const isCurrentStepValid = () => {
    if (!currentField) return false;
    
    if (currentField.type === 'text') {
      return formValues[currentField.key]?.trim().length > 0;
    } else if (currentField.type === 'selection') {
      return !!formValues[currentField.key];
    } else if (currentField.type === 'multi-selection') {
      return multiSelectValues.length > 0;
    }
    return false;
  };


  // Splash Screen
  if (showSplash) {
    return (
      <div className="immersive-layout bg-[#F4F6F8] flex flex-col items-center justify-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-100 rounded-[28px] flex items-center justify-center mb-6 animate-zoom-in">
          <svg className="w-10 h-10 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <h1 className="text-xl font-black text-gray-900 tracking-tight mb-1">Potato Guru AI</h1>
        <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] animate-pulse">Modern AI, Better Storage</p>
      </div>
    );
  }

  // Hamburger Menu Content
  const MenuOverlay = () => (
    <>
      {isMenuOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsMenuOpen(false)} />
          <div className="menu-popover">
            <button 
              onClick={() => { setIsMenuOpen(false); onViewHistory(); }}
              className="menu-item"
            >
              Chat History
            </button>
            <div className="menu-divider mx-3" />
            <button 
              onClick={() => { logout(); navigate('/login'); setIsMenuOpen(false); }}
              className="menu-item"
            >
              Sign Out
            </button>
          </div>
        </>
      )}
    </>
  );

  // Success / Redirection Screen
  if (isSubmitted) {
    return (
      <div className="immersive-layout flex flex-col items-center justify-center p-8 text-center animate-fade-in">
        <div className="w-20 h-20 bg-emerald-50 rounded-[40px] flex items-center justify-center mb-8 relative">
          <div className="absolute inset-0 bg-emerald-100 rounded-[40px] animate-ping opacity-20" />
          <svg className="w-10 h-10 text-emerald-600 relative z-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 mb-3 tracking-tight">Optimization<br/>In Progress!</h2>
        <p className="text-xs font-medium text-gray-500 max-w-[260px] mb-12">
          Thank you! We're tailoring the best storage advice for your facility.
        </p>
        <div className="w-full max-w-[180px] h-1.5 bg-gray-200/50 rounded-full overflow-hidden mb-4">
          <div className="h-full bg-emerald-500 animate-loading-bar" />
        </div>
        <p className="text-[10px] font-bold text-emerald-600 uppercase tracking-widest animate-pulse">Connecting to Guru AI...</p>
      </div>
    );
  }

  // User Type Selection Screen
  if (!userType) {
    return (
      <div className="immersive-layout animate-fade-in relative">
        <header className="px-6 py-4 border-b border-gray-100 z-50">
          <div className="w-full flex items-center justify-between relative">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white text-[10px]">PG</div>
              <span className="text-base font-black tracking-tighter text-gray-900">Potato Guru AI</span>
            </div>
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-black/5 rounded-full transition-all">
              <svg className="w-6 h-6 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16m-7 6h7" />
              </svg>
            </button>
            <MenuOverlay />
          </div>
        </header>

        <div className="flex-1 overflow-y-auto px-6 pb-10 flex flex-col items-center">
          <div className="main-content">
            <div className="flex flex-col items-center mb-8">
              <div className="w-16 h-16 bg-emerald-600 rounded-[22px] flex items-center justify-center mb-6 shadow-lg shadow-emerald-100 animate-slide-up">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4" />
                </svg>
              </div>
              
              <h1 className="text-xl sm:text-2xl font-bold text-gray-900 text-center leading-tight tracking-tight mb-2">
                Let’s plan your cold storage
              </h1>
              <p className="text-xs sm:text-sm font-medium text-gray-400 text-center">
                Choose what best describes your situation
              </p>
            </div>

            <div className="w-full space-y-3">
              <button
                onClick={() => handleUserTypeSelect('owner')}
                className="w-full bg-[#F2F2F0] hover:bg-[#EBEBE8] rounded-xl border border-gray-100 p-5 text-left transition-all duration-200 shadow-sm group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-50 group-hover:bg-emerald-50 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">I own a cold storage</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Optimize Existing Site</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => handleUserTypeSelect('builder')}
                className="w-full bg-[#F2F2F0] hover:bg-[#EBEBE8] rounded-xl border border-gray-100 p-5 text-left transition-all duration-200 shadow-sm group"
              >
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shrink-0 border border-gray-50 group-hover:bg-blue-50 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div className="flex-1">
                    <h3 className="text-sm font-semibold text-gray-900 leading-tight">I want to build a new storage</h3>
                    <p className="text-[10px] font-bold text-gray-400 mt-1 uppercase tracking-wider">Planning & Subsidies</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Questions Screen
  return (
    <div className="immersive-layout animate-fade-in overflow-hidden relative">
      <header className="px-6 py-3 border-b border-gray-100 z-50">
        <div className="w-full flex items-center justify-between relative">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center font-black text-white text-[10px]">PG</div>
            <span className="text-base font-black tracking-tighter text-gray-900">Potato Guru AI</span>
          </div>
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="p-2 hover:bg-black/5 rounded-full transition-all">
            <svg className="w-5 h-5 text-gray-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.2} d="M4 6h16M4 12h16m-7 6h7" />
            </svg>
          </button>
          <MenuOverlay />
        </div>
      </header>

      {/* 2. Full Width Progress Bar */}
      <div className="px-6 py-3 border-b border-gray-100 flex justify-center">
        <div className="w-full flex items-center gap-4">
          <button 
            onClick={handleBack}
            className="w-7 h-7 bg-white/50 border border-gray-200 rounded-lg flex items-center justify-center hover:bg-white hover:border-emerald-500 transition-all shadow-sm active:scale-90"
          >
            <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          
          <div className="flex-1 h-1.5 bg-gray-200/50 rounded-full overflow-hidden">
            <div 
              className="h-full bg-emerald-500 transition-all duration-700 ease-out"
              style={{ width: `${((currentStepIndex + 1) / formFields.length) * 100}%` }}
            />
          </div>

          <span className="text-[10px] font-black text-gray-400 tabular-nums lowercase tracking-tighter">
            {currentStepIndex + 1}<span className="mx-0.5 text-gray-200">/</span>{formFields.length}
          </span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-6 py-8 relative scrollbar-hide flex flex-col items-center">
        <div className="main-content">
          <div className="transition-all duration-300 animate-zoom-in h-auto flex flex-col">
            <div className="mb-8">
              <p className="text-[9px] font-black uppercase tracking-[0.2em] text-emerald-600 mb-1.5">Guru AI is asking:</p>
              <h3 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight mb-3 tracking-tight">{currentField.question}</h3>
              {currentField.subtext && (
                <p className="text-xs font-medium text-gray-400 leading-relaxed">{currentField.subtext}</p>
              )}
            </div>

            <div className="space-y-4 flex-1">
              {currentField.type === 'text' && (
                <div className="animate-slide-up">
                  {currentField.id === 'location' ? (
                    <LocationAutocomplete
                      value={formValues[currentField.key] || ''}
                      onChange={(value) => handleTextInput(value)}
                      placeholder={currentField.placeholder}
                    />
                  ) : ( 
                    <input
                      type="text"
                      value={formValues[currentField.key] || ''}
                      onChange={(e) => handleTextInput(e.target.value)}
                      placeholder={currentField.placeholder}
                      autoFocus
                    />
                  )}
                </div>
              )}

              {(currentField.type === 'selection' || currentField.type === 'multi-selection') && (
                <div className="grid gap-3 animate-slide-up">
                  {getCurrentFieldOptions().map((option) => {
                    const isSelected = currentField.type === 'selection' 
                      ? formValues[currentField.key] === option
                      : multiSelectValues.includes(option);
                    
                    return (
                      <button
                        key={option}
                        onClick={() => currentField.type === 'selection' ? handleSelection(option) : handleMultiSelection(option)}
                        className={`w-full p-4 rounded-xl border transition-all duration-200 group flex items-center gap-4 ${
                          isSelected
                            ? 'border-emerald-200 bg-[#E8F5E9] shadow-sm'
                            : 'border-transparent bg-[#F2F2F0] hover:bg-[#EBEBE8] hover:border-gray-200 shadow-sm'
                        }`}
                      >
                        {currentField.type === 'selection' ? (
                          <div className={`radio-circle ${isSelected ? 'active' : ''}`} />
                        ) : (
                          <div className={`checkbox-box ${isSelected ? 'active' : ''}`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                        <span className={`text-[14px] font-semibold transition-colors ${isSelected ? 'text-emerald-900' : 'text-gray-700'}`}>{option}</span>
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Continue Button moved inside main-content */}
              <div className="mt-10 flex justify-center sm:justify-end">
                <button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || isSubmitting}
                  className={`w-full sm:w-auto sm:min-w-[140px] py-3 px-6 rounded-lg font-bold text-sm transition-all duration-300 flex items-center justify-between gap-3 group ${
                    isCurrentStepValid() && !isSubmitting
                      ? 'bg-emerald-600 text-white shadow-md active:scale-95'
                      : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {isSubmitting ? (
                      <div className="animate-spin h-4 w-4 border-2 border-white border-t-transparent rounded-full" />
                    ) : (
                      <span>Continue</span>
                    )}
                  </div>
                  <svg className="w-4 h-4 transform group-hover:translate-x-0.5 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
