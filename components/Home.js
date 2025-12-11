import React from 'react';
import { AppView, i18n } from '../constants.js';

const Home = ({ language, setView }) => {
  const t = i18n[language];

  return React.createElement('div', { className: `flex flex-col justify-center items-center min-h-[calc(100vh-200px)] max-w-5xl mx-auto px-4` },
    React.createElement('div', { className: 'text-center mb-12 animate-fade-in-up' },
        React.createElement('div', { className: "inline-block mb-4 p-2 px-4 rounded-full bg-teal-100 dark:bg-teal-900/30 text-brand-primary font-semibold text-sm" }, 
            "PMC Standard Compliance Tool"
        ),
        React.createElement('h2', { className: "text-5xl md:text-6xl font-extrabold text-slate-900 dark:text-white mb-6 leading-tight" }, 
            language === 'ar' ? 
            React.createElement(React.Fragment, null, "راجع جداولك الزمنية ", React.createElement('span', { className: "text-brand-primary" }, "أسرع"), " وبجودة أعلى") :
            React.createElement(React.Fragment, null, "Review Schedules ", React.createElement('span', { className: "text-brand-primary" }, "Faster & Better"))
        ),
        React.createElement('p', { className: "text-xl text-slate-600 dark:text-brand-text-light max-w-2xl mx-auto leading-relaxed mb-8" }, t.homeDescription)
    ),

    React.createElement('div', { 
        onClick: () => setView(AppView.PMCAgent),
        className: "group relative w-full max-w-3xl cursor-pointer transform hover:-translate-y-1 transition-all duration-300"
    },
        // Glow effect
        React.createElement('div', { className: "absolute -inset-1 bg-gradient-to-r from-brand-primary to-brand-light-dark rounded-3xl blur opacity-30 group-hover:opacity-60 transition duration-500" }),
        
        // Card Content
        React.createElement('div', { className: "relative bg-white dark:bg-brand-dark p-10 rounded-3xl border border-slate-200 dark:border-white/10 flex flex-col items-center text-center gap-6" },
            React.createElement('div', { className: "bg-slate-50 dark:bg-white/5 p-6 rounded-full group-hover:bg-brand-primary/10 transition-colors" },
                React.createElement(UploadIcon, { className: "w-16 h-16 text-slate-400 dark:text-brand-text-light group-hover:text-brand-primary transition-colors" })
            ),
            React.createElement('div', { className: "flex-grow" },
                React.createElement('h3', { className: "text-2xl font-bold text-slate-900 dark:text-brand-text mb-2" }, t.homeAgentTitle),
                React.createElement('p', { className: "text-slate-600 dark:text-brand-text-light text-lg" }, t.dragDropSub)
            ),
            React.createElement('div', { className: "mt-4" },
                React.createElement('span', { className: "inline-flex items-center gap-2 bg-brand-primary text-white font-bold py-3 px-8 rounded-full shadow-lg shadow-brand-primary/30 group-hover:bg-teal-600 transition-colors" }, 
                    t.analyzeButton,
                    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-5 w-5 rtl:rotate-180", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M14 5l7 7m0 0l-7 7m7-7H3" })
                    )
                )
            )
        )
    ),

    // Steps
    React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-3 gap-6 mt-16 w-full max-w-5xl" },
        [
            { title: "1. Upload/Drop", desc: "Text, CSV, XML or Screenshots", icon: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" },
            { title: "2. AI Analysis", desc: "Detects flaws & compliance issues", icon: "M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" },
            { title: "3. PMC Report", desc: "Get professional observations ready", icon: "M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" }
        ].map((step, idx) => 
            React.createElement('div', { key: idx, className: "bg-white dark:bg-card-gradient p-6 rounded-2xl border border-slate-200 dark:border-white/5 text-center" },
                React.createElement('div', { className: "inline-flex items-center justify-center w-12 h-12 rounded-full bg-slate-100 dark:bg-white/10 mb-4 text-brand-primary" },
                   React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
                        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: step.icon })
                    )
                ),
                React.createElement('h3', { className: "font-bold text-lg mb-1 text-slate-900 dark:text-brand-text" }, 
                    language === 'ar' ? 
                        (idx === 0 ? "1. ارفع الجدول" : idx === 1 ? "2. تحليل فوري" : "3. تقرير PMC") : 
                        step.title
                ),
                React.createElement('p', { className: "text-sm text-slate-500 dark:text-brand-text-light" }, 
                    language === 'ar' ? 
                        (idx === 0 ? "نصوص أو صور للجدول الزمني" : idx === 1 ? "الذكاء الاصطناعي يكتشف الأخطاء" : "استلم ملاحظات احترافية جاهزة") :
                        step.desc
                )
            )
        )
    )
  );
};

// Simple Upload Icon locally defined for Home
const UploadIcon = ({ className }) => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: className, fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" })
    )
);

export const HomeIcon = () => (
    React.createElement('svg', { xmlns: "http://www.w3.org/2000/svg", className: "h-6 w-6", fill: "none", viewBox: "0 0 24 24", stroke: "currentColor" },
        React.createElement('path', { strokeLinecap: "round", strokeLinejoin: "round", strokeWidth: 2, d: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" })
    )
);

export default Home;