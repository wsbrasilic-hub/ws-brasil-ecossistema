import React from 'react';
import { Shield, Key, Database, Bell, Save } from 'lucide-react';

const Settings = () => {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-yellow-500">
            <Key size={20} /> Motores de Inteligência
          </h3>
          <div className="space-y-4">
            <div>
              <label className="text-xs uppercase text-slate-500 font-bold">Google Gemini API Key</label>
              <input type="password" value="••••••••••••••••" className="w-full bg-slate-950 border border-slate-800 p-3 rounded-lg mt-1 text-sm text-slate-300" readOnly />
            </div>
            <button className="w-full bg-yellow-500 text-slate-950 font-bold py-3 rounded-lg hover:bg-yellow-400 transition flex items-center justify-center gap-2">
              <Save size={18} /> ATUALIZAR CHAVES
            </button>
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 p-6 rounded-2xl">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2 text-blue-400">
            <Database size={20} /> Banco de Dados WS
          </h3>
          <div className="p-4 bg-slate-950 rounded-lg border border-slate-800">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm">Status do Supabase</span>
              <span className="text-[10px] bg-green-500/20 text-green-500 px-2 py-0.5 rounded-full font-bold">ONLINE</span>
            </div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
              <div className="bg-green-500 h-full w-[85%]"></div>
            </div>
            <p className="text-[10px] text-slate-500 mt-2">85% da capacidade de armazenamento utilizada.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
