import React from 'react';
import { i18n } from '../constants.js';
import { EnvelopeIcon, TelegramIcon } from './Shared.js';

const Contact = ({ language }) => {
    const t = i18n[language];

    const ContactCard = ({ href, icon, title, description, handle }) => (
        React.createElement('a', {
            href: href,
            target: "_blank",
            rel: "noopener noreferrer",
            className: `flex items-start gap-6 bg-white dark:bg-card-gradient p-6 rounded-2xl border border-slate-200 dark:border-white/10 transition-all duration-300 transform hover:scale-105 hover:z-10 cursor-pointer shadow-lg dark:shadow-card hover:border-brand-primary hover:shadow-brand-primary/20 dark:hover:shadow-glow-blue`
        },
            React.createElement('div', { className: 'flex-shrink-0 text-brand-primary' }, icon),
            React.createElement('div', null,
                React.createElement('h3', { className: "text-lg font-bold text-slate-900 dark:text-brand-text mb-1" }, title),
                React.createElement('p', { className: "text-sm text-slate-500 dark:text-brand-text-light mb-2" }, description),
                React.createElement('p', { className: "text-sm font-semibold text-brand-blue" }, handle)
            )
        )
    );

    return React.createElement('div', { className: "max-w-2xl mx-auto py-8" },
        React.createElement('div', { className: "text-center mb-10" },
            React.createElement('h2', { className: "text-3xl md:text-4xl font-bold text-slate-900 dark:text-brand-text" }, t.contactTitle),
            React.createElement('p', { className: "text-slate-500 dark:text-brand-text-light mt-3 max-w-xl mx-auto" }, t.contactDescription)
        ),

        React.createElement('div', { className: "space-y-6" },
            React.createElement(ContactCard, {
                href: `mailto:${t.contactEmailAddress}`,
                icon: React.createElement(EnvelopeIcon, { className: 'w-8 h-8' }),
                title: t.contactEmailTitle,
                description: t.contactEmailDescription,
                handle: t.contactEmailAddress
            }),
            React.createElement(ContactCard, {
                href: "https://t.me/AI_Roadmap_bot",
                icon: React.createElement(TelegramIcon, { className: 'w-8 h-8' }),
                title: t.contactTelegramTitle,
                description: t.contactTelegramDescription,
                handle: t.contactTelegramHandle
            })
        )
    );
};

export default Contact;