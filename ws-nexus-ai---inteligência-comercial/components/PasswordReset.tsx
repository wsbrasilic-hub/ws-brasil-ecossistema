
import React, { useState } from 'react';

interface PasswordResetProps {
  onComplete: () => void;
}

const PasswordReset: React.FC<PasswordResetProps> = ({ onComplete }) => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword.length < 8) {
      setError('A chave deve conter no mínimo 8 caracteres para segurança nível Nexus.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setError('A confirmação da chave não coincide com a entrada inicial.');
      return;
    }

    setIsLoading(true);
    // Simula salvamento criptográfico
    await new Promise(resolve => setTimeout(resolve, 2000));
    setIsLoading(false);
    onComplete();
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-[#121212] relative overflow-hidden font-sans">
      {/* Background Amber Alert */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute top-[20%] left-[20%] w-[60%] h-[60%] rounded-full blur-[160px] bg-amber-600/10"></div>
      </div>

      <div className="w-full max-w-lg animate-fadeIn z-10">
        <div className="text-center mb-10">
          <div className="w-20 h-20 rounded-[1.5rem] bg-amber-600 mx-auto flex items-center justify-center shadow-2xl shadow-amber-900/40 mb-8 border border-amber-500/50">
             <i className="fa-solid fa-shield-halved text-white text-3xl"></i>
          </div>
          <h1 className="text-3xl font-black text-white uppercase tracking-tighter">
            Protocolo de <span className="text-amber-500">Primeiro Contato</span>
          </h1>
          <p className="text-zinc-500 text-[10px] font-black uppercase tracking-[0.4em] mt-3">Calibração de Segurança Nexus AI v2026</p>
        </div>

        <div className="bg-zinc-900/60 border border-amber-500/20 p-12 rounded-[3.5rem] shadow-2xl backdrop-blur-2xl relative">
           <div className="absolute -top-1 -left-1 -right-1 h-1 rounded-t-full bg-amber-500"></div>
           
           <div className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl">
              <p className="text-[10px] text-amber-500 font-black uppercase tracking-widest text-center">
                Ação Necessária: Substitua a credencial de fábrica para ativar a blindagem operacional.
              </p>
           </div>

           <form onSubmit={handleReset} className="space-y-6">
              <div className="space-y-2">
                 <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-5">Nova Chave de Comando</label>
                 <input 
                    required 
                    type="password" 
                    value={newPassword}
                    onChange={e => setNewPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-3xl py-5 px-8 text-white font-medium outline-none transition-all focus:border-amber-500"
                    placeholder="••••••••"
                 />
              </div>

              <div className="space-y-2">
                 <label className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-5">Confirmar Chave</label>
                 <input 
                    required 
                    type="password" 
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    className="w-full bg-[#0a0a0a] border border-zinc-800 rounded-3xl py-5 px-8 text-white font-medium outline-none transition-all focus:border-amber-500"
                    placeholder="••••••••"
                 />
              </div>

              {error && (
                <p className="text-rose-500 text-[10px] font-bold uppercase text-center">{error}</p>
              )}

              <button 
                disabled={isLoading}
                type="submit" 
                className="w-full py-6 bg-amber-600 text-white font-black text-[11px] uppercase tracking-[0.4em] rounded-3xl shadow-2xl shadow-amber-900/40 transition-all hover:scale-[1.02] flex items-center justify-center gap-4 disabled:opacity-50"
              >
                {isLoading ? (
                  <i className="fa-solid fa-circle-notch animate-spin text-xl"></i>
                ) : (
                  <i className="fa-solid fa-key"></i>
                )}
                {isLoading ? 'CRIPTOGRAFANDO...' : 'ATIVAR INSTÂNCIA NEXUS'}
              </button>
           </form>
        </div>

        <p className="mt-8 text-center text-[9px] text-zinc-800 font-black uppercase tracking-[0.4em]">
          WS BRASIL I.C. • CRYPTO-PROTOCOL ENFORCED
        </p>
      </div>
    </div>
  );
};

export default PasswordReset;
