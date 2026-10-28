import React, { useState } from 'react';
import { useComfy, DashboardTab } from '../../context/ComfyContext';
import { Logo } from '../common/Logo';
import { OverviewView } from './OverviewView';
import { OrdersView } from './OrdersView';
import { CatalogView } from './CatalogView';
import { CustomersView } from './CustomersView';
import { ReportsView } from './ReportsView';
import { PreferencesView } from './PreferencesView';
import {
  LayoutDashboard,
  BookOpen,
  ShoppingBag,
  Users,
  BarChart3,
  Settings,
  ExternalLink,
  Menu,
  X,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const {
    activeTab,
    setActiveTab,
    setViewMode,
    pendingOrdersCount,
    storeProfile,
    currentStore,
    hasActiveStore,
    currentUserRole,
    logout,
  } = useComfy();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems: {
    id: DashboardTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    { id: 'visao-geral', label: 'Visão geral', icon: LayoutDashboard },
    { id: 'catalogo', label: 'Catálogo', icon: BookOpen },
    { id: 'pedidos', label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'clientes', label: 'Clientes', icon: Users },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3 },
  ];

  const tabletTabs: {
    id: DashboardTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }[] = [
    ...navItems,
    { id: 'preferencias', label: 'Preferências', icon: Settings },
  ];

  // Mobile Bottom Bar Navigation items (top 4 + Mais)
  const mobileNavTabs = [
    { id: 'visao-geral' as DashboardTab, label: 'Início', icon: LayoutDashboard },
    { id: 'pedidos' as DashboardTab, label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'catalogo' as DashboardTab, label: 'Catálogo', icon: BookOpen },
    { id: 'clientes' as DashboardTab, label: 'Clientes', icon: Users },
  ];

  const renderActiveView = () => {
    if (!hasActiveStore) {
      return (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-[#EFE8DE] shadow-xs max-w-xl mx-auto text-center space-y-4 my-8">
          <h2 className="text-xl sm:text-2xl font-serif font-bold text-[#231818]">
            Nenhuma doceria selecionada
          </h2>
          <p className="text-xs sm:text-sm text-[#7C6E68] leading-relaxed">
            Não há uma conta de doceria ativa carregada do banco de dados no momento.
          </p>
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
            {currentUserRole === 'superadmin' ? (
              <button
                type="button"
                onClick={() => setViewMode('super-admin')}
                className="px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold cursor-pointer"
              >
                Voltar ao Painel Super Adm
              </button>
            ) : (
              <button
                type="button"
                onClick={logout}
                className="px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold cursor-pointer"
              >
                Voltar ao Login
              </button>
            )}
          </div>
        </div>
      );
    }

    if (currentStore.status === 'blocked') {
      return (
        <div className="bg-white rounded-3xl p-6 sm:p-10 lg:p-12 border border-red-200 shadow-sm max-w-2xl mx-auto text-center space-y-4 my-6 sm:my-8">
          <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            Acesso Suspenso
          </span>
          <h2 className="text-xl sm:text-3xl font-serif font-bold text-[#231818]">
            Loja Temporariamente Bloqueada
          </h2>
          <p className="text-xs sm:text-sm text-[#7C6E68] leading-relaxed max-w-lg mx-auto">
            O acesso às funções da doceria <strong>{currentStore.name}</strong> foi suspenso
            temporariamente pela administração da plataforma Comfy.
            {currentStore.blockReason && (
              <span className="block mt-2 font-medium text-red-700">
                Motivo: {currentStore.blockReason}
              </span>
            )}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              type="button"
              onClick={logout}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold min-h-[44px] cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#D07A6D]" />
              <span>Sair da Conta</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('landing')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F8F4EE] hover:bg-[#EFE8DE] text-[#231818] text-xs font-semibold min-h-[44px] cursor-pointer"
            >
              Voltar ao Site
            </button>
          </div>
        </div>
      );
    }

    switch (activeTab) {
      case 'visao-geral':
        return <OverviewView />;
      case 'pedidos':
        return <OrdersView />;
      case 'catalogo':
        return <CatalogView />;
      case 'clientes':
        return <CustomersView />;
      case 'relatorios':
        return <ReportsView />;
      case 'preferencias':
        return <PreferencesView />;
      default:
        return <OverviewView />;
    }
  };

  const getSectionTitle = () => {
    switch (activeTab) {
      case 'visao-geral':
        return 'Visão geral';
      case 'pedidos':
        return 'Pedidos';
      case 'catalogo':
        return 'Catálogo';
      case 'clientes':
        return 'Clientes';
      case 'relatorios':
        return 'Relatórios';
      case 'preferencias':
        return 'Preferências';
    }
  };

  const ownerInitial = (storeProfile.ownerName || 'C').trim().charAt(0).toUpperCase();

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] flex flex-col lg:flex-row antialiased">
      {/* Top Bar for Mobile & Tablet (< 1024px) */}
      <div className="lg:hidden sticky top-0 z-30 flex items-center justify-between px-3.5 sm:px-6 py-3 bg-[#261A1A] text-white border-b border-white/10 shadow-sm gap-2">
        <div className="flex items-center gap-2 sm:gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 -ml-1 text-white/85 hover:text-white rounded-xl hover:bg-white/10 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer shrink-0"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <Logo variant="light" size="sm" onClick={() => setViewMode('landing')} />

          <div className="h-4 w-px bg-white/20 hidden xs:block sm:block shrink-0" />
          <span className="text-xs font-semibold text-white/90 truncate max-w-[120px] sm:max-w-[220px]">
            {storeProfile.name}
          </span>
        </div>

        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          <div className="hidden sm:flex items-center gap-2 pr-1">
            <div className="w-7 h-7 rounded-full bg-[#E5B5AC] text-[#2B1D1D] flex items-center justify-center font-bold text-xs select-none shrink-0">
              {ownerInitial}
            </div>
            <span className="text-xs text-white/85 font-medium max-w-[130px] truncate">
              {storeProfile.ownerName}
            </span>
          </div>

          <button
            type="button"
            onClick={logout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/10 hover:bg-red-500/25 border border-white/15 hover:border-red-400/40 text-white hover:text-red-100 text-xs font-semibold transition-colors cursor-pointer min-h-[38px] whitespace-nowrap shrink-0"
            title="Sair da conta"
          >
            <LogOut className="w-3.5 h-3.5 text-[#E5B5AC]" />
            <span>Sair</span>
          </button>
        </div>
      </div>

      {/* Tablet Horizontal Navigation Strip (640px – 1023px) */}
      <div className="hidden sm:block lg:hidden sticky top-[65px] z-20 bg-white/95 backdrop-blur-md border-b border-[#EFE8DE] px-6 py-2">
        <div className="flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <div className="flex items-center gap-1.5">
            {tabletTabs.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer min-h-[40px] shrink-0 ${
                    isActive
                      ? 'bg-[#2B1D1D] text-white font-semibold shadow-2xs'
                      : 'text-[#7C6E68] hover:text-[#231818] hover:bg-[#FBF8F3]'
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-[#D07A6D]' : 'text-[#7C6E68]'}`} />
                  <span>{item.label}</span>
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="px-1.5 py-0.5 rounded-full bg-[#D07A6D] text-white text-[10px] font-bold leading-none tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Backdrop overlay for mobile & tablet drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 lg:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar (Desktop >= 1024px sticky + Mobile/Tablet slide-over drawer) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 lg:z-30 h-dvh w-72 lg:w-60 xl:w-64 bg-[#261A1A] text-white flex flex-col justify-between p-5 xl:p-6 overflow-y-auto transition-transform duration-300 shadow-2xl lg:shadow-none shrink-0 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Header with Logo and Close on Mobile/Tablet */}
          <div className="flex items-center justify-between pt-1">
            <Logo variant="light" size="md" onClick={() => setViewMode('landing')} />
            <button
              type="button"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden p-1.5 text-white/60 hover:text-white rounded-lg cursor-pointer"
              aria-label="Fechar menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Store Badge */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-[#A3928E] uppercase font-bold tracking-wider">
              Doceria Ativa
            </p>
            <p className="text-sm font-bold text-white truncate mt-0.5">{storeProfile.name}</p>
            <p className="text-xs text-[#C9BCB8] truncate">{storeProfile.ownerName}</p>
          </div>

          {/* Navigation Section 1: SUA LOJA */}
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#A3928E] uppercase block mb-2 px-3">
              Sua Loja
            </span>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[42px] ${
                      isActive
                        ? 'bg-[#3A2828] text-white shadow-xs font-semibold'
                        : 'text-[#C9BCB8] hover:text-white hover:bg-[#322323]'
                    }`}
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <Icon
                        className={`w-4 h-4 shrink-0 ${
                          isActive ? 'text-[#D07A6D]' : 'text-[#A3928E]'
                        }`}
                      />
                      <span className="truncate">{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#D07A6D] text-white text-[10px] font-bold flex items-center justify-center shrink-0 tabular-nums">
                        {item.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Navigation Section 2: CONFIGURAÇÕES */}
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#A3928E] uppercase block mb-2 px-3">
              Configurações
            </span>
            <nav className="space-y-1">
              <button
                type="button"
                onClick={() => {
                  setActiveTab('preferencias');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[42px] ${
                  activeTab === 'preferencias'
                    ? 'bg-[#3A2828] text-white shadow-xs font-semibold'
                    : 'text-[#C9BCB8] hover:text-white hover:bg-[#322323]'
                }`}
              >
                <Settings
                  className={`w-4 h-4 shrink-0 ${
                    activeTab === 'preferencias' ? 'text-[#D07A6D]' : 'text-[#A3928E]'
                  }`}
                />
                <span className="truncate">Preferências</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Link to Landing Page & Logout */}
        <div className="pt-4 mt-6 border-t border-white/10 space-y-2">
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setViewMode('landing');
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#322323] hover:bg-[#3E2C2C] text-[#C9BCB8] hover:text-white text-xs transition-colors cursor-pointer min-h-[42px]"
          >
            <span className="font-medium truncate">← Ver Site Institucional</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60 shrink-0" />
          </button>

          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/20 text-red-300 hover:text-red-100 text-xs transition-colors cursor-pointer min-h-[42px]"
          >
            <span className="font-medium">Sair da Conta</span>
            <LogOut className="w-3.5 h-3.5 shrink-0" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header of Main Area (Desktop >= 1024px) */}
        <header className="hidden lg:flex px-8 xl:px-10 py-5 border-b border-[#EFE8DE] bg-[#FBF8F3] items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-xs text-[#7C6E68] capitalize">
              {new Date().toLocaleDateString('pt-BR', {
                weekday: 'long',
                day: 'numeric',
                month: 'long',
              })}
            </p>
            <h2 className="text-2xl xl:text-3xl font-serif font-bold text-[#231818] tracking-tight truncate">
              {getSectionTitle()}
            </h2>
          </div>

          {/* Store Profile Info + Direct Logout Button ONLY */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-white border border-[#EFE8DE]">
              <div className="w-8 h-8 rounded-full bg-[#E5B5AC] text-[#2B1D1D] flex items-center justify-center font-bold text-xs select-none shrink-0">
                {ownerInitial}
              </div>

              <div className="text-left max-w-[180px]">
                <p className="text-xs font-bold text-[#231818] leading-tight truncate">
                  {storeProfile.name}
                </p>
                <p className="text-[10px] text-[#7C6E68] truncate">
                  {storeProfile.ownerName} ·{' '}
                  {currentStore.status === 'blocked' ? 'Bloqueada' : 'Ativa'}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white hover:bg-red-50 text-[#231818] hover:text-red-600 border border-[#EFE8DE] hover:border-red-200 text-xs font-semibold transition-colors cursor-pointer min-h-[42px] whitespace-nowrap shrink-0"
              title="Sair da conta"
            >
              <LogOut className="w-3.5 h-3.5 text-[#D07A6D]" />
              <span>Sair</span>
            </button>
          </div>
        </header>

        {/* Inner Content View */}
        <div className="px-4 py-5 sm:px-6 sm:py-6 lg:px-8 xl:px-10 lg:py-8 pb-24 sm:pb-8 max-w-7xl w-full mx-auto flex-1 min-w-0">
          {renderActiveView()}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar for Mobile Phones (< 640px) */}
      <nav className="sm:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EFE8DE] px-1.5 py-1 shadow-lg">
        <div className="grid grid-cols-5 items-center">
          {mobileNavTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 min-h-[50px] transition-colors cursor-pointer ${
                  isActive ? 'text-[#D07A6D]' : 'text-[#7C6E68]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-[#D07A6D] text-white text-[9px] font-bold flex items-center justify-center tabular-nums">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span
                  className={`text-[10px] mt-0.5 tracking-tight truncate max-w-full px-0.5 ${
                    isActive ? 'font-bold text-[#231818]' : 'font-medium'
                  }`}
                >
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5th Tab: Menu drawer trigger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 min-h-[50px] transition-colors cursor-pointer ${
              activeTab === 'preferencias' || activeTab === 'relatorios'
                ? 'text-[#D07A6D]'
                : 'text-[#7C6E68]'
            }`}
          >
            <MoreHorizontal className="w-5 h-5 stroke-2" />
            <span className="text-[10px] mt-0.5 font-medium tracking-tight">Mais</span>
          </button>
        </div>
      </nav>
    </div>
  );
};
