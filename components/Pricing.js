import React, { useState } from 'react';
import { i18n, PRICING_PLANS } from '../constants.js';
import { CheckIcon } from './Shared.js';
import PaymentModal from './PaymentModal.js';

const PlanCard = ({ plan, billingCycle, onChoosePlan, language, t }) => {
    const isProMonthlyWithDiscount = plan.id === 'pro' && billingCycle === 'monthly';
    const currentPricing = plan[billingCycle] || plan.monthly;

    const name = plan.name[language];
    const price = currentPricing.price[language];
    const period = currentPricing.period[language];
    const buttonText = t[plan.buttonTextKey];

    return React.createElement('div', {
        className: `relative bg-white dark:bg-card-gradient p-8 rounded-2xl border ${plan.isPopular ? 'border-brand-primary' : 'border-slate-200 dark:border-white/10'} shadow-lg dark:shadow-card transition-all transform hover:scale-105 flex flex-col`
    },
        plan.isPopular && React.createElement('div', { className: "absolute top-0 -translate-y-1/2 left-1/2 -translate-x-1/2 bg-brand-primary text-white text-xs font-bold px-3 py-1 rounded-full" }, t.mostPopular),
        
        isProMonthlyWithDiscount && React.createElement('div', { className: "absolute top-4 right-4 bg-yellow-400 text-yellow-900 text-xs font-bold px-2 py-0.5 rounded" }, t.limitedTimeOffer),

        React.createElement('h3', { className: "text-2xl font-bold text-slate-900 dark:text-brand-text text-center" }, name),
        React.createElement('div', { className: "text-center my-4 min-h-[80px] flex flex-col justify-center" },
            isProMonthlyWithDiscount && React.createElement('p', {className: 'text-sm text-slate-500 dark:text-brand-text-light'}, 
                `${t.originally} `,
                React.createElement('span', {className: 'line-through'}, currentPricing.original_price[language])
            ),
            React.createElement('p', null,
                React.createElement('span', { className: "text-5xl font-extrabold text-slate-900 dark:text-white" }, price),
                React.createElement('span', { className: "text-slate-500 dark:text-brand-text-light" }, period)
            )
        ),
        React.createElement('ul', { className: "space-y-3 my-8 flex-grow" },
            plan.features.map((feature, index) => (
                React.createElement('li', { key: index, className: "flex items-center gap-3" },
                    React.createElement(CheckIcon, { className: "w-5 h-5 text-green-400 flex-shrink-0" }),
                    React.createElement('span', { className: "text-slate-600 dark:text-brand-text-light" }, feature[language])
                )
            ))
        ),
        React.createElement('button', {
            onClick: () => onChoosePlan(plan),
            className: `w-full font-bold py-3 px-4 rounded-full transition-colors ${plan.isPopular ? 'bg-brand-primary hover:bg-blue-600 text-white' : 'bg-slate-100 dark:bg-white/10 hover:bg-slate-200 dark:hover:bg-white/20 text-slate-800 dark:text-brand-text'}`
        }, buttonText)
    );
};


const Pricing = ({ language }) => {
    const t = i18n[language];
    const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' or 'yearly'
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedPlan, setSelectedPlan] = useState(null);

    const handleChoosePlan = (plan) => {
        if (plan.id === 'free') {
            // In a real app, this could trigger a registration flow if not logged in
            console.log("Selected Free Plan");
            return;
        }

        const currentPricing = plan[billingCycle];
        const planForModal = {
            id: `${plan.id}_${billingCycle}`,
            name: (lang) => plan.name[lang],
            name_ar: plan.name['ar'],
            price: (lang) => currentPricing.price[lang],
            price_ar: currentPricing.price['ar'],
            period: (lang) => currentPricing.period[lang],
            period_ar: currentPricing.period['ar'],
        };

        setSelectedPlan(planForModal);
        setIsModalOpen(true);
    };

    return React.createElement(React.Fragment, null,
        React.createElement('div', { className: "max-w-5xl mx-auto py-8" },
            React.createElement('div', { className: "text-center mb-10" },
                React.createElement('h2', { className: "text-3xl md:text-4xl font-bold text-slate-900 dark:text-brand-text" }, t.pricingTitle),
                React.createElement('p', { className: "text-slate-500 dark:text-brand-text-light mt-2 max-w-2xl mx-auto" }, t.pricingDescription)
            ),

            React.createElement('div', { className: "flex justify-center items-center gap-4 mb-10" },
                React.createElement('span', { className: `font-semibold ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-brand-text' : 'text-slate-500 dark:text-brand-text-light'}` }, t.monthly),
                React.createElement('div', {
                    onClick: () => setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly'),
                    className: "w-14 h-8 flex items-center bg-slate-200 dark:bg-brand-light-dark rounded-full p-1 cursor-pointer"
                },
                    React.createElement('div', { className: `bg-brand-primary w-6 h-6 rounded-full shadow-md transform transition-transform ${billingCycle === 'yearly' ? (language === 'ar' ? '-translate-x-6' : 'translate-x-6') : ''}` })
                ),
                React.createElement('span', { className: `font-semibold ${billingCycle === 'yearly' ? 'text-slate-900 dark:text-brand-text' : 'text-slate-500 dark:text-brand-text-light'}` }, t.yearly),
                React.createElement('span', { className: "bg-green-500/20 text-green-300 text-xs font-medium px-2.5 py-1 rounded-full" }, t.save20)
            ),

            React.createElement('div', { className: "grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto" },
                PRICING_PLANS.map(plan => 
                    React.createElement(PlanCard, {
                        key: plan.id,
                        plan: plan,
                        billingCycle: billingCycle,
                        onChoosePlan: handleChoosePlan,
                        language: language,
                        t: t
                    })
                )
            )
        ),
        React.createElement(PaymentModal, {
            isOpen: isModalOpen,
            onClose: () => setIsModalOpen(false),
            plan: selectedPlan,
            language: language
        })
    );
};

export default Pricing;