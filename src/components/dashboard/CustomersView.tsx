import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Customer } from '../../types';
import {
  PHONE_DIGITS_LENGTH,
  extractPhoneDigits,
  formatPhone11,
} from '../../utils/validation';
import { buildWhatsAppUrl, buildWhatsAppWebUrl, isMobileDevice } from '../../utils/orderHelpers';
import {
  User,
  Plus,
  Search,
  Mail,
  MapPin,
  Heart,
  MessageSquare,
  X,
  Edit2,
  Trash2,
} from 'lucide-react';

export const CustomersView: React.FC = () => {
  const { customers, storeProfile, addCustomer, updateCustomer, deleteCustomer, showToast } = useComfy();
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [confirmDeleteCustomer, setConfirmDeleteCustomer] = useState<Customer | null>(null);
  const [isProcessingDelete, setIsProcessingDelete] = useState(false);

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

  const phoneDigits = extractPhoneDigits(phone);

  const handleCreateCustomer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    if (phoneDigits.length !== PHONE_DIGITS_LENGTH) {
      showToast('O WhatsApp deve conter 11 números (DDD + 9 dígitos).');
      return;
    }

    addCustomer({
      name: name.trim(),
      phone: formatPhone11(phoneDigits),
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

  const editPhoneDigits = editingCustomer ? extractPhoneDigits(editingCustomer.phone) : '';

  const handleSaveEditCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingCustomer || !editingCustomer.name.trim()) return;
    if (editPhoneDigits.length > 0 && editPhoneDigits.length !== PHONE_DIGITS_LENGTH) {
      showToast('O WhatsApp deve conter 11 números (DDD + 9 dígitos).');
      return;
    }

    await updateCustomer({
      ...editingCustomer,
      name: editingCustomer.name.trim(),
      phone: editPhoneDigits.length === PHONE_DIGITS_LENGTH ? formatPhone11(editPhoneDigits) : '',
      email: editingCustomer.email.trim(),
      address: (editingCustomer.address || '').trim(),
      notes: (editingCustomer.notes || '').trim(),
    });
    setEditingCustomer(null);
  };

  const handleConfirmDeleteCustomer = async () => {
    if (!confirmDeleteCustomer || isProcessingDelete) return;
    setIsProcessingDelete(true);
    try {
      await deleteCustomer(confirmDeleteCustomer.id);
      setConfirmDeleteCustomer(null);
    } finally {
      setIsProcessingDelete(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 sm:gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
            Base de Clientes
          </h1>
          <p className="text-xs text-[#7C6E68] mt-0.5">
            Histórico de pedidos, preferências de doces e contatos diretos para fidelização.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setIsAddModalOpen(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs sm:text-sm font-semibold shadow-xs transition-colors cursor-pointer min-h-[44px] whitespace-nowrap shrink-0"
        >
          <Plus className="w-4 h-4 text-[#D07A6D] shrink-0" />
          <span>Novo cliente</span>
        </button>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-3 sm:p-3.5 rounded-2xl border border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-4">
        <div className="relative w-full sm:max-w-md">
          <Search className="w-4 h-4 text-[#7C6E68] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nome, telefone ou e-mail..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] min-h-[42px] sm:min-h-[38px]"
          />
        </div>
        <span className="text-xs text-[#7C6E68] whitespace-nowrap px-1">
          Total: <strong className="text-[#231818] tabular-nums">{customers.length}</strong> clientes
        </span>
      </div>

      {/* Customers Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
        {filteredCustomers.length === 0 ? (
          <div className="col-span-full bg-white rounded-2xl p-10 sm:p-12 text-center border border-[#EFE8DE] space-y-3">
            <User className="w-10 h-10 text-[#7C6E68]/40 mx-auto" />
            <h3 className="font-serif text-lg font-bold text-[#231818]">
              {customers.length === 0
                ? 'Nenhum cliente cadastrado ainda'
                : 'Nenhum cliente encontrado'}
            </h3>
            <p className="text-xs text-[#7C6E68] max-w-md mx-auto">
              {customers.length === 0
                ? 'Os clientes aparecerão aqui conforme você cadastrar manualmente ou registrar novas encomendas.'
                : 'Tente buscar por outro nome, telefone ou e-mail.'}
            </p>
            {customers.length === 0 && (
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="px-4 py-2 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B] cursor-pointer"
              >
                + Cadastrar primeiro cliente
              </button>
            )}
          </div>
        ) : (
          filteredCustomers.map((cust) => {
          const waMsg = `✨ Olá, *${cust.name}*! Tudo bem? Aqui é da doceria *${storeProfile.name || 'Confy'}*! ❤️`;
          const waLink = (isMobileDevice() ? buildWhatsAppUrl : buildWhatsAppWebUrl)(
            cust.phone,
            waMsg
          );

          return (
            <div
              key={cust.id}
              className="min-w-0 bg-white rounded-2xl p-4 sm:p-5 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40 transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2 pb-3 border-b border-[#EFE8DE]">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 rounded-full bg-[#F8F4EE] text-[#D07A6D] flex items-center justify-center font-bold text-sm shrink-0">
                      {cust.initials}
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-[#231818] truncate">{cust.name}</h3>
                      <p className="text-xs text-[#7C6E68] mt-0.5 tabular-nums">
                        {cust.phone || 'Sem telefone'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <a
                      href={waLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-xl bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                      title="Conversar no WhatsApp"
                    >
                      <MessageSquare className="w-4 h-4" />
                    </a>
                    <button
                      type="button"
                      onClick={() =>
                        setEditingCustomer({
                          ...cust,
                          phone: formatPhone11(cust.phone),
                        })
                      }
                      className="p-2 rounded-xl bg-[#FBF8F3] hover:bg-[#EFE8DE] text-[#231818] transition-colors cursor-pointer"
                      title="Editar cliente"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setConfirmDeleteCustomer(cust)}
                      className="p-2 rounded-xl bg-[#FBF8F3] hover:bg-red-50 text-[#7C6E68] hover:text-red-600 transition-colors cursor-pointer"
                      title="Excluir cliente"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
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
        })
        )}
      </div>

      {/* Modal Novo Cliente */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-xl border border-[#EFE8DE] overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-4 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3] shrink-0">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#231818]">Cadastrar Novo Cliente</h3>
              <button
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCustomer} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ex: Mariana Castro"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#7C6E68]">
                      WhatsApp / Telefone *
                    </label>
                    <span className="text-[10px] font-mono text-[#7C6E68]/80">
                      {phoneDigits.length}/{PHONE_DIGITS_LENGTH}
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={15}
                    placeholder="(11) 98765-4321"
                    value={phone}
                    onChange={(e) => setPhone(formatPhone11(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] font-mono min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">E-mail</label>
                  <input
                    type="email"
                    placeholder="mariana@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[44px]"
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
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[44px]"
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
                  className="w-full px-3.5 py-2 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE8DE]">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-[#7C6E68] hover:text-[#231818] cursor-pointer min-h-[40px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B] cursor-pointer min-h-[40px]"
                >
                  Salvar Cliente
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar Cliente */}
      {editingCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[90vh] bg-white rounded-2xl shadow-xl border border-[#EFE8DE] overflow-hidden flex flex-col">
            <div className="px-4 sm:px-6 py-4 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3] shrink-0">
              <h3 className="text-base sm:text-lg font-serif font-bold text-[#231818]">Editar Cliente</h3>
              <button
                type="button"
                onClick={() => setEditingCustomer(null)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditCustomer} className="p-4 sm:p-6 space-y-4 overflow-y-auto">
              <div>
                <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={editingCustomer.name}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, name: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[44px]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#7C6E68]">
                      WhatsApp / Telefone
                    </label>
                    <span className="text-[10px] font-mono text-[#7C6E68]/80">
                      {editPhoneDigits.length}/{PHONE_DIGITS_LENGTH}
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    maxLength={15}
                    placeholder="(11) 98765-4321"
                    value={editingCustomer.phone}
                    onChange={(e) =>
                      setEditingCustomer({
                        ...editingCustomer,
                        phone: formatPhone11(e.target.value),
                      })
                    }
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] font-mono min-h-[44px]"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">E-mail</label>
                  <input
                    type="email"
                    value={editingCustomer.email}
                    onChange={(e) =>
                      setEditingCustomer({ ...editingCustomer, email: e.target.value })
                    }
                    className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[44px]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                  Endereço de Entrega
                </label>
                <input
                  type="text"
                  value={editingCustomer.address || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, address: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[44px]"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                  Observações de Preferência
                </label>
                <textarea
                  rows={2}
                  value={editingCustomer.notes || ''}
                  onChange={(e) =>
                    setEditingCustomer({ ...editingCustomer, notes: e.target.value })
                  }
                  className="w-full px-3.5 py-2 text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D]"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3 border-t border-[#EFE8DE]">
                <button
                  type="button"
                  onClick={() => setEditingCustomer(null)}
                  className="px-4 py-2 text-xs font-medium text-[#7C6E68] hover:text-[#231818] cursor-pointer min-h-[40px]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B] cursor-pointer min-h-[40px]"
                >
                  Salvar Alterações
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Confirmar Exclusão de Cliente */}
      {confirmDeleteCustomer && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/55 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-[#EFE8DE] overflow-hidden p-5 sm:p-6 space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-red-100 text-red-600 flex items-center justify-center shrink-0">
                <Trash2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-serif font-bold text-[#231818]">
                  Excluir cliente?
                </h3>
                <p className="text-xs text-[#7C6E68] mt-1 leading-relaxed">
                  Deseja remover <strong className="text-[#231818]">{confirmDeleteCustomer.name}</strong> da sua base de clientes? Esta ação não pode ser desfeita.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-2">
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={() => setConfirmDeleteCustomer(null)}
                className="px-4 py-2 rounded-xl text-xs font-medium text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3] cursor-pointer min-h-[40px]"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isProcessingDelete}
                onClick={handleConfirmDeleteCustomer}
                className="px-4 py-2 rounded-xl text-xs font-semibold text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 cursor-pointer min-h-[40px]"
              >
                {isProcessingDelete ? 'Excluindo...' : 'Excluir cliente'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
