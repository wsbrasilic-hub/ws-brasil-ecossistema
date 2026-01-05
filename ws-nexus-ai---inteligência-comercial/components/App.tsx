import React, { useState, useEffect, useCallback } from 'react';
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

// Importação do Ecossistema WS Brasil Nexus (Supabase)
import { supabase, syncEntity } from './services/supabase';

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
  const [isCloudSyncing, setIsCloudSyncing] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<'CONNECTED' | 'ERROR' | 'SYNCING'>('CONNECTED');
  const [mustResetPassword, setMustResetPassword] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [showUpgradeModal, setShowUpgradeModal] = useState<{ required: SubscriptionLevel, reason: string } | null>(null);

  // --- ESTADOS COM SINCRONISMO NAVE/NUVEM ---
  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGS);
  const [org, setOrg] = useState<Organization>(INITIAL_ORGS[0]);
  const [users, setUsers] = useState<UserProfile[]>([MASTER_OWNER]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [finance, setFinance] = useState<FinancialTransaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // --- CARREGAMENTO INICIAL SUPABASE ---
  useEffect(() => {
    const bootstrapNexus = async () => {
      setConnectionStatus('SYNCING');
      const { data, error } = await supabase.from('organizations').select('*');
      
      if (!error && data && data.length > 0) {
        const mappedOrgs = data.map(o => ({
          ...o,
          branding: typeof o.branding === 'string' ? JSON.parse(o.branding) : o.branding || INITIAL_ORGS[0].branding,
          pipelineStages: INITIAL_ORGS[0].pipelineStages
        }));
        setOrganizations(mappedOrgs);
        setConnectionStatus('CONNECTED');
      } else if (error) {
        setConnectionStatus('ERROR');
      }
    };
    bootstrapNexus();
  }, []);

  // --- BUSCA USUÁRIOS QUANDO A ORG MUDA ---
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organizationId', org.id);
      
      if (!error && data) {
        const mappedUsers = data.map(u => ({ ...u, name: u.fullName || u.name }));
        setUsers(mappedUsers.length > 0 ? mappedUsers : [MASTER_OWNER]);
      }
    };
    if (isAuthenticated) fetchUsers();
  }, [org.id, isAuthenticated]);

  const PLAN_RULES = {
    BRONZE: { modules: [ModuleType.DASHBOARD, ModuleType.SALES, ModuleType.SCHEDULING, ModuleType.PRICING], maxUsers: 3 },
    SILVER: { modules: [ModuleType.DASHBOARD, ModuleType.SALES, ModuleType.SCHEDULING, ModuleType.RH, ModuleType.PRICING], maxUsers: 15 },
    GOLD: { modules: Object.values(ModuleType), maxUsers: 100 }
  };

  const checkModuleAccess = (module: ModuleType) => {
    if (currentUser?.role === 'SUPER_ADMIN') return true;
    const allowedModules = PLAN_RULES[org.subscription].modules;
    if (!allowedModules.includes(module)) {
      const required = (module === ModuleType.RH || module === ModuleType.MARKETING) ? 'SILVER' as SubscriptionLevel : 'GOLD' as SubscriptionLevel;
      setShowUpgradeModal({ required, reason: `O módulo ${module} exige o nível ${required} de inteligência processual.` });
      return false;
    }
    return true;
  };

  const handleLogin = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    const normalizedEmail = email.toLowerCase().trim();

    // Login Master Root
    if (normalizedEmail === 'diretoria@wsbrasil.com.br' && pass === 'wsbrasil123') {
      setCurrentUser(MASTER_OWNER);
      setOrg(organizations[0]);
      setIsAuthenticated(true);
      setIsAuthLoading(false);
      return;
    }

    // Busca usuário no banco para login
    const { data: dbUser, error } = await supabase
      .from('users')
      .select('*')
      .eq('email', normalizedEmail)
      .single();

    if (!error && dbUser && pass === 'admin2026') { // Senha padrão temporária
      const userOrg = organizations.find(o => o.id === dbUser.organizationId);
      if (userOrg?.status === 'ACTIVE') {
        setCurrentUser({ ...dbUser, name: dbUser.fullName || dbUser.name });
        setOrg(userOrg);
        setIsAuthenticated(true);
      } else {
        alert("Instância suspensa ou não localizada.");
      }
    } else {
      alert("Credenciais Nexus não localizadas.");
    }
    setIsAuthLoading(false);
  };

  // --- AÇÕES SINCRONIZADAS (USERS) ---
  const handleAddUser = async (userData: Partial<UserProfile>) => {
    const newUser = {
      ...userData,
      id: `USR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      organizationId: org.id,
      isActive: true,
    };

    setIsCloudSyncing(true);
    const result = await syncEntity('users', [newUser]);
    setIsCloudSyncing(false);

    if (result.success) {
      setUsers(prev => [...prev, newUser as UserProfile]);
      alert("Usuário Nexus sincronizado com a Nuvem!");
    } else {
      alert(`Erro: ${result.message}`);
    }
  };

  const handleRemoveUser = async (id: string) => {
    if (id === 'owner-ws-root') return;
    if (confirm("Deseja revogar este acesso permanentemente?")) {
      setIsCloudSyncing(true);
      const { error } = await supabase.from('users').delete().eq('id', id);
      setIsCloudSyncing(false);
      
      if (!error) {
        setUsers(prev => prev.filter(u => u.id !== id));
      } else {
        alert("Erro ao remover: " + error.message);
      }
    }
  };

  // --- AÇÕES MASTER ADMIN (ORGS) ---
  const handleAddOrg = async (newOrgData: Partial<Organization>) => {
    const newOrg: Organization = {
      id: `WS-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      ...newOrgData,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
      metrics: { usersCount: 1, leadsCount: 0, revenueValue: 0 },
      branding: { primaryColor: '#C5A059', secondaryColor: '#020617', logoUrl: null },
      pipelineStages: INITIAL_ORGS[0].pipelineStages,
    } as Organization;

    const result = await syncEntity('organizations', [newOrg]);
    if (result.success) setOrganizations(prev => [...prev, newOrg]);
  };

  const handleUpdateStatus = async (id: string, status: 'ACTIVE' | 'SUSPENDED') => {
    const target = organizations.find(o => o.id === id);
    if (target) {
      const result = await syncEntity('organizations', [{ ...target, status }]);
      if (result.success) setOrganizations(prev => prev.map(o => o.id === id ? { ...o, status } : o));
    }
  };

  const handleUpdateSub = async (id: string, level: SubscriptionLevel) => {
    const target = organizations.find(o => o.id === id);
    if (target) {
      const result = await syncEntity('organizations', [{ ...target, subscription: level }]);
      if (result.success) setOrganizations(prev => prev.map(o => o.id === id ? { ...o, subscription: level } : o));
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCurrentUser(null);
    setActiveModule(ModuleType.DASHBOARD);
  };

  if (!isAuthenticated) return <AuthManager onLogin={handleLogin} isLoading={isAuthLoading} />;
  if (mustResetPassword) return <PasswordReset onComplete={() => setMustResetPassword(false)} />;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar 
        activeModule={activeModule} 
        setActiveModule={(m) => checkModuleAccess(m) && setActiveModule(m)} 
        userRole={currentUser!.role} 
        planType={org.subscription}
        isCloudSyncing={isCloudSyncing}
        connectionStatus={connectionStatus}
      />
      <main className="flex-1 ml-20 p-8 lg:p-12 overflow-y-auto relative bg-slate-950">
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
              onAddUser={handleAddUser}
              onRemoveUser={handleRemoveUser}
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
