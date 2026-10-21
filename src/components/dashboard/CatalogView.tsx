import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import {
  Plus,
  Search,
  Cake,
  Tag,
  Check,
  X,
  Clock,
  Edit2,
  Share2,
  Copy,
  ExternalLink,
  MessageCircle,
  QrCode,
  Sparkles,
} from 'lucide-react';
import { Product } from '../../types';

export const CatalogView: React.FC = () => {
  const {
    products,
    addProduct,
    updateProduct,
    toggleProductStatus,
    storeProfile,
    setViewMode,
    showToast,
  } = useComfy();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // New product form state
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('Brigadeiros');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdUnit, setNewProdUnit] = useState('unidade');
  const [newProdDesc, setNewProdDesc] = useState('');
  const [newProdPrepTime, setNewProdPrepTime] = useState('4');
  const [newProdEmoji, setNewProdEmoji] = useState('🧁');

  const categories = ['all', 'Brigadeiros', 'Bolos & Tortas', 'Doces Finos', 'Cookies'];

  // Public status URL
  const publicMenuSlug = storeProfile.name.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const publicMenuUrl = `https://comfy.app/cardapio/${publicMenuSlug}`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(publicMenuUrl);
    setCopiedLink(true);
    showToast('Link do cardápio copiado para a área de transferência! ✨');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleCopyTemplate = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Texto para o Status copiado com sucesso! 📲');
  };

  const statusTemplates = [
    {
      title: '🍰 Encomendas Abertas para o Fim de Semana',
      text: `✨ Oi gente! Nosso cardápio de doces artesanais atualizado já está no ar!\n\nAcesse pelo link, escolha seus sabores favoritos e confirme seu pedido direto pelo WhatsApp:\n👉 ${publicMenuUrl}\n\nFaça sua reserva antes que esgote! 🧁`,
    },
    {
      title: '🎂 Bentô Cakes & Doces a Pronta Entrega',
      text: `🍓 Doces fresquinhos saindo da cozinha hoje! Bentô Cakes personalizados e caixas de brigadeiros gourmet.\n\nConfira os sabores e preços no nosso cardápio digital:\n👉 ${publicMenuUrl}`,
    },
    {
      title: '🍫 Caixa de Doces Finos & Presentes',
      text: `Surpreenda quem você ama com nossos doces artesanais embalados para presente! 🎁\n\nConsulte o cardápio completo:\n👉 ${publicMenuUrl}`,
    },
  ];

  const filteredProducts = products.filter((p) => {
    const matchesCategory = selectedCategory === 'all' || p.category === selectedCategory;
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.description.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newProdName.trim() || !newProdPrice) return;

    addProduct({
      name: newProdName.trim(),
      category: newProdCategory,
      price: parseFloat(newProdPrice.replace(',', '.')) || 10,
      unit: newProdUnit,
      description: newProdDesc.trim(),
      prepTimeHours: parseInt(newProdPrepTime, 10) || 4,
      active: true,
      emoji: newProdEmoji,
    });

    // Reset
    setNewProdName('');
    setNewProdPrice('');
    setNewProdDesc('');
    setIsAddModalOpen(false);
  };

  const handleSaveEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    updateProduct(editingProduct);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
            Catálogo de Doces & Produtos
          </h1>
          <p className="text-xs text-[#7C6E68] mt-0.5">
            Gerencie o cardápio, preços unitários e tempo de preparo de cada doce.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px] shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D07A6D]" />
          <span>+ Novo doce no cardápio</span>
        </button>
      </div>

      {/* WhatsApp Status & Public Menu Link Banner */}
      <div className="bg-gradient-to-r from-[#FAF4EB] to-[#FDFBF7] p-4 sm:p-5 rounded-2xl border border-[#E8DCCB] shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-[#D07A6D] text-white flex items-center justify-center font-bold text-lg shrink-0 shadow-xs">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#D07A6D]">
                • Divulgação Rápida
              </span>
              <span className="text-[9px] sm:text-[10px] bg-emerald-100 text-emerald-800 font-semibold px-2 py-0.5 rounded-full">
                Pronto para postar
              </span>
            </div>
            <h3 className="text-sm sm:text-base font-serif font-bold text-[#231818] mt-0.5">
              Link do Cardápio para o Status do WhatsApp & Stories
            </h3>
            <p className="text-xs text-[#7C6E68] mt-0.5 max-w-xl">
              Poste este link no status para seus clientes escolherem os doces e enviarem o pedido pronto no seu WhatsApp.
            </p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row flex-wrap items-stretch sm:items-center gap-2">
          {/* Link box with inline copy button */}
          <div className="flex items-center justify-between bg-white px-3 py-2 rounded-xl border border-[#E8DCCB] text-xs font-mono text-[#231818] min-h-[40px]">
            <span className="max-w-[200px] truncate text-[#7C6E68]">
              {publicMenuUrl}
            </span>
            <button
              onClick={handleCopyLink}
              className="text-[#D07A6D] hover:text-[#2B1D1D] font-bold text-xs pl-2 cursor-pointer flex items-center gap-1"
            >
              {copiedLink ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copiedLink ? 'Copiado!' : 'Copiar'}</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Share / Post on Status Modal Trigger */}
            <button
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white transition-all shadow-xs cursor-pointer min-h-[42px]"
            >
              <MessageCircle className="w-4 h-4 text-[#D07A6D]" />
              <span>Postar no Status</span>
            </button>

            {/* Preview Public Menu */}
            <button
              onClick={() => setViewMode('public-menu')}
              className="flex-1 sm:flex-none inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 text-xs font-semibold rounded-xl bg-[#D07A6D]/15 hover:bg-[#D07A6D]/25 text-[#D07A6D] transition-colors cursor-pointer min-h-[42px]"
              title="Ver como seus clientes veem o cardápio"
            >
              <span>Ver Cardápio</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Categories & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EFE8DE]">
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#2B1D1D] text-white'
                  : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
              }`}
            >
              {cat === 'all' ? `Todos (${products.length})` : cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#7C6E68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por doce ou sabor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
          />
        </div>
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProducts.map((prod) => (
          <div
            key={prod.id}
            className={`bg-white rounded-2xl p-5 border transition-all flex flex-col justify-between ${
              prod.active
                ? 'border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40'
                : 'border-[#EFE8DE]/60 opacity-60 bg-[#FBF8F3]'
            }`}
          >
            <div>
              <div className="flex items-start justify-between gap-3">
                <div className="w-12 h-12 rounded-2xl bg-[#F8F4EE] flex items-center justify-center text-2xl shrink-0 shadow-2xs">
                  {prod.emoji || '🧁'}
                </div>

                <div className="flex items-center gap-1.5">
                  {prod.tag && (
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-[#D07A6D]/15 text-[#D07A6D]">
                      {prod.tag}
                    </span>
                  )}
                  <button
                    onClick={() => setEditingProduct(prod)}
                    className="p-1.5 text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3] rounded-lg transition-colors"
                    title="Editar doce"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-3">
                <span className="text-[11px] text-[#7C6E68] font-medium">{prod.category}</span>
                <h3 className="text-base font-bold text-[#231818] mt-0.5">{prod.name}</h3>
                <p className="text-xs text-[#7C6E68] mt-1.5 line-clamp-2 leading-relaxed">
                  {prod.description}
                </p>
              </div>

              <div className="mt-4 flex items-center gap-2 text-xs text-[#7C6E68]">
                <Clock className="w-3.5 h-3.5 text-[#D07A6D]" />
                <span>Preparo: ~{prod.prepTimeHours}h</span>
                <span>·</span>
                <span>{prod.unit}</span>
              </div>
            </div>

            <div className="pt-4 mt-4 border-t border-[#EFE8DE] flex items-center justify-between">
              <div>
                <span className="text-[10px] text-[#7C6E68] block">Preço</span>
                <span className="text-lg font-serif font-bold text-[#231818] tabular-nums">
                  R$ {prod.price.toFixed(2).replace('.', ',')}
                </span>
              </div>

              <button
                onClick={() => toggleProductStatus(prod.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                  prod.active
                    ? 'bg-[#F8F4EE] hover:bg-[#EFE8DE] text-[#231818]'
                    : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100'
                }`}
              >
                {prod.active ? 'Pausar Doce' : 'Reativar Doce'}
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal Novo Doce */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[88vh] bg-white rounded-2xl shadow-xl border border-[#EFE8DE] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3] shrink-0">
              <h3 className="text-base font-serif font-bold text-[#231818]">Adicionar Novo Doce</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-xl hover:bg-[#EFE8DE]/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                <div className="grid grid-cols-4 gap-3">
                  <div className="col-span-1">
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Ícone</label>
                    <input
                      type="text"
                      value={newProdEmoji}
                      onChange={(e) => setNewProdEmoji(e.target.value)}
                      className="w-full text-center text-xl py-1.5 bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D]"
                    />
                  </div>
                  <div className="col-span-3">
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Nome do Doce</label>
                    <input
                      type="text"
                      required
                      placeholder="Ex: Torta Banoffee Artesanal"
                      value={newProdName}
                      onChange={(e) => setNewProdName(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D]"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Categoria</label>
                    <select
                      value={newProdCategory}
                      onChange={(e) => setNewProdCategory(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    >
                      <option value="Brigadeiros">Brigadeiros</option>
                      <option value="Bolos & Tortas">Bolos & Tortas</option>
                      <option value="Doces Finos">Doces Finos</option>
                      <option value="Cookies">Cookies</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Preço (R$)</label>
                    <input
                      type="text"
                      required
                      placeholder="48,00"
                      value={newProdPrice}
                      onChange={(e) => setNewProdPrice(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Unidade / Porção</label>
                    <input
                      type="text"
                      placeholder="Ex: caixa c/ 12, aro 20cm"
                      value={newProdUnit}
                      onChange={(e) => setNewProdUnit(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Tempo Preparo (h)</label>
                    <input
                      type="number"
                      value={newProdPrepTime}
                      onChange={(e) => setNewProdPrepTime(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Descrição e Ingredientes</label>
                  <textarea
                    rows={2}
                    placeholder="Descreva os sabores, recheios e diferenciais..."
                    value={newProdDesc}
                    onChange={(e) => setNewProdDesc(e.target.value)}
                    className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                  />
                </div>
              </div>

              <div className="px-5 py-3 flex items-center justify-end gap-2.5 border-t border-[#EFE8DE] bg-[#FBF8F3] shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#7C6E68]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B]"
                >
                  Salvar no Catálogo
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Doce */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[88vh] bg-white rounded-2xl shadow-xl border border-[#EFE8DE] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3] shrink-0">
              <h3 className="text-base font-serif font-bold text-[#231818]">Editar Doce</h3>
              <button
                onClick={() => setEditingProduct(null)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-xl hover:bg-[#EFE8DE]/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveEdit} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Nome do Doce</label>
                  <input
                    type="text"
                    required
                    value={editingProduct.name}
                    onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                    className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Preço (R$)</label>
                    <input
                      type="number"
                      step="0.5"
                      value={editingProduct.price}
                      onChange={(e) =>
                        setEditingProduct({
                          ...editingProduct,
                          price: parseFloat(e.target.value) || 0,
                        })
                      }
                      className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Unidade</label>
                    <input
                      type="text"
                      value={editingProduct.unit}
                      onChange={(e) => setEditingProduct({ ...editingProduct, unit: e.target.value })}
                      className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">Descrição</label>
                  <textarea
                    rows={2}
                    value={editingProduct.description}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, description: e.target.value })
                    }
                    className="w-full px-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                  />
                </div>
              </div>

              <div className="px-5 py-3 flex items-center justify-end gap-2.5 border-t border-[#EFE8DE] bg-[#FBF8F3] shrink-0">
                <button
                  type="button"
                  onClick={() => setEditingProduct(null)}
                  className="px-3.5 py-1.5 text-xs font-medium text-[#7C6E68]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B]"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Compartilhar no Status do WhatsApp */}
      {isShareModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="px-6 py-5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3]">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
                  <MessageCircle className="w-5 h-5 text-emerald-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D]">
                    • Divulgar Cardápio
                  </span>
                  <h3 className="text-lg font-serif font-bold text-[#231818]">
                    Postar Link no Status do WhatsApp
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setIsShareModalOpen(false)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-xl hover:bg-[#EFE8DE]/60"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 overflow-y-auto">
              {/* Direct Link Box */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] block mb-2">
                  Seu Link do Cardápio Digital
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    readOnly
                    value={publicMenuUrl}
                    className="w-full px-3.5 py-2.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl text-[#231818] font-mono select-all"
                  />
                  <button
                    onClick={handleCopyLink}
                    className="px-4 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold flex items-center gap-1.5 shrink-0 transition-colors shadow-xs"
                  >
                    {copiedLink ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedLink ? 'Copiado' : 'Copiar'}</span>
                  </button>
                </div>
              </div>

              {/* Ready-to-use Status Captions */}
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] block mb-2">
                  Textos Prontos para Copiar e Postar nos Status / Stories
                </label>
                <div className="space-y-3">
                  {statusTemplates.map((template, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE] hover:border-[#D07A6D]/40 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-[#231818]">{template.title}</span>
                        <button
                          onClick={() => handleCopyTemplate(template.text)}
                          className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D07A6D] hover:underline cursor-pointer"
                        >
                          <Copy className="w-3 h-3" />
                          <span>Copiar texto</span>
                        </button>
                      </div>
                      <p className="text-xs text-[#7C6E68] whitespace-pre-line leading-relaxed font-sans">
                        {template.text}
                      </p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Direct WhatsApp Share */}
              <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold shrink-0">
                    <Share2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-950">
                      Compartilhar direto para contatos
                    </h4>
                    <p className="text-[11px] text-emerald-800">
                      Abre o WhatsApp com mensagem e link pré-preenchidos.
                    </p>
                  </div>
                </div>

                <a
                  href={`https://wa.me/?text=${encodeURIComponent(statusTemplates[0].text)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors flex items-center justify-center gap-1.5 shadow-xs shrink-0"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Enviar no WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-[#EFE8DE] bg-[#FBF8F3] flex items-center justify-between">
              <button
                onClick={() => {
                  setIsShareModalOpen(false);
                  setViewMode('public-menu');
                }}
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#D07A6D] hover:underline cursor-pointer"
              >
                <span>Testar como cliente ↗</span>
              </button>

              <button
                onClick={() => setIsShareModalOpen(false)}
                className="px-5 py-2 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B]"
              >
                Fechar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
