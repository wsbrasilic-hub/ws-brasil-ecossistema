
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ProductItem } from '../types';
import { generateStockClearanceCampaign } from '../services/geminiService';

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  category: string;
}

interface GestaoPDVProps {
  inventoryItems: ProductItem[];
  onVendaFinalizada: (soldItems: { id: string, quantity: number }[]) => void;
}

const GestaoPDV: React.FC<GestaoPDVProps> = ({ inventoryItems, onVendaFinalizada }) => {
  const [mode, setMode] = useState<'PDV' | 'ERP'>('PDV');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isFinishing, setIsFinishing] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [cpf, setCpf] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'DINHEIRO' | 'CREDITO' | 'DEBITO' | 'PIX' | null>(null);
  
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [lastReceipt, setLastReceipt] = useState<any>(null);
  const [isGeneratingOffer, setIsGeneratingOffer] = useState(false);
  const [showOfferModal, setShowOfferModal] = useState(false);
  const [offerCampaignText, setOfferCampaignText] = useState('');

  const searchInputRef = useRef<HTMLInputElement>(null);

  const subtotal = useMemo(() => cart.reduce((acc, item) => acc + (item.price * item.quantity), 0), [cart]);
  const total = Math.max(0, subtotal - discount);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (mode !== 'PDV') return;
      if (e.key === 'F5' && cart.length > 0) {
        e.preventDefault();
        setShowPaymentModal(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mode, cart]);

  const addToCart = (product: ProductItem) => {
    if (product.stock !== '∞' && product.stock <= 0) {
      alert("ATENÇÃO: Produto indisponível no estoque.");
      return;
    }
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        if (product.stock !== '∞' && existing.quantity >= (product.stock as number)) {
          alert("Limite de estoque atingido para este item.");
          return prev;
        }
        return prev.map(item => item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item);
      }
      return [...prev, { id: product.id, name: product.name, price: product.price, category: product.category, quantity: 1 }];
    });
    setSearchTerm('');
    searchInputRef.current?.focus();
  };

  const updateQuantity = (id: string, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const product = inventoryItems.find(p => p.id === id);
        const newQty = Math.max(0, item.quantity + delta);
        if (product && product.stock !== '∞' && newQty > (product.stock as number)) return item;
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const finalizePayment = async (method: 'DINHEIRO' | 'CREDITO' | 'DEBITO' | 'PIX') => {
    setIsFinishing(true);
    setShowPaymentModal(false);
    
    // Simulação de processamento financeiro
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const receiptData = {
      id: `WS-${Date.now().toString().slice(-6)}`,
      date: new Date().toLocaleString('pt-BR'),
      items: [...cart],
      total,
      paymentMethod: method,
    };

    // Atualiza estoque global
    onVendaFinalizada(cart.map(i => ({ id: i.id, quantity: i.quantity })));
    
    setLastReceipt(receiptData);
    setCart([]);
    setIsFinishing(false);
    setShowReceiptModal(true);
  };

  const filteredProducts = useMemo(() => {
    if (!searchTerm) return [];
    const t = searchTerm.toLowerCase().trim();
    return inventoryItems.filter(p => p.name.toLowerCase().includes(t) || p.id === t).slice(0, 5);
  }, [searchTerm, inventoryItems]);

  return (
    <div className="space-y-6 animate-fadeIn pb-12">
      <div className="flex bg-gray-800 p-1.5 rounded-2xl w-fit border border-gray-700 shadow-xl">
        <button onClick={() => setMode('PDV')} className={`px-10 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-3 ${mode === 'PDV' ? 'bg-cyan-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
          <i className="fa-solid fa-cash-register"></i> TERMINAL PDV
        </button>
        <button onClick={() => setMode('ERP')} className={`px-10 py-3 rounded-xl font-black text-xs transition-all flex items-center gap-3 ${mode === 'ERP' ? 'bg-indigo-600 text-white shadow-lg' : 'text-gray-500 hover:text-gray-300'}`}>
          <i className="fa-solid fa-brain"></i> NEXUS INTELLIGENCE
        </button>
      </div>

      {mode === 'PDV' ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 h-[calc(100vh-280px)]">
          {/* Área de Seleção */}
          <div className="lg:col-span-2 bg-gray-900/50 rounded-[3rem] border border-gray-800 flex flex-col overflow-hidden relative shadow-2xl">
             <div className="p-8 bg-gray-800/20 border-b border-gray-800">
                <div className="relative">
                  <i className="fa-solid fa-magnifying-glass absolute left-6 top-1/2 -translate-y-1/2 text-gray-500 text-2xl"></i>
                  <input 
                    ref={searchInputRef}
                    type="text" 
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    placeholder="Nome do produto ou código de barras..."
                    className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-[2rem] py-6 pl-16 pr-6 text-2xl text-white font-bold outline-none"
                  />
                </div>
                {filteredProducts.length > 0 && (
                  <div className="absolute top-full left-0 w-full mt-2 bg-gray-900 border border-gray-700 rounded-3xl shadow-2xl z-50 overflow-hidden">
                    {filteredProducts.map(p => (
                      <button key={p.id} onClick={() => addToCart(p)} className="w-full p-6 text-left hover:bg-cyan-500/10 border-b border-gray-800 flex justify-between items-center group">
                        <div>
                          <p className="font-black text-white text-lg group-hover:text-cyan-400">{p.name}</p>
                          <p className="text-[10px] text-gray-500 font-bold uppercase">Disponível: {p.stock}</p>
                        </div>
                        <span className="text-2xl font-black text-emerald-400 font-mono">R$ {p.price.toLocaleString('pt-BR')}</span>
                      </button>
                    ))}
                  </div>
                )}
             </div>

             <div className="flex-grow overflow-y-auto p-8 space-y-4 custom-scrollbar">
                {cart.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center opacity-10">
                    <i className="fa-solid fa-basket-shopping text-[10rem]"></i>
                    <p className="text-4xl font-black uppercase tracking-widest mt-6">Caixa Aberto</p>
                  </div>
                ) : (
                  cart.map(item => (
                    <div key={item.id} className="bg-gray-800/30 p-6 rounded-2xl border border-gray-700 flex justify-between items-center group">
                      <div className="flex items-center gap-6">
                        <div className="w-12 h-12 bg-gray-900 rounded-xl flex items-center justify-center font-black text-cyan-500 border border-gray-700">{item.quantity}</div>
                        <h4 className="font-bold text-white text-lg">{item.name}</h4>
                      </div>
                      <div className="flex items-center gap-8">
                        <span className="font-mono text-xl font-black text-white">R$ {(item.price * item.quantity).toLocaleString('pt-BR')}</span>
                        <button onClick={() => updateQuantity(item.id, -1)} className="text-gray-600 hover:text-red-500 transition-colors"><i className="fa-solid fa-trash-can"></i></button>
                      </div>
                    </div>
                  ))
                )}
             </div>

             <div className="p-10 bg-gray-950 border-t border-gray-800 flex justify-between items-center">
                <div className="text-right flex-grow">
                  <p className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-1">Valor Total</p>
                  <h2 className="text-7xl font-black text-white font-mono tracking-tighter">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
                </div>
                <button 
                  disabled={cart.length === 0}
                  onClick={() => setShowPaymentModal(true)}
                  className="bg-green-600 hover:bg-green-500 text-gray-900 px-16 py-8 rounded-[2rem] font-black text-2xl shadow-2xl ml-10 disabled:opacity-20 transition-all active:scale-95"
                >
                  FECHAR (F5)
                </button>
             </div>
          </div>

          {/* Painel lateral PDV */}
          <div className="bg-gray-800/40 rounded-[3rem] border border-gray-700 p-8 flex flex-col gap-6 shadow-xl">
             <div className="p-6 bg-gray-900 rounded-2xl border border-gray-700">
                <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4">Cliente / CPF</h4>
                <input type="text" placeholder="000.000.000-00" value={cpf} onChange={e => setCpf(e.target.value)} className="w-full bg-gray-950 border border-gray-800 rounded-xl p-3 text-white font-bold outline-none focus:border-cyan-500" />
             </div>
             <div className="flex-grow">
                <h4 className="text-[10px] text-gray-500 font-black uppercase tracking-widest mb-4 px-2">Atalhos Operacionais</h4>
                <div className="space-y-2">
                   <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg text-xs font-bold text-gray-400"><span>F1 - Pesquisa</span> <span className="text-gray-600">CMD</span></div>
                   <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg text-xs font-bold text-gray-400"><span>F3 - Desconto</span> <span className="text-gray-600">ALT</span></div>
                   <div className="flex justify-between p-3 bg-gray-800/50 rounded-lg text-xs font-bold text-gray-400"><span>ESC - Cancelar</span> <span className="text-gray-600">DEL</span></div>
                </div>
             </div>
          </div>
        </div>
      ) : (
        /* Modo Intelligence ERP */
        <div className="bg-gray-900/50 p-20 rounded-[4rem] border border-gray-700 text-center shadow-inner animate-fadeIn">
           <div className="w-32 h-32 bg-indigo-600/10 rounded-[2.5rem] flex items-center justify-center text-indigo-500 border border-indigo-500/20 mx-auto mb-8 animate-pulse">
              <i className="fa-solid fa-microchip text-6xl"></i>
           </div>
           <h3 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Nexus Intelligence Core</h3>
           <p className="text-gray-500 max-w-xl mx-auto mb-10 text-lg">O motor de IA da WS Brasil está monitorando métricas de markup, margem de contribuição e giro de estoque em tempo real.</p>
           <button className="bg-indigo-600 hover:bg-indigo-500 text-white font-black px-12 py-5 rounded-2xl shadow-xl shadow-indigo-900/30 transition-all flex items-center gap-4 mx-auto">
             <i className="fa-solid fa-chart-line"></i> GERAR RELATÓRIO DRE
           </button>
        </div>
      )}

      {/* Modais de Fechamento */}
      {showPaymentModal && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-3xl z-[500] flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-[3rem] w-full max-w-2xl overflow-hidden shadow-2xl">
             <div className="p-10 bg-gray-800/50 border-b border-gray-800 flex justify-between items-center">
                <h3 className="text-2xl font-black text-white uppercase">Meio de Pagamento</h3>
                <span className="text-emerald-500 font-black text-3xl font-mono">R$ {total.toLocaleString('pt-BR')}</span>
             </div>
             <div className="p-10 grid grid-cols-2 gap-6">
                {['PIX', 'DINHEIRO', 'CREDITO', 'DEBITO'].map(m => (
                  <button key={m} onClick={() => finalizePayment(m as any)} className="bg-gray-800 hover:bg-emerald-600/10 hover:border-emerald-500/50 p-10 rounded-3xl border border-gray-700 flex flex-col items-center gap-4 transition-all group">
                    <i className="fa-solid fa-hand-holding-dollar text-4xl text-gray-500 group-hover:text-emerald-500"></i>
                    <span className="font-black text-white uppercase tracking-widest">{m}</span>
                  </button>
                ))}
             </div>
          </div>
        </div>
      )}

      {isFinishing && (
        <div className="fixed inset-0 bg-black/98 backdrop-blur-2xl z-[1000] flex items-center justify-center">
          <div className="text-center">
            <div className="w-24 h-24 border-8 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto mb-8"></div>
            <h2 className="text-4xl font-black text-white uppercase tracking-[0.5em] animate-pulse">Processando Nexus...</h2>
          </div>
        </div>
      )}

      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #334155; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default GestaoPDV;
