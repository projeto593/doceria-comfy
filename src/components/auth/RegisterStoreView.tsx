import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Logo } from '../common/Logo';
import {
  Store,
  User,
  Phone,
  Mail,
  MapPin,
  ArrowRight,
  ArrowLeft,
  Check,
  Sparkles,
  Clock,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

export const RegisterStoreView: React.FC = () => {
  const { addStore, setViewMode } = useComfy();

  const [ownerName, setOwnerName] = useState('');
  const [storeName, setStoreName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [city, setCity] = useState('São Paulo, SP');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerName.trim() || !storeName.trim() || !email.trim()) return;

    addStore({
      name: storeName.trim(),
      ownerName: ownerName.trim(),
      phone: phone.trim() || '(11) 99999-0000',
      email: email.trim(),
      city: city.trim(),
    });

    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] text-[#231818] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 antialiased">
        {/* Top Header */}
        <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-8">
          <Logo variant="dark" size="md" onClick={() => setViewMode('landing')} />
          <button
            onClick={() => setViewMode('landing')}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C6E68] hover:text-[#231818] transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Voltar ao site</span>
          </button>
        </div>

        {/* Success / Pending Analysis Card */}
        <div className="max-w-xl w-full mx-auto bg-white rounded-3xl p-8 sm:p-10 border border-[#EFE8DE] shadow-xl text-center space-y-6 animate-in fade-in zoom-in-95 duration-300">
          <div className="w-16 h-16 rounded-3xl bg-amber-100 text-amber-700 flex items-center justify-center mx-auto text-2xl shadow-xs">
            <Clock className="w-8 h-8 text-amber-600 animate-pulse" />
          </div>

          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-800 text-[11px] font-bold mb-2">
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
              Cadastro Enviado para Análise
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#231818] tracking-tight">
              Quase lá! Recebemos seus dados.
            </h1>
            <p className="text-sm text-[#7C6E68] mt-2 leading-relaxed">
              Em breve você receberá uma mensagem no WhatsApp com sua senha de login exclusiva para
              acessar a sua doceria na Comfy.
            </p>
          </div>

          {/* Details Confirmation Card */}
          <div className="p-4 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE] text-left text-xs space-y-2">
            <div className="flex items-center justify-between py-1 border-b border-[#EFE8DE]">
              <span className="text-[#7C6E68]">Doceria:</span>
              <strong className="text-[#231818]">{storeName}</strong>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#EFE8DE]">
              <span className="text-[#7C6E68]">Responsável:</span>
              <strong className="text-[#231818]">{ownerName}</strong>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#EFE8DE]">
              <span className="text-[#7C6E68]">WhatsApp de Envio:</span>
              <strong className="text-[#231818] font-mono">{phone}</strong>
            </div>
            <div className="flex items-center justify-between py-1 border-b border-[#EFE8DE]">
              <span className="text-[#7C6E68]">Gmail Cadastrado:</span>
              <strong className="text-[#231818] font-mono">{email}</strong>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-[#7C6E68]">Status:</span>
              <span className="text-amber-800 font-bold bg-amber-100 px-2 py-0.5 rounded-md text-[10px]">
                Aguardando Aprovação do Administrador
              </span>
            </div>
          </div>

          {/* Steps explanation */}
          <div className="text-left text-xs text-[#7C6E68] space-y-2 pt-2">
            <p className="font-bold text-[#231818]">Como funciona agora?</p>
            <p>1. O administrador da Comfy revisa o cadastro da sua doceria.</p>
            <p>2. Uma senha provisória de login é gerada vinculada ao seu Gmail.</p>
            <p>3. Enviamos os dados de acesso direto no seu WhatsApp para você entrar.</p>
          </div>

          {/* Actions */}
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setViewMode('landing')}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Voltar para a Página Inicial
            </button>

            <button
              onClick={() => setViewMode('super-admin')}
              className="w-full sm:w-auto px-4 py-3 rounded-xl bg-[#F8F4EE] hover:bg-[#EFE8DE] text-[#231818] text-xs font-semibold border border-[#EFE8DE] transition-colors cursor-pointer"
              title="Acessar painel do Super Admin para aprovar e gerar a senha"
            >
              👑 Ir para Super Admin (Testar Aprovação)
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-xs text-[#7C6E68] mt-8">
          © {new Date().getFullYear()} Comfy · A plataforma da sua doceria.
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] flex flex-col justify-between py-10 px-4 sm:px-6 lg:px-8 antialiased">
      {/* Top Header */}
      <div className="max-w-xl w-full mx-auto flex items-center justify-between mb-8">
        <Logo variant="dark" size="md" onClick={() => setViewMode('landing')} />
        <button
          onClick={() => setViewMode('landing')}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#7C6E68] hover:text-[#231818] transition-colors cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao site</span>
        </button>
      </div>

      {/* Main Registration Card */}
      <div className="max-w-xl w-full mx-auto bg-white rounded-2xl sm:rounded-3xl p-5 sm:p-8 md:p-10 border border-[#EFE8DE] shadow-xl">
        <div className="mb-6 sm:mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#D07A6D]" />
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-[#D07A6D]">
              Cadastro de Nova Doceria
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#231818] tracking-tight">
            Comece a organizar sua doceria agora.
          </h1>
          <p className="text-xs sm:text-sm text-[#7C6E68] mt-1.5 leading-relaxed">
            Preencha os dados abaixo para criar o painel exclusivo da sua confeitaria.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nome da Pessoa */}
          <div>
            <label className="text-xs font-semibold text-[#7C6E68] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#D07A6D]" /> Nome da Pessoa (Confeiteira / Responsável) *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Marina Alves"
              value={ownerName}
              onChange={(e) => setOwnerName(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
            />
          </div>

          {/* Nome da Loja */}
          <div>
            <label className="text-xs font-semibold text-[#7C6E68] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Store className="w-3.5 h-3.5 text-[#D07A6D]" /> Nome da Loja / Ateliê *
            </label>
            <input
              type="text"
              required
              placeholder="Ex: Ateliê Doce Encanto"
              value={storeName}
              onChange={(e) => setStoreName(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
            />
          </div>

          {/* Telefone e Gmail */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-semibold text-[#7C6E68] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#D07A6D]" /> Telefone / WhatsApp *
              </label>
              <input
                type="text"
                required
                placeholder="(11) 98765-4321"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-[#7C6E68] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#D07A6D]" /> Gmail / E-mail *
              </label>
              <input
                type="email"
                required
                placeholder="suadoceria@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
              />
            </div>
          </div>

          {/* Cidade */}
          <div>
            <label className="text-xs font-semibold text-[#7C6E68] uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#D07A6D]" /> Cidade & Estado
            </label>
            <input
              type="text"
              placeholder="Ex: São Paulo, SP"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full px-4 py-3 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818]"
            />
          </div>

          {/* Benefits summary list */}
          <div className="pt-2 pb-1 space-y-1.5 text-xs text-[#7C6E68]">
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4A7C59]" />
              <span>Painel de pedidos e fluxo de produção prontos</span>
            </div>
            <div className="flex items-center gap-2">
              <Check className="w-4 h-4 text-[#4A7C59]" />
              <span>Link do cardápio digital gerado para o seu WhatsApp</span>
            </div>
          </div>

          {/* Action button */}
          <button
            type="submit"
            className="w-full mt-4 py-3.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer min-h-[48px]"
          >
            <span>Enviar Cadastro para Análise</span>
            <ArrowRight className="w-4 h-4 text-[#D07A6D]" />
          </button>
        </form>

        <div className="mt-6 pt-6 border-t border-[#EFE8DE] text-center">
          <p className="text-xs text-[#7C6E68]">
            Já possui uma loja cadastrada?{' '}
            <button
              onClick={() => setViewMode('login')}
              className="text-[#D07A6D] font-bold hover:underline cursor-pointer"
            >
              Entrar na sua Conta
            </button>
          </p>
        </div>
      </div>

      {/* Footer */}
      <div className="text-center text-xs text-[#7C6E68] mt-8">
        © {new Date().getFullYear()} Comfy · A plataforma da sua doceria.
      </div>
    </div>
  );
};
