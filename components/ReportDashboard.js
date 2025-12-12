import React, { useState, useEffect } from 'react';
import { i18n } from '../constants.js';
import { CheckIcon, CloseIcon, GridIcon, ListIcon, FocusIcon, EditIcon, SaveIcon } from './Shared.js';

// --- Helper for Localization ---
const getLocalizedContent = (item, language) => {
    if (!item) return '';
    if (typeof item === 'string') return item;
    return item[language] || item['en'] || '';
};

// --- Editable Content Helper ---
const EditableContent = ({ isEditing, value, onChange, className, multiline = false, label }) => {
    if (!isEditing) return React.createElement('div', { className }, value);

    const inputClass = "w-full p-2 bg-slate-50 dark:bg-black/30 border border-slate-300 dark:border-white/20 rounded focus:ring-2 focus:ring-brand-primary focus:border-transparent outline-none transition-all";

    return React.createElement('div', { className: "w-full" },
        label && React.createElement('label', { className: "block text-xs font-bold text-slate-500 mb-1" }, label),
        multiline ? 
            React.createElement('textarea', { 
                className: `${inputClass} min-h-[120px] ${className}`, 
                value: value, 
                onChange: e => onChange(e.target.value) 
            }) :
            React.createElement('input', { 
                type: "text",
                className: `${inputClass} ${className}`, 
                value: value, 
                onChange: e => onChange(e.target.value) 
            })
    );
};

// --- Sub-Components ---

const StatCard = ({ label, value, subtext, isEditing, onChange }) => (
    React.createElement('div', { className: "bg-white dark:bg-brand-light-dark p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-sm flex flex-col items-center justify-center text-center print-stat-card" },
        React.createElement('span', { className: "text-slate-500 dark:text-brand-text-light text-sm font-medium uppercase tracking-wide" }, label),
        isEditing ? (
            React.createElement('input', {
                type: "text",
                value: value,
                onChange: (e) => onChange(e.target.value),
                className: "text-center text-2xl font-bold bg-slate-50 dark:bg-black/20 border-b border-brand-primary focus:outline-none w-24 my-2"
            })
        ) : (
            React.createElement('span', { className: "text-3xl font-bold text-slate-800 dark:text-white my-2" }, value)
        ),
        subtext && React.createElement('span', { className: "text-xs text-slate-400" }, subtext)
    )
);

const DCMAItem = ({ metric, value, target, status, t, language }) => {
    const isPass = status === 'PASS';
    const displayMetric = getLocalizedContent(metric, language);

    return (
        React.createElement('div', { className: "bg-white dark:bg-brand-light-dark p-3 rounded-lg border border-slate-200 dark:border-white/10 shadow-sm flex flex-col justify-between" },
            React.createElement('div', { className: "flex justify-between items-start mb-2" },
                React.createElement('span', { className: "text-xs font-bold text-slate-500 dark:text-slate-400" }, displayMetric),
                isPass ? 
                    React.createElement('span', { className: "bg-green-100 text-green-700 text-[10px] font-bold px-2 py-0.5 rounded" }, t.valPass || "PASS") : 
                    React.createElement('span', { className: "bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded" }, t.valFail || "FAIL")
            ),
            React.createElement('div', { className: `text-2xl font-bold text-center ${isPass ? 'text-green-600' : 'text-red-600'}` },
                `${value}%`
            ),
            React.createElement('div', { className: "text-[10px] text-center text-slate-400 mt-1" },
                `${t.lblTarget}: ${target}%`
            )
        )
    );
};

