import React, { useState, useEffect } from 'react';
import { ModuleType, Organization, UserProfile, FinancialTransaction, Lead } from './types';

// Importação dos Componentes que já configuramos
import Dashboard from './components/Dashboard';
import SalesCRM from './components/SalesCRM';
import FinancialManager from './components/FinancialManager';

// Importação do Serviço Supabase
import { supabase, syncEntity } from './services/supabase';

const INITIAL_ORG: Organization = {
  id: 'ORG-WS-001',
  name: 'WS Brasil Inteligência Comercial',
  cnpj: '12.345.678/0001-90',
  subscription: 'GOLD', 
  maxUsers: 100,
  status: 'ACTIVE',
  createdAt: '2024-01-01',
  branding: { primaryColor: '#C5A059', secondaryColor: '#020617', logoUrl: null },
  metrics: { usersCount: 2, leadsCount: 450, revenueValue: 125000 },
  lgpdCompliance: { dataRetentionDays: 180, anonymizeOnDelete: true, dpoContact: 'dpo@wsbrasil.com' },
  pipelineStages: []
};

const MASTER_OWNER: UserProfile = { 
  id: 'owner-ws-root', 
  name: 'Diretoria WS Brasil', 
  email: 'diretoria@wsbrasil.com.br', 
  role: 'SUPER_ADMIN', 
  organizationId: 'ORG-WS-001', 
  isActive: true, 
  mfaEnabled: true 
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [finance, setFinance] = useState<FinancialTransaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // 1. Busca Dados ao Iniciar
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      const { data: finData } = await supabase.from('financial_transactions').select('*');
      if (finData) setFinance(finData);

      const { data: leadData } = await supabase.from('leads').select('*');
      if (leadData) setLeads(leadData);
    };
    fetchData();
  }, [isAuthenticated]);

  // 2. Funções de Gravação
  const handleAddTransaction = async (data: Partial<FinancialTransaction>) => {
    const newTx = { ...data, id: `TX-${Date.now()}`, organization_id: INITIAL_ORG.id };
    const result = await syncEntity('financial_transactions', [newTx]);
    if (result.success) setFinance(prev => [...prev, newTx as FinancialTransaction]);
  };

  const handleAddLead = async (leadData: Partial<Lead>) => {
    const newLead = { ...leadData, id: `LEAD-${Date.now()}`, organizationId: INITIAL_ORG.id, status: 'QUALIFICADO' };
    const result = await syncEntity('leads', [newLead]);
    if (result.success) setLeads(prev => [...prev, newLead as Lead]);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsAuthenticated(true);
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <form onSubmit={handleLogin} className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 w-full max-w-md text-center">
          <h2 className="text-white font-black text-2xl uppercase mb-6">Nexus Login</h2>
          <button type="submit" className="w-full bg-amber-600 py-4 rounded-2xl text-slate-950 font-black uppercase">Entrar no Sistema</button>
        </form>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white p-8">
      <nav className="flex gap-4 mb-10 overflow-x-auto pb-4">
        <button onClick={() => setActiveModule(ModuleType.DASHBOARD)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase ${activeModule === ModuleType.DASHBOARD ? 'bg-amber-600 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>Dashboard</button>
        <button onClick={() => setActiveModule(ModuleType.SALES)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase ${activeModule === ModuleType.SALES ? 'bg-amber-600 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>CRM Leads</button>
        <button onClick={() => setActiveModule(ModuleType.FINANCE)} className={`px-6 py-2 rounded-xl font-black text-[10px] uppercase ${activeModule === ModuleType.FINANCE ? 'bg-amber-600 text-slate-950' : 'bg-slate-900 text-slate-400'}`}>Financeiro</button>
      </nav>

      <main className="max-w-7xl mx-auto">
        {activeModule === ModuleType.DASHBOARD && <Dashboard transactions={finance} leads={leads} />}
        {activeModule === ModuleType.SALES && <SalesCRM leads={leads} onAddLead={handleAddLead} />}
        {activeModule === ModuleType.FINANCE && (
          <FinancialManager 
            transactions={finance} 
            onAddTransaction={handleAddTransaction} 
            onUpdateStatus={() => {}} 
          />
        )}
      </main>
    </div>
  );
};

export default App;
