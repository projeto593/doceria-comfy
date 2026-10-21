import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { User, Plus, Search, Phone, Mail, MapPin, Heart, ShoppingBag, MessageSquare, X } from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, addCustomer } = useComfy();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const filteredCustomers = customers.filter(
    (c) =>
      c.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.phone.includes(searchTerm) ||
      c.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    addCustomer({
      name: name.trim(),
      phone: phone.trim() || '(11) 99999-0000',
      email: email.trim() || `${name.toLowerCase().replace(/\s+/g, '.')}@email.com`,
      address: address.trim(),
      notes: notes.trim(),
    });

    setName('');
    setPhone('');
    setEmail('');
    setAddress('');
    setNotes('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#231818]">
            Base de Clientes
          </h1>
          <p className="text-xs text-[#7C6E68] mt-1">
            Histórico de pedidos, preferências de doces e contatos diretos para fidelização.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>+ Novo cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 rounded-2xl border border-[#EFE8DE] flex items-center justify-between">
        <div className="relative w-full max-w-md">
          <Search className="w-4 h-4 text-[#7C6E68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
          />
        </div>
        <span className="text-xs text-[#7C6E68]">
          Total: <strong className="text-[#231818]">{customers.length}</strong> clientes
        </span>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredCustomers.map((cust) => {
          const rawPhone = cust.phone.replace(/\D/g, '');
          const waLink = `https://wa.me/55${rawPhone}?text=Ol%C3%A1%20${encodeURIComponent(
            cust.name
          )}%2C%20tudo%20bem%3F%20Aqui%20%C3%A9%20da%20doceria%20Comfy!`;

          return (
            <div
              key={cust.id}
              className="bg-white rounded-2xl p-5 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-[#EFE8DE]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#F8F4EE] text-[#D07A6D] flex items-center justify-center font-bold text-sm">
                      {cust.initials}
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-[#231818]">{cust.name}</h3>
                      <p className="text-xs text-[#7C6E68] mt-0.5">{cust.phone}</p>
                    </div>
                  </div>

                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                    title="Conversar no WhatsApp"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                </div>

                <div className="py-3 space-y-2 text-xs text-[#7C6E68]">
                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-[#7C6E68]" />
                    <span className="truncate">{cust.email}</span>
                  </div>

                  {cust.address && (
                    <div className="flex items-start gap-2">
                      <MapPin className="w-3.5 h-3.5 text-[#7C6E68] shrink-0 mt-0.5" />
                      <span className="line-clamp-2">{cust.address}</span>
                    </div>
                  )}

                  {cust.favoriteItem && (
                    <div className="flex items-center gap-2 text-[#D07A6D]">
                      <Heart className="w-3.5 h-3.5 fill-current" />
                      <span>Favorito: {cust.favoriteItem}</span>
                    </div>
                  )}

                  {cust.notes && (
                    <p className="p-2 rounded-lg bg-[#FBF8F3] text-[11px] text-[#231818] border border-[#EFE8DE]">
                      {cust.notes}
                    </p>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-[#EFE8DE] flex items-center justify-between">
                <div>
                  <span className="text-[10px] text-[#7C6E68] block">Total Gasto</span>
                  <span className="text-sm font-serif font-bold text-[#231818] tabular-nums">
                    R$ {cust.totalSpent.toFixed(2).replace('.', ',')}
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-[10px] text-[#7C6E68] block">Encomendas</span>
                  <span className="text-xs font-bold text-[#231818]">
                    {cust.totalOrders} pedido(s)
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Novo Cliente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-xl border border-[#EFE8DE] overflow-hidden">
            <div className="px-6 py-4 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3]">
              <h3 className="text-lg font-serif font-bold text-[#231818]">Cadastrar Novo Cliente</h3>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1 text-[#7C6E68] hover:text-[#231818]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-6 space-y-4">
              <div>
                <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                  Nome Completo
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Castro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="mariana@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                  Endereço de Entrega
                </label>
                <input
                  type="text"
                  placeholder="Rua, número, complemento e bairro"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                  Observações de Preferência
                </label>
                <textarea
                  rows={2}
                  placeholder="Ex: Alérgica a amendoim; prefere doces menos açucarados..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full px-3 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE8DE]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#7C6E68]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B]"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
