
import React, { useState } from 'react';
import { UserType, FormStep } from '../types';
import { OWNER_FLOW, BUILDER_FLOW, POTATO_CATEGORIES } from '../constants';
import { ChevronRight, ArrowLeft, CheckCircle2 } from 'lucide-react';

interface Props {
  onComplete: (userType: UserType, data: any) => void;
}

export const ConversationalForm: React.FC<Props> = ({ onComplete }) => {
  const [userType, setUserType] = useState<UserType | null>(null);
  const [stepIndex, setStepIndex] = useState(-1);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [currentValue, setCurrentValue] = useState<any>('');
  const [confirmedOption, setConfirmedOption] = useState<string | null>(null);
  const [isVisible, setIsVisible] = useState(true);

  const flow = userType === UserType.EXISTING_OWNER ? OWNER_FLOW : BUILDER_FLOW;
  const currentStep: FormStep | null = stepIndex >= 0 ? flow[stepIndex] : null;

  const getDisplayStep = () => {
    if (!currentStep) return null;
    if (currentStep.key === 'variety' && answers['category']) {
      return {
        ...currentStep,
        options: POTATO_CATEGORIES[answers['category']] || []
      };
    }
    return currentStep;
  };

  const activeStep = getDisplayStep();

  const transitionToNext = (val?: any) => {
    const finalValue = val !== undefined ? val : currentValue;
    if (activeStep && !finalValue && activeStep.type !== 'multi-selection') return;
    if (activeStep && activeStep.type === 'multi-selection' && (!finalValue || finalValue.length === 0)) return;

    if (activeStep && (activeStep.type === 'selection' || stepIndex === -1)) {
      setConfirmedOption(finalValue);
    }

    const delay = (activeStep && activeStep.type === 'selection') || stepIndex === -1 ? 400 : 200;

    setTimeout(() => {
      setIsVisible(false);
      setTimeout(() => {
        setConfirmedOption(null);
        if (stepIndex === -1) {
          setStepIndex(0);
        } else {
          const updatedAnswers = { ...answers, [activeStep!.key]: finalValue };
          setAnswers(updatedAnswers);
          if (stepIndex < flow.length - 1) {
            setStepIndex(stepIndex + 1);
            setCurrentValue('');
          } else {
            onComplete(userType!, updatedAnswers);
          }
        }
        setIsVisible(true);
      }, 250);
    }, delay);
  };

  const handleRoleSelect = (type: UserType) => {
    setUserType(type);
    transitionToNext(type);
  };

  const handleMultiSelect = (option: string) => {
    const current = Array.isArray(currentValue) ? currentValue : [];
    if (current.includes(option)) {
      setCurrentValue(current.filter(o => o !== option));
    } else {
      setCurrentValue([...current, option]);
    }
  };

  const isQuestionFlow = stepIndex >= 0;
  const progress = !isQuestionFlow ? 0 : ((stepIndex + 1) / flow.length) * 100;

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col items-center justify-center min-h-screen py-12 px-6 overflow-x-hidden">
      <div className="fixed top-0 left-0 w-full z-50">
        <div className="h-1 bg-gray-100 w-full">
          <div className="h-full bg-emerald-500 transition-all duration-700 ease-out" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className={`w-full transition-all duration-300 transform ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
        {isQuestionFlow && (
          <div className="mb-6">
            <span className="text-[10px] font-bold tracking-widest text-emerald-600 uppercase bg-emerald-50 px-2 py-0.5 rounded-full">
              {stepIndex + 1} / {flow.length}
            </span>
          </div>
        )}

        {stepIndex === -1 && (
          <div className="text-left md:text-center w-full">
            <h1 className="text-3xl font-bold text-gray-900 mb-2 tracking-tight">PotatoGuard AI</h1>
            <p className="text-base text-gray-500 mb-8">Choose your specialized advisory path.</p>
            <div className="grid gap-4 max-w-lg mx-auto">
              <RoleButton 
                title="I have a Cold Storage" 
                desc="Optimize storage, reduce rot, and manage bills." 
                isSelected={confirmedOption === UserType.EXISTING_OWNER}
                onClick={() => handleRoleSelect(UserType.EXISTING_OWNER)}
              />
              <RoleButton 
                title="I want to Build One" 
                desc="Plan costs, technical specs, and subsidies." 
                isSelected={confirmedOption === UserType.NEW_BUILDER}
                onClick={() => handleRoleSelect(UserType.NEW_BUILDER)}
              />
            </div>
          </div>
        )}

        {activeStep && (
          <div className="flex flex-col w-full">
            <button 
              onClick={() => stepIndex === 0 ? (setUserType(null), setStepIndex(-1)) : setStepIndex(stepIndex - 1)}
              className="mb-6 flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" /> Back
            </button>

            <h2 className="text-2xl font-bold text-gray-900 mb-2 leading-snug">{activeStep.question}</h2>
            {activeStep.subtext && <p className="text-sm text-gray-500 mb-8">{activeStep.subtext}</p>}

            <div className="mt-1 w-full">
              {activeStep.type === 'text' || activeStep.type === 'number' ? (
                <div className="relative max-w-md">
                  <input 
                    autoFocus
                    type={activeStep.type}
                    placeholder={activeStep.placeholder}
                    className="w-full text-xl font-medium bg-transparent border-b border-gray-200 focus:border-emerald-500 outline-none py-3 transition-all text-gray-900 placeholder:text-gray-300"
                    value={currentValue}
                    onChange={(e) => setCurrentValue(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && transitionToNext()}
                  />
                  <button onClick={() => transitionToNext()} disabled={!currentValue} className="absolute right-0 bottom-3 p-1.5 bg-black text-white rounded-full disabled:opacity-10 transition-all hover:bg-emerald-600">
                    <ChevronRight className="w-5 h-5" />
                  </button>
                </div>
              ) : activeStep.type === 'selection' ? (
                <div className="grid gap-2 max-h-[45vh] overflow-y-auto scrollbar-hide p-2 -m-2">
                  {activeStep.options?.map(option => (
                    <OptionButton key={option} label={option} isSelected={confirmedOption === option} onClick={() => transitionToNext(option)} />
                  ))}
                </div>
              ) : activeStep.type === 'multi-selection' ? (
                <div className="space-y-6">
                  <div className="grid gap-2 max-h-[40vh] overflow-y-auto scrollbar-hide p-2 -m-2">
                    {activeStep.options?.map(option => (
                      <OptionButton 
                        key={option} 
                        label={option} 
                        isSelected={Array.isArray(currentValue) && currentValue.includes(option)}
                        onClick={() => handleMultiSelect(option)} 
                      />
                    ))}
                  </div>
                  <button onClick={() => transitionToNext()} className="w-full py-4 bg-black text-white text-base font-bold rounded-xl hover:bg-emerald-600 transition-all flex items-center justify-center gap-2">
                    Continue <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const RoleButton: React.FC<{ title: string; desc: string; onClick: () => void; isSelected?: boolean }> = ({ title, desc, onClick, isSelected }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-6 rounded-3xl border-2 transition-all group overflow-hidden ${
      isSelected ? 'bg-emerald-50 border-emerald-500 shadow-md' : 'bg-white apple-shadow border-transparent hover:border-emerald-100 active:scale-[0.99]'
    }`}
  >
    <div className="flex justify-between items-center">
      <div className="pr-4">
        <h3 className={`text-lg font-bold transition-colors ${isSelected ? 'text-emerald-900' : 'text-gray-900 group-hover:text-emerald-600'}`}>{title}</h3>
        <p className={`mt-0.5 text-sm transition-colors ${isSelected ? 'text-emerald-700' : 'text-gray-500'}`}>{desc}</p>
      </div>
      <div className="flex-shrink-0">
        {isSelected ? (
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center animate-scale-in">
            <CheckCircle2 className="w-5 h-5 text-white" />
          </div>
        ) : (
          <div className="w-8 h-8 rounded-full border border-gray-100 flex items-center justify-center group-hover:border-emerald-200">
            <ChevronRight className="w-5 h-5 text-gray-300 group-hover:text-emerald-500" />
          </div>
        )}
      </div>
    </div>
  </button>
);

const OptionButton: React.FC<{ label: string; onClick: () => void; isSelected?: boolean }> = ({ label, onClick, isSelected }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left p-4 text-base font-medium rounded-xl border transition-all flex justify-between items-center ${
      isSelected ? 'bg-emerald-50 border-emerald-500 text-emerald-900' : 'bg-white border-gray-100 text-gray-700 hover:bg-gray-50'
    }`}
  >
    <span className="pr-4">{label}</span>
    <div className={`transition-all duration-300 ${isSelected ? 'scale-100 opacity-100' : 'scale-0 opacity-0'}`}>
      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
    </div>
  </button>
);
