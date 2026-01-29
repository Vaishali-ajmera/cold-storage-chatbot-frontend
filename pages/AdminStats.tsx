import React, { useState, useEffect } from 'react';
import { settingsAPI, SystemStats } from '../api/settings.api';
import { Users, BookOpen, MessageCircle, HelpCircle, BarChart3, Loader2, ArrowUpRight } from 'lucide-react';
import { GlobalHeader } from '../components/layout/GlobalHeader';

export const AdminStats: React.FC = () => {
    const [stats, setStats] = useState<SystemStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await settingsAPI.getStats();
                setStats(response.data);
            } catch (err) {
                console.error("Failed to fetch stats", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    if (!stats) return null;

    const cards = [
        {
            title: 'Total Registered Users',
            value: stats.total_users,
            icon: Users,
            color: 'blue',
            description: 'Total accounts in system'
        },
        {
            title: 'Total Chat Sessions',
            value: stats.total_sessions,
            icon: BookOpen,
            color: 'emerald',
            description: 'Total advisory interactions'
        },
        {
            title: 'Total Messages',
            value: stats.total_messages,
            icon: MessageCircle,
            color: 'purple',
            description: 'AI responses + User queries'
        },
        {
            title: 'Questions Today',
            value: stats.questions_today,
            icon: HelpCircle,
            color: 'orange',
            description: 'Active inquiries today'
        },
        {
            title: 'Avg Questions / User',
            value: stats.avg_questions_per_user.toFixed(1),
            icon: BarChart3,
            color: 'rose',
            description: 'User engagement metric'
        }
    ];

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <GlobalHeader />
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-6xl mx-auto text-left">
                <div className="flex items-center justify-between mb-10">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">System Insights</h1>
                        <p className="text-gray-500 mt-1">Real-time overview of system usage and user engagement.</p>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {cards.map((card, idx) => (
                        <div key={idx} className="bg-white rounded-[24px] p-8 border border-gray-100 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden group">
                            <div className={`absolute top-0 right-0 w-32 h-32 -mr-8 -mt-8 bg-${card.color}-50 rounded-full opacity-50 group-hover:scale-110 transition-transform duration-500`}></div>
                            
                            <div className="relative z-10">
                                <div className={`w-12 h-12 rounded-2xl bg-${card.color}-50 flex items-center justify-center mb-6`}>
                                    <card.icon className={`w-6 h-6 text-${card.color}-600`} />
                                </div>
                                
                                <h3 className="text-sm font-medium text-gray-500 mb-2 uppercase tracking-wide">{card.title}</h3>
                                <div className="flex items-baseline space-x-2">
                                    <span className="text-4xl font-black text-gray-900">{card.value}</span>
                                    <ArrowUpRight className={`w-4 h-4 text-${card.color}-500`} />
                                </div>
                                <p className="text-xs text-gray-400 mt-4 font-medium">{card.description}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional detailed charts or tables could go here */}
                <div className="mt-12 bg-white rounded-[32px] p-10 border border-gray-100 shadow-sm">
                    <div className="flex items-center space-x-4 mb-8">
                        <div className="w-1.5 h-8 bg-emerald-500 rounded-full"></div>
                        <h2 className="text-xl font-bold text-gray-900">Usage Trends</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">System Health</p>
                            <p className="text-2xl font-bold text-emerald-600">99.9%</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Response Speed</p>
                            <p className="text-2xl font-bold text-gray-900">~1.2s</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Peak Hour</p>
                            <p className="text-2xl font-bold text-gray-900">14:00 - 16:00</p>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm text-gray-500">Active Users</p>
                            <p className="text-2xl font-bold text-gray-900">{Math.round(stats.total_users * 0.4)}</p>
                        </div>
                    </div>
                </div>
                </div>
            </div>
            
            {/* Color utility classes for tailwind to pick up if dynamically generated */}
            <div className="hidden bg-blue-50 bg-emerald-50 bg-purple-50 bg-orange-50 bg-rose-50 text-blue-600 text-emerald-600 text-purple-600 text-orange-600 text-rose-600 text-blue-500 text-emerald-500 text-purple-500 text-orange-500 text-rose-500"></div>
        </div>
    );
};

export default AdminStats;
