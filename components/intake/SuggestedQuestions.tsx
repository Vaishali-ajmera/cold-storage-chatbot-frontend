import React from 'react';

interface SuggestedQuestionsProps {
  questions: string[];
  onQuestionClick: (question: string) => void;
}

export const SuggestedQuestions: React.FC<SuggestedQuestionsProps> = ({
  questions,
  onQuestionClick,
}) => {
  return (
    <div className="h-full flex items-center justify-center bg-gray-50 p-6">
      <div className="max-w-3xl w-full">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-100 rounded-full mb-4">
            <svg className="w-8 h-8 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Great! Here are some questions to get you started</h2>
          <p className="text-gray-600">Click on any question below or type your own</p>
        </div>

        <div className="grid gap-4">
          {questions.map((question, index) => (
            <button
              key={index}
              onClick={() => onQuestionClick(question)}
              className="group p-5 bg-white border-2 border-gray-200 rounded-xl text-left hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-start gap-3">
                <div className="flex-shrink-0 w-8 h-8 bg-emerald-100 group-hover:bg-emerald-200 rounded-lg flex items-center justify-center transition">
                  <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
                <span className="flex-1 text-gray-900 font-medium group-hover:text-emerald-900">
                  {question}
                </span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-8 text-center">
          <p className="text-sm text-gray-500">
            💡 You can ask up to 4 questions in this session
          </p>
        </div>
      </div>
    </div>
  );
};
