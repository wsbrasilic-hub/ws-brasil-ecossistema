
import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell
} from 'recharts';

const paymentStats = [
  { name: 'Pix', value: 27000, color: '#C5A059' },
  { name: 'Crédito', value: 18000, color: '#475569' },
  { name: 'Débito', value: 12000, color: '#94a3b8' },
  { name: 'Dinheiro', value: 7500, color: '#cbd5e1' },
];

const healthData = [
  { name: 'Sucesso', value: 85, color: '#10b981' },
  { name: 'Perda/Risco', value: 15, color: '#f43f5e' },
];

const Dashboard: React.FC = () => {
  return (
    <div className="space-y-10 animate-fadeIn">
      {/* TITULO E AÇÃO EXECUTIVA */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter">Terminal Estratégico</h2>
          <p className="text-slate-500 font-bold text-xs uppercase tracking-[0.3em] mt-2">WS Brasil I.C. • Telemetria Midnight Carbon</p>
        </div>
        <button className="bg-slate-900 hover:bg-slate-800 text-white border border-slate-800 px-8 py-4 rounded-2xl flex items-center gap-3 transition-all text-xs font-black uppercase tracking-widest shadow-xl">
          <i className="fa-solid fa-file-export text-amber-500"></i> Relatório Consolidado
        </button>
      </div>

      {/* STRATEGIC TRIGGER HUB (NBA - Next Best Action) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-gradient-to-r from-amber-600/20 to-transparent border border-amber-500/30 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-amber-500 rounded-xl flex items-center justify-center text-slate-900 shadow-lg">
              <i className="fa-solid fa-lightbulb"></i>
            </div>
            <h3 className="text-white font-black uppercase text-xs tracking-widest">Oportunidade de Liquidez</h3>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed mb-6 italic">
            "Detectei excesso de estoque no item 'Licença ERP'. Sugiro campanha de Marketing direcionada para os leads 'AQUECIDOS' do CRM para gerar R$ 12.000 em caixa imediato."
          </p>
          <div className="flex gap-4">
            <button className="bg-amber-600 text-slate-950 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">Ativar Campanha</button>
            <button className="text-slate-500 font-bold text-[9px] uppercase tracking-widest hover:text-white">Ignorar</button>
          </div>
          <i className="fa-solid fa-bolt absolute -right-4 -bottom-4 text-7xl text-amber-500/10 group-hover:rotate-12 transition-transform"></i>
        </div>

        <div className="bg-gradient-to-r from-cyan-600/20 to-transparent border border-cyan-500/30 p-8 rounded-[2.5rem] shadow-2xl relative overflow-hidden group">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-10 h-10 bg-cyan-500 rounded-xl flex items-center justify-center text-slate-900 shadow-lg">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
            <h3 className="text-white font-black uppercase text-xs tracking-widest">Alerta de Compliance</h3>
          </div>
          <p className="text-slate-200 text-sm leading-relaxed mb-6 italic">
            "O contrato do cliente 'Padaria do Sol' vence em 5 dias. Iniciei a redação da renovação automática com reajuste de 8.5% (IGP-M)."
          </p>
          <div className="flex gap-4">
            <button className="bg-cyan-600 text-slate-950 px-6 py-2.5 rounded-xl font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">Enviar para Assinatura</button>
            <button className="text-slate-500 font-bold text-[9px] uppercase tracking-widest hover:text-white">Revisar Minuta</button>
          </div>
          <i className="fa-solid fa-file-contract absolute -right-4 -bottom-4 text-7xl text-cyan-500/10 group-hover:rotate-12 transition-transform"></i>
        </div>
      </div>

      {/* METRICAS DE IMPACTO (SCORECARDS) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         {[
           { label: 'Lucro Líquido Projetado', val: 'R$ 142.500', trend: '+12%', icon: 'fa-vault', color: 'text-amber-500', bg: 'bg-amber-950/20' },
           { label: 'Pipeline Ativo', val: 'R$ 850.000', trend: '+5.4%', icon: 'fa-chart-pie', color: 'text-blue-500', bg: 'bg-blue-950/20' },
           { label: 'Conversão Comercial', val: '24.2%', trend: '-2.1%', icon: 'fa-bolt', color: 'text-emerald-500', bg: 'bg-emerald-950/20' }
         ].map((card, idx) => (
           <div key={idx} className="bg-slate-900 border border-slate-800 p-8 rounded-[2rem] shadow-2xl relative overflow-hidden group hover:border-amber-500/30 transition-all">
              <div className="flex justify-between items-start mb-6">
                 <div className={`w-12 h-12 rounded-xl ${card.bg} flex items-center justify-center ${card.color} border border-white/5 shadow-inner`}>
                    <i className={`fa-solid ${card.icon} text-lg`}></i>
                 </div>
                 <span className={`text-[10px] font-black uppercase tracking-widest ${card.trend.startsWith('+') ? 'text-emerald-500' : 'text-rose-500'}`}>
                    {card.trend} <i className={`fa-solid ${card.trend.startsWith('+') ? 'fa-caret-up' : 'fa-caret-down'}`}></i>
                 </span>
              </div>
              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className="text-3xl font-black text-white font-mono tracking-tighter">{card.val}</h3>
           </div>
         ))}
      </div>

      {/* GRÁFICOS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8">Performance por Canal</h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={paymentStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis hide />
                <Tooltip 
                  cursor={{fill: 'rgba(255,255,255,0.02)'}}
                  contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', fontSize: '10px', color: '#fff' }}
                />
                <Bar dataKey="value" radius={[10, 10, 0, 0]}>
                  {paymentStats.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-slate-900 p-10 rounded-[2.5rem] border border-slate-800 shadow-2xl flex flex-col items-center">
          <h3 className="text-xl font-black text-white uppercase tracking-tight mb-8 self-start">Saúde do Ecossistema</h3>
          <div className="relative h-64 w-full flex items-center justify-center">
             <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={healthData} cx="50%" cy="50%" innerRadius={80} outerRadius={110} paddingAngle={10} dataKey="value">
                  {healthData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute text-center">
              <span className="text-5xl font-black text-white tracking-tighter">85%</span>
              <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">Efficiency Rate</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
