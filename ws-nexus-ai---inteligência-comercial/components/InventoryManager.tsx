
import React, { useState, useMemo } from 'react';
import { ProductItem } from '../types';

interface InventoryManagerProps {
  items: ProductItem[];
  setItems: React.Dispatch<React.SetStateAction<ProductItem[]>>;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ items, setItems }) => {
  const [costInput, setCostInput] = useState<number>(0);
  const [expensesInput, setExpensesInput] = useState<number>(15);
  const [profitInput, setProfitInput] = useState<number>(30);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState('Todas');
  const [isProcessingAI, setIsProcessingAI] = useState(false);

  const [newProduct, setNewProduct] = useState({
    name: '',
    category: 'Software',
    group: 'WS Tecnologia',
    cost: 0,
    stock: '∞' as number | '∞',
  });

  const calculateMarkupPrice = (cost: number, exp: number, prof: number) => {
    if (cost <= 0) return 0;
    const margin = (exp + prof) / 100;
    if (margin >= 1) return cost * 2;
    return cost / (1 - margin);
  };

  const suggestedPrice = useMemo(() => 
    calculateMarkupPrice(costInput, expensesInput, profitInput), 
    [costInput, expensesInput, profitInput]
  );

  const filteredItems = useMemo(() => {
    if (categoryFilter === 'Todas') return items;
    return items.filter(item => item.category === categoryFilter);
  }, [items, categoryFilter]);

  const totalPatrimony = useMemo(() => {
    return items.reduce((acc, item) => {
      const stockNum = typeof item.stock === 'number' ? item.stock : 100;
      return acc + (item.cost * stockNum);
    }, 0);
  }, [items]);

  const handleLaunchProduct = async () => {
    if (!newProduct.name || newProduct.cost <= 0) {
      alert("Por favor, preencha o nome e o custo do produto.");
      return;
    }

    setIsProcessingAI(true);
    await new Promise(resolve => setTimeout(resolve, 1500));

    const finalPrice = calculateMarkupPrice(newProduct.cost, expensesInput, profitInput);
    const finalMarkup = Math.round(((finalPrice / newProduct.cost) - 1) * 100);

    // Fix: Added organizationId and customAttributes
    const newItem: ProductItem = {
      id: (items.length + 1).toString(),
      organizationId: 'ORG-WS-001',
      name: newProduct.name,
      category: newProduct.category,
      group: newProduct.category === 'Software' ? 'WS Tecnologia' : 'Operacional',
      cost: newProduct.cost,
      markup: finalMarkup,
      price: finalPrice,
      stock: newProduct.stock,
      status: 'ATIVO',
      customAttributes: {}
    };

    setItems([newItem, ...items]);
    setIsProcessingAI(false);
    setIsModalOpen(false);
    setNewProduct({ name: '', category: 'Software', group: 'WS Tecnologia', cost: 0, stock: '∞' });
  };

  const applyMarkupToForm = () => {
    if (costInput > 0) {
      setNewProduct(prev => ({ ...prev, cost: costInput }));
      setIsModalOpen(true);
    } else {
      alert("Defina um custo na calculadora antes de aplicar.");
    }
  };

  return (
    <div className="space-y-8 animate-fadeIn pb-12">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-gray-800/60 p-6 rounded-[2.5rem] border border-gray-700 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest mb-1">Patrimônio em Estoque</p>
          <h3 className="text-3xl font-black text-white leading-none">R$ {totalPatrimony.toLocaleString('pt-BR')}</h3>
        </div>
        <div className="bg-gray-800/60 p-6 rounded-[2.5rem] border border-gray-700 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] text-orange-500 uppercase font-black tracking-widest mb-1">Giro de Estoque</p>
          <h3 className="text-3xl font-black text-orange-400 leading-none">1.8x</h3>
        </div>
        <div className="bg-gray-800/60 p-6 rounded-[2.5rem] border border-gray-700 shadow-2xl backdrop-blur-md">
          <p className="text-[10px] text-cyan-500 uppercase font-black tracking-widest mb-1">Itens Cadastrados</p>
          <h3 className="text-3xl font-black text-cyan-400 leading-none">{items.length}</h3>
        </div>
        <div className="flex flex-col gap-2">
          <button onClick={() => setIsModalOpen(true)} className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-gray-950 font-black rounded-[1.5rem] transition-all flex items-center justify-center gap-2">
            <i className="fa-solid fa-plus-circle text-xl"></i> CADASTRAR ITEM
          </button>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8">
        <div className="flex-grow bg-gray-900/40 rounded-[3rem] border border-gray-800 overflow-hidden shadow-2xl flex flex-col">
          <div className="p-8 bg-gray-800/30 border-b border-gray-800 flex flex-wrap gap-4 items-center">
            <h3 className="text-xl font-black text-white uppercase tracking-tighter mr-6">Inventário Estratégico</h3>
            <div className="flex gap-2">
              {['Todas', 'Software', 'Hardware', 'Serviço'].map(cat => (
                <button key={cat} onClick={() => setCategoryFilter(cat)} className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest transition-all border ${categoryFilter === cat ? 'bg-cyan-600 text-white border-cyan-500 shadow-lg shadow-cyan-900/40' : 'bg-gray-950 text-gray-500 border-gray-800 hover:border-gray-600'}`}>
                  {cat}
                </button>
              ))}
            </div>
          </div>
          <div className="flex-grow overflow-x-auto custom-scrollbar">
            <table className="w-full text-left">
              <thead className="bg-gray-900/80 text-[10px] text-gray-500 font-black uppercase tracking-[0.2em] border-b border-gray-800">
                <tr>
                  <th className="p-8">Solução / Grupo</th>
                  <th className="p-8 text-right">Custo</th>
                  <th className="p-8 text-center">Markup</th>
                  <th className="p-8 text-right">Venda</th>
                  <th className="p-8 text-center">Qtd. Estoque</th>
                  <th className="p-8 text-center">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800/50">
                {filteredItems.map(item => (
                  <tr key={item.id} className="hover:bg-cyan-500/5 transition-colors group">
                    <td className="p-8">
                      <p className="font-black text-white text-lg group-hover:text-cyan-400 transition-colors leading-none">{item.name}</p>
                      <p className="text-[10px] text-gray-500 font-black uppercase mt-2 tracking-widest">{item.category}</p>
                    </td>
                    <td className="p-8 text-right font-mono text-gray-400">R$ {item.cost.toLocaleString('pt-BR')}</td>
                    <td className="p-8 text-center">
                       <span className="text-xs font-black text-emerald-500 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">{item.markup}%</span>
                    </td>
                    <td className="p-8 text-right font-black text-white text-xl font-mono tracking-tighter">R$ {item.price.toLocaleString('pt-BR')}</td>
                    <td className="p-8 text-center">
                       <span className="text-sm font-black text-gray-400">{item.stock}</span>
                    </td>
                    <td className="p-8">
                      <div className="flex justify-center">
                        <span className={`px-4 py-1 rounded-full text-[9px] font-black border uppercase tracking-widest ${item.status === 'ATIVO' ? 'bg-green-500/10 text-green-500 border-green-500/30' : item.status === 'BAIXO' ? 'bg-orange-500/10 text-orange-500 border-orange-500/30' : 'bg-red-500/10 text-red-500 border-red-500/30'}`}>
                          {item.status}
                        </span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="xl:w-96 space-y-8">
          <div className="bg-gray-800/60 p-8 rounded-[3rem] border border-gray-700 shadow-2xl relative overflow-hidden group">
            <h4 className="text-cyan-400 font-black uppercase text-xs tracking-widest mb-8 flex items-center gap-3">
              <i className="fa-solid fa-calculator-combined text-lg"></i> Calculadora Markup IA
            </h4>
            <div className="space-y-6">
              <div>
                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Preço de Custo</label>
                <div className="relative">
                   <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-700 font-black">R$</span>
                   <input type="number" value={costInput || ''} onChange={(e) => setCostInput(Number(e.target.value))} className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-2xl p-4 pl-12 text-white font-black outline-none transition-all" placeholder="0,00" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Despesas (%)</label>
                  <input type="number" value={expensesInput} onChange={(e) => setExpensesInput(Number(e.target.value))} className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-2xl p-4 text-white font-black outline-none transition-all" />
                </div>
                <div>
                  <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest block mb-2">Lucro (%)</label>
                  <input type="number" value={profitInput} onChange={(e) => setProfitInput(Number(e.target.value))} className="w-full bg-gray-950 border border-gray-800 focus:border-cyan-500 rounded-2xl p-4 text-white font-black outline-none transition-all" />
                </div>
              </div>
              <div className="p-8 bg-cyan-500/5 border border-cyan-500/20 rounded-[2.5rem] shadow-inner text-center mt-6">
                <p className="text-[10px] text-cyan-500 uppercase font-black tracking-[0.3em] mb-3">Preço Sugerido</p>
                <h2 className="text-5xl font-black text-white font-mono leading-none tracking-tighter">R$ {suggestedPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
              </div>
            </div>
            <button onClick={applyMarkupToForm} className="w-full mt-8 py-4 bg-gray-900 hover:bg-gray-850 text-cyan-400 font-black text-[10px] uppercase tracking-widest rounded-2xl border border-gray-800 transition-all active:scale-95">APLICAR AO CADASTRO</button>
          </div>
        </div>
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[500] flex items-center justify-center p-4">
           <div className="bg-gray-900 border border-gray-800 rounded-[3rem] w-full max-w-2xl shadow-2xl overflow-hidden animate-fadeIn">
              <div className="p-8 bg-gray-800/50 flex justify-between items-center border-b border-gray-800">
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">Novo Item Nexus AI</h3>
                <button onClick={() => setIsModalOpen(false)} className="text-gray-500 hover:text-white text-3xl transition-transform hover:rotate-90"><i className="fa-solid fa-xmark"></i></button>
              </div>
              <div className="p-10 space-y-8">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Nome</label>
                       <input type="text" value={newProduct.name} onChange={e => setNewProduct({...newProduct, name: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-cyan-500" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Categoria</label>
                       <select value={newProduct.category} onChange={e => setNewProduct({...newProduct, category: e.target.value})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-cyan-500">
                          <option value="Software">Software</option>
                          <option value="Hardware">Hardware</option>
                          <option value="Serviço">Serviço</option>
                       </select>
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Custo</label>
                       <input type="number" value={newProduct.cost || ''} onChange={e => setNewProduct({...newProduct, cost: Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-cyan-500" />
                    </div>
                    <div className="space-y-2">
                       <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-2">Estoque</label>
                       <input type="text" value={newProduct.stock} onChange={e => setNewProduct({...newProduct, stock: e.target.value === '∞' ? '∞' : Number(e.target.value)})} className="w-full bg-gray-950 border border-gray-800 rounded-2xl p-4 text-white outline-none focus:border-cyan-500" />
                    </div>
                 </div>
                 <button disabled={isProcessingAI} onClick={handleLaunchProduct} className="w-full py-6 bg-cyan-600 hover:bg-cyan-500 text-white font-black text-lg rounded-3xl shadow-xl transition-all">
                    {isProcessingAI ? 'PROCESSANDO...' : 'LANÇAR NO ECOSSISTEMA'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
};

export default InventoryManager;