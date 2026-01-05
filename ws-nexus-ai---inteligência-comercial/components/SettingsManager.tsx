
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

const SettingsManager: React.FC<SettingsManagerProps> = ({ org, onUpdateOrg, users, onAddUser, onRemoveUser, auditLogs, userLimit }) => {
  const [activeTab, setActiveTab] = useState<'BRANDING' | 'TEAM' | 'SECURITY' | 'FIELDS'>('BRANDING');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newUser, setNewUser] = useState<Partial<UserProfile>>({ name: '', email: '', role: 'VENDEDOR' });

  const isAtLimit = users.length >= userLimit;

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
           
           {activeTab === 'BRANDING' && (
             <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-10">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                   <h3 className="text-xl font-black text-white uppercase tracking-tight">Identidade Visual (White Label)</h3>
                   <span className="bg-emerald-500/10 text-emerald-500 px-3 py-1 rounded-full text-[9px] font-black border border-emerald-500/20">CUSTOMIZAÇÃO ATIVA</span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                      <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-3">Logotipo da Organização</label>
                      <div className="border-2 border-dashed border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center bg-slate-950 hover:border-amber-500 transition-colors cursor-pointer group">
                         <i className="fa-solid fa-image text-4xl text-slate-700 group-hover:text-amber-500 mb-4"></i>
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

           {activeTab === 'TEAM' && (
             <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-8">
                <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                   <div>
                      <h3 className="text-xl font-black text-white uppercase tracking-tight">Gestão de Colaboradores</h3>
                      <p className="text-[9px] text-slate-500 font-black uppercase tracking-widest mt-1">
                        Consumo: <span className={isAtLimit ? "text-amber-500" : "text-emerald-500"}>{users.length}</span> / {userLimit} licenças ativas.
                      </p>
                   </div>
                   <button 
                     onClick={() => {
                        if (isAtLimit) {
                            onAddUser({}); // Dispara a trava de plano no App.tsx
                        } else {
                            setShowInviteModal(true);
                        }
                     }}
                     className={`px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg ${isAtLimit ? 'bg-amber-600/20 text-amber-500 border border-amber-500/30' : 'bg-amber-600 hover:bg-amber-500 text-slate-950'}`}
                   >
                     {isAtLimit ? 'Upgrade Necessário' : 'Adicionar Membro'}
                   </button>
                </div>

                {isAtLimit && (
                  <div className="p-6 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center gap-4 animate-fadeIn">
                     <i className="fa-solid fa-crown text-amber-500 text-xl"></i>
                     <div className="flex-1">
                        <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest">
                          Limite do seu plano atingido.
                        </p>
                        <p className="text-[9px] text-slate-400 font-medium mt-1 leading-tight">
                          Faça upgrade agora para adicionar mais colaboradores e escalar sua operação comercial.
                        </p>
                     </div>
                  </div>
                )}

                <div className="space-y-4">
                   {users.map(user => (
                      <div key={user.id} className="bg-slate-950 p-6 rounded-3xl border border-slate-800 flex items-center justify-between group transition-all hover:border-amber-500/30">
                         <div className="flex items-center gap-6">
                            <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-white font-black overflow-hidden shadow-inner">
                               {user.avatar ? <img src={user.avatar} className="w-full h-full object-cover" /> : user.name[0]}
                            </div>
                            <div>
                               <p className="text-white font-bold">{user.name}</p>
                               <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{user.email}</p>
                            </div>
                         </div>
                         <div className="flex items-center gap-8">
                            <span className="bg-amber-500/10 text-amber-500 px-4 py-1.5 rounded-xl text-[9px] font-black border border-amber-500/20 uppercase tracking-widest">
                               {user.role}
                            </span>
                            <button 
                              onClick={() => onRemoveUser(user.id)}
                              className="text-slate-700 hover:text-red-500 transition-colors"
                            >
                               <i className="fa-solid fa-user-minus"></i>
                            </button>
                         </div>
                      </div>
                   ))}
                </div>
             </div>
           )}

           {activeTab === 'SECURITY' && (
              <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-10 shadow-2xl space-y-12">
                 <div className="flex justify-between items-center border-b border-slate-800 pb-6">
                    <div>
                       <h3 className="text-xl font-black text-white uppercase tracking-tight">Segurança & LGPD Compliance</h3>
                       <p className="text-[9px] text-amber-500 font-bold uppercase mt-1 italic tracking-widest">Blindagem de Nível Bancário</p>
                    </div>
                    <i className="fa-solid fa-shield-halved text-3xl text-amber-500"></i>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800">
                       <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-6 block">Retenção de Dados (Dias)</label>
                       <div className="flex items-center gap-6">
                          <input 
                            type="range" min="30" max="365" step="30" 
                            value={org.lgpdCompliance.dataRetentionDays}
                            onChange={e => onUpdateOrg({...org, lgpdCompliance: {...org.lgpdCompliance, dataRetentionDays: Number(e.target.value)}})}
                            className="flex-1 accent-amber-600" 
                          />
                          <span className="text-white font-black text-xl">{org.lgpdCompliance.dataRetentionDays}d</span>
                       </div>
                    </div>
                    <div className="bg-slate-950 p-8 rounded-3xl border border-slate-800 flex items-center justify-between">
                       <div>
                          <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest block">Anonimização Ativa</label>
                          <p className="text-[9px] text-slate-700 uppercase mt-1 font-bold italic">Auto-clean em deletar Leads</p>
                       </div>
                       <button 
                         onClick={() => onUpdateOrg({...org, lgpdCompliance: {...org.lgpdCompliance, anonymizeOnDelete: !org.lgpdCompliance.anonymizeOnDelete}})}
                         className={`w-14 h-8 rounded-full transition-all relative ${org.lgpdCompliance.anonymizeOnDelete ? 'bg-amber-600' : 'bg-slate-800'}`}
                       >
                          <div className={`absolute top-1 w-6 h-6 rounded-full bg-white transition-all ${org.lgpdCompliance.anonymizeOnDelete ? 'left-7' : 'left-1'}`}></div>
                       </button>
                    </div>
                 </div>
              </div>
           )}
        </div>

        {/* COLUNA LATERAL - STATS INSTÂNCIA */}
        <div className="space-y-8">
           <div className="bg-slate-900 p-8 rounded-[3rem] border border-slate-800 shadow-2xl">
              <h4 className="text-white font-black uppercase text-[10px] tracking-widest mb-8 flex items-center gap-3">
                 <i className="fa-solid fa-server text-amber-500"></i> Health Check Instância
              </h4>
              <div className="space-y-6">
                 <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Consumo Users</span>
                    <span className={`font-black ${isAtLimit ? 'text-amber-500' : 'text-white'}`}>{users.length} / {userLimit}</span>
                 </div>
                 <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">Status Licença</span>
                    <span className="text-emerald-500 font-black uppercase text-xs">{org.subscription}</span>
                 </div>
                 <div className="p-6 bg-slate-950 rounded-2xl border border-slate-800 flex justify-between items-center">
                    <span className="text-[10px] text-slate-600 font-black uppercase tracking-widest">SSL / Criptografia</span>
                    <span className="text-emerald-500 font-black uppercase text-[10px]">Ativo & Seguro</span>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* MODAL: CONVITE DE USUÁRIO */}
      {showInviteModal && !isAtLimit && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-slate-900 border border-slate-800 rounded-[3.5rem] w-full max-w-xl shadow-2xl overflow-hidden p-12">
             <div className="flex justify-between items-center mb-10">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Novo Integrante</h3>
                <button onClick={() => setShowInviteModal(false)} className="text-slate-500 hover:text-white transition-transform hover:rotate-90"><i className="fa-solid fa-xmark text-3xl"></i></button>
             </div>
             <form className="space-y-6" onSubmit={(e) => { e.preventDefault(); onAddUser(newUser); setShowInviteModal(false); }}>
                <div className="space-y-2">
                   <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-3">Nome Completo</label>
                   <input required type="text" value={newUser.name} onChange={e => setNewUser({...newUser, name: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500" placeholder="João Exemplo" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-3">E-mail Corporativo</label>
                   <input required type="email" value={newUser.email} onChange={e => setNewUser({...newUser, email: e.target.value})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500" placeholder="joao@empresa.com" />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-3">Cargo de Acesso</label>
                   <select value={newUser.role} onChange={e => setNewUser({...newUser, role: e.target.value as UserRole})} className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-4 text-white outline-none focus:border-amber-500">
                      <option value="ADM">Administrador</option>
                      <option value="GERENTE">Gerente Operacional</option>
                      <option value="VENDEDOR">Comercial</option>
                      <option value="FINANCEIRO">Financeiro</option>
                      <option value="MARKETING">Marketing</option>
                   </select>
                </div>
                <button type="submit" className="w-full py-5 bg-amber-600 text-slate-950 font-black text-[10px] uppercase tracking-[0.3em] rounded-2xl shadow-xl shadow-amber-900/30 transition-all hover:scale-[1.02] mt-4">
                  ATIVAR ACESSO IMEDIATO
                </button>
             </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsManager;
