
import React, { useState, useMemo } from 'react';
import { Appointment } from '../types';
import { generateSchedulingCopy } from '../services/geminiService';

const SchedulingManager: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    { id: '1', organizationId: 'ORG-WS-001', clientName: 'Roberto Almeida', clientWhatsApp: '5511988887777', dateTime: '2025-03-15T14:00', duration: 45, status: 'CONFIRMADO', link: 'https://meet.google.com/ws-brasil-demo' },
    { id: '2', organizationId: 'ORG-WS-001', clientName: 'Empresa Alpha Tech', clientWhatsApp: '5511999990000', dateTime: '2025-03-16T10:30', duration: 30, status: 'PENDENTE', link: 'https://zoom.us/j/nexus-ai' },
    { id: '3', organizationId: 'ORG-WS-001', clientName: 'Indústrias Matos', clientWhatsApp: '5521977776666', dateTime: '2025-03-15T16:00', duration: 60, status: 'CONFIRMADO', link: 'https://meet.google.com/ind-matos' },
  ]);
  
  const [viewMode, setViewMode] = useState<'CALENDAR' | 'LIST'>('CALENDAR');
  const [currentDate, setCurrentDate] = useState(new Date(2025, 2, 1)); // Março 2025
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // Form State para o Novo Agendamento (Padrão Google)
  const [formData, setFormData] = useState({
    title: '',
    clientName: '',
    clientWhatsApp: '',
    date: '',
    time: '',
    duration: 45,
    description: '',
    link: 'https://meet.google.com/ws-' + Math.random().toString(36).substring(7)
  });

  // Utilitários de Calendário
  const daysInMonth = (month: number, year: number) => new Date(year, month + 1, 0).getDate();
  const firstDayOfMonth = (month: number, year: number) => new Date(year, month, 1).getDay();

  const calendarDays = useMemo(() => {
    const month = currentDate.getMonth();
    const year = currentDate.getFullYear();
    const totalDays = daysInMonth(month, year);
    const startingDay = firstDayOfMonth(month, year);
    const days = [];

    for (let i = 0; i < startingDay; i++) {
      days.push({ day: null, fullDate: null });
    }

    for (let d = 1; d <= totalDays; d++) {
      const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      days.push({ day: d, fullDate: dateStr });
    }

    return days;
  }, [currentDate]);

  const handleDayClick = (dateStr: string | null) => {
    if (!dateStr) return;
    setFormData(prev => ({ ...prev, date: dateStr, time: '14:00' }));
    setShowCreateModal(true);
  };

  const handleSaveAppointment = () => {
    if (!formData.clientName || !formData.date || !formData.time) {
      alert("Preencha os campos essenciais para o Nexus Brain.");
      return;
    }
    setIsProcessing(true);
    
    // Simulação de Sincronização com o Ecossistema
    setTimeout(() => {
      // Fix: Added organizationId
      const newApp: Appointment = {
        id: Math.random().toString(36).substring(7),
        organizationId: 'ORG-WS-001',
        clientName: formData.clientName,
        clientWhatsApp: formData.clientWhatsApp,
        dateTime: `${formData.date}T${formData.time}`,
        duration: formData.duration,
        status: 'PENDENTE',
        link: formData.link
      };

      setAppointments(prev => [...prev, newApp]);
      setIsProcessing(false);
      setShowCreateModal(false);
      // Reset form
      setFormData({
        title: '', clientName: '', clientWhatsApp: '', date: '', time: '',
        duration: 45, description: '', link: 'https://meet.google.com/ws-' + Math.random().toString(36).substring(7)
      });
    }, 1200);
  };

  const changeMonth = (offset: number) => {
    const nextDate = new Date(currentDate);
    nextDate.setMonth(currentDate.getMonth() + offset);
    setCurrentDate(nextDate);
  };

  const getAppsForDay = (dateStr: string) => {
    return appointments.filter(a => a.dateTime.startsWith(dateStr));
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      {/* HEADER DE COMANDO */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 border border-indigo-500/20 p-8 rounded-[3rem] shadow-2xl">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter flex items-center gap-3">
             <i className="fa-solid fa-calendar-check text-indigo-500"></i> Nexus Chronos
          </h2>
          <p className="text-indigo-400 font-bold text-[10px] uppercase tracking-widest mt-1">WS Brasil I.C. • Gestão de Tempo e ROI Operacional</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <div className="flex bg-gray-800 p-1.5 rounded-2xl border border-gray-700">
             <button onClick={() => setViewMode('CALENDAR')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'CALENDAR' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Calendário</button>
             <button onClick={() => setViewMode('LIST')} className={`px-6 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all ${viewMode === 'LIST' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}>Lista</button>
          </div>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-8 py-3.5 rounded-2xl shadow-xl shadow-emerald-900/20 transition-all uppercase text-[10px] tracking-widest flex items-center gap-3"
          >
            <i className="fa-solid fa-plus text-sm"></i> Novo Agendamento
          </button>
        </div>
      </div>

      {viewMode === 'CALENDAR' ? (
        <div className="bg-gray-900/40 rounded-[3.5rem] border border-gray-800 p-10 shadow-2xl flex flex-col gap-10">
           {/* NAV CALENDARIO */}
           <div className="flex justify-between items-center">
              <div className="flex items-center gap-8">
                 <div className="flex gap-2">
                    <button onClick={() => changeMonth(-1)} className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all border border-gray-700 hover:border-indigo-500/50"><i className="fa-solid fa-chevron-left"></i></button>
                    <button onClick={() => changeMonth(1)} className="w-12 h-12 bg-gray-800 rounded-xl flex items-center justify-center text-gray-500 hover:text-white transition-all border border-gray-700 hover:border-indigo-500/50"><i className="fa-solid fa-chevron-right"></i></button>
                 </div>
                 <h3 className="text-3xl font-black text-white uppercase tracking-tighter">
                   {currentDate.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                 </h3>
                 <button onClick={() => setCurrentDate(new Date(2025, 2, 1))} className="px-5 py-2 bg-gray-800 border border-gray-700 rounded-xl text-[10px] font-black text-gray-400 uppercase hover:text-white transition-all">Hoje</button>
              </div>
              <div className="hidden md:flex gap-6">
                 <div className="flex items-center gap-2 text-[9px] text-gray-500 font-black uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></span> Confirmado
                 </div>
                 <div className="flex items-center gap-2 text-[9px] text-gray-500 font-black uppercase tracking-widest">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.5)]"></span> Pendente
                 </div>
              </div>
           </div>

           {/* GRID CALENDARIO */}
           <div className="grid grid-cols-7 gap-px bg-gray-800 border border-gray-800 rounded-[2rem] overflow-hidden">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="bg-gray-900/80 text-center text-[10px] font-black text-gray-600 uppercase tracking-widest py-6">{day}</div>
              ))}
              {calendarDays.map((dateObj, idx) => (
                <div 
                  key={idx} 
                  onClick={() => handleDayClick(dateObj.fullDate)}
                  className={`min-h-[160px] bg-gray-950/40 p-4 transition-all relative group cursor-pointer ${dateObj.day ? 'hover:bg-indigo-500/5' : 'opacity-10 pointer-events-none'}`}
                >
                   {dateObj.day && (
                     <>
                        <span className={`text-sm font-black ${dateObj.day === new Date().getDate() && currentDate.getMonth() === new Date().getMonth() ? 'text-indigo-400' : 'text-gray-500 group-hover:text-gray-300'}`}>
                           {dateObj.day}
                        </span>
                        
                        <div className="mt-4 space-y-2 max-h-[110px] overflow-y-auto custom-scrollbar">
                           {getAppsForDay(dateObj.fullDate!).map(app => (
                             <div 
                               key={app.id} 
                               className={`p-2 rounded-xl text-[9px] font-black uppercase truncate border shadow-sm transition-transform hover:scale-[1.02] ${
                                 app.status === 'CONFIRMADO' 
                                   ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                   : 'bg-amber-500/10 text-amber-500 border-amber-500/20'
                               }`}
                             >
                               {app.dateTime.split('T')[1]} • {app.clientName}
                             </div>
                           ))}
                        </div>

                        <div className="absolute inset-0 border-2 border-transparent group-hover:border-indigo-500/20 rounded-none pointer-events-none"></div>
                        <i className="fa-solid fa-plus absolute bottom-4 right-4 text-indigo-500/0 group-hover:text-indigo-500/40 transition-all"></i>
                     </>
                   )}
                </div>
              ))}
           </div>
        </div>
      ) : (
        /* LIST VIEW */
        <div className="bg-gray-950/50 rounded-[3.5rem] border border-gray-800 overflow-hidden shadow-2xl">
           <table className="w-full text-left border-collapse">
              <thead className="bg-gray-900/80 text-[10px] text-gray-500 font-black uppercase tracking-widest border-b border-gray-800">
                <tr>
                   <th className="p-8">Agenda</th>
                   <th className="p-8">Executivo / Cliente</th>
                   <th className="p-8">Tempo</th>
                   <th className="p-8">Nexus Status</th>
                   <th className="p-8">Conexão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {appointments.map(app => (
                  <tr key={app.id} className="hover:bg-white/5 transition-all group">
                    <td className="p-8">
                       <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-indigo-600/10 flex flex-col items-center justify-center border border-indigo-500/20">
                             <span className="text-[10px] font-black text-indigo-400">{new Date(app.dateTime).toLocaleDateString('pt-BR', {day: '2-digit'})}</span>
                             <span className="text-[8px] font-bold text-gray-500 uppercase">{new Date(app.dateTime).toLocaleDateString('pt-BR', {month: 'short'})}</span>
                          </div>
                          <div>
                             <p className="text-white font-black text-lg">{new Date(app.dateTime).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                             <p className="text-[10px] text-gray-500 font-bold uppercase">Início do Slot</p>
                          </div>
                       </div>
                    </td>
                    <td className="p-8">
                       <p className="text-white font-bold">{app.clientName}</p>
                       <p className="text-xs text-indigo-500/60 font-medium">{app.clientWhatsApp}</p>
                    </td>
                    <td className="p-8 font-mono text-gray-400 text-sm">{app.duration} min</td>
                    <td className="p-8">
                       <span className={`px-4 py-1.5 rounded-xl text-[9px] font-black border uppercase tracking-widest ${app.status === 'CONFIRMADO' ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)]' : 'bg-amber-500/10 text-amber-500 border-amber-500/30'}`}>{app.status}</span>
                    </td>
                    <td className="p-8">
                       <a href={app.link} target="_blank" rel="noreferrer" className="w-10 h-10 bg-gray-900 border border-gray-800 rounded-xl flex items-center justify-center text-gray-600 hover:text-indigo-400 hover:border-indigo-500 transition-all">
                          <i className="fa-solid fa-video"></i>
                       </a>
                    </td>
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
      )}

      {/* COCKPIT DE AGENDAMENTO (GOOGLE STYLE) */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1500] flex items-center justify-center p-6 animate-fadeIn">
           <div className="bg-gray-900 border border-indigo-500/30 rounded-[3.5rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
              {/* MODAL HEADER */}
              <div className="p-10 bg-indigo-600/10 border-b border-gray-800 flex justify-between items-center">
                 <div>
                    <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Cockpit Chronos</h3>
                    <p className="text-[9px] text-indigo-500 font-black uppercase tracking-widest mt-1">Configuração de Reunião Estratégica</p>
                 </div>
                 <button onClick={() => setShowCreateModal(false)} className="text-gray-500 hover:text-white transition-transform hover:rotate-90">
                    <i className="fa-solid fa-xmark text-4xl"></i>
                 </button>
              </div>

              {/* MODAL BODY */}
              <div className="p-12 space-y-8">
                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Objetivo da Reunião</label>
                    <input 
                      type="text" 
                      placeholder="Ex: Alinhamento de ROI - Projeto WS"
                      value={formData.title}
                      onChange={e => setFormData({...formData, title: e.target.value})}
                      className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white outline-none focus:border-indigo-500 text-lg font-bold"
                    />
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Cliente / Empresa</label>
                       <input 
                         type="text" 
                         value={formData.clientName}
                         onChange={e => setFormData({...formData, clientName: e.target.value})}
                         placeholder="Nome do Tomador de Decisão"
                         className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white outline-none focus:border-indigo-500"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">WhatsApp (Confirmação IA)</label>
                       <input 
                         type="text" 
                         value={formData.clientWhatsApp}
                         onChange={e => setFormData({...formData, clientWhatsApp: e.target.value})}
                         placeholder="DDI + DDD + Número"
                         className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white outline-none focus:border-indigo-500"
                       />
                    </div>
                 </div>

                 <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Data</label>
                       <input 
                         type="date" 
                         value={formData.date}
                         onChange={e => setFormData({...formData, date: e.target.value})}
                         className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white outline-none focus:border-indigo-500"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Início</label>
                       <input 
                         type="time" 
                         value={formData.time}
                         onChange={e => setFormData({...formData, time: e.target.value})}
                         className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white outline-none focus:border-indigo-500"
                       />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Duração (Min)</label>
                       <select 
                         value={formData.duration}
                         onChange={e => setFormData({...formData, duration: Number(e.target.value)})}
                         className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-5 text-white outline-none focus:border-indigo-500"
                       >
                          <option value={15}>15 min (Flash)</option>
                          <option value={30}>30 min (Standard)</option>
                          <option value={45}>45 min (Expert)</option>
                          <option value={60}>60 min (Strategy)</option>
                       </select>
                    </div>
                 </div>

                 <div className="space-y-2">
                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-3">Link de Videoconferência (Nexus Auto-Gen)</label>
                    <div className="relative group">
                       <input 
                         type="text" 
                         readOnly
                         value={formData.link}
                         className="w-full bg-gray-950/50 border border-gray-800 rounded-2xl p-5 text-indigo-400 font-mono text-xs outline-none"
                       />
                       <i className="fa-solid fa-link absolute right-6 top-1/2 -translate-y-1/2 text-gray-700 group-hover:text-indigo-500 transition-colors"></i>
                    </div>
                 </div>

                 <button 
                   onClick={handleSaveAppointment}
                   disabled={isProcessing}
                   className="w-full py-6 bg-indigo-600 hover:bg-indigo-500 text-white font-black text-xs uppercase tracking-[0.4em] rounded-3xl shadow-2xl shadow-indigo-900/40 transition-all flex items-center justify-center gap-5 hover:scale-[1.02] active:scale-[0.98]"
                 >
                    {isProcessing ? (
                      <i className="fa-solid fa-circle-notch animate-spin text-xl"></i>
                    ) : (
                      <i className="fa-solid fa-bolt-lightning text-lg"></i>
                    )}
                    {isProcessing ? "SINCRONIZANDO AGENDA..." : "AGENDAR E ATIVAR NEXUS IA"}
                 </button>
              </div>
           </div>
        </div>
      )}

      {/* LOADER OVERLAY */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[2000] flex items-center justify-center">
           <div className="text-center">
              <div className="w-24 h-24 border-8 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-10 shadow-[0_0_50px_rgba(79,70,229,0.3)]"></div>
              <h2 className="text-4xl font-black text-white uppercase tracking-[0.5em] animate-pulse">Ajustando Cronogramas...</h2>
              <p className="text-indigo-400 font-bold uppercase text-[10px] mt-4 tracking-widest">A IA está reservando seus melhores slots.</p>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #374151; border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #4f46e5; }
      `}</style>
    </div>
  );
};

export default SchedulingManager;