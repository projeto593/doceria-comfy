import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Order, OrderStatus } from '../../types';
import {
  formatScheduledLabel,
  getOrderPaidAmount,
  getOrderRemainingAmount,
} from '../../utils/orderHelpers';
import {
  Search,
  Plus,
  Phone,
  MapPin,
  CheckCircle,
  Package,
  Trash2,
  Calendar,
  MessageCircle,
  DollarSign,
  Edit2,
} from 'lucide-react';

export const OrdersView: React.FC = () => {
  const {
    orders,
    storeProfile,
    updateOrderStatus,
    updateOrderPayment,
    deleteOrder,
    setIsNewOrderModalOpen,
    setStatusNotification,
  } = useComfy();

  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

  // Inline deposit ("sinal") editing per order
  const [depositEditOrderId, setDepositEditOrderId] = useState<string | null>(null);
  const [depositEditValue, setDepositEditValue] = useState<string>('');
  const [confirmDeleteOrder, setConfirmDeleteOrder] = useState<Order | null>(null);
  const [isDeletingOrder, setIsDeletingOrder] = useState(false);

  const handleConfirmDeleteOrder = async () => {
    if (!confirmDeleteOrder || isDeletingOrder) return;
    setIsDeletingOrder(true);
    try {
      await deleteOrder(confirmDeleteOrder.id);
      setConfirmDeleteOrder(null);
    } finally {
      setIsDeletingOrder(false);
    }
  };

  const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    in_production: { label: 'Em produção', color: 'text-[#D07A6D]', bg: 'bg-[#D07A6D]/15' },
    ready: { label: 'Pronto p/ retirada', color: 'text-amber-800', bg: 'bg-amber-100' },
    delivered: { label: 'Entregue', color: 'text-emerald-800', bg: 'bg-emerald-100' },
    pending: { label: 'Aguardando', color: 'text-[#7C6E68]', bg: 'bg-[#EFE8DE]' },
  };

  const filteredOrders = orders.filter((order) => {
    const matchesFilter = filterStatus === 'all' || order.status === filterStatus;
    const matchesSearch =
      order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      order.items.some((i) => i.productName.toLowerCase().includes(searchTerm.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const handleOpenDepositEditor = (order: Order) => {
    const currentPaid = getOrderPaidAmount(order);
    const defaultRatio = (storeProfile.defaultDepositPercent ?? 50) / 100;
    setDepositEditOrderId(order.id);
    setDepositEditValue(
      currentPaid > 0 ? currentPaid.toFixed(2) : (order.totalAmount * defaultRatio).toFixed(2)
    );
  };

  const handleSaveDeposit = async (order: Order) => {
    const val = Math.min(
      order.totalAmount,
      Math.max(0, parseFloat(depositEditValue.replace(',', '.')) || 0)
    );
    if (val >= order.totalAmount - 0.01) {
      await updateOrderPayment(order.id, 'pago', order.totalAmount);
    } else if (val <= 0) {
      await updateOrderPayment(order.id, 'pendente', 0);
    } else {
      await updateOrderPayment(order.id, '50_sinal', val);
    }
    setDepositEditOrderId(null);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
            Gestão de Pedidos
          </h1>
          <p className="text-xs text-[#7C6E68] mt-0.5">
            Acompanhe produção, agendamento, valores de sinal e avise seus clientes no WhatsApp.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewOrderModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D07A6D] shrink-0" />
          <span>Novo pedido</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 bg-white p-3 sm:p-3.5 rounded-2xl border border-[#EFE8DE]">
        {/* Status segmented controls */}
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 lg:pb-0">
          <button
            type="button"
            onClick={() => setFilterStatus('all')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[38px] flex items-center cursor-pointer shrink-0 ${
              filterStatus === 'all'
                ? 'bg-[#2B1D1D] text-white font-semibold'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('pending')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[38px] flex items-center cursor-pointer shrink-0 ${
              filterStatus === 'pending'
                ? 'bg-[#7C6E68] text-white font-semibold'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Aguardando ({orders.filter((o) => o.status === 'pending').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('in_production')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[38px] flex items-center cursor-pointer shrink-0 ${
              filterStatus === 'in_production'
                ? 'bg-[#D07A6D] text-white font-semibold'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Em produção ({orders.filter((o) => o.status === 'in_production').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('ready')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[38px] flex items-center cursor-pointer shrink-0 ${
              filterStatus === 'ready'
                ? 'bg-amber-700 text-white font-semibold'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Prontos ({orders.filter((o) => o.status === 'ready').length})
          </button>
          <button
            type="button"
            onClick={() => setFilterStatus('delivered')}
            className={`px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors min-h-[38px] flex items-center cursor-pointer shrink-0 ${
              filterStatus === 'delivered'
                ? 'bg-emerald-700 text-white font-semibold'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Entregues ({orders.filter((o) => o.status === 'delivered').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full lg:w-64 xl:w-72 shrink-0">
          <Search className="w-4 h-4 text-[#7C6E68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente ou pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] min-h-[42px]"
          />
        </div>
      </div>

      {/* Orders Cards List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredOrders.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-12 text-center border border-[#EFE8DE]">
            <Package className="w-10 h-10 text-[#7C6E68]/40 mx-auto mb-3" />
            <h3 className="font-serif text-lg font-bold text-[#231818]">Nenhum pedido encontrado</h3>
            <p className="text-xs text-[#7C6E68] mt-1 mb-4">
              Não há encomendas correspondentes ao filtro atual.
            </p>
            <button
              type="button"
              onClick={() => setIsNewOrderModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B] cursor-pointer"
            >
              + Criar novo pedido
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const conf = statusConfig[order.status];
            const paidAmount = getOrderPaidAmount(order);
            const remainingAmount = getOrderRemainingAmount(order);
            const scheduleDisplay =
              order.scheduledDate || order.scheduledTime
                ? formatScheduledLabel(order.scheduledDate, order.scheduledTime)
                : order.deliveryDate && order.deliveryDate !== 'Hoje'
                ? order.deliveryDate
                : 'A combinar';

            const isEditingDeposit = depositEditOrderId === order.id;

            return (
              <div
                key={order.id}
                className="min-w-0 bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar of the Card */}
                  <div className="flex items-center justify-between gap-2 pb-3 border-b border-[#EFE8DE]">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-8 rounded-full bg-[#F8F4EE] text-[#7C6E68] flex items-center justify-center text-xs font-bold font-mono shrink-0">
                        {order.customerInitials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-bold text-[#231818] truncate">
                          {order.customerName}
                        </h4>
                        <p className="text-[11px] text-[#7C6E68] font-mono tabular-nums">
                          {order.orderNumber}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg whitespace-nowrap ${conf.bg} ${conf.color}`}
                      >
                        {conf.label}
                      </span>
                      <button
                        type="button"
                        onClick={() => setConfirmDeleteOrder(order)}
                        className="text-[#7C6E68]/50 hover:text-red-500 transition-colors p-1 cursor-pointer"
                        title="Excluir pedido"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Items list */}
                  <div className="py-3 space-y-1.5 border-b border-[#EFE8DE]">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex items-center justify-between text-xs">
                        <span className="text-[#231818]">
                          <strong className="text-[#D07A6D]">{item.quantity}x</strong> {item.productName}
                        </span>
                        <span className="text-[#7C6E68] tabular-nums font-mono">
                          R$ {(item.quantity * item.unitPrice).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    ))}
                  </div>

                  {/* Details, Schedule & Notes */}
                  <div className="py-2.5 text-xs text-[#7C6E68] space-y-1.5">
                    <div className="flex items-center justify-between gap-2 flex-wrap">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-[#D07A6D]" />
                        <span>
                          {order.deliveryType === 'entrega' ? 'Entrega Delivery' : 'Retirada no Ateliê'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-[#FBF8F3] border border-[#EFE8DE] text-[11px] text-[#231818] font-medium">
                        <Calendar className="w-3 h-3 text-[#D07A6D]" />
                        <span>{scheduleDisplay}</span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#7C6E68]" />
                      <span>{order.customerPhone}</span>
                    </div>

                    {order.notes && (
                      <div className="mt-1.5 p-2 rounded-lg bg-[#FBF8F3] text-[11px] text-[#231818] border border-[#EFE8DE]">
                        Obs: {order.notes}
                      </div>
                    )}
                  </div>

                  {/* Payment & Sinal Box */}
                  {(() => {
                    const defaultDepositPct = storeProfile.defaultDepositPercent ?? 50;
                    const hasDepositRule = defaultDepositPct > 0 && defaultDepositPct < 100;
                    const suggestedDeposit =
                      Math.round(order.totalAmount * (defaultDepositPct / 100) * 100) / 100;
                    const paidPct =
                      order.totalAmount > 0
                        ? Math.round((paidAmount / order.totalAmount) * 100)
                        : 0;
                    const remainingPct = Math.max(0, 100 - paidPct);

                    return (
                      <div className="mb-3 p-2.5 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE] space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                          <div className="flex items-center gap-1.5 min-w-0">
                            <DollarSign className="w-3.5 h-3.5 text-[#D07A6D] shrink-0" />
                            {remainingAmount <= 0.01 ? (
                              <span className="font-semibold text-emerald-700 truncate">
                                Pagamento 100% quitado
                              </span>
                            ) : paidAmount > 0 ? (
                              <span className="font-semibold text-amber-800 truncate">
                                Sinal ({paidPct}%): R$ {paidAmount.toFixed(2).replace('.', ',')} ·{' '}
                                <strong className="text-[#B85848]">
                                  Falta ({remainingPct}%): R$ {remainingAmount.toFixed(2).replace('.', ',')}
                                </strong>
                              </span>
                            ) : hasDepositRule ? (
                              <span className="font-semibold text-[#7C6E68] truncate">
                                Sinal pend. ({defaultDepositPct}%):{' '}
                                <strong className="text-[#B85848] tabular-nums">
                                  R$ {suggestedDeposit.toFixed(2).replace('.', ',')}
                                </strong>
                              </span>
                            ) : (
                              <span className="font-semibold text-[#7C6E68] truncate">
                                Pendente: R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-1.5 shrink-0">
                            {remainingAmount > 0.01 && paidAmount === 0 && hasDepositRule && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateOrderPayment(order.id, '50_sinal', suggestedDeposit)
                                }
                                title={`Registrar sinal de ${defaultDepositPct}% (R$ ${suggestedDeposit.toFixed(2).replace('.', ',')})`}
                                className="px-2 py-0.5 rounded-md bg-amber-100/80 hover:bg-amber-200/80 text-[11px] font-semibold text-amber-900 transition-colors cursor-pointer"
                              >
                                Sinal {defaultDepositPct}%
                              </button>
                            )}
                            {remainingAmount > 0.01 && (
                              <button
                                type="button"
                                onClick={() =>
                                  updateOrderPayment(order.id, 'pago', order.totalAmount)
                                }
                                title={
                                  paidAmount > 0
                                    ? `Quitar restante de ${remainingPct}% (R$ ${remainingAmount.toFixed(2).replace('.', ',')})`
                                    : 'Quitar valor total (100%)'
                                }
                                className="px-2 py-0.5 rounded-md bg-emerald-100/80 hover:bg-emerald-200/80 text-[11px] font-bold text-emerald-800 transition-colors cursor-pointer"
                              >
                                {paidAmount > 0 ? `Quitar ${remainingPct}%` : 'Quitar'}
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleOpenDepositEditor(order)}
                              title="Informar outro valor manualmente"
                              className="p-1 rounded-md text-[#7C6E68] hover:text-[#D07A6D] hover:bg-white transition-colors cursor-pointer"
                            >
                              <Edit2 className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                    {isEditingDeposit && (
                      <div className="pt-2 border-t border-[#EFE8DE] flex items-center gap-2">
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          max={order.totalAmount}
                          value={depositEditValue}
                          onChange={(e) => setDepositEditValue(e.target.value)}
                          placeholder="Valor do sinal (R$)"
                          className="flex-1 px-2.5 py-1.5 text-xs bg-white border border-[#EFE8DE] rounded-lg focus:outline-hidden focus:border-[#D07A6D]"
                        />
                        <button
                          type="button"
                          onClick={() => handleSaveDeposit(order)}
                          className="px-3 py-1.5 rounded-lg bg-[#2B1D1D] text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Salvar
                        </button>
                        <button
                          type="button"
                          onClick={() => setDepositEditOrderId(null)}
                          className="px-2 py-1.5 text-[11px] text-[#7C6E68] cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    )}
                      </div>
                    );
                  })()}
                </div>

                {/* Footer and Status Change Actions */}
                <div className="pt-3 border-t border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div>
                    <span className="text-[11px] text-[#7C6E68] block">Valor Total</span>
                    <span className="text-base font-serif font-bold text-[#231818] tabular-nums">
                      R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* Status Change + WhatsApp Notify Buttons */}
                  <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto justify-end">
                    <button
                      type="button"
                      onClick={() =>
                        setStatusNotification({ order, newStatus: order.status })
                      }
                      className="px-3 py-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-xs font-semibold transition-colors min-h-[40px] flex items-center justify-center gap-1.5 cursor-pointer"
                      title="Enviar mensagem de atualização do pedido no WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      <span>Avisar</span>
                    </button>

                    {order.status === 'pending' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'in_production')}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-[#D07A6D] hover:bg-[#B85848] text-white text-xs font-semibold transition-colors min-h-[40px] flex items-center justify-center cursor-pointer"
                      >
                        Iniciar Produção →
                      </button>
                    )}
                    {order.status === 'in_production' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors min-h-[40px] flex items-center justify-center cursor-pointer"
                      >
                        Pronto p/ Entrega →
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        type="button"
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="flex-1 sm:flex-initial px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors min-h-[40px] flex items-center justify-center cursor-pointer"
                      >
                        Marcar Entregue ✓
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-1.5 py-1">
                        <CheckCircle className="w-4 h-4" /> Pedido Concluído
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal Confirmar Exclusão de Pedido */}
      {confirmDeleteOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EFE8DE] overflow-hidden p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#231818]">
                  Tem certeza que deseja apagar este pedido?
                </h3>
                <p className="text-xs text-[#7C6E68] mt-1 leading-relaxed">
                  Deseja realmente excluir o pedido{' '}
                  <strong className="text-[#231818] font-mono">
                    {confirmDeleteOrder.orderNumber}
                  </strong>{' '}
                  de <strong className="text-[#231818]">{confirmDeleteOrder.customerName}</strong>?
                  Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={() => setConfirmDeleteOrder(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3] cursor-pointer min-h-[40px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingOrder}
                onClick={handleConfirmDeleteOrder}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 cursor-pointer min-h-[40px]"
              >
                {isDeletingOrder ? 'Apagando...' : 'Sim, apagar pedido'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
