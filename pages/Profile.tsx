import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { GlobalHeader } from '../components/layout/GlobalHeader';

export const Profile: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateProfile } = useAuth();
  
  const [firstName, setFirstName] = useState(user?.first_name || '');
  const [lastName, setLastName] = useState(user?.last_name || '');
  const [language, setLanguage] = useState(user?.preferred_language || 'en');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (user) {
      setFirstName(user.first_name);
      setLastName(user.last_name);
      setLanguage(user.preferred_language);
    }
  }, [user]);

  const languages = [
    { label: 'English', value: 'en' },
    { label: 'Hindi', value: 'hi' },
    { label: 'Bengali', value: 'bn' },
    { label: 'Gujarati', value: 'gu' },
    { label: 'Marathi', value: 'mr' },
    { label: 'Punjabi', value: 'pa' },
    { label: 'Tamil', value: 'ta' },
    { label: 'Telugu', value: 'te' },
    { label: 'Kannada', value: 'kn' },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setSuccess(false);

    try {
      await updateProfile({
        first_name: firstName,
        last_name: lastName,
        preferred_language: language,
      });
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      console.error('Update profile error:', err);
      setError(err.response?.data?.message || 'Failed to update profile. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <GlobalHeader />
      
      <main className="flex-1 overflow-y-auto px-6 py-8 md:py-12">
        <div className="max-w-2xl mx-auto">
          {/* Header Section */}
          <div className="mb-10 flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">My Profile</h1>
              <p className="text-sm text-gray-500 font-medium">Manage your personal information and preferences.</p>
            </div>
            
            <button 
              onClick={() => navigate('/dashboard')}
              className="p-2 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all text-gray-400 hover:text-gray-900"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Profile Card */}
            <div className="bg-white rounded-[32px] p-8 shadow-xl shadow-gray-200/40 border border-gray-100 animate-zoom-in">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* First Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">First Name</label>
                  <input
                    type="text"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl transition-all font-semibold text-gray-900 outline-none"
                    placeholder="Enter first name"
                    required
                  />
                </div>

                {/* Last Name */}
                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Last Name</label>
                  <input
                    type="text"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl transition-all font-semibold text-gray-900 outline-none"
                    placeholder="Enter last name"
                    required
                  />
                </div>

                {/* Email (Read-only) */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Email Address</label>
                  <div className="relative group">
                    <input
                      type="email"
                      value={user?.email || ''}
                      readOnly
                      className="w-full px-5 py-4 bg-gray-100 border-transparent rounded-2xl font-semibold text-gray-500 cursor-not-allowed outline-none"
                    />
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest bg-white px-2 py-1 rounded-md border border-gray-200">System Locked</span>
                    </div>
                  </div>
                </div>

                {/* Preferred Language */}
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-bold text-gray-400 uppercase tracking-widest ml-1">Preferred Language</label>
                  <div className="relative">
                    <select
                      value={language}
                      onChange={(e) => setLanguage(e.target.value)}
                      className="w-full px-5 py-4 bg-gray-50 border-transparent focus:bg-white focus:border-emerald-500 focus:ring-4 focus:ring-emerald-500/5 rounded-2xl transition-all font-semibold text-gray-900 outline-none appearance-none"
                    >
                      {languages.map((lang) => (
                        <option key={lang.value} value={lang.value}>
                          {lang.label}
                        </option>
                      ))}
                    </select>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>

              {/* Status Messages */}
              {error && (
                <div className="mt-8 p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 animate-shake">
                  <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-red-700">{error}</p>
                </div>
              )}

              {success && (
                <div className="mt-8 p-4 bg-emerald-50 border border-emerald-100 rounded-2xl flex items-center gap-3 animate-fade-in">
                  <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <p className="text-sm font-bold text-emerald-700">Profile updated successfully!</p>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <button
                type="submit"
                disabled={isSubmitting}
                className="flex-1 py-4 bg-gray-900 text-white rounded-[22px] font-bold shadow-xl shadow-gray-200 hover:bg-emerald-600 hover:shadow-emerald-100 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <span>Save Changes</span>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => navigate('/dashboard')}
                className="flex-1 py-4 bg-white text-gray-600 border border-gray-200 rounded-[22px] font-bold hover:bg-gray-50 active:scale-[0.98] transition-all"
              >
                Cancel
              </button>
            </div>
          </form>

          {/* Footer Card */}
          <div className="mt-12 p-8 bg-emerald-600 rounded-[32px] text-white shadow-xl shadow-emerald-100/50 flex flex-col md:flex-row items-center gap-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10">
              <svg className="w-32 h-32" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
            </div>
            <div className="flex-1 text-center md:text-left z-10">
              <h3 className="text-xl font-bold mb-1">Expert Advice at your fingertips</h3>
              <p className="text-emerald-100 text-sm font-medium">Your preferences help us tailor the best storage solutions for you.</p>
            </div>
            <button 
              onClick={() => navigate('/dashboard')}
              className="px-6 py-3 bg-white text-emerald-600 rounded-xl font-bold text-sm whitespace-nowrap z-10 hover:bg-emerald-50 transition-colors"
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </main>
    </div>
  );
};
