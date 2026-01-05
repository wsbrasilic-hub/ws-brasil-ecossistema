
import React, { useState, useCallback, useEffect } from 'react';
import { ModuleType, ProductItem, Organization, UserProfile, SubscriptionLevel, FinancialTransaction, TransactionStatus, Lead } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MarketingAI from './components/MarketingAI';
import SalesCRM from './components/SalesCRM';
import NexusDocs from './components/NexusDocs';
import InventoryManager from './components/InventoryManager';
import RHManager from './components/RHManager';
import SchedulingManager from './components/SchedulingManager';
import FinancialManager from './components/FinancialManager';
import PricingPage from './components/PricingPage';
import AuthManager from './components/AuthManager';
import PasswordReset from './components/PasswordReset';
import NexusChat from './components/NexusChat';
import UpgradeModal from './components/UpgradeModal';
import NexusVoice from './components/NexusVoice';

const INITIAL_ORGS: Organization[] = [
  {
    id: 'ORG-WS-001',
    name: 'WS Brasil Inteligência Comercial',
    cnpj: '12.345.678/0001-90',
    subscription: 'GOLD', 
    maxUsers: 100,
    status: 'ACTIVE',
    createdAt: '2024-01-01',
    lgpdCompliance: { dataRetentionDays: 180, anonymizeOnDelete: true, dpoContact: 'dpo@wsbrasil.com' },
    metrics: { usersCount: 2, leadsCount: 450, revenueValue: 125000 },
    branding: { primaryColor: '#C5A059', secondaryColor: '#020617', logoUrl: null },
    customFieldDefinitions: [],
    pipelineStages: [
      { id: 'QUALIFICADO', title: 'OPORTUNIDADES AGENDADAS', color: 'border-cyan-500' },
      { id: 'REUNIAO', title: 'REUNIÃO ESTRATÉGICA', color: 'border-blue-500' },
      { id: 'PROPOSTA', title: 'PROPOSTA EM ANÁLISE', color: 'border-amber-500' },
      { id: 'FECHAMENTO', title: 'FECHAMENTO IMINENTE', color: 'border-emerald-500' },
    ]
  }
];

const MASTER_OWNER: UserProfile = { 
  id: 'owner-ws-root', 
  name: 'Proprietário WS Brasil', 
  email: 'diretoria@wsbrasil.com.br', 
  role: 'SUPER_ADMIN', 
  organizationId: 'ORG-WS-001', 
  isActive: true, 
  mfaEnabled: true 
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isReadyForAI, setIsReadyForAI] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [org, setOrg] = useState<Organization>(INITIAL_ORGS[0]);

  // Estados de Dados
  const [leads, setLeads] = useState<Lead[]>([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [finance, setFinance] = useState<FinancialTransaction[]>([]);

  // Efeito para liberar componentes de IA apenas após o Dashboard estar estável
  useEffect(() => {
    if (isAuthenticated) {
      const timer = setTimeout(() => setIsReadyForAI(true), 500);
      return () => clearTimeout(timer);
    } else {
      setIsReadyForAI(false);
    }
  }, [isAuthenticated]);

  const handleLogin = useCallback(async (email: string, pass: string) => {
    const normalizedEmail = email.toLowerCase().trim();
    
    // LOGIN MASTER - PRIORIDADE ABSOLUTA
    if (normalizedEmail === 'diretoria@wsbrasil.com.br' && pass === 'wsbrasil123') {
      console.log("Nexus Security: Master Access Verified.");
      setCurrentUser(MASTER_OWNER);
      setOrg(INITIAL_ORGS[0]);
      setIsAuthenticated(true);
      return;
    }

    setIsAuthLoading(true);
    // Simulação curta para outros usuários
    await new Promise(resolve => setTimeout(resolve, 800));

    if (normalizedEmail === 'admin' && pass === 'admin2026') {
      setCurrentUser({ id: 'u1', name: 'Admin', email: 'admin', role: 'ADM', organizationId: 'ORG-WS-001', isActive: true, mfaEnabled: false });
      setIsAuthenticated(true);
    } else {
      alert("Nexus: Credenciais Inválidas.");
    }
    setIsAuthLoading(false);
  }, []);

  const handleLogout = () => {
    setIsAuthenticated(false);
    setIsReadyForAI(false);
    setCurrentUser(null);
    setActiveModule(ModuleType.DASHBOARD);
  };

  if (!isAuthenticated) {
    return <AuthManager onLogin={handleLogin} isLoading={isAuthLoading} />;
  }

  return (
    <div className="flex min-h-screen bg-slate-950 font-sans selection:bg-amber-500/30">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={setActiveModule} 
        userRole={currentUser?.role || 'VENDEDOR'} 
        planType={org.subscription}
      />
      
      <main className="flex-1 ml-20 p-8 lg:p-12 overflow-y-auto relative bg-slate-950">
        <header className="flex justify-between items-center mb-12 animate-fadeIn">
          <div className="flex items-center space-x-6">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg border border-white/10 bg-[#C5A059]">
                {org.name[0]}
             </div>
             <div className="flex flex-col">
                <span className="text-white text-lg font-black uppercase tracking-tighter leading-none">{org.name}</span>
                <div className="flex items-center gap-2 mt-2">
                   <span className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em]">Node: {org.id}</span>
                   {currentUser?.role === 'SUPER_ADMIN' && (
                     <span className="text-amber-500 text-[8px] font-black uppercase bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20 animate-pulse">
                        Nexus Root Authorization
                     </span>
                   )}
                </div>
             </div>
          </div>

          <div className="flex items-center space-x-4">
             <div className="flex items-center space-x-4 bg-slate-900/80 pl-5 pr-2 py-2 rounded-2xl border border-slate-800 shadow-xl relative group hover:border-amber-500/50 transition-all cursor-pointer">
                <div className="text-right">
                   <p className="text-xs font-black text-white leading-none">{currentUser?.name}</p>
                   <p className="text-[8px] font-bold uppercase tracking-[0.2em] mt-1.5 text-amber-500">
                    OWNER AUTHORITY
                   </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-amber-500/30 flex items-center justify-center text-amber-600">
                   <i className="fa-solid fa-crown"></i>
                </div>
                <div className="absolute top-full right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-[1.5rem] shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all p-2 z-[200] pointer-events-none group-hover:pointer-events-auto">
                   <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors">
                      <i className="fa-solid fa-power-off text-sm"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest text-left">Sair do Terminal</span>
                   </button>
                </div>
             </div>
          </div>
        </header>

        <section className="max-w-7xl mx-auto pb-24 animate-fadeIn">
          {activeModule === ModuleType.DASHBOARD && <Dashboard />}
          {activeModule === ModuleType.MARKETING && <MarketingAI />}
          {activeModule === ModuleType.SALES && <SalesCRM leads={leads} setLeads={setLeads} />}
          {activeModule === ModuleType.RH && <RHManager />}
          {activeModule === ModuleType.FINANCE && <FinancialManager transactions={finance} onAddTransaction={() => {}} onUpdateStatus={() => {}} />}
          {activeModule === ModuleType.SCHEDULING && <SchedulingManager />}
          {activeModule === ModuleType.DOCUMENTS && <NexusDocs />}
          {activeModule === ModuleType.INVENTORY && <InventoryManager items={items} setItems={setItems} />}
          {activeModule === ModuleType.PRICING && <PricingPage />}
        </section>
      </main>

      {isReadyForAI && (
        <>
          <NexusChat />
          <NexusVoice />
        </>
      )}
    </div>
  );
};

export default App;
