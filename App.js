import React, { useState, useEffect } from 'react';
import { AppView, Language, i18n } from './constants.js';
import Home from './components/Home.js';
import PMCAgent from './components/PMCAgent.js';
import About from './components/About.js';
import Contact from './components/Contact.js';
import Terms from './components/Terms.js';
import Privacy from './components/Privacy.js';
import AuthModal from './components/AuthModal.js';
import AuthRequired from './components/AuthRequired.js';
import SettingsModal from './components/SettingsModal.js';
import { Logo, SunIcon, MoonIcon, MenuIcon, CloseIcon, UserIcon, SettingsIcon } from './components/Shared.js';
import { isAnyModelConfigured } from './services/geminiService.js';
import { supabase } from './services/supabaseClient.js';

// Header Component
const Header = ({ currentView, setView, language, setLanguage, theme, toggleTheme, onMenuToggle, user, onLogin, onLogout, onOpenSettings }) => {
  const t = i18n[language];
  
  const navLinks = React.createElement('div', { className: `flex items-center gap-6 ${language === Language.AR ? 'flex-row-reverse' : ''}` },
      React.createElement('button', {
        onClick: () => setView(AppView.Home),
        className: `text-base font-medium transition-colors duration-300 ${currentView === AppView.Home ? 'text-brand-primary' : 'text-slate-500 dark:text-brand-text-light hover:text-slate-900 dark:hover:text-brand-text'}`
      }, t.navHome),
      React.createElement('button', {
        onClick: () => setView(AppView.PMCAgent),
        className: `text-base font-medium transition-colors duration-300 ${currentView === AppView.PMCAgent ? 'text-brand-primary' : 'text-slate-500 dark:text-brand-text-light hover:text-slate-900 dark:hover:text-brand-text'}`
      }, t.navAgent),
      React.createElement('button', {
        onClick: () => setView(AppView.About),
        className: `text-base font-medium transition-colors duration-300 ${currentView === AppView.About ? 'text-brand-primary' : 'text-slate-500 dark:text-brand-text-light hover:text-slate-900 dark:hover:text-brand-text'}`
      }, t.navAbout)
  );
  
  const controls = React.createElement('div', { className: "flex items-center gap-2 sm:gap-4" },
      React.createElement('button', {
          onClick: onOpenSettings,
          title: "API Settings",
          className: 'text-slate-500 dark:text-brand-text-light hover:bg-slate-200 dark:hover:bg-white/20 p-2 rounded-full transition-colors'
      }, React.createElement(SettingsIcon, { className: "w-5 h-5" })),
      
      React.createElement('button', {
          onClick: toggleTheme,
          'aria-label': 'Toggle theme',
          className: 'text-slate-500 dark:text-brand-text-light hover:bg-slate-200 dark:hover:bg-white/20 p-2 rounded-full transition-colors'
      }, theme === 'light' ? React.createElement(MoonIcon) : React.createElement(SunIcon)),
      
      React.createElement('button', {
        onClick: () => setLanguage(language === Language.EN ? Language.AR : Language.EN),
        className: "text-sm font-semibold bg-slate-200 dark:bg-brand-light-dark text-slate-700 dark:text-white px-3 py-1.5 rounded-full hover:bg-slate-300 dark:hover:bg-white/20 transition-colors"
      }, language === Language.EN ? 'العربية' : 'English'),
      
      user ? (
        React.createElement('div', { className: "flex items-center gap-2" },
           React.createElement('span', { className: "hidden sm:inline text-sm font-medium text-slate-700 dark:text-brand-text" }, 
               user.user_metadata?.full_name || user.email.split('@')[0]
           ),
           React.createElement('button', {
                onClick: onLogout,
                className: "text-sm text-red-500 hover:text-red-700 font-medium px-2 py-1"
           }, "Logout")
        )
      ) : (
        React.createElement('button', {
            onClick: onLogin,
            className: "flex items-center gap-2 bg-brand-primary hover:bg-teal-600 text-white text-sm font-bold px-4 py-2 rounded-full transition-colors"
        }, React.createElement(UserIcon, { className: "w-4 h-4" }), "Login")
      )
  );

  return React.createElement('header', { className: "sticky top-0 z-50 bg-white dark:bg-brand-dark/80 backdrop-blur-xl border-b border-slate-200/80 dark:border-white/10" },
    React.createElement('nav', { className: "container mx-auto px-6 py-3 flex justify-between items-center" },
      React.createElement('div', { className: 'flex-1 flex justify-start' },
        React.createElement('button', { onClick: () => setView(AppView.Home), className: "flex items-center gap-3" },
          React.createElement(Logo, null),
          React.createElement('h1', { className: "text-2xl font-bold text-slate-900 dark:text-brand-text" }, t.title)
        )
      ),
      React.createElement('div', { className: 'hidden md:flex flex-1 justify-center' }, navLinks),
      React.createElement('div', { className: 'flex-1 flex justify-end items-center' },
        React.createElement('div', { className: 'hidden md:flex' }, controls),
        React.createElement('div', { className: "md:hidden" },
            React.createElement('button', {
                onClick: onMenuToggle,
                className: "p-2 text-slate-600 dark:text-brand-text-light hover:bg-slate-200 dark:hover:bg-white/20 rounded-md"
            },
                React.createElement(MenuIcon, null)
            )
        )
      )
    )
  );
};

