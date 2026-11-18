import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { TrendingUp, Plus, ChevronDown, Package, Check } from 'lucide-react';
import { OrderStatus } from '../../types';
import { formatScheduledLabel, getOrderRemainingAmount } from '../../utils/orderHelpers';

type SalesTimeRange = '7d' | '15d' | 'last_month';

const RANGE_LABELS: Record<SalesTimeRange, string> = {
  '7d': 'Últimos 7 dias',
  '15d': 'Últimos 15 dias',
  last_month: 'Mês passado',
};

function toLocalDayKey(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export const OverviewView: React.FC = () => {
  const {
    monthlyRevenue,
    totalOrdersCount,
    averageTicket,
    orders,
    currentStore,
    setIsNewOrderModalOpen,
    setActiveTab,
    updateOrderStatus,
  } = useComfy();

  const [timeRange, setTimeRange] = useState<SalesTimeRange>('7d');
  const [isRangeMenuOpen, setIsRangeMenuOpen] = useState(false);
  const [selectedBarIndex, setSelectedBarIndex] = useState<number>(6);
  const rangeDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        rangeDropdownRef.current &&
        !rangeDropdownRef.current.contains(event.target as Node)
      ) {
        setIsRangeMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const chartData = useMemo(() => {
    const now = new Date();
    const dailyTotals: Record<string, { amount: number; count: number }> = {};

    orders.forEach((o) => {
      const parsed = new Date(o.createdAt);
      if (Number.isNaN(parsed.getTime())) return;
      const key = toLocalDayKey(parsed);
      if (!dailyTotals[key]) dailyTotals[key] = { amount: 0, count: 0 };
      dailyTotals[key].amount += o.totalAmount;
      dailyTotals[key].count += 1;
    });

    if (timeRange === '7d' || timeRange === '15d') {
      const daysCount = timeRange === '7d' ? 7 : 15;
      const bars: Array<{
        key: string;
        label: string;
        fullName: string;
        amount: number;
        ordersCount: number;
        isPeak: boolean;
      }> = [];

      for (let i = daysCount - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() - i);
        const key = toLocalDayKey(d);
        const entry = dailyTotals[key] || { amount: 0, count: 0 };
        const shortWeekday = d
          .toLocaleDateString('pt-BR', { weekday: 'short' })
          .replace('.', '')
          .slice(0, 3);
        const fullWeekday = d.toLocaleDateString('pt-BR', { weekday: 'long' });
        const dateShort = `${String(d.getDate()).padStart(2, '0')}/${String(
          d.getMonth() + 1
        ).padStart(2, '0')}`;

        bars.push({
          key,
          label: timeRange === '7d' ? shortWeekday : String(d.getDate()).padStart(2, '0'),
          fullName: `${
            fullWeekday.charAt(0).toUpperCase() + fullWeekday.slice(1)
          }, ${dateShort}`,
          amount: entry.amount,
          ordersCount: entry.count,
          isPeak: false,
        });
      }

      const maxVal = Math.max(...bars.map((b) => b.amount), 0);
      return bars.map((b) => ({
        ...b,
        isPeak: maxVal > 0 && b.amount === maxVal,
      }));
    }

    // last_month: group previous calendar month into weekly intervals
    const prevMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const prevYear = prevMonthDate.getFullYear();
    const prevMonth = prevMonthDate.getMonth();
    const daysInPrevMonth = new Date(prevYear, prevMonth + 1, 0).getDate();
    const monthStr = String(prevMonth + 1).padStart(2, '0');
    const monthNameRaw = prevMonthDate.toLocaleDateString('pt-BR', { month: 'long' });
    const monthName = monthNameRaw.charAt(0).toUpperCase() + monthNameRaw.slice(1);

    const ranges: Array<[number, number]> = [
      [1, 7],
      [8, 14],
      [15, 21],
      [22, 28],
    ];
    if (daysInPrevMonth > 28) {
      ranges.push([29, daysInPrevMonth]);
    }

    const weekBars = ranges.map(([startDay, endDay], idx) => {
      let amount = 0;
      let count = 0;
      for (let d = startDay; d <= endDay; d++) {
        const key = `${prevYear}-${monthStr}-${String(d).padStart(2, '0')}`;
        const entry = dailyTotals[key];
        if (entry) {
          amount += entry.amount;
          count += entry.count;
        }
      }
      return {
        key: `w-${idx}`,
        label: `${String(startDay).padStart(2, '0')}-${String(endDay).padStart(2, '0')}`,
        fullName: `${String(startDay).padStart(2, '0')} a ${String(endDay).padStart(
          2,
          '0'
        )} de ${monthName}`,
        amount,
        ordersCount: count,
        isPeak: false,
      };
    });

    const maxVal = Math.max(...weekBars.map((b) => b.amount), 0);
    return weekBars.map((b) => ({
      ...b,
      isPeak: maxVal > 0 && b.amount === maxVal,
    }));
  }, [orders, timeRange]);

  const periodTotalRevenue = useMemo(
    () => chartData.reduce((s, b) => s + b.amount, 0),
    [chartData]
  );

  const handleSelectRange = (next: SalesTimeRange) => {
    setTimeRange(next);
    setIsRangeMenuOpen(false);
    setSelectedBarIndex(next === '7d' ? 6 : next === '15d' ? 14 : 0);
  };

  const safeSelectedIdx =
    selectedBarIndex >= 0 && selectedBarIndex < chartData.length
      ? selectedBarIndex
      : chartData.length - 1;

  const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    in_production: { label: 'Em produção', color: 'text-[#D07A6D]', bg: 'bg-[#D07A6D]/10' },
    ready: { label: 'Pronto p/ retirada', color: 'text-amber-800', bg: 'bg-amber-100' },
    delivered: { label: 'Entregue', color: 'text-emerald-800', bg: 'bg-emerald-100' },
    pending: { label: 'Aguardando', color: 'text-[#7C6E68]', bg: 'bg-[#EFE8DE]' },
  };

  const maxSale = Math.max(...chartData.map((d) => d.amount), 1);
  const firstName = currentStore?.ownerName?.trim()
    ? currentStore.ownerName.trim().split(' ')[0]
    : 'Confeiteira';

  const paidOrdersCount = orders.filter((o) => o.paymentStatus === 'pago').length;
  const deliveredOrdersCount = orders.filter((o) => o.status === 'delivered').length;
  const openOrdersCount = totalOrdersCount - deliveredOrdersCount;

  return (
    <div className="space-y-5 sm:space-y-6 animate-in fade-in duration-300 min-w-0">
      {/* Top Section: Kicker, Greeting & Action Button */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4 min-w-0">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-1.5 mb-1">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D07A6D]" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#D07A6D]">
              Resumo da Operação
            </span>
          </div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818] tracking-tight break-words">
            Olá, {firstName} <span className="text-[#D07A6D] font-normal">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7C6E68] mt-0.5 font-normal">
            Dados sincronizados em tempo real com o banco de dados da sua doceria.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsNewOrderModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 sm:px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs sm:text-sm font-semibold transition-all shadow-xs cursor-pointer min-h-[44px] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D07A6D] shrink-0" />
          <span>Novo pedido</span>
        </button>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 sm:gap-4 lg:gap-5">
        {/* Metric 1 */}
        <div className="min-w-0 overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/30 transition-all flex flex-col justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6E68] truncate">
              Faturamento registrado
            </p>
            <h3 className="text-xl sm:text-lg md:text-xl xl:text-[26px] font-serif font-bold text-[#231818] mt-1.5 mb-2 tabular-nums leading-tight whitespace-nowrap truncate">
              R${' '}
              {monthlyRevenue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#7C6E68]">
            <TrendingUp className="w-3.5 h-3.5 shrink-0 text-[#4A7C59]" />
            <span className="truncate">
              {totalOrdersCount === 0
                ? 'Nenhuma venda registrada ainda'
                : `${paidOrdersCount} pedido(s) com pagamento quitado`}
            </span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="min-w-0 overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/30 transition-all flex flex-col justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6E68] truncate">
              Pedidos recebidos
            </p>
            <h3 className="text-xl sm:text-lg md:text-xl xl:text-[26px] font-serif font-bold text-[#231818] mt-1.5 mb-2 tabular-nums leading-tight whitespace-nowrap truncate">
              {totalOrdersCount}
            </h3>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#7C6E68]">
            <TrendingUp className="w-3.5 h-3.5 shrink-0 text-[#D07A6D]" />
            <span className="truncate">
              {totalOrdersCount === 0
                ? '0 em produção · 0 entregues'
                : `${openOrdersCount} em aberto · ${deliveredOrdersCount} concluído(s)`}
            </span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="min-w-0 overflow-hidden bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/30 transition-all flex flex-col justify-between">
          <div className="min-w-0">
            <p className="text-[11px] font-semibold uppercase tracking-wider text-[#7C6E68] truncate">
              Ticket médio
            </p>
            <h3 className="text-xl sm:text-lg md:text-xl xl:text-[26px] font-serif font-bold text-[#231818] mt-1.5 mb-2 tabular-nums leading-tight whitespace-nowrap truncate">
              R${' '}
              {averageTicket.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#7C6E68]">
            <TrendingUp className="w-3.5 h-3.5 shrink-0 text-[#4A7C59]" />
            <span className="truncate">
              {totalOrdersCount === 0
                ? 'Calculado a partir dos pedidos reais'
                : `Média de ${totalOrdersCount} encomenda(s)`}
            </span>
          </div>
        </div>
      </div>

      {/* Lower Section: Chart & Recent Orders */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Vendas Bar Chart Card */}
        <div className="lg:col-span-6 xl:col-span-7 min-w-0 bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-[#EFE8DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#231818]">Vendas</h2>

              {/* Interactive Time Range Dropdown */}
              <div className="relative" ref={rangeDropdownRef}>
                <button
                  type="button"
                  onClick={() => setIsRangeMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#231818] bg-[#FBF8F3] hover:bg-[#EFE8DE]/70 px-3 py-1.5 rounded-xl border border-[#EFE8DE] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>{RANGE_LABELS[timeRange]}</span>
                  <ChevronDown
                    className={`w-3.5 h-3.5 text-[#D07A6D] transition-transform ${
                      isRangeMenuOpen ? 'rotate-180' : ''
                    }`}
                  />
                </button>

                {isRangeMenuOpen && (
                  <div className="absolute right-0 mt-1.5 w-44 bg-white rounded-xl shadow-xl border border-[#EFE8DE] py-1.5 z-20 animate-in fade-in duration-150">
                    {(['7d', '15d', 'last_month'] as SalesTimeRange[]).map((optionKey) => {
                      const active = timeRange === optionKey;
                      return (
                        <button
                          key={optionKey}
                          type="button"
                          onClick={() => handleSelectRange(optionKey)}
                          className={`w-full px-3.5 py-2 text-left text-xs flex items-center justify-between transition-colors cursor-pointer ${
                            active
                              ? 'bg-[#FBF8F3] text-[#231818] font-bold'
                              : 'text-[#7C6E68] hover:bg-[#FBF8F3] hover:text-[#231818]'
                          }`}
                        >
                          <span>{RANGE_LABELS[optionKey]}</span>
                          {active && <Check className="w-3.5 h-3.5 text-[#D07A6D]" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs text-[#7C6E68]">
                {timeRange === '7d' && 'Movimentação real dos últimos 7 dias'}
                {timeRange === '15d' && 'Movimentação real dos últimos 15 dias'}
                {timeRange === 'last_month' && 'Movimentação real do mês passado por semana'}
              </p>
              <span className="text-[11px] font-semibold text-[#D07A6D] tabular-nums">
                Total: R$ {periodTotalRevenue.toFixed(2).replace('.', ',')}
              </span>
            </div>
          </div>

          {/* Interactive Chart Container */}
          <div className="mt-6 pt-2">
            <div
              className={`h-40 sm:h-44 flex items-end justify-between px-0.5 sm:px-2 ${
                timeRange === '15d' ? 'gap-0.5 sm:gap-1.5' : 'gap-1.5 sm:gap-2.5'
              }`}
            >
              {chartData.map((item, idx) => {
                const heightPercent =
                  item.amount === 0 ? 6 : Math.max(12, Math.round((item.amount / maxSale) * 100));
                const isSelected = safeSelectedIdx === idx;
                const isPeak = item.isPeak;

                return (
                  <div
                    key={item.key}
                    onClick={() => setSelectedBarIndex(idx)}
                    className="flex-1 min-w-0 flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    <div
                      className={`text-[8px] sm:text-[10px] tabular-nums whitespace-nowrap transition-all duration-200 ${
                        isSelected
                          ? 'opacity-100 -translate-y-0.5 text-[#231818] font-bold'
                          : 'opacity-0 group-hover:opacity-100 text-[#7C6E68] font-medium'
                      }`}
                    >
                      {timeRange === '15d' && !isSelected
                        ? `${item.amount.toFixed(0)}`
                        : `R$ ${item.amount.toFixed(0)}`}
                    </div>

                    <div className="w-full flex items-end justify-center h-28 sm:h-32">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full rounded-t-lg transition-all duration-300 ${
                          timeRange === '15d'
                            ? 'max-w-[16px] sm:max-w-[22px]'
                            : 'max-w-[34px] sm:max-w-[46px]'
                        } ${
                          isPeak
                            ? 'bg-[#B85848]'
                            : isSelected
                            ? 'bg-[#D07A6D]'
                            : item.amount === 0
                            ? 'bg-[#EFE8DE]'
                            : 'bg-[#E5B5AC] hover:bg-[#D07A6D]'
                        }`}
                      />
                    </div>

                    <span
                      className={`capitalize transition-colors truncate max-w-full ${
                        timeRange === '15d' ? 'text-[9px] sm:text-[11px]' : 'text-[11px] sm:text-xs'
                      } ${isSelected ? 'font-bold text-[#231818]' : 'text-[#7C6E68]'}`}
                    >
                      {item.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {chartData[safeSelectedIdx] && (
              <div className="mt-3.5 pt-2.5 border-t border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#7C6E68]">
                <span>
                  {chartData[safeSelectedIdx].fullName}:{' '}
                  <strong className="text-[#231818] tabular-nums">
                    {chartData[safeSelectedIdx].ordersCount} pedidos
                  </strong>
                </span>
                <span className="font-serif font-bold text-[#231818] text-xs sm:text-sm tabular-nums">
                  Faturamento: R$ {chartData[safeSelectedIdx].amount.toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Recent Orders Card */}
        <div className="lg:col-span-6 xl:col-span-5 min-w-0 bg-white rounded-2xl p-4 sm:p-5 lg:p-6 border border-[#EFE8DE] shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between gap-2 mb-0.5">
              <h2 className="text-base sm:text-lg font-serif font-bold text-[#231818]">
                Pedidos recentes
              </h2>
              <button
                type="button"
                onClick={() => setActiveTab('pedidos')}
                className="text-xs font-semibold text-[#D07A6D] hover:underline cursor-pointer whitespace-nowrap shrink-0"
              >
                Ver todos
              </button>
            </div>
            <p className="text-xs text-[#7C6E68]">Sincronizados com o banco de dados</p>

            {/* Orders list or empty state */}
            <div className="mt-4 space-y-2.5">
              {orders.length === 0 ? (
                <div className="py-8 px-4 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE]/70 text-center space-y-2">
                  <Package className="w-7 h-7 text-[#7C6E68]/50 mx-auto" />
                  <p className="text-xs font-semibold text-[#231818]">
                    Nenhum pedido registrado ainda
                  </p>
                  <p className="text-[11px] text-[#7C6E68]">
                    Cadastre produtos no catálogo e registre sua primeira encomenda.
                  </p>
                </div>
              ) : (
                orders.slice(0, 4).map((order) => {
                  const conf = statusConfig[order.status];
                  const remaining = getOrderRemainingAmount(order);
                  const sched =
                    order.scheduledDate || order.scheduledTime
                      ? formatScheduledLabel(order.scheduledDate, order.scheduledTime)
                      : null;
                  return (
                    <div
                      key={order.id}
                      className="p-2.5 sm:p-3 rounded-xl bg-[#FBF8F3] hover:bg-[#F8F4EE] border border-[#EFE8DE]/60 transition-all flex items-center justify-between gap-2.5 min-w-0"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-8 h-8 rounded-full bg-[#EFE8DE] text-[#7C6E68] flex items-center justify-center text-xs font-bold shrink-0">
                          {order.customerInitials}
                        </div>

                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-semibold text-[#231818] truncate">
                            {order.customerName}
                          </p>
                          <div className="flex items-center gap-1.5 text-[11px] text-[#7C6E68] mt-0.5 flex-wrap">
                            <span className="font-mono text-[10px] tabular-nums">
                              {order.orderNumber}
                            </span>
                            <span>·</span>
                            <span className="tabular-nums">{order.items.length} itens</span>
                            <span>·</span>
                            <span className={`${conf.color} font-medium`}>{conf.label}</span>
                            {sched && (
                              <>
                                <span>·</span>
                                <span className="text-[#231818]">{sched}</span>
                              </>
                            )}
                            {remaining > 0.01 && order.paymentStatus === '50_sinal' && (
                              <>
                                <span>·</span>
                                <span className="text-amber-800 font-medium">
                                  Falta R$ {remaining.toFixed(2).replace('.', ',')}
                                </span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <p className="text-xs sm:text-sm font-serif font-bold text-[#231818] tabular-nums whitespace-nowrap">
                          R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                        </p>
                        {order.status === 'delivered' ? (
                          <span className="text-[10px] text-emerald-700 font-medium mt-0.5 inline-block whitespace-nowrap">
                            Concluído ✓
                          </span>
                        ) : (
                          <button
                            type="button"
                            onClick={() =>
                              updateOrderStatus(
                                order.id,
                                order.status === 'pending'
                                  ? 'in_production'
                                  : order.status === 'in_production'
                                  ? 'ready'
                                  : 'delivered'
                              )
                            }
                            title="Avançar status"
                            className="text-[10px] text-[#7C6E68] hover:text-[#D07A6D] mt-0.5 inline-block cursor-pointer whitespace-nowrap"
                          >
                            {order.status === 'pending' && 'Iniciar produção →'}
                            {order.status === 'in_production' && 'Marcar pronto →'}
                            {order.status === 'ready' && 'Marcar entregue ✓'}
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-[#D07A6D]/40 text-[#D07A6D] hover:bg-[#D07A6D]/5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Cadastrar nova encomenda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
