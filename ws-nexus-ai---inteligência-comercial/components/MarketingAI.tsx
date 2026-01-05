
import React, { useState, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

type ToolType = 'GENERAL' | 'EMAIL' | 'POST' | 'SEO';

const MarketingAI: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [aiResponse, setAiResponse] = useState('');
  const [generatedImage, setGeneratedImage] = useState<string | null>(null);
  const [selectedTool, setSelectedTool] = useState<ToolType>('GENERAL');
  const commandRef = useRef<HTMLDivElement>(null);

  const getGeminiClient = () => new GoogleGenAI({ apiKey: process.env.API_KEY });

  const selectTool = (tool: ToolType, template: string) => {
    setSelectedTool(tool);
    setPrompt(template);
    commandRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleGenerate = async () => {
    if (!prompt) return;
    setLoading(true);
    setAiResponse('');
    setGeneratedImage(null);

    try {
      const ai = getGeminiClient();
      
      // Lógica para Texto (Estratégia/Copy)
      const textResponse = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Você é o Diretor de Marketing da WS Brasil I.C. Pedido: ${prompt}. Contexto da ferramenta: ${selectedTool}.`,
        config: {
          systemInstruction: "Seja altamente persuasivo, use gatilhos mentais de escassez e autoridade. Foque em ROI e conversão imediata para micro e pequenas empresas brasileiras. Retorne em Markdown bem formatado.",
          temperature: 0.7,
        }
      });
      
      setAiResponse(textResponse.text || '');

      // Lógica Adicional para Imagem se for POST
      if (selectedTool === 'POST') {
        const imageResponse = await ai.models.generateContent({
          model: 'gemini-2.5-flash-image',
          contents: {
            parts: [{ text: `Uma imagem profissional e moderna para publicidade em redes sociais sobre: ${prompt}. Estilo corporativo high-tech, cores azul cyan e dourado.` }]
          },
          config: {
            imageConfig: { aspectRatio: "1:1" }
          }
        });

        for (const part of imageResponse.candidates[0].content.parts) {
          if (part.inlineData) {
            setGeneratedImage(`data:image/png;base64,${part.inlineData.data}`);
          }
        }
      }
    } catch (error) {
      console.error(error);
      setAiResponse("Erro crítico no processamento do Nexus Brain. Verifique a conexão com a WS Brasil.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-fadeIn pb-20">
      <header>
        <h2 className="text-3xl font-bold text-cyan-400">Marketing Inteligente WS</h2>
        <p className="text-gray-400">A agência digital estratégica da WS Brasil operando via IA.</p>
      </header>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card: E-mail Marketing */}
        <div className={`bg-gray-800 p-6 rounded-xl border transition-all group shadow-lg ${selectedTool === 'EMAIL' ? 'border-cyan-500 ring-1 ring-cyan-500' : 'border-gray-700 hover:border-cyan-500'}`}>
          <i className="fa-solid fa-envelope-open-text text-4xl text-cyan-500 mb-4 group-hover:scale-110 transition-transform"></i>
          <h3 className="text-xl font-bold">E-mail Automático</h3>
          <p className="text-sm text-gray-400 mt-2">IA cria sequências de e-mails que vendem sozinhos baseados no interesse do lead.</p>
          <button 
            onClick={() => selectTool('EMAIL', 'Crie uma sequência de 3 e-mails de vendas para um lead que acabou de baixar um ebook sobre gestão financeira.')}
            className="mt-6 w-full py-2 bg-cyan-600 hover:bg-cyan-500 rounded-lg text-sm font-bold transition-colors"
          >
            Criar Campanha
          </button>
        </div>

        {/* Card: Redes Sociais */}
        <div className={`bg-gray-800 p-6 rounded-xl border transition-all group shadow-lg ${selectedTool === 'POST' ? 'border-pink-500 ring-1 ring-pink-500' : 'border-gray-700 hover:border-pink-500'}`}>
          <i className="fa-solid fa-share-nodes text-4xl text-pink-500 mb-4 group-hover:scale-110 transition-transform"></i>
          <h3 className="text-xl font-bold">Gerador de Posts</h3>
          <p className="text-sm text-gray-400 mt-2">Crie artes e legendas para Instagram e LinkedIn com um clique usando IA Multimodal.</p>
          <button 
            onClick={() => selectTool('POST', 'Gere um post para Instagram sobre os benefícios de usar IA na prospecção de clientes B2B.')}
            className="mt-6 w-full py-2 bg-pink-600 hover:bg-pink-500 rounded-lg text-sm font-bold transition-colors"
          >
            Agendar Post
          </button>
        </div>

        {/* Card: Google ADS & SEO */}
        <div className={`bg-gray-800 p-6 rounded-xl border transition-all group shadow-lg ${selectedTool === 'SEO' ? 'border-yellow-500 ring-1 ring-yellow-500' : 'border-gray-700 hover:border-yellow-500'}`}>
          <i className="fa-solid fa-magnifying-glass-chart text-4xl text-yellow-500 mb-4 group-hover:scale-110 transition-transform"></i>
          <h3 className="text-xl font-bold">Google Intelligence</h3>
          <p className="text-sm text-gray-400 mt-2">IA encontra as palavras-chave mais baratas e otimiza seu site para o topo do Google.</p>
          <button 
            onClick={() => selectTool('SEO', 'Liste 10 palavras-chave de baixa concorrência e alto volume para uma empresa de consultoria comercial em São Paulo.')}
            className="mt-6 w-full py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-bold transition-colors"
          >
            Otimizar SEO
          </button>
        </div>
      </div>

      {/* Área de Prompt da IA */}
      <div ref={commandRef} className={`mt-10 p-8 rounded-2xl border transition-all shadow-2xl ${
        selectedTool === 'EMAIL' ? 'bg-cyan-950/20 border-cyan-500/50' : 
        selectedTool === 'POST' ? 'bg-pink-950/20 border-pink-500/50' : 
        selectedTool === 'SEO' ? 'bg-yellow-950/20 border-yellow-500/50' : 
        'bg-slate-900 border-slate-700'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-slate-900 ${
              selectedTool === 'EMAIL' ? 'bg-cyan-500' : 
              selectedTool === 'POST' ? 'bg-pink-500' : 
              selectedTool === 'SEO' ? 'bg-yellow-500' : 
              'bg-slate-500'
            }`}>
              <i className="fa-solid fa-bolt"></i>
            </div>
            <h4 className="text-lg font-bold text-white uppercase tracking-tighter">
              {selectedTool === 'GENERAL' ? 'Central de Comando' : `Nexus AI: Mode ${selectedTool}`}
            </h4>
          </div>
          {selectedTool !== 'GENERAL' && (
            <button onClick={() => setSelectedTool('GENERAL')} className="text-xs text-gray-500 hover:text-white uppercase font-black tracking-widest">Resetar modo</button>
          )}
        </div>
        
        <textarea 
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Descreva seu objetivo de marketing aqui..."
          className="w-full bg-gray-950 border border-gray-800 rounded-xl p-6 text-white text-lg focus:ring-2 ring-opacity-50 ring-cyan-500 outline-none transition-all placeholder:text-gray-700 min-h-[120px]"
        />
        
        <div className="flex justify-between items-center mt-6">
          <div className="flex gap-4">
             <div className="flex items-center gap-2 px-3 py-1 bg-gray-950 rounded-full border border-gray-800">
                <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-[10px] text-gray-500 font-bold uppercase">Gemini Flash active</span>
             </div>
             {selectedTool === 'POST' && (
                <div className="flex items-center gap-2 px-3 py-1 bg-pink-950/30 rounded-full border border-pink-800/50">
                   <i className="fa-solid fa-image text-[10px] text-pink-500"></i>
                   <span className="text-[10px] text-pink-500 font-bold uppercase">Multimodal Enabled</span>
                </div>
             )}
          </div>
          <button 
            onClick={handleGenerate}
            disabled={loading || !prompt}
            className={`font-black py-4 px-12 rounded-full hover:scale-105 active:scale-95 transition-all shadow-lg disabled:opacity-50 flex items-center gap-3 ${
              selectedTool === 'POST' ? 'bg-pink-600 text-white shadow-pink-900/20' : 'bg-cyan-500 text-gray-900 shadow-cyan-500/20'
            }`}
          >
            {loading ? <i className="fa-solid fa-circle-notch animate-spin"></i> : <i className="fa-solid fa-wand-sparkles"></i>}
            {loading ? "PROCESSANDO..." : "EXECUTAR ESTRATÉGIA"}
          </button>
        </div>

        {/* Resultados Expandidos */}
        {(aiResponse || generatedImage) && (
          <div className="mt-10 grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
            {/* Texto gerado */}
            <div className={`p-8 rounded-2xl border ${selectedTool === 'POST' ? 'lg:col-span-1' : 'lg:col-span-2'} bg-gray-950 border-gray-800 shadow-inner`}>
              <div className="flex justify-between items-center mb-6 border-b border-gray-800 pb-4">
                <span className="text-xs font-black text-cyan-500 uppercase tracking-widest">Relatório Estratégico Nexus</span>
                <div className="flex gap-2">
                  <button onClick={() => navigator.clipboard.writeText(aiResponse)} className="p-2 text-gray-600 hover:text-white transition-colors">
                    <i className="fa-regular fa-copy"></i>
                  </button>
                </div>
              </div>
              <div className="prose prose-invert max-w-none text-gray-300 leading-relaxed text-sm whitespace-pre-wrap font-sans">
                {aiResponse}
              </div>
            </div>

            {/* Imagem gerada (Apenas para Post) */}
            {generatedImage && (
              <div className="p-4 rounded-2xl border bg-gray-950 border-gray-800 flex flex-col items-center">
                <span className="text-[10px] font-black text-pink-500 uppercase tracking-widest mb-4 self-start ml-2">Sugestão de Arte Multimodal</span>
                <div className="relative group overflow-hidden rounded-xl border border-gray-800 w-full aspect-square">
                  <img src={generatedImage} alt="IA Generated" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button 
                      onClick={() => {
                        const link = document.createElement('a');
                        link.href = generatedImage;
                        link.download = 'nexus-marketing-post.png';
                        link.click();
                      }}
                      className="bg-white text-black p-4 rounded-full font-bold shadow-2xl transform scale-75 group-hover:scale-100 transition-transform"
                    >
                      DOWNLOAD HD
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default MarketingAI;