// Mobile Menu
const MobileMenu = ({ isOpen, onClose, currentView, setView, language, setLanguage, theme, toggleTheme, user, onLogin, onLogout, onOpenSettings }) => {
    if (!isOpen) return null;
    const t = i18n[language];
    
    const handleNavigate = (view) => { setView(view); onClose(); };

    return React.createElement('div', { className: "fixed inset-0 z-[100] bg-slate-100 dark:bg-brand-dark" },
        React.createElement('div', { className: 'container mx-auto' },
            React.createElement('div', { className: 'flex justify-between items-center px-6 py-3 border-b border-slate-200 dark:border-white/10' },
                React.createElement('button', { onClick: () => handleNavigate(AppView.Home), className: "flex items-center gap-3" },
                    React.createElement(Logo, null),
                    React.createElement('h1', { className: "text-2xl font-bold text-slate-900 dark:text-brand-text" }, t.title)
                ),
                React.createElement('button', { onClick: onClose, className: "p-2 text-slate-600 dark:text-brand-text-light" }, React.createElement(CloseIcon, null))
            ),
            React.createElement('div', { className: 'p-6 flex flex-col h-[calc(100vh-69px)]' },
                React.createElement('div', { className: 'flex-grow space-y-4 text-center overflow-y-auto' },
                    React.createElement('button', { onClick: () => handleNavigate(AppView.Home), className: "w-full text-lg py-3 rounded-md hover:bg-slate-200 dark:hover:bg-white/10" }, t.navHome),
                    React.createElement('button', { onClick: () => handleNavigate(AppView.PMCAgent), className: "w-full text-lg py-3 rounded-md hover:bg-slate-200 dark:hover:bg-white/10 text-brand-primary font-bold" }, t.navAgent),
                    React.createElement('button', { onClick: () => handleNavigate(AppView.About), className: "w-full text-lg py-3 rounded-md hover:bg-slate-200 dark:hover:bg-white/10" }, t.navAbout),
                ),
                React.createElement('div', { className: 'mt-auto pt-6 border-t border-slate-200 dark:border-white/10 space-y-4' },
                     // Settings button for Mobile
                     React.createElement('button', {
                        onClick: () => { onClose(); onOpenSettings(); },
                        className: "w-full flex items-center justify-center gap-2 bg-slate-200 dark:bg-white/5 py-3 rounded-xl"
                     }, React.createElement(SettingsIcon, { className: "w-5 h-5" }), "API Settings"),

                     user ? (
                         React.createElement('div', { className: "text-center" },
                             React.createElement('p', { className: "font-medium text-slate-900 dark:text-brand-text mb-2" }, 
                                user.user_metadata?.full_name || user.email
                             ),
                             React.createElement('button', { onClick: () => { onLogout(); onClose(); }, className: "text-red-500 font-bold" }, "Logout")
                         )
                     ) : (
                         React.createElement('button', { 
                             onClick: () => { onLogin(); onClose(); },
                             className: "w-full bg-brand-primary text-white font-bold py-3 rounded-full" 
                         }, "Login")
                     ),
                     React.createElement('div', { className: 'flex justify-between items-center' },
                        React.createElement('span', {className: 'font-semibold text-slate-600 dark:text-brand-text-light'}, 'Language'),
                         React.createElement('button', { onClick: () => setLanguage(language === Language.EN ? Language.AR : Language.EN), className: "text-sm font-semibold bg-slate-200 dark:bg-brand-light-dark text-slate-700 dark:text-white px-3 py-1.5 rounded-full hover:bg-slate-300 dark:hover:bg-white/20 transition-colors" }, language === Language.EN ? 'العربية' : 'English')
                    ),
                    React.createElement('div', { className: 'flex justify-between items-center' },
                        React.createElement('span', {className: 'font-semibold text-slate-600 dark:text-brand-text-light'}, 'Theme'),
                         React.createElement('button', {
                              onClick: toggleTheme,
                              className: 'text-slate-500 dark:text-brand-text-light hover:bg-slate-200 dark:hover:bg-white/20 p-2 rounded-full transition-colors'
                          }, theme === 'light' ? React.createElement(MoonIcon) : React.createElement(SunIcon))
                    )
                )
            )
        )
    );
};


