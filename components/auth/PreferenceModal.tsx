import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export const PreferenceModal: React.FC = () => {
  const { user, updateProfile } = useAuth();
  const [selectedLanguage, setSelectedLanguage] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Languages based on form-data.json
  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Bengali', value: 'bn' },
    { label: 'Gujarati', value: 'gu' },
    { label: 'Marathi', value: 'mr' },
    { label: 'Punjabi', value: 'pa' },
  ];

  if (!user || user.has_set_preferences) return null;

  const handleSubmit = async () => {
    if (!selectedLanguage) return;
    
    setIsSubmitting(true);
    setError(null);
    try {
      await updateProfile({ preferred_language: selectedLanguage });
      // updateProfile will update the global user state and set has_set_preferences to true
    } catch (err: any) {
      console.error('Failed to set preferences:', err);
      setError('Failed to update preferences. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-end md:items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="w-full md:max-w-md bg-white rounded-t-[32px] md:rounded-[32px] p-8 shadow-2xl animate-slide-up md:animate-zoom-in">
        {/* Header */}
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6 shadow-xl shadow-emerald-100">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome, {user.first_name}!</h1>
          <p className="text-sm text-gray-500 max-w-[260px]">
            Please select your preferred language to customize your expert advice.
          </p>
        </div>

        {/* Language Selection Grid */}
        <div className="grid grid-cols-2 gap-3 mb-10">
          {languages.map((lang) => (
            <button
              key={lang.value}
              onClick={() => setSelectedLanguage(lang.value)}
              className={`flex flex-col items-center p-4 rounded-2xl border-2 transition-all duration-200 ${
                selectedLanguage === lang.value
                  ? 'bg-emerald-50 border-emerald-500 scale-[0.98]'
                  : 'bg-gray-50 border-transparent hover:border-gray-200'
              }`}
            >
              <span className={`text-[15px] font-bold ${
                selectedLanguage === lang.value ? 'text-emerald-700' : 'text-gray-700'
              }`}>
                {lang.label}
              </span>
            </button>
          ))}
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3">
            <svg className="w-5 h-5 text-red-500 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm font-medium text-red-700">{error}</p>
          </div>
        )}

        {/* Action Button */}
        <button
          onClick={handleSubmit}
          disabled={!selectedLanguage || isSubmitting}
          className="w-full py-4 bg-emerald-600 text-white rounded-2xl font-bold shadow-lg shadow-emerald-100 hover:bg-emerald-700 active:scale-95 transition-all flex items-center justify-center gap-3 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              <span>Get Started</span>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </>
          )}
        </button>

        <p className="mt-6 text-center text-[10px] font-bold text-gray-400 uppercase tracking-widest">
          You can change this anytime in settings
        </p>
      </div>
    </div>
  );
};
