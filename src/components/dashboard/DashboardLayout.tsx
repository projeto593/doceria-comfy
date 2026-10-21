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

  const renderActiveView = () => {
    if (currentStore.status === 'blocked') {
      return (
        <div className="bg-white rounded-3xl p-8 sm:p-12 border border-red-200 shadow-sm max-w-2xl mx-auto text-center space-y-4 my-8">
          <div className="w-16 h-16 rounded-3xl bg-red-100 text-red-600 flex items-center justify-center mx-auto text-2xl">
            🔒
          </div>
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">
            Acesso Suspenso
          </span>
          <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#231818]">
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
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => setViewMode('super-admin')}
              className="px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold"
            >
              Abrir Super Admin p/ Desbloquear
            </button>
            <button
              onClick={() => setViewMode('landing')}
              className="px-5 py-2.5 rounded-xl bg-[#F8F4EE] hover:bg-[#EFE8DE] text-[#231818] text-xs font-semibold"
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
      <div className="md:hidden flex items-center justify-between p-4 bg-[#261A1A] text-white">
        <Logo variant="light" size="sm" onClick={() => setViewMode('landing')} />
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-white/80 hover:text-white"
        >
          {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Sidebar (Desktop + Mobile Drawer) */}
      <aside
        className={`fixed md:sticky top-0 z-40 h-screen w-64 bg-[#261A1A] text-white flex flex-col justify-between p-6 transition-transform duration-300 ${
          mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-8">
          {/* Brand Logo in Sidebar */}
          <div className="pt-1">
            <Logo variant="light" size="md" onClick={() => setViewMode('landing')} />
          </div>

          {/* Navigation Section 1: SUA LOJA */}
          <div>
            <span className="text-[10px] font-semibold tracking-wider text-[#A3928E] uppercase block mb-3 px-3">
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
                    className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
            <span className="text-[10px] font-semibold tracking-wider text-[#A3928E] uppercase block mb-3 px-3">
              Configurações
            </span>
            <nav className="space-y-1">
              <button
                onClick={() => {
                  setActiveTab('preferencias');
                  setMobileMenuOpen(false);
                }}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
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
        <div className="pt-4 border-t border-white/10 space-y-1.5">
          <button
            onClick={() => setViewMode('landing')}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-[#322323] hover:bg-[#3E2C2C] text-[#C9BCB8] hover:text-white text-xs transition-colors cursor-pointer"
          >
            <span className="font-medium">← Ver Site Institucional</span>
            <ExternalLink className="w-3.5 h-3.5 opacity-60" />
          </button>

          <button
            onClick={logout}
            className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-950/30 hover:bg-red-950/60 border border-red-500/20 text-red-300 hover:text-red-100 text-xs transition-colors cursor-pointer"
          >
            <span className="font-medium">Sair da Conta</span>
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0">
        {/* Top Header of Main Area */}
        <header className="px-6 md:px-10 py-6 border-b border-[#EFE8DE] bg-[#FBF8F3] flex items-center justify-between gap-4">
          <div>
            <p className="text-xs text-[#7C6E68] capitalize">
              terça-feira, 22 de setembro
            </p>
            <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#231818] tracking-tight">
              {getSectionTitle()}
            </h1>
          </div>

          {/* User profile and store switcher on top right */}
          <div className="relative flex items-center gap-3">
            <div
              onClick={() => setStoreSwitcherOpen(!storeSwitcherOpen)}
              className="flex items-center gap-2.5 p-1.5 rounded-xl hover:bg-[#EFE8DE]/60 transition-colors cursor-pointer"
            >
              <div className="w-9 h-9 rounded-full bg-[#E5B5AC] text-[#2B1D1D] flex items-center justify-center font-bold text-xs select-none">
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

              <ArrowLeftRight className="w-4 h-4 text-[#7C6E68]" />
            </div>

            {/* Store Switcher Dropdown */}
            {storeSwitcherOpen && (
              <div className="absolute right-0 top-12 z-50 w-72 bg-white rounded-2xl shadow-xl border border-[#EFE8DE] p-3 space-y-2 animate-in fade-in duration-200">
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
                      className={`w-full flex items-center justify-between p-2 rounded-xl text-xs transition-colors cursor-pointer ${
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
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-[#D07A6D] hover:bg-[#D07A6D]/10 transition-colors cursor-pointer"
                  >
                    + Cadastrar Nova Loja
                  </button>

                  <button
                    onClick={() => {
                      setStoreSwitcherOpen(false);
                      setViewMode('super-admin');
                    }}
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-bold text-[#2B1D1D] hover:bg-[#2B1D1D]/5 transition-colors cursor-pointer flex items-center justify-between"
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
                    className="w-full text-left px-2 py-1.5 rounded-lg text-xs font-semibold text-red-600 hover:bg-red-50 transition-colors cursor-pointer flex items-center justify-between"
                  >
                    <span>Sair da Conta (Logout)</span>
                    <LogOut className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        </header>

        {/* Inner Content View */}
        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto flex-1">
          {renderActiveView()}
        </div>
      </main>
    </div>
  );
};
