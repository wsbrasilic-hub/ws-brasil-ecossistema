import React from 'react';
import { FinancialTransaction, Lead } from '../types';

interface DashboardProps {
  transactions: FinancialTransaction[];
  leads: Lead[];
}

const Dashboard: React.FC<DashboardProps> = ({ transactions, leads }) => {
  // Cálculos Financeiros em Tempo Real
  const totalRevenue = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'PAID')
    .reduce((acc, t) => acc + t.amount, 0);

  const pendingRevenue = transactions
    .filter(t => t.type === 'INCOME' && t.status === 'PENDING')
    .reduce((acc, t) => acc + t.amount, 0);

  // Métricas de Vendas (CRM)
  const totalLeads = leads.length;
  const closedDeals = leads.filter(l => l.status === 'FECHAMENTO').length;
  const conversionRate = totalLeads > 0 ? ((closedDeals / totalLeads) * 100).toFixed(1) : 0;

  return (
    <div className="space-y-10 animate-fadeIn">
      {/* HEADER ESTRATÉGICO */}
      <div className="flex justify-between items-end">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">WS Nexus Insight</h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.5em] mt-2">Inteligência de Dados em Tempo Real</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-slate-900 border border-slate-800 px-6 py-3 rounded-2xl flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Conexão Supabase Ativa</span>
          </div>
        </div>
      </div>

      {/* CARDS PRINCIPAIS (KPIs) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Faturamento Realizado</p>
          <p className="text-3xl font-black text-white mt-3">R$ {totalRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-emerald-500 text-[10px] font-black">+12% vs mês ant.</span>
          </div>
          <i className="fa-solid fa-money-bill-trend-up absolute -right-4 -bottom-4 text-7xl text-slate-800/20"></i>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Volume de Leads</p>
          <p className="text-3xl font-black text-white mt-3">{totalLeads}</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-amber-500 text-[10px] font-black">{leads.filter(l => l.status === 'QUALIFICADO').length} Novos hoje</span>
          </div>
          <i className="fa-solid fa-users-rays absolute -right-4 -bottom-4 text-7xl text-slate-800/20"></i>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-8 rounded-[2.5rem] relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Taxa de Conversão</p>
          <p className="text-3xl font-black text-white mt-3">{conversionRate}%</p>
          <div className="mt-4 flex items-center gap-2">
            <span className="text-blue-500 text-[10px] font-black">Benchmark: 5.2%</span>
          </div>
          <i className="fa-solid fa-bullseye absolute -right-4 -bottom-4 text-7xl text-slate-800/20"></i>
        </div>

        <div className="bg-slate-900 border border-amber-500/20 p-8 rounded-[2.5rem] relative overflow-hidden group bg-gradient-to-br from-slate-900 to-amber-950/10">
          <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest">Previsão de Caixa</p>
          <p className="text-3xl font-black text-white mt-3">R$ {pendingRevenue.toLocaleString()}</p>
          <div className="mt-4 flex items-center gap-2 text-slate-500 text-[10px] font-black uppercase">Aguardando Liquidação</div>
          <i className="fa-solid fa-hourglass-half absolute -right-4 -bottom-4 text-7xl text-amber-500/5"></i>
        </div>
      </div>

      {/* GRÁFICOS E TABELAS ANALÍTICAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* FUNIL VISUAL */}
        <div className="lg:col-span-2 bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-sm font-black text-white uppercase tracking-widest">Saúde do Pipeline</h3>
            <button className="text-[9px] font-black text-slate-500 uppercase hover:text-white transition-colors">Ver Relatório Completo</button>
          </div>
          
          <div className="space-y-6">
            {(['QUALIFICADO', 'REUNIAO', 'PROPOSTA', 'FECHAMENTO'] as const).map(status => {
              const count = leads.filter(l => l.status === status).length;
              const percentage = totalLeads > 0 ? (count / totalLeads) * 100 : 0;
              return (
                <div key={status} className="space-y-2">
                  <div className="flex justify-between text-[10px] font-black uppercase tracking-tighter">
                    <span className="text-slate-400">{status}</span>
                    <span className="text-white">{count} Leads</span>
                  </div>
                  <div className="h-3 bg-slate-950 rounded-full overflow-hidden border border-slate-800">
                    <div 
                      className="h-full bg-amber-600 transition-all duration-1000" 
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ÚLTIMAS ATIVIDADES FINANCEIRAS */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-[3rem] p-10">
          <h3 className="text-sm font-black text-white uppercase tracking-widest mb-8">Fluxo Recente</h3>
          <div className="space-y-6">
            {transactions.slice(0, 5).map(t => (
              <div key={t.id} className="flex justify-between items-center group">
                <div className="flex items-center gap-4">
                  <div className={`w-2 h-2 rounded-full ${t.type === 'INCOME' ? 'bg-emerald-500' : 'bg-rose-500'}`}></div>
                  <div>
                    <p className="text-[11px] font-bold text-white group-hover:text-amber-500 transition-colors">{t.description}</p>
                    <p className="text-[8px] text-slate-600 font-black uppercase">{t.date}</p>
                  </div>
                </div>
                <p className={`text-[10px] font-black ${t.type === 'INCOME' ? 'text-emerald-500' : 'text-rose-500'}`}>
                  {t.type === 'INCOME' ? '+' : '-'} R$ {t.amount}
                </p>
              </div>
            ))}
            {transactions.length === 0 && <p className="text-[10px] text-slate-600 text-center py-10 uppercase font-black">Sem movimentações</p>}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
