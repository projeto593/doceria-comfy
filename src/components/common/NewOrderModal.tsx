import React, { useEffect, useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { OrderStatus } from '../../types';
import {
  formatScheduledLabel,
  getTodayIsoDate,
  getTomorrowIsoDate,
} from '../../utils/orderHelpers';
import {
  PHONE_DIGITS_LENGTH,
  extractPhoneDigits,
  formatPhone11,
} from '../../utils/validation';
import {
  X,
  Plus,
  Minus,
  Cake,
  User,
  Truck,
  DollarSign,
  FileText,
  Calendar,
  Clock,
  Lock,
} from 'lucide-react';

const QUICK_HOURS = ['09:00', '11:00', '14:00', '16:00', '18:00'];

export const NewOrderModal: React.FC = () => {
  const {
    isNewOrderModalOpen,
    setIsNewOrderModalOpen,
    prefilledScheduleDate,
    setPrefilledScheduleDate,
    products,
    customers,
    storeProfile,
    addOrder,
    showToast,
  } = useComfy();

  const defaultDepositPercent = storeProfile.defaultDepositPercent ?? 50;

  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [scheduledDate, setScheduledDate] = useState(getTodayIsoDate());
  const [scheduledTime, setScheduledTime] = useState('14:00');
  const [deliveryType, setDeliveryType] = useState<'retirada' | 'entrega'>('retirada');
  const [paymentStatus, setPaymentStatus] = useState<'pago' | 'pendente' | '50_sinal'>('pago');
  const [depositInput, setDepositInput] = useState<string>('');
  const [hasCustomDeposit, setHasCustomDeposit] = useState(false);
  const [initialStatus, setInitialStatus] = useState<OrderStatus>('pending');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Selected item map: productId -> quantity
  const [selectedItems, setSelectedItems] = useState<{ [productId: string]: number }>({});

  useEffect(() => {
    if (!isNewOrderModalOpen) return;
    if (prefilledScheduleDate) {
      setScheduledDate(prefilledScheduleDate);
    }
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
  }, [isNewOrderModalOpen, prefilledScheduleDate, products]);

  const totalCalculated = Object.entries(selectedItems).reduce((acc, [prodId, qty]) => {
    const prod = products.find((p) => p.id === prodId);
    return acc + (prod ? prod.price * qty : 0);
  }, 0);

  // Keep default deposit prefilled using Preferences % when switching to '50_sinal'
  useEffect(() => {
    if (paymentStatus === '50_sinal' && !hasCustomDeposit && totalCalculated > 0) {
      setDepositInput((totalCalculated * (defaultDepositPercent / 100)).toFixed(2));
    }
  }, [paymentStatus, totalCalculated, hasCustomDeposit, defaultDepositPercent]);

  if (!isNewOrderModalOpen) return null;

  const parsedDeposit =
    paymentStatus === '50_sinal'
      ? Math.min(
          totalCalculated,
          Math.max(0, parseFloat(depositInput.replace(',', '.')) || 0)
        )
      : paymentStatus === 'pago'
      ? totalCalculated
      : 0;

  const remainingAmount = Math.max(0, totalCalculated - parsedDeposit);

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
      setCustomerPhone(formatPhone11(cust.phone));
    } else {
      setCustomerName(custName);
    }
  };

  const handleClose = () => {
    setPrefilledScheduleDate('');
    setHasCustomDeposit(false);
    setIsNewOrderModalOpen(false);
  };

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

    const phoneDigits = extractPhoneDigits(customerPhone);
    if (phoneDigits.length > 0 && phoneDigits.length !== PHONE_DIGITS_LENGTH) {
      showToast('O telefone/WhatsApp deve conter 11 números (DDD + 9 dígitos).');
      return;
    }

    if (scheduledDate && (storeProfile.blockedDates || []).includes(scheduledDate)) {
      showToast('Este dia está bloqueado na agenda. Escolha outra data ou desbloqueie na Agenda.');
      return;
    }

    setIsSubmitting(true);
    try {
      const ok = await addOrder({
        customerName: customerName.trim(),
        customerPhone: phoneDigits.length === PHONE_DIGITS_LENGTH ? formatPhone11(phoneDigits) : '',
        items,
        deliveryDate: formatScheduledLabel(scheduledDate, scheduledTime),
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        depositAmount: parsedDeposit,
        initialStatus,
        deliveryType,
        paymentStatus,
        notes: notes.trim(),
      });

      if (ok) {
        setCustomerName('');
        setCustomerPhone('');
        setDepositInput('');
        setHasCustomDeposit(false);
        setPaymentStatus('pago');
        setInitialStatus('pending');
        setScheduledDate(getTodayIsoDate());
        setScheduledTime('14:00');
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
            <h2 className="text-lg sm:text-xl font-serif text-[#231818] font-bold">
              Criar Novo Pedido
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClose}
            className="p-2 text-[#7C6E68] hover:text-[#231818] hover:bg-[#EFE8DE]/50 rounded-xl transition-colors min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto">
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
                  inputMode="numeric"
                  maxLength={15}
                  placeholder="(11) 98765-4321"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(formatPhone11(e.target.value))}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] focus:ring-1 focus:ring-[#D07A6D] text-[#231818] font-mono min-h-[44px]"
                />
              </div>
            </div>
          </div>

          {/* Doces / Itens do Catálogo */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5">
                <Cake className="w-3.5 h-3.5 text-[#D07A6D] shrink-0" /> Selecionar Doces do Catálogo
              </label>
              <span className="text-xs text-[#7C6E68] whitespace-nowrap tabular-nums">
                {Object.keys(selectedItems).length} item(s)
              </span>
            </div>

            <div className="space-y-2 border border-[#EFE8DE] rounded-xl p-2.5 sm:p-3 bg-[#FBF8F3] max-h-48 overflow-y-auto">
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
                          <p className="text-xs sm:text-sm font-semibold text-[#231818] truncate">
                            {prod.name}
                          </p>
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
                              className="p-1 hover:bg-[#EFE8DE] rounded-md text-[#231818] transition-colors cursor-pointer"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-bold text-[#231818] w-4 text-center tabular-nums">
                              {qty}
                            </span>
                            <button
                              type="button"
                              onClick={() => handleQuantityChange(prod.id, 1)}
                              className="p-1 hover:bg-[#EFE8DE] rounded-md text-[#231818] transition-colors cursor-pointer"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => handleQuantityChange(prod.id, 1)}
                            className="px-2.5 py-1 text-xs font-medium text-[#231818] bg-[#EFE8DE] hover:bg-[#D07A6D] hover:text-white rounded-lg transition-colors cursor-pointer"
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

          {/* Agendamento: Calendário (Data) + Hora */}
          <div className="p-3.5 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE] space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D07A6D]" /> Agendamento (Data e Hora)
              </label>
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => setScheduledDate(getTodayIsoDate())}
                  className="px-2 py-1 rounded-lg bg-white border border-[#EFE8DE] text-[11px] font-medium text-[#231818] hover:border-[#D07A6D] cursor-pointer"
                >
                  Hoje
                </button>
                <button
                  type="button"
                  onClick={() => setScheduledDate(getTomorrowIsoDate())}
                  className="px-2 py-1 rounded-lg bg-white border border-[#EFE8DE] text-[11px] font-medium text-[#231818] hover:border-[#D07A6D] cursor-pointer"
                >
                  Amanhã
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setScheduledDate('');
                    setScheduledTime('');
                  }}
                  className="px-2 py-1 rounded-lg bg-white border border-[#EFE8DE] text-[11px] font-medium text-[#7C6E68] hover:text-[#231818] cursor-pointer"
                >
                  A combinar
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-[#7C6E68] block mb-1">Data no Calendário</label>
                <input
                  type="date"
                  value={scheduledDate}
                  onChange={(e) => setScheduledDate(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] min-h-[42px]"
                />
              </div>
              <div>
                <label className="text-[11px] text-[#7C6E68] flex items-center gap-1 mb-1">
                  <Clock className="w-3 h-3 text-[#D07A6D]" /> Horário
                </label>
                <input
                  type="time"
                  value={scheduledTime}
                  onChange={(e) => setScheduledTime(e.target.value)}
                  className="w-full px-3.5 py-2 text-sm bg-white border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] min-h-[42px]"
                />
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] text-[#7C6E68] mr-1">Horários rápidos:</span>
              {QUICK_HOURS.map((hr) => (
                <button
                  key={hr}
                  type="button"
                  onClick={() => setScheduledTime(hr)}
                  className={`px-2 py-1 rounded-lg text-[11px] font-medium border transition-colors cursor-pointer ${
                    scheduledTime === hr
                      ? 'bg-[#2B1D1D] text-white border-[#2B1D1D]'
                      : 'bg-white text-[#7C6E68] border-[#EFE8DE] hover:text-[#231818]'
                  }`}
                >
                  {hr}
                </button>
              ))}
            </div>

            {Boolean(scheduledDate && (storeProfile.blockedDates || []).includes(scheduledDate)) && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center gap-2 text-[11px] text-rose-900">
                <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                <span>
                  <strong>Dia bloqueado na Agenda:</strong> escolha outra data ou desbloqueie este dia na aba Agenda.
                </span>
              </div>
            )}
          </div>

          {/* Entrega, Status Inicial e Pagamento com Sinal */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5 mb-2">
                  <Truck className="w-3.5 h-3.5 text-[#D07A6D]" /> Modalidade
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeliveryType('retirada')}
                    className={`flex-1 py-2.5 text-xs font-medium rounded-xl border transition-all min-h-[42px] cursor-pointer ${
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
                    className={`flex-1 py-2.5 text-xs font-medium rounded-xl border transition-all min-h-[42px] cursor-pointer ${
                      deliveryType === 'entrega'
                        ? 'bg-[#2B1D1D] text-white border-[#2B1D1D]'
                        : 'bg-white text-[#7C6E68] border-[#EFE8DE] hover:bg-[#FBF8F3]'
                    }`}
                  >
                    Entrega Delivery
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] block mb-1.5">
                  Status Inicial do Pedido
                </label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setInitialStatus('pending')}
                    className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      initialStatus === 'pending'
                        ? 'bg-[#2B1D1D] text-white border-[#2B1D1D]'
                        : 'bg-white text-[#7C6E68] border-[#EFE8DE]'
                    }`}
                  >
                    Agendado / Aguardando
                  </button>
                  <button
                    type="button"
                    onClick={() => setInitialStatus('in_production')}
                    className={`flex-1 py-2 text-xs font-medium rounded-xl border transition-all cursor-pointer ${
                      initialStatus === 'in_production'
                        ? 'bg-[#D07A6D] text-white border-[#D07A6D]'
                        : 'bg-white text-[#7C6E68] border-[#EFE8DE]'
                    }`}
                  >
                    Já em Produção
                  </button>
                </div>
              </div>
            </div>

            <div>
              <label className="text-xs font-semibold uppercase tracking-wider text-[#7C6E68] flex items-center gap-1.5 mb-2">
                <DollarSign className="w-3.5 h-3.5 text-[#D07A6D]" /> Pagamento & Sinal
              </label>

              <div className="grid grid-cols-3 gap-1.5">
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStatus('pago');
                    setHasCustomDeposit(false);
                  }}
                  className={`py-2 px-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                    paymentStatus === 'pago'
                      ? 'bg-emerald-700 text-white border-emerald-700'
                      : 'bg-white text-[#7C6E68] border-[#EFE8DE] hover:bg-[#FBF8F3]'
                  }`}
                >
                  Total Pago
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStatus('50_sinal');
                    setHasCustomDeposit(false);
                  }}
                  className={`py-2 px-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                    paymentStatus === '50_sinal'
                      ? 'bg-amber-600 text-white border-amber-600'
                      : 'bg-white text-[#7C6E68] border-[#EFE8DE] hover:bg-[#FBF8F3]'
                  }`}
                >
                  Com Sinal
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentStatus('pendente');
                    setHasCustomDeposit(false);
                  }}
                  className={`py-2 px-2 text-[11px] font-semibold rounded-xl border transition-all cursor-pointer ${
                    paymentStatus === 'pendente'
                      ? 'bg-[#2B1D1D] text-white border-[#2B1D1D]'
                      : 'bg-white text-[#7C6E68] border-[#EFE8DE] hover:bg-[#FBF8F3]'
                  }`}
                >
                  Na Entrega
                </button>
              </div>

              {paymentStatus === '50_sinal' && (
                <div className="mt-2.5 p-3 rounded-xl bg-amber-50/70 border border-amber-200 space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <label className="text-[11px] font-bold text-amber-950">
                      Valor do Sinal (R$)
                    </label>
                    <span className="text-[10px] font-medium text-amber-900/80">
                      Padrão: {defaultDepositPercent}% (Preferências)
                    </span>
                  </div>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={totalCalculated || undefined}
                    placeholder="Ex: 50.00"
                    value={depositInput}
                    onChange={(e) => {
                      setHasCustomDeposit(true);
                      setDepositInput(e.target.value);
                    }}
                    className="w-full px-3 py-2 text-sm bg-white border border-amber-200 rounded-lg focus:outline-hidden focus:border-[#D07A6D] font-serif font-bold text-[#231818]"
                  />
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-amber-900">
                      Sinal:{' '}
                      <strong className="tabular-nums">
                        R$ {parsedDeposit.toFixed(2).replace('.', ',')}
                      </strong>
                    </span>
                    <span className="text-[#231818]">
                      Restante:{' '}
                      <strong className="tabular-nums text-[#B85848]">
                        R$ {remainingAmount.toFixed(2).replace('.', ',')}
                      </strong>
                    </span>
                  </div>
                </div>
              )}

              <div className="mt-2.5 p-3 rounded-xl bg-[#F8F4EE] border border-[#EFE8DE] flex items-center justify-between">
                <span className="text-xs font-medium text-[#7C6E68]">Valor Total:</span>
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
              onClick={handleClose}
              className="w-full sm:w-auto px-4 py-2.5 text-xs sm:text-sm font-medium text-[#7C6E68] hover:text-[#231818] transition-colors rounded-xl min-h-[44px] flex items-center justify-center cursor-pointer order-2 sm:order-1"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={
                totalCalculated === 0 ||
                !customerName.trim() ||
                isSubmitting ||
                Boolean(scheduledDate && (storeProfile.blockedDates || []).includes(scheduledDate))
              }
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