// --- New Compliance Table Component ---
const ComplianceTable = ({ checks, isEditing, onUpdate, language, t }) => {
    const updateCheck = (index, field, val) => {
        const updatedChecks = [...checks];
        updatedChecks[index] = { ...updatedChecks[index], [field]: val };
        onUpdate(updatedChecks);
    };

    return React.createElement('div', { className: "bg-white dark:bg-brand-light-dark rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden shadow-lg mt-8" },
        React.createElement('div', { className: "bg-blue-50 dark:bg-blue-900/20 px-4 py-3 border-b border-slate-200 dark:border-white/10 flex items-center gap-2" },
            React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 text-blue-600 dark:text-blue-400", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
               React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" })
            ),
            React.createElement('h3', { className: "font-bold text-slate-800 dark:text-white" }, "Check Summary (Detailed Analysis)")
        ),
        React.createElement('div', { className: "overflow-x-auto" },
            React.createElement('table', { className: "w-full text-sm text-left border-collapse" },
                // Header
                React.createElement('thead', { className: "bg-blue-50/50 dark:bg-white/5 text-slate-700 dark:text-brand-text-light font-bold" },
                    React.createElement('tr', null,
                        React.createElement('th', { className: "p-3 border-r border-slate-200 dark:border-white/10 w-1/4" }, t.colCheck),
                        React.createElement('th', { className: "p-3 border-r border-slate-200 dark:border-white/10 w-1/3" }, t.colDescription),
                        React.createElement('th', { className: "p-3 border-r border-slate-200 dark:border-white/10 w-24 text-center" }, t.colTarget),
                        React.createElement('th', { className: "p-3 border-r border-slate-200 dark:border-white/10 w-24 text-center" }, t.colActual),
                        React.createElement('th', { className: "p-3 border-r border-slate-200 dark:border-white/10 w-20 text-center" }, t.colFound),
                        React.createElement('th', { className: "p-3 w-20 text-center" }, t.colTotal)
                    )
                ),
                // Body
                React.createElement('tbody', null,
                    checks.map((item, idx) => {
                        const isPass = item.status === 'PASS';
                        const metricName = getLocalizedContent(item.metric, language);
                        const description = getLocalizedContent(item.description, language) || '-';
                        const targetStr = `${item.operator || ''} ${item.target}%`;
                        const found = item.found !== undefined ? item.found : '-';
                        const total = item.total !== undefined ? item.total : '-';

                        return React.createElement('tr', { key: idx, className: "border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5" },
                            React.createElement('td', { className: "p-3 border-r border-slate-100 dark:border-white/5 font-medium text-slate-800 dark:text-white" }, metricName),
                            React.createElement('td', { className: "p-3 border-r border-slate-100 dark:border-white/5 text-slate-600 dark:text-brand-text-light" }, description),
                            React.createElement('td', { className: "p-3 border-r border-slate-100 dark:border-white/5 text-center text-slate-600 dark:text-brand-text-light" }, targetStr),
                            
                            // Actual (Color Coded)
                            React.createElement('td', { className: `p-3 border-r border-slate-100 dark:border-white/5 text-center font-bold ${isPass ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}` },
                                isEditing ? 
                                    React.createElement('input', {
                                        type: "text",
                                        value: item.value,
                                        onChange: (e) => updateCheck(idx, 'value', e.target.value),
                                        className: "w-16 bg-white/20 text-white text-center rounded border-none focus:ring-1 focus:ring-white"
                                    }) : `${item.value}%`
                            ),

                            // Found
                            React.createElement('td', { className: "p-3 border-r border-slate-100 dark:border-white/5 text-center text-slate-600 dark:text-brand-text-light" },
                                isEditing ? 
                                    React.createElement('input', {
                                        type: "text",
                                        value: item.found !== undefined ? item.found : '',
                                        onChange: (e) => updateCheck(idx, 'found', e.target.value),
                                        className: "w-12 bg-slate-100 dark:bg-white/10 text-center rounded border-none"
                                    }) : found
                            ),

                            // Total
                            React.createElement('td', { className: "p-3 text-center text-slate-600 dark:text-brand-text-light" },
                                isEditing ? 
                                    React.createElement('input', {
                                        type: "text",
                                        value: item.total !== undefined ? item.total : '',
                                        onChange: (e) => updateCheck(idx, 'total', e.target.value),
                                        className: "w-12 bg-slate-100 dark:bg-white/10 text-center rounded border-none"
                                    }) : total
                            )
                        );
                    })
                )
            )
        )
    );
};


