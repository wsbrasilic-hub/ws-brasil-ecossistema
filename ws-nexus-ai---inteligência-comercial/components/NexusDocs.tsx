
import React, { useState } from 'react';
import { generateContract, generateMessageCopy } from '../services/geminiService';

interface Document {
  id: string;
  name: string;
  client: string;
  status: 'PENDENTE' | 'VISUALIZADO' | 'ASSINADO' | 'EXPIRADO';
  date: string;
  clientPhone?: string;
  clientEmail?: string;
}

const MOCK_DOCS: Document[] = [
  { id: 'DOC-001', name: 'Contrato_Consultoria_Marketing.pdf', client: 'Empresa Solar S.A.', status: 'PENDENTE', date: '2025-03-08', clientPhone: '5511987654321', clientEmail: 'contato@solar.com' },
  { id: 'DOC-002', name: 'Termo_Adesao_NexusAI.pdf', client: 'Tech Soluções Ltda', status: 'ASSINADO', date: '2025-03-07', clientPhone: '5511912345678', clientEmail: 'diretoria@techsolucoes.com' },
  { id: 'DOC-003', name: 'Acordo_Nivel_Servico.pdf', client: 'Varejo Express', status: 'VISUALIZADO', date: '2025-03-09' },
];

const NexusDocs: React.FC = () => {
  const [docs, setDocs] = useState<Document[]>(MOCK_DOCS);
  const [prompt, setPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState('');
  const [isDraftModalOpen, setIsDraftModalOpen] = useState(false);
  const [isSendModalOpen, setIsSendModalOpen] = useState(false);
  const [currentDocToSend, setCurrentDocToSend] = useState<Document | null>(null);

  const handleGenerateDraft = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);
    try {
      const draft = await generateContract(prompt);
      setGeneratedDraft(draft || '');
      setIsDraftModalOpen(true);
    } catch (error) {
      console.error(error);
      alert("Erro ao gerar contrato. Tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  const prepareSend = (doc?: Document) => {
    if (doc) {
      setCurrentDocToSend(doc);
    } else {
      const newDoc: Document = {
        id: `DOC-${Math.floor(Math.random() * 900) + 100}`,
        name: `Contrato_Nexus_${Date.now()}.pdf`,
        client: 'Novo Cliente Nexus',
        status: 'PENDENTE',
        date: new Date().toISOString().split('T')[0],
        clientPhone: '',
        clientEmail: ''
      };
      setCurrentDocToSend(newDoc);
    }
    setIsDraftModalOpen(false);
    setIsSendModalOpen(true);
  };

  const handleSendContract = async (channel: 'whatsapp' | 'email') => {
    if (!currentDocToSend) return;
    
    setIsSending(true);
    const signLink = `https://nexus.wsbrasil.com/sign/${currentDocToSend.id}`;
    
    try {
      // IA gera a copy perfeita para o canal escolhido (WhatsApp ou E-mail)
      const aiMessage = await generateMessageCopy(
        channel, 
        currentDocToSend.client, 
        currentDocToSend.name, 
        signLink
      );

      if (channel === 'whatsapp') {
        const encodedMsg = encodeURIComponent(aiMessage || "");
        const phone = currentDocToSend.clientPhone || "";
        window.open(`https://wa.me/${phone}?text=${encodedMsg}`, '_blank');
      } else {
        // Integração direta com Gmail para custo zero e alta entregabilidade
        const subject = encodeURIComponent(`Contrato de Consultoria - WS Brasil I.C - ${currentDocToSend.client}`);
        const body = encodeURIComponent(aiMessage || "");
        const email = currentDocToSend.clientEmail || "";
        // Abre o compose do Gmail com os dados preenchidos
        window.open(`https://mail.google.com/mail/?view=cm&fs=1&to=${email}&su=${subject}&body=${body}`, '_blank');
      }

      // Se for um novo documento (não está na lista), adiciona
      if (!docs.find(d => d.id === currentDocToSend.id)) {
        setDocs(prev => [currentDocToSend, ...prev]);
      }
      
      setIsSendModalOpen(false);
      setGeneratedDraft('');
      setPrompt('');
    } catch (error) {
      console.error("Erro no envio inteligente:", error);
      alert("Erro ao preparar mensagem. Tente o envio manual.");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn">
      {/* Header Estratégico */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-800/80 p-6 rounded-3xl border border-gray-700 shadow-xl gap-4">
        <div>
          <h2 className="text-3xl font-black text-cyan-400 tracking-tight uppercase">Nexus Docs</h2>
          <p className="text-gray-400 text-sm font-medium">Cartório Digital Inteligente • WS Brasil I.C.</p>
        </div>
        <div className="flex gap-3">
           <button className="bg-gray-700 hover:bg-gray-600 text-white font-bold px-6 py-3 rounded-2xl transition-all flex items-center gap-2 border border-gray-600">
             <i className="fa-solid fa-cloud-arrow-up"></i> Upload
           </button>
           <button 
             onClick={() => setPrompt("Contrato de consultoria estratégica, valor R$ 5.000,00...")}
             className="bg-cyan-600 hover:bg-cyan-500 text-white font-black px-6 py-3 rounded-2xl transition-all shadow-lg shadow-cyan-900/30 flex items-center gap-2"
           >
             <i className="fa-solid fa-pen-nib"></i> Redigir Minuta
           </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Lista de Documentos Recentes */}
        <div className="lg:col-span-2 bg-gray-800/40 rounded-3xl border border-gray-700 overflow-hidden shadow-2xl flex flex-col">
          <div className="p-6 border-b border-gray-700 bg-gray-900/30 flex justify-between items-center">
            <h3 className="font-black text-gray-300 uppercase text-xs tracking-widest flex items-center gap-2">
               <i className="fa-solid fa-list-check text-cyan-500"></i>
               Monitor de Assinaturas
            </h3>
            <span className="bg-cyan-500/10 text-cyan-500 px-3 py-1 rounded-full text-[10px] font-bold border border-cyan-500/20">
              {docs.length} Ativos
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] text-gray-500 uppercase tracking-widest bg-gray-900/20">
                  <th className="px-6 py-4">Documento</th>
                  <th className="px-6 py-4">Cliente</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4 text-center">Smart Send</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {docs.map(doc => (
                  <tr key={doc.id} className="hover:bg-white/5 transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-red-500/10 rounded-lg">
                           <i className="fa-solid fa-file-pdf text-red-500"></i>
                        </div>
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors">{doc.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs text-gray-400 font-medium">{doc.client}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-lg text-[10px] font-black border ${
                        doc.status === 'ASSINADO' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                        doc.status === 'PENDENTE' ? 'bg-amber-500/10 text-amber-500 border-amber-500/20' :
                        'bg-blue-500/10 text-blue-400 border-blue-500/20'
                      }`}>
                        {doc.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center gap-4">
                        <button 
                          onClick={() => prepareSend(doc)}
                          title="Enviar com IA" 
                          className="w-8 h-8 rounded-full bg-gray-900 border border-gray-700 text-gray-400 hover:border-cyan-500 hover:text-cyan-400 transition-all flex items-center justify-center"
                        >
                          <i className="fa-solid fa-paper-plane text-xs"></i>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Assistente de Redação Gemini */}
        <div className="bg-cyan-900/10 p-8 rounded-3xl border border-cyan-500/20 flex flex-col shadow-inner">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-12 h-12 bg-cyan-600/20 rounded-2xl flex items-center justify-center text-cyan-400 border border-cyan-500/30 shadow-lg">
              <i className="fa-solid fa-wand-magic-sparkles text-xl"></i>
            </div>
            <div>
               <h3 className="text-xl font-black text-white leading-tight">Redação Nexus</h3>
               <p className="text-[10px] text-cyan-600 font-bold uppercase tracking-tight">IA Generativa Jurídica</p>
            </div>
          </div>
          
          <div className="space-y-4 flex-1">
            <textarea 
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="w-full bg-gray-900/50 border border-gray-700 rounded-2xl p-4 text-sm text-white focus:ring-2 ring-cyan-500/50 outline-none transition-all placeholder:text-gray-700 resize-none min-h-[200px]"
              placeholder="Descreva o contrato (ex: consultoria, 3k mensais, multa 10%)..."
            />
            
            <button 
              onClick={handleGenerateDraft}
              disabled={isGenerating || !prompt.trim()}
              className="w-full bg-cyan-600 hover:bg-cyan-500 text-white font-black py-4 rounded-2xl shadow-xl shadow-cyan-900/40 transition-all transform hover:scale-[1.02] flex items-center justify-center gap-3 disabled:opacity-50"
            >
              {isGenerating ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-feather-pointed"></i>}
              {isGenerating ? "PROCESSANDO MINUTA..." : "GERAR CONTRATO IA"}
            </button>
          </div>
        </div>
      </div>

      {/* MODAL: Pré-visualização do Rascunho */}
      {isDraftModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[200] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl w-full max-w-4xl shadow-2xl animate-fadeIn flex flex-col max-h-[90vh]">
            <div className="p-6 bg-gray-800/50 border-b border-gray-700 flex justify-between items-center">
               <h3 className="text-xl font-black text-white flex items-center gap-3">
                 <i className="fa-solid fa-file-signature text-cyan-400"></i>
                 Minuta Estratégica
               </h3>
               <button onClick={() => setIsDraftModalOpen(false)} className="text-gray-500 hover:text-white transition-all transform hover:rotate-90">
                 <i className="fa-solid fa-xmark text-xl"></i>
               </button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white/5">
               <div className="bg-white p-12 text-gray-800 font-serif leading-relaxed text-sm shadow-2xl mx-auto max-w-[800px] border border-gray-200 min-h-screen">
                  <div className="text-center mb-10 pb-6 border-b border-gray-100">
                    <h1 className="text-2xl font-bold uppercase tracking-widest text-gray-900">Instrumento de Prestação de Serviços</h1>
                    <p className="text-[10px] font-bold text-gray-400 mt-2 tracking-tighter uppercase">WS BRASIL INTELIGÊNCIA COMERCIAL & NEXUS AI</p>
                  </div>
                  <div className="whitespace-pre-wrap">{generatedDraft}</div>
               </div>
            </div>

            <div className="p-6 bg-gray-800/80 border-t border-gray-700 flex justify-end items-center gap-4">
               <button onClick={() => setIsDraftModalOpen(false)} className="px-8 py-3 text-gray-400 font-bold hover:text-white transition-colors">DESCARTAR</button>
               <button 
                 onClick={() => prepareSend()}
                 className="bg-emerald-600 hover:bg-emerald-500 text-white font-black px-10 py-3 rounded-2xl shadow-xl transition-all transform hover:scale-105 flex items-center gap-2"
               >
                 <i className="fa-solid fa-check-double"></i>
                 APROVAR E ESCOLHER CANAL
               </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Escolha de Método de Envio - Smart IA Send */}
      {isSendModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-sm z-[300] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-[2.5rem] w-full max-w-lg shadow-2xl overflow-hidden animate-fadeIn">
            <div className="p-10 text-center">
              <div className="relative w-24 h-24 mx-auto mb-8">
                <div className="absolute inset-0 bg-cyan-500/20 rounded-full animate-ping"></div>
                <div className="relative w-24 h-24 bg-cyan-600/30 rounded-full flex items-center justify-center text-cyan-400 border border-cyan-500/30">
                   <i className={`fa-solid ${isSending ? 'fa-circle-notch animate-spin' : 'fa-brain'} text-4xl`}></i>
                </div>
              </div>
              <h3 className="text-2xl font-black text-white mb-2">{isSending ? 'Redigindo mensagem...' : 'Smart IA Send'}</h3>
              <p className="text-gray-500 text-sm mb-10">
                {isSending 
                  ? 'O Gemini está criando uma mensagem personalizada para maximizar a conversão.' 
                  : 'Selecione o canal para que o Nexus AI gere a copy e abra o envio automático.'}
              </p>
              
              {!isSending && (
                <div className="grid grid-cols-2 gap-6">
                  <button 
                    onClick={() => handleSendContract('whatsapp')}
                    className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-emerald-900/10 border border-emerald-500/20 hover:bg-emerald-500/10 hover:border-emerald-500/50 transition-all transform hover:-translate-y-1"
                  >
                    <i className="fa-brands fa-whatsapp text-5xl text-emerald-500 group-hover:scale-110 transition-transform"></i>
                    <span className="font-black text-[10px] text-emerald-400 uppercase tracking-widest">WhatsApp Web</span>
                  </button>

                  <button 
                    onClick={() => handleSendContract('email')}
                    className="group flex flex-col items-center gap-4 p-8 rounded-3xl bg-red-900/10 border border-red-500/20 hover:bg-red-500/10 hover:border-red-500/50 transition-all transform hover:-translate-y-1"
                  >
                    <i className="fa-solid fa-envelope text-5xl text-red-500 group-hover:scale-110 transition-transform"></i>
                    <span className="font-black text-[10px] text-red-400 uppercase tracking-widest">Enviar via Gmail</span>
                  </button>
                </div>
              )}

              {isSending && (
                <div className="py-10">
                  <div className="flex justify-center gap-2">
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-75"></div>
                    <div className="w-2 h-2 bg-cyan-500 rounded-full animate-bounce delay-150"></div>
                  </div>
                </div>
              )}

              {!isSending && (
                <button 
                  onClick={() => setIsSendModalOpen(false)}
                  className="mt-10 text-gray-600 hover:text-white font-bold text-xs uppercase tracking-widest transition-colors"
                >
                  Cancelar envio
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default NexusDocs;
