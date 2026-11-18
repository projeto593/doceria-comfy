import React, { useMemo, useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import {
  formatMonthLabel,
  formatShortMonthLabel,
  getOrderMonthKey,
  getOrderPaidAmount,
  getOrderRemainingAmount,
} from '../../utils/orderHelpers';
import {
  ArrowDownRight,
  ArrowUpRight,
  Calendar,
  Check,
  Copy,
  Package,
  Printer,
  TrendingUp,
  Users,
} from 'lucide-react';

function buildRecentMonthKeys(count: number): string[] {
  const keys: string[] = [];
  const base = new Date();
  base.setDate(1);
  for (let i = 0; i < count; i++) {
    const d = new Date(base.getFullYear(), base.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    keys.push(`${y}-${m}`);
  }
  return keys;
}

function getPreviousMonthKey(monthKey: string): string {
  const [yStr, mStr] = monthKey.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (!y || !m) return monthKey;
  const d = new Date(y, m - 2, 1);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

export const ReportsView: React.FC = () => {
  const { orders, products, storeProfile, showToast } = useComfy();
  const [copiedSummary, setCopiedSummary] = useState(false);

  const currentMonthKey = useMemo(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
  }, []);

  const [selectedMonth, setSelectedMonth] = useState<string>(currentMonthKey);

  // Build list of available months (always includes last 6 months + any older months with orders)
  const monthOptions = useMemo(() => {
    const set = new Set<string>(buildRecentMonthKeys(6));
    orders.forEach((o) => {
      set.add(getOrderMonthKey(o));
    });
    return Array.from(set).sort((a, b) => b.localeCompare(a));
  }, [orders]);

  // Compute summary metrics per month across all known months
  const monthlyStatsMap = useMemo(() => {
    const map: Record<
      string,
      {
        monthKey: string;
        ordersCount: number;
        deliveredCount: number;
        itemsCount: number;
        totalRevenue: number;
        receivedAmount: number;
        remainingAmount: number;
        estimatedCost: number;
        revenueWithCost: number;
        hasCostData: boolean;
        avgTicket: number;
      }
    > = {};

    monthOptions.forEach((mk) => {
      map[mk] = {
        monthKey: mk,
        ordersCount: 0,
        deliveredCount: 0,
        itemsCount: 0,
        totalRevenue: 0,
        receivedAmount: 0,
        remainingAmount: 0,
        estimatedCost: 0,
        revenueWithCost: 0,
        hasCostData: false,
        avgTicket: 0,
      };
    });

    orders.forEach((order) => {
      const mk = getOrderMonthKey(order);
      if (!map[mk]) {
        map[mk] = {
          monthKey: mk,
          ordersCount: 0,
          deliveredCount: 0,
          itemsCount: 0,
          totalRevenue: 0,
          receivedAmount: 0,
          remainingAmount: 0,
          estimatedCost: 0,
          revenueWithCost: 0,
          hasCostData: false,
          avgTicket: 0,
        };
      }
      const st = map[mk];
      st.ordersCount += 1;
      if (order.status === 'delivered') st.deliveredCount += 1;
      st.totalRevenue += order.totalAmount;
      st.receivedAmount += getOrderPaidAmount(order);
      st.remainingAmount += getOrderRemainingAmount(order);

      order.items.forEach((it) => {
        st.itemsCount += it.quantity;
        const prod = products.find((p) => p.id === it.productId);
        if (prod && typeof prod.costPrice === 'number' && prod.costPrice > 0) {
          st.hasCostData = true;
          st.estimatedCost += prod.costPrice * it.quantity;
          st.revenueWithCost += it.unitPrice * it.quantity;
        }
      });
    });

    Object.values(map).forEach((st) => {
      st.avgTicket = st.ordersCount > 0 ? st.totalRevenue / st.ordersCount : 0;
    });

    return map;
  }, [orders, products, monthOptions]);

  // Orders filtered by selectedMonth (or all)
  const filteredOrders = useMemo(() => {
    if (selectedMonth === 'all') return orders;
    return orders.filter((o) => getOrderMonthKey(o) === selectedMonth);
  }, [orders, selectedMonth]);

  // Aggregated metrics for selected period
  const periodMetrics = useMemo(() => {
    const totalRevenue = filteredOrders.reduce((s, o) => s + o.totalAmount, 0);
    const receivedAmount = filteredOrders.reduce((s, o) => s + getOrderPaidAmount(o), 0);
    const remainingAmount = filteredOrders.reduce((s, o) => s + getOrderRemainingAmount(o), 0);
    const ordersCount = filteredOrders.length;
    const deliveredCount = filteredOrders.filter((o) => o.status === 'delivered').length;
    const itemsCount = filteredOrders.reduce(
      (sum, o) => sum + o.items.reduce((acc, it) => acc + it.quantity, 0),
      0
    );
    const avgTicket = ordersCount > 0 ? totalRevenue / ordersCount : 0;
    const avgItemsPerOrder = ordersCount > 0 ? itemsCount / ordersCount : 0;
    const completionRate = ordersCount > 0 ? Math.round((deliveredCount / ordersCount) * 100) : 0;

    let estimatedCost = 0;
    let revenueWithCost = 0;
    let hasCostData = false;
    filteredOrders.forEach((order) => {
      order.items.forEach((it) => {
        const prod = products.find((p) => p.id === it.productId);
        if (prod && typeof prod.costPrice === 'number' && prod.costPrice > 0) {
          hasCostData = true;
          estimatedCost += prod.costPrice * it.quantity;
          revenueWithCost += it.unitPrice * it.quantity;
        }
      });
    });
    const estimatedProfit = revenueWithCost - estimatedCost;
    const marginPercent =
      revenueWithCost > 0 ? Math.round((estimatedProfit / revenueWithCost) * 100) : 0;

    return {
      totalRevenue,
      receivedAmount,
      remainingAmount,
      ordersCount,
      deliveredCount,
      itemsCount,
      avgTicket,
      avgItemsPerOrder,
      completionRate,
      estimatedCost,
      revenueWithCost,
      estimatedProfit,
      marginPercent,
      hasCostData,
    };
  }, [filteredOrders, products]);

  // Previous month comparison
  const previousMonthComparison = useMemo(() => {
    if (selectedMonth === 'all') return null;
    const prevKey = getPreviousMonthKey(selectedMonth);
    const prevStats = monthlyStatsMap[prevKey];
    if (!prevStats || prevStats.totalRevenue === 0) {
      return { prevKey, prevRevenue: 0, pctChange: null };
    }
    const diff = periodMetrics.totalRevenue - prevStats.totalRevenue;
    const pctChange = Math.round((diff / prevStats.totalRevenue) * 100);
    return { prevKey, prevRevenue: prevStats.totalRevenue, pctChange };
  }, [selectedMonth, monthlyStatsMap, periodMetrics.totalRevenue]);

  // Last 6 months chronological array for chart & past months comparison table
  const pastSixMonths = useMemo(() => {
    const keys = buildRecentMonthKeys(6).reverse();
    return keys.map((mk) => monthlyStatsMap[mk]);
  }, [monthlyStatsMap]);

  const maxChartRevenue = useMemo(
    () => Math.max(...pastSixMonths.map((m) => m.totalRevenue), 1),
    [pastSixMonths]
  );

  // Payment & delivery breakdown for selected period
  const breakdown = useMemo(() => {
    const total = periodMetrics.totalRevenue;
    const pct = (val: number) => (total > 0 ? Math.round((val / total) * 100) : 0);

    const pickupRevenue = filteredOrders
      .filter((o) => o.deliveryType === 'retirada')
      .reduce((s, o) => s + o.totalAmount, 0);
    const deliveryRevenue = filteredOrders
      .filter((o) => o.deliveryType === 'entrega')
      .reduce((s, o) => s + o.totalAmount, 0);

    const fullyPaidRevenue = filteredOrders
      .filter((o) => o.paymentStatus === 'pago')
      .reduce((s, o) => s + o.totalAmount, 0);

    const sinalOrders = filteredOrders.filter((o) => o.paymentStatus === '50_sinal');
    const sinalPaidTotal = sinalOrders.reduce((s, o) => s + getOrderPaidAmount(o), 0);
    const sinalRemainingTotal = sinalOrders.reduce((s, o) => s + getOrderRemainingAmount(o), 0);

    const pendingTotal = filteredOrders
      .filter((o) => o.paymentStatus === 'pendente')
      .reduce((s, o) => s + o.totalAmount, 0);

    return {
      channels: [
        {
          name: 'Retirada no Ateliê',
          percentage: pct(pickupRevenue),
          revenue: pickupRevenue,
          color: 'bg-[#D07A6D]',
        },
        {
          name: 'Entrega / Delivery',
          percentage: pct(deliveryRevenue),
          revenue: deliveryRevenue,
          color: 'bg-[#E5B5AC]',
        },
      ],
      payments: [
        {
          name: 'Pagamentos 100% Quitados',
          detail: `${filteredOrders.filter((o) => o.paymentStatus === 'pago').length} pedido(s)`,
          value: fullyPaidRevenue,
          percentage: pct(fullyPaidRevenue),
          color: 'bg-[#4A7C59]',
        },
        {
          name: 'Sinais Recebidos (Entradas)',
          detail: `${sinalOrders.length} pedido(s) · Falta R$ ${sinalRemainingTotal
            .toFixed(2)
            .replace('.', ',')}`,
          value: sinalPaidTotal,
          percentage: pct(sinalPaidTotal),
          color: 'bg-amber-500',
        },
        {
          name: 'A Receber (Restante + Pendentes)',
          detail: 'Saldo em aberto',
          value: sinalRemainingTotal + pendingTotal,
          percentage: pct(sinalRemainingTotal + pendingTotal),
          color: 'bg-[#7C6E68]',
        },
      ],
    };
  }, [filteredOrders, periodMetrics.totalRevenue]);

  // Top-selling products in selected period
  const topSellingProducts = useMemo(() => {
    const map: Record<
      string,
      {
        productId: string;
        name: string;
        quantity: number;
        revenue: number;
        costTotal: number;
        hasCost: boolean;
        imageUrl?: string;
        unit: string;
      }
    > = {};

    filteredOrders.forEach((order) => {
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!map[item.productId]) {
          map[item.productId] = {
            productId: item.productId,
            name: prod?.name || item.productName,
            quantity: 0,
            revenue: 0,
            costTotal: 0,
            hasCost: Boolean(prod && typeof prod.costPrice === 'number' && prod.costPrice > 0),
            imageUrl: prod?.imageUrl,
            unit: prod?.unit || 'unidade',
          };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.quantity * item.unitPrice;
        if (prod && typeof prod.costPrice === 'number' && prod.costPrice > 0) {
          map[item.productId].costTotal += item.quantity * prod.costPrice;
        }
      });
    });

    return Object.values(map).sort((a, b) => b.revenue - a.revenue);
  }, [filteredOrders, products]);

  // Top customers in selected period
  const topCustomers = useMemo(() => {
    const map: Record<string, { name: string; orders: number; spent: number }> = {};
    filteredOrders.forEach((o) => {
      const key = o.customerName.trim().toLowerCase();
      if (!map[key]) {
        map[key] = { name: o.customerName, orders: 0, spent: 0 };
      }
      map[key].orders += 1;
      map[key].spent += o.totalAmount;
    });
    return Object.values(map)
      .sort((a, b) => b.spent - a.spent)
      .slice(0, 5);
  }, [filteredOrders]);

  const selectedPeriodLabel =
    selectedMonth === 'all' ? 'Todos os Meses' : formatMonthLabel(selectedMonth);

  const handleCopyClosingReport = () => {
    const lines = [
      `Fechamento Mensal - ${storeProfile.name}`,
      `Periodo: ${selectedPeriodLabel}`,
      ``,
      `• Faturamento Bruto: R$ ${periodMetrics.totalRevenue.toFixed(2).replace('.', ',')}`,
      `• Recebido em Caixa (Pagos + Sinais): R$ ${periodMetrics.receivedAmount
        .toFixed(2)
        .replace('.', ',')}`,
      `• Saldo a Receber: R$ ${periodMetrics.remainingAmount.toFixed(2).replace('.', ',')}`,
      `• Pedidos: ${periodMetrics.ordersCount} (${periodMetrics.deliveredCount} entregues)`,
      `• Doces vendidos: ${periodMetrics.itemsCount} un.`,
      `• Ticket medio: R$ ${periodMetrics.avgTicket.toFixed(2).replace('.', ',')}`,
    ];
    if (periodMetrics.hasCostData) {
      lines.push(
        `• Lucro estimado (itens com custo): R$ ${periodMetrics.estimatedProfit
          .toFixed(2)
          .replace('.', ',')} (${periodMetrics.marginPercent}% margem)`
      );
    }
    navigator.clipboard.writeText(lines.join('\n'));
    setCopiedSummary(true);
    showToast('Resumo de fechamento copiado!');
    setTimeout(() => setCopiedSummary(false), 2500);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300 min-w-0">
      {/* Header + Month Selector + Export Actions */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
            Relatórios & Fechamento Mensal
          </h1>
          <p className="text-xs text-[#7C6E68] mt-1">
            Acompanhe faturamento, sinais recebidos, lucro e compare com meses passados.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <div className="inline-flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-[#EFE8DE] shadow-2xs">
            <Calendar className="w-4 h-4 text-[#D07A6D]" />
            <select
              value={selectedMonth}
              onChange={(e) => setSelectedMonth(e.target.value)}
              className="text-xs font-semibold text-[#231818] bg-transparent focus:outline-hidden cursor-pointer pr-1"
            >
              {monthOptions.map((mk) => (
                <option key={mk} value={mk}>
                  {formatMonthLabel(mk)}
                </option>
              ))}
              <option value="all">Todo o Histórico</option>
            </select>
          </div>

          <button
            type="button"
            onClick={handleCopyClosingReport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#F8F4EE] border border-[#EFE8DE] text-xs font-semibold text-[#231818] transition-colors cursor-pointer"
          >
            {copiedSummary ? (
              <Check className="w-3.5 h-3.5 text-emerald-600" />
            ) : (
              <Copy className="w-3.5 h-3.5 text-[#D07A6D]" />
            )}
            <span>{copiedSummary ? 'Copiado!' : 'Copiar fechamento'}</span>
          </button>

          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5 text-[#D07A6D]" />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Period Indicator Banner */}
      <div className="bg-gradient-to-r from-[#FAF4EB] to-[#FDFBF7] px-4 py-3 rounded-2xl border border-[#E8DCCB] flex flex-wrap items-center justify-between gap-2 text-xs">
        <span className="font-bold text-[#231818]">
          Exibindo dados de: <span className="text-[#D07A6D]">{selectedPeriodLabel}</span>
        </span>
        {previousMonthComparison && previousMonthComparison.pctChange !== null ? (
          <span
            className={`inline-flex items-center gap-1 font-bold px-2.5 py-1 rounded-lg ${
              previousMonthComparison.pctChange >= 0
                ? 'bg-emerald-100 text-emerald-800'
                : 'bg-red-100 text-red-700'
            }`}
          >
            {previousMonthComparison.pctChange >= 0 ? (
              <ArrowUpRight className="w-3.5 h-3.5" />
            ) : (
              <ArrowDownRight className="w-3.5 h-3.5" />
            )}
            {previousMonthComparison.pctChange >= 0 ? '+' : ''}
            {previousMonthComparison.pctChange}% vs{' '}
            {formatShortMonthLabel(previousMonthComparison.prevKey)}
          </span>
        ) : (
          <span className="text-[#7C6E68]">
            {selectedMonth === 'all'
              ? 'Soma completa de todos os pedidos'
              : 'Sem base no mês anterior para variação'}
          </span>
        )}
      </div>

      {/* Top 4 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Faturamento do Período</span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums truncate">
            R${' '}
            {periodMetrics.totalRevenue.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
          <p className="text-xs text-[#7C6E68] mt-2 truncate">
            {periodMetrics.ordersCount} pedido(s) · Ticket R${' '}
            {periodMetrics.avgTicket.toFixed(2).replace('.', ',')}
          </p>
        </div>

        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">
            Recebido em Caixa (Pagos + Sinais)
          </span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#4A7C59] mt-1 tabular-nums truncate">
            R${' '}
            {periodMetrics.receivedAmount.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </h3>
          <p className="text-xs text-[#B85848] font-medium mt-2 truncate">
            A receber: R${' '}
            {periodMetrics.remainingAmount.toLocaleString('pt-BR', {
              minimumFractionDigits: 2,
              maximumFractionDigits: 2,
            })}
          </p>
        </div>

        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Lucro Estimado (c/ Custo)</span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums truncate">
            {periodMetrics.hasCostData
              ? `R$ ${periodMetrics.estimatedProfit.toLocaleString('pt-BR', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2,
                })}`
              : '—'}
          </h3>
          <p className="text-xs text-[#7C6E68] mt-2 truncate">
            {periodMetrics.hasCostData
              ? `Custo R$ ${periodMetrics.estimatedCost.toFixed(2).replace('.', ',')} · Margem ${
                  periodMetrics.marginPercent
                }%`
              : 'Cadastre custos nos doces no Catálogo'}
          </p>
        </div>

        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Doces & Entregas</span>
          <h3 className="text-xl sm:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums truncate">
            {periodMetrics.itemsCount} {periodMetrics.itemsCount === 1 ? 'unidade' : 'unidades'}
          </h3>
          <p className="text-xs text-[#4A7C59] mt-2 truncate">
            {periodMetrics.deliveredCount}/{periodMetrics.ordersCount} entregues (
            {periodMetrics.completionRate}%)
          </p>
        </div>
      </div>

      {/* Past 6 Months Comparison Chart + Table */}
      <div className="bg-white p-4 sm:p-6 rounded-2xl border border-[#EFE8DE] shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h2 className="font-serif text-lg font-bold text-[#231818] flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-[#D07A6D]" />
              <span>Comparativo dos Últimos 6 Meses</span>
            </h2>
            <p className="text-xs text-[#7C6E68]">
              Clique em qualquer mês para abrir o fechamento detalhado daquele período.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-[#7C6E68]">
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#E5B5AC]" /> Faturamento
            </span>
            <span className="inline-flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-xs bg-[#4A7C59]" /> Recebido em caixa
            </span>
          </div>
        </div>

        {/* 6-Month Bar Chart */}
        <div className="grid grid-cols-6 gap-2 sm:gap-4 items-end h-44 pt-4 px-1">
          {pastSixMonths.map((m) => {
            const totalPct =
              m.totalRevenue === 0 ? 4 : Math.max(10, Math.round((m.totalRevenue / maxChartRevenue) * 100));
            const receivedPct =
              m.receivedAmount === 0
                ? 0
                : Math.max(8, Math.round((m.receivedAmount / maxChartRevenue) * 100));
            const isSelected = selectedMonth === m.monthKey;

            return (
              <button
                key={m.monthKey}
                type="button"
                onClick={() => setSelectedMonth(m.monthKey)}
                className={`flex flex-col items-center gap-1.5 h-full justify-end p-1.5 rounded-xl transition-all cursor-pointer ${
                  isSelected ? 'bg-[#FBF8F3] ring-1 ring-[#D07A6D]' : 'hover:bg-[#FBF8F3]'
                }`}
              >
                <span className="text-[10px] font-bold text-[#231818] tabular-nums truncate max-w-full">
                  {m.totalRevenue > 0 ? `R$${Math.round(m.totalRevenue)}` : 'R$0'}
                </span>

                <div className="w-full flex items-end justify-center gap-1 h-28">
                  <div
                    style={{ height: `${totalPct}%` }}
                    className={`w-3 sm:w-5 rounded-t-md transition-all ${
                      isSelected ? 'bg-[#D07A6D]' : 'bg-[#E5B5AC]'
                    }`}
                  />
                  {receivedPct > 0 && (
                    <div
                      style={{ height: `${receivedPct}%` }}
                      className="w-3 sm:w-5 rounded-t-md bg-[#4A7C59] transition-all"
                    />
                  )}
                </div>

                <span
                  className={`text-[10px] sm:text-xs ${
                    isSelected ? 'font-bold text-[#231818]' : 'text-[#7C6E68]'
                  }`}
                >
                  {formatShortMonthLabel(m.monthKey)}
                </span>
              </button>
            );
          })}
        </div>

        {/* Past Months Detailed Table */}
        <div className="overflow-x-auto border-t border-[#EFE8DE] pt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="text-[11px] uppercase tracking-wider text-[#7C6E68] border-b border-[#EFE8DE]">
                <th className="py-2.5 pr-3 font-semibold">Mês</th>
                <th className="py-2.5 px-3 font-semibold text-right">Pedidos</th>
                <th className="py-2.5 px-3 font-semibold text-right">Faturamento</th>
                <th className="py-2.5 px-3 font-semibold text-right">Recebido</th>
                <th className="py-2.5 px-3 font-semibold text-right">A Receber</th>
                <th className="py-2.5 pl-3 font-semibold text-right">Ticket Médio</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#EFE8DE]/70">
              {pastSixMonths
                .slice()
                .reverse()
                .map((m) => {
                  const isSelected = selectedMonth === m.monthKey;
                  return (
                    <tr
                      key={m.monthKey}
                      onClick={() => setSelectedMonth(m.monthKey)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-[#FAF4EB] font-semibold' : 'hover:bg-[#FBF8F3]'
                      }`}
                    >
                      <td className="py-2.5 pr-3 text-[#231818] whitespace-nowrap">
                        {formatMonthLabel(m.monthKey)}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#7C6E68]">
                        {m.ordersCount}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums font-serif text-[#231818]">
                        R$ {m.totalRevenue.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#4A7C59]">
                        R$ {m.receivedAmount.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-2.5 px-3 text-right tabular-nums text-[#B85848]">
                        R$ {m.remainingAmount.toFixed(2).replace('.', ',')}
                      </td>
                      <td className="py-2.5 pl-3 text-right tabular-nums text-[#7C6E68]">
                        R$ {m.avgTicket.toFixed(2).replace('.', ',')}
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Breakdown & Rankings */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        {/* Financial & Delivery Distribution */}
        <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-[#EFE8DE] shadow-xs space-y-5">
          <div className="flex items-center justify-between gap-2">
            <h3 className="font-serif text-base font-bold text-[#231818]">
              Caixa, Sinais & Modalidade ({selectedPeriodLabel})
            </h3>
          </div>

          <div className="space-y-3.5">
            {breakdown.payments.map((item) => (
              <div key={item.name}>
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <div className="min-w-0">
                    <span className="font-semibold text-[#231818] block truncate">{item.name}</span>
                    <span className="text-[10px] text-[#7C6E68]">{item.detail}</span>
                  </div>
                  <span className="text-[#231818] font-bold tabular-nums whitespace-nowrap shrink-0">
                    {item.percentage}% (R$ {item.value.toFixed(2).replace('.', ',')})
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#F8F4EE] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${item.percentage}%` }}
                    className={`h-full ${item.color} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-[#EFE8DE] space-y-3">
            <p className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E68]">
              Por Modalidade
            </p>
            {breakdown.channels.map((ch) => (
              <div key={ch.name}>
                <div className="flex items-center justify-between gap-2 text-xs mb-1">
                  <span className="font-semibold text-[#231818] truncate">{ch.name}</span>
                  <span className="text-[#7C6E68] tabular-nums whitespace-nowrap shrink-0">
                    {ch.percentage}% (R$ {ch.revenue.toFixed(2).replace('.', ',')})
                  </span>
                </div>
                <div className="h-2.5 w-full bg-[#F8F4EE] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${ch.percentage}%` }}
                    className={`h-full ${ch.color} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Best-Selling Sweets + Top Customers of the Month */}
        <div className="space-y-5">
          <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-[#EFE8DE] shadow-xs">
            <div className="flex items-center justify-between gap-2 mb-4">
              <h3 className="font-serif text-base font-bold text-[#231818]">
                Doces Mais Vendidos no Período
              </h3>
              <span className="text-xs text-[#7C6E68] whitespace-nowrap">Por receita</span>
            </div>

            {topSellingProducts.length === 0 ? (
              <div className="py-8 px-4 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE] text-center space-y-2">
                <Package className="w-7 h-7 text-[#7C6E68]/50 mx-auto" />
                <p className="text-xs font-semibold text-[#231818]">
                  Nenhuma venda registrada neste período
                </p>
              </div>
            ) : (
              <div className="space-y-2.5">
                {topSellingProducts.slice(0, 6).map((p, index) => {
                  const profit = p.hasCost ? p.revenue - p.costTotal : null;
                  return (
                    <div
                      key={p.productId}
                      className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE] min-w-0"
                    >
                      <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                        <span className="font-serif font-bold text-sm text-[#D07A6D] w-5 text-center shrink-0 tabular-nums">
                          0{index + 1}
                        </span>
                        {p.imageUrl ? (
                          <img
                            src={p.imageUrl}
                            alt={p.name}
                            className="w-9 h-9 rounded-lg object-cover border border-[#EFE8DE] shrink-0"
                          />
                        ) : null}
                        <div className="min-w-0">
                          <h4 className="text-xs font-bold text-[#231818] truncate">{p.name}</h4>
                          <p className="text-[11px] text-[#7C6E68] truncate">
                            {p.quantity} {p.unit}
                            {profit !== null &&
                              ` · Lucro R$ ${profit.toFixed(2).replace('.', ',')}`}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className="text-xs font-serif font-bold text-[#231818] tabular-nums whitespace-nowrap">
                          R$ {p.revenue.toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {topCustomers.length > 0 && (
            <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-[#EFE8DE] shadow-xs">
              <div className="flex items-center justify-between gap-2 mb-3">
                <h3 className="font-serif text-base font-bold text-[#231818] flex items-center gap-2">
                  <Users className="w-4 h-4 text-[#D07A6D]" />
                  <span>Principais Clientes do Período</span>
                </h3>
              </div>
              <div className="space-y-2">
                {topCustomers.map((cust) => (
                  <div
                    key={cust.name}
                    className="flex items-center justify-between text-xs p-2.5 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE]"
                  >
                    <div className="min-w-0">
                      <span className="font-bold text-[#231818] truncate block">{cust.name}</span>
                      <span className="text-[11px] text-[#7C6E68]">
                        {cust.orders} pedido(s)
                      </span>
                    </div>
                    <span className="font-serif font-bold text-[#231818] tabular-nums shrink-0">
                      R$ {cust.spent.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
