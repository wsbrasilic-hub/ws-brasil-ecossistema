
import React, { useState } from 'react';
import { UserRole } from '../types';

interface AuthManagerProps {
  onLogin: (email: string, pass: string) => void;
  isLoading: boolean;
}

const AuthManager: React.FC<AuthManagerProps> = ({ onLogin, isLoading }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const whatsappNumber = "5521992844353";
  const forgotPasswordMsg = encodeURIComponent("Olá, esqueci minha senha do Nexus AI e gostaria de recuperar meu acesso.");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    onLogin(email, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-slate-950 relative overflow-hidden font-sans">
      {/* Background Decorativo Executivo */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[50%] h-[50%] rounded-full blur-[140px] bg-amber-500/5"></div>
        <div className="absolute -bottom-[10%] -right-[10%] w-[50%] h-[50%] rounded-full blur-[140px] bg-slate-800/10"></div>
      </div>

      <div className="w-full max-w-md animate-fadeIn z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 bg-[#C5A059] rounded-2xl mx-auto flex items-center justify-center shadow-2xl shadow-amber-900/20 mb-6 group hover:rotate-3 transition-transform duration-500">
             <span className="text-3xl font-black text-slate-950 italic tracking-tighter">WS</span>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Nexus <span className="text-[#C5A059] font-light">Intelligence</span>
          </h1>
          <p className="text-slate-500 text-[9px] font-black uppercase tracking-[0.4em] mt-2">Strategic Operating System • WS Brasil I.C.</p>
        </div>

        <div className="bg-slate-900/80 border border-white/5 p-10 rounded-[3rem] shadow-2xl backdrop-blur-2xl relative overflow-hidden">
           <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#C5A059] to-transparent opacity-50"></div>
           
           <form onSubmit={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">E-mail Corporativo</label>
                 <div className="relative group">
                    <i className="fa-solid fa-envelope absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-colors"></i>
                    <input 
                      required 
                      type="email" 
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white font-medium outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800"
                      placeholder="diretoria@wsbrasil.com.br"
                    />
                 </div>
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] text-slate-500 font-black uppercase tracking-widest ml-4">Senha de Acesso</label>
                 <div className="relative group">
                    <i className="fa-solid fa-lock absolute left-5 top-1/2 -translate-y-1/2 text-slate-700 group-focus-within:text-amber-500 transition-colors"></i>
                    <input 
                      required 
                      type="password" 
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-2xl py-4 pl-14 pr-6 text-white font-medium outline-none focus:border-amber-500/50 transition-all placeholder:text-slate-800"
                      placeholder="••••••••"
                    />
                 </div>
              </div>

              <div className="flex justify-end px-2">
                 <button 
                   type="button"
                   onClick={() => window.open(`https://wa.me/${whatsappNumber}?text=${forgotPasswordMsg}`, '_blank')}
                   className="text-[10px] text-slate-500 font-bold uppercase tracking-widest hover:text-amber-500 transition-colors"
                 >
                   Esqueci minha senha
                 </button>
              </div>

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full py-5 bg-[#C5A059] text-slate-950 font-black text-[11px] uppercase tracking-[0.4em] rounded-2xl shadow-xl shadow-amber-900/20 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <i className="fa-solid fa-circle-notch animate-spin text-lg"></i>
                ) : (
                  <i className="fa-solid fa-unlock-keyhole"></i>
                )}
                {isLoading ? 'SINCRONIZANDO...' : 'INICIAR SESSÃO'}
              </button>
           </form>
        </div>

        <div className="mt-10 flex flex-col items-center gap-4">
           <div className="bg-slate-900/40 px-6 py-3 rounded-full border border-white/5 flex items-center gap-4">
              <i className="fa-solid fa-shield-halved text-emerald-500 text-sm"></i>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Conexão Criptografada SSL</span>
           </div>
           <p className="text-[8px] text-slate-700 font-black uppercase tracking-[0.5em]">WS BRASIL I.C. • TECNOLOGIA PARA LUCRO</p>
        </div>
      </div>
    </div>
  );
};

export default AuthManager;
