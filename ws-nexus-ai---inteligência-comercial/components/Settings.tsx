import React from 'react';
import { Shield, Key, Database, Bell } from 'lucide-react';

const Settings = () => {
  return (
    <div className="p-6 text-white bg-slate-900 rounded-lg border border-slate-700">
      <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
        <Shield className="text-yellow-500" /> Configurações de Governança - WS Brasil
      </h2>
      
      <div className="grid gap-6">
        <div className="p-4 bg-slate-800 rounded border border-slate-600">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><Key size={18} /> Chaves de API (Nexus Brain)</h3>
          <p className="text-sm text-slate-400 mb-2">Configure o motor de IA que alimenta o CRM e Marketing.</p>
          <input type="password" placeholder="Google Gemini Key" className="w-full bg-slate-900 p-2 rounded border border-slate-600 text-xs" />
        </div>

        <div className="p-4 bg-slate-800 rounded border border-slate-600">
          <h3 className="flex items-center gap-2 font-semibold mb-3"><Database size={18} /> Integração Supabase</h3>
          <p className="text-sm text-slate-400">Status do Banco de Dados: <span className="text-green-500">CONECTADO</span></p>
        </div>
      </div>
    </div>
  );
};

export default Settings;
