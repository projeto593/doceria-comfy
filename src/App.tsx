/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import { ComfyProvider, useComfy } from './context/ComfyContext';
import { LandingPage } from './components/landing/LandingPage';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { PublicMenuView } from './components/public-menu/PublicMenuView';
import { RegisterStoreView } from './components/auth/RegisterStoreView';
import { SuperAdminView } from './components/admin/SuperAdminView';
import { LoginView } from './components/auth/LoginView';
import { NewOrderModal } from './components/common/NewOrderModal';
import { CheckCircle2 } from 'lucide-react';

const AppContent: React.FC = () => {
  const { viewMode, toastMessage } = useComfy();

  const renderCurrentView = () => {
    switch (viewMode) {
      case 'landing':
        return <LandingPage />;
      case 'login':
        return <LoginView />;
      case 'dashboard':
        return <DashboardLayout />;
      case 'public-menu':
        return <PublicMenuView />;
      case 'register-store':
        return <RegisterStoreView />;
      case 'super-admin':
        return <SuperAdminView />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="relative min-h-screen">
      {/* Active Screen */}
      {renderCurrentView()}

      {/* New Order Modal */}
      <NewOrderModal />

      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-6 right-6 z-50 bg-[#2B1D1D] text-white px-4 py-3 rounded-2xl shadow-2xl border border-white/10 flex items-center gap-2.5 text-xs font-semibold animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle2 className="w-4 h-4 text-[#D07A6D]" />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
};

export default function App() {
  return (
    <ComfyProvider>
      <AppContent />
    </ComfyProvider>
  );
}
