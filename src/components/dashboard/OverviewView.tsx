import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { TrendingUp, Plus, ChevronDown } from 'lucide-react';
import { OrderStatus } from '../../types';

export const OverviewView: React.FC = () => {
  const {
    monthlyRevenue,
    totalOrdersCount,
    averageTicket,
    orders,
    salesWeek,
    currentStore,
    setIsNewOrderModalOpen,
    setActiveTab,
    updateOrderStatus,
  } = useComfy();

  const [timeRange] = useState('Últimos 7 dias');
  const [selectedDayIndex, setSelectedDayIndex] = useState<number | null>(3);

  const statusConfig: Record<OrderStatus, { label: string; color: string; bg: string }> = {
    in_production: { label: 'Em produção', color: 'text-[#D07A6D]', bg: 'bg-[#D07A6D]/10' },
    ready: { label: 'Pronto p/ retirada', color: 'text-amber-800', bg: 'bg-amber-100' },
    delivered: { label: 'Entregue', color: 'text-emerald-800', bg: 'bg-emerald-100' },
    pending: { label: 'Aguardando', color: 'text-[#7C6E68]', bg: 'bg-[#EFE8DE]' },
  };

  const maxSale = Math.max(...salesWeek.map((d) => d.amount), 1);
  const firstName = currentStore?.ownerName ? currentStore.ownerName.split(' ')[0] : 'Marina';

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
            Bom dia, {firstName} <span className="text-[#D07A6D] font-normal">✦</span>
          </h1>
          <p className="text-xs sm:text-sm text-[#7C6E68] mt-0.5 font-normal">
            Aqui está o que está acontecendo na sua doceria hoje.
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
              Vendas no mês
            </p>
            <h3 className="text-xl sm:text-lg md:text-xl xl:text-[26px] font-serif font-bold text-[#231818] mt-1.5 mb-2 tabular-nums leading-tight whitespace-nowrap truncate">
              R${' '}
              {monthlyRevenue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              })}
            </h3>
          </div>
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#4A7C59]">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">↑ 18,4% vs. mês anterior</span>
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
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#4A7C59]">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">↑ 12,2% vs. mês anterior</span>
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
          <div className="inline-flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-[#4A7C59]">
            <TrendingUp className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">↑ 4,8% vs. mês anterior</span>
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
              <button
                type="button"
                className="inline-flex items-center gap-1.5 text-xs font-medium text-[#7C6E68] bg-[#FBF8F3] px-2.5 py-1 rounded-lg border border-[#EFE8DE] hover:text-[#231818] transition-colors whitespace-nowrap shrink-0"
              >
                <span>{timeRange}</span>
                <ChevronDown className="w-3 h-3" />
              </button>
            </div>
            <p className="text-xs text-[#7C6E68]">Desempenho nos últimos 7 dias</p>
          </div>

          {/* Interactive Chart Container */}
          <div className="mt-6 pt-2">
            <div className="h-40 sm:h-44 flex items-end justify-between gap-1.5 sm:gap-2.5 px-0.5 sm:px-2">
              {salesWeek.map((item, idx) => {
                const heightPercent = Math.max(12, Math.round((item.amount / maxSale) * 100));
                const isSelected = selectedDayIndex === idx;
                const isPeak = item.isPeak;

                return (
                  <div
                    key={item.day}
                    onClick={() => setSelectedDayIndex(idx)}
                    className="flex-1 min-w-0 flex flex-col items-center gap-1.5 group cursor-pointer"
                  >
                    {/* Tooltip / Value on hover or select */}
                    <div
                      className={`text-[9px] sm:text-[11px] tabular-nums whitespace-nowrap transition-all duration-200 ${
                        isSelected
                          ? 'opacity-100 -translate-y-0.5 text-[#231818] font-bold'
                          : 'opacity-0 group-hover:opacity-100 text-[#7C6E68] font-medium'
                      }`}
                    >
                      R$ {item.amount}
                    </div>

                    {/* Bar */}
                    <div className="w-full flex items-end justify-center h-28 sm:h-32">
                      <div
                        style={{ height: `${heightPercent}%` }}
                        className={`w-full max-w-[34px] sm:max-w-[42px] rounded-t-lg transition-all duration-300 ${
                          isPeak
                            ? 'bg-[#B85848]'
                            : isSelected
                            ? 'bg-[#D07A6D]'
                            : 'bg-[#E5B5AC] hover:bg-[#D07A6D]'
                        }`}
                      />
                    </div>

                    {/* Day label */}
                    <span
                      className={`text-[11px] sm:text-xs capitalize transition-colors ${
                        isSelected ? 'font-bold text-[#231818]' : 'text-[#7C6E68]'
                      }`}
                    >
                      {item.day}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Selected day summary line */}
            {selectedDayIndex !== null && (
              <div className="mt-3.5 pt-2.5 border-t border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs text-[#7C6E68]">
                <span>
                  {salesWeek[selectedDayIndex].fullName}:{' '}
                  <strong className="text-[#231818] tabular-nums">
                    {salesWeek[selectedDayIndex].ordersCount} pedidos
                  </strong>
                </span>
                <span className="font-serif font-bold text-[#231818] text-xs sm:text-sm tabular-nums">
                  Faturamento: R$ {salesWeek[selectedDayIndex].amount.toFixed(2).replace('.', ',')}
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
            <p className="text-xs text-[#7C6E68]">Atualizados agora</p>

            {/* Orders list */}
            <div className="mt-4 space-y-2.5">
              {orders.slice(0, 4).map((order) => {
                const conf = statusConfig[order.status];
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
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-xs sm:text-sm font-serif font-bold text-[#231818] tabular-nums whitespace-nowrap">
                        R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                      </p>
                      <button
                        type="button"
                        onClick={() =>
                          updateOrderStatus(
                            order.id,
                            order.status === 'in_production'
                              ? 'ready'
                              : order.status === 'ready'
                              ? 'delivered'
                              : 'in_production'
                          )
                        }
                        title="Avançar status"
                        className="text-[10px] text-[#7C6E68] hover:text-[#D07A6D] mt-0.5 inline-block cursor-pointer whitespace-nowrap"
                      >
                        {order.status === 'in_production' && 'Marcar pronto →'}
                        {order.status === 'ready' && 'Marcar entregue ✓'}
                        {order.status === 'delivered' && 'Concluído'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <button
            type="button"
            onClick={() => setIsNewOrderModalOpen(true)}
            className="w-full mt-4 py-2.5 rounded-xl border border-dashed border-[#D07A6D]/40 text-[#D07A6D] hover:bg-[#D07A6D]/5 text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 shrink-0" />
            <span>Cadastrar outra encomenda</span>
          </button>
        </div>
      </div>
    </div>
  );
};
