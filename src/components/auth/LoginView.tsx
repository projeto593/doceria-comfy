import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Logo } from '../common/Logo';
import {
  Mail,
  Key,
  ArrowRight,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  MessageCircle,
  Clock,
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const {
    loginWithCredentials,
    loginAsSuperAdmin,
    recoverPassword,
    setViewMode,
  } = useComfy();

  // Mode: 'login' | 'recovery'
  const [isRecoveryMode, setIsRecoveryMode] = useState(false);

  // Unified login state
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);

  // Recovery state
  const [recoveryQuery, setRecoveryQuery] = useState('');
  const [recoveryResult, setRecoveryResult] = useState<{
    success: boolean;
    message: string;
    tempPass?: string;
    storeName?: string;
    phone?: string;
  } | null>(null);

  // Feedback states
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isNotRegistered, setIsNotRegistered] = useState(false);
  const [isPendingApproval, setIsPendingApproval] = useState(false);

  const handleUnifiedLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsNotRegistered(false);
    setIsPendingApproval(false);

    const cleanIdentifier = identifier.trim();
    const cleanPassword = password.trim();

    if (!cleanIdentifier || !cleanPassword) {
      setErrorMessage('Por favor, preencha o e-mail/usuário e a senha.');
      return;
    }

    // 1. Verify if credentials belong to Super Admin
    if (
      cleanIdentifier.toLowerCase() === 'projetointegradors303@gmail.com' ||
      cleanIdentifier.toLowerCase() === 'admin@comfy.app' ||
      cleanIdentifier.toLowerCase() === 'admin'
    ) {
      const adminRes = loginAsSuperAdmin(cleanIdentifier, cleanPassword);
      if (!adminRes.success) {
        setErrorMessage(adminRes.message);
      }
      return;
    }

    // 2. Otherwise authenticate against Store records
    const storeRes = loginWithCredentials(cleanIdentifier, cleanPassword);
    if (!storeRes.success) {
      setErrorMessage(storeRes.message);
      if (storeRes.notRegistered) {
        setIsNotRegistered(true);
      }
      if (storeRes.pendingApproval) {
        setIsPendingApproval(true);
      }
    }
  };

  const handleRecoverySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setRecoveryResult(null);

    if (!recoveryQuery.trim()) {
      setErrorMessage('Digite seu e-mail ou telefone cadastrado.');
      return;
    }

    const res = recoverPassword(recoveryQuery);
    if (res.success && res.store) {
      setRecoveryResult({
        success: true,
        message: res.message,
        tempPass: res.tempPass,
        storeName: res.store.name,
        phone: res.store.phone,
      });
    } else {
      setRecoveryResult({
        success: false,
        message: res.message,
      });
    }
  };

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] flex flex-col justify-between py-8 px-4 sm:px-6 lg:px-8 antialiased">
      {/* Top Header */}
      <div className="max-w-md w-full mx-auto flex items-center justify-between mb-6">
        <Logo variant="dark" size="md" onClick={() => setViewMode('landing')} />
        <button
          onClick={() => setViewMode('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C6E68] hover:text-[#231818] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao site</span>
        </button>
      </div>

      {/* Main Card Container */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl p-6 sm:p-8 border border-[#EFE8DE] shadow-xl">
        {!isRecoveryMode ? (
          /* UNIFIED LOGIN VIEW */
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D] block mb-1">
                • Acesso à Plataforma
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#231818] tracking-tight">
                Entrar na Comfy
              </h1>
              <p className="text-xs text-[#7C6E68] mt-1 leading-relaxed">
                Digite seu e-mail e senha cadastrados para acessar o seu painel.
              </p>
            </div>

            {/* Error / Alert Display */}
            {errorMessage && (
              <div
                className={`mb-5 p-4 rounded-2xl border text-xs flex flex-col gap-2 animate-in fade-in duration-200 ${
                  isPendingApproval
                    ? 'bg-amber-50 border-amber-200 text-amber-900'
                    : isNotRegistered
                    ? 'bg-orange-50 border-orange-200 text-orange-950'
                    : 'bg-red-50 border-red-200 text-red-900'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {isPendingApproval ? (
                    <Clock className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  )}
                  <p className="leading-relaxed font-medium">{errorMessage}</p>
                </div>

                {/* If Not Registered: Show direct registration CTA */}
                {isNotRegistered && (
                  <button
                    type="button"
                    onClick={() => setViewMode('register-store')}
                    className="mt-1 w-full py-2 px-3 rounded-xl bg-[#2B1D1D] text-white text-xs font-bold transition-colors hover:bg-[#3D2B2B] flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Cadastrar Minha Doceria Agora</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#D07A6D]" />
                  </button>
                )}

                {/* If Pending Approval: Show WhatsApp contact helper */}
                {isPendingApproval && (
                  <a
                    href={`https://wa.me/5511987654321?text=${encodeURIComponent(
                      `Olá! Enviei o cadastro da minha doceria com o e-mail ${identifier} e gostaria de solicitar a aprovação e minha senha de acesso.`
                    )}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 w-full py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold transition-colors hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Falar com Suporte no WhatsApp</span>
                  </a>
                )}
              </div>
            )}

            <form onSubmit={handleUnifiedLogin} className="space-y-4">
              {/* Identifier Field */}
              <div>
                <label className="text-[11px] font-bold text-[#7C6E68] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D07A6D]" /> E-mail ou Usuário *
                </label>
                <input
                  type="text"
                  required
                  placeholder="seuemail@exemplo.com"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
                />
              </div>

              {/* Password Field with Eye Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-[11px] font-bold text-[#7C6E68] uppercase tracking-wider flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5 text-[#D07A6D]" /> Senha de Acesso *
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setIsRecoveryMode(true);
                      setErrorMessage(null);
                    }}
                    className="text-[11px] text-[#D07A6D] font-semibold hover:underline cursor-pointer"
                  >
                    Esqueceu a senha?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-4 pr-10 py-2.5 text-xs sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#7C6E68] hover:text-[#231818] p-1"
                    title={showPassword ? 'Ocultar senha' : 'Ver senha'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Remember Me */}
              <div className="flex items-center justify-between text-xs text-[#7C6E68] pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded-sm border-[#EFE8DE] text-[#D07A6D] focus:ring-[#D07A6D]"
                  />
                  <span>Lembrar meu acesso</span>
                </label>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Entrar na Plataforma</span>
                <ArrowRight className="w-4 h-4 text-[#D07A6D]" />
              </button>
            </form>

            {/* Register link footer */}
            <div className="mt-6 pt-5 border-t border-[#EFE8DE] text-center">
              <p className="text-xs text-[#7C6E68]">
                Ainda não cadastrou sua loja?{' '}
                <button
                  onClick={() => setViewMode('register-store')}
                  className="text-[#D07A6D] font-bold hover:underline cursor-pointer"
                >
                  Cadastrar Nova Doceria
                </button>
              </p>
            </div>
          </div>
        ) : (
          /* PASSWORD RECOVERY VIEW */
          <div>
            <div className="mb-6">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D] block mb-1">
                • Suporte ao Acesso
              </span>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#231818] tracking-tight">
                Recuperar Senha
              </h1>
              <p className="text-xs text-[#7C6E68] mt-1 leading-relaxed">
                Digite o e-mail ou o WhatsApp cadastrado da sua doceria para localizar seus dados de
                acesso.
              </p>
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-red-50 border border-red-200 text-xs text-red-900 flex items-start gap-2 animate-in fade-in duration-200">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <p className="leading-relaxed">{errorMessage}</p>
              </div>
            )}

            {/* Success Result */}
            {recoveryResult && (
              <div
                className={`mb-5 p-4 rounded-2xl border text-xs space-y-3 animate-in fade-in duration-200 ${
                  recoveryResult.success
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    : 'bg-orange-50 border-orange-200 text-orange-950'
                }`}
              >
                <div className="flex items-start gap-2.5">
                  {recoveryResult.success ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-orange-600 shrink-0 mt-0.5" />
                  )}
                  <p className="font-medium leading-relaxed">{recoveryResult.message}</p>
                </div>

                {recoveryResult.success && recoveryResult.tempPass && (
                  <div className="p-3 bg-white rounded-xl border border-emerald-200 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7C6E68]">Doceria:</span>
                      <strong className="text-[#231818]">{recoveryResult.storeName}</strong>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#7C6E68]">Sua Senha de Acesso:</span>
                      <strong className="text-[#231818] font-mono bg-emerald-100 px-2 py-0.5 rounded-md font-bold">
                        {recoveryResult.tempPass}
                      </strong>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        if (recoveryResult.tempPass) {
                          setPassword(recoveryResult.tempPass);
                          setIdentifier(recoveryQuery);
                          setIsRecoveryMode(false);
                        }
                      }}
                      className="w-full mt-2 py-1.5 px-3 rounded-lg bg-[#2B1D1D] text-white text-xs font-bold transition-colors hover:bg-[#3D2B2B]"
                    >
                      Preencher no Login e Entrar
                    </button>
                  </div>
                )}

                {/* Direct WhatsApp Support Button */}
                <a
                  href={`https://wa.me/5511987654321?text=${encodeURIComponent(
                    `Olá! Preciso de ajuda para recuperar o acesso da minha doceria Comfy (contato: ${recoveryQuery}).`
                  )}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full py-2 px-3 rounded-xl bg-emerald-600 text-white text-xs font-bold transition-colors hover:bg-emerald-700 flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Falar com Suporte no WhatsApp</span>
                </a>
              </div>
            )}

            <form onSubmit={handleRecoverySubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-bold text-[#7C6E68] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                  <Mail className="w-3.5 h-3.5 text-[#D07A6D]" /> E-mail ou WhatsApp *
                </label>
                <input
                  type="text"
                  required
                  placeholder="suadoceria@gmail.com ou (11) 98765-4321"
                  value={recoveryQuery}
                  onChange={(e) => setRecoveryQuery(e.target.value)}
                  className="w-full px-4 py-2.5 text-xs sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
                />
              </div>

              <button
                type="submit"
                className="w-full mt-2 py-3 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Localizar Cadastro & Recuperar Senha</span>
                <ArrowRight className="w-4 h-4 text-[#D07A6D]" />
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-[#EFE8DE] flex items-center justify-between text-xs">
              <button
                type="button"
                onClick={() => {
                  setIsRecoveryMode(false);
                  setErrorMessage(null);
                  setRecoveryResult(null);
                }}
                className="text-[#7C6E68] hover:text-[#231818] font-semibold flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Voltar ao login</span>
              </button>

              <button
                type="button"
                onClick={() => setViewMode('register-store')}
                className="text-[#D07A6D] font-bold hover:underline cursor-pointer"
              >
                Cadastrar Nova Doceria
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#7C6E68] mt-6">
        © {new Date().getFullYear()} Comfy · A plataforma da sua doceria.
      </div>
    </div>
  );
};
