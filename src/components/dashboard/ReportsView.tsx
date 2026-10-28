import React from 'react';
import { useComfy } from '../../context/ComfyContext';
import { TrendingUp, PieChart, DollarSign, Calendar, Award } from 'lucide-react';

export const ReportsView: React.FC = () => {
  const { monthlyRevenue, totalOrdersCount, averageTicket, products, salesWeek } = useComfy();

  // Channel distribution
  const channels = [
    { name: 'WhatsApp & Direct', percentage: 58, revenue: monthlyRevenue * 0.58, color: 'bg-[#D07A6D]' },
    { name: 'Instagram Direct', percentage: 28, revenue: monthlyRevenue * 0.28, color: 'bg-[#E5B5AC]' },
    { name: 'Ateliê / Retirada Balcão', percentage: 14, revenue: monthlyRevenue * 0.14, color: 'bg-[#2B1D1D]' },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-300 min-w-0">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
          Relatórios & Faturamento
        </h1>
        <p className="text-xs text-[#7C6E68] mt-1">
          Acompanhe o crescimento e os canais de venda mais lucrativos da sua doceria.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Faturamento Total Estimado</span>
          <h3 className="text-xl sm:text-lg md:text-xl xl:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums whitespace-nowrap truncate">
            R$ {monthlyRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <p className="text-xs text-[#4A7C59] mt-2 truncate">↑ 18,4% acima da meta estabelecida</p>
        </div>

        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Volume de Doces Produzidos</span>
          <h3 className="text-xl sm:text-lg md:text-xl xl:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums whitespace-nowrap truncate">
            ~ 1.420 unidades
          </h3>
          <p className="text-xs text-[#7C6E68] mt-2 truncate">Média de 7,7 doces por encomenda</p>
        </div>

        <div className="min-w-0 overflow-hidden bg-white p-4 sm:p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68] block truncate">Margem Operacional Líquida</span>
          <h3 className="text-xl sm:text-lg md:text-xl xl:text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums whitespace-nowrap truncate">
            64,2%
          </h3>
          <p className="text-xs text-[#4A7C59] mt-2 truncate">Excelente controle de insumos e embalagens</p>
        </div>
      </div>

      {/* Channels & Top Sellers */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 sm:gap-6">
        {/* Sales by Channel */}
        <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-serif text-base font-bold text-[#231818]">Canais de Aquisição</h3>
            <span className="text-xs text-[#7C6E68] whitespace-nowrap">Últimos 30 dias</span>
          </div>

          <div className="space-y-4">
            {channels.map((ch) => (
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

          <p className="text-xs text-[#7C6E68] mt-6 pt-4 border-t border-[#EFE8DE]">
            💡 <strong>Dica Comfy:</strong> Clientes vindos do WhatsApp possuem ticket médio 22% maior
            do que compras diretas em feiras.
          </p>
        </div>

        {/* Top 5 Best-Selling Sweets */}
        <div className="min-w-0 bg-white p-4 sm:p-6 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <div className="flex items-center justify-between gap-2 mb-4">
            <h3 className="font-serif text-base font-bold text-[#231818]">Doces Mais Vendidos</h3>
            <span className="text-xs text-[#7C6E68] whitespace-nowrap">Por receita gerada</span>
          </div>

          <div className="space-y-3">
            {products.slice(0, 4).map((p, index) => (
              <div
                key={p.id}
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
                    R$ {(p.price * (index === 0 ? 42 : index === 1 ? 28 : 22)).toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] text-[#7C6E68] block whitespace-nowrap tabular-nums">
                    {index === 0 ? '42 un. vendidas' : index === 1 ? '28 un. vendidas' : '22 un. vendidas'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
