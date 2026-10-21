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
  ArrowLeftRight,
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
    stores,
    currentStore,
    switchStore,
    logout,
  } = useComfy();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [storeSwitcherOpen, setStoreSwitcherOpen] = useState(false);

  const navItems = [
    { id: 'visao-geral' as DashboardTab, label: 'Visão geral', icon: LayoutDashboard },
    { id: 'catalogo' as DashboardTab, label: 'Catálogo', icon: BookOpen },
    { id: 'pedidos' as DashboardTab, label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'clientes' as DashboardTab, label: 'Clientes', icon: Users },
    { id: 'relatorios' as DashboardTab, label: 'Relatórios', icon: BarChart3 },
  ];

  // Mobile Bottom Bar Navigation items (top 4 + More)
  const mobileNavTabs = [
    { id: 'visao-geral' as DashboardTab, label: 'Início', icon: LayoutDashboard },
    { id: 'pedidos' as DashboardTab, label: 'Pedidos', icon: ShoppingBag, badge: pendingOrdersCount },
    { id: 'catalogo' as DashboardTab, label: 'Catálogo', icon: BookOpen },
    { id: 'clientes' as DashboardTab, label: 'Clientes', icon: Users },
  ];

  const renderActiveView = () => {
    if (currentStore.status === 'blocked') {
      return (
        <div className="bg-white rounded-3xl p-6 sm:p-12 border border-red-200 shadow-sm max-w-2xl mx-auto text-center space-y-4 my-8">
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
            O acesso às funções da doceria <strong>{currentStore.name}</strong> foi bloqueado pela
            administração da plataforma Comfy.
            {currentStore.blockReason && (
              <span className="block mt-2 font-medium text-red-700">
                Motivo: {currentStore.blockReason}
              </span>
            )}
          </p>
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setViewMode('super-admin')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold min-h-[44px]"
            >
              Abrir Super Admin p/ Desbloquear
            </button>
            <button
              onClick={() => setViewMode('landing')}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#F8F4EE] hover:bg-[#EFE8DE] text-[#231818] text-xs font-semibold min-h-[44px]"
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

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] flex flex-col md:flex-row antialiased">
      {/* Mobile Top Bar */}
      <div className="md:hidden sticky top-0 z-30 flex items-center justify-between px-4 py-3 bg-[#261A1A] text-white border-b border-white/10 shadow-sm">
        <div className="flex items-center gap-2.5">
          <Logo variant="light" size="sm" onClick={() => setViewMode('landing')} />
          <div className="h-4 w-px bg-white/20" />
          <span className="text-xs font-semibold text-white/90 truncate max-w-[140px]">
            {storeProfile.name}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {/* Quick store switcher button */}
          <button
            onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
            className="w-8 h-8 rounded-full bg-[#E5B5AC] text-[#2B1D1D] flex items-center justify-center font-bold text-xs cursor-pointer"
            title="Trocar loja"
          >
            {storeProfile.ownerName.charAt(0)}
          </button>

          {/* Drawer menu trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-white/80 hover:text-white rounded-lg hover:bg-white/10 min-w-[40px] min-h-[40px] flex items-center justify-center cursor-pointer"
            aria-label="Abrir menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Backdrop overlay for mobile drawer */}
      {mobileMenuOpen && (
        <div
          onClick={() => setMobileMenuOpen(false)}
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs transition-opacity"
        />
      )}

      {/* Sidebar (Desktop sticky + Mobile slide-over drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-50 md:z-40 h-screen w-72 md:w-64 bg-[#261A1A] text-white flex flex-col justify-between p-6 transition-transform duration-300 shadow-2xl md:shadow-none ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          {/* Header with Logo and Close on Mobile */}
          <div className="flex items-center justify-between pt-1">
            <Logo variant="light" size="md" onClick={() => setViewMode('landing')} />
            <button
              onClick={() => setMobileMenuOpen(false)}
              className="md:hidden p-1.5 text-white/60 hover:text-white rounded-lg cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Store Badge */}
          <div className="p-3 rounded-2xl bg-white/5 border border-white/10">
            <p className="text-[10px] text-[#A3928E] uppercase font-bold tracking-wider">Doceria Ativa</p>
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
                    onClick={() => {
                      setActiveTab(item.id);
                      setMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-3.5 py-3 md:py-2.5 rounded-xl text-xs sm:text-xs font-medium transition-all cursor-pointer min-h-[44px] ${
                      isActive
                        ? 'bg-[#3A2828] text-white shadow-xs font-semibold'
                        : 'text-[#C9BCB8] hover:text-white hover:bg-[#322323]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Icon
                        className={`w-4 h-4 ${
                          isActive ? 'text-[#D07A6D]' : 'text-[#A3928E]'
                        }`}
                      />
                      <span>{item.label}</span>
                    </div>

                    {item.badge !== undefined && item.badge > 0 && (
                      <span className="w-5 h-5 rounded-full bg-[#D07A6D] text-white text-[10px] font-bold flex items-center justify-center">
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
                onClick={() => {
                  setActiveTab('preferencias');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-3 md:py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer min-h-[44px] ${
                  activeTab === 'preferencias'
                    ? 'bg-[#3A2828] text-white shadow-xs font-semibold'
                    : 'text-[#C9BCB8] hover:text-white hover:bg-[#322323]'
                }`}
              >
                <Settings
                  className={`w-4 h-4 ${
                    activeTab === 'preferencias' ? 'text-[#D07A6D]' : 'text-[#A3928E]'
                  }`}
                />
                <span>Preferências</span>
              </button>
            </nav>
          </div>
        </div>

        {/* Sidebar Footer Link to Landing Page & Logout */}
        <div className="pt-4 border-t border-white/10 space-y-2">
          <button
            onClick={() => {
              setMobileMenuOpen(false);
              setViewMode('landing');
            }}
            className="w-full flex items-center justify-between p-3 md:p-2.5 rounded-xl bg-[#322323] hover:bg-[#3E2C2C] text-[#C9BCB8] hover:text-white text-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="font-medium">← Ver Site Institucional</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={() => {
              setMobileMenuOpen(false);
              logout();
            }}
            className="w-full flex items-center justify-between p-3 md:p-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/20 text-red-300 hover:text-red-100 text-xs transition-colors cursor-pointer min-h-[44px]"
          >
            <span className="font-medium">Sair da Conta</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header of Main Area (Desktop) */}
        <header className="px-4 sm:px-6 md:px-10 py-4 sm:py-6 border-b border-[#EFE8DE] bg-[#FBF8F3] flex items-center justify-between gap-4">
          <div>
            <p className="text-[11px] sm:text-xs text-[#7C6E68]">
              {new Date().toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818] tracking-tight">
              {getSectionTitle()}
            </h1>
          </div>

          {/* User profile and store switcher on top right */}
          <div className="relative flex items-center gap-2 sm:gap-3">
            <div
              onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
              className="flex items-center gap-2 sm:gap-2.5 p-1.5 rounded-xl hover:bg-[#EFE8DE]/60 transition-colors cursor-pointer min-h-[44px]"
            >
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#E5B5AC] text-[#2B1D1D] flex items-center justify-center font-bold text-xs select-none shrink-0">
                {storeProfile.ownerName.charAt(0)}
              </div>

              <div className="hidden sm:block text-left">
                <p className="text-xs font-bold text-[#231818] leading-tight">
                  {storeProfile.name}
                </p>
                <p className="text-[10px] text-[#7C6E68]">
                  {storeProfile.ownerName} · {currentStore.status === 'blocked' ? 'Bloqueada' : 'Ativa'}
                </p>
              </div>

              <ArrowLeftRight className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#7C6E68]" />
            </div>

            {/* Store Switcher Dropdown */}
            {storeSwitcherOpen && (
              <div className="absolute right-0 top-12 sm:top-14 z-50 w-72 bg-white rounded-2xl shadow-xl border border-[#EFE8DE] p-3 space-y-2 animate-in fade-in duration-200">
                <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-[#7C6E68] border-b border-[#EFE8DE]">
                  Trocar de Loja
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1">
                  {stores.map((s) => (
                    <button
                      key={s.id}
                      onClick={() => {
                        switchStore(s.id);
                        setStoreSwitcherOpen(false);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer min-h-[40px] ${
                        s.id === currentStore.id
                          ? 'bg-[#F8F4EE] font-bold text-[#231818]'
                          : 'hover:bg-[#FBF8F3] text-[#7C6E68]'
                      }`}
                    >
                      <div className="text-left truncate max-w-[170px]">
                        <p className="truncate text-xs font-semibold">{s.name}</p>
                        <p className="text-[10px] text-[#7C6E68] truncate">{s.ownerName}</p>
                      </div>

                      <span
                        className={`text-[9px] px-1.5 py-0.5 rounded-md font-bold ${
                          s.status === 'blocked'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        {s.status === 'blocked' ? 'Bloqueada' : 'Ativa'}
                      </span>
                    </button>
                  ))}
                </div>

                <div className="pt-2 border-t border-[#EFE8DE] space-y-1">
                  <button
                    onClick={() => {
                      setStoreSwitcherOpen(false);
                      setViewMode('register-store');
                    }}
                    className="w-full text-left px-2 py-2 rounded-lg text-xs font-semibold text-[#D07A6D] hover:bg-[#D07A6D]/10 transition-colors cursor-pointer min-h-[38px] flex items-center"
                  >
                    + Cadastrar Nova Loja
                  </button>

                  <button
                    onClick={() => {
                      setStoreSwitcherOpen(false);
                      setViewMode('super-admin');
                    }}
                    className="w-full text-left px-2 py-2 rounded-lg text-xs font-bold text-[#2B1D1D] hover:bg-[#2B1D1D]/5 transition-colors cursor-pointer flex items-center justify-between min-h-[38px]"
                  >
                    <span>👑 Painel Super Admin</span>
                    <span className="text-[10px] bg-[#2B1D1D] text-white px-1.5 py-0.2 rounded-md">
                      Gerenciar
                    </span>
                  </button>

                  <button
                    onClick={() => {
                      setStoreSwitcherOpen(false);
                      logout();
                    }}
                    className="w-full text-left px-2 py-2 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-between min-h-[38px]"
                  >
                    <span>Sair da Conta (Logout)</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Inner Content View with safe bottom padding for mobile navigation */}
        <div className="px-3.5 py-4 sm:p-6 lg:p-8 pb-24 md:pb-8 max-w-7xl w-full mx-auto flex-1">
          {renderActiveView()}
        </div>
      </main>

      {/* Fixed Bottom Navigation Bar for Mobile Phones */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EFE8DE] px-2 py-1 shadow-lg pb-safe">
        <div className="grid grid-cols-5 items-center">
          {mobileNavTabs.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`relative flex flex-col items-center justify-center py-1.5 min-h-[50px] transition-colors cursor-pointer ${
                  isActive ? 'text-[#D07A6D]' : 'text-[#7C6E68]'
                }`}
              >
                <div className="relative">
                  <Icon className={`w-5 h-5 ${isActive ? 'stroke-[2.5]' : 'stroke-2'}`} />
                  {item.badge !== undefined && item.badge > 0 && (
                    <span className="absolute -top-1 -right-2.5 w-4 h-4 rounded-full bg-[#D07A6D] text-white text-[9px] font-bold flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className={`text-[10px] mt-0.5 tracking-tight ${isActive ? 'font-bold text-[#231818]' : 'font-medium'}`}>
                  {item.label}
                </span>
              </button>
            );
          })}

          {/* 5th Tab: Menu drawer trigger */}
          <button
            onClick={() => setMobileMenuOpen(true)}
            className={`flex flex-col items-center justify-center py-1.5 min-h-[50px] transition-colors cursor-pointer ${
              activeTab === 'preferencias' || activeTab === 'relatorios' ? 'text-[#D07A6D]' : 'text-[#7C6E68]'
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
