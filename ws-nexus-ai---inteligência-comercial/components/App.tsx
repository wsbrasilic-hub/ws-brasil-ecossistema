import React, { useState, useEffect } from 'react';
import { ModuleType, ProductItem, Organization, UserProfile, SubscriptionLevel, FinancialTransaction, TransactionStatus, Lead } from './types';
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

  const [organizations, setOrganizations] = useState<Organization[]>(INITIAL_ORGS);
  const [org, setOrg] = useState<Organization>(INITIAL_ORGS[0]);
  const [users, setUsers] = useState<UserProfile[]>([MASTER_OWNER]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [finance, setFinance] = useState<FinancialTransaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Carregamento Inicial
  useEffect(() => {
    const bootstrapNexus = async () => {
      setConnectionStatus('SYNCING');
      const { data, error } = await supabase.from('organizations').select('*');
      if (!error && data && data.length > 0) {
        setOrganizations(data.map(o => ({...o, branding: typeof o.branding === 'string' ? JSON.parse(o.branding) : o.branding, pipelineStages: INITIAL_ORGS[0].pipelineStages})));
        setConnectionStatus('CONNECTED');
      }
    };
    bootstrapNexus();
  }, []);

  // Busca dados da Org (Financeiro, Leads, Usuários)
  useEffect(() => {
    const fetchOrgData = async () => {
      if (!isAuthenticated) return;
      setIsCloudSyncing(true);
      const { data: fin } = await supabase.from('financial_transactions').select('*').eq('organization_id', org.id);
      if (fin) setFinance(fin as FinancialTransaction[]);
      const { data: ld } = await supabase.from('leads').select('*').eq('organizationId', org.id);
      if (ld) setLeads(ld as Lead[]);
      const { data: usrs } = await supabase.from('users').select('*').eq('organizationId', org.id);
      if (usrs) setUsers(usrs.map(u => ({ ...u, name: u.fullName || u.name })));
      setIsCloudSyncing(false);
    };
    fetchOrgData();
  }, [org.id, isAuthenticated]);

  const handleLogin = async (email: string, pass: string) => {
    setIsAuthLoading(true);
    if (email.toLowerCase() === 'diretoria@wsbrasil.com.br' && pass === 'wsbrasil123') {
      setCurrentUser(MASTER_OWNER);
      setOrg(organizations[0]);
      setIsAuthenticated(true);
    } else {
      const { data: dbUser } = await supabase.from('users').select('*').eq('email', email.toLowerCase()).single();
      if (dbUser && pass === 'admin2026') {
        setCurrentUser({ ...dbUser, name: dbUser.fullName || dbUser.name });
        setOrg(organizations.find(o => o.id === dbUser.organizationId) || INITIAL_ORGS[0]);
        setIsAuthenticated(true);
      } else { alert("Acesso Negado."); }
    }
    setIsAuthLoading(false);
  };

  const handleAddTransaction = async (data: Partial<FinancialTransaction>) => {
    const newTx = { ...data, id: `TX-${Date.now()}`, organization_id: org.id };
    const result = await syncEntity('financial_transactions', [newTx]);
    if (result.success) setFinance(prev => [...prev, newTx as FinancialTransaction]);
  };

  const handleAddLead = async (leadData: Partial<Lead>) => {
    const newLead = { ...leadData, id: `LEAD-${Date.now()}`, organizationId: org.id, status: 'QUALIFICADO' };
    const result = await syncEntity('leads', [newLead]);
    if (result.success) setLeads(prev => [...prev, newLead as Lead]);
  };

  if (!isAuthenticated) return <AuthManager onLogin={handleLogin} isLoading={isAuthLoading} />;

  return (
    <div className="flex min-h-screen bg-slate-950">
      <Sidebar activeModule={activeModule} setActiveModule={setActiveModule} userRole={currentUser!.role} planType={org.subscription} isCloudSyncing={isCloudSyncing} connectionStatus={connectionStatus} />
      <main className="flex-1 ml-20 p-8 lg:p-12 overflow-y-auto bg-slate-950 text-white">
        <header className="flex justify-between items-center mb-12">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center font-black text-slate-950">{org.name[0]}</div>
            <div>
              <h1 className="font-black uppercase tracking-tighter">{org.name}</h1>
              <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Nexus Intelligence System</p>
            </div>
          </div>
          <button onClick={() => setIsAuthenticated(false)} className="text-rose-500 text-[10px] font-black uppercase tracking-widest border border-rose-500/20 px-4 py-2 rounded-xl hover:bg-rose-500/10 transition-all">Sair</button>
        </header>

        <section className="max-w-7xl mx-auto">
          {activeModule === ModuleType.DASHBOARD && <Dashboard transactions={finance} leads={leads} />}
          {activeModule === ModuleType.SALES && <SalesCRM leads={leads} onAddLead={handleAddLead} />}
          {activeModule === ModuleType.FINANCE && <FinancialManager transactions={finance} onAddTransaction={handleAddTransaction} onUpdateStatus={() => {}} />}
          {activeModule === ModuleType.MARKETING && <MarketingAI />}
          {activeModule === ModuleType.RH && <RHManager />}
          {activeModule === ModuleType.INVENTORY && <InventoryManager items={items} setItems={setItems} />}
          {activeModule === ModuleType.SCHEDULING && <SchedulingManager />}
          {activeModule === ModuleType.DOCUMENTS && <NexusDocs />}
          {activeModule === ModuleType.PRICING && <PricingPage />}
          {activeModule === ModuleType.SETTINGS && <SettingsManager org={org} onUpdateOrg={setOrg} users={users} onAddUser={() => {}} onRemoveUser={() => {}} auditLogs={[]} userLimit={org.maxUsers} />}
        </section>
      </main>
      <NexusChat />
      <NexusVoice />
    </div>
  );
};

export default App;
