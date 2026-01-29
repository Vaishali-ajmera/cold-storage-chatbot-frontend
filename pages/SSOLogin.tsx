import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const SSOLogin: React.FC = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { ssoLogin } = useAuth();

    useEffect(() => {
        const handleSSO = async () => {
            const token = searchParams.get('token');
            if (!token) return navigate('/login');

            const result = await ssoLogin(token);

            if (result.success && result.user) {
                // Redirect based on role
                if (result.user.is_admin) {
                    navigate('/admin/settings');
                } else {
                    navigate('/cold-storage-advisory');
                }
            } else {
                navigate('/login?error=unauthorized');
            }
        };

        handleSSO();
    }, [searchParams, ssoLogin, navigate]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-white text-gray-900">
            <div className="flex flex-col items-center">
                <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center animate-spin-slow shadow-lg shadow-emerald-100 mb-6">
                    <span className="text-white font-black text-lg">PG</span>
                </div>
                <h2 className="text-xl font-semibold mb-2">Authenticating securely...</h2>
                <p className="text-gray-500 text-sm">Please wait while we verify your credentials.</p>
            </div>
        </div>
    );
};

export default SSOLogin;