const ActivityTable = ({ activities, filter, t }) => {
    const filteredData = activities.filter(act => {
        if (filter === 'Critical' && !act.critical) return false;
        if (filter === 'High Float' && act.totalFloat < 44) return false;
        return true;
    });

    return (
        React.createElement('div', { className: "overflow-x-auto" },
            React.createElement('table', { className: "w-full text-sm text-left text-slate-600 dark:text-brand-text-light" },
                React.createElement('thead', { className: "text-xs text-slate-700 uppercase bg-slate-100 dark:bg-brand-dark dark:text-brand-text" },
                    React.createElement('tr', null,
                        React.createElement('th', { className: "px-4 py-3 rounded-l-lg" }, t.colId),
                        React.createElement('th', { className: "px-4 py-3" }, t.colActivity),
                        React.createElement('th', { className: "px-4 py-3" }, t.colDuration),
                        React.createElement('th', { className: "px-4 py-3" }, t.colStart),
                        React.createElement('th', { className: "px-4 py-3" }, t.colFinish),
                        React.createElement('th', { className: "px-4 py-3" }, t.colFloat),
                        React.createElement('th', { className: "px-4 py-3 rounded-r-lg" }, t.colStatus)
                    )
                ),
                React.createElement('tbody', null,
                    filteredData.map((act, idx) => (
                        React.createElement('tr', { key: idx, className: "bg-white dark:bg-brand-light-dark border-b dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5" },
                            React.createElement('td', { className: "px-4 py-2 font-medium" }, act.id),
                            React.createElement('td', { className: "px-4 py-2" }, act.name),
                            React.createElement('td', { className: "px-4 py-2" }, act.duration),
                            React.createElement('td', { className: "px-4 py-2 whitespace-nowrap" }, act.start),
                            React.createElement('td', { className: "px-4 py-2 whitespace-nowrap" }, act.finish),
                            React.createElement('td', { className: "px-4 py-2" }, act.totalFloat),
                            React.createElement('td', { className: "px-4 py-2" },
                                act.critical ? 
                                    React.createElement('span', { className: "bg-red-100 text-red-800 text-xs px-2 py-0.5 rounded dark:bg-red-900 dark:text-red-300" }, t.valCritical) : 
                                    React.createElement('span', { className: "bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded dark:bg-green-900 dark:text-green-300" }, t.valNormal)
                            )
                        )
                    ))
                )
            )
        )
    );
};

// --- New Findings List Component ---
const FindingsList = ({ items, title, icon, isEditing, onChange, colorClass, language }) => {
    return React.createElement('div', { className: `bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 p-5 ${colorClass}` },
        React.createElement('div', { className: "flex items-center gap-2 mb-4" },
            icon,
            React.createElement('h3', { className: "font-bold text-lg text-slate-800 dark:text-white" }, title)
        ),
        React.createElement('ul', { className: "space-y-4" },
            (items || []).map((item, idx) => {
                const itemTitle = getLocalizedContent(item.title, language);
                const itemDesc = getLocalizedContent(item.description, language);
                
                return React.createElement('li', { key: idx, className: "flex items-start gap-3" },
                    React.createElement('div', { className: "mt-1.5 w-2 h-2 rounded-full bg-current flex-shrink-0 opacity-70" }),
                    React.createElement('div', { className: "w-full" },
                        React.createElement('h4', { className: "font-bold text-sm text-slate-800 dark:text-white" }, 
                            isEditing ? 
                            React.createElement(EditableContent, { isEditing, value: itemTitle, onChange: (v) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, [language]: v } };
                                onChange(newItems);
                            }}) : itemTitle
                        ),
                        React.createElement('p', { className: "text-sm text-slate-600 dark:text-brand-text-light leading-relaxed mt-1" },
                             isEditing ? 
                            React.createElement(EditableContent, { isEditing, multiline: true, value: itemDesc, onChange: (v) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], description: { ...newItems[idx].description, [language]: v } };
                                onChange(newItems);
                            }}) : itemDesc
                        )
                    )
                );
            })
        )
    );
};

