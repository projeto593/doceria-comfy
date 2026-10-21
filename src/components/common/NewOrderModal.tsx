import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { X, Plus, Minus, Cake, User, Phone, Calendar, Clock, DollarSign, FileText } from 'lucide-react';

export const NewOrderModal: React.FC = () => {
  const { isNewOrderModalOpen, setIsNewOrderModalOpen, products, customers, addOrder } = useComfy();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('Hoje às 16:30');
  const [deliveryType, setDeliveryType] = useState<'retirada' | 'entrega'>('retirada');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente' | '50_sinal'>('pago');
  const [notes, setNotes] = useState('');

  // Selected item map: productId -> quantity
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: number }>({
    'prod-1': 1,
  });

  if (!isNewOrderModalOpen) return null;

  const handleQuantityChange = (productId: string, delta: number) => {
    setSelectedItems((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const handleSelectCustomer = (custName: string) => {
    const cust = customers.find((c) => c.name === custName);
    if (cust) {
      setCustomerName(cust.name);
      setCustomerPhone(cust.phone);
    } else {
      setCustomerName(custName);
    }
  };

  const totalCalculated = Object.entries(selectedItems).reduce((acc, [prodId, qty]) => {
    const prod = products.find((p) => p.id === prodId);
    return acc + (prod ? prod.price * qty : 0);
  }, 0);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) return;

    const items = Object.entries(selectedItems).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    if (items.length === 0) {
      alert('Selecione ao menos um doce para o pedido.');
      return;
    }

    addOrder({
      customerName: customerName.trim(),
      customerPhone: customerPhone.trim() || '(11) 99999-0000',
      items,
      deliveryDate: deliveryDate || 'Hoje',
      deliveryType,
      paymentStatus,
      notes: notes.trim(),
    });

    // Reset fields
    setCustomerName('');
    setCustomerPhone('');
    setSelectedItems({ 'prod-1': 1 });
    setNotes('');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-2xl shadow-2xl border border-[#EFE8DE] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3]">
          <div>
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#D07A6D]">
              • Nova Encomenda
            </span>
            <h2 className="text-xl font-serif text-[#231818] font-bold">Criar Novo Pedido</h2>
          </div>
          <button
            onClick={() => setIsNewOrderModalOpen(false)}
            className="p-2 text-[#7C6E68] hover:text-[#231818] hover:bg-[#EFE8DE]/50 rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6 overflow-y-auto">
          {/* Cliente */}
          <div className="space-y-3">
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#D07A6D]" /> Dados do Cliente
            </label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <input
                  type="text"
                  required
                  placeholder="Nome do cliente (ex: Ana Martins)"
                  value={customerName}
                  onChange={(e) => handleSelectCustomer(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] focus:ring-1 focus:ring-[#D07A6D] text-[#231818]"
                />
                {/* Quick autocomplete chips */}
                <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-xs text-[#7C6E68]">
                  <span className="shrink-0 text-[11px]">Sugeridos:</span>
                  {customers.slice(0, 3).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => handleSelectCustomer(c.name)}
                      className="px-2 py-0.5 rounded-lg bg-[#F8F4EE] hover:bg-[#EFE8DE] text-[11px] font-medium text-[#231818] transition-colors shrink-0"
                    >
                      {c.name}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="WhatsApp / Telefone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] focus:ring-1 focus:ring-[#D07A6D] text-[#231818]"
                />
              </div>
            </div>
          </div>

          {/* Doces / Itens do Catálogo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-[#D07A6D]" /> Selecionar Doces do Catálogo
              </label>
              <span className="text-xs text-[#7C6E68]">
                {Object.keys(selectedItems).length} item(s) selecionado(s)
              </span>
            </div>

            <div className="space-y-2 border border-[#EFE8DE] rounded-xl p-3 bg-[#FBF8F3] max-h-52 overflow-y-auto">
              {products.map((prod) => {
                const qty = selectedItems[prod.id] || 0;
                return (
                  <div
                    key={prod.id}
                    className={`flex items-center justify-between p-2.5 rounded-xl border transition-colors ${
                      qty > 0
                        ? 'bg-white border-[#D07A6D]/40 shadow-xs'
                        : 'bg-white/60 border-transparent hover:bg-white'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xl p-1.5 rounded-lg bg-[#F8F4EE]">
                        {prod.emoji || '🧁'}
                      </span>
                      <div>
                        <p className="text-sm font-semibold text-[#231818]">{prod.name}</p>
                        <p className="text-xs text-[#7C6E68]">
                          R$ {prod.price.toFixed(2).replace('.', ',')} · {prod.unit}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-[#F8F4EE] px-2 py-1 rounded-lg">
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, -1)}
                            className="p-1 hover:bg-[#EFE8DE] rounded-md text-[#231818] transition-colors"
                          >
                            <Minus className="w-3.5 h-3.5" />
                          </button>
                          <span className="text-xs font-bold text-[#231818] w-4 text-center tabular-nums">
                            {qty}
                          </span>
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, 1)}
                            className="p-1 hover:bg-[#EFE8DE] rounded-md text-[#231818] transition-colors"
                          >
                            <Plus className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleQuantityChange(prod.id, 1)}
                          className="px-2.5 py-1 text-xs font-medium text-[#231818] bg-[#EFE8DE] hover:bg-[#D07A6D] hover:text-white rounded-lg transition-colors"
                        >
                          + Adicionar
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Entrega e Pagamento */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5 mb-2">
                <Clock className="w-3.5 h-3.5 text-[#D07A6D]" /> Data e Horário
              </label>
              <input
                type="text"
                value={deliveryDate}
                onChange={(e) => setDeliveryDate(e.target.value)}
                placeholder="Ex: Hoje às 17:00 ou 25/09"
                className="w-full px-3.5 py-2.5 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
              />
              <div className="flex items-center gap-2 mt-2">
                <button
                  type="button"
                  onClick={() => setDeliveryType('retirada')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    deliveryType === 'retirada'
                      ? 'bg-[#2B1D1D] text-white border-[#2B1D1D]'
                      : 'bg-white text-[#7C6E68] border-[#EFE8DE] hover:bg-[#FBF8F3]'
                  }`}
                >
                  Retirada no Ateliê
                </button>
                <button
                  type="button"
                  onClick={() => setDeliveryType('entrega')}
                  className={`flex-1 py-1.5 text-xs font-medium rounded-lg border transition-all ${
                    deliveryType === 'entrega'
                      ? 'bg-[#2B1D1D] text-white border-[#2B1D1D]'
                      : 'bg-white text-[#7C6E68] border-[#EFE8DE] hover:bg-[#FBF8F3]'
                  }`}
                >
                  Entrega / Delivery
                </button>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-[#D07A6D]" /> Pagamento
              </label>
              <select
                value={paymentStatus}
                onChange={(e) =>
                  setPaymentStatus(e.target.value as 'pago' | 'pendente' | '50_sinal')
                }
                className="w-full px-3.5 py-2.5 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
              >
                <option value="pago">Total Pago (PIX / Cartão)</option>
                <option value="50_sinal">50% de Sinal Pago</option>
                <option value="pendente">Pagamento na Entrega</option>
              </select>

              <div className="mt-3 p-3 rounded-xl bg-[#F8F4EE] border border-[#EFE8DE] flex items-center justify-between">
                <span className="text-xs font-medium text-[#7C6E68]">Valor Total Calculado:</span>
                <span className="text-lg font-serif font-bold text-[#231818] tabular-nums">
                  R$ {totalCalculated.toFixed(2).replace('.', ',')}
                </span>
              </div>
            </div>
          </div>

          {/* Observações */}
          <div>
            <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5 mb-1.5">
              <FileText className="w-3.5 h-3.5 text-[#D07A6D]" /> Observações & Frase do Bolo
            </label>
            <textarea
              rows={2}
              placeholder="Ex: Escrever 'Feliz Aniversário Lucca' com pasta americana; embalagem p/ presente."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
            />
          </div>

          {/* Actions */}
          <div className="pt-2 flex items-center justify-end gap-3 border-t border-[#EFE8DE]">
            <button
              type="button"
              onClick={() => setIsNewOrderModalOpen(false)}
              className="px-4 py-2.5 text-sm font-medium text-[#7C6E68] hover:text-[#231818] transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={totalCalculated === 0 || !customerName.trim()}
              className="px-6 py-2.5 text-sm font-semibold text-white bg-[#2B1D1D] hover:bg-[#3E2C2C] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm"
            >
              Confirmar Pedido (R$ {totalCalculated.toFixed(2).replace('.', ',')})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
