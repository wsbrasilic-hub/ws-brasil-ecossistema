
import React, { useState, useEffect, useRef } from 'react';
import { GoogleGenAI } from "@google/genai";

interface Message {
  role: 'user' | 'model';
  text: string;
}

const NexusChat: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([
    { role: 'model', text: 'Saudações, Comandante. O terminal estratégico está online. Como posso otimizar seus lucros hoje?' }
  ]);
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;
    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
    setIsLoading(true);

    try {
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: userMsg,
        config: {
          systemInstruction: 'Você é o Nexus, o cérebro comercial da WS Brasil I.C. Responda de forma executiva, curta e direta.',
          temperature: 0.7,
        },
      });
      setMessages(prev => [...prev, { role: 'model', text: response.text || "Sem resposta." }]);
    } catch (error) {
      setMessages(prev => [...prev, { role: 'model', text: "Erro de conexão Nexus Core." }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-32 right-8 z-[2000] flex flex-col items-end gap-4">
      {isOpen && (
        <div className="w-[350px] md:w-[400px] h-[500px] bg-slate-900/95 border border-amber-500/20 rounded-[2.5rem] shadow-2xl flex flex-col overflow-hidden backdrop-blur-2xl animate-fadeIn">
          <div className="p-6 bg-amber-500/10 border-b border-white/5 flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-amber-500 flex items-center justify-center text-slate-950 font-black text-xs">NX</div>
              <h3 className="text-white font-black text-xs uppercase tracking-widest">Nexus Chat</h3>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-white"><i className="fa-solid fa-chevron-down"></i></button>
          </div>
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-4 bg-slate-950/20">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] p-4 rounded-2xl text-[11px] leading-relaxed ${msg.role === 'user' ? 'bg-amber-600 text-white' : 'bg-slate-800 text-slate-300 border border-slate-700'}`}>
                  {msg.text}
                </div>
              </div>
            ))}
          </div>
          <div className="p-4 bg-slate-900 border-t border-white/5">
            <div className="relative flex items-center">
              <input type="text" value={input} onChange={(e) => setInput(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSend()} placeholder="Comando estratégico..." className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-4 pr-12 text-xs text-white outline-none" />
              <button onClick={handleSend} disabled={isLoading || !input.trim()} className="absolute right-2 w-8 h-8 rounded-lg bg-amber-600 text-slate-950 flex items-center justify-center disabled:opacity-20"><i className="fa-solid fa-paper-plane text-xs"></i></button>
            </div>
          </div>
        </div>
      )}
      <button onClick={() => setIsOpen(!isOpen)} className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all shadow-2xl ${isOpen ? 'bg-amber-600' : 'bg-slate-900 border border-slate-800 hover:border-amber-500'}`}>
        <i className={`fa-solid ${isOpen ? 'fa-xmark text-slate-950' : 'fa-brain text-amber-500'} text-2xl`}></i>
      </button>
    </div>
  );
};

export default NexusChat;