// --- New Non-Compliance List Component ---
const NonComplianceList = ({ items, title, isEditing, onChange, language }) => {
    return React.createElement('div', { className: "bg-red-50 dark:bg-red-900/10 rounded-xl border border-red-100 dark:border-red-900/20 p-5" },
        React.createElement('div', { className: "flex items-center gap-2 mb-4 text-red-600 dark:text-red-400" },
            React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" })
            ),
            React.createElement('h3', { className: "font-bold text-lg" }, title)
        ),
        React.createElement('ul', { className: "space-y-4" },
            (items || []).map((item, idx) => {
                const itemTitle = getLocalizedContent(item.title, language);
                const itemDesc = getLocalizedContent(item.description, language);

                return React.createElement('li', { key: idx, className: "flex items-start gap-3" },
                    React.createElement(CloseIcon, { className: "w-5 h-5 text-red-500 mt-0.5 flex-shrink-0" }),
                    React.createElement('div', { className: "w-full" },
                        React.createElement('h4', { className: "font-bold text-sm text-slate-800 dark:text-white" },
                             isEditing ? 
                            React.createElement(EditableContent, { isEditing, value: itemTitle, onChange: (v) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], title: { ...newItems[idx].title, [language]: v } };
                                onChange(newItems);
                            }}) : itemTitle
                        ),
                        React.createElement('p', { className: "text-sm text-slate-600 dark:text-brand-text-light leading-relaxed mt-1" },
                             isEditing ? 
                            React.createElement(EditableContent, { isEditing, multiline: true, value: itemDesc, onChange: (v) => {
                                const newItems = [...items];
                                newItems[idx] = { ...newItems[idx], description: { ...newItems[idx].description, [language]: v } };
                                onChange(newItems);
                            }}) : itemDesc
                        )
                    )
                );
            })
        )
    );
};

// --- Main Dashboard Component ---

