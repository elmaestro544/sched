import React, { useState, useEffect } from 'react';
import { CloseIcon, LockIcon, CheckIcon } from './Shared.js';
import { AI_PROVIDERS } from '../constants.js';

const KEY_MAPPING = {
    'gemini': 'VITE_API_KEY',
    'openai': 'VITE_OPENAI_API_KEY',
    'openrouter': 'VITE_OPENROUTER_API_KEY',
    'perplexity': 'VITE_PERPLEXITY_API_KEY',
    'groq': 'VITE_GROQ_API_KEY'
};

const MODEL_KEY_MAPPING = {
    'gemini': 'VITE_GEMINI_MODEL',
    'openai': 'VITE_OPENAI_MODEL',
    'openrouter': 'VITE_OPENROUTER_MODEL',
    'perplexity': 'VITE_PERPLEXITY_MODEL',
    'groq': 'VITE_GROQ_MODEL'
};

const SettingsModal = ({ isOpen, onClose, language }) => {
    const [keys, setKeys] = useState({});
    const [models, setModels] = useState({});
    const [status, setStatus] = useState('');

    useEffect(() => {
        if (isOpen) {
            const loadedKeys = {};
            const loadedModels = {};
            const runtimeEnv = (typeof window !== 'undefined' && window.process?.env) ? window.process.env : {};

            AI_PROVIDERS.forEach(provider => {
                // 1. Load Keys
                const envVar = KEY_MAPPING[provider.id];
                let val = null;

                if (typeof localStorage !== 'undefined') {
                    val = localStorage.getItem(envVar);
                }
                if (!val && runtimeEnv[envVar] && !runtimeEnv[envVar].startsWith('__VITE')) {
                    val = runtimeEnv[envVar];
                }
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
                loadedKeys[provider.id] = val || '';

                // 2. Load Models
                const modelEnvVar = MODEL_KEY_MAPPING[provider.id];
                let modelVal = null;
                if (typeof localStorage !== 'undefined') {
                    modelVal = localStorage.getItem(modelEnvVar);
                }
                // Fallback to env or default
                if (!modelVal && runtimeEnv[modelEnvVar] && !runtimeEnv[modelEnvVar].startsWith('__VITE')) {
                    modelVal = runtimeEnv[modelEnvVar];
                }
                
                loadedModels[provider.id] = modelVal || provider.defaultModel;
            });

            setKeys(loadedKeys);
            setModels(loadedModels);
            setStatus('');
        }
    }, [isOpen]);

    const handleSave = () => {
        // Save Keys
        Object.keys(keys).forEach(providerId => {
            const envVar = KEY_MAPPING[providerId];
            const val = keys[providerId];
            if (val) {
                localStorage.setItem(envVar, val);
            } else {
                localStorage.removeItem(envVar);
            }
        });

        // Save Models
        Object.keys(models).forEach(providerId => {
            const envVar = MODEL_KEY_MAPPING[providerId];
            const val = models[providerId];
            if (val) {
                localStorage.setItem(envVar, val);
            } else {
                localStorage.removeItem(envVar);
            }
        });

        setStatus('Saved! Reloading...');
        setTimeout(() => {
            window.location.reload(); 
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
                "Configure your API keys and select preferred models."
            ),

            React.createElement('div', { className: "space-y-4 max-h-[60vh] overflow-y-auto pr-2" },
                AI_PROVIDERS.map(p => (
                    React.createElement('div', { key: p.id, className: "bg-slate-50 dark:bg-white/5 p-4 rounded-xl border border-slate-100 dark:border-white/5" },
                        React.createElement('div', { className: "flex justify-between items-center mb-2" },
                            React.createElement('label', { className: "block text-sm font-bold text-slate-700 dark:text-white" }, p.name),
                            React.createElement('select', {
                                value: models[p.id] || p.defaultModel,
                                onChange: (e) => setModels({ ...models, [p.id]: e.target.value }),
                                className: "bg-white dark:bg-black/20 text-xs border border-slate-200 dark:border-white/10 rounded px-2 py-1 text-slate-700 dark:text-white focus:outline-none focus:ring-1 focus:ring-brand-primary"
                            },
                                p.models?.map(m => (
                                    React.createElement('option', { key: m.id, value: m.id }, m.name)
                                ))
                            )
                        ),
                        React.createElement('p', { className: "text-xs text-slate-500 dark:text-brand-text-light mb-2" }, p.description),
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