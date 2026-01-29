import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const AdminRoute: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-white">
                <div className="flex flex-col items-center animate-fade-in">
                    <div className="w-12 h-12 bg-emerald-600 rounded-2xl flex items-center justify-center animate-zoom-in shadow-lg shadow-emerald-100">
                        <span className="text-white font-black text-lg">PG</span>
                    </div>
                </div>
            </div>
        );
    }

    // Check if user exists and is_admin flag is true
    if (!user || !user.is_admin) {
        return <Navigate to="/cold-storage-advisory" replace />;
    }

    return <Outlet />;
};

export default AdminRoute;
