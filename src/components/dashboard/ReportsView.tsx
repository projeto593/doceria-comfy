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
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#231818]">
          Relatórios & Faturamento
        </h1>
        <p className="text-xs text-[#7C6E68] mt-1">
          Acompanhe o crescimento e os canais de venda mais lucrativos da sua doceria.
        </p>
      </div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68]">Faturamento Total Estimado</span>
          <h3 className="text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums">
            R$ {monthlyRevenue.toFixed(2).replace('.', ',')}
          </h3>
          <p className="text-xs text-[#4A7C59] mt-2">↑ 18,4% acima da meta estabelecida</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68]">Volume de Doces Produzidos</span>
          <h3 className="text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums">
            ~ 1.420 unidades
          </h3>
          <p className="text-xs text-[#7C6E68] mt-2">Média de 7,7 doces por encomenda</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <span className="text-xs text-[#7C6E68]">Margem Operacional Líquida</span>
          <h3 className="text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums">
            64,2%
          </h3>
          <p className="text-xs text-[#4A7C59] mt-2">Excelente controle de insumos e embalagens</p>
        </div>
      </div>

      {/* Channels & Top Sellers */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Channel */}
        <div className="bg-white p-6 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-[#231818]">Canais de Aquisição</h3>
            <span className="text-xs text-[#7C6E68]">Últimos 30 dias</span>
          </div>

          <div className="space-y-4">
            {channels.map((ch) => (
              <div key={ch.name}>
                <div className="flex items-center justify-between text-xs mb-1.5">
                  <span className="font-semibold text-[#231818]">{ch.name}</span>
                  <span className="text-[#7C6E68] tabular-nums">
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
        <div className="bg-white p-6 rounded-2xl border border-[#EFE8DE] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-serif text-base font-bold text-[#231818]">Doces Mais Vendidos</h3>
            <span className="text-xs text-[#7C6E68]">Por receita gerada</span>
          </div>

          <div className="space-y-3">
            {products.slice(0, 4).map((p, index) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE]"
              >
                <div className="flex items-center gap-3">
                  <span className="font-serif font-bold text-sm text-[#D07A6D] w-4 text-center">
                    0{index + 1}
                  </span>
                  <div>
                    <h4 className="text-xs font-bold text-[#231818]">{p.name}</h4>
                    <p className="text-[11px] text-[#7C6E68]">{p.category}</p>
                  </div>
                </div>

                <div className="text-right">
                  <span className="text-xs font-serif font-bold text-[#231818] tabular-nums">
                    R$ {(p.price * (index === 0 ? 42 : index === 1 ? 28 : 22)).toFixed(2).replace('.', ',')}
                  </span>
                  <span className="text-[10px] text-[#7C6E68] block">
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
