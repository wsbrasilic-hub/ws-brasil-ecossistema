import React from 'react';
import { ModuleType, UserRole, SubscriptionLevel } from '../types';

interface SidebarProps {
  activeModule: ModuleType;
  setActiveModule: (module: ModuleType) => void;
  userRole: UserRole;
  planType: SubscriptionLevel;
  isCloudSyncing?: boolean;
  connectionStatus?: 'CONNECTED' | 'ERROR' | 'SYNCING';
}

const Sidebar: React.FC<SidebarProps> = ({ activeModule, setActiveModule, userRole, planType, isCloudSyncing, connectionStatus = 'CONNECTED' }) => {
  
  // Lógica de permissão por plano (para usuários normais)
  const planPermissions: Record<SubscriptionLevel, ModuleType[]> = {
    BRONZE: [ModuleType.DASHBOARD, ModuleType.SALES, ModuleType.SCHEDULING, ModuleType.PRICING],
    SILVER: [ModuleType.DASHBOARD, ModuleType.SALES, ModuleType.SCHEDULING, ModuleType.RH, ModuleType.PRICING, ModuleType.MARKETING],
    GOLD: Object.values(ModuleType)
  };

  const allMenuItems = [
    { type: ModuleType.DASHBOARD, label: 'Central Nexus', icon: 'fa-solid fa-house-chimney-window' },
    { type: ModuleType.MARKETING, label: 'Marketing AI', icon: 'fa-solid fa-wand-magic-sparkles' },
    { type: ModuleType.SALES, label: 'Vendas & CRM', icon: 'fa-solid fa-chart-line' },
    { type: ModuleType.FINANCE, label: 'Gestão Financeira', icon: 'fa-solid fa-sack-dollar', userPermission: ['ADM', 'GERENTE', 'FINANCEIRO', 'SUPER_ADMIN'] },
    { type: ModuleType.SCHEDULING, label: 'Nexus Chronos', icon: 'fa-solid fa-calendar-check' },
    { type: ModuleType.DOCUMENTS, label: 'Nexus Docs', icon: 'fa-solid fa-file-signature' },
    { type: ModuleType.RH, label: 'RH Strategy', icon: 'fa-solid fa-users-gear' },
    { type: ModuleType.INVENTORY, label: 'ERP & Estoque', icon: 'fa-solid fa-boxes-stacked' },
    { type: ModuleType.PRICING, label: 'Preços e Planos', icon: 'fa-solid fa-tags' },
    { type: ModuleType.SETTINGS, label: 'Configurações', icon: 'fa-solid fa-gear', userPermission: ['ADM', 'SUPER_ADMIN'] },
  ];

  // Filtra itens por cargo (Role-Based Access Control)
  const menuItems = allMenuItems.filter(item => 
    !item.userPermission || item.userPermission.includes(userRole)
  );

  const statusColor = {
    CONNECTED: 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]',
    ERROR: 'bg-rose-500 animate-pulse shadow-[0_0_12px_rgba(244,63,94,0.8)]',
    SYNCING: 'bg-blue-500 animate-ping shadow-[0_0_10px_rgba(59,130,246,0.8)]'
  };

  return (
    <aside className="fixed left-0 top-0 h-full z-[100] w-20 hover:w-72 group transition-all duration-300 ease-in-out bg-slate-900/40 backdrop-blur-2xl border-r border-slate-800 flex flex-col overflow-hidden">
      <div className="h-24 flex items-center px-6 shrink-0 overflow-hidden">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-black text-white shrink-0 shadow-lg ${userRole === 'SUPER_ADMIN' ? 'bg-amber-500' : 'bg-slate-700'}`}>
          WS
        </div>
        <div className="ml-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap">
           <h1 className="text-lg font-black tracking-tighter text-white leading-none">NEXUS <span className="font-light text-amber-500">AI</span></h1>
           <p className="text-[7px] text-slate-500 font-black uppercase tracking-[0.4em] mt-1">Strategic Core</p>
        </div>
      </div>

      <nav className="flex-1 px-4 space-y-2 mt-4 overflow-y-auto custom-scrollbar overflow-x-hidden">
        {menuItems.map((item) => {
          const isActive = activeModule === item.type;
          
          // Lógica de Bloqueio: SUPER_ADMIN ignora travas de plano. O módulo SETTINGS também é liberado se o user tiver permissão de cargo.
          const isLocked = userRole !== 'SUPER_ADMIN' && 
                           item.type !== ModuleType.SETTINGS && 
                           !planPermissions[planType].includes(item.type);
          
          return (
            <button
              key={item.type}
              onClick={() => !isLocked && setActiveModule(item.type)}
              className={`w-full flex items-center h-12 rounded-xl transition-all relative group/btn overflow-hidden ${
                isActive 
                  ? 'bg-amber-500/10 text-white font-bold border border-amber-500/20' 
                  : isLocked ? 'text-slate-700 opacity-60 cursor-not-allowed' : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
              }`}
            >
              <div className="w-12 h-12 shrink-0 flex items-center justify-center relative z-10">
                <i className={`${item.icon} text-lg transition-transform ${isActive ? 'text-amber-500 scale-110' : isLocked ? 'text-slate-800' : 'group-hover/btn:scale-110'}`}></i>
                {isLocked && (
                  <div className="absolute top-1 right-1">
                    <i className="fa-solid fa-lock text-[7px] text-amber-500/50"></i>
                  </div>
                )}
              </div>
              <span className={`ml-2 font-black text-[9px] uppercase tracking-[0.15em] transition-all duration-300 whitespace-nowrap opacity-0 group-hover:opacity-100 ${isActive ? 'text-white' : isLocked ? 'text-slate-700' : 'text-slate-500'}`}>
                {item.label}
              </span>
              {isActive && <div className="absolute left-0 w-1 h-5 bg-amber-500 rounded-r-full shadow-[0_0_10px_rgba(197,160,89,0.5)]"></div>}
            </button>
          );
        })}
      </nav>

      {/* FOOTER - STATUS DA CONEXÃO */}
      <div className="p-4 border-t border-slate-800 mt-auto bg-slate-950/50">
        <div className="flex items-center gap-4 group/status cursor-help">
          <div className="w-10 h-10 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-center shrink-0 shadow-inner">
             <div className={`w-1.5 h-1.5 rounded-full transition-all duration-500 ${statusColor[isCloudSyncing ? 'SYNCING' : connectionStatus]}`}></div>
          </div>
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 whitespace-nowrap overflow-hidden">
             <p className="text-[8px] font-black uppercase tracking-widest text-white">
               {userRole === 'SUPER_ADMIN' ? 'NEXUS MASTER NODE' : 'Cloud Connected'}
             </p>
             <p className="text-[7px] text-slate-500 font-bold uppercase">{userRole === 'SUPER_ADMIN' ? 'GOVERNANÇA TOTAL' : planType + ' LEVEL'}</p>
          </div>
        </div>
      </div>

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 0px; }
        .group:hover .custom-scrollbar::-webkit-scrollbar { width: 2px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(197, 160, 89, 0.2); border-radius: 10px; }
      `}</style>
    </aside>
  );
};

export default Sidebar;
