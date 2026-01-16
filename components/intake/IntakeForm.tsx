import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import formData from '../../form-data.json';
import { LocationAutocomplete } from './LocationAutocomplete';
import { USER_CHOICE_EXISTING, USER_CHOICE_BUILD } from '../../api/intake.api';
import { GlobalHeader } from '../layout/GlobalHeader';

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
  const navigate = useNavigate();
  const [userType, setUserType] = useState<UserType>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [multiSelectValues, setMultiSelectValues] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUserType, setSelectedUserType] = useState<UserType | null>(null);
  // No local splash, moved to App.tsx

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
    setSelectedUserType(type);
    setTimeout(() => {
      setUserType(type);
      setCurrentStepIndex(0);
      setFormValues({});
      setMultiSelectValues([]);
    }, 300);
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
      // Prepare final form data and navigate to transition screen
      const finalFormData = {
        ...formValues,
        [currentField.key]: finalValue
      };
      const userChoice = userType === 'owner' ? USER_CHOICE_EXISTING : USER_CHOICE_BUILD;
      
      // Navigate to transition screen with form data (API call will happen there)
      navigate('/transition', {
        state: { 
          userChoice,
          intakeData: finalFormData
        },
        replace: true
      });
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


  // Splash logic removed as it's global in App.tsx

  // User Type Selection Screen
  if (!userType) {
    return (
      <div className="immersive-layout animate-fade-in relative bg-white h-screen flex flex-col">
        <GlobalHeader 
          navItems={[
            { label: 'Chat History', onClick: onViewHistory }
          ]}
        />

        <div className="flex-1 overflow-y-auto px-6 pt-6 pb-12 flex flex-col items-center">
          <div className="main-content">
            <div className="flex flex-col items-center mb-10 text-center">
              <div className="w-16 h-16 bg-emerald-600 rounded-[22px] flex items-center justify-center mb-6 shadow-xl shadow-emerald-100/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011-1v5m-4 0h4" />
                </svg>
              </div>
              
              <h1 className="mb-3">Let’s plan your cold storage</h1>
              <p className="helper-text max-w-xs mx-auto">
                Select your current status to get started with tailored answers.
              </p>
            </div>

            <div className="w-full space-y-4">
              <div
                onClick={() => handleUserTypeSelect('owner')}
                className={`selection-card ${selectedUserType === 'owner' ? 'active' : ''}`}
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-0.5">I own a cold storage</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Optimize Existing Site</p>
                </div>
              </div>

              <div
                onClick={() => handleUserTypeSelect('builder')}
                className={`selection-card ${selectedUserType === 'builder' ? 'active' : ''}`}
              >
                <div className="w-10 h-10 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                  </svg>
                </div>
                <div>
                  <h3 className="mb-0.5">I want to build a new storage</h3>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Planning & Subsidies</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Form Questions Screen
  return (
    <div className="immersive-layout animate-fade-in overflow-hidden relative bg-white h-screen flex flex-col">
      <GlobalHeader 
        navItems={[
          { label: 'Chat History', onClick: onViewHistory }
        ]}
      />

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
            <div className="mb-10">
              <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-600 mb-2">Guru AI is asking:</p>
              <h1>{currentField.question}</h1>
              {currentField.subtext && (
                <p className="helper-text">{currentField.subtext}</p>
              )}
            </div>

            <div className="space-y-4 flex-1">
              {currentField.type === 'text' && (
                <div className="animate-slide-up">
                  <label className="label-text">Your Answer</label>
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
                    const isMulti = currentField.type === 'multi-selection';
                    
                    return (
                      <div
                        key={option}
                        onClick={() => currentField.type === 'selection' ? handleSelection(option) : handleMultiSelection(option)}
                        className={`selection-card ${isSelected ? 'active' : ''}`}
                      >
                        {/* Show checkbox for multi-selection */}
                        {isMulti && (
                          <div className={`checkbox-box ${isSelected ? 'active' : ''}`}>
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                              </svg>
                            )}
                          </div>
                        )}
                        <span className="text-[15px] font-semibold">{option}</span>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Continue Button moved inside main-content */}
              <div className="mt-12 flex justify-center sm:justify-end">
                <button
                  onClick={handleNext}
                  disabled={!isCurrentStepValid() || isSubmitting}
                  className="btn-primary w-full sm:w-auto sm:min-w-[160px]"
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
