import React, { useState, useEffect } from 'react';
import { i18n, AppView } from '../constants.js';
import { CloseIcon, GoogleIcon, Spinner, UserIcon, EnvelopeIcon, LockIcon } from './Shared.js';
import { supabase } from '../services/supabaseClient.js';

// Reusable Input Field Component
const InputField = ({ id, type, name, placeholder, value, onChange, icon: Icon, required = true }) => (
    React.createElement('div', { className: "relative group" },
        React.createElement('div', { className: "absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none" },
            React.createElement(Icon, { className: "h-5 w-5 text-slate-400 group-focus-within:text-brand-primary transition-colors" })
        ),
        React.createElement('input', {
            type, id, name, required, placeholder,
            value, onChange,
            className: "w-full py-3 pl-10 pr-4 bg-slate-50 dark:bg-black/20 border border-slate-200 dark:border-white/10 rounded-xl focus:ring-2 focus:ring-brand-primary/50 focus:border-brand-primary focus:outline-none transition-all dark:text-white placeholder-slate-400"
        })
    )
);

const AuthModal = ({ isOpen, onClose, onLoginSuccess, language, setView }) => {
  const t = i18n[language];
  const [viewState, setViewState] = useState('login'); // 'login' | 'register' | 'forgot'
  const [formData, setFormData] = useState({ fullName: '', email: '', password: '', confirmPassword: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
        setError('');
        setSuccess('');
        setFormData({ fullName: '', email: '', password: '', confirmPassword: '' });
        setViewState('login');
    }
  }, [isOpen]);
  
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const validateEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleGoogleLogin = async () => {
    if (!supabase) { setError("Supabase client not configured."); return; }
    try {
        const { error } = await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: { redirectTo: window.location.origin }
        });
        if (error) throw error;
    } catch (err) {
        setError(err.message);
    }
  };

  const handleForgotPassword = async (e) => {
      e.preventDefault();
      if (!supabase) return;
      if (!formData.email) { setError(t.emailRequiredForReset); return; }
      
      setIsLoading(true);
      setError('');
      setSuccess('');
      
      try {
          const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
              redirectTo: `${window.location.origin}/update-password`,
          });
          if (error) throw error;
          setSuccess(t.resetLinkSent);
      } catch (err) {
          setError(err.message);
      } finally {
          setIsLoading(false);
      }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!supabase) {
        setError("Supabase client not configured.");
        return;
    }

    setError('');
    setSuccess('');
    setIsLoading(true);

    try {
        if (viewState === 'login') {
            const { data, error } = await supabase.auth.signInWithPassword({
                email: formData.email,
                password: formData.password,
            });

            if (error) throw error;
            if (data?.user) {
                onClose();
            }
        } else if (viewState === 'register') {
            const { fullName, email, password, confirmPassword } = formData;
            if (!fullName.trim()) { throw new Error(t.errorFullNameRequired); }
            if (!validateEmail(email)) { throw new Error(t.errorInvalidEmail); }
            if (password.length < 6) { throw new Error(t.errorPasswordLength); }
            if (password !== confirmPassword) { throw new Error(t.errorPasswordMismatch); }

            const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: { full_name: fullName }
                }
            });

            if (error) throw error;
            setSuccess(t.registrationSuccess);
            setTimeout(() => setViewState('login'), 2000);
        }
    } catch (err) {
        setError(err.message || "Authentication failed");
    } finally {
        setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    React.createElement('div', {
        className: "fixed inset-0 bg-slate-900/60 dark:bg-black/80 z-[100] flex justify-center items-center backdrop-blur-md transition-opacity animate-fade-in",
        onClick: onClose,
        role: "dialog",
        "aria-modal": "true"
    },
      React.createElement('div', { 
          onClick: (e) => e.stopPropagation(), 
          className: "bg-white dark:bg-card-gradient w-full max-w-md p-8 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 relative transform transition-all scale-100" 
      },
        // Close Button
        React.createElement('button', { onClick: onClose, className: "absolute top-5 right-5 text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors" },
            React.createElement(CloseIcon, null)
        ),

        // Header
        React.createElement('div', { className: "text-center mb-8" },
            React.createElement('h2', { className: "text-3xl font-bold text-slate-900 dark:text-white mb-2" },
                viewState === 'login' ? t.login : (viewState === 'register' ? t.register : t.forgotPassword)
            ),
            React.createElement('p', { className: "text-slate-500 dark:text-brand-text-light text-sm" },
                viewState === 'forgot' ? t.enterEmailForReset : "Access your intelligent scheduling assistant"
            )
        ),
        
        // Error / Success Messages
        error && React.createElement('div', {className: "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-300 text-sm p-3 rounded-lg mb-6 text-center border border-red-100 dark:border-red-800"}, error),
        success && React.createElement('div', {className: "bg-green-50 text-green-600 dark:bg-green-900/20 dark:text-green-300 text-sm p-3 rounded-lg mb-6 text-center border border-green-100 dark:border-green-800"}, success),

        // Social Login (Only in Login/Register)
        viewState !== 'forgot' && React.createElement(React.Fragment, null,
            React.createElement('button', {
                onClick: handleGoogleLogin,
                className: "w-full flex items-center justify-center gap-3 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-white font-semibold py-3 px-4 rounded-xl hover:bg-slate-50 dark:hover:bg-white/10 transition-all mb-6 group"
            },
                React.createElement(GoogleIcon, { className: "w-5 h-5 group-hover:scale-110 transition-transform" }),
                t.continueWithGoogle
            ),
            React.createElement('div', { className: "relative mb-6" },
                React.createElement('div', { className: "absolute inset-0 flex items-center" },
                    React.createElement('div', { className: "w-full border-t border-slate-200 dark:border-white/10" })
                ),
                React.createElement('div', { className: "relative flex justify-center text-sm" },
                    React.createElement('span', { className: "px-2 bg-white dark:bg-brand-dark text-slate-500" }, t.orWithEmail)
                )
            )
        ),

        // Form
        React.createElement('form', { onSubmit: viewState === 'forgot' ? handleForgotPassword : handleSubmit, className: "space-y-4" },
            
            // Register Fields
            viewState === 'register' && React.createElement(InputField, {
                id: "fullName", type: "text", name: "fullName", placeholder: t.fullName,
                value: formData.fullName, onChange: handleInputChange, icon: UserIcon
            }),

            // Email Field (Always visible)
            React.createElement(InputField, {
                id: "email", type: "email", name: "email", placeholder: t.emailAddress,
                value: formData.email, onChange: handleInputChange, icon: EnvelopeIcon
            }),

            // Password Fields (Not in Forgot)
            viewState !== 'forgot' && React.createElement(React.Fragment, null,
                React.createElement(InputField, {
                    id: "password", type: "password", name: "password", placeholder: t.password,
                    value: formData.password, onChange: handleInputChange, icon: LockIcon
                }),
                viewState === 'register' && React.createElement(InputField, {
                    id: "confirmPassword", type: "password", name: "confirmPassword", placeholder: t.confirmPassword,
                    value: formData.confirmPassword, onChange: handleInputChange, icon: LockIcon
                })
            ),

            // Forgot Password Link
            viewState === 'login' && React.createElement('div', { className: "flex justify-end" },
                React.createElement('button', {
                    type: "button",
                    onClick: () => setViewState('forgot'),
                    className: "text-sm font-medium text-brand-primary hover:text-teal-700 transition-colors"
                }, t.forgotPassword)
            ),

            // Terms Disclaimer
            viewState === 'register' && React.createElement('p', { className: "text-xs text-center text-slate-500 dark:text-brand-text-light pt-2" },
                t.authRegistrationDisclaimer_p1, ' ',
                React.createElement('button', { type: 'button', onClick: () => { onClose(); setView(AppView.Terms); }, className: 'font-semibold text-brand-primary hover:underline' }, t.authRegistrationDisclaimer_terms), ' ',
                t.authRegistrationDisclaimer_p2, ' ',
                React.createElement('button', { type: 'button', onClick: () => { onClose(); setView(AppView.Privacy); }, className: 'font-semibold text-brand-primary hover:underline' }, t.authRegistrationDisclaimer_privacy),
                t.authRegistrationDisclaimer_p3
            ),

            // Submit Button
            React.createElement('button', {
                type: "submit",
                disabled: isLoading,
                className: "w-full bg-brand-primary hover:bg-teal-600 text-white font-bold py-3 px-4 rounded-xl transition-all shadow-lg shadow-brand-primary/30 hover:shadow-brand-primary/50 hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none flex justify-center items-center gap-2"
            },
                isLoading && React.createElement(Spinner, { size: "5" }),
                viewState === 'login' ? t.login : (viewState === 'register' ? t.createAccount : t.sendResetLink)
            )
        ),

        // Footer / Switch View
        React.createElement('div', { className: "mt-8 text-center" },
            React.createElement('p', { className: "text-slate-600 dark:text-brand-text-light text-sm" },
                viewState === 'login' ? t.dontHaveAccount : (viewState === 'register' ? t.alreadyHaveAccount : ""),
                viewState !== 'forgot' && React.createElement('button', {
                    onClick: () => setViewState(viewState === 'login' ? 'register' : 'login'),
                    className: "font-bold text-brand-primary hover:text-teal-700 ml-1 transition-colors"
                }, viewState === 'login' ? t.register : t.login),
                
                viewState === 'forgot' && React.createElement('button', {
                    onClick: () => setViewState('login'),
                    className: "font-bold text-slate-600 dark:text-white hover:text-brand-primary transition-colors flex items-center justify-center mx-auto gap-2 mt-2"
                }, "← " + t.backToLogin)
            )
        )
      )
    )
  );
};

export default AuthModal;