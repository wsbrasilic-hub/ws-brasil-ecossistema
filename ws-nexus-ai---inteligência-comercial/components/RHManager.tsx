
import React, { useState, useMemo, useRef } from 'react';
import { analyzeCandidateScore, analyzeCandidatePDF, analyzeClimateSentiment, generatePDI } from '../services/geminiService';
import { 
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Tooltip 
} from 'recharts';
import { Employee } from '../types';

interface RHAIConfig {
  segment: string;
  companyType: string;
  idealProfile: string;
  qualificationLevel: string;
}

interface Candidate {
  id: string;
  name: string;
  role: string;
  match: number;
  resume: string;
  aiFeedback?: string;
}

// Fix: Added organizationId and customAttributes to each employee
const MOCK_EMPLOYEES: Employee[] = [
  { id: '1', organizationId: 'ORG-WS-001', name: 'Carlos Silva', role: 'CTO', department: 'Tecnologia', salary: 15000, hiringDate: '2023-01-10', profile: 'EXECUTOR', performanceScore: 95, potentialScore: 98, status: 'ATIVO', customAttributes: {} },
  { id: '2', organizationId: 'ORG-WS-001', name: 'Marina Lins', role: 'Head de Vendas', department: 'Comercial', salary: 12000, hiringDate: '2023-05-15', profile: 'COMUNICADOR', performanceScore: 88, potentialScore: 92, status: 'ATIVO', customAttributes: {} },
  { id: '3', organizationId: 'ORG-WS-001', name: 'Roberto J.', role: 'Analista Financeiro', department: 'Operacional', salary: 6000, hiringDate: '2024-02-01', profile: 'ANALISTA', performanceScore: 70, potentialScore: 60, status: 'ATIVO', customAttributes: {} },
  { id: '4', organizationId: 'ORG-WS-001', name: 'Sofia Mendes', role: 'Gerente Projetos', department: 'Marketing', salary: 9000, hiringDate: '2023-11-20', profile: 'PLANEJADOR', performanceScore: 82, potentialScore: 75, status: 'ATIVO', customAttributes: {} },
];

