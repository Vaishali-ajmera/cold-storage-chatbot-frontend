import React, { useState } from 'react';
import { ForgotPasswordForm } from '../components/auth/ForgotPasswordForm';
import { VerifyOTPForm } from '../components/auth/VerifyOTPForm';
import { ResetPasswordForm } from '../components/auth/ResetPasswordForm';

type ForgotPasswordStep = 'request-otp' | 'verify-otp' | 'reset-password';

export const ForgotPassword: React.FC = () => {
  const [step, setStep] = useState<ForgotPasswordStep>('request-otp');
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');

  const handleOTPSent = (userEmail: string) => {
    setEmail(userEmail);
    setStep('verify-otp');
  };

  const handleOTPVerified = (verifiedOTP: string) => {
    setOtp(verifiedOTP);
    setStep('reset-password');
  };

  const handleBackToRequest = () => {
    setStep('request-otp');
    setEmail('');
    setOtp('');
  };

  return (
    <>
      {step === 'request-otp' && (
        <ForgotPasswordForm onOTPSent={handleOTPSent} />
      )}
      
      {step === 'verify-otp' && (
        <VerifyOTPForm
          email={email}
          onOTPVerified={handleOTPVerified}
          onBack={handleBackToRequest}
        />
      )}
      
      {step === 'reset-password' && (
        <ResetPasswordForm email={email} otp={otp} />
      )}
    </>
  );
};
