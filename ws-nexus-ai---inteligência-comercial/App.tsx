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
import NexusChat from './components/NexusChat';
import NexusVoice from './components/NexusVoice';
import SettingsManager from './components/SettingsManager'; 
import MasterAdmin from './components/MasterAdmin';

// Importação do Sincronizador WS Brasil Nexus
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
  const [isReadyForAI, setIsReadyForAI] = useState(false);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(null);
  const [activeModule, setActiveModule] = useState<ModuleType>(ModuleType.DASHBOARD);
  
  const [organizations, setOrganizations] = useState<Organization[]>(() => {
    const saved = localStorage.getItem('@WSBrasil:orgs');
    return saved ? JSON.parse(saved) : INITIAL_ORGS;
  });

  const [org, setOrg] = useState<Organization>(organizations[0]);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [finance, setFinance] = useState<FinancialTransaction[]>([]);
  const [users, setUsers] = useState<UserProfile[]>([MASTER_OWNER]);

  // --- BUSCA INICIAL NO SUPABASE (ORGS) ---
  useEffect(() => {
    const fetchOrgs = async () => {
      const { data, error } = await supabase.from('organizations').select('*');
      if (!error && data && data.length > 0) {
        const mappedOrgs = data.map(o => ({
          ...o,
          branding: typeof o.branding === 'string' ? JSON.parse(o.branding) : o.branding || INITIAL_ORGS[0].branding,
          pipelineStages: INITIAL_ORGS[0].pipelineStages
        }));
        setOrganizations(mappedOrgs);
      }
    };
    fetchOrgs();
  }, []);

  // --- BUSCA DE USUÁRIOS DO BANCO ---
  useEffect(() => {
    const fetchUsers = async () => {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('organizationId', org.id);
      
      if (!error && data) {
        // Mapeia fullName do banco de volta para name do frontend se necessário
        const mappedUsers = data.map(u => ({
          ...u,
          name: u.fullName || u.name
        }));
        setUsers(mappedUsers.length > 0 ? mappedUsers : [MASTER_OWNER]);
      }
    };
    if (isAuthenticated) fetchUsers();
  }, [org.id, isAuthenticated]);

  useEffect(() => {
    localStorage.setItem('@WSBrasil:orgs', JSON.stringify(organizations));
  }, [organizations]);

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
    
    if (normalizedEmail === 'diretoria@wsbrasil.com.br' && pass === 'wsbrasil123') {
      setCurrentUser(MASTER_OWNER);
      setOrg(organizations[0]);
      setIsAuthenticated(true);
      return;
    }

    setIsAuthLoading(true);
    await new Promise(resolve => setTimeout(resolve, 800));

    if (normalizedEmail === 'admin' && pass === 'admin2026') {
      setCurrentUser({ id: 'u1', name: 'Admin', email: 'admin', role: 'ADM', organizationId: 'ORG-WS-001', isActive: true, mfaEnabled: false });
      setIsAuthenticated(true);
    } else {
      alert("Nexus: Credenciais Inválidas.");
    }
    setIsAuthLoading(false);
  }, [organizations]);

  // --- FUNÇÃO ADICIONAR USUÁRIO (NEXUS SYNC) ---
  const handleAddUser = async (userData: Partial<UserProfile>) => {
    const newUser = {
      ...userData,
      id: `USR-${Math.random().toString(36).substr(2, 5).toUpperCase()}`,
      organizationId: org.id,
      isActive: true,
    };

    const result = await syncEntity('users', [newUser]);

    if (result.success) {
      setUsers(prev => [...prev, newUser as UserProfile]);
      alert("Usuário Nexus cadastrado e sincronizado com a Nuvem!");
    } else {
      alert(`Erro ao sincronizar usuário: ${result.message}`);
    }
  };

  // --- FUNÇÕES MASTER ADMIN ---
  const handleAddOrg = async (newOrgData: Partial<Organization>) => {
    const newOrg: Organization = {
      id: `WS-${Math.random().toString(36).substr(2, 4).toUpperCase()}-${Math.floor(Math.random() * 1000)}`,
      name: newOrgData.name || 'Nova Empresa Cliente',
      cnpj: newOrgData.cnpj || '00.000.000/0001-00',
      subscription: newOrgData.subscription || 'BRONZE',
      status: 'ACTIVE',
      maxUsers: newOrgData.subscription === 'GOLD' ? 100 : newOrgData.subscription === 'SILVER' ? 50 : 10,
      createdAt: new Date().toISOString().split('T')[0],
      metrics: { usersCount: 1, leadsCount: 0, revenueValue: 0 },
      branding: { primaryColor: '#C
