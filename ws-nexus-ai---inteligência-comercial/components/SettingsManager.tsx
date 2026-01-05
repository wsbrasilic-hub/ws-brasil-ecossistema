import React, { useState } from 'react';
import { Organization, UserRole, UserProfile, AuditLog } from '../types';

interface SettingsManagerProps {
  org: Organization;
  onUpdateOrg: (updated: Organization) => void;
  users: UserProfile[];
  onAddUser: (user: Partial<UserProfile>) => void;
  onRemoveUser: (id: string) => void;
  auditLogs: AuditLog[];
  userLimit: number;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ 
  org, 
  onUpdateOrg, 
  users, 
  onAddUser, 
  onRemoveUser, 
  auditLogs, 
  userLimit 
}) => {
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'TEAM' | 'SECURITY' | 'FIELDS'>('BRANDING');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserProfile>>({ name: '', email: '', role: 'VENDEDOR' });

  const isAtLimit = users.length >= userLimit;

  // Função interna para disparar o convite e fechar o modal
  const handleInvite = () => {
    if (!newUser.name || !newUser.email) {
      alert("Comandante, os dados de identificação são obrigatórios.");
      return;
    }
    
    onAddUser(newUser); // Esta função agora dispara o syncEntity no App.tsx
    setShowInviteModal(false);
    setNewUser({ name: '', email: '', role: 'VENDEDOR' });
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      {/* HEADER DE COMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-slate-900 border border-slate-800 p-8 rounded-[3rem] shadow-2xl relative overflow-hidden">
        <div className="z-10">
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
             <i className="fa-solid fa-screwdriver-wrench text-amber-500"></i> Console do Administrador
          </h2>
          <p className="text-slate-500 font-bold text-[10px] uppercase tracking-[0.4em] mt-2">Configurações de Instância • WS Brasil I.C.</p>
        </div>
        
        <div className="flex bg-slate-800/50 p-1.5 rounded-2xl border border-slate-700 mt-6 md:mt-0 z-10">
           {(['BRANDING', 'TEAM', 'FIELDS', 'SECURITY'] as const).map(tab => (
             <button 
               key={tab}
               onClick={() => setActiveTab(tab)}
               className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/20' : 'text-slate-500 hover:text-white'}`}
             >
               {tab === 'BRANDING' ? 'Marca' : tab === 'TEAM' ? 'Equipe' : tab === 'FIELDS' ? 'Dados' : 'Segurança'}
             </button>
           ))}
        </div>
        <i className="fa-solid fa-gears absolute -right-10 -bottom-10 text-[12rem] text-slate-800 opacity-10 pointer-events-none"></i>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
           
           {/* ABA: MARCA (WHITE LABEL) */}
           {activeTab === 'BRANDING' && (
             <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-10 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight">Identidade Visual (White Label)</h3>
                   <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black border border-emerald-500/20">CUSTOMIZAÇÃO ATIVA</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-3">Logotipo da Organização</label>
                      <div className="border-2 border-dashed border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center bg-slate-950 hover:border-amber-500 transition-colors cursor-pointer group">
                         {org.branding.logoUrl ? (
                           <img src={org.branding.logoUrl} alt="Logo" className="max-h-16 mb-4" />
                         ) : (
                           <i className="fa-solid fa-image text-4xl text-slate-700 group-hover:text-amber-500 mb-4"></i>
                         )}
                         <p className="text-[10px] font-black text-slate-600 uppercase">Subir Logo PNG/SVG</p>
                      </div>
                   </div>

                   <div className="space-y-8">
                      <div className="space-y-3">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-3">Cor Primária do Ecossistema</label>
                        <div className="flex gap-4 items-center">
                           <div className="w-14 h-14 rounded-2xl overflow-hidden border border-slate-800">
                              <input 
                                type="color" 
                                value={org.branding.primaryColor} 
                                onChange={e => onUpdateOrg({...org, branding: {...org.branding, primaryColor: e.target.value}})}
                                className="w-[200%] h-[200%] -translate-x-4 -translate-y-4 cursor-pointer"
                              />
                           </div>
                           <input 
                             type="text" 
                             value={org.branding.primaryColor} 
                             readOnly
                             className="flex-1 bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-mono uppercase text-sm"
                           />
                        </div>
                      </div>

                      <div className="space-y-3">
                        <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-3">Nome da Instância</label>
                        <input 
                          type="text" 
                          value={org.name}
                          onChange={e => onUpdateOrg({...org, name: e.target.value})}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-white font-bold"
                        />
                      </div>
                   </div>
                </div>
             </div>
           )}

           {/* ABA: EQUIPE (GESTÃO NEXUS) */}
           {activeTab === 'TEAM' && (
             <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-8 animate-fadeIn">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                   <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Gestão de Colaboradores</h3>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">
                        Consumo: <span className={isAtLimit ? "text-amber-500" : "text-emerald-500"}>{users.length}</span> / {userLimit} licenças ativas.
                      </p>
                   </div>
                   <button 
                     onClick={() => isAtLimit ? alert("Limite de licenças atingido!") : setShowInviteModal(true)}
                     className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${isAtLimit ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-600 hover:bg-amber-500 text-slate-950'}`}
                   >
                     {isAtLimit ? 'Limite Atingido' : 'Adicionar Membro'}
                   </button>
                </div>

                <div className="space-y-4">
                   {users.map(user => (
                      <div key={user.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center justify-between group transition-all hover:border-amber-500/30">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-black overflow-hidden shadow-inner uppercase">
                               {user.name?.[0] || 'U'}
                            </div>
                            <div>
                               <p className="text-white font-bold">{user.name}</p>
                               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.email}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            <span className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-xl text-[9px]