// Footer
const Footer = ({ language, setView }) => {
  const t = i18n[language];
  return React.createElement('footer', { className: "bg-transparent mt-auto no-print" },
    React.createElement('div', { className: "container mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between items-center border-t border-slate-200 dark:border-white/10" },
      React.createElement('div', { className: `text-sm text-slate-500 dark:text-brand-text-light flex flex-col sm:flex-row items-center gap-x-4 gap-y-2` },
        React.createElement('p', null, `© ${new Date().getFullYear()} SchedAI.`),
        React.createElement('div', { className: "flex items-center gap-x-4" },
            React.createElement('button', { onClick: () => setView(AppView.Terms), className: 'hover:underline' }, t.navTerms),
            React.createElement('button', { onClick: () => setView(AppView.Privacy), className: 'hover:underline' }, t.navPrivacy),
        )
      )
    )
  );
};

// Main App
const App = () => {
  const [view, setView] = useState(AppView.Home);
  const [language, setLanguage] = useState(Language.AR); 
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [user, setUser] = useState(null);
  
  const [theme, setTheme] = useState(() => {
    if (typeof localStorage !== 'undefined' && localStorage.getItem('theme')) return localStorage.getItem('theme');
    if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) return 'dark';
    return 'light';
  });

  // Handle Supabase Session
  useEffect(() => {
    if (supabase) {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setUser(session?.user ?? null);
        });

        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
            setUser(session?.user ?? null);
        });

        return () => subscription.unsubscribe();
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) {
        await supabase.auth.signOut();
    }
  };

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') root.classList.add('dark');
    else root.classList.remove('dark');
    localStorage.setItem('theme', theme);
  }, [theme]);

  const toggleTheme = () => setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === Language.AR ? 'rtl' : 'ltr';
  }, [language]);
  
  // NOTE: We removed the blocking API error screen. 
  // The user can now configure keys via the SettingsModal if analysis fails.

  const renderView = () => {
    const props = { language, setView, theme, onOpenSettings: () => setIsSettingsOpen(true) };

    switch (view) {
      case AppView.Home: return React.createElement(Home, props);
      case AppView.PMCAgent: 
        if (!user && supabase) {
             return React.createElement(AuthRequired, { 
                 language, 
                 onLoginClick: () => setIsAuthModalOpen(true) 
             });
        }
        return React.createElement(PMCAgent, props);
      case AppView.About: return React.createElement(About, props);
      case AppView.Contact: return React.createElement(Contact, props);
      case AppView.Terms: return React.createElement(Terms, props);
      case AppView.Privacy: return React.createElement(Privacy, props);
      default: return React.createElement(Home, props);
    }
  };

  return React.createElement('div', { className: "min-h-screen flex flex-col font-sans" },
    React.createElement(Header, {
      currentView: view,
      setView: setView,
      language,
      setLanguage,
      theme,
      toggleTheme,
      onMenuToggle: () => setIsMobileMenuOpen(true),
      user,
      onLogin: () => setIsAuthModalOpen(true),
      onLogout: handleLogout,
      onOpenSettings: () => setIsSettingsOpen(true)
    }),
    React.createElement(MobileMenu, {
      isOpen: isMobileMenuOpen,
      onClose: () => setIsMobileMenuOpen(false),
      currentView: view,
      setView,
      language,
      setLanguage,
      theme,
      toggleTheme,
      user,
      onLogin: () => setIsAuthModalOpen(true),
      onLogout: handleLogout,
      onOpenSettings: () => setIsSettingsOpen(true)
    }),
    React.createElement('main', { className: "flex-grow container mx-auto p-4 md:p-8" },
        renderView()
    ),
    React.createElement(Footer, { language, setView }),
    React.createElement(AuthModal, {
        isOpen: isAuthModalOpen,
        onClose: () => setIsAuthModalOpen(false),
        onLoginSuccess: () => setIsAuthModalOpen(false), // Session listener handles user state
        language,
        setView
    }),
    React.createElement(SettingsModal, {
        isOpen: isSettingsOpen,
        onClose: () => setIsSettingsOpen(false),
        language
    })
  );
};

export default App;