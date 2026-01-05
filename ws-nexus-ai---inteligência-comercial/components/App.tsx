import React, { useState, useEffect } from 'react';
import { ModuleType, ProductItem, Organization, UserProfile, SubscriptionLevel, FinancialTransaction, TransactionStatus, AuditLog, UserRole, Lead } from './types';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import MarketingAI from './components/MarketingAI';
import SalesCRM from './components/SalesCRM';
import NexusDocs from './components/NexusDocs';
import InventoryManager from './components/InventoryManager';
import RHManager from './components/RHManager';
import SchedulingManager from './components/SchedulingManager';
import SettingsManager from './components/SettingsManager';
import FinancialManager from './components/FinancialManager';
import MasterAdmin from './components/MasterAdmin';
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

const MASTER_DEVELOPER: UserProfile = { 
  id: 'master-dev', 
  name: 'Desenvolvedor Master', 
  email: 'dev@wsbrasil.com', 
  role: 'SUPER_ADMIN', 
  organizationId: 'ORG-WS-001', 
  isActive: true, 
  mfaEnabled: true 
};

const INITIAL_USERS: UserProfile[] = [
  MASTER_OWNER,
  MASTER_DEVELOPER,
  { id: 'u1', name: 'Admin WS Brasil', email: 'admin', role: 'ADM', organizationId: 'ORG-WS-001', isActive: true, mfaEnabled: false },
];

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthLoading, setIsAuthLoading] = useState(false);
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'ERROR' | 'SYNCING'>('CONNECTED');
  const [mustResetPassword, setMustResetPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [showUpgradeModal, setShowUpgradeModal] = useState<{ required: SubscriptionLevel, reason: string } | null>(null);

  // --- ESTADOS COM PERSISTÊNCIA ---
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('@wsbrasil:organizations');
    return saved ? JSON.parse(saved) : INITIAL_ORGS;
  });

  const [org, setOrg] = useState<Organization>(organizations[0]);
  const [users, setUsers] = useState<UserProfile[]>(INITIAL_USERS);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [finance, setFinance] = useState<FinancialTransaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Salvar sempre que houver mudança nas organizações
  useEffect(() => {
    localStorage.setItem('@wsbrasil:organizations', JSON.stringify(organizations));
  }, [organizations]);

  const PLAN_RULES = {
    BRONZE: { modules: [ModuleType.DASHBOARD, ModuleType.SALES, ModuleType.SCHEDULING, ModuleType.PRICING], maxUsers: 3 },
    SILVER: { modules: [ModuleType.DASHBOARD, ModuleType.SALES, ModuleType.SCHEDULING, ModuleType.RH, ModuleType.PRICING], maxUsers: 15 },
    GOLD: { modules: Object.values(ModuleType), maxUsers: 100 }
  };

  const checkModuleAccess = (module: ModuleType) => {
    if (currentUser?.role === 'SUPER_ADMIN') return true;
    if (module === ModuleType.PRICING) return true;
    const allowedModules = PLAN_RULES[org.subscription].modules;
    const hasAccess = allowedModules.includes(module);
    if (!hasAccess) {
      const required = (module === ModuleType.RH || module === ModuleType.MARKETING) ? 'SILVER' as SubscriptionLevel : 'GOLD' as SubscriptionLevel;
      setShowUpgradeModal({ required, reason: `O módulo ${module} exige o nível ${required} de inteligência processual.` });
      return false;
    }
    return true;
  };

  const handleSetActiveModule = (module: ModuleType) => {
    if (checkModuleAccess(module)) setActiveModule(module);
  };

  const handleLogin = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    const normalizedEmail = email.toLowerCase().trim();

    if (normalizedEmail === 'diretoria@wsbrasil.com.br' && pass === 'wsbrasil123') {
      setCurrentUser(MASTER_OWNER);
      setOrg(organizations[0]);
      setActiveModule(ModuleType.DASHBOARD);
      setIsAuthenticated(true);
      setIsAuthLoading(false);
      return;
    }

    if (normalizedEmail === 'dev@wsbrasil.com' && pass === 'master_ws_2026') {
      setCurrentUser(MASTER_DEVELOPER);
      setOrg(organizations[0]);
      setActiveModule(ModuleType.MASTER_ADMIN);
      setIsAuthenticated(true);
      setIsAuthLoading(false);
      return;
    }

    let user = users.find(u => u.email.toLowerCase() === normalizedEmail);
    if (user) {
      const userOrg = organizations.find(o => o.id === user?.organizationId);
      if (!userOrg || userOrg.status !== 'ACTIVE') {
        alert("Instância suspensa. Contate diretoria@wsbrasil.com.br");
        setIsAuthLoading(false);
        return;
      }
      setCurrentUser(user);
      setOrg(userOrg);
      setIsAuthenticated(true);
    } else {
      alert("Credenciais Nexus não localizadas.");
    }
    setIsAuthLoading(false);
  };

  // --- FUNÇÕES MASTER ADMIN (CRUD REAL) ---
  const handleAddOrg = (newOrgData: Partial<Organization>) => {
    const newOrg: Organization = {
      id: `WS-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      name: newOrgData.name || 'Nova Empresa',
      cnpj: newOrgData.cnpj || '00.000.000/0001-00',
      subscription: newOrgData.subscription || 'BRONZE',
      status: 'ACTIVE',
      maxUsers: newOrgData.subscription === 'GOLD' ? 100 : 10,
      createdAt: new Date().toISOString(),
      metrics: { usersCount: 1, leadsCount: 0, revenueValue: 0 },
      branding: { primaryColor: '#C5A059', secondaryColor: '#020617', logoUrl: null },
      lgpdCompliance: { dataRetentionDays: 180, anonymizeOnDelete: true, dpoContact: '' },
      pipelineStages: INITIAL_ORGS[0].pipelineStages,
      customFieldDefinitions: []
    };
    setOrganizations(prev => [...prev, newOrg]);
  };

  const handleUpdateStatus = (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    setOrganizations(prev => prev.map(o => o.id === id ? { ...o, status } : o));
  };

  const handleUpdateSub = (id: string, level: SubscriptionLevel) => {
    setOrganizations(prev => prev.map(o => o.id === id ? { ...o, subscription: level } : o));
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setMustResetPassword(false);
    setActiveModule(ModuleType.DASHBOARD);
  };

  if (!isAuthenticated) return <AuthManager onLogin={handleLogin} isLoading={isAuthLoading} />;
  if (mustResetPassword) return <PasswordReset onComplete={() => setMustResetPassword(false)} />;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={handleSetActiveModule} 
        userRole={currentUser!.role} 
        planType={org.subscription}
        isCloudSyncing={isCloudSyncing}
        connectionStatus={connectionStatus}
      />
      <main className="flex-1 ml-20 transition-all duration-300 p-8 lg:p-12 overflow-y-auto relative bg-slate-950">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center space-x-6">
             <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-white text-xl font-black shadow-lg border border-white/10" style={{ backgroundColor: org.branding.primaryColor }}>
                {org.branding.logoUrl ? <img src={org.branding.logoUrl} className="w-8 h-8 object-contain" /> : org.name[0]}
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
                   <p className="text-xs font-black text-white leading-none">{currentUser!.name}</p>
                   <p className={`text-[8px] font-bold uppercase tracking-[0.2em] mt-1.5 ${currentUser?.role === 'SUPER_ADMIN' ? 'text-amber-500' : 'text-blue-500'}`}>
                     {currentUser?.role}
                   </p>
                </div>
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:text-amber-500 transition-colors">
                   <i className={`fa-solid ${currentUser?.role === 'SUPER_ADMIN' ? 'fa-crown' : 'fa-user-gear'}`}></i>
                </div>
                <div className="absolute top-full right-0 mt-3 w-56 bg-slate-900 border border-slate-800 rounded-[1.5rem] shadow-2xl opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all p-2 z-[200] pointer-events-none group-hover:pointer-events-auto">
                   <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 hover:bg-rose-500/10 text-rose-500 rounded-xl transition-colors">
                      <i className="fa-solid fa-power-off text-sm"></i>
                      <span className="text-[10px] font-black uppercase tracking-widest">Encerrar Sessão</span>
                   </button>
                </div>
             </div>
          </div>
        </header>

        <section className="max-w-7xl mx-auto pb-24">
          {activeModule === ModuleType.DASHBOARD && <Dashboard />}
          {activeModule === ModuleType.MARKETING && <MarketingAI />}
          {activeModule === ModuleType.SALES && <SalesCRM leads={leads} setLeads={setLeads} />}
          {activeModule === ModuleType.RH && <RHManager />}
          {activeModule === ModuleType.FINANCE && <FinancialManager transactions={finance} onAddTransaction={() => {}} onUpdateStatus={() => {}} />}
          {activeModule === ModuleType.SCHEDULING && <SchedulingManager />}
          {activeModule === ModuleType.DOCUMENTS && <NexusDocs />}
          {activeModule === ModuleType.INVENTORY && <InventoryManager items={items} setItems={setItems} />}
          {activeModule === ModuleType.PRICING && <PricingPage />}
          
          {activeModule === ModuleType.SETTINGS && (
            <SettingsManager 
              org={org} 
              onUpdateOrg={setOrg} 
              users={users} 
              onAddUser={(u) => setUsers([...users, { ...u, id: Date.now().toString(), organizationId: org.id, isActive: true, mfaEnabled: false } as UserProfile])}
              onRemoveUser={(id) => setUsers(users.filter(u => u.id !== id))}
              auditLogs={[]} 
              userLimit={org.maxUsers} 
            />
          )}

          {activeModule === ModuleType.MASTER_ADMIN && currentUser?.role === 'SUPER_ADMIN' && (
            <MasterAdmin 
              organizations={organizations} 
              onUpdateOrgStatus={handleUpdateStatus} 
              onUpdateOrgSubscription={handleUpdateSub} 
              onAddOrg={handleAddOrg} 
            />
          )}
        </section>
      </main>

      <NexusChat />
      <NexusVoice />
      {showUpgradeModal && <UpgradeModal required={showUpgradeModal.required} reason={showUpgradeModal.reason} onClose={() => setShowUpgradeModal(null)} />}
    </div>
  );
};

export default App;
