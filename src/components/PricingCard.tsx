import type { Lang } from '../i18n/translations';
import { t } from '../i18n/translations';

interface Props {
  lang: Lang;
}

export default function PricingCard({ lang }: Props) {
  const plans = [
    {
      name: t(lang, 'pricing.free'),
      desc: t(lang, 'pricing.free.desc'),
      price: '$0',
      features: [t(lang, 'pricing.free.feature1'), t(lang, 'pricing.free.feature2'), t(lang, 'pricing.free.feature3')],
      cta: t(lang, 'pricing.free.cta'),
      highlight: false,
      iconGradient: 'from-gray-400 to-gray-500',
      icon: <><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" /></>,
    },
    {
      name: t(lang, 'pricing.pro'),
      desc: t(lang, 'pricing.pro.desc'),
      price: t(lang, 'pricing.pro.price'),
      features: [t(lang, 'pricing.pro.feature1'), t(lang, 'pricing.pro.feature2'), t(lang, 'pricing.pro.feature3'), t(lang, 'pricing.pro.feature4')],
      cta: t(lang, 'pricing.pro.cta'),
      highlight: true,
      iconGradient: 'from-[#28A06A] to-[#217346]',
      icon: <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />,
    },
    {
      name: t(lang, 'pricing.paygo'),
      desc: t(lang, 'pricing.paygo.desc'),
      price: t(lang, 'pricing.paygo.price'),
      features: [t(lang, 'pricing.paygo.feature1'), t(lang, 'pricing.paygo.feature2'), t(lang, 'pricing.paygo.feature3'), t(lang, 'pricing.paygo.feature4')],
      cta: t(lang, 'pricing.paygo.cta'),
      highlight: false,
      iconGradient: 'from-teal-400 to-teal-600',
      icon: <><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></>,
    },
  ];

  return (
    <div className="space-y-8">
      <div className="grid md:grid-cols-3 gap-5">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={`
              liquid-glass liquid-glass-hover rounded-[28px] p-6 relative
              ${plan.highlight ? 'liquid-glass-green md:-mt-2 md:mb-[-8px]' : ''}
            `}
          >
            {plan.highlight && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="text-[11px] font-semibold text-white px-3.5 py-1 rounded-full bg-gradient-to-r from-[#28A06A] to-[#217346] shadow-md shadow-primary/20">
                  Popular
                </span>
              </div>
            )}

            <div className="text-center mb-6 pt-2">
              <div className={`w-10 h-10 mx-auto rounded-2xl bg-gradient-to-br ${plan.iconGradient} flex items-center justify-center shadow-lg mb-4`}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  {plan.icon}
                </svg>
              </div>
              <h3 className="text-[17px] font-bold tracking-tight">{plan.name}</h3>
              <p className="text-[13px] text-text-muted mt-1">{plan.desc}</p>
              <p className="text-[28px] font-bold mt-4 tracking-tight">{plan.price}</p>
            </div>

            <div className="h-px bg-white/15 mb-5" />

            <ul className="space-y-3 mb-6">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-center gap-2.5 text-[14px] text-text-secondary">
                  <div className="w-5 h-5 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#21A366" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  </div>
                  {feature}
                </li>
              ))}
            </ul>

            <button className={`w-full py-2.5 rounded-2xl font-semibold text-[14px] ${plan.highlight ? 'btn-primary text-white' : 'btn-glass text-text'}`}>
              {plan.cta}
            </button>
          </div>
        ))}
      </div>

      <p className="text-center text-[13px] text-text-muted">{t(lang, 'pricing.credit.info')}</p>
    </div>
  );
}
