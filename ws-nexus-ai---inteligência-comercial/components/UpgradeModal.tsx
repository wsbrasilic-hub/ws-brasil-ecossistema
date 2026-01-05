
import React from 'react';
import { SubscriptionLevel } from '../types';

interface UpgradeModalProps {
  currentPlan: SubscriptionLevel;
  requiredPlan: SubscriptionLevel;
  reason: string;
  companyName: string;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ currentPlan, requiredPlan, reason, companyName, onClose }) => {
  const plans = {
    BRONZE: { 
      name: 'Bronze (Start)', 
      color: 'from-amber-700 to-amber-900', 
      icon: 'fa-vial', 
      features: ['Dashboard de KPIs', 'CRM de Vendas Completo', 'Nexus Chronos'] 
    },
    SILVER: { 
      name: 'Silver (Business)', 
      color: 'from-slate-400 to-slate-600', 
      icon: 'fa-users-gear', 
      features: ['Tudo do Bronze', 'RH Strategy & Recrutamento IA', 'Análise de Fit Cultural', 'Até 15 Usuários'] 
    },
    GOLD: { 
      name: 'Gold (Enterprise)', 
      color: 'from-amber-400 to-amber-600', 
      icon: 'fa-brain-circuit', 
      features: ['Tudo do Silver', 'Gestão Financeira Avançada', 'Nexus Docs IA', 'Marketing AI (Criação de Artes)', 'Ilimitado'] 
    }
  };

  const whatsappNumber = "5521992844353";
  const whatsappMessage = encodeURIComponent(`Olá Comandante! Sou o ADM da empresa ${companyName} e gostaria de fazer o upgrade para o plano ${plans[requiredPlan].name} para liberar novas funções no meu Nexus AI.`);

  return (
    <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[3000] flex items-center justify-center p-6 animate-fadeIn">
      <div className="bg-slate-900 border border-white/5 rounded-[3rem] w-full max-w-4xl shadow-2xl overflow-hidden flex flex-col md:flex-row border-amber-500/20">
        
        {/* Lado Esquerdo - Info do Plano Necessário */}
        <div className={`md:w-1/2 p-12 bg-gradient-to-br ${plans[requiredPlan].color} flex flex-col justify-between text-white relative`}>
          <div className="z-10">
            <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center mb-6 backdrop-blur-md border border-white/10">
              <i className={`fa-solid ${plans[requiredPlan].icon} text-3xl`}></i>
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] mb-2 text-white/60">Recurso Exclusivo do Plano {requiredPlan} 🚀</h3>
            <h2 className="text-4xl font-black uppercase tracking-tighter mb-4">Leve a {companyName} para o Próximo Nível</h2>
            <p className="text-lg font-medium opacity-90 leading-snug mb-6">
              {reason}
            </p>
            <p className="text-sm opacity-70 leading-relaxed italic border-l-2 border-white/30 pl-4">
              "Você identificou uma oportunidade de otimizar sua gestão, mas este recurso ainda não faz parte do seu plano atual. Não deixe sua empresa andar no freio de mão."
            </p>
          </div>
          
          <div className="space-y-4 mt-8 z-10">
            <p className="text-[9px] font-black uppercase tracking-widest text-white/50 mb-2">Benefícios Destacados:</p>
            {plans[requiredPlan].features.map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <i className="fa-solid fa-circle-check text-emerald-400"></i>
                <span className="text-[10px] font-black uppercase tracking-widest">{f}</span>
              </div>
            ))}
          </div>

          <i className="fa-solid fa-rocket absolute -right-10 -bottom-10 text-[15rem] text-white/5 pointer-events-none"></i>
        </div>

        {/* Lado Direito - Call to Action */}
        <div className="md:w-1/2 p-12 bg-slate-900 flex flex-col justify-center items-center text-center relative overflow-hidden">
          <div className="w-14 h-14 rounded-full bg-amber-500/10 flex items-center justify-center mb-6 border border-amber-500/20">
             <i className="fa-solid fa-crown text-amber-500 text-xl"></i>
          </div>
          <h4 className="text-white font-black text-2xl uppercase tracking-tighter mb-2">Upgrade Disponível</h4>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.4em] mb-12">WS Brasil Intelligence • Strategic Core</p>
          
          <div className="space-y-4 w-full max-w-sm z-10">
            <button 
              onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`, '_blank')}
              className="w-full py-6 bg-white text-slate-950 font-black text-[11px] uppercase tracking-[0.3em] rounded-3xl shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center justify-center gap-4 group"
            >
              <i className="fa-brands fa-whatsapp text-xl text-emerald-600 group-hover:scale-110 transition-transform"></i>
              Falar com Consultor WS
            </button>
            
            <button 
              onClick={onClose}
              className="w-full py-5 bg-slate-800/50 text-slate-500 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl border border-slate-800 hover:text-white hover:border-slate-700 transition-all"
            >
              Continuar Operação Atual
            </button>
          </div>

          <div className="mt-12 flex flex-col items-center gap-4">
            <p className="text-[9px] text-slate-600 font-black uppercase tracking-widest">
              Suporte Estratégico Direto
            </p>
            <div className="flex gap-4">
              <a href="mailto:comercial@wsbrasilic.com.br" className="text-[10px] text-amber-500/60 hover:text-amber-500 font-bold uppercase tracking-widest transition-colors">
                comercial@wsbrasilic.com.br
              </a>
            </div>
          </div>

          <i className="fa-solid fa-shield-halved absolute -left-10 -top-10 text-8xl text-white/5 pointer-events-none"></i>
        </div>
      </div>
    </div>
  );
};

export default UpgradeModal;