const ReportDashboard = ({ data, language, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('Overview');
    const [activityFilter, setActivityFilter] = useState('All');
    const [isEditing, setIsEditing] = useState(false);
    const [localData, setLocalData] = useState(data);

    // Sync local state when parent data changes (e.g., new analysis)
    useEffect(() => {
        setLocalData(data);
    }, [data]);

    const t = i18n[language];

    const toggleEdit = () => {
        if (isEditing) {
            // Save Changes
            if (onUpdate) onUpdate(localData);
        }
        setIsEditing(!isEditing);
    };

    // Helper to update localized fields in localData
    const updateLocalizedField = (fieldKey, newValue) => {
        const currentField = localData[fieldKey];
        let updatedField = {};
        
        if (typeof currentField === 'object' && currentField !== null) {
            updatedField = { ...currentField, [language]: newValue };
        } else {
            // Fallback if structure was flat
            updatedField = { [language]: newValue };
        }

        setLocalData(prev => ({
            ...prev,
            [fieldKey]: updatedField
        }));
    };

    // Helper to update stats
    const updateOverviewStat = (key, value) => {
        setLocalData(prev => ({
            ...prev,
            projectOverview: {
                ...prev.projectOverview,
                [key]: value
            }
        }));
    };

    const tabs = [
        { id: 'Overview', label: t.tabOverview },
        { id: 'Health Check', label: t.tabHealthCheck },
        { id: 'Activity Register', label: t.tabActivityRegister },
        { id: 'Sequence', label: t.tabSequence }
    ];
    
    // Derived values for display
    const displayRisk = localData.riskAssessment?.level || localData.riskLevel || 'Medium';
    const riskDesc = getLocalizedContent(localData.riskAssessment?.description, language);
    const summary = getLocalizedContent(localData.summary, language);
    const contractorNote = getLocalizedContent(localData.contractorNote, language);
    const recommendations = (localData.recommendations || []).map(r => getLocalizedContent(r, language));

    const renderContent = () => {
        switch (activeTab) {
            case 'Overview':
                return (
                    React.createElement('div', { className: "space-y-6 animate-fade-in print-sidebar-layout" },
                        
                        // --- SIDEBAR (Stats & Risk) - Printed on Left (or Right based on language) ---
                        React.createElement('div', { className: "print-col-sidebar space-y-6" },
                            
                            // Stats Grid - Stacked Vertically in Print Sidebar
                            React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4 print-sidebar-stack" },
                                React.createElement(StatCard, { 
                                    label: t.statTotalActivities, 
                                    value: localData.projectOverview?.totalActivities || '-',
                                    isEditing: isEditing,
                                    onChange: (val) => updateOverviewStat('totalActivities', val)
                                }),
                                React.createElement(StatCard, { 
                                    label: t.statCriticalActivities, 
                                    value: localData.projectOverview?.criticalActivities || '-',
                                    isEditing: isEditing,
                                    onChange: (val) => updateOverviewStat('criticalActivities', val)
                                }),
                                React.createElement(StatCard, { 
                                    label: t.statDuration, 
                                    value: localData.projectOverview?.duration || '-', 
                                    subtext: t.lblDays,
                                    isEditing: isEditing,
                                    onChange: (val) => updateOverviewStat('duration', val)
                                }),
                                React.createElement(StatCard, { 
                                    label: t.statFinishDate, 
                                    value: localData.projectOverview?.finishDate || '-', 
                                    subtext: `${t.lblDataDate}: ${localData.projectOverview?.dataDate}`,
                                    isEditing: isEditing,
                                    onChange: (val) => updateOverviewStat('finishDate', val)
                                })
                            ),

                            // Risk Assessment - Moved to Sidebar for Print
                            React.createElement('div', { className: "bg-red-50 dark:bg-red-900/10 p-6 rounded-xl border border-red-100 dark:border-red-900/20" },
                                React.createElement('div', { className: "flex justify-between items-start mb-4" },
                                    React.createElement('h3', { className: "font-bold text-lg text-red-800 dark:text-red-300" }, t.riskAssessment),
                                    React.createElement('span', { className: "bg-white/80 dark:bg-white/10 text-red-600 dark:text-red-300 px-3 py-1 rounded font-bold text-sm border border-red-200 dark:border-red-800 uppercase badge" }, displayRisk)
                                ),
                                React.createElement(EditableContent, {
                                    isEditing: isEditing,
                                    value: riskDesc || "Risk assessment text not available.",
                                    onChange: (val) => setLocalData({...localData, riskAssessment: {...localData.riskAssessment, description: {[language]: val}}}),
                                    multiline: true,
                                    className: isEditing ? "text-slate-900" : "text-red-700 dark:text-red-200 text-sm leading-relaxed"
                                })
                            )
                        ),
                        
                        // --- MAIN CONTENT (Summary, Findings, Recs) ---
                        React.createElement('div', { className: "print-col-main space-y-6" },
                            
                            // Executive Summary
                            React.createElement('div', { className: "bg-white dark:bg-brand-light-dark p-6 rounded-xl border border-slate-200 dark:border-white/10" },
                                React.createElement('div', { className: "flex items-center gap-2 mb-4" },
                                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6 text-slate-700 dark:text-slate-300", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                                        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" })
                                    ),
                                    React.createElement('h3', { className: "font-bold text-lg text-slate-800 dark:text-white" }, t.analysisReport)
                                ),
                                React.createElement(EditableContent, {
                                    isEditing: isEditing,
                                    value: summary,
                                    onChange: (val) => updateLocalizedField('summary', val),
                                    multiline: true,
                                    className: isEditing ? "text-slate-900" : "text-slate-600 dark:text-brand-text-light text-sm leading-relaxed whitespace-pre-wrap"
                                })
                            ),

                            // 2 Columns for Findings & Non-Compliance (Screen), Stacked or Grid (Print)
                            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-6" },
                                // Left: Technical Findings
                                React.createElement(FindingsList, {
                                    items: localData.technicalFindings,
                                    title: t.technicalFindings,
                                    icon: React.createElement(FocusIcon, { className: "w-6 h-6 text-brand-primary" }),
                                    colorClass: "text-brand-primary border-teal-100 bg-teal-50 dark:bg-teal-900/10",
                                    isEditing,
                                    onChange: (val) => setLocalData({...localData, technicalFindings: val}),
                                    language
                                }),
                                
                                // Right: Non-Compliance
                                React.createElement(NonComplianceList, {
                                    items: localData.nonComplianceIssues,
                                    title: t.nonCompliance,
                                    isEditing,
                                    onChange: (val) => setLocalData({...localData, nonComplianceIssues: val}),
                                    language
                                })
                            ),

                            // Recommendations (Full Width in Main Column)
                            React.createElement('div', { className: "bg-blue-50 dark:bg-blue-900/10 p-6 rounded-xl border border-blue-100 dark:border-blue-900/20 page-break-after" },
                                React.createElement('div', { className: "flex items-center gap-2 mb-4" },
                                    React.createElement(CheckIcon, { className: "w-6 h-6 text-blue-600 dark:text-blue-400" }),
                                    React.createElement('h3', { className: "font-bold text-lg text-blue-800 dark:text-blue-300" }, t.recommendations)
                                ),
                                React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-4" },
                                    recommendations.map((rec, idx) => (
                                        React.createElement('div', { key: idx, className: "flex gap-3 items-start bg-white dark:bg-card-gradient p-4 rounded-lg shadow-sm" },
                                            React.createElement('div', { className: "bg-blue-100 text-blue-600 font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs flex-shrink-0" }, idx + 1),
                                            React.createElement(EditableContent, {
                                                isEditing: isEditing,
                                                value: rec,
                                                multiline: true,
                                                onChange: (val) => {
                                                    const newRecs = [...(localData.recommendations || [])];
                                                    const currentItem = newRecs[idx];
                                                    const updatedItem = typeof currentItem === 'object' ? 
                                                        { ...currentItem, [language]: val } : 
                                                        { [language]: val };
                                                    newRecs[idx] = updatedItem;
                                                    setLocalData({ ...localData, recommendations: newRecs });
                                                },
                                                className: isEditing ? "" : "text-sm text-slate-700 dark:text-brand-text-light font-medium"
                                            })
                                        )
                                    ))
                                )
                            )
                        )
                    )
                );
            case 'Health Check':
                return (
                    React.createElement('div', { className: "animate-fade-in" },
                         // Default Cards Grid
                         React.createElement('div', { className: "grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 print-grid-3" },
                            localData.dcmaAnalysis?.map((item, idx) => (
                                React.createElement(DCMAItem, { key: idx, ...item, t, language })
                            ))
                         ),
                         
                         // New Detailed Table
                         React.createElement(ComplianceTable, {
                             checks: localData.dcmaAnalysis || [],
                             isEditing,
                             onUpdate: (newChecks) => setLocalData({...localData, dcmaAnalysis: newChecks}),
                             language,
                             t
                         })
                    )
                );
            case 'Activity Register':
                return (
                    React.createElement('div', { className: "animate-fade-in bg-white dark:bg-brand-light-dark rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg p-6" },
                        React.createElement('div', { className: "flex justify-between items-center mb-6" },
                            React.createElement('h3', { className: "font-bold text-lg text-slate-800 dark:text-white" }, t.activityList),
                            React.createElement('div', { className: "flex gap-2 no-print" },
                                React.createElement('select', {
                                    className: "bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 text-slate-800 dark:text-white text-sm rounded-lg focus:ring-brand-primary focus:border-brand-primary block p-2.5",
                                    value: activityFilter,
                                    onChange: (e) => setActivityFilter(e.target.value)
                                },
                                    React.createElement('option', { value: "All" }, t.filterAll),
                                    React.createElement('option', { value: "Critical" }, t.filterCritical),
                                    React.createElement('option', { value: "High Float" }, t.filterHighFloat)
                                )
                            )
                        ),
                        React.createElement(ActivityTable, { activities: localData.activities || [], filter: activityFilter, t })
                    )
                );
            case 'Sequence':
                return (
                    React.createElement('div', { className: "animate-fade-in space-y-6" },
                        React.createElement('div', { className: "bg-blue-50 dark:bg-blue-900/10 p-6 rounded-2xl border border-blue-100 dark:border-blue-900/20" },
                            React.createElement('h3', { className: "font-bold text-blue-800 dark:text-blue-300 mb-4" }, t.logicSequenceAnalysis),
                            React.createElement('div', { className: "space-y-4" },
                                recommendations.map((rec, idx) => (
                                    React.createElement('div', { key: idx, className: "flex gap-3 items-start bg-white dark:bg-card-gradient p-3 rounded-lg shadow-sm" },
                                        React.createElement('div', { className: "bg-blue-100 text-blue-600 font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs flex-shrink-0" }, idx + 1),
                                        React.createElement(EditableContent, {
                                            isEditing: isEditing,
                                            value: rec,
                                            multiline: true,
                                            onChange: (val) => {
                                                const newRecs = [...(localData.recommendations || [])];
                                                // Create new localized object for this item
                                                const currentItem = newRecs[idx];
                                                const updatedItem = typeof currentItem === 'object' ? 
                                                    { ...currentItem, [language]: val } : 
                                                    { [language]: val };
                                                newRecs[idx] = updatedItem;
                                                setLocalData({ ...localData, recommendations: newRecs });
                                            },
                                            className: isEditing ? "" : "text-sm text-slate-700 dark:text-brand-text-light"
                                        })
                                    )
                                ))
                            )
                        ),
                        React.createElement('div', { className: "bg-slate-900 text-slate-300 p-6 rounded-2xl shadow-lg" },
                            React.createElement('h3', { className: "font-bold text-white mb-4" }, t.contractorNote),
                            React.createElement(EditableContent, {
                                isEditing: isEditing,
                                value: contractorNote,
                                onChange: (val) => updateLocalizedField('contractorNote', val),
                                multiline: true,
                                className: isEditing ? "text-slate-900" : "font-mono text-sm leading-relaxed whitespace-pre-wrap border-l-4 border-brand-primary pl-4"
                            })
                        )
                    )
                );
            default:
                return null;
        }
    };

    return (
        React.createElement('div', { className: "flex flex-col md:flex-row gap-6 mt-8 h-full min-h-[600px]" },
            /* Sidebar Navigation */
            React.createElement('div', { className: "md:w-64 flex-shrink-0 no-print" },
                React.createElement('div', { className: "bg-white dark:bg-card-gradient rounded-2xl border border-slate-200 dark:border-white/10 shadow-lg overflow-hidden sticky top-24" },
                    
                    /* Sidebar Header with Edit Button */
                    React.createElement('div', { className: "p-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex justify-between items-center" },
                        React.createElement('h3', { className: "font-bold text-slate-800 dark:text-white" }, t.reportViews),
                        React.createElement('button', {
                            onClick: toggleEdit,
                            className: `p-2 rounded-full transition-colors ${isEditing ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-white hover:bg-slate-300 dark:hover:bg-white/20'}`,
                            title: isEditing ? "Save Changes" : "Edit Report"
                        },
                            isEditing ? React.createElement(SaveIcon, { className: "w-4 h-4" }) : React.createElement(EditIcon, { className: "w-4 h-4" })
                        )
                    ),

                    React.createElement('div', { className: "p-2 space-y-1" },
                        tabs.map(tab => (
                            React.createElement('button', {
                                key: tab.id,
                                onClick: () => setActiveTab(tab.id),
                                className: `w-full text-left px-4 py-3 rounded-xl transition-all flex items-center justify-between group ${
                                    activeTab === tab.id 
                                    ? 'bg-slate-800 text-white shadow-md' 
                                    : 'text-slate-600 dark:text-brand-text-light hover:bg-slate-100 dark:hover:bg-white/10'
                                }`
                            },
                                React.createElement('span', { className: "font-medium text-sm" }, tab.label),
                                activeTab === tab.id && React.createElement('div', { className: "w-1.5 h-1.5 rounded-full bg-brand-primary" })
                            )
                        ))
                    ),
                    /* Mini Legend */
                    React.createElement('div', { className: "mt-4 p-4 border-t border-slate-100 dark:border-white/5" },
                        React.createElement('div', { className: "text-xs text-slate-400" },
                            t.lblReportFooter, React.createElement('br'), t.lblStdFooter
                        )
                    )
                )
            ),

            /* Main Content Area */
            React.createElement('div', { className: "flex-grow" },
                renderContent()
            )
        )
    );
};

export default ReportDashboard;