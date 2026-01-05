import React, { useState, useMemo } from 'react';
import { Organization, SubscriptionLevel } from '../types';

interface MasterAdminProps {
  organizations: Organization[];
  onUpdateOrgStatus: (id: string, status: 'ACTIVE' | 'SUSPENDED') => void;
  onUpdateOrgSubscription: (id: string, level: SubscriptionLevel) => void;
  onAddOrg: (org: Partial<Organization>) => void;
}

const MasterAdmin: React.FC<MasterAdminProps> = ({ organizations, onUpdateOrgStatus, onUpdateOrgSubscription, onAddOrg }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewOrgModalOpen, setIsNewOrgModalOpen] = useState(false);
  const [newOrgForm, setNewOrgForm] = useState({ name: '', cnpj: '', subscription: 'BRONZE' as SubscriptionLevel });
  
  const whatsappNumber = "5521992844353";

  // Lógica de Estatísticas (KPIs)
  const stats = useMemo(() => {
    const total = organizations.length;
    const active = organizations.filter(o => o.status === 'ACTIVE').length;
    const revenue = organizations.reduce((acc, o) => {
      if (o.status !== 'ACTIVE') return acc;
      const planPrices = { BRONZE: 97, SILVER: 197, GOLD: 497 };
      return acc + (planPrices[o.subscription] || 0);
    }, 0);

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    const newClients = organizations.filter(o => new Date(o.createdAt) > thirtyDaysAgo).length;
    
    return { total, active, revenue, newClients };
  }, [organizations]);

  const filteredOrgs = organizations.filter(o => 
    o.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.cnpj.includes(searchTerm)
  );

  const handleCreateOrg = (e: React.FormEvent) => {
    e.preventDefault();
    onAddOrg(newOrgForm); // Dispara a função de salvar do App.tsx
    setIsNewOrgModalOpen(false);
    setNewOrgForm({ name: '', cnpj: '', subscription: 'BRONZE' });
  };

  // Função Simples de Onboarding via WhatsApp
  const handleWhatsappOnboarding = (org: Organization) => {
    const message = `Olá! O ecossistema da WS Brasil para a empresa ${org.name} já está ativo. Seu ID de acesso é: ${org.id}. Acesse agora em nosso painel oficial!`;
    window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="space-y-10 animate-fadeIn pb-24">
      {/* HEADER COCKPIT MASTER */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center bg-slate-900 border border-amber-500/20 p-10 rounded-[3.5rem] shadow-2xl relative overflow-hidden">
        <div className="z-10">
          <h2 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
             <i className="fa-solid fa-tower-broadcast text-amber-500"></i> Nexus Command Center
          </h2>
          <p className="text-amber-500/80 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Governança Global • WS Brasil I.C.</p>
        </div>
        <div className="flex flex-wrap gap-4 mt-8 lg:mt-0 z-10">
           <button 
             onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=Olá, preciso de suporte técnico infra.`, '_blank')}
             className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-4 rounded-3xl transition-all shadow-xl text-[10px] uppercase tracking-[0.2em] flex items-center gap-3"
           >
             <i className="fa-brands fa-whatsapp text-lg"></i> Suporte Infra
           </button>
           <button 
             onClick={() => setIsNewOrgModalOpen(true)}
             className="bg-amber-600 hover:bg-amber-500 text-slate-950 font-black px-10 py-4 rounded-3xl transition-all shadow-xl text-[10px] uppercase tracking-[0.2em]"
           >
             Provisionar Nova Empresa
           </button>
        </div>
        <i className="fa-solid fa-shield-halved absolute -right-10 -bottom-10 text-[15rem] text-slate-800 opacity-10 pointer-events-none"></i>
      </div>

      {/* KPI GRID */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
         <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
            <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-2">Total de Clientes</p>
            <div className="flex items-end gap-3">
              <h3 className="text-5xl font-black text-white font-mono">{stats.total}</h3>
              <span className="text-emerald-500 text-xs font-bold mb-2">+{stats.newClients}</span>
            </div>
         </div>
         <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
            <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest mb-2">MRR Estimado (SaaS)</p>
            <h3 className="text-5xl font-black text-white font-mono">R$ {stats.revenue.toLocaleString('pt-BR')}</h3>
         </div>
         <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
            <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest mb-2">Eficiência Nodes</p>
            <h3 className="text-5xl font-black text-white font-mono">{Math.round((stats.active / stats.total) * 100 || 0)}%</h3>
         </div>
      </div>

      {/* TABELA DE TENANTS */}
      <div className="bg-slate-900/40 rounded-[3.5rem] border border-slate-800 overflow-hidden shadow-2xl">
         <div className="p-10 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row justify-between items-center gap-6">
            <h3 className="text-xl font-black text-white uppercase tracking-tight flex items-center gap-3">
              <i className="fa-solid fa-database text-slate-600"></i> Gestão de Instâncias
            </h3>
            <div className="relative w-full md:w-96">
               <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-slate-500"></i>
               <input 
                 type="text" 
                 value={searchTerm}
                 onChange={e => setSearchTerm(e.target.value)}
                 placeholder="Buscar por Empresa..."
                 className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white outline-none focus:border-amber-500/50"
               />
            </div>
         </div>
         <div className="overflow-x-auto">
            <table className="w-full text-left">
               <thead className="bg-slate-900/80 text-[10px] text-slate-600 font-black uppercase border-b border-slate-800">
                  <tr>
                      <th className="p-8">Tenant (Empresa)</th>
                      <th className="p-8">Plano</th>
                      <th className="p-8">Status</th>
                      <th className="p-8 text-center">Ações de Controle</th>
                  </tr>
               </thead>
               <tbody className="divide-y divide-slate-800/50">
                  {filteredOrgs.map(org => (
                    <tr key={org.id} className="hover:bg-white/5 transition-all">
                       <td className="p-8">
                          <div className="flex items-center gap-6">
                             <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-xl font-black text-white" style={{ borderLeft: `4px solid ${org.branding?.primaryColor || '#C5A059'}` }}>
                                {org.name[0]}
                             </div>
                             <div>
                                <p className="text-white font-black text-lg leading-none">{org.name}</p>
                                <p className="text-[9px] text-slate-500 font-black uppercase mt-2 italic">ID: {org.id}</p>
                             </div>
                          </div>
                       </td>
                       <td className="p-8">
                          <select 
                            value={org.subscription}
                            onChange={(e) => onUpdateOrgSubscription(org.id, e.target.value as SubscriptionLevel)}
                            className="bg-slate-950 border border-slate-800 text-amber-500 text-[9px] font-black p-2 rounded-xl uppercase outline-none"
                          >
                            <option value="BRONZE">BRONZE</option>
                            <option value="SILVER">SILVER</option>
                            <option value="GOLD">GOLD</option>
                          </select>
                       </td>
                       <td className="p-8">
                          <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase ${
                              org.status === 'ACTIVE' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20' : 'bg-red-500/10 text-red-500 border-red-500/20'
                          }`}>
                              {org.status === 'ACTIVE' ? 'ATIVO' : 'BLOQUEADO'}
                          </span>
                       </td>
                       <td className="p-8">
                          <div className="flex justify-center gap-3">
                             <button 
                               onClick={() => onUpdateOrgStatus(org.id, org.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                               className={`px-6 py-2.5 rounded-xl text-[9px] font-black uppercase transition-all border ${
                                 org.status === 'ACTIVE' ? 'border-red-500/20 text-red-500 hover:bg-red-600' : 'border-emerald-500/20 text-emerald-500 hover:bg-emerald-600'
                               } hover:text-white`}
                             >
                                {org.status === 'ACTIVE' ? 'Bloquear' : 'Ativar'}
                             </button>
                             <button 
                                onClick={() => handleWhatsappOnboarding(org)}
                                className="w-10 h-10 rounded-xl bg-emerald-600/20 border border-emerald-500/30 text-emerald-500 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all"
                             >
                                <i className="fa-brands fa-whatsapp"></i>
                             </button>
                          </div>
                       </td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      </div>

      {/* MODAL PROVISIONAMENTO */}
      {isNewOrgModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1500] flex items-center justify-center p-6">
          <div className="bg-slate-900 border border-amber-500/30 rounded-[3.5rem] w-full max-w-xl p-12 shadow-2xl">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-white uppercase">Provisionar Node</h3>
                <button onClick={() => setIsNewOrgModalOpen(false)} className="text-slate-500 hover:text-white"><i className="fa-solid fa-xmark text-4xl"></i></button>
             </div>
             <form onSubmit={handleCreateOrg} className="space-y-8">
                <div className="space-y-2">
                   <label className="text-[10px] text-slate-500 font-black uppercase ml-3">Nome da Empresa</label>
                   <input required value={newOrgForm.name} onChange={e => setNewOrgForm({...newOrgForm, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white outline-none focus:border-amber-500" placeholder="Ex: Alpha Tech" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-slate-500 font-black uppercase ml-3">CNPJ</label>
                   <input required value={newOrgForm.cnpj} onChange={e => setNewOrgForm({...newOrgForm, cnpj: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white outline-none focus:border-amber-500" placeholder="00.000.000/0000-00" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-slate-500 font-black uppercase ml-3">Plano</label>
                   <select value={newOrgForm.subscription} onChange={e => setNewOrgForm({...newOrgForm, subscription: e.target.value as SubscriptionLevel})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-5 text-white outline-none">
                      <option value="BRONZE">BRONZE (97,00)</option>
                      <option value="SILVER">SILVER (197,00)</option>
                      <option value="GOLD">GOLD (497,00)</option>
                   </select>
                </div>
                <button type="submit" className="w-full py-6 bg-amber-600 hover:bg-amber-500 text-slate-950 font-black text-xs uppercase tracking-[0.4em] rounded-3xl transition-all shadow-xl">ATIVAR ECOSSISTEMA</button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MasterAdmin;