const RHManager: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'ATS' | 'PROFILER' | '9BOX' | 'CLIMA'>('ATS');
  const [employees] = useState<Employee[]>(MOCK_EMPLOYEES);
  const [candidates, setCandidates] = useState<Candidate[]>([
    { id: 'c1', name: 'Alice Rocha', role: 'Desenvolvedor Senior', match: 94, resume: '10 anos de experiência com React e Node.js.' },
  ]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [modalContent, setModalContent] = useState<{title: string, body: string} | null>(null);
  
  // Configuração da IA (Nexus Core Tuner)
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);
  const [aiConfig, setAiConfig] = useState<RHAIConfig>({
    segment: 'Tecnologia / SaaS',
    companyType: 'Startup de Crescimento Acelerado',
    idealProfile: 'Executor agressivo, hands-on, focado em entrega e autonomia.',
    qualificationLevel: 'Sênior / Especialista'
  });

  // Modal de Upload
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [candidateName, setCandidateName] = useState('');
  const [targetRole, setTargetRole] = useState('Comercial');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const radarData = [
    { subject: 'Execução', A: 85 },
    { subject: 'Comunicação', A: 92 },
    { subject: 'Planejamento', A: 65 },
    { subject: 'Análise', A: 78 },
  ];

  const nineBoxMatrix = useMemo(() => {
    const matrix: { [key: string]: Employee[] } = {
      'H/H': [], 'H/M': [], 'H/L': [],
      'M/H': [], 'M/M': [], 'M/L': [],
      'L/H': [], 'L/M': [], 'L/L': []
    };
    employees.forEach(emp => {
      const perf = emp.performanceScore > 85 ? 'H' : emp.performanceScore > 60 ? 'M' : 'L';
      const pot = emp.potentialScore > 85 ? 'H' : emp.potentialScore > 60 ? 'M' : 'L';
      matrix[`${perf}/${pot}`].push(emp);
    });
    return matrix;
  }, [employees]);

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve((reader.result as string).split(',')[1]);
      reader.onerror = reject;
    });
  };

  const handleProcessIntake = async () => {
    if (!candidateName) return;
    setIsAnalyzing(true);
    try {
      let analysis = "";
      let matchScore = 0;

      if (selectedFile) {
        const base64 = await fileToBase64(selectedFile);
        analysis = await analyzeCandidatePDF(base64, candidateName, targetRole, aiConfig);
        matchScore = Math.floor(Math.random() * (98 - 85 + 1) + 85);
      } else {
        setIsAnalyzing(false);
        return;
      }

      const newCandidate: Candidate = {
        id: `c-${Date.now()}`,
        name: candidateName,
        role: targetRole,
        match: matchScore,
        resume: `Análise customizada: ${selectedFile.name}`,
        aiFeedback: analysis
      };

      setCandidates([newCandidate, ...candidates]);
      setIsUploadModalOpen(false);
      setCandidateName('');
      setSelectedFile(null);
      setModalContent({ title: `Qualificação Concluída: ${candidateName}`, body: analysis || '' });
    } catch (e) {
      alert("Erro ao conectar com Nexus Brain.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleGeneratePDI = async (emp: Employee) => {
    setIsAnalyzing(true);
    try {
      const position = emp.performanceScore > 85 && emp.potentialScore > 85 ? "Estrela" : "Profissional em Desenvolvimento";
      const pdi = await generatePDI(emp.name, position);
      setModalContent({ title: `PDI: ${emp.name}`, body: pdi || '' });
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-24">
      {/* HEADER EXECUTIVO RH */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center bg-gray-900 border border-purple-500/20 p-8 rounded-[2.5rem] shadow-2xl">
        <div>
          <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Nexus People Strategy</h2>
          <p className="text-purple-400 font-bold text-xs uppercase tracking-widest mt-1">WS Brasil Inteligência Comportamental</p>
        </div>
        <div className="flex items-center gap-4 mt-4 md:mt-0">
          <button 
            onClick={() => setIsConfigModalOpen(true)}
            className="p-4 bg-gray-800 rounded-2xl border border-gray-700 text-purple-400 hover:text-white transition-all shadow-lg hover:border-purple-500/50"
            title="Calibrar Nexus Brain"
          >
            <i className="fa-solid fa-sliders text-xl"></i>
          </button>
          <div className="flex bg-gray-800 p-1.5 rounded-2xl border border-gray-700">
            {(['ATS', 'PROFILER', '9BOX', 'CLIMA'] as const).map(tab => (
              <button 
                key={tab} 
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === tab ? 'bg-purple-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'}`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-3">
          {activeTab === 'ATS' && (
             <div className="bg-gray-800/40 p-10 rounded-[3rem] border border-gray-800 min-h-[500px] flex flex-col gap-8">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-xl font-black text-white uppercase">Pipeline de Talentos</h3>
                    <p className="text-[9px] text-purple-500 font-black uppercase tracking-[0.2em]">IA Calibrada para: {aiConfig.segment}</p>
                  </div>
                  <button 
                    onClick={() => setIsUploadModalOpen(true)}
                    className="bg-purple-600 hover:bg-purple-500 text-white font-black px-6 py-3 rounded-2xl shadow-lg transition-all flex items-center gap-3 uppercase text-[10px] tracking-widest"
                  >
                    <i className="fa-solid fa-cloud-arrow-up"></i> Receber Currículo
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidates.map(c => (
                    <div key={c.id} className="bg-gray-950 p-6 rounded-3xl border border-gray-800 hover:border-purple-500/50 transition-all group">
                       <div className="flex justify-between mb-4">
                          <span className="text-purple-500 font-black text-[10px] uppercase tracking-widest">{c.role}</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-black ${c.match > 90 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                            {c.match}% MATCH IA
                          </span>
                       </div>
                       <h4 className="text-white font-bold text-lg mb-2">{c.name}</h4>
                       <p className="text-xs text-gray-500 line-clamp-2 mb-6">{c.resume}</p>
                       <button 
                         onClick={() => setModalContent({ title: `Parecer Nexus IA: ${c.name}`, body: c.aiFeedback || 'Sem feedback disponível.' })}
                         className="w-full py-3 bg-gray-900 border border-gray-800 rounded-xl text-white font-black text-[10px] uppercase tracking-widest hover:bg-purple-600 transition-all"
                       >
                         Ver Parecer IA
                       </button>
                    </div>
                  ))}
                </div>
             </div>
          )}

          {activeTab === 'PROFILER' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
               <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 shadow-2xl">
                  <h4 className="text-white font-black uppercase text-xs tracking-widest mb-10">Radar Comportamental</h4>
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                        <PolarGrid stroke="#374151" />
                        <PolarAngleAxis dataKey="subject" tick={{ fill: '#9ca3af', fontSize: 10 }} />
                        <Radar name="Equipe" dataKey="A" stroke="#a855f7" fill="#a855f7" fillOpacity={0.6} />
                      </RadarChart>
                    </ResponsiveContainer>
                  </div>
               </div>
               <div className="bg-gray-900 p-10 rounded-[3rem] border border-gray-800 shadow-2xl space-y-4">
                  <h4 className="text-white font-black uppercase text-xs tracking-widest mb-4">Fit Cultural por Colaborador</h4>
                  {employees.map(emp => (
                    <div key={emp.id} className="flex justify-between items-center p-4 bg-gray-800 rounded-2xl border border-gray-700">
                       <div>
                          <p className="text-white font-bold text-sm">{emp.name}</p>
                          <p className="text-[10px] text-gray-500 uppercase">{emp.profile}</p>
                       </div>
                       <span className="text-purple-400 font-black text-[10px]">{emp.performanceScore}% Match</span>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === '9BOX' && (
            <div className="bg-gray-950 p-10 rounded-[3rem] border border-gray-800 shadow-2xl">
               <h4 className="text-white font-black uppercase text-xs tracking-widest mb-8 text-center">Matriz de Sucessão Estratégica</h4>
               <div className="grid grid-cols-3 gap-4 h-[500px]">
                  {Object.entries(nineBoxMatrix).map(([key, emps]) => (
                    <div key={key} className="bg-gray-900/50 border border-gray-800 rounded-2xl p-4 flex flex-col items-center justify-center relative hover:bg-purple-600/5 transition-all">
                       <span className="absolute top-2 left-3 text-[8px] font-black text-gray-600 uppercase tracking-widest">{key}</span>
                       <div className="flex flex-wrap justify-center gap-2">
                          {(emps as Employee[]).map(e => (
                            <div key={e.id} onClick={() => handleGeneratePDI(e)} className="w-12 h-12 rounded-2xl bg-purple-600 flex items-center justify-center text-[10px] font-black text-white cursor-pointer hover:scale-110 transition-all">
                               {e.name.split(' ').map(n => n[0]).join('')}
                            </div>
                          ))}
                       </div>
                    </div>
                  ))}
               </div>
            </div>
          )}

          {activeTab === 'CLIMA' && (
             <div className="bg-gray-900 p-12 rounded-[3rem] border border-gray-800 shadow-2xl text-center">
                <div className="w-32 h-32 bg-green-500/10 rounded-[2.5rem] flex items-center justify-center text-green-500 border border-green-500/20 mx-auto mb-8">
                   <i className="fa-solid fa-face-laugh-beam text-6xl"></i>
                </div>
                <h3 className="text-4xl font-black text-white tracking-tighter mb-2">eNPS: 84</h3>
                <p className="text-green-500 font-bold uppercase text-[10px] tracking-[0.4em] mb-10">Ambiente de Alta Performance</p>
                <button onClick={async () => { setIsAnalyzing(true); const s = await analyzeClimateSentiment(["Feedback positivo"]); setModalContent({title: "Clima", body: s}); setIsAnalyzing(false); }} className="bg-purple-600 text-white font-black px-12 py-5 rounded-2xl uppercase text-xs tracking-widest">Analisar Sentimento Geral</button>
             </div>
          )}
        </div>

        <div className="space-y-8">
          <div className="bg-gradient-to-br from-purple-900/40 to-indigo-900/40 p-8 rounded-[3rem] border border-purple-500/20 shadow-2xl">
             <p className="text-[10px] text-purple-400 font-black uppercase tracking-widest mb-2">Previsão de ROI RH</p>
             <h3 className="text-4xl font-black text-white font-mono tracking-tighter">R$ 145.200</h3>
             <p className="text-[9px] text-gray-500 font-bold uppercase mt-4">Economia via automação Nexus</p>
          </div>
        </div>
      </div>

      {/* MODAL: CORE TUNER (CONFIG IA) */}
      {isConfigModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-gray-900 border border-purple-500/30 rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col">
             <div className="p-8 bg-purple-600/10 border-b border-gray-800 flex justify-between items-center">
                <div>
                   <h3 className="text-xl font-black text-white uppercase tracking-tighter">Nexus Core Tuner</h3>
                   <p className="text-[9px] text-purple-500 font-black uppercase tracking-widest">Personalize o Cérebro de Seleção</p>
                </div>
                <button onClick={() => setIsConfigModalOpen(false)} className="text-gray-500 hover:text-white transition-transform hover:rotate-90"><i className="fa-solid fa-xmark text-3xl"></i></button>
             </div>
             <div className="p-10 space-y-6">
                <div className="grid grid-cols-2 gap-6">
                   <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Segmento do Negócio</label>
                      <input 
                        type="text" 
                        value={aiConfig.segment} 
                        onChange={e => setAiConfig({...aiConfig, segment: e.target.value})} 
                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-purple-500"
                        placeholder="Ex: Varejo Moda, Logística, Fintech"
                      />
                   </div>
                   <div className="space-y-2">
                      <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Tipo de Empresa / Cultura</label>
                      <input 
                        type="text" 
                        value={aiConfig.companyType} 
                        onChange={e => setAiConfig({...aiConfig, companyType: e.target.value})} 
                        className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-purple-500"
                        placeholder="Ex: Startup Ágil, Corporação Sólida"
                      />
                   </div>
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Perfil do Candidato Ideal (Características)</label>
                   <textarea 
                     value={aiConfig.idealProfile}
                     onChange={e => setAiConfig({...aiConfig, idealProfile: e.target.value})}
                     className="w-full bg-gray-950 border border-gray-800 rounded-3xl p-6 text-sm text-gray-300 outline-none focus:border-purple-500 min-h-[120px] resize-none"
                     placeholder="Descreva as soft skills e atitudes buscadas..."
                   />
                </div>
                <div className="space-y-2">
                   <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Qualificação Profissional Exigida</label>
                   <input 
                     type="text" 
                     value={aiConfig.qualificationLevel} 
                     onChange={e => setAiConfig({...aiConfig, qualificationLevel: e.target.value})} 
                     className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-purple-500"
                     placeholder="Ex: Inglês fluente, Certificação PMP, 5 anos de React"
                   />
                </div>
                <button 
                  onClick={() => setIsConfigModalOpen(false)}
                  className="w-full py-5 bg-purple-600 text-white font-black text-xs uppercase tracking-[0.2em] rounded-2xl shadow-xl shadow-purple-900/30 transition-all hover:scale-105"
                >
                  <i className="fa-solid fa-microchip mr-3"></i> SALVAR CONFIGURAÇÃO IA
                </button>
             </div>
          </div>
        </div>
      )}

      {/* MODAL: UPLOAD CURRICULO */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-2xl z-[1500] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-gray-900 border border-purple-500/30 rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden p-10 flex flex-col gap-6">
             <div className="flex justify-between items-center mb-4">
               <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Entrada de Talento</h3>
               <button onClick={() => setIsUploadModalOpen(false)} className="text-gray-500 hover:text-white"><i className="fa-solid fa-xmark text-3xl"></i></button>
             </div>
             
             <div className="grid grid-cols-2 gap-6">
                <input 
                  type="text" 
                  value={candidateName} 
                  onChange={e => setCandidateName(e.target.value)} 
                  placeholder="Nome do Candidato"
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none"
                />
                <select 
                  value={targetRole} 
                  onChange={e => setTargetRole(e.target.value)}
                  className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white"
                >
                  <option>Comercial</option>
                  <option>Desenvolvimento</option>
                  <option>Gestão</option>
                </select>
             </div>

             <div 
               onClick={() => fileInputRef.current?.click()}
               className={`border-2 border-dashed rounded-3xl p-10 text-center cursor-pointer transition-all ${selectedFile ? 'border-emerald-500 bg-emerald-500/5' : 'border-gray-800 hover:border-purple-500 bg-gray-950'}`}
             >
                <input type="file" ref={fileInputRef} onChange={(e) => setSelectedFile(e.target.files?.[0] || null)} accept="application/pdf" className="hidden" />
                <i className={`fa-solid ${selectedFile ? 'fa-file-circle-check text-emerald-500' : 'fa-cloud-arrow-up text-gray-600'} text-4xl mb-4`}></i>
                <p className="text-white font-bold">{selectedFile ? selectedFile.name : 'Subir Currículo em PDF'}</p>
             </div>

             <button 
               onClick={handleProcessIntake}
               disabled={isAnalyzing || !selectedFile || !candidateName}
               className="w-full py-5 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-2xl shadow-xl transition-all disabled:opacity-50"
             >
               QUALIFICAR COM NEXUS BRAIN
             </button>
          </div>
        </div>
      )}

      {/* MODAL RESULTADOS */}
      {modalContent && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[1600] flex items-center justify-center p-6 animate-fadeIn">
          <div className="bg-gray-900 border border-purple-500/30 rounded-[3rem] w-full max-w-2xl max-h-[80vh] overflow-hidden shadow-2xl flex flex-col">
             <div className="p-8 bg-purple-600/10 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-xl font-black text-white uppercase tracking-tighter">{modalContent.title}</h3>
                <button onClick={() => setModalContent(null)} className="text-gray-500 hover:text-white transition-transform hover:rotate-90"><i className="fa-solid fa-xmark text-3xl"></i></button>
             </div>
             <div className="p-10 overflow-y-auto custom-scrollbar text-gray-300 text-sm leading-relaxed whitespace-pre-wrap font-medium">
                {modalContent.body}
             </div>
             <div className="p-8 bg-gray-800/30 border-t border-gray-800 flex justify-end gap-4">
                <button onClick={() => setModalContent(null)} className="text-gray-500 font-bold uppercase text-[10px] tracking-widest">Fechar</button>
                <button onClick={() => window.print()} className="bg-purple-600 text-white font-black px-10 py-3 rounded-xl uppercase text-[10px] tracking-widest shadow-lg">Imprimir Relatório</button>
             </div>
          </div>
        </div>
      )}

      {isAnalyzing && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[2000] flex items-center justify-center">
           <div className="text-center">
              <div className="w-24 h-24 border-8 border-purple-600 border-t-transparent rounded-full animate-spin mx-auto mb-10"></div>
              <h2 className="text-3xl font-black text-white uppercase tracking-[0.3em] animate-pulse">Sincronizando Critérios...</h2>
           </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { height: 6px; width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default RHManager;