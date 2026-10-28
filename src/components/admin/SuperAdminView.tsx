import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Logo } from '../common/Logo';
import {
  ShieldCheck,
  Search,
  Plus,
  Lock,
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
  Eye,
  EyeOff,
  Trash2,
} from 'lucide-react';
import { Store } from '../../types';
import { CityStateSelect } from '../common/CityStateSelect';
import {
  MAX_OWNER_NAME,
  MAX_STORE_NAME,
  MAX_EMAIL,
  MAX_PASSWORD,
  MIN_PASSWORD,
  PHONE_DIGITS_LENGTH,
  extractPhoneDigits,
  formatPhone11,
  sanitizeOwnerName,
  sanitizeStoreName,
  sanitizeEmail,
} from '../../utils/validation';

export const SuperAdminView: React.FC = () => {
  const {
    stores,
    addStore,
    deleteStore,
    toggleStoreBlockStatus,
    approveAndGeneratePassword,
    superAdminPassword,
    updateSuperAdminPassword,
    switchStore,
    setViewMode,
    logout,
    showToast,
  } = useComfy();

  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'pending_approval' | 'active' | 'blocked'>('all');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Store Deletion Confirmation Modal State (iframe-safe, no window.confirm)
  const [storeToDelete, setStoreToDelete] = useState<Store | null>(null);
  const [isDeletingStore, setIsDeletingStore] = useState(false);

  // Super Admin Password Modal State
  const [isAdminPassModalOpen, setIsAdminPassModalOpen] = useState(false);
  const [newAdminPass, setNewAdminPass] = useState('');
  const [confirmAdminPass, setConfirmAdminPass] = useState('');
  const [showAdminPass, setShowAdminPass] = useState(false);
  const [copiedAdminPass, setCopiedAdminPass] = useState(false);

  // Password Generation Modal State
  const [passwordModalStore, setPasswordModalStore] = useState<Store | null>(null);
  const [passwordInput, setPasswordInput] = useState('');
  const [copiedData, setCopiedData] = useState(false);

  // New Store Form State
  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('São Paulo, SP');

  const pendingStoresCount = stores.filter((s) => s.status === 'pending_approval').length;
  const activeStoresCount = stores.filter((s) => s.status === 'active').length;
  const blockedStoresCount = stores.filter((s) => s.status === 'blocked').length;

  const filteredStores = stores.filter((s) => {
    const matchesFilter = filterStatus === 'all' || s.status === filterStatus;
    const matchesSearch =
      s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.ownerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.phone.includes(searchTerm);
    return matchesFilter && matchesSearch;
  });

  const openExternalLinkSafely = (url: string) => {
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.target = '_blank';
    anchor.rel = 'noopener noreferrer';
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
  };

  const handleConfirmDeleteStore = async () => {
    if (!storeToDelete || isDeletingStore) return;
    setIsDeletingStore(true);
    try {
      await deleteStore(storeToDelete.id);
      setStoreToDelete(null);
    } finally {
      setIsDeletingStore(false);
    }
  };

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

  const handleSaveAndSendWhatsApp = async () => {
    if (!passwordModalStore || isSaving) return;
    setIsSaving(true);
    try {
      const finalPassword = await approveAndGeneratePassword(passwordModalStore.id, passwordInput);

      const rawPhone = passwordModalStore.phone.replace(/\D/g, '');
      const message = encodeURIComponent(
        `Olá ${passwordModalStore.ownerName}! Seu cadastro na Comfy para a doceria *${passwordModalStore.name}* foi aprovado com sucesso! 🎉\n\nAqui estão seus dados de acesso ao painel:\n\n📧 *Login (Gmail):* ${passwordModalStore.email}\n🔑 *Senha de Acesso:* ${finalPassword}\n🔗 *Link de Acesso:* ${window.location.origin}\n\nVocê já pode entrar de qualquer celular, tablet ou PC e começar a cadastrar seus doces! Qualquer dúvida, estamos por aqui. 🧁`
      );

      const waUrl = rawPhone
        ? `https://wa.me/55${rawPhone}?text=${message}`
        : `https://wa.me/?text=${message}`;
      openExternalLinkSafely(waUrl);
      setPasswordModalStore(null);
    } finally {
      setIsSaving(false);
    }
  };

  const handleCopyCredentials = () => {
    if (!passwordModalStore) return;
    const text = `Acesso Comfy - ${passwordModalStore.name}\nGmail: ${passwordModalStore.email}\nSenha: ${passwordInput}\nLink: ${window.location.origin}`;
    navigator.clipboard.writeText(text);
    setCopiedData(true);
    showToast('Gmail e senha copiados para a área de transferência! 📋');
    setTimeout(() => setCopiedData(false), 2500);
  };

  const handleOpenAdminPassModal = () => {
    setNewAdminPass(superAdminPassword);
    setConfirmAdminPass(superAdminPassword);
    setShowAdminPass(false);
    setCopiedAdminPass(false);
    setIsAdminPassModalOpen(true);
  };

  const handleCopyAdminCredentials = () => {
    const text = `Acesso Super Admin Comfy\nE-mail: projetointegradors303@gmail.com\nSenha: ${superAdminPassword}`;
    navigator.clipboard.writeText(text);
    setCopiedAdminPass(true);
    showToast('Credenciais do Super Admin copiadas! 📋');
    setTimeout(() => setCopiedAdminPass(false), 2500);
  };

  const handleSaveAdminPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isSaving) return;

    const cleanNew = newAdminPass.trim();
    const cleanConfirm = confirmAdminPass.trim();

    if (cleanNew.length < MIN_PASSWORD || cleanNew.length > MAX_PASSWORD) {
      showToast(`A senha do Admin deve ter entre ${MIN_PASSWORD} e ${MAX_PASSWORD} caracteres.`);
      return;
    }

    if (cleanNew !== cleanConfirm) {
      showToast('As senhas digitadas não conferem.');
      return;
    }

    setIsSaving(true);
    try {
      const ok = await updateSuperAdminPassword(cleanNew);
      if (ok) {
        setIsAdminPassModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateStore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !storeName.trim() || !email.trim() || isSaving) return;

    const digits = extractPhoneDigits(phone);
    if (digits.length !== PHONE_DIGITS_LENGTH) {
      showToast('O WhatsApp deve conter exatamente 11 números (DDD + 9 dígitos).');
      return;
    }

    setIsSaving(true);
    try {
      const created = await addStore(
        {
          name: storeName.trim().slice(0, MAX_STORE_NAME),
          ownerName: ownerName.trim().slice(0, MAX_OWNER_NAME),
          phone: formatPhone11(digits),
          email: email.trim().toLowerCase().slice(0, MAX_EMAIL),
          city: city.trim() || 'São Paulo, SP',
        },
        true
      );

      if (created) {
        setOwnerName('');
        setStoreName('');
        setPhone('');
        setEmail('');
        setCity('São Paulo, SP');
        setIsAddModalOpen(false);
      }
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] pb-20 antialiased">
      {/* Super Admin Top Header */}
      <header className="bg-[#261A1A] text-white border-b border-white/10 px-4 sm:px-6 py-3.5 sm:py-5">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2 sm:gap-4">
          <div className="flex items-center gap-2 sm:gap-4">
            <Logo variant="light" size="sm" onClick={() => setViewMode('landing')} />
            <div className="h-6 w-px bg-white/20 hidden sm:block" />
            <span className="text-[11px] sm:text-xs font-semibold px-2 sm:px-2.5 py-1 rounded-lg bg-[#D07A6D] text-white flex items-center gap-1.5 whitespace-nowrap">
              <span>👑 Super Adm</span>
            </span>
          </div>

          <div className="flex items-center gap-2 sm:gap-2.5">
            <span className="hidden lg:inline-block text-xs font-mono text-white/70 bg-white/5 border border-white/10 px-3 py-1.5 rounded-xl">
              projetointegradors303@gmail.com
            </span>
            <button
              type="button"
              onClick={handleOpenAdminPassModal}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl bg-[#D07A6D]/20 hover:bg-[#D07A6D]/30 border border-[#D07A6D]/40 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
              title="Definir ou alterar senha do Super Administrador"
            >
              <Key className="w-3.5 h-3.5 text-[#D07A6D]" />
              <span>Senha Adm</span>
            </button>
            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 min-h-[36px] rounded-xl bg-white/10 hover:bg-white/20 text-xs font-medium text-white transition-colors cursor-pointer shrink-0"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Sair</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6 sm:space-y-8">
        {/* Title and Action */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#231818]">
              Gerenciamento Global de Docerias
            </h1>
            <p className="text-xs text-[#7C6E68] mt-1">
              Dados sincronizados em tempo real com o banco na nuvem. Aprove cadastros ou crie novas contas.
            </p>
          </div>

          <button
            type="button"
            onClick={() => setIsAddModalOpen(true)}
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] active:scale-[0.98] text-white text-xs sm:text-sm font-bold shadow-xs transition-all cursor-pointer whitespace-nowrap shrink-0"
          >
            <Plus className="w-4 h-4 text-[#D07A6D] shrink-0" />
            <span>Cadastrar Nova Doceria</span>
          </button>
        </div>

        {/* Global KPI Strip */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-5">
          <div className="bg-white p-5 rounded-2xl border border-[#EFE8DE] shadow-xs">
            <span className="text-xs text-[#7C6E68]">Total de Lojas</span>
            <h3 className="text-2xl font-serif font-bold text-[#231818] mt-1 tabular-nums">
              {stores.length}
            </h3>
            <p className="text-[11px] text-[#7C6E68] mt-1">Registradas no banco de dados</p>
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
        <div className="bg-white p-3.5 rounded-2xl border border-[#EFE8DE] flex flex-col lg:flex-row lg:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 lg:pb-0">
            <button
              type="button"
              onClick={() => setFilterStatus('all')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                filterStatus === 'all'
                  ? 'bg-[#2B1D1D] text-white'
                  : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
              }`}
            >
              Todas ({stores.length})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('pending_approval')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 shrink-0 cursor-pointer ${
                filterStatus === 'pending_approval'
                  ? 'bg-amber-600 text-white'
                  : 'text-amber-800 bg-amber-50 hover:bg-amber-100'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              <span>Em Análise ({pendingStoresCount})</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('active')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                filterStatus === 'active'
                  ? 'bg-emerald-700 text-white'
                  : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
              }`}
            >
              Ativas ({activeStoresCount})
            </button>

            <button
              type="button"
              onClick={() => setFilterStatus('blocked')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors shrink-0 cursor-pointer ${
                filterStatus === 'blocked'
                  ? 'bg-[#B85848] text-white'
                  : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
              }`}
            >
              Bloqueadas ({blockedStoresCount})
            </button>
          </div>

          <div className="relative w-full lg:w-72 shrink-0">
            <Search className="w-4 h-4 text-[#7C6E68] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Buscar por loja, dona ou gmail..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] min-h-[42px] sm:min-h-[38px]"
            />
          </div>
        </div>

        {/* Stores List or Database-Faithful Zero State */}
        <div className="bg-white rounded-3xl border border-[#EFE8DE] shadow-xs overflow-hidden">
          {filteredStores.length === 0 ? (
            <div className="p-10 sm:p-14 text-center space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-[#F8F4EE] text-[#D07A6D] flex items-center justify-center mx-auto">
                <StoreIcon className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#231818]">
                {stores.length === 0
                  ? 'Nenhuma doceria cadastrada no banco de dados'
                  : 'Nenhuma doceria encontrada para este filtro'}
              </h3>
              <p className="text-xs text-[#7C6E68] max-w-md mx-auto leading-relaxed">
                {stores.length === 0
                  ? 'O banco de dados está zerado. Somente contas reais cadastradas por você ou solicitadas pelo site aparecerão aqui.'
                  : 'Tente limpar a busca ou selecionar outro filtro de status acima.'}
              </p>
              {stores.length === 0 && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Plus className="w-4 h-4 text-[#D07A6D]" />
                    <span>Cadastrar Primeira Doceria</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              {/* Mobile & Tablet Card List */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:hidden divide-y md:divide-y-0 md:gap-4 md:p-4 divide-[#EFE8DE]">
                {filteredStores.map((store) => {
                  const isBlocked = store.status === 'blocked';
                  const isPending = store.status === 'pending_approval';

                  return (
                    <div
                      key={store.id}
                      className={`p-4 md:rounded-2xl md:border md:border-[#EFE8DE] space-y-3.5 transition-colors flex flex-col justify-between min-w-0 ${
                        isPending ? 'bg-amber-50/40' : isBlocked ? 'bg-red-50/25' : 'bg-white'
                      }`}
                    >
                      {/* Header info */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div
                            className={`w-11 h-11 rounded-2xl flex items-center justify-center font-bold text-sm shrink-0 ${
                              isPending
                                ? 'bg-amber-100 text-amber-700'
                                : isBlocked
                                ? 'bg-red-100 text-red-700'
                                : 'bg-[#F8F4EE] text-[#D07A6D]'
                            }`}
                          >
                            <StoreIcon className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-bold text-sm text-[#231818] leading-tight truncate">
                              {store.name}
                            </h4>
                            <p className="text-[#7C6E68] text-xs flex items-center gap-1 mt-0.5 truncate">
                              <User className="w-3 h-3 text-[#D07A6D] shrink-0" /> {store.ownerName}
                            </p>
                            <span className="text-[11px] text-[#7C6E68] flex items-center gap-1 mt-0.5 truncate">
                              <MapPin className="w-3 h-3 shrink-0" /> {store.city}
                            </span>
                          </div>
                        </div>

                        {/* Status Badge + Delete Trigger */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          {isPending ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-100 text-amber-900 text-[10px] font-bold">
                              <Clock className="w-3 h-3 text-amber-700" /> Em Análise
                            </span>
                          ) : isBlocked ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-red-100 text-red-800 text-[10px] font-bold">
                              <Lock className="w-3 h-3" /> Bloqueada
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-lg bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                              <ShieldCheck className="w-3 h-3" /> Ativa
                            </span>
                          )}

                          <button
                            type="button"
                            onClick={() => setStoreToDelete(store)}
                            className="p-1.5 rounded-lg text-[#7C6E68] hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
                            title="Excluir conta da doceria"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Contacts & Password */}
                      <div className="bg-[#FBF8F3] p-3 rounded-2xl border border-[#EFE8DE] space-y-2 text-xs">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#7C6E68] flex items-center gap-1">
                            <Phone className="w-3.5 h-3.5 text-[#D07A6D]" /> WhatsApp
                          </span>
                          <strong className="text-[#231818] font-mono">{store.phone}</strong>
                        </div>
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-[#7C6E68] flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-[#7C6E68]" /> Gmail
                          </span>
                          <span className="text-[#231818] font-mono text-[11px] truncate max-w-[180px]">
                            {store.email}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-xs pt-1 border-t border-[#EFE8DE]/80">
                          <span className="text-[#7C6E68] flex items-center gap-1">
                            <Key className="w-3.5 h-3.5 text-amber-600" /> Senha
                          </span>
                          {store.loginPassword ? (
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-xs font-bold px-2 py-0.5 rounded-lg bg-white border border-[#EFE8DE] text-[#231818]">
                                {store.loginPassword}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleOpenPasswordModal(store)}
                                className="text-[11px] text-[#D07A6D] font-bold underline cursor-pointer p-1"
                              >
                                Editar
                              </button>
                            </div>
                          ) : (
                            <span className="text-amber-700 text-[11px] font-bold">Sem senha</span>
                          )}
                        </div>
                      </div>

                      {/* Actions Button Row */}
                      <div className="flex flex-col sm:flex-row gap-2 pt-1">
                        {isPending ? (
                          <button
                            type="button"
                            onClick={() => handleOpenPasswordModal(store)}
                            className="w-full min-h-[42px] px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:scale-[0.98] text-white text-xs font-bold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                          >
                            <Key className="w-4 h-4" />
                            <span>Aprovar & Enviar Senha no WhatsApp</span>
                          </button>
                        ) : (
                          <div className="grid grid-cols-2 gap-2 w-full">
                            <button
                              type="button"
                              onClick={() => toggleStoreBlockStatus(store.id)}
                              className={`min-h-[42px] px-3 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center cursor-pointer ${
                                isBlocked
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                  : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                              }`}
                            >
                              {isBlocked ? 'Desbloquear' : 'Bloquear'}
                            </button>
                            <button
                              type="button"
                              onClick={() => switchStore(store.id)}
                              className="min-h-[42px] px-3 py-2 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-bold inline-flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                            >
                              <span>Acessar Painel</span>
                              <ExternalLink className="w-3.5 h-3.5 text-[#D07A6D]" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Desktop Table View (>= 1280px) */}
              <div className="hidden xl:block overflow-x-auto">
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
                                  <MapPin className="w-3 h-3" /> {store.city}
                                  {store.createdAt ? ` · Cadastrada em ${store.createdAt}` : ''}
                                </span>
                              </div>
                            </div>
                          </td>

                          <td className="py-4 px-6 text-[#7C6E68]">
                            <p className="font-medium text-[#231818] flex items-center gap-1.5">
                              <Phone className="w-3.5 h-3.5 text-[#D07A6D]" /> {store.phone}
                            </p>
                            <p className="text-[11px] text-[#7C6E68] flex items-center gap-1.5 mt-0.5 font-mono">
                              <Mail className="w-3.5 h-3.5 text-[#7C6E68]" /> {store.email}
                            </p>
                          </td>

                          <td className="py-4 px-6">
                            {store.loginPassword ? (
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#F8F4EE] border border-[#EFE8DE] text-[#231818]">
                                  {store.loginPassword}
                                </span>
                                <button
                                  type="button"
                                  onClick={() => handleOpenPasswordModal(store)}
                                  className="text-[11px] text-[#7C6E68] hover:text-[#D07A6D] underline cursor-pointer"
                                  title="Alterar ou reenviar senha"
                                >
                                  Alterar
                                </button>
                              </div>
                            ) : (
                              <button
                                type="button"
                                onClick={() => handleOpenPasswordModal(store)}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-xs transition-colors cursor-pointer"
                              >
                                <Key className="w-3.5 h-3.5" />
                                <span>Gerar Senha 🔑</span>
                              </button>
                            )}
                          </td>

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

                          <td className="py-4 px-6 text-right">
                            <div className="inline-flex items-center justify-end gap-2">
                              {isPending ? (
                                <button
                                  type="button"
                                  onClick={() => handleOpenPasswordModal(store)}
                                  className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Aprovar & Enviar Senha
                                </button>
                              ) : (
                                <>
                                  <button
                                    type="button"
                                    onClick={() => toggleStoreBlockStatus(store.id)}
                                    className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                                      isBlocked
                                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                        : 'bg-red-50 hover:bg-red-100 text-red-700 border border-red-200'
                                    }`}
                                  >
                                    {isBlocked ? 'Desbloquear Loja' : 'Bloquear Loja'}
                                  </button>

                                  <button
                                    type="button"
                                    onClick={() => switchStore(store.id)}
                                    className="px-3 py-1.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold inline-flex items-center gap-1 transition-colors cursor-pointer"
                                  >
                                    <span>Acessar</span>
                                    <ExternalLink className="w-3 h-3 text-[#D07A6D]" />
                                  </button>
                                </>
                              )}

                              <button
                                type="button"
                                onClick={() => setStoreToDelete(store)}
                                className="p-2 rounded-xl text-[#7C6E68] hover:text-red-600 hover:bg-red-50 border border-transparent hover:border-red-200 transition-colors cursor-pointer"
                                title="Excluir conta da doceria"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </main>

      {/* MODAL: Confirmar Exclusão de Doceria */}
      {storeToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 space-y-3 text-center">
              <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-600 flex items-center justify-center mx-auto">
                <Trash2 className="w-5 h-5" />
              </div>
              <h3 className="text-lg font-serif font-bold text-[#231818]">
                Excluir conta de {storeToDelete.name}?
              </h3>
              <p className="text-xs text-[#7C6E68] leading-relaxed">
                Esta ação remove permanentemente do banco de dados a conta{' '}
                <strong className="text-[#231818]">{storeToDelete.email}</strong>, além de todos os
                produtos, pedidos e clientes vinculados a esta loja.
              </p>
            </div>
            <div className="px-6 py-4 bg-[#FBF8F3] border-t border-[#EFE8DE] flex items-center justify-end gap-2.5">
              <button
                type="button"
                disabled={isDeletingStore}
                onClick={() => setStoreToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-[#7C6E68] hover:text-[#231818] cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                disabled={isDeletingStore}
                onClick={handleConfirmDeleteStore}
                className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold transition-colors cursor-pointer disabled:opacity-60"
              >
                {isDeletingStore ? 'Excluindo...' : 'Excluir Permanentemente'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: Gerar Senha de Login e Enviar no WhatsApp */}
      {passwordModalStore && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-lg max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
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
                type="button"
                onClick={() => setPasswordModalStore(null)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-xl hover:bg-[#EFE8DE]/60 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
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
                  <strong className="text-[#231818] font-mono text-[11px] truncate block">
                    {passwordModalStore.email}
                  </strong>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-[#7C6E68] block">WhatsApp de Destino</span>
                  <strong className="text-[#231818] font-mono text-[11px] truncate block">
                    {passwordModalStore.phone}
                  </strong>
                </div>
              </div>

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
                    className="p-2 rounded-xl border border-[#EFE8DE] bg-[#FBF8F3] hover:bg-[#EFE8DE] text-[#231818] transition-colors shrink-0 cursor-pointer"
                    title="Gerar outra senha aleatória"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-[#D07A6D]" />
                  </button>
                </div>
                <p className="text-[10px] text-[#7C6E68] mt-1">
                  Esta senha será associada ao Gmail <strong>{passwordModalStore.email}</strong>.
                </p>
              </div>

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
                  className="px-3 py-1.5 text-xs font-medium text-[#7C6E68] hover:text-[#231818] cursor-pointer"
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
                type="button"
                onClick={() => setIsAddModalOpen(false)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-xl hover:bg-[#EFE8DE]/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleCreateStore} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-3.5 overflow-y-auto flex-1 text-xs">
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#7C6E68]">
                      Nome da Pessoa *
                    </label>
                    <span className="text-[10px] font-mono text-[#7C6E68]/80">
                      {ownerName.length}/{MAX_OWNER_NAME}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={MAX_OWNER_NAME}
                    placeholder="Ex: Vanessa Guimarães"
                    value={ownerName}
                    onChange={(e) => setOwnerName(sanitizeOwnerName(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#7C6E68]">
                      Nome da Loja *
                    </label>
                    <span className="text-[10px] font-mono text-[#7C6E68]/80">
                      {storeName.length}/{MAX_STORE_NAME}
                    </span>
                  </div>
                  <input
                    type="text"
                    required
                    maxLength={MAX_STORE_NAME}
                    placeholder="Ex: Vanessa Confeitaria"
                    value={storeName}
                    onChange={(e) => setStoreName(sanitizeStoreName(e.target.value))}
                    className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#7C6E68]">
                        Telefone / WhatsApp *
                      </label>
                      <span className="text-[10px] font-mono text-[#7C6E68]/80">
                        {extractPhoneDigits(phone).length}/{PHONE_DIGITS_LENGTH}
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
                      className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl font-mono"
                    />
                  </div>

                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-xs font-semibold text-[#7C6E68]">
                        Gmail / E-mail *
                      </label>
                      <span className="text-[10px] font-mono text-[#7C6E68]/80">
                        {email.length}/{MAX_EMAIL}
                      </span>
                    </div>
                    <input
                      type="email"
                      required
                      maxLength={MAX_EMAIL}
                      placeholder="vanessa.doces@gmail.com"
                      value={email}
                      onChange={(e) => setEmail(sanitizeEmail(e.target.value))}
                      className="w-full px-3.5 py-2 text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl"
                    />
                  </div>
                </div>

                <CityStateSelect value={city} onChange={setCity} compact showIcon={false} />
              </div>

              <div className="px-5 py-3 border-t border-[#EFE8DE] bg-[#FBF8F3] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#7C6E68] hover:text-[#231818] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Salvando...' : 'Cadastrar Doceria (Ativa)'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Admin: Definir / Alterar Senha do Super Administrador */}
      {isAdminPassModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-md max-h-[88vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden flex flex-col animate-in fade-in zoom-in-95 duration-200">
            <div className="px-5 py-3.5 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3] shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-[#2B1D1D] text-[#D07A6D] flex items-center justify-center shrink-0">
                  <Key className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D] block leading-tight">
                    • Segurança na Nuvem
                  </span>
                  <h3 className="text-base font-serif font-bold text-[#231818] leading-tight">
                    Senha do Super Administrador
                  </h3>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsAdminPassModalOpen(false)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-xl hover:bg-[#EFE8DE]/60 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveAdminPassword} className="flex flex-col flex-1 overflow-hidden">
              <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
                <div className="p-3 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE] space-y-2">
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[#7C6E68]">E-mail Administrador:</span>
                    <strong className="text-[#231818] font-mono text-[11px] truncate">
                      projetointegradors303@gmail.com
                    </strong>
                  </div>
                  <div className="flex items-center justify-between gap-2 pt-1.5 border-t border-[#EFE8DE]">
                    <span className="text-[#7C6E68]">Senha Atual:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[#231818] bg-white px-2 py-0.5 rounded-md border border-[#EFE8DE]">
                        {superAdminPassword}
                      </span>
                      <button
                        type="button"
                        onClick={handleCopyAdminCredentials}
                        className="text-[11px] text-[#D07A6D] font-bold hover:underline inline-flex items-center gap-1 cursor-pointer"
                      >
                        {copiedAdminPass ? <Check className="w-3 h-3 text-emerald-600" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedAdminPass ? 'Copiado' : 'Copiar'}</span>
                      </button>
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E68]">
                      Nova Senha do Adm *
                    </label>
                    <span className="text-[10px] font-mono text-[#7C6E68]/80">
                      {newAdminPass.length}/{MAX_PASSWORD}
                    </span>
                  </div>
                  <div className="relative">
                    <input
                      type={showAdminPass ? 'text' : 'password'}
                      required
                      minLength={MIN_PASSWORD}
                      maxLength={MAX_PASSWORD}
                      placeholder="Digite a nova senha"
                      value={newAdminPass}
                      onChange={(e) => setNewAdminPass(e.target.value.slice(0, MAX_PASSWORD))}
                      className="w-full pl-3.5 pr-10 py-2.5 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl font-mono text-[#231818] focus:outline-hidden focus:border-[#D07A6D] min-h-[42px]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowAdminPass(!showAdminPass)}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-[#7C6E68] hover:text-[#231818] cursor-pointer"
                      title={showAdminPass ? 'Ocultar senha' : 'Mostrar senha'}
                    >
                      {showAdminPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="text-[11px] font-bold uppercase tracking-wider text-[#7C6E68] block mb-1">
                    Confirmar Nova Senha *
                  </label>
                  <input
                    type={showAdminPass ? 'text' : 'password'}
                    required
                    minLength={MIN_PASSWORD}
                    maxLength={MAX_PASSWORD}
                    placeholder="Repita a nova senha"
                    value={confirmAdminPass}
                    onChange={(e) => setConfirmAdminPass(e.target.value.slice(0, MAX_PASSWORD))}
                    className="w-full px-3.5 py-2.5 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl font-mono text-[#231818] focus:outline-hidden focus:border-[#D07A6D] min-h-[42px]"
                  />
                  <p className="text-[10px] text-[#7C6E68] mt-1.5 leading-relaxed">
                    Esta senha fica salva no banco de dados na nuvem e vale automaticamente em qualquer celular, tablet ou computador.
                  </p>
                </div>
              </div>

              <div className="px-5 py-3 border-t border-[#EFE8DE] bg-[#FBF8F3] flex items-center justify-end gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setIsAdminPassModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-medium text-[#7C6E68] hover:text-[#231818] cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 min-h-[38px] rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer disabled:opacity-60"
                >
                  {isSaving ? 'Salvando...' : 'Salvar Senha na Nuvem'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
