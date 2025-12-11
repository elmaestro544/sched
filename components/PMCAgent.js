import React, { useState, useRef } from 'react';
import { i18n, PLANNING_STANDARDS, Language } from '../constants.js';
import * as apiService from '../services/geminiService.js';
import { Spinner, CopyIcon, UploadIcon, CheckIcon, FocusIcon, PrintIcon, Logo } from './Shared.js';

const PMCAgent = ({ language }) => {
    const t = i18n[language];
    const [textInput, setTextInput] = useState('');
    const [selectedStandard, setSelectedStandard] = useState('general');
    const [result, setResult] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const [copiedNote, setCopiedNote] = useState(false);
    const [filePreview, setFilePreview] = useState(null);
    const [isImage, setIsImage] = useState(false);
    const fileInputRef = useRef(null);
    const [isDragOver, setIsDragOver] = useState(false);

    const handleAnalyze = async () => {
        if ((!textInput.trim() && !filePreview) || isLoading) return;
        
        setIsLoading(true);
        setResult(null);
        
        try {
            // Priority: File content > Text Input
            const inputData = filePreview || textInput;
            const analysis = await apiService.analyzeSchedule(inputData, isImage, selectedStandard, language);
            setResult(analysis);
        } catch (error) {
            console.error("Analysis Error", error);
            alert(t.errorOccurred);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCopyNote = () => {
        if (result?.contractorNote) {
            navigator.clipboard.writeText(result.contractorNote);
            setCopiedNote(true);
            setTimeout(() => setCopiedNote(false), 2000);
        }
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

    const getRiskColor = (level) => {
        const l = level?.toLowerCase();
        if (l === 'high') return 'text-red-600 bg-red-100 border-red-200';
        if (l === 'medium') return 'text-yellow-600 bg-yellow-100 border-yellow-200';
        return 'text-teal-600 bg-teal-100 border-teal-200';
    };

    return React.createElement('div', { className: "max-w-6xl mx-auto pb-12 animate-fade-in printable-report" },
        // Header
        React.createElement('div', { className: "text-center mb-10 no-print" },
            React.createElement('div', { className: "inline-block p-3 rounded-2xl bg-teal-100 dark:bg-teal-900/30 mb-4" },
                 React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-10 w-10 text-brand-primary", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                    React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" })
                )
            ),
            React.createElement('h2', { className: "text-4xl font-extrabold text-slate-900 dark:text-brand-text mb-2" }, t.agentTitle),
            React.createElement('p', { className: "text-lg text-slate-500 dark:text-brand-text-light max-w-2xl mx-auto" }, t.agentDescription)
        ),

        // Input Section
        React.createElement('div', { className: "grid grid-cols-1 lg:grid-cols-12 gap-8 no-print" },
            // Left Sidebar: Standards
            React.createElement('div', { className: "lg:col-span-4 space-y-6" },
                React.createElement('div', { className: "bg-white dark:bg-card-gradient p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg" },
                    React.createElement('h3', { className: "text-lg font-bold text-slate-900 dark:text-brand-text mb-4" }, t.selectStandard),
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
                
                // Info Card
                React.createElement('div', { className: "bg-teal-50 dark:bg-teal-900/10 p-5 rounded-2xl border border-teal-100 dark:border-teal-800/30" },
                    React.createElement('h4', { className: "text-teal-800 dark:text-teal-300 font-bold mb-2 flex items-center gap-2" },
                        React.createElement('svg', { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                            React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" })
                        ),
                        "Expert Tip"
                    ),
                    React.createElement('p', { className: "text-sm text-teal-700 dark:text-teal-200" }, 
                        "Upload Gantt charts or Schedule Logs. The expert model will perform a deep forensic analysis of logic, float, and constraints."
                    )
                )
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
                    React.createElement('div', { className: "p-4 border-t border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex justify-end" },
                        React.createElement('button', {
                            onClick: handleAnalyze,
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

        // Results Section
        result && React.createElement('div', { className: "mt-12 space-y-8 animate-fade-in-up" },
            
            // Print Report Button (Visible on screen)
            React.createElement('div', { className: "flex justify-end no-print" },
                 React.createElement('button', {
                    onClick: () => window.print(),
                    className: "flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-bold py-2 px-4 rounded-lg transition-colors shadow-md"
                },
                    React.createElement(PrintIcon, { className: "w-5 h-5" }),
                    "Print Report"
                )
            ),

            // Print Header (Visible only in print)
            React.createElement('div', { className: "print-only mb-8" },
                 React.createElement('div', { className: "flex items-center gap-4 mb-4" },
                    React.createElement(Logo, { className: "h-16 w-auto" }),
                    React.createElement('div', null,
                        React.createElement('h1', { className: "text-3xl font-bold text-black" }, "Schedule Quality Assessment Report"),
                        React.createElement('p', { className: "text-gray-600" }, "Generated by SchedAI PMC Agent")
                    )
                 ),
                 React.createElement('div', { className: "border-b-2 border-black mb-4" }),
                 React.createElement('p', { className: "text-sm text-gray-800 mb-6" }, 
                    React.createElement('strong', null, "Date: "), new Date().toLocaleDateString(),
                    React.createElement('span', { className: "mx-4" }, "|"),
                    React.createElement('strong', null, "Standard: "), PLANNING_STANDARDS.find(s => s.id === selectedStandard)?.name.en || 'General'
                 )
            ),
            
            // 1. Executive Summary & Findings Grid
            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-8" },
                // Summary Card
                React.createElement('div', { className: "bg-white dark:bg-card-gradient p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg flex flex-col" },
                    React.createElement('h3', { className: "text-xl font-bold text-brand-blue mb-4 flex items-center gap-3 border-b border-slate-100 dark:border-white/10 pb-3" }, 
                        React.createElement('div', { className: "bg-brand-primary/10 p-2 rounded-lg" },
                            React.createElement('svg', { className: "w-5 h-5 text-brand-primary", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }))
                        ),
                        t.analysisReport
                    ),
                    React.createElement('p', { className: "text-slate-700 dark:text-brand-text-light mb-6 leading-relaxed" }, result.summary),
                    
                    // Risk Assessment Section (Decision Support)
                    result.riskLevel && React.createElement('div', { className: `mt-auto p-4 rounded-xl border ${getRiskColor(result.riskLevel)}` },
                        React.createElement('div', { className: "flex justify-between items-center mb-2" },
                            React.createElement('h4', { className: "font-bold" }, t.riskAssessment),
                            React.createElement('span', { className: "font-extrabold px-3 py-1 rounded-full bg-white/50 text-sm uppercase badge" }, result.riskLevel)
                        ),
                        React.createElement('p', { className: "text-sm" }, result.riskAssessment)
                    )
                ),

                // Non-Compliance & Findings
                React.createElement('div', { className: "space-y-6" },
                     // Technical Findings
                     React.createElement('div', { className: "bg-white dark:bg-card-gradient p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg" },
                        React.createElement('h4', { className: "font-bold text-slate-900 dark:text-brand-text mb-3 flex items-center gap-2" }, 
                            React.createElement(FocusIcon, { className: "w-5 h-5 text-brand-primary" }),
                            t.technicalFindings
                        ),
                        React.createElement('ul', { className: "space-y-3" },
                            result.findings.map((item, idx) => (
                                React.createElement('li', { key: idx, className: "flex items-start gap-3 text-sm text-slate-600 dark:text-brand-text-light bg-slate-50 dark:bg-white/5 p-3 rounded-lg" },
                                    React.createElement('span', { className: "text-brand-primary font-bold mt-0.5" }, "•"),
                                    item
                                )
                            ))
                        )
                    ),
                    // Non Compliance
                    React.createElement('div', { className: "bg-white dark:bg-card-gradient p-6 rounded-2xl border border-red-100 dark:border-red-900/30 shadow-lg" },
                        React.createElement('h3', { className: "text-lg font-bold text-brand-red mb-3 flex items-center gap-2" }, 
                             React.createElement('svg', { className: "w-5 h-5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" })),
                            t.nonCompliance
                        ),
                        React.createElement('ul', { className: "space-y-2" },
                            result.nonCompliance.map((item, idx) => (
                                React.createElement('li', { key: idx, className: "flex items-start gap-3 text-sm" },
                                    React.createElement('svg', { className: "w-4 h-4 text-brand-red flex-shrink-0 mt-0.5", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                                        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M6 18L18 6M6 6l12 12" })
                                    ),
                                    React.createElement('span', { className: "text-slate-800 dark:text-brand-text" }, item)
                                )
                            ))
                        )
                    )
                )
            ),

            // 2. Recommendations (New Section)
            result.recommendations && React.createElement('div', { className: "bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20" },
                React.createElement('h3', { className: "text-xl font-bold text-blue-800 dark:text-blue-300 mb-4 flex items-center gap-2" },
                    React.createElement('svg', { className: "w-6 h-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" })),
                    t.recommendations
                ),
                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                    result.recommendations.map((rec, idx) => (
                        React.createElement('div', { key: idx, className: "flex items-start gap-3 bg-white dark:bg-card-gradient p-4 rounded-xl shadow-sm" },
                            React.createElement('span', { className: "font-bold text-blue-500 text-lg" }, idx + 1),
                            React.createElement('p', { className: "text-slate-700 dark:text-brand-text-light text-sm" }, rec)
                        )
                    ))
                )
            ),

            // 3. Contractor Note
            React.createElement('div', { className: "bg-slate-900 text-slate-100 p-1 rounded-2xl shadow-2xl" },
                React.createElement('div', { className: "bg-gradient-to-r from-slate-800 to-slate-900 rounded-xl p-8 border border-slate-700 relative overflow-hidden" },
                    React.createElement('div', { className: "absolute top-0 right-0 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl" }),
                    
                    React.createElement('div', { className: "flex justify-between items-center mb-6 relative z-10" },
                        React.createElement('h3', { className: "text-xl font-bold text-white flex items-center gap-3" },
                            React.createElement('svg', { className: "w-6 h-6 text-brand-primary", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" }, React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" })),
                            t.contractorNote
                        ),
                        React.createElement('button', {
                            onClick: handleCopyNote,
                            className: "flex items-center gap-2 text-xs font-bold bg-white/10 hover:bg-white/20 py-2 px-4 rounded-full transition-colors no-print"
                        },
                            React.createElement(CopyIcon, { className: "w-4 h-4" }),
                            copiedNote ? t.copied : t.copy
                        )
                    ),
                    React.createElement('div', { className: "font-mono text-sm leading-relaxed whitespace-pre-wrap bg-black/30 p-6 rounded-xl border border-white/10 relative z-10 text-slate-300" },
                        result.contractorNote
                    )
                )
            )
        )
    );
};

export default PMCAgent;