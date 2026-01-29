import React, { useState, useEffect } from 'react';
import { settingsAPI, AIConfig, ConfigChoices } from '../api/settings.api';
import { Loader2, Save, RotateCcw, MessageSquare, Settings2, ShieldCheck } from 'lucide-react';
import { GlobalHeader } from '../components/layout/GlobalHeader';

export const AdminSettings: React.FC = () => {
    const [config, setConfig] = useState<AIConfig>({
        response_tone: 'professional',
        response_length: 'moderate',
        max_daily_questions: 50,
        additional_context: '',
        custom_instructions: ''
    });
    const [choices, setChoices] = useState<ConfigChoices>({
        tones: [],
        lengths: []
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [configRes, choicesRes] = await Promise.all([
                    settingsAPI.getConfig(),
                    settingsAPI.getChoices()
                ]);
                
                console.log('Config Response:', configRes);
                console.log('Choices Response:', choicesRes);

                // Extract inner data if response is wrapped
                const configData = (configRes as any).data || configRes;
                const choicesRaw = (choicesRes as any).data || choicesRes;

                if (configData) {
                    setConfig(configData);
                }

                if (choicesRaw) {
                    // Map backend 'tone_choices' and 'length_choices' to state 'tones' and 'lengths'
                    setChoices({
                        tones: choicesRaw.tone_choices || choicesRaw.tones || [],
                        lengths: choicesRaw.length_choices || choicesRaw.lengths || []
                    });
                }
            } catch (err) {
                console.error("Failed to fetch settings", err);
                setMessage({ type: 'error', text: 'Failed to load settings.' });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setMessage(null);
        try {
            await settingsAPI.updateConfig(config);
            setMessage({ type: 'success', text: 'Configuration updated successfully.' });
        } catch (err) {
            console.error("Failed to update settings", err);
            setMessage({ type: 'error', text: 'Failed to update settings.' });
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <Loader2 className="w-8 h-8 text-emerald-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <GlobalHeader />
            <div className="flex-1 py-12 px-4 sm:px-6 lg:px-8">
                <div className="max-w-4xl mx-auto">
                    <div className="flex items-center space-x-3 mb-8">
                    <div className="p-2 bg-emerald-100 rounded-lg">
                        <Settings2 className="w-6 h-6 text-emerald-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">System Configuration</h1>
                        <p className="text-sm text-gray-500 text-left">Control the AI behavior and global system limits.</p>
                    </div>
                </div>

                {message && (
                    <div className={`mb-6 p-4 rounded-xl text-sm font-medium animate-fade-in ${
                        message.type === 'success' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-red-50 text-red-700 border border-red-100'
                    }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex items-center space-x-2">
                                <MessageSquare className="w-5 h-5 text-gray-400" />
                                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Communication Style</h2>
                            </div>
                        </div>
                        <div className="p-8 grid grid-cols-1 md:grid-cols-2 gap-8 text-left">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Response Tone</label>
                                <select
                                    value={config.response_tone}
                                    onChange={(e) => setConfig({ ...config, response_tone: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                >
                                    {choices?.tones?.map((tone: any) => (
                                        <option key={tone.value || tone} value={tone.value || tone}>
                                            {tone.label || tone}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400">Determines the overall personality of the AI.</p>
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Response Length</label>
                                <select
                                    value={config.response_length}
                                    onChange={(e) => setConfig({ ...config, response_length: e.target.value })}
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                >
                                    {choices?.lengths?.map((length: any) => (
                                        <option key={length.value || length} value={length.value || length}>
                                            {length.label || length}
                                        </option>
                                    ))}
                                </select>
                                <p className="text-xs text-gray-400">How much detail should the AI provide by default?</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="p-6 border-b border-gray-50 bg-gray-50/50">
                            <div className="flex items-center space-x-2">
                                <ShieldCheck className="w-5 h-5 text-gray-400" />
                                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">System Constraints</h2>
                            </div>
                        </div>
                        <div className="p-8 space-y-8 text-left">
                            <div className="space-y-2">
                                <label className="block text-sm font-medium text-gray-700">Max Daily Questions</label>
                                <input
                                    type="number"
                                    value={config.max_daily_questions}
                                    onChange={(e) => setConfig({ ...config, max_daily_questions: parseInt(e.target.value) })}
                                    className="max-w-xs w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none"
                                />
                                <p className="text-xs text-gray-400">Global daily limit for questions across all users.</p>
                            </div>
                            
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Additional Context</label>
                                    <textarea
                                        rows={4}
                                        value={config.additional_context}
                                        onChange={(e) => setConfig({ ...config, additional_context: e.target.value })}
                                        placeholder="Enter system-wide context..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                                    />
                                    <p className="text-xs text-gray-400">Background information available to all conversations.</p>
                                </div>
                                <div className="space-y-2">
                                    <label className="block text-sm font-medium text-gray-700">Custom Instructions</label>
                                    <textarea
                                        rows={4}
                                        value={config.custom_instructions}
                                        onChange={(e) => setConfig({ ...config, custom_instructions: e.target.value })}
                                        placeholder="e.g. Always mentions potato variety in every answer..."
                                        className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all outline-none resize-none"
                                    />
                                    <p className="text-xs text-gray-400">Specific behavioral rules the AI must follow.</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center justify-end space-x-4 pt-4">
                        <button
                            type="button"
                            onClick={() => window.location.reload()}
                            className="flex items-center space-x-2 px-6 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 transition-colors"
                        >
                            <RotateCcw className="w-4 h-4" />
                            <span>Discard Changes</span>
                        </button>
                        <button
                            type="submit"
                            disabled={saving}
                            className="flex items-center space-x-2 px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-semibold transition-all shadow-lg shadow-emerald-100 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {saving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
                        </button>
                    </div>
                </form>
                </div>
            </div>
        </div>
    );
};

export default AdminSettings;
