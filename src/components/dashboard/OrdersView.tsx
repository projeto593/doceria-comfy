import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Search, Plus, Filter, Clock, Phone, MapPin, CheckCircle, Package, AlertCircle, Trash2 } from 'lucide-react';
import { OrderStatus } from '../../types';

export const OrdersView: React.FC = () => {
  const { orders, updateOrderStatus, deleteOrder, setIsNewOrderModalOpen } = useComfy();
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');

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

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#231818]">
            Gestão de Pedidos
          </h1>
          <p className="text-xs text-[#7C6E68] mt-1">
            Acompanhe a produção das encomendas e despache em tempo hábil.
          </p>
        </div>

        <button
          onClick={() => setIsNewOrderModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo pedido</span>
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3 rounded-2xl border border-[#EFE8DE]">
        {/* Status segmented controls */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0">
          <button
            onClick={() => setFilterStatus('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'all'
                ? 'bg-[#2B1D1D] text-white'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Todos ({orders.length})
          </button>
          <button
            onClick={() => setFilterStatus('in_production')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'in_production'
                ? 'bg-[#D07A6D] text-white'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Em produção ({orders.filter((o) => o.status === 'in_production').length})
          </button>
          <button
            onClick={() => setFilterStatus('ready')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'ready'
                ? 'bg-amber-700 text-white'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Prontos ({orders.filter((o) => o.status === 'ready').length})
          </button>
          <button
            onClick={() => setFilterStatus('delivered')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              filterStatus === 'delivered'
                ? 'bg-emerald-700 text-white'
                : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
            }`}
          >
            Entregues ({orders.filter((o) => o.status === 'delivered').length})
          </button>
        </div>

        {/* Search */}
        <div className="relative w-full sm:w-64">
          <Search className="w-4 h-4 text-[#7C6E68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente ou pedido..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
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
              onClick={() => setIsNewOrderModalOpen(true)}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B]"
            >
              + Criar novo pedido
            </button>
          </div>
        ) : (
          filteredOrders.map((order) => {
            const conf = statusConfig[order.status];
            return (
              <div
                key={order.id}
                className="bg-white rounded-2xl p-5 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40 transition-all flex flex-col justify-between"
              >
                <div>
                  {/* Top Bar of the Card */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DE]">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-full bg-[#F8F4EE] text-[#7C6E68] flex items-center justify-center text-xs font-bold font-mono">
                        {order.customerInitials}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#231818]">{order.customerName}</h4>
                        <p className="text-[11px] text-[#7C6E68] font-mono">{order.orderNumber}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[11px] font-semibold px-2.5 py-1 rounded-lg ${conf.bg} ${conf.color}`}
                      >
                        {conf.label}
                      </span>
                      <button
                        onClick={() => deleteOrder(order.id)}
                        className="text-[#7C6E68]/50 hover:text-red-500 transition-colors p-1"
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

                  {/* Details & Notes */}
                  <div className="py-2.5 text-xs text-[#7C6E68] space-y-1">
                    <div className="flex items-center gap-2">
                      <Clock className="w-3.5 h-3.5 text-[#D07A6D]" />
                      <span>{order.deliveryDate}</span>
                      <span>·</span>
                      <span className="capitalize">{order.deliveryType}</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-[#7C6E68]" />
                      <span>{order.customerPhone}</span>
                    </div>

                    {order.notes && (
                      <div className="mt-1.5 p-2 rounded-lg bg-[#FBF8F3] text-[11px] text-[#231818] border border-[#EFE8DE]">
                        💬 {order.notes}
                      </div>
                    )}
                  </div>
                </div>

                {/* Footer and Status Change Actions */}
                <div className="pt-3 border-t border-[#EFE8DE] flex items-center justify-between">
                  <div>
                    <span className="text-[11px] text-[#7C6E68] block">Valor Total</span>
                    <span className="text-base font-serif font-bold text-[#231818] tabular-nums">
                      R$ {order.totalAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {/* Status Change Buttons */}
                  <div className="flex items-center gap-1.5">
                    {order.status === 'in_production' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'ready')}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-600 text-white text-xs font-semibold transition-colors"
                      >
                        Pronto p/ Entrega →
                      </button>
                    )}
                    {order.status === 'ready' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'delivered')}
                        className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors"
                      >
                        Marcar Entregue ✓
                      </button>
                    )}
                    {order.status === 'delivered' && (
                      <span className="text-xs text-emerald-700 font-medium flex items-center gap-1">
                        <CheckCircle className="w-3.5 h-3.5" /> Pedido Concluído
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
