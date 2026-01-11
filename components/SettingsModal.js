import React, { useState, useEffect } from 'react';
import { CloseIcon, LockIcon, CheckIcon } from './Shared.js';

const KEY_MAPPING = {
    'gemini': 'VITE_API_KEY',
    'openai': 'VITE_OPENAI_API_KEY',
    'openrouter': 'VITE_OPENROUTER_API_KEY',
    'perplexity': 'VITE_PERPLEXITY_API_KEY'
};

const PROVIDERS = [
    { id: 'gemini', name: 'Google Gemini', desc: 'Required for default analysis' },
    { id: 'openai', name: 'OpenAI (GPT-4)', desc: 'Advanced reasoning' },
    { id: 'openrouter', name: 'OpenRouter', desc: 'Access to Claude, Llama, etc.' },
    { id: 'perplexity', name: 'Perplexity', desc: 'Real-time web search capability' }
];

const SettingsModal = ({ isOpen, onClose, language }) => {
    const [keys, setKeys] = useState({});
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (isOpen) {
            // Load existing keys from localStorage, env.js (window.process), or Vite build (import.meta.env)
            const loadedKeys = {};
            const runtimeEnv = (typeof window !== 'undefined' && window.process?.env) ? window.process.env : {};

            Object.keys(KEY_MAPPING).forEach(provider => {
                const envVar = KEY_MAPPING[provider];
                let val = null;

                // 1. Check Local Storage
                if (typeof localStorage !== 'undefined') {
                    val = localStorage.getItem(envVar);
                }

                // 2. Check Runtime Environment (env.js)
                if (!val && runtimeEnv[envVar] && !runtimeEnv[envVar].startsWith('__VITE')) {
                    val = runtimeEnv[envVar];
                }

                // 3. Check Build Environment (import.meta.env)
                if (!val) {
                    try {
                        if (typeof import.meta !== 'undefined' && import.meta.env && import.meta.env[envVar]) {
                            const buildVal = import.meta.env[envVar];
                            if (buildVal && !buildVal.startsWith('__VITE')) {
                                val = buildVal;
                            }
                        }
                    } catch(e) {}
                }

                loadedKeys[provider] = val || '';
            });
            setKeys(loadedKeys);
            setStatus('');
        }
    }, [isOpen]);

    const handleSave = () => {
        Object.keys(keys).forEach(provider => {
            const envVar = KEY_MAPPING[provider];
            const val = keys[provider];
            if (val) {
                localStorage.setItem(envVar, val);
            } else {
                localStorage.removeItem(envVar);
            }
        });
        setStatus('Saved! Reloading...');
        setTimeout(() => {
            window.location.reload(); // Reload to ensure services pick up new keys
        }, 1000);
    };

    if (!isOpen) return null;

    return React.createElement('div', {
        className: "fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex justify-center items-center backdrop-blur-md animate-fade-in",
        onClick: onClose
    },
        React.createElement('div', {
            onClick: (e) => e.stopPropagation(),
            className: "bg-white dark:bg-card-gradient w-full max-w-lg p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10"
        },
            React.createElement('div', { className: "flex justify-between items-center mb-6" },
                React.createElement('h2', { className: "text-2xl font-bold text-slate-900 dark:text-white" }, "API Configuration"),
                React.createElement('button', { onClick: onClose, className: "text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white" },
                    React.createElement(CloseIcon, null)
                )
            ),
            
            React.createElement('p', { className: "text-sm text-slate-500 dark:text-brand-text-light mb-6" }, 
                "Enter your API keys below. If you have configured them in Coolify/Environment Variables, they will appear here automatically."
            ),

            React.createElement('div', { className: "space-y-4 max-h-[60vh] overflow-y-auto pr-2" },
                PROVIDERS.map(p => (
                    React.createElement('div', { key: p.id, className: "bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5" },
                        React.createElement('label', { className: "block text-sm font-bold text-slate-700 dark:text-white mb-1" }, p.name),
                        React.createElement('p', { className: "text-xs text-slate-500 dark:text-brand-text-light mb-2" }, p.desc),
                        React.createElement('div', { className: "relative" },
                            React.createElement('div', { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" },
                                React.createElement(LockIcon, { className: "h-4 w-4 text-slate-400" })
                            ),
                            React.createElement('input', {
                                type: "password",
                                placeholder: `sk-...`,
                                value: keys[p.id] || '',
                                onChange: (e) => setKeys({ ...keys, [p.id]: e.target.value }),
                                className: "w-full py-2 pl-10 pr-4 bg-white dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-lg text-sm focus:ring-2 focus:ring-brand-primary focus:outline-none dark:text-white font-mono"
                            })
                        )
                    )
                ))
            ),

            React.createElement('div', { className: "mt-6 pt-4 border-t border-slate-200 dark:border-white/10 flex items-center justify-between" },
                 status ? (
                     React.createElement('div', { className: "flex items-center text-green-600 font-bold animate-pulse" },
                        React.createElement(CheckIcon, { className: "w-5 h-5 mr-2" }),
                        status
                     )
                 ) : (
                     React.createElement('div', null)
                 ),
                 React.createElement('button', {
                    onClick: handleSave,
                    className: "bg-brand-primary hover:bg-teal-600 text-white font-bold py-2 px-6 rounded-lg shadow-lg transition-transform hover:-translate-y-0.5"
                 }, "Save & Reload")
            )
        )
    );
};

export default SettingsModal;