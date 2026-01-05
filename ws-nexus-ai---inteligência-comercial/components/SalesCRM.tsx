
import React, { useState, useMemo } from 'react';
import { Lead, LeadTemperature } from '../types';
import { analyzeLeadTemperature } from '../services/geminiService';

interface Product {
  id: string;
  name: string;
  price: number;
}

const MOCK_PRODUCTS: Product[] = [
  { id: 'p1', name: 'Consultoria Estratégica I.C.', price: 5000 },
  { id: 'p2', name: 'Implementação Nexus AI Basic', price: 2500 },
  { id: 'p3', name: 'Gestão de Tráfego Premium', price: 3500 },
  { id: 'p4', name: 'Licença ERP Anual', price: 1200 },
  { id: 'p5', name: 'Treinamento de Equipe Vendas', price: 1800 },
];

interface SalesCRMProps {
  leads: Lead[];
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

const SalesCRM: React.FC<SalesCRMProps> = ({ leads, setLeads }) => {
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [selectedLead, setSelectedLead] = useState<Lead | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);
  
  const [formData, setFormData] = useState<Partial<Lead>>({});
  const [aiRecommendation, setAiRecommendation] = useState('');
  const [loadingAi, setLoadingAi] = useState(false);

  const columns = [
    { id: 'QUALIFICADO', title: 'OPORTUNIDADES AGENDADAS', color: 'border-cyan-500' },
    { id: 'REUNIAO', title: 'REUNIÃO ESTRATÉGICA', color: 'border-blue-500' },
    { id: 'PROPOSTA', title: 'PROPOSTA EM ANÁLISE', color: 'border-amber-500' },
    { id: 'FECHAMENTO', title: 'FECHAMENTO IMINENTE', color: 'border-emerald-500' },
  ];

  const calculateTemperature = (score: number): LeadTemperature => {
    if (score >= 100) return 'FOGO';
    if (score >= 50) return 'AQUECIDO';
    return 'FRIO';
  };

  const getTemperatureStyle = (temp: LeadTemperature) => {
    switch (temp) {
      case 'FOGO': return { icon: '🔥', color: 'text-red-500', bg: 'bg-red-500/10', border: 'border-red-500/30' };
      case 'AQUECIDO': return { icon: '⚡', color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30' };
      default: return { icon: '❄️', color: 'text-blue-400', bg: 'bg-blue-400/10', border: 'border-blue-400/30' };
    }
  };

  const filteredLeads = useMemo(() => {
    const term = searchTerm.toLowerCase();
    return leads.filter(l => 
      l.company.toLowerCase().includes(term) || 
      l.contact.toLowerCase().includes(term)
    ).sort((a, b) => b.score - a.score);
  }, [leads, searchTerm]);

  const onDragStart = (e: React.DragEvent, id: string) => {
    setDraggedId(id);
    e.dataTransfer.setData('leadId', id);
  };

  const onDrop = (e: React.DragEvent, newStatus: Lead['status']) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('leadId');
    if (id) {
      setLeads(prev => prev.map(l => {
        if (l.id === id) {
          let scoreBonus = 10;
          if (newStatus === 'FECHAMENTO') scoreBonus = 50;
          const newScore = l.score + scoreBonus;
          return { ...l, status: newStatus, score: newScore, temperature: calculateTemperature(newScore) };
        }
        return l;
      }));
    }
    setDraggedId(null);
    setDragOverCol(null);
  };

  const handleCardClick = async (lead: Lead) => {
    setSelectedLead(lead);
    setFormData({ ...lead });
    setIsDetailsOpen(true);
    setLoadingAi(true);
    try {
      const rec = await analyzeLeadTemperature(lead.score, lead.observations || "Nenhuma observação prévia.");
      setAiRecommendation(rec);
    } catch (e) {
      setAiRecommendation("Lead qualificado. Sugerir fechamento.");
    } finally {
      setLoadingAi(false);
    }
  };

