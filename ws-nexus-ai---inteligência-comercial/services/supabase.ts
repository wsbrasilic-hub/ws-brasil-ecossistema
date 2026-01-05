
import { createClient } from '@supabase/supabase-js';

// Infraestrutura Cloud WS Brasil I.C.
const supabaseUrl = 'https://lpjrdovnjpkmbqjimohd.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxwanJkb3ZuanBrbWJxamltb2hkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjczMzQ5MzYsImV4cCI6MjA4MjkxMDkzNn0.FyIuEqw8uXFy8j81aisPtqyy7VH1ItRmj8BdyzDid2Q';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

/**
 * Definição estrita de colunas baseada no Schema CamelCase do Banco de Dados.
 * Colunas minimizadas para evitar PGRST204 (Column not found) caso o schema não esteja 100% idêntico.
 */
const ALLOWED_COLUMNS: Record<string, string[]> = {
  // Nota: 'name' do frontend é mapeado para 'fullName' no DB
  users: ['id', 'fullName', 'email', 'role', 'organizationId', 'isActive'],
  items: ['id', 'organizationId', 'name', 'category', 'group', 'cost', 'markup', 'price', 'stock', 'status'],
  finance: ['id', 'organizationId', 'type', 'amount', 'dueDate', 'paymentDate', 'status', 'category', 'description'],
  leads: ['id', 'organizationId', 'company', 'cnpj', 'contact', 'email', 'phone', 'value', 'status', 'probability', 'score', 'temperature']
};

/**
 * Sincronizador Atômico de Entidades (WS Brasil Nexus Engine)
 */
export const syncEntity = async (table: string, data: any[]) => {
  if (data.length === 0) return { success: true };
  
  try {
    const columns = ALLOWED_COLUMNS[table];
    
    // Higienização e Mapeamento CamelCase
    const cleanData = data.map(item => {
      const obj: any = {};
      
      // Mapeamento explícito para a tabela users
      if (table === 'users') {
        const fullName = item.fullName || item.name || '';
        if (fullName) obj["fullName"] = fullName;
        if (item.id) obj["id"] = item.id;
        if (item.email) obj["email"] = item.email;
        if (item.role) obj["role"] = item.role;
        if (item.organizationId) obj["organizationId"] = item.organizationId;
        if (item.isActive !== undefined) obj["isActive"] = item.isActive;
        return obj;
      }

      // Mapeamento genérico para outras tabelas
      if (columns) {
        columns.forEach(col => {
          if (item[col] !== undefined) {
            obj[col] = item[col];
          }
        });
      }
      return obj;
    });

    const { error } = await supabase.from(table).upsert(cleanData, { onConflict: 'id' });
    
    if (error) {
      if (error.code === 'PGRST204') {
        console.warn(`[Nexus Schema] Mismatch detectado em '${table}'. Verifique se as colunas CamelCase existem.`);
        return { 
          success: false, 
          error: 'SCHEMA_MISMATCH', 
          message: `Erro de Schema: Coluna inexistente em '${table}'.` 
        };
      }
      if (error.code === '42501') {
        console.warn(`[Nexus RLS] Permissão negada em '${table}'.`);
        return { 
          success: false, 
          error: 'RLS_VIOLATION', 
          message: `Segurança: RLS bloqueou a gravação em '${table}'.` 
        };
      }
      return { success: false, error: error.code, message: error.message };
    }
    return { success: true };
  } catch (err) {
    return { success: false, error: 'FATAL', message: String(err) };
  }
};
