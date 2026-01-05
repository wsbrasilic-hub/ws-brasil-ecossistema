
import React from 'react';

const PricingPage: React.FC = () => {
  const whatsappNumber = "5521992844353";
  const supportEmail = "comercial@wsbrasilic.com.br";

  const plans = [
    {
      name: 'Plano Bronze (Start)',
      price: 'R$ 97',
      period: '/mês',
      description: 'Ideal para microempreendedores iniciando a jornada digital.',
      features: ['CRM de Vendas Completo', 'Até 3 Usuários', 'Dashboard de KPIs', 'Suporte via E-mail'],
      buttonText: 'Assinar Plano Bronze',
      link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=d2aa84d09a3a4794bb7b8c3d6f5e121d',
      popular: false,
      color: 'border-amber-700/30'
    },
    {
      name: 'Plano Prata (Business)',
      price: 'R$ 197',
      period: '/mês',
      description: 'O cérebro operacional para empresas em fase de escala.',
      features: ['Tudo do Bronze', 'Módulo RH (Gestão de Pessoas)', 'Até 15 Usuários', 'Nexus Chronos (Agenda)', 'Suporte Prioritário'],
      buttonText: 'Assinar Plano Prata',
      link: 'https://www.mercadopago.com.br/subscriptions/checkout?preapproval_plan_id=002a7e1fe3fb4f1bb958a9ff9e59935a',
      popular: true,
      color: 'border-amber-500'
    },
    {
      name: 'Plano Ouro (Enterprise)',
      price: 'Personalizado',
      period: '',
      description: 'Ecossistema completo com automação total e inteligência preditiva.',
      features: ['Tudo do Prata', 'Módulo Financeiro Avançado', 'Marketing AI (Criação de Artes)', 'App Adequado à Organização', 'Usuários Ilimitados'],
      buttonText: 'Falar com Especialista',
      isConsultancy: true,
      popular: false,
      color: 'border-white/20'
    }
  ];

  const handleAction = (plan: typeof plans[0]) => {
    if (plan.isConsultancy) {
      const message = encodeURIComponent(`Olá, gostaria de uma consultoria para o Plano Ouro da WS Brasil e adequar o App à minha organização.`);
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    } else if (plan.link) {
      window.open(plan.link, '_blank');
    }
  };

  const handleGeneralSupport = (type: 'whatsapp' | 'email') => {
    if (type === 'whatsapp') {
      const message = encodeURIComponent(`Olá, preciso de suporte ou informações sobre os planos Nexus AI.`);
      window.open(`https://wa.me/${whatsappNumber}?text=${message}`, '_blank');
    } else {
      window.open(`mailto:${supportEmail}`, '_blank');
    }
  };

  return (
    <div className="space-y-20 animate-fadeIn py-10">
      {/* Header */}
      <div className="text-center space-y-4">
        <h2 className="text-5xl font-black text-white uppercase tracking-tighter">Escolha sua <span className="text-amber-500">Potência</span></h2>
        <p className="text-slate-500 font-bold text-sm uppercase tracking-[0.4em]">Invista na inteligência que gera lucro real</p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {plans.map((plan, idx) => (
          <div 
            key={idx} 
            className={`relative flex flex-col bg-slate-900 border ${plan.color} p-10 rounded-[3rem] shadow-2xl transition-all duration-500 hover:scale-[1.03] hover:shadow-amber-500/10 group`}
          >
            {plan.popular && (
              <div className="absolute -top-5 left-1/2 -translate-x-1/2 bg-amber-500 text-slate-950 font-black text-[10px] uppercase tracking-widest px-6 py-2 rounded-full shadow-lg">
                MAIS VENDIDO
              </div>
            )}
            
            <div className="mb-8">
              <h3 className="text-white font-black text-xl uppercase tracking-tight mb-2">{plan.name}</h3>
              <p className="text-slate-500 text-xs leading-relaxed">{plan.description}</p>
            </div>

            <div className="mb-10">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-black text-white font-mono">{plan.price}</span>
                <span className="text-slate-600 font-bold text-sm uppercase">{plan.period}</span>
              </div>
            </div>

            <div className="space-y-4 mb-12 flex-1">
              {plan.features.map((feature, fIdx) => (
                <div key={fIdx} className="flex items-center gap-3">
                  <i className="fa-solid fa-circle-check text-amber-500/60 group-hover:text-amber-500 transition-colors"></i>
                  <span className="text-slate-300 text-[11px] font-medium uppercase tracking-wider">{feature}</span>
                </div>
              ))}
            </div>

            <button 
              onClick={() => handleAction(plan)}
              className={`w-full py-5 rounded-2xl font-black text-[10px] uppercase tracking-[0.3em] transition-all shadow-xl ${
                plan.popular 
                  ? 'bg-amber-600 text-white hover:bg-amber-500 shadow-amber-900/30' 
                  : plan.isConsultancy 
                  ? 'bg-white text-slate-950 hover:bg-slate-200'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white border border-slate-700'
              }`}
            >
              {plan.buttonText}
            </button>
          </div>
        ))}
      </div>

      {/* FAQ Section */}
      <div className="max-w-4xl mx-auto space-y-12">
        <div className="text-center">
          <h4 className="text-2xl font-black text-white uppercase tracking-tighter">Perguntas Frequentes</h4>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Dúvidas sobre o ecossistema Nexus</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {[
            { q: "Como funciona a assinatura?", a: "Os planos Bronze e Prata são recorrentes via Mercado Pago. O Plano Ouro requer consultoria técnica para adequação do node." },
            { q: "O suporte está incluso?", a: "Sim. Todos os planos possuem suporte técnico. Planos Business e Enterprise contam com atendimento prioritário e consultores dedicados." },
            { q: "Posso cancelar quando quiser?", a: "Sim, não há fidelidade nos planos recorrentes. A gestão da assinatura é feita diretamente pelo painel do Mercado Pago ou solicitando ao nosso suporte." },
            { q: "Meus dados estão seguros?", a: "Utilizamos criptografia de nível bancário e conformidade estrita com a LGPD em todos os nodes de processamento." }
          ].map((faq, idx) => (
            <div key={idx} className="bg-slate-900/40 border border-white/5 p-8 rounded-3xl space-y-3">
              <h5 className="text-white font-bold text-sm uppercase tracking-tight">{faq.q}</h5>
              <p className="text-slate-500 text-xs leading-relaxed">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Footer / Support */}
      <div className="text-center pt-10 border-t border-white/5">
        <p className="text-slate-600 font-bold text-[9px] uppercase tracking-[0.4em] mb-4">Dúvidas ou Suporte Estratégico?</p>
        <div className="flex flex-col md:flex-row justify-center items-center gap-8">
          <a href={`mailto:${supportEmail}`} className="flex items-center gap-3 text-slate-400 hover:text-amber-500 transition-colors group">
            <i className="fa-solid fa-envelope text-xl"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">{supportEmail}</span>
          </a>
          <button 
            onClick={() => handleGeneralSupport('whatsapp')}
            className="flex items-center gap-3 text-slate-400 hover:text-emerald-500 transition-colors group"
          >
            <i className="fa-brands fa-whatsapp text-xl"></i>
            <span className="text-[10px] font-black uppercase tracking-widest">(21) 992844353</span>
          </button>
        </div>
        <p className="text-[8px] text-slate-700 font-black uppercase tracking-widest mt-8">WS BRASIL I.C. • INTELIGÊNCIA QUE GERA LUCRO</p>
      </div>
    </div>
  );
};

export default PricingPage;
