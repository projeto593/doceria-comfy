import React, { useMemo } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Package } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { monthlyRevenue, totalOrdersCount, orders, products } = useComfy();

  const totalItemsProduced = useMemo(
    () => orders.reduce((sum, o) => sum + o.items.reduce((acc, it) => acc + it.quantity, 0), 0),
    [orders]
  );

  const avgItemsPerOrder = totalOrdersCount > 0 ? totalItemsProduced / totalOrdersCount : 0;

  const deliveredCount = useMemo(
    () => orders.filter((o) => o.status === 'delivered').length,
    [orders]
  );
  const completionRate =
    totalOrdersCount > 0 ? Math.round((deliveredCount / totalOrdersCount) * 100) : 0;

  // Real delivery/payment breakdown from Firestore orders
  const breakdown = useMemo(() => {
    const pickupRevenue = orders
      .filter((o) => o.deliveryType === 'retirada')
      .reduce((s, o) => s + o.totalAmount, 0);
    const deliveryRevenue = orders
      .filter((o) => o.deliveryType === 'entrega')
      .reduce((s, o) => s + o.totalAmount, 0);
    const paidRevenue = orders
      .filter((o) => o.paymentStatus === 'pago')
      .reduce((s, o) => s + o.totalAmount, 0);

    const pct = (val: number) =>
      monthlyRevenue > 0 ? Math.round((val / monthlyRevenue) * 100) : 0;

    return [
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
      {
        name: 'Pagamentos Totalmente Quitados',
        percentage: pct(paidRevenue),
        revenue: paidRevenue,
        color: 'bg-[#4A7C59]',
      },
    ];
  }, [orders, monthlyRevenue]);

  // Real top-selling products aggregated from Firestore orderItems
  const topSellingProducts = useMemo(() => {
    const map: Record<
      string,
      { productId: string; name: string; quantity: number; revenue: number; imageUrl?: string; unit: string }
    > = {};

    orders.forEach((order) => {
      order.items.forEach((item) => {
        const prod = products.find((p) => p.id === item.productId);
        if (!map[item.productId]) {
          map[item.productId] = {
            productId: item.productId,
            name: prod?.name || item.productName,
            quantity: 0,
            revenue: 0,
            imageUrl: prod?.imageUrl,
            unit: prod?.unit || 'unidade',
          };
        }
        map[item.productId].quantity += item.quantity;
        map[item.productId].revenue += item.quantity * item.unitPrice;
      });
    });

    return Object.values(map)
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);
  }, [orders, products]);

  return (
    <div className="space-y-6 animate-in fade-in duration-300 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
          Relatórios & Faturamento
        </h1>
        <p className="text-xs text-[#7C6E68] mt-1">
          Números calculados diretamente a partir dos pedidos reais salvos no banco de dados.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Faturamento Registrado</span>
          <h3 className="text-xl sm:text-lg md:text-xl xl:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums whitespace-nowrap truncate">
            R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-[#7C6E68] mt-2 truncate">
            {totalOrdersCount === 0
              ? 'Nenhum pedido registrado'
              : `Soma de ${totalOrdersCount} pedido(s)`}
          </p>
        </div>

        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Volume de Doces Vendidos</span>
          <h3 className="text-xl sm:text-lg md:text-xl xl:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums whitespace-nowrap truncate">
            {totalItemsProduced} {totalItemsProduced === 1 ? 'unidade' : 'unidades'}
          </h3>
          <p className="text-xs text-[#7C6E68] mt-2 truncate">
            Média de {avgItemsPerOrder.toFixed(1).replace('.', ',')} itens por pedido
          </p>
        </div>

        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Taxa de Entrega Concluída</span>
          <h3 className="text-xl sm:text-lg md:text-xl xl:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums whitespace-nowrap truncate">
            {completionRate}%
          </h3>
          <p className="text-xs text-[#4A7C59] mt-2 truncate">
            {deliveredCount} de {totalOrdersCount} pedido(s) entregues
          </p>
        </div>
      </div>

      {/* Breakdown & Top Sellers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        {/* Real Delivery & Payment Distribution */}
        <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-serif text-base font-bold text-[#231818]">
              Distribuição das Encomendas
            </h3>
            <span className="text-xs text-[#7C6E68] whitespace-nowrap">Dados reais</span>
          </div>

          <div className="space-y-4">
            {breakdown.map((ch) => (
              <div key={ch.name}>
                <div className="flex items-center justify-between gap-2 text-xs mb-1.5">
                  <span className="font-semibold text-[#231818] truncate">{ch.name}</span>
                  <span className="text-[#7C6E68] tabular-nums whitespace-nowrap shrink-0">
                    {ch.percentage}% (R$ {ch.revenue.toFixed(2).replace('.', ',')})
                  </span>
                </div>
                <div className="h-3 w-full bg-[#F8F4EE] rounded-full overflow-hidden">
                  <div
                    style={{ width: `${ch.percentage}%` }}
                    className={`h-full ${ch.color} rounded-full transition-all duration-500`}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Real Best-Selling Sweets */}
        <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-serif text-base font-bold text-[#231818]">Doces Mais Vendidos</h3>
            <span className="text-xs text-[#7C6E68] whitespace-nowrap">Por receita gerada</span>
          </div>

          {topSellingProducts.length === 0 ? (
            <div className="py-10 px-4 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE] text-center space-y-2">
              <Package className="w-7 h-7 text-[#7C6E68]/50 mx-auto" />
              <p className="text-xs font-semibold text-[#231818]">
                Nenhuma venda registrada no banco ainda
              </p>
              <p className="text-[11px] text-[#7C6E68]">
                Assim que pedidos forem criados, os doces mais vendidos aparecerão aqui.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {topSellingProducts.map((p, index) => (
                <div
                  key={p.productId}
                  className="flex items-center justify-between gap-2.5 p-2.5 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE] min-w-0"
                >
                  <div className="flex items-center gap-2.5 sm:gap-3 min-w-0">
                    <span className="font-serif font-bold text-sm text-[#D07A6D] w-4 text-center shrink-0 tabular-nums">
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
                      <p className="text-[11px] text-[#7C6E68] truncate">{p.unit}</p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span className="text-xs font-serif font-bold text-[#231818] tabular-nums whitespace-nowrap">
                      R$ {p.revenue.toFixed(2).replace('.', ',')}
                    </span>
                    <span className="text-[10px] text-[#7C6E68] block whitespace-nowrap tabular-nums">
                      {p.quantity} un. vendidas
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
