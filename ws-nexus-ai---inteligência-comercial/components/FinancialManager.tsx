
import React, { useState, useMemo, useEffect } from 'react';
import { FinancialTransaction, TransactionType, TransactionStatus } from '../types';
import { analyzeFinancialHealth } from '../services/geminiService';
import { 
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid 
} from 'recharts';

interface FinancialManagerProps {
  transactions: FinancialTransaction[];
  onAddTransaction: (t: Partial<FinancialTransaction>) => void;
  onUpdateStatus: (id: string, status: TransactionStatus) => void;
}

const FinancialManager: React.FC<FinancialManagerProps> = ({ transactions, onAddTransaction, onUpdateStatus }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [aiInsight, setAiInsight] = useState('Analisando saúde do caixa...');
  const [loadingAi, setLoadingAi] = useState(false);
  const [newTx, setNewTx] = useState<Partial<FinancialTransaction>>({
    type: 'INCOME',
    amount: 0,
    category: 'Vendas',
    description: '',
    status: 'PENDING'
  });

  const stats = useMemo(() => {
    const income = transactions.filter(t => t.type === 'INCOME' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
    const expense = transactions.filter(t => t.type === 'EXPENSE' && t.status === 'PAID').reduce((acc, t) => acc + t.amount, 0);
    const pending = transactions.filter(t => t.type === 'INCOME' && t.status === 'PENDING').reduce((acc, t) => acc + t.amount, 0);
    const overdue = transactions.filter(t => t.status === 'OVERDUE').reduce((acc, t) => acc + t.amount, 0);
    
    return { income, expense, pending, overdue, balance: income - expense };
  }, [transactions]);

  useEffect(() => {
    const fetchInsight = async () => {
      setLoadingAi(true);
      try {
        const insight = await analyzeFinancialHealth(stats.income, stats.expense, stats.overdue);
        setAiInsight(insight);
      } finally {
        setLoadingAi(false);
      }
    };
    fetchInsight();
  }, [stats]);

  const pieData = useMemo(() => {
    const cats: Record<string, number> = {};
    transactions.filter(t => t.type === 'EXPENSE').forEach(t => {
      cats[t.category] = (cats[t.category] || 0) + t.amount;
    });
    return Object.entries(cats).map(([name, value]) => ({ name, value }));
  }, [transactions]);

  const COLORS = ['#6366f1', '#a855f7', '#ec4899', '#f43f5e', '#f59e0b'];

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      {/* HEADER FINANCEIRO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 border border-emerald-500/20 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="z-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
             <i className="fa-solid fa-sack-dollar text-emerald-500"></i> Nexus Financial
          </h2>
          <p className="text-emerald-500/80 font-bold text-[10px] uppercase tracking-[0.4em] mt-2 italic">Gestão de Lucro Real & Liquidez WS Brasil</p>
        </div>
        <div className="flex gap-4 mt-6 md:mt-0 z-10">
           <button 
             onClick={() => { setNewTx({...newTx, type: 'INCOME'}); setIsModalOpen(true); }}
             className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-2xl transition-all shadow-xl shadow-emerald-900/20 text-[10px] uppercase tracking-widest flex items-center gap-3"
           >
             <i className="fa-solid fa-plus"></i> Nova Receita
           </button>
           <button 
             onClick={() => { setNewTx({...newTx, type: 'EXPENSE'}); setIsModalOpen(true); }}
             className="bg-gray-800 hover:bg-gray-750 text-white font-black px-8 py-4 rounded-2xl border border-gray-700 transition-all text-[10px] uppercase tracking-widest flex items-center gap-3"
           >
             <i className="fa-solid fa-minus"></i> Lançar Despesa
           </button>
        </div>
        <i className="fa-solid fa-coins absolute -right-10 -bottom-10 text-[12rem] text-slate-800 opacity-20 pointer-events-none"></i>
      </div>

      {/* DASHBOARD DE LIQUIDEZ */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
         {[
           { label: 'Saldo em Caixa', val: stats.balance, color: 'text-white', icon: 'fa-vault', bg: 'bg-slate-900' },
           { label: 'Receitas (Pago)', val: stats.income, color: 'text-emerald-400', icon: 'fa-arrow-trend-up', bg: 'bg-emerald-950/20' },
           { label: 'Despesas (Pago)', val: stats.expense, color: 'text-rose-400', icon: 'fa-arrow-trend-down', bg: 'bg-rose-950/20' },
           { label: 'Inadimplência/Atrasos', val: stats.overdue, color: 'text-amber-500', icon: 'fa-triangle-exclamation', bg: 'bg-amber-950/20' }
         ].map(card => (
           <div key={card.label} className={`${card.bg} p-8 rounded-[2.5rem] border border-gray-800 shadow-xl`}>
              <div className="flex justify-between items-start mb-4">
                 <i className={`fa-solid ${card.icon} ${card.color} text-xl`}></i>
                 <span className="text-[10px] text-gray-600 font-black uppercase tracking-widest">Global Status</span>
              </div>
              <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest mb-1">{card.label}</p>
              <h3 className={`text-3xl font-black ${card.color} font-mono tracking-tighter`}>R$ {card.val.toLocaleString('pt-BR')}</h3>
           </div>
         ))}
      </div>

      {/* INSIGHT IA FINANCEIRO */}
      <div className="bg-emerald-950/20 border border-emerald-500/20 p-10 rounded-[3.5rem] flex items-start gap-8 shadow-inner animate-fadeIn">
         <div className="w-16 h-16 bg-emerald-500/20 rounded-[2rem] flex items-center justify-center text-emerald-500 border border-emerald-500/30 shrink-0">
            {loadingAi ? <i className="fa-solid fa-circle-notch animate-spin text-2xl"></i> : <i className="fa-solid fa-brain text-3xl"></i>}
         </div>
         <div>
            <h4 className="text-emerald-500 font-black uppercase text-[10px] tracking-[0.4em] mb-3">Relatório Executivo CFO • Nexus Brain</h4>
            <p className="text-xl text-white font-medium italic leading-relaxed">
               "{aiInsight}"
            </p>
         </div>
      </div>

      {/* GRÁFICOS E TABELAS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
         <div className="lg:col-span-2 bg-gray-950 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
            <div className="p-8 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
               <h3 className="text-xl font-black text-white uppercase tracking-tight">Fluxo de Caixa Operacional</h3>
               <button className="text-[10px] font-black text-emerald-500 uppercase tracking-widest hover:underline">Ver Histórico Completo</button>
            </div>
            <div className="overflow-x-auto">
               <table className="w-full text-left">
                  <thead className="bg-gray-900 text-[10px] text-gray-600 font-black uppercase tracking-widest border-b border-gray-800">
                    <tr>
                       <th className="p-8">Transação / Descrição</th>
                       <th className="p-8">Data</th>
                       <th className="p-8">Categoria</th>
                       <th className="p-8 text-right">Valor</th>
                       <th className="p-8 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {transactions.map(t => (
                      <tr key={t.id} className="hover:bg-white/5 transition-all group">
                        <td className="p-8">
                           <div className="flex items-center gap-4">
                              <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs ${t.type === 'INCOME' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                 <i className={`fa-solid ${t.type === 'INCOME' ? 'fa-arrow-up' : 'fa-arrow-down'}`}></i>
                              </div>
                              <div>
                                 <p className="text-white font-bold">{t.description || 'Lançamento sem descrição'}</p>
                                 <p className="text-[9px] text-gray-600 font-black uppercase tracking-widest">{t.contactName || 'Geral'}</p>
                              </div>
                           </div>
                        </td>
                        <td className="p-8 text-xs text-gray-500 font-bold">{new Date(t.dueDate).toLocaleDateString('pt-BR')}</td>
                        <td className="p-8">
                           <span className="text-[10px] text-gray-500 font-black uppercase border border-gray-800 px-3 py-1 rounded-lg">{t.category}</span>
                        </td>
                        <td className={`p-8 text-right font-black font-mono ${t.type === 'INCOME' ? 'text-emerald-400' : 'text-rose-400'}`}>
                           {t.type === 'EXPENSE' ? '-' : '+'} R$ {t.amount.toLocaleString('pt-BR')}
                        </td>
                        <td className="p-8">
                           <div className="flex justify-center">
                              <select 
                                value={t.status} 
                                onChange={(e) => onUpdateStatus(t.id, e.target.value as TransactionStatus)}
                                className={`px-3 py-1 rounded-lg text-[9px] font-black border uppercase tracking-widest outline-none bg-transparent cursor-pointer ${
                                  t.status === 'PAID' ? 'text-emerald-500 border-emerald-500/20' : 
                                  t.status === 'OVERDUE' ? 'text-rose-500 border-rose-500/20' : 
                                  'text-amber-500 border-amber-500/20'
                                }`}
                              >
                                 <option value="PENDING">PENDENTE</option>
                                 <option value="PAID">PAGO</option>
                                 <option value="OVERDUE">ATRASADO</option>
                              </select>
                           </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
               </table>
            </div>
         </div>

         <div className="space-y-8">
            <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 shadow-2xl">
               <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-10 text-center">Alocação de Capital (Custos)</h4>
               <div className="h-64 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={pieData} innerRadius={60} outerRadius={100} paddingAngle={8} dataKey="value">
                        {pieData.map((entry, index) => <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: '#020617', border: '1px solid #1e293b', borderRadius: '12px', fontSize: '10px', color: '#fff' }} />
                    </PieChart>
                  </ResponsiveContainer>
               </div>
               <div className="grid grid-cols-2 gap-4 mt-8">
                  {pieData.map((p, idx) => (
                    <div key={p.name} className="flex items-center gap-2">
                       <div className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></div>
                       <span className="text-[9px] text-gray-500 font-black uppercase truncate">{p.name}</span>
                    </div>
                  ))}
               </div>
            </div>

            <div className="bg-indigo-600/10 border border-indigo-500/20 p-8 rounded-[3rem] relative overflow-hidden group">
               <h5 className="text-indigo-400 font-black uppercase text-[10px] tracking-[0.3em] mb-4">Meta de Lucratividade</h5>
               <div className="flex justify-between items-end mb-4">
                  <span className="text-4xl font-black text-white">28.5%</span>
                  <span className="text-[10px] text-gray-600 font-bold uppercase mb-2">Target: 35%</span>
               </div>
               <div className="w-full h-3 bg-gray-900 rounded-full border border-gray-800 overflow-hidden">
                  <div className="h-full bg-indigo-500 transition-all duration-1000" style={{ width: '82%' }}></div>
               </div>
               <i className="fa-solid fa-bullseye absolute -bottom-4 -right-4 text-7xl text-indigo-500/10 group-hover:rotate-12 transition-transform"></i>
            </div>
         </div>
      </div>

      {/* MODAL LANÇAMENTO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1500] flex items-center justify-center p-6 animate-fadeIn">
           <div className="bg-gray-900 border border-gray-800 rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden p-12">
              <div className="flex justify-between items-center mb-10">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Lançamento Financeiro</h3>
                    <p className="text-[9px] text-gray-500 font-black uppercase mt-1 tracking-widest">{newTx.type === 'INCOME' ? 'Entrada de Capital' : 'Saída de Capital'}</p>
                 </div>
                 <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white transition-transform hover:rotate-90"><i className="fa-solid fa-xmark text-4xl"></i></button>
              </div>
              <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onAddTransaction(newTx); setIsModalOpen(false); }}>
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Valor (R$)</label>
                       <input required type="number" step="0.01" value={newTx.amount || ''} onChange={e => setNewTx({...newTx, amount: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white font-black text-lg focus:border-emerald-500 outline-none" placeholder="0,00" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Vencimento</label>
                       <input required type="date" value={newTx.dueDate || ''} onChange={e => setNewTx({...newTx, dueDate: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500" />
                    </div>
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Descrição / Fornecedor / Cliente</label>
                    <input required type="text" value={newTx.description} onChange={e => setNewTx({...newTx, description: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500" placeholder="Ex: Pagamento Consultoria Alpha" />
                 </div>
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Categoria Financeira</label>
                    <select value={newTx.category} onChange={e => setNewTx({...newTx, category: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white font-bold outline-none focus:border-emerald-500">
                       <option value="Vendas">Faturamento CRM</option>
                       <option value="Salários">Folha de Pagamento RH</option>
                       <option value="Marketing">Tráfego & Marketing</option>
                       <option value="Operacional">Infra & Operacional</option>
                       <option value="Impostos">Encargos & Tributos</option>
                    </select>
                 </div>
                 <button type="submit" className={`w-full py-5 text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-xl transition-all hover:scale-[1.02] mt-4 ${newTx.type === 'INCOME' ? 'bg-emerald-600 shadow-emerald-900/30' : 'bg-rose-600 shadow-rose-900/30'}`}>
                   CONFIRMAR LANÇAMENTO
                 </button>
              </form>
           </div>
        </div>
      )}
    </div>
  );
};

export default FinancialManager;
