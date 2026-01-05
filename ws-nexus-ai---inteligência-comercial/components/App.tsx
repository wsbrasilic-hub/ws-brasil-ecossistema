import React, { useState, useEffect } from 'react';
import { ModuleType, Organization, UserProfile, FinancialTransaction, Lead } from './types';

// Componentes Core
import Dashboard from './components/Dashboard';
import SalesCRM from './components/SalesCRM';
import FinancialManager from './components/FinancialManager';

// Serviço de Banco de Dados
import { supabase, syncEntity } from './services/supabase';

const INITIAL_ORG: Organization = {
  id: 'ORG-WS-001',
  name: 'WS Brasil Inteligência Comercial',
  cnpj: '12.345.678/0001-90',
  subscription: 'GOLD', 
  maxUsers: 100,
  status: 'ACTIVE',
  createdAt: new Date().toISOString().split('T')[0],
  metrics: { usersCount: 1, leadsCount: 0, revenueValue: 0 },
  branding: { primaryColor: '#C5A059', secondaryColor: '#020617', logoUrl: null },
  lgpdCompliance: { dataRetentionDays: 180, anonymizeOnDelete: true, dpoContact: 'dpo@wsbrasil.com' },
  pipelineStages: []
};

const App: React.FC = () => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  const [finance, setFinance] = useState<FinancialTransaction[]>([]);
  const [leads, setLeads] = useState<Lead[]>([]);

  // Carregar dados do Supabase ao logar
  useEffect(() => {
    const fetchData = async () => {
      if (!isAuthenticated) return;
      
      const { data: finData } = await supabase.from('financial_transactions').select('*');
      if (finData) setFinance(finData as FinancialTransaction[]);

      const { data: leadData } = await supabase.from('leads').select('*');
      if (leadData) setLeads(leadData as Lead[]);
    };
    fetchData();
  }, [isAuthenticated]);

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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
        <div className="bg-slate-900 p-10 rounded-[3rem] border border-slate-800 w-full max-w-md text-center shadow-2xl">
          <div className="w-20 h-20 bg-amber-600 rounded-2xl mx-auto mb-6 flex items-center justify-center text-3xl font-black text-slate-950">WS</div>
          <h2 className="text-white font-black text-2xl uppercase tracking-tighter mb-2">Nexus Intelligence</h2>
          <p className="text-slate-500 text-[10px] font-bold uppercase tracking-[0.3em] mb-8">WS Brasil Comercial</p>
          <button 
            onClick={() => setIsAuthenticated(true)} 
            className="w-full bg-amber-600 hover:bg-amber-500 py-4 rounded-2xl text-slate-950 font-black uppercase transition-all"
          >
            Acessar Ecossistema
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col">
      <header className="p-8 border-b border-slate-900 flex justify-between items-center">
        <div className="flex items-center gap-4">
          <div className="text-amber-500 font-black tracking-tighter">WS NEXUS</div>
          <nav className="hidden md:flex gap-2">
            <button onClick={() => setActiveModule(ModuleType.DASHBOARD)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeModule === ModuleType.DASHBOARD ? 'bg-amber-600 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Dashboard</button>
            <button onClick={() => setActiveModule(ModuleType.SALES)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeModule === ModuleType.SALES ? 'bg-amber-600 text-slate-950' : 'text-slate-500 hover:text-white'}`}>CRM Leads</button>
            <button onClick={() => setActiveModule(ModuleType.FINANCE)} className={`px-4 py-2 rounded-lg text-[10px] font-black uppercase transition-all ${activeModule === ModuleType.FINANCE ? 'bg-amber-600 text-slate-950' : 'text-slate-500 hover:text-white'}`}>Financeiro</button>
          </nav>
        </div>
        <button onClick={() => setIsAuthenticated(false)} className="text-[10px] font-black uppercase text-slate-500 hover:text-rose-500 transition-colors">Sair</button>
      </header>

      <main className="flex-1 p-8 lg:p-12 max-w-7xl mx-auto w-full">
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
