import React, { useState, useRef } from 'react';
import { i18n, PLANNING_STANDARDS, Language, AI_PROVIDERS } from '../constants.js';
import * as apiService from '../services/geminiService.js';
import { Spinner, CopyIcon, UploadIcon, CheckIcon, FocusIcon, PrintIcon, Logo, SettingsIcon } from './Shared.js';
import ReportDashboard from './ReportDashboard.js';
import StandardCriteriaModal from './StandardCriteriaModal.js';

const PMCAgent = ({ language, onOpenSettings }) => {
    const t = i18n[language];
    const [textInput, setTextInput] = useState('');
    const [selectedStandard, setSelectedStandard] = useState('general');
    // Initialize with the first available provider (e.g. OpenAI) if Gemini is missing
    const [selectedProvider, setSelectedProvider] = useState(() => apiService.getFirstAvailableProvider());
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [isImage, setIsImage] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);
    const fileInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);
    
    // State for the Criteria Modal
    const [isCriteriaModalOpen, setIsCriteriaModalOpen] = useState(false);

    const handleAnalyze = async (standardOverride = null) => {
        if ((!textInput.trim() && !filePreview) || isLoading) return;
        
        setErrorMsg(null);

        // Pre-check for API key to avoid round trip error
        if (!apiService.hasKeyForProvider(selectedProvider)) {
            const providerName = AI_PROVIDERS.find(p => p.id === selectedProvider)?.name || selectedProvider;
            setErrorMsg(`Missing API Key for ${providerName}. Please configure it in Settings.`);
            // Automatically open settings if possible, or user clicks button
            return;
        }

        setIsLoading(true);
        // We do not clear the result immediately to allow for a smooth transition or "updating" state
        // if it's a re-analysis. However, the overlay will cover everything.
        
        const standardToUse = standardOverride || selectedStandard;

        try {
            // Priority: File content > Text Input
            const inputData = filePreview || textInput;
            const analysis = await apiService.analyzeSchedule(inputData, isImage, standardToUse, language, selectedProvider);
            setResult(analysis);
        } catch (error) {
            console.error("Analysis Error", error);
            if (error.message === 'DAILY_QUOTA_EXCEEDED') {
                setErrorMsg(language === Language.AR 
                    ? "⚠️ لقد استنفدت رصيد التحليل المجاني لهذا اليوم. يرجى المحاولة غداً أو استخدام مزود آخر."
                    : "⚠️ You have reached your daily free analysis limit. Please try again tomorrow or switch providers.");
            } else {
                setErrorMsg(error.message);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const handleStandardChange = (newStandard) => {
        setSelectedStandard(newStandard);
        handleAnalyze(newStandard);
    };

    const processFile = (file) => {
        if (!file) return;

        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target.result);
                setIsImage(true);
                setTextInput(''); // Clear text input if image is selected
            };
            reader.readAsDataURL(file);
        } else {
            // Assume text/csv/xml
            const reader = new FileReader();
            reader.onload = (e) => {
                setFilePreview(e.target.result); // This will be the text content
                setIsImage(false);
                setTextInput(e.target.result); // Pre-fill text area
            };
            reader.readAsText(file);
        }
    };

    const handleFileChange = (e) => processFile(e.target.files?.[0]);
    
    const handleDragEvents = (e, over) => { 
        e.preventDefault(); 
        e.stopPropagation(); 
        setIsDragOver(over); 
    };
    
    const handleDrop = (e) => { 
        handleDragEvents(e, false); 
        processFile(e.dataTransfer.files?.[0]); 
    };

    return React.createElement('div', { className: "max-w-7xl mx-auto pb-12 animate-fade-in printable-report relative" },
        // --- PRINT ONLY HEADER (Minimal, efficient) ---
        React.createElement('div', { className: "print-only border-b border-black mb-4 pb-2" },
            React.createElement('div', { className: "flex justify-between items-center" },
                React.createElement('div', { className: "flex items-center gap-2" },
                    React.createElement(Logo, { className: "h-8 w-auto grayscale" }), // Grayscale logo for print
                    React.createElement('h1', { className: "text-xl font-bold uppercase tracking-tight" }, "Schedule Analysis Report")
                ),
                React.createElement('div', { className: "text-right text-xs" },
                    React.createElement('p', null, `Date: ${new Date().toLocaleDateString()}`),
                    React.createElement('p', null, `Std: ${PLANNING_STANDARDS.find(s => s.id === selectedStandard)?.name.en || 'General'}`)
                )
            )
        ),

        // Screen Header (Hidden on Print)
        React.createElement('div', { className: "text-center mb-10 no-print" },
            React.createElement('div', { className: "inline-block p-3 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4" },
                 React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-brand-primary", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" })
                )
            ),
            React.createElement('h2', { className: "text-4xl font-extrabold text-slate-900 dark:text-brand-text mb-2" }, t.agentTitle),
            React.createElement('p', { className: "text-lg text-slate-500 dark:text-brand-text-light max-w-2xl mx-auto" }, t.agentDescription)
        ),

        // Input Section (Hidden if result is present, unless we are just re-analyzing in background)
        (!result || isLoading && !result) && React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 no-print mb-12" },
            // Left Sidebar: Configuration
            React.createElement('div', { className: "lg:col-span-4 space-y-6" },
                // Standard Selection
                React.createElement('div', { className: "bg-white dark:bg-card-gradient p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg" },
                    React.createElement('div', { className: "flex justify-between items-center mb-4" },
                        React.createElement('h3', { className: "text-lg font-bold text-slate-900 dark:text-brand-text" }, t.selectStandard),
                        React.createElement('button', {
                            onClick: () => setIsCriteriaModalOpen(true),
                            className: "text-brand-primary hover:text-teal-700 bg-teal-50 dark:bg-teal-900/30 px-2 py-1 rounded text-xs font-bold flex items-center gap-1 transition-colors",
                            title: "View Criteria Details"
                        },
                            React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-4 w-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                                React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
                            ),
                            language === Language.AR ? "عرض المعايير" : "View Criteria"
                        )
                    ),
                    React.createElement('div', { className: "space-y-3" },
                        PLANNING_STANDARDS.map(std => (
                            React.createElement('button', {
                                key: std.id,
                                onClick: () => setSelectedStandard(std.id),
                                className: `w-full text-left p-3 rounded-lg transition-all border flex items-center justify-between group ${selectedStandard === std.id ? 'bg-brand-primary text-white border-brand-primary shadow-md' : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-brand-text-light border-slate-200 dark:border-white/10 hover:border-brand-primary hover:shadow-sm'}`
                            },
                                React.createElement('span', { className: "font-semibold" }, language === Language.AR ? std.name.ar : std.name.en),
                                selectedStandard === std.id && React.createElement(CheckIcon, { className: "h-5 w-5 text-white" })
                            )
                        ))
                    )
                ),
                // AI Provider Selection
                React.createElement('div', { className: "bg-white dark:bg-card-gradient p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg" },
                    React.createElement('h3', { className: "text-lg font-bold text-slate-900 dark:text-brand-text mb-4" }, t.selectProvider),
                    React.createElement('div', { className: "space-y-3" },
                        AI_PROVIDERS.map(p => (
                            React.createElement('button', {
                                key: p.id,
                                onClick: () => { setSelectedProvider(p.id); setErrorMsg(null); },
                                className: `w-full text-left p-3 rounded-lg transition-all border flex items-center justify-between group ${selectedProvider === p.id ? 'bg-indigo-600 text-white border-indigo-600 shadow-md' : 'bg-slate-50 dark:bg-white/5 text-slate-600 dark:text-brand-text-light border-slate-200 dark:border-white/10 hover:border-indigo-500 hover:shadow-sm'}`
                            },
                                React.createElement('div', { className: "flex items-center gap-2" },
                                    React.createElement('span', null, p.icon),
                                    React.createElement('span', { className: "font-semibold" }, p.name)
                                ),
                                selectedProvider === p.id && React.createElement(CheckIcon, { className: "h-5 w-5 text-white" })
                            )
                        ))
                    )
                ),
            ),

            // Right Main Area: Upload & Analysis
            React.createElement('div', { className: "lg:col-span-8 flex flex-col gap-6" },
                // Upload Area
                React.createElement('div', { 
                    className: `relative flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-2xl transition-all cursor-pointer bg-white dark:bg-card-gradient ${isDragOver ? 'border-brand-primary bg-teal-50 dark:bg-teal-900/20' : 'border-slate-300 dark:border-white/20 hover:border-brand-primary/50'}`,
                    onDragOver: (e) => handleDragEvents(e, true),
                    onDragLeave: (e) => handleDragEvents(e, false),
                    onDrop: handleDrop,
                    onClick: () => fileInputRef.current?.click()
                },
                    React.createElement('input', { 
                        type: "file", 
                        ref: fileInputRef,
                        accept: ".csv,.txt,.xml,image/*",
                        onChange: handleFileChange,
                        className: "hidden"
                    }),
                    
                    isImage && filePreview ? (
                        React.createElement('div', { className: "relative w-full" },
                            React.createElement('img', { src: filePreview, alt: "Schedule Preview", className: "max-h-64 mx-auto rounded-lg shadow-md" }),
                            React.createElement('button', { 
                                onClick: (e) => { e.stopPropagation(); setFilePreview(null); setIsImage(false); },
                                className: "absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 shadow-sm"
                            }, 
                                React.createElement('svg', { className: "w-4 h-4", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" }))
                            )
                        )
                    ) : (
                        React.createElement(React.Fragment, null,
                            React.createElement('div', { className: "bg-slate-100 dark:bg-white/10 p-4 rounded-full mb-4" },
                                React.createElement(UploadIcon, { className: "h-8 w-8 text-slate-400 dark:text-brand-text-light" })
                            ),
                            React.createElement('h3', { className: "text-lg font-bold text-slate-700 dark:text-brand-text mb-1" }, t.dragDrop),
                            React.createElement('p', { className: "text-sm text-slate-500 dark:text-brand-text-light text-center" }, t.dragDropSub)
                        )
                    )
                ),

                // Text Area & Action
                React.createElement('div', { className: "bg-white dark:bg-card-gradient rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden flex flex-col h-full" },
                    React.createElement('textarea', {
                        value: textInput,
                        onChange: (e) => { setTextInput(e.target.value); if(isImage) { setFilePreview(null); setIsImage(false); } },
                        placeholder: t.inputPlaceholder,
                        className: "flex-grow w-full p-5 bg-transparent border-none resize-none focus:ring-0 text-slate-800 dark:text-brand-text-light h-40 font-mono text-sm",
                    }),
                    
                    // Error Message Display
                    errorMsg && React.createElement('div', { className: "px-5 py-2" },
                        React.createElement('div', { className: "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-200 p-3 rounded-lg text-sm border border-red-200 dark:border-red-800 flex items-center justify-between gap-2" },
                            React.createElement('div', { className: "flex items-center gap-2" },
                                React.createElement('svg', {className: "w-5 h-5 flex-shrink-0", fill:"none", viewBox:"0 0 24 24", stroke:"currentColor"}, React.createElement('path', {strokeLinecap:"round", strokeLinejoin:"round", strokeWidth:2, d:"M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"})),
                                React.createElement('span', null, errorMsg)
                            ),
                            (errorMsg.includes('configure') || errorMsg.includes('Settings') || errorMsg.includes('Key')) && React.createElement('button', {
                                onClick: onOpenSettings,
                                className: "bg-red-100 hover:bg-red-200 text-red-800 dark:bg-red-800 dark:text-red-100 px-3 py-1 rounded-md text-xs font-bold transition-colors flex items-center gap-1"
                            },
                                React.createElement(SettingsIcon, { className: "w-3 h-3" }),
                                "Settings"
                            )
                        )
                    ),

                    React.createElement('div', { className: "p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex justify-end" },
                        React.createElement('button', {
                            onClick: () => handleAnalyze(null), // Standard check
                            disabled: isLoading || (!textInput.trim() && !filePreview),
                            className: "bg-brand-primary hover:bg-teal-600 text-white font-bold py-3 px-8 rounded-full transition-all flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-brand-primary/20 transform hover:-translate-y-1"
                        },
                            isLoading ? React.createElement(Spinner, { size: '5' }) : React.createElement('svg', { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" })),
                            isLoading ? t.analyzing : t.analyzeButton
                        )
                    )
                )
            )
        ),

        // Unified Loading Overlay for both Initial and Re-analysis
        isLoading && React.createElement('div', { className: "fixed inset-0 bg-slate-900/50 dark:bg-black/70 z-50 flex items-center justify-center backdrop-blur-sm animate-fade-in" },
            React.createElement('div', { className: "bg-white dark:bg-card-gradient p-8 rounded-3xl shadow-2xl flex flex-col items-center border border-slate-100 dark:border-white/10 max-w-sm w-full mx-4 relative overflow-hidden" },
                 // Subtle background shimmer
                 React.createElement('div', { className: "absolute inset-0 bg-gradient-to-tr from-brand-primary/5 to-transparent pointer-events-none" }),
                 
                 // Animated Pulse Ring around Spinner
                React.createElement('div', { className: "relative mb-6" },
                    React.createElement('div', { className: "absolute inset-0 bg-brand-primary/20 rounded-full animate-ping" }),
                    React.createElement(Spinner, { size: "12" })
                ),
                
                // Dynamic Text
                React.createElement('h3', { className: "text-xl font-bold text-slate-900 dark:text-white text-center mb-2" }, 
                    result 
                        ? (language === Language.AR ? "جاري تحديث المعايير..." : "Updating Standards...") 
                        : (language === Language.AR ? "جاري تحليل الجدول..." : "Analyzing Schedule...")
                ),
                React.createElement('p', { className: "text-slate-500 dark:text-brand-text-light text-center text-sm" }, 
                     language === Language.AR 
                        ? "يقوم المساعد الذكي بمراجعة البيانات، يرجى الانتظار..." 
                        : "AI Assistant is reviewing the data, please wait..."
                )
            )
        ),
        
        // Results Section
        result && !isLoading && React.createElement(React.Fragment, null,
             React.createElement('div', { className: "flex flex-col sm:flex-row justify-between items-center mb-6 no-print gap-4" },
                 
                 // Left Side: Standard Switcher
                 React.createElement('div', { className: "flex items-center gap-3 bg-white dark:bg-brand-light-dark p-2 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm" },
                    React.createElement('span', { className: "text-sm font-bold text-slate-500 dark:text-brand-text-light px-2" }, 
                        language === Language.AR ? "معيار المراجعة:" : "Review Standard:"
                    ),
                    React.createElement('select', {
                        value: selectedStandard,
                        onChange: (e) => handleStandardChange(e.target.value),
                        className: "bg-slate-100 dark:bg-black/20 text-slate-800 dark:text-white text-sm font-semibold rounded-lg p-2 border-none focus:ring-2 focus:ring-brand-primary cursor-pointer outline-none"
                    },
                        PLANNING_STANDARDS.map(std => 
                            React.createElement('option', { key: std.id, value: std.id }, 
                                language === Language.AR ? std.name.ar : std.name.en
                            )
                        )
                    ),
                    // Info Button for Results View
                    React.createElement('button', {
                        onClick: () => setIsCriteriaModalOpen(true),
                        className: "p-2 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 transition-colors text-brand-primary",
                        title: "Criteria Info"
                    },
                        React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                            React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
                        )
                    )
                 ),

                 // Right Side: Action Buttons
                 React.createElement('div', { className: "flex gap-4" },
                    React.createElement('button', {
                        onClick: () => { setResult(null); setTextInput(''); setFilePreview(null); setErrorMsg(null); },
                        className: "text-slate-500 hover:text-slate-800 dark:text-slate-300 dark:hover:text-white font-medium transition-colors"
                    }, "New Analysis"),
                     React.createElement('button', {
                        onClick: () => window.print(),
                        className: "flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                    },
                        React.createElement(PrintIcon, { className: "w-5 h-5" }),
                        "Print Report"
                    )
                )
            ),
            React.createElement(ReportDashboard, { data: result, language: language, onUpdate: (newData) => setResult(newData) })
        ),

        // Criteria Modal Instance
        React.createElement(StandardCriteriaModal, {
            isOpen: isCriteriaModalOpen,
            onClose: () => setIsCriteriaModalOpen(false),
            standardId: selectedStandard,
            language: language
        })
    );
};

export default PMCAgent;