  const handleSaveLead = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedLead) {
      setLeads(prev => prev.map(l => l.id === selectedLead.id ? { ...l, ...formData } as Lead : l));
      setIsDetailsOpen(false);
    } else {
      const newLead: Lead = {
        id: `lead-${Date.now()}`,
        organizationId: 'ORG-WS-001',
        company: formData.company || '',
        contact: formData.contact || '',
        email: formData.email || '',
        phone: formData.phone || '',
        value: Number(formData.value) || 0,
        status: 'QUALIFICADO',
        probability: 30,
        score: 50,
        temperature: 'AQUECIDO',
        lastContact: 'Agora',
        tasks: [],
        reminders: [],
        customAttributes: {}
      };
      setLeads([newLead, ...leads]);
      setIsModalOpen(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn relative pb-20">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-gray-800/80 p-4 rounded-[2rem] border border-gray-700 shadow-xl backdrop-blur-md">
        <div className="flex bg-gray-900 p-1 rounded-xl border border-gray-700 items-center gap-1">
          <button onClick={() => setViewMode('kanban')} className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'kanban' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'}`}>Pipeline</button>
          <button onClick={() => setViewMode('list')} className={`px-6 py-2 rounded-lg font-black text-[10px] uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-cyan-600 text-white' : 'text-gray-500 hover:text-white'}`}>Lista</button>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fa-solid fa-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 text-xs"></i>
            <input type="text" placeholder="Filtrar Leads..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-gray-950 border border-gray-800 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 ring-cyan-500 outline-none text-white" />
          </div>
          <button onClick={() => { setFormData({}); setIsModalOpen(true); }}
            className="bg-emerald-600 hover:bg-emerald-500 text-white px-6 py-2 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all shadow-lg">LANÇAR NEGÓCIO</button>
        </div>
      </div>

      {viewMode === 'kanban' ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 h-[calc(100vh-280px)] overflow-x-auto pb-4 custom-scrollbar">
          {columns.map((col) => (
            <div key={col.id} onDragOver={(e) => { e.preventDefault(); setDragOverCol(col.id); }} onDrop={(e) => onDrop(e, col.id as Lead['status'])}
              className={`bg-gray-800/20 p-5 rounded-[2.5rem] border-t-4 ${col.color} min-w-[300px] flex flex-col gap-5 border-x border-b transition-all ${dragOverCol === col.id ? 'bg-indigo-600/5' : 'border-gray-800/50'}`}>
              <div className="flex justify-between items-center mb-1">
                <span className="font-black text-gray-500 text-[9px] tracking-[0.2em] uppercase">{col.title}</span>
                <span className="bg-gray-900 text-gray-400 px-2 py-1 rounded-lg text-[9px] font-black border border-gray-800">{filteredLeads.filter(l => l.status === col.id).length}</span>
              </div>
              <div className="space-y-4 flex-1 overflow-y-auto custom-scrollbar pr-1">
                {filteredLeads.filter(l => l.status === col.id).map(lead => {
                  const temp = getTemperatureStyle(lead.temperature);
                  return (
                    <div key={lead.id} draggable onDragStart={(e) => onDragStart(e, lead.id)} onClick={() => handleCardClick(lead)}
                      className={`bg-gray-800 p-6 rounded-[1.8rem] border border-gray-700 shadow-xl hover:border-cyan-500/50 transition-all group relative cursor-pointer ${draggedId === lead.id ? 'opacity-30 grayscale' : 'opacity-100'}`}>
                      <div className="flex justify-between items-start mb-4">
                        <h4 className="font-black text-white group-hover:text-cyan-400 transition-colors text-sm leading-tight pr-8">{lead.company}</h4>
                        <div className={`w-8 h-8 ${temp.bg} ${temp.border} border rounded-full flex items-center justify-center text-sm shadow-inner`}>{temp.icon}</div>
                      </div>
                      <div className="flex justify-between items-center pt-4 border-t border-gray-700/50">
                        <span className="text-white font-black text-sm">R$ {lead.value.toLocaleString('pt-BR')}</span>
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{lead.score} PTS</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-gray-900/50 rounded-[2.5rem] border border-gray-800 overflow-hidden shadow-2xl overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-gray-800/50 text-[9px] text-gray-500 font-black uppercase tracking-[0.2em] border-b border-gray-700">
                <th className="p-6">Lead</th>
                <th className="p-6">Empresa</th>
                <th className="p-6">Score</th>
                <th className="p-6">Valor</th>
                <th className="p-6">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {filteredLeads.map(lead => (
                <tr key={lead.id} onClick={() => handleCardClick(lead)} className="hover:bg-white/5 transition-all cursor-pointer group">
                  <td className="p-6">
                    <div className={`w-10 h-10 ${getTemperatureStyle(lead.temperature).bg} rounded-2xl flex items-center justify-center text-lg`}>{getTemperatureStyle(lead.temperature).icon}</div>
                  </td>
                  <td className="p-6">
                    <p className="font-black text-white group-hover:text-cyan-400 transition-colors">{lead.company}</p>
                    <p className="text-[10px] text-gray-500 font-bold uppercase">{lead.contact}</p>
                  </td>
                  <td className="p-6 text-xs font-black text-white">{lead.score}</td>
                  <td className="p-6 font-black text-white">R$ {lead.value.toLocaleString('pt-BR')}</td>
                  <td className="p-6"><span className="bg-gray-800 text-gray-400 px-3 py-1 rounded-lg text-[9px] font-black border border-gray-700 uppercase">{lead.status}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* MODAL DETALHES */}
      {isDetailsOpen && selectedLead && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[1000] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-[3rem] w-full max-w-6xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
             <div className="p-10 bg-gray-800/30 border-b border-gray-800 flex justify-between items-center">
                <div className="flex items-center gap-6">
                   <div className={`w-16 h-16 ${getTemperatureStyle(selectedLead.temperature).bg} rounded-[2rem] flex items-center justify-center text-4xl shadow-xl`}>{getTemperatureStyle(selectedLead.temperature).icon}</div>
                   <div>
                      <h3 className="text-3xl font-black text-white tracking-tighter uppercase">{selectedLead.company}</h3>
                      <p className="text-[10px] font-black text-cyan-500 uppercase tracking-widest">{selectedLead.score} Pontos de Engajamento Cloud</p>
                   </div>
                </div>
                <button onClick={() => setIsDetailsOpen(false)} className="text-gray-600 hover:text-white transition-all transform hover:rotate-90"><i className="fa-solid fa-xmark text-3xl"></i></button>
             </div>
             <div className="flex-1 overflow-y-auto p-12 grid grid-cols-1 lg:grid-cols-3 gap-12 custom-scrollbar">
                <div className="lg:col-span-2 space-y-8">
                   <div className="bg-indigo-900/20 p-8 rounded-[2.5rem] border border-indigo-500/20">
                      <h4 className="text-[10px] font-black text-indigo-400 uppercase tracking-[0.3em] mb-4">Nexus Insights Cloud</h4>
                      {loadingAi ? <p className="text-gray-500 italic">Sincronizando com Nexus Brain...</p> : <p className="text-lg text-white font-medium italic">"{aiRecommendation}"</p>}
                   </div>
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div className="bg-gray-800/40 p-8 rounded-3xl border border-gray-800 space-y-4">
                         <input type="text" value={formData.contact} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-sm" placeholder="Contato" />
                         <input type="text" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white text-sm" placeholder="Telefone" />
                      </div>
                      <div className="bg-gray-800/40 p-8 rounded-3xl border border-gray-800 text-center">
                         <span className="text-[9px] text-gray-600 font-black uppercase tracking-widest block mb-1">Previsão de Receita</span>
                         <span className="text-3xl font-black text-white">R$ {formData.value?.toLocaleString('pt-BR')}</span>
                      </div>
                   </div>
                </div>
             </div>
             <div className="p-10 bg-gray-950 border-t border-gray-800 flex justify-end gap-4">
                <button onClick={() => setIsDetailsOpen(false)} className="px-10 py-4 text-gray-500 font-black text-[10px] uppercase tracking-widest">Fechar</button>
                <button onClick={handleSaveLead} className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-16 py-4 rounded-2xl shadow-xl transition-all text-[10px] uppercase tracking-widest">Sincronizar Alterações</button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL NOVO NEGOCIO */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-sm z-[1000] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-gray-900 border border-gray-800 rounded-[3rem] w-full max-w-xl shadow-2xl p-10 space-y-6">
             <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-4">Novo Negócio Nexus Cloud</h3>
             <input required value={formData.company || ''} onChange={e => setFormData({...formData, company: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-cyan-500" placeholder="Empresa / Lead" />
             <input required value={formData.contact || ''} onChange={e => setFormData({...formData, contact: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none" placeholder="Responsável" />
             <input required type="number" value={formData.value || ''} onChange={e => setFormData({...formData, value: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none" placeholder="Valor Estimado" />
             <button onClick={handleSaveLead} className="w-full py-5 bg-emerald-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl hover:scale-105 transition-all">ATIVAR NO CLOUD</button>
             <button onClick={() => setIsModalOpen(false)} className="w-full text-gray-600 font-bold text-[10px] uppercase tracking-widest pt-2">Cancelar</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default SalesCRM;
