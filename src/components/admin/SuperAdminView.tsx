import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Logo } from '../common/Logo';
import {
  ShieldAlert,
  ShieldCheck,
  Search,
  Plus,
  Lock,
  Unlock,
  ExternalLink,
  Store as StoreIcon,
  User,
  Phone,
  Mail,
  MapPin,
  X,
  ArrowLeft,
  Key,
  Copy,
  Check,
  MessageCircle,
  RefreshCw,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Store } from '../../types';

export const SuperAdminView: React.FC = () => {
  const {
    stores,
    addStore,
    toggleStoreBlockStatus,
    approveAndGeneratePassword,
    switchStore,
    setViewMode,
    showToast,
  } = useComfy();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_approval' | 'active' | 'blocked'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);

  // Password Generation Modal State
  const [passwordModalStore, setPasswordModalStore] = useState<Store | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [copiedData, setCopiedData] = useState(false);

  // New Store Form State
  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('');

  const pendingStoresCount = stores.filter((s) => s.status === 'pending_approval').length;
  const activeStoresCount = stores.filter((s) => s.status === 'active').length;
  const blockedStoresCount = stores.filter((s) => s.status === 'blocked').length;
  const totalRevenue = stores.reduce((sum, s) => sum + s.monthlyRevenue, 0);

  const filteredStores = stores.filter((s) => {
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const handleOpenPasswordModal = (store: Store) => {
    setPasswordModalStore(store);
    const generated =
      store.loginPassword || `Comfy@${Math.floor(1000 + Math.random() * 9000)}`;
    setPasswordInput(generated);
    setCopiedData(false);
  };

  const handleRegenerateRandomPassword = () => {
    const fresh = `Comfy@${Math.floor(1000 + Math.random() * 9000)}`;
    setPasswordInput(fresh);
  };

  const handleSaveAndSendWhatsApp = () => {
    if (!passwordModalStore) return;
    const finalPassword = approveAndGeneratePassword(passwordModalStore.id, passwordInput);

    const rawPhone = passwordModalStore.phone.replace(/\D/g, '') || '11987654321';
    const message = encodeURIComponent(
      `Olá ${passwordModalStore.ownerName}! Seu cadastro na Comfy para a doceria *${passwordModalStore.name}* foi aprovado com sucesso! 🎉\n\nAqui estão seus dados de acesso ao painel:\n\n📧 *Login (Gmail):* ${passwordModalStore.email}\n🔑 *Senha de Acesso:* ${finalPassword}\n🔗 *Link de Acesso:* ${window.location.origin}\n\nVocê já pode entrar e começar a cadastrar seus doces e receber pedidos! Qualquer dúvida, estamos por aqui. 🧁`
    );

    const waUrl = `https://wa.me/55${rawPhone}?text=${message}`;
    window.open(waUrl, '_blank');
    setPasswordModalStore(null);
  };

  const handleCopyCredentials = () => {
    if (!passwordModalStore) return;
    const text = `Acesso Comfy - ${passwordModalStore.name}\nGmail: ${passwordModalStore.email}\nSenha: ${passwordInput}\nLink: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedData(true);
    showToast('Gmail e senha copiados para a área de transferência! 📋');
    setTimeout(() => setCopiedData(false), 2500);
  };

  const handleCreateStore = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !storeName.trim() || !email.trim()) return;

    addStore(
      {
        name: storeName.trim(),
        ownerName: ownerName.trim(),
        phone: phone.trim() || '(11) 99999-0000',
        email: email.trim(),
        city: city.trim() || 'São Paulo, SP',
      },
      true // admin can create as active
    );

    setOwnerName('');
    setStoreName('');
    setPhone('');
    setEmail('');
    setCity('');
    setIsAddModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] pb-20 antialiased">
      {/* Super Admin Top Header */}
      <header className="bg-[#261A1A] text-white border-b border-white/10 px-6 py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <Logo variant="light" size="sm" onClick={() => setViewMode('landing')} />
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <span className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#D07A6D] text-white flex items-center gap-1.5">
              <span>👑 Painel Super Administrador</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-block text-xs font-mono text-white/70 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              projetointegradors303@gmail.com
            </span>
            <button
              onClick={() => setViewMode('landing')}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sair do Super Adm</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Title and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-serif font-bold text-[#231818]">
              Gerenciamento Global de Docerias
            </h1>
            <p className="text-xs text-[#7C6E68] mt-1">
              Aprove novos cadastros, gere senhas para o Gmail das lojas e envie os dados direto no WhatsApp.
            </p>
          </div>

          <button
            onClick={() => setIsAddModalOpen(true)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
          >
            <Plus className="w-4 h-4 text-[#D07A6D]" />
            <span>+ Cadastrar Nova Doceria</span>
          </button>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
            <span className="text-xs text-[#7C6E68]">Total de Lojas</span>
            <h3 className="text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums">
              {stores.length}
            </h3>
            <p className="text-[11px] text-[#7C6E68] mt-1">Cadastradas na plataforma</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
            <span className="text-xs text-[#7C6E68]">Pendentes de Análise</span>
            <h3 className="text-2xl font-serif font-bold text-amber-600 mt-1 tabular-nums flex items-center gap-2">
              <span>{pendingStoresCount}</span>
              {pendingStoresCount > 0 && (
                <span className="text-[10px] font-sans font-bold bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full animate-pulse">
                  Requer senha
                </span>
              )}
            </h3>
            <p className="text-[11px] text-amber-700 mt-1">Aguardando geração de senha</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
            <span className="text-xs text-[#7C6E68]">Lojas Ativas</span>
            <h3 className="text-2xl font-serif font-bold text-[#4A7C59] mt-1 tabular-nums">
              {activeStoresCount}
            </h3>
            <p className="text-[11px] text-[#4A7C59] mt-1">Acesso liberado</p>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
            <span className="text-xs text-[#7C6E68]">Lojas Bloqueadas</span>
            <h3 className="text-2xl font-serif font-bold text-[#B85848] mt-1 tabular-nums">
              {blockedStoresCount}
            </h3>
            <p className="text-[11px] text-[#B85848] mt-1">Acesso suspenso</p>
          </div>
        </div>

        {/* Search & Status Filters */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
            <button
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === 'all'
                  ? 'bg-[#2B1D1D] text-white'
                  : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
              }`}
            >
              Todas ({stores.length})
            </button>

            <button
              onClick={() => setFilterStatus('pending_approval')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                filterStatus === 'pending_approval'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Em Análise ({pendingStoresCount})</span>
            </button>

            <button
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === 'active'
                  ? 'bg-emerald-700 text-white'
                  : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
              }`}
            >
              Ativas ({activeStoresCount})
            </button>

            <button
              onClick={() => setFilterStatus('blocked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
                filterStatus === 'blocked'
                  ? 'bg-[#B85848] text-white'
                  : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
              }`}
            >
              Bloqueadas ({blockedStoresCount})
            </button>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-[#7C6E68] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por loja, dona ou gmail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
            />
          </div>
        </div>

        {/* Stores Table / Cards */}
        <div className="bg-white rounded-3xl border border-[#EFE8DE] shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#FBF8F3] border-b border-[#EFE8DE] text-[#7C6E68] uppercase text-[10px] font-bold tracking-wider">
                <tr>
                  <th className="py-4 px-6">Doceria & Responsável</th>
                  <th className="py-4 px-6">Contato (WhatsApp & Gmail)</th>
                  <th className="py-4 px-6">Senha de Acesso</th>
                  <th className="py-4 px-6">Status</th>
                  <th className="py-4 px-6 text-right">Ações do Administrador</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EFE8DE]">
                {filteredStores.map((store) => {
                  const isBlocked = store.status === 'blocked';
                  const isPending = store.status === 'pending_approval';

                  return (
                    <tr
                      key={store.id}
                      className={`hover:bg-[#FBF8F3]/60 transition-colors ${
                        isPending
                          ? 'bg-amber-50/30'
                          : isBlocked
                          ? 'bg-red-50/20'
                          : ''
                      }`}
                    >
                      {/* Nome da Loja & Responsável */}
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              isPending
                                ? 'bg-amber-100 text-amber-700'
                                : isBlocked
                                ? 'bg-red-100 text-red-700'
                                : 'bg-[#F8F4EE] text-[#D07A6D]'
                            }`}
                          >
                            <StoreIcon className="w-4 h-4" />
                          </div>
                          <div>
                            <p className="font-bold text-sm text-[#231818]">{store.name}</p>
                            <p className="text-[#7C6E68] text-xs flex items-center gap-1 mt-0.5">
                              <User className="w-3 h-3" /> {store.ownerName}
                            </p>
                            <span className="text-[10px] text-[#7C6E68] flex items-center gap-1 mt-0.5">
                              <MapPin className="w-3 h-3" /> {store.city} · Cadastrada em {store.createdAt}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Contato */}
                      <td className="py-4 px-6 text-[#7C6E68]">
                        <p className="font-medium text-[#231818] flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5 text-[#D07A6D]" /> {store.phone}
                        </p>
                        <p className="text-[11px] text-[#7C6E68] flex items-center gap-1.5 mt-0.5 font-mono">
                          <Mail className="w-3.5 h-3.5 text-[#7C6E68]" /> {store.email}
                        </p>
                      </td>

                      {/* Senha de Acesso */}
                      <td className="py-4 px-6">
                        {store.loginPassword ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F8F4EE] border border-[#EFE8DE] text-[#231818]">
                              {store.loginPassword}
                            </span>
                            <button
                              onClick={() => handleOpenPasswordModal(store)}
                              className="text-[11px] text-[#7C6E68] hover:text-[#D07A6D] underline cursor-pointer"
                              title="Alterar ou reenviar senha"
                            >
                              Alterar
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleOpenPasswordModal(store)}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer animate-bounce-slow"
                          >
                            <Key className="w-3.5 h-3.5" />
                            <span>Gerar Senha 🔑</span>
                          </button>
                        )}
                      </td>

                      {/* Status */}
                      <td className="py-4 px-6">
                        {isPending ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-100 text-amber-900 text-[11px] font-bold">
                            <Clock className="w-3 h-3 text-amber-700" /> Em Análise
                          </span>
                        ) : isBlocked ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-red-100 text-red-800 text-[11px] font-bold">
                            <Lock className="w-3 h-3" /> Bloqueada
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-100 text-emerald-800 text-[11px] font-bold">
                            <ShieldCheck className="w-3 h-3" /> Ativa
                          </span>
                        )}
                        {store.blockReason && (
                          <span className="block text-[10px] text-red-600 mt-1 max-w-[180px] truncate">
                            {store.blockReason}
                          </span>
                        )}
                      </td>

                      {/* Ações */}
                      <td className="py-4 px-6 text-right space-x-2">
                        {/* Se pendente, atalho para aprovar */}
                        {isPending ? (
                          <button
                            onClick={() => handleOpenPasswordModal(store)}
                            className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                          >
                            Aprovar & Enviar Senha
                          </button>
                        ) : (
                          <>
                            {/* Bloquear / Desbloquear */}
                            <button
                              onClick={() => toggleStoreBlockStatus(store.id)}
                              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                isBlocked
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                              }`}
                            >
                              {isBlocked ? 'Desbloquear Loja' : 'Bloquear Loja'}
                            </button>

                            {/* Acessar Loja */}
                            <button
                              onClick={() => switchStore(store.id)}
                              className="px-3 py-1.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <span>Acessar</span>
                              <ExternalLink className="w-3 h-3 text-[#D07A6D]" />
                            </button>
                          </>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </main>

      {/* MODAL: Gerar Senha de Login e Enviar no WhatsApp */}
      {passwordModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            {/* Header (fixed shrink-0) */}
            <div className="px-5 py-3.5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold shrink-0">
                  <Key className="w-4 h-4 text-amber-600" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D] block leading-tight">
                    • Liberação de Acesso
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#231818] leading-tight">
                    Gerar Senha para {passwordModalStore.name}
                  </h3>
                </div>
              </div>
              <button
                onClick={() => setPasswordModalStore(null)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-xl hover:bg-[#EFE8DE]/60 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Body (scrollable if needed) */}
            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
              {/* Recipient summary in compact 2-column grid */}
              <div className="p-3 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE] grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C6E68] block">Doceria</span>
                  <strong className="text-[#231818] truncate block">{passwordModalStore.name}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C6E68] block">Responsável</span>
                  <strong className="text-[#231818] truncate block">{passwordModalStore.ownerName}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C6E68] block">Login (Gmail)</span>
                  <strong className="text-[#231818] font-mono text-[11px] truncate block">{passwordModalStore.email}</strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C6E68] block">WhatsApp de Destino</span>
                  <strong className="text-[#231818] font-mono text-[11px] truncate block">{passwordModalStore.phone}</strong>
                </div>
              </div>

              {/* Password Generator Input */}
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E68] block mb-1">
                  Senha de Acesso da Loja
                </label>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs sm:text-sm bg-white border border-[#EFE8DE] rounded-xl font-mono text-[#231818] font-bold tracking-wider focus:outline-hidden focus:border-[#D07A6D]"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleRegenerateRandomPassword}
                    className="p-2 rounded-xl border border-[#EFE8DE] bg-[#FBF8F3] hover:bg-[#EFE8DE] text-[#231818] transition-colors shrink-0"
                    title="Gerar outra senha aleatória"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D07A6D]" />
                  </button>
                </div>
                <p className="text-[10px] text-[#7C6E68] mt-1">
                  Esta senha será associada ao Gmail <strong>{passwordModalStore.email}</strong>.
                </p>
              </div>

              {/* WhatsApp Message Preview (Compact with max height) */}
              <div className="p-3 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 block">
                  Prévia da Mensagem que será enviada:
                </span>
                <p className="text-emerald-950 whitespace-pre-line text-[11px] leading-relaxed font-sans bg-white/70 p-2.5 rounded-lg border border-emerald-100 max-h-24 overflow-y-auto">
                  Olá {passwordModalStore.ownerName}! Seu cadastro na Comfy para a doceria *{passwordModalStore.name}* foi aprovado com sucesso! 🎉{'\n\n'}
                  📧 *Login (Gmail):* {passwordModalStore.email}{'\n'}
                  🔑 *Senha de Acesso:* {passwordInput}{'\n\n'}
                  Seja muito bem-vinda à plataforma Comfy!
                </p>
              </div>
            </div>

            {/* Footer Actions (fixed shrink-0) */}
            <div className="px-5 py-3 border-t border-[#EFE8DE] bg-[#FBF8F3] flex flex-wrap items-center justify-between gap-2.5 shrink-0">
              <button
                type="button"
                onClick={handleCopyCredentials}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[#EFE8DE] bg-white hover:bg-[#F8F4EE] text-xs font-semibold text-[#231818] transition-colors cursor-pointer"
              >
                {copiedData ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedData ? 'Copiado!' : 'Copiar Login & Senha'}</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setPasswordModalStore(null)}
                  className="px-3 py-1.5 text-xs font-medium text-[#7C6E68] hover:text-[#231818]"
                >
                  Cancelar
                </button>
                <button
                  type="button"
                  onClick={handleSaveAndSendWhatsApp}
                  className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Aprovar & Enviar WhatsApp</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Admin: Cadastrar Nova Doceria */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3] shrink-0">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D]">
                  • Super Administrador
                </span>
                <h3 className="text-base font-serif font-bold text-[#231818]">
                  Cadastrar Nova Doceria
                </h3>
              </div>
              <button
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-xl hover:bg-[#EFE8DE]/60"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                    Nome da Pessoa (Responsável) *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vanessa Guimarães"
                    value={ownerName}
                    onChange={(e) => setOwnerName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D]"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                    Nome da Loja / Doceria *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vanessa Confeitaria Artesanal"
                    value={storeName}
                    onChange={(e) => setStoreName(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                      Telefone / WhatsApp *
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="(11) 98765-4321"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    />
                  </div>

                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                      Gmail / E-mail *
                    </label>
                    <input
                      type="email"
                      required
                      placeholder="vanessa.doces@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                    Cidade e Estado
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Salvador, BA"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                  />
                </div>
              </div>

              <div className="px-5 py-3 border-t border-[#EFE8DE] bg-[#FBF8F3] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#7C6E68] hover:text-[#231818]"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                >
                  Cadastrar Doceria (Ativa)
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
