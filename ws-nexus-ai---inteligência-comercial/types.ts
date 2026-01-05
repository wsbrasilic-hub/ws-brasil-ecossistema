
export enum ModuleType {
  DASHBOARD = 'DASHBOARD',
  MARKETING = 'MARKETING',
  SALES = 'SALES',
  DOCUMENTS = 'DOCUMENTS',
  ERP = 'ERP',
  INVENTORY = 'INVENTORY',
  RH = 'RH',
  SCHEDULING = 'SCHEDULING',
  SETTINGS = 'SETTINGS',
  MASTER_ADMIN = 'MASTER_ADMIN',
  FINANCE = 'FINANCE',
  SECURITY = 'SECURITY',
  PRICING = 'PRICING'
}

export type DiscProfile = 'EXECUTOR' | 'COMUNICADOR' | 'ANALISTA' | 'PLANEJADOR';
export type SubscriptionLevel = 'BRONZE' | 'SILVER' | 'GOLD';
export type UserRole = 'SUPER_ADMIN' | 'ADM' | 'GERENTE' | 'VENDEDOR' | 'RH' | 'FINANCEIRO' | 'MARKETING';

export type TransactionType = 'INCOME' | 'EXPENSE';
export type TransactionStatus = 'PENDING' | 'PAID' | 'OVERDUE';

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  action: string;
  entity: string;
  timestamp: string;
  ip: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
}

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  organizationId: string;
  avatar?: string;
  isActive: boolean;
  mfaEnabled: boolean;
  lastLogin?: string;
}

export interface Organization {
  id: string;
  name: string;
  cnpj: string;
  subscription: SubscriptionLevel;
  maxUsers: number;
  status: 'ACTIVE' | 'SUSPENDED' | 'TRIAL' | 'PAST_DUE';
  createdAt: string;
  lgpdCompliance: {
    dataRetentionDays: number;
    anonymizeOnDelete: boolean;
    dpoContact: string;
  };
  metrics?: {
    usersCount: number;
    leadsCount: number;
    revenueValue: number;
  };
  branding: {
    logoUrl?: string;
    primaryColor: string;
    secondaryColor: string;
  };
  customFieldDefinitions: CustomFieldDefinition[];
  pipelineStages: { id: string; title: string; color: string }[];
}

export interface FinancialTransaction {
  id: string;
  organizationId: string;
  type: TransactionType;
  amount: number;
  dueDate: string;
  paymentDate?: string;
  status: TransactionStatus;
  category: string;
  contactName?: string;
  description: string;
}

export interface CustomFieldDefinition {
  id: string;
  entity: 'LEAD' | 'EMPLOYEE' | 'PRODUCT';
  label: string;
  type: 'TEXT' | 'NUMBER' | 'DATE' | 'SELECT';
  options?: string[];
}

export interface Employee {
  id: string;
  organizationId: string;
  name: string;
  role: string;
  department: string;
  salary: number;
  hiringDate: string;
  profile: DiscProfile;
  performanceScore: number;
  potentialScore: number;
  status: 'ATIVO' | 'DESLIGADO';
  customAttributes: Record<string, any>;
}

export interface ProductItem {
  id: string;
  organizationId: string;
  name: string;
  category: string;
  group: string;
  cost: number;
  markup: number;
  price: number;
  stock: number | '∞';
  status: 'ATIVO' | 'BAIXO' | 'INDISPONÍVEL';
  customAttributes: Record<string, any>;
}

export type LeadTemperature = 'FOGO' | 'AQUECIDO' | 'FRIO';

export interface Lead {
  id: string;
  organizationId: string;
  company: string;
  cnpj?: string;
  contact: string;
  email: string;
  phone: string;
  address?: {
    street: string;
    city: string;
    zip: string;
  };
  value: number;
  productId?: string;
  productName?: string;
  observations?: string;
  status: string;
  probability: number;
  lastContact: string;
  score: number;
  temperature: LeadTemperature;
  aiTag?: string;
  tasks: Array<{id: string, text: string, done: boolean}>;
  reminders: Array<{id: string, date: string, title: string}>;
  customAttributes: Record<string, any>;
}

export interface Appointment {
  id: string;
  organizationId: string;
  clientName: string;
  clientWhatsApp: string;
  dateTime: string;
  duration: number;
  status: 'CONFIRMADO' | 'PENDENTE' | 'CONCLUIDO';
  link: string;
}
