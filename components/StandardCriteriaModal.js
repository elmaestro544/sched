import React from 'react';
import { CloseIcon, CheckIcon } from './Shared.js';
import { STANDARD_DETAILS, Language } from '../constants.js';

const StandardCriteriaModal = ({ isOpen, onClose, standardId, language }) => {
    if (!isOpen || !standardId) return null;

    // Fallback to 'general' if standardId not found, but it should be found.
    const details = STANDARD_DETAILS[standardId] || STANDARD_DETAILS['general'];
    const title = language === Language.AR ? details.title.ar : details.title.en;
    const description = language === Language.AR ? details.description.ar : details.description.en;
    
    // Sort logic? Currently just map index.
    
    return React.createElement('div', {
        className: "fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex justify-center items-center backdrop-blur-md animate-fade-in",
        onClick: onClose
    },
        React.createElement('div', {
            onClick: (e) => e.stopPropagation(),
            className: "bg-white dark:bg-card-gradient w-full max-w-2xl p-6 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 flex flex-col max-h-[90vh]"
        },
            // Header
            React.createElement('div', { className: "flex justify-between items-start mb-6 border-b border-slate-100 dark:border-white/10 pb-4" },
                React.createElement('div', null,
                    React.createElement('h2', { className: "text-2xl font-bold text-slate-900 dark:text-white" }, title),
                    React.createElement('p', { className: "text-sm text-slate-500 dark:text-brand-text-light mt-1" }, description)
                ),
                React.createElement('button', { 
                    onClick: onClose, 
                    className: "text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors bg-slate-50 dark:bg-white/5 p-2 rounded-full" 
                },
                    React.createElement(CloseIcon, { className: "w-5 h-5" })
                )
            ),

            // Content - Scrollable List of Criteria
            React.createElement('div', { className: "overflow-y-auto pr-2 space-y-3" },
                details.criteria.map((item, idx) => {
                    const itemName = language === Language.AR ? item.name.ar : item.name.en;
                    const itemDesc = language === Language.AR ? item.desc.ar : item.desc.en;

                    return React.createElement('div', { key: idx, className: "flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5" },
                        React.createElement('div', { className: "flex-shrink-0 mt-1" },
                             React.createElement('div', { className: "w-6 h-6 rounded-full bg-brand-primary/10 flex items-center justify-center" },
                                React.createElement(CheckIcon, { className: "w-4 h-4 text-brand-primary" })
                             )
                        ),
                        React.createElement('div', null,
                            React.createElement('h4', { className: "font-bold text-slate-800 dark:text-white text-base" }, itemName),
                            React.createElement('p', { className: "text-sm text-slate-600 dark:text-brand-text-light mt-1 leading-relaxed" }, itemDesc)
                        )
                    );
                })
            ),

            // Footer
            React.createElement('div', { className: "mt-6 pt-4 border-t border-slate-100 dark:border-white/10 text-center" },
                React.createElement('button', {
                    onClick: onClose,
                    className: "px-6 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/20 text-slate-700 dark:text-white rounded-lg font-medium transition-colors"
                }, language === Language.AR ? "إغلاق" : "Close")
            )
        )
    );
};

export default StandardCriteriaModal;