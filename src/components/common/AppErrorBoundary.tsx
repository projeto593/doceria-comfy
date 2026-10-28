import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface AppErrorBoundaryState {
  hasError: boolean;
  errorMessage: string;
}

export class AppErrorBoundary extends React.Component<
  { children: React.ReactNode },
  AppErrorBoundaryState
> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    errorMessage: '',
  };

  public static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    let message = 'Ocorreu um erro inesperado ao sincronizar os dados.';
    if (error?.message) {
      if (error.message.includes('Quota exceeded')) {
        message =
          'O limite diário gratuito de leituras do banco foi atingido e será renovado amanhã.';
      } else {
        try {
          const parsed = JSON.parse(error.message) as { error?: string };
          if (parsed?.error) {
            message = parsed.error;
          }
        } catch {
          message = error.message;
        }
      }
    }
    return { hasError: true, errorMessage: message };
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-[#FBF8F3] text-[#231818] flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xl text-center space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-red-100 text-red-700 flex items-center justify-center mx-auto">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h2 className="text-xl font-serif font-bold text-[#231818]">
              Não foi possível concluir a ação
            </h2>
            <p className="text-xs text-[#7C6E68] leading-relaxed break-words">
              {this.state.errorMessage}
            </p>
            <button
              type="button"
              onClick={() => {
                this.setState({ hasError: false, errorMessage: '' });
                window.location.reload();
              }}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold cursor-pointer min-h-[42px]"
            >
              <RefreshCw className="w-3.5 h-3.5 text-[#D07A6D]" />
              <span>Recarregar Aplicação</span>
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
