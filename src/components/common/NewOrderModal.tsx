import React, { useEffect, useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { X, Plus, Minus, Cake, User, Phone, Clock, DollarSign, FileText } from 'lucide-react';

export const NewOrderModal: React.FC = () => {
  const { isNewOrderModalOpen, setIsNewOrderModalOpen, products, customers, addOrder, showToast } = useComfy();

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [deliveryDate, setDeliveryDate] = useState('Hoje às 16:30');
  const [deliveryType, setDeliveryType] = useState<'retirada' | 'entrega'>('retirada');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente' | '50_sinal'>('pago');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected item map: productId -> quantity
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: number }>({});

  useEffect(() => {
    if (!isNewOrderModalOpen) return;
    setSelectedItems((prev) => {
      const validEntries = Object.entries(prev).filter(
        ([prodId, qty]) => qty > 0 && products.some((p) => p.id === prodId)
      );
      if (validEntries.length > 0) {
        return Object.fromEntries(validEntries);
      }
      const firstProd = products.find((p) => p.active) || products[0];
      return firstProd ? { [firstProd.id]: 1 } : {};
    });
  }, [isNewOrderModalOpen, products]);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || isSubmitting) return;

    const items = Object.entries(selectedItems).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    if (items.length === 0) {
      showToast('Selecione ao menos um doce para o pedido.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await addOrder({
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim() || '(11) 99999-0000',
        items,
        deliveryDate: deliveryDate || 'Hoje',
        deliveryType,
        paymentStatus,
        notes: notes.trim(),
      });

      if (ok) {
        setCustomerName('');
        setCustomerPhone('');
        const firstProd = products.find((p) => p.active) || products[0];
        setSelectedItems(firstProd ? { [firstProd.id]: 1 } : {});
        setNotes('');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-[#FFFFFF] rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#EFE8DE] overflow-hidden flex flex-col max-h-[92vh] sm:max-h-[90vh]">
        {/* Header */}
        <div className="px-4 sm:px-6 py-4 sm:py-5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3]">
          <div>
            <span className="text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider text-[#D07A6D]">
              • Nova Encomenda
            </span>
            <h2 className="text-lg sm:text-xl font-serif text-[#231818] font-bold">Criar Novo Pedido</h2>
          </div>
          <button
            onClick={() => setIsNewOrderModalOpen(false)}
            className="p-2 text-[#7C6E68] hover:text-[#231818] hover:bg-[#EFE8DE]/50 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6 overflow-y-auto">
          {/* Cliente */}
          <div className="space-y-2 sm:space-y-3">
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
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] min-h-[44px]"
                />
                {/* Quick autocomplete chips */}
                {customers.length > 0 && (
                  <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 text-xs text-[#7C6E68]">
                    <span className="shrink-0 text-[11px]">Sugeridos:</span>
                    {customers.slice(0, 3).map((c) => (
                      <button
                        key={c.id}
                        type="button"
                        onClick={() => handleSelectCustomer(c.name)}
                        className="px-2.5 py-1 rounded-lg bg-[#F8F4EE] hover:bg-[#EFE8DE] text-[11px] font-medium text-[#231818] transition-colors shrink-0 min-h-[30px] flex items-center cursor-pointer"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <div>
                <input
                  type="tel"
                  placeholder="WhatsApp / Telefone"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] focus:ring-1 focus:ring-[#D07A6D] text-[#231818] min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Doces / Itens do Catálogo */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-[#D07A6D] shrink-0" /> Selecionar Doces do Catálogo
              </label>
              <span className="text-xs text-[#7C6E68] whitespace-nowrap tabular-nums">
                {Object.keys(selectedItems).length} item(s)
              </span>
            </div>

            <div className="space-y-2 border border-[#EFE8DE] rounded-xl p-2.5 sm:p-3 bg-[#FBF8F3] max-h-52 overflow-y-auto">
              {products.length === 0 ? (
                <div className="p-6 text-center text-xs text-[#7C6E68]">
                  Nenhum produto cadastrado no catálogo ainda. Cadastre um produto na aba{' '}
                  <strong className="text-[#231818]">Catálogo</strong> antes de criar encomendas.
                </div>
              ) : (
                products.map((prod) => {
                  const qty = selectedItems[prod.id] || 0;
                  return (
                    <div
                      key={prod.id}
                      className={`flex items-center justify-between gap-2 p-2.5 rounded-xl border transition-colors min-w-0 ${
                        qty > 0
                          ? 'bg-white border-[#D07A6D]/40 shadow-xs'
                          : 'bg-white/60 border-transparent hover:bg-white'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        {prod.imageUrl ? (
                          <img
                            src={prod.imageUrl}
                            alt={prod.name}
                            className="w-10 h-10 rounded-lg object-cover border border-[#EFE8DE] shrink-0"
                          />
                        ) : (
                          <span className="w-10 h-10 flex items-center justify-center text-xl rounded-lg bg-[#F8F4EE] shrink-0">
                            {prod.emoji || '🧁'}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[#231818] truncate">{prod.name}</p>
                          <p className="text-[11px] sm:text-xs text-[#7C6E68] truncate tabular-nums">
                            R$ {prod.price.toFixed(2).replace('.', ',')} · {prod.unit}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
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
                })
              )}
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
          <div className="pt-3 flex flex-col sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3 border-t border-[#EFE8DE]">
            <button
              type="button"
              onClick={() => setIsNewOrderModalOpen(false)}
              className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-medium text-[#7C6E68] hover:text-[#231818] transition-colors rounded-xl min-h-[44px] flex items-center justify-center cursor-pointer order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={totalCalculated === 0 || !customerName.trim()}
              className="w-full sm:w-auto px-6 py-3 text-xs sm:text-sm font-semibold text-white bg-[#2B1D1D] hover:bg-[#3E2C2C] disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition-all shadow-sm min-h-[48px] flex items-center justify-center cursor-pointer order-1 sm:order-2"
            >
              Confirmar Pedido (R$ {totalCalculated.toFixed(2).replace('.', ',')})
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
