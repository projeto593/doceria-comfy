import React, { useMemo, useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Order, OrderStatus } from '../../types';
import {
  formatScheduledLabel,
  getOrderPaidAmount,
  getOrderRemainingAmount,
  getTodayIsoDate,
} from '../../utils/orderHelpers';
import {
  Ban,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Clock,
  Edit3,
  Lock,
  MapPin,
  MessageCircle,
  Plus,
  Unlock,
} from 'lucide-react';

const WEEKDAY_LABELS = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

const STATUS_STYLES: Record<
  OrderStatus,
  { label: string; badge: string; dot: string }
> = {
  pending: {
    label: 'Aguardando',
    badge: 'bg-[#EFE8DE] text-[#231818]',
    dot: 'bg-[#7C6E68]',
  },
  in_production: {
    label: 'Em produção',
    badge: 'bg-[#D07A6D]/15 text-[#B85848]',
    dot: 'bg-[#D07A6D]',
  },
  ready: {
    label: 'Pronto',
    badge: 'bg-amber-100 text-amber-800',
    dot: 'bg-amber-500',
  },
  delivered: {
    label: 'Entregue',
    badge: 'bg-emerald-100 text-emerald-800',
    dot: 'bg-emerald-600',
  },
};

export const AgendaView: React.FC = () => {
  const {
    orders,
    storeProfile,
    toggleBlockedDate,
    openNewOrderModalWithDate,
    updateOrderStatus,
    updateOrderPayment,
    updateOrderSchedule,
    setStatusNotification,
  } = useComfy();

  const blockedDatesSet = useMemo(
    () => new Set(storeProfile.blockedDates || []),
    [storeProfile.blockedDates]
  );

  const todayIso = getTodayIsoDate();
  const [selectedDate, setSelectedDate] = useState<string>(todayIso);
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);
  const [cursorMonth, setCursorMonth] = useState<{ year: number; month: number }>(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Inline reschedule editor state
  const [rescheduleOrderId, setRescheduleOrderId] = useState<string | null>(null);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // Orders grouped by scheduledDate (YYYY-MM-DD)
  const ordersByDate = useMemo(() => {
    const map: Record<string, Order[]> = {};
    for (const order of orders) {
      if (order.scheduledDate && /^\d{4}-\d{2}-\d{2}$/.test(order.scheduledDate)) {
        if (!map[order.scheduledDate]) map[order.scheduledDate] = [];
        map[order.scheduledDate].push(order);
      }
    }
    Object.values(map).forEach((dayList) => {
      dayList.sort((a, b) => {
        const ta = a.scheduledTime || '99:99';
        const tb = b.scheduledTime || '99:99';
        return ta.localeCompare(tb);
      });
    });
    return map;
  }, [orders]);

  // Active orders without a calendar scheduledDate
  const unscheduledOrders = useMemo(
    () =>
      orders.filter(
        (o) =>
          o.status !== 'delivered' &&
          (!o.scheduledDate || !/^\d{4}-\d{2}-\d{2}$/.test(o.scheduledDate))
      ),
    [orders]
  );

  // Calendar grid cells for cursorMonth
  const calendarDays = useMemo(() => {
    const firstDay = new Date(cursorMonth.year, cursorMonth.month, 1);
    const startWeekday = firstDay.getDay();
    const daysInMonth = new Date(cursorMonth.year, cursorMonth.month + 1, 0).getDate();

    const cells: Array<{ iso: string | null; dayNum: number | null }> = [];
    for (let i = 0; i < startWeekday; i++) {
      cells.push({ iso: null, dayNum: null });
    }
    for (let d = 1; d <= daysInMonth; d++) {
      const mStr = String(cursorMonth.month + 1).padStart(2, '0');
      const dStr = String(d).padStart(2, '0');
      cells.push({
        iso: `${cursorMonth.year}-${mStr}-${dStr}`,
        dayNum: d,
      });
    }
    return cells;
  }, [cursorMonth]);

  const selectedDayOrders = ordersByDate[selectedDate] || [];
  const isSelectedDateBlocked = blockedDatesSet.has(selectedDate);

  const handleToggleSelectedBlock = async () => {
    if (isTogglingBlock || !selectedDate) return;
    setIsTogglingBlock(true);
    try {
      await toggleBlockedDate(selectedDate);
    } finally {
      setIsTogglingBlock(false);
    }
  };

  const monthTitle = useMemo(() => {
    const d = new Date(cursorMonth.year, cursorMonth.month, 1);
    const raw = d.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [cursorMonth]);

  const selectedDateFormatted = useMemo(() => {
    const parts = selectedDate.split('-').map(Number);
    if (parts.length !== 3) return selectedDate;
    const d = new Date(parts[0], parts[1] - 1, parts[2]);
    const raw = d.toLocaleDateString('pt-BR', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  }, [selectedDate]);

  const handlePrevMonth = () => {
    setCursorMonth((prev) =>
      prev.month === 0 ? { year: prev.year - 1, month: 11 } : { year: prev.year, month: prev.month - 1 }
    );
  };

  const handleNextMonth = () => {
    setCursorMonth((prev) =>
      prev.month === 11 ? { year: prev.year + 1, month: 0 } : { year: prev.year, month: prev.month + 1 }
    );
  };

  const handleJumpToday = () => {
    const now = new Date();
    setCursorMonth({ year: now.getFullYear(), month: now.getMonth() });
    setSelectedDate(todayIso);
  };

  const startReschedule = (order: Order) => {
    setRescheduleOrderId(order.id);
    setEditDate(order.scheduledDate || selectedDate || todayIso);
    setEditTime(order.scheduledTime || '14:00');
  };

  const saveReschedule = async (orderId: string) => {
    await updateOrderSchedule(orderId, editDate, editTime);
    if (editDate) {
      setSelectedDate(editDate);
      const [y, m] = editDate.split('-').map(Number);
      if (y && m) setCursorMonth({ year: y, month: m - 1 });
    }
    setRescheduleOrderId(null);
  };

  // Monthly scheduled count
  const monthPrefix = `${cursorMonth.year}-${String(cursorMonth.month + 1).padStart(2, '0')}`;
  const scheduledInMonthCount = useMemo(
    () =>
      orders.filter((o) => o.scheduledDate && o.scheduledDate.startsWith(monthPrefix)).length,
    [orders, monthPrefix]
  );

  return (
    <div className="space-y-6 animate-in fade-in duration-300 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
            Agenda de Entregas & Retiradas
          </h1>
          <p className="text-xs text-[#7C6E68] mt-0.5">
            Calendário mensal com horários agendados para organizar a produção da sua doceria.
          </p>
        </div>

        <button
          type="button"
          onClick={() => openNewOrderModalWithDate(isSelectedDateBlocked ? '' : selectedDate)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D07A6D] shrink-0" />
          <span>Agendar novo pedido</span>
        </button>
      </div>

      {/* Main Split: Calendar (left) + Hourly Day Schedule (right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 items-start">
        {/* Calendar Card */}
        <div className="lg:col-span-7 bg-white rounded-2xl p-4 sm:p-6 border border-[#EFE8DE] shadow-xs min-w-0">
          {/* Calendar Toolbar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-[#EFE8DE]">
            <div>
              <h2 className="text-lg font-serif font-bold text-[#231818]">{monthTitle}</h2>
              <p className="text-[11px] text-[#7C6E68]">
                {scheduledInMonthCount} pedido(s) agendado(s) neste mês
              </p>
            </div>

            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={handleJumpToday}
                className="px-3 py-1.5 rounded-xl bg-[#FBF8F3] hover:bg-[#EFE8DE] border border-[#EFE8DE] text-xs font-semibold text-[#231818] transition-colors cursor-pointer"
              >
                Hoje
              </button>
              <button
                type="button"
                onClick={handlePrevMonth}
                className="p-2 rounded-xl bg-[#FBF8F3] hover:bg-[#EFE8DE] border border-[#EFE8DE] text-[#231818] transition-colors cursor-pointer"
                aria-label="Mês anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextMonth}
                className="p-2 rounded-xl bg-[#FBF8F3] hover:bg-[#EFE8DE] border border-[#EFE8DE] text-[#231818] transition-colors cursor-pointer"
                aria-label="Próximo mês"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1.5 mt-4 mb-2 text-center">
            {WEEKDAY_LABELS.map((day) => (
              <span key={day} className="text-[11px] font-bold uppercase text-[#7C6E68] py-1">
                {day}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1.5 sm:gap-2">
            {calendarDays.map((cell, idx) => {
              if (!cell.iso || cell.dayNum === null) {
                return <div key={`empty-${idx}`} className="h-14 sm:h-20 rounded-xl bg-[#FBF8F3]/40" />;
              }

              const dayOrders = ordersByDate[cell.iso] || [];
              const isToday = cell.iso === todayIso;
              const isSelected = cell.iso === selectedDate;
              const isBlocked = blockedDatesSet.has(cell.iso);

              return (
                <button
                  key={cell.iso}
                  type="button"
                  onClick={() => setSelectedDate(cell.iso!)}
                  title={isBlocked ? 'Dia bloqueado — clique para gerenciar' : undefined}
                  className={`h-14 sm:h-20 p-1.5 sm:p-2 rounded-xl border text-left flex flex-col justify-between transition-all cursor-pointer ${
                    isSelected
                      ? isBlocked
                        ? 'bg-rose-950 text-white border-rose-500 shadow-sm'
                        : 'bg-[#2B1D1D] text-white border-[#2B1D1D] shadow-sm'
                      : isBlocked
                      ? 'bg-rose-50/90 border-rose-200 hover:border-rose-300 text-rose-900'
                      : isToday
                      ? 'bg-[#D07A6D]/10 border-[#D07A6D] text-[#231818]'
                      : dayOrders.length > 0
                      ? 'bg-[#FBF8F3] border-[#E5B5AC] hover:border-[#D07A6D] text-[#231818]'
                      : 'bg-white border-[#EFE8DE] hover:bg-[#FBF8F3] text-[#231818]'
                  }`}
                >
                  <div className="flex items-center justify-between w-full gap-1">
                    <span
                      className={`text-xs sm:text-sm font-bold tabular-nums ${
                        isSelected
                          ? 'text-white'
                          : isBlocked
                          ? 'text-rose-800 line-through decoration-rose-400'
                          : isToday
                          ? 'text-[#B85848]'
                          : 'text-[#231818]'
                      }`}
                    >
                      {cell.dayNum}
                    </span>

                    <div className="flex items-center gap-1">
                      {isBlocked && (
                        <span
                          className={`inline-flex items-center justify-center w-4 h-4 rounded-md ${
                            isSelected ? 'bg-rose-500 text-white' : 'bg-rose-200/80 text-rose-800'
                          }`}
                        >
                          <Lock className="w-2.5 h-2.5" />
                        </span>
                      )}
                      {dayOrders.length > 0 && (
                        <span
                          className={`text-[9px] sm:text-[10px] font-bold px-1.5 py-0.5 rounded-md tabular-nums ${
                            isSelected
                              ? 'bg-[#D07A6D] text-white'
                              : 'bg-[#2B1D1D] text-white'
                          }`}
                        >
                          {dayOrders.length}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Mini time preview / blocked badge */}
                  {isBlocked && dayOrders.length === 0 ? (
                    <div className="w-full overflow-hidden">
                      <span
                        className={`hidden sm:inline-block text-[9px] font-bold uppercase tracking-wide truncate ${
                          isSelected ? 'text-rose-200' : 'text-rose-700'
                        }`}
                      >
                        Bloqueado
                      </span>
                    </div>
                  ) : dayOrders.length > 0 ? (
                    <div className="w-full space-y-0.5 overflow-hidden">
                      <div className="flex sm:hidden items-center gap-0.5 flex-wrap">
                        {dayOrders.slice(0, 3).map((ord) => (
                          <span
                            key={ord.id}
                            className={`w-1.5 h-1.5 rounded-full ${STATUS_STYLES[ord.status].dot}`}
                          />
                        ))}
                      </div>
                      <div className="hidden sm:block space-y-0.5">
                        {dayOrders.slice(0, 2).map((ord) => (
                          <p
                            key={ord.id}
                            className={`text-[9px] truncate leading-tight ${
                              isSelected ? 'text-white/85' : 'text-[#7C6E68]'
                            }`}
                          >
                            {ord.scheduledTime ? `${ord.scheduledTime} ` : ''}
                            {ord.customerName.split(' ')[0]}
                          </p>
                        ))}
                      </div>
                    </div>
                  ) : null}
                </button>
              );
            })}
          </div>

          {/* Calendar Legend */}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 pt-4 mt-4 border-t border-[#EFE8DE] text-[11px] text-[#7C6E68]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#D07A6D]/30 border border-[#D07A6D]" />
              Hoje
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#FBF8F3] border border-[#E5B5AC]" />
              Com pedidos
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-rose-100 border border-rose-300" />
              Dia bloqueado (clique no dia para bloquear/liberar)
            </span>
          </div>
        </div>

        {/* Selected Day Schedule Panel */}
        <div className="lg:col-span-5 bg-white rounded-2xl p-4 sm:p-6 border border-[#EFE8DE] shadow-xs min-w-0 space-y-4">
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3.5 border-b border-[#EFE8DE]">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D]">
                  Horários do Dia
                </span>
                {isSelectedDateBlocked && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-rose-100 text-rose-800 text-[10px] font-bold">
                    <Lock className="w-2.5 h-2.5" />
                    Bloqueado
                  </span>
                )}
              </div>
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#231818] truncate mt-0.5">
                {selectedDateFormatted}
              </h3>
              <p className="text-xs text-[#7C6E68] mt-0.5">
                {selectedDayOrders.length === 0
                  ? isSelectedDateBlocked
                    ? 'Agenda fechada para novos pedidos neste dia'
                    : 'Nenhum horário ocupado neste dia'
                  : `${selectedDayOrders.length} agendamento(s) ordenado(s) por hora`}
              </p>
            </div>

            <div className="flex items-center gap-1.5 shrink-0">
              <button
                type="button"
                disabled={isTogglingBlock}
                onClick={handleToggleSelectedBlock}
                className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-semibold transition-colors cursor-pointer disabled:opacity-60 ${
                  isSelectedDateBlocked
                    ? 'bg-emerald-50 hover:bg-emerald-100 border-emerald-200 text-emerald-800'
                    : 'bg-rose-50 hover:bg-rose-100 border-rose-200 text-rose-800'
                }`}
              >
                {isSelectedDateBlocked ? (
                  <>
                    <Unlock className="w-3.5 h-3.5" />
                    <span>Desbloquear dia</span>
                  </>
                ) : (
                  <>
                    <Lock className="w-3.5 h-3.5" />
                    <span>Bloquear dia</span>
                  </>
                )}
              </button>

              {!isSelectedDateBlocked && (
                <button
                  type="button"
                  onClick={() => openNewOrderModalWithDate(selectedDate)}
                  className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-[#FBF8F3] hover:bg-[#EFE8DE] border border-[#EFE8DE] text-xs font-semibold text-[#231818] shrink-0 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5 text-[#D07A6D]" />
                  <span>Agendar</span>
                </button>
              )}
            </div>
          </div>

          {isSelectedDateBlocked && selectedDayOrders.length > 0 && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-900">
              <Ban className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <div className="space-y-0.5">
                <p className="font-bold">Dia bloqueado para novos pedidos</p>
                <p className="text-[11px] text-rose-800/90">
                  Os pedidos já confirmados abaixo permanecem na sua lista, mas clientes não poderão
                  escolher esta data no cardápio público.
                </p>
              </div>
            </div>
          )}

          {selectedDayOrders.length === 0 ? (
            isSelectedDateBlocked ? (
              <div className="py-10 px-4 rounded-2xl bg-rose-50/70 border border-rose-200 text-center space-y-3">
                <div className="w-10 h-10 rounded-full bg-rose-100 text-rose-700 flex items-center justify-center mx-auto">
                  <Lock className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-950">Dia bloqueado na agenda</p>
                  <p className="text-[11px] text-rose-800/90 mt-1 max-w-xs mx-auto">
                    Esta data está fechada e não permite novos agendamentos no painel ou no cardápio público.
                  </p>
                </div>
                <button
                  type="button"
                  disabled={isTogglingBlock}
                  onClick={handleToggleSelectedBlock}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-semibold cursor-pointer disabled:opacity-60"
                >
                  <Unlock className="w-3.5 h-3.5" />
                  <span>Desbloquear este dia</span>
                </button>
              </div>
            ) : (
              <div className="py-10 px-4 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE] text-center space-y-3">
                <CalendarIcon className="w-8 h-8 text-[#D07A6D]/60 mx-auto" />
                <div>
                  <p className="text-xs font-bold text-[#231818]">Agenda livre nesta data</p>
                  <p className="text-[11px] text-[#7C6E68] mt-1">
                    Clique abaixo para criar uma encomenda ou bloqueie o dia se não for atender.
                  </p>
                </div>
                <div className="flex flex-wrap items-center justify-center gap-2">
                  <button
                    type="button"
                    onClick={() => openNewOrderModalWithDate(selectedDate)}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5 text-[#D07A6D]" />
                    <span>Agendar pedido</span>
                  </button>
                  <button
                    type="button"
                    disabled={isTogglingBlock}
                    onClick={handleToggleSelectedBlock}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white hover:bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold cursor-pointer disabled:opacity-60"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    <span>Bloquear este dia</span>
                  </button>
                </div>
              </div>
            )
          ) : (
            <div className="space-y-3">
              {selectedDayOrders.map((order) => {
                const st = STATUS_STYLES[order.status];
                const paid = getOrderPaidAmount(order);
                const remaining = getOrderRemainingAmount(order);
                const isEditingSchedule = rescheduleOrderId === order.id;

                return (
                  <div
                    key={order.id}
                    className="p-3.5 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE] space-y-2.5"
                  >
                    {/* Top: Time + Customer + Status */}
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="px-2.5 py-1.5 rounded-xl bg-[#2B1D1D] text-white text-xs font-bold font-mono flex items-center gap-1 shrink-0 tabular-nums">
                          <Clock className="w-3 h-3 text-[#D07A6D]" />
                          <span>{order.scheduledTime || 'S/ hora'}</span>
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-xs sm:text-sm font-bold text-[#231818] truncate">
                            {order.customerName}
                          </h4>
                          <p className="text-[11px] text-[#7C6E68] font-mono">
                            {order.orderNumber} ·{' '}
                            <span className="font-sans">
                              {order.deliveryType === 'entrega' ? 'Entrega' : 'Retirada'}
                            </span>
                          </p>
                        </div>
                      </div>

                      <span
                        className={`text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap shrink-0 ${st.badge}`}
                      >
                        {st.label}
                      </span>
                    </div>

                    {/* Items summary */}
                    <div className="text-xs text-[#231818] space-y-0.5 pl-1">
                      {order.items.map((it, idx) => (
                        <p key={idx} className="truncate">
                          <strong className="text-[#D07A6D]">{it.quantity}x</strong> {it.productName}
                        </p>
                      ))}
                    </div>

                    {/* Financial / Sinal summary */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#EFE8DE] text-[11px]">
                      <div>
                        <span className="text-[#7C6E68]">Total: </span>
                        <strong className="font-serif text-[#231818] tabular-nums">
                          R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                        </strong>
                        {remaining > 0.01 ? (
                          <span className="ml-2 text-amber-800 font-semibold">
                            {paid > 0
                              ? `(Sinal R$ ${paid.toFixed(2).replace('.', ',')} · Falta R$ ${remaining
                                  .toFixed(2)
                                  .replace('.', ',')})`
                              : `(A receber R$ ${remaining.toFixed(2).replace('.', ',')})`}
                          </span>
                        ) : (
                          <span className="ml-2 text-emerald-700 font-semibold">· Pago</span>
                        )}
                      </div>

                      {remaining > 0.01 && (
                        <button
                          type="button"
                          onClick={() => updateOrderPayment(order.id, 'pago', order.totalAmount)}
                          className="text-[11px] font-bold text-emerald-700 hover:underline cursor-pointer"
                        >
                          Quitar restante
                        </button>
                      )}
                    </div>

                    {/* Inline Reschedule Form */}
                    {isEditingSchedule && (
                      <div className="p-2.5 rounded-xl bg-white border border-[#D07A6D]/40 space-y-2">
                        <div className="grid grid-cols-2 gap-2">
                          <input
                            type="date"
                            value={editDate}
                            onChange={(e) => setEditDate(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-lg"
                          />
                          <input
                            type="time"
                            value={editTime}
                            onChange={(e) => setEditTime(e.target.value)}
                            className="px-2.5 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-lg"
                          />
                        </div>
                        <div className="flex items-center justify-end gap-2">
                          <button
                            type="button"
                            onClick={() => setRescheduleOrderId(null)}
                            className="px-2.5 py-1 text-[11px] text-[#7C6E68] cursor-pointer"
                          >
                            Cancelar
                          </button>
                          <button
                            type="button"
                            onClick={() => saveReschedule(order.id)}
                            className="px-3 py-1 rounded-lg bg-[#2B1D1D] text-white text-[11px] font-semibold cursor-pointer"
                          >
                            Salvar horário
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Actions */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() =>
                            setStatusNotification({ order, newStatus: order.status })
                          }
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-[11px] font-semibold transition-colors cursor-pointer"
                        >
                          <MessageCircle className="w-3 h-3" />
                          <span>Avisar cliente</span>
                        </button>

                        {order.status !== 'delivered' && (
                          <button
                            type="button"
                            onClick={() => startReschedule(order)}
                            className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#EFE8DE]/60 border border-[#EFE8DE] text-[11px] font-medium text-[#7C6E68] hover:text-[#231818] transition-colors cursor-pointer"
                          >
                            <Edit3 className="w-3 h-3" />
                            <span>Hora</span>
                          </button>
                        )}
                      </div>

                      {order.status === 'pending' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'in_production')}
                          className="px-3 py-1.5 rounded-lg bg-[#D07A6D] hover:bg-[#B85848] text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Iniciar Produção →
                        </button>
                      )}
                      {order.status === 'in_production' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Marcar Pronto →
                        </button>
                      )}
                      {order.status === 'ready' && (
                        <button
                          type="button"
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-[11px] font-semibold cursor-pointer"
                        >
                          Marcar Entregue ✓
                        </button>
                      )}
                      {order.status === 'delivered' && (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                          <CheckCircle className="w-3.5 h-3.5" /> Concluído
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Unscheduled active orders reminder */}
      {unscheduledOrders.length > 0 && (
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] shadow-xs space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-serif font-bold text-[#231818]">
                Pedidos sem data/hora definida ({unscheduledOrders.length})
              </h3>
              <p className="text-[11px] text-[#7C6E68]">
                Defina um dia e horário para esses pedidos aparecerem no calendário.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {unscheduledOrders.map((order) => (
              <div
                key={order.id}
                className="p-3 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE] flex items-center justify-between gap-3"
              >
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[#231818] truncate">
                    {order.customerName}{' '}
                    <span className="font-mono font-normal text-[#7C6E68]">{order.orderNumber}</span>
                  </p>
                  <p className="text-[11px] text-[#7C6E68] truncate flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-[#D07A6D] shrink-0" />
                    <span>{formatScheduledLabel(order.scheduledDate, order.scheduledTime)}</span>
                  </p>
                </div>

                <button
                  type="button"
                  disabled={isSelectedDateBlocked}
                  onClick={async () => {
                    await updateOrderSchedule(order.id, selectedDate, '14:00');
                  }}
                  className="px-2.5 py-1.5 rounded-lg bg-[#2B1D1D] hover:bg-[#3D2B2B] disabled:opacity-45 disabled:cursor-not-allowed text-white text-[11px] font-semibold shrink-0 cursor-pointer"
                >
                  {isSelectedDateBlocked
                    ? 'Dia bloqueado'
                    : `Agendar p/ ${selectedDate.split('-').reverse().slice(0, 2).join('/')}`}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
