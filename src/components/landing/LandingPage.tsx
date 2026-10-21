import React from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Logo } from '../common/Logo';
import {
  ArrowUpRight,
  ArrowRight,
  TrendingUp,
  ShoppingBag,
  BookOpen,
  Users,
  BarChart3,
  Check,
  UserCheck,
  Clock,
  Key,
  MessageCircle,
  ShieldCheck,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setViewMode } = useComfy();

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] antialiased selection:bg-[#D07A6D]/20 selection:text-[#231818]">
      {/* 1. TOP BAR: Responsive Brand | Nav Links | Actions */}
      <header className="sticky top-0 z-30 bg-[#FBF8F3]/95 backdrop-blur-md border-b border-[#EFE8DE] transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-16 sm:h-20 flex items-center justify-between gap-3 sm:gap-8">
          {/* Zone 1: Single Brand element */}
          <div className="shrink-0">
            <Logo variant="dark" size="sm" className="sm:hidden" />
            <div className="hidden sm:block">
              <Logo variant="dark" size="md" />
            </div>
          </div>

          {/* Zone 2: Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-[#7C6E68]">
            <a
              href="#recursos"
              className="hover:text-[#231818] transition-colors whitespace-nowrap shrink-0"
            >
              Recursos
            </a>
            <a
              href="#como-funciona"
              className="hover:text-[#231818] transition-colors whitespace-nowrap shrink-0"
            >
              Como funciona
            </a>
            <a
              href="#contato"
              className="hover:text-[#231818] transition-colors whitespace-nowrap shrink-0"
            >
              Contato
            </a>
          </nav>

          {/* Zone 3: Actions */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              onClick={() => setViewMode('login')}
              className="px-3 sm:px-4 py-2 text-xs sm:text-sm font-semibold text-[#231818] hover:bg-[#EFE8DE]/60 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer min-h-[40px] flex items-center"
            >
              Entrar
            </button>
            <button
              onClick={() => setViewMode('register-store')}
              className="inline-flex items-center gap-1.5 px-3.5 sm:px-5 py-2 sm:py-2.5 text-xs sm:text-sm font-semibold text-white bg-[#2B1D1D] hover:bg-[#3D2B2B] rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer min-h-[40px]"
            >
              <span>Começar</span>
              <ArrowUpRight className="w-3.5 sm:w-4 h-3.5 sm:h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION: Replicating Image 2 with High Precision */}
      <section className="relative pt-8 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Subtle decorative confectionery background blurbs */}
        <div className="absolute top-1/4 right-0 w-72 sm:w-96 h-72 sm:h-96 bg-[#D07A6D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-60 sm:w-80 h-60 sm:h-80 bg-[#E5B5AC]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-8 items-center">
            {/* Left Content Column (6 cols) */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6">
              {/* Kicker Tag */}
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D07A6D]" />
                <span className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-[#D07A6D]">
                  A Plataforma da sua Doceria
                </span>
              </div>

              {/* Giant Serif Headline */}
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-[62px] font-serif font-bold text-[#231818] leading-[1.12] tracking-tight text-balance">
                Mais tempo para{' '}
                <span className="text-[#D07A6D] italic font-normal">criar.</span>
                <br />
                Mais vendas para{' '}
                <span className="text-[#D07A6D] italic font-normal">crescer.</span>
              </h1>

              {/* Body Text */}
              <p className="text-sm sm:text-base md:text-lg text-[#7C6E68] leading-relaxed max-w-xl">
                A Comfy reúne pedidos, catálogo, clientes e financeiro em um só lugar, para você
                cuidar do que realmente importa: seus doces.
              </p>

              {/* CTA Action Row - Mobile friendly full width on small screens */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2">
                <button
                  onClick={() => setViewMode('register-store')}
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-sm font-semibold shadow-md transition-all cursor-pointer min-h-[48px]"
                >
                  <span>Teste grátis por 14 dias</span>
                  <ArrowUpRight className="w-4 h-4 text-[#D07A6D]" />
                </button>

                <a
                  href="#como-funciona"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-3 text-xs sm:text-sm font-semibold text-[#231818] hover:text-[#D07A6D] transition-colors rounded-xl bg-black/5 sm:bg-transparent min-h-[44px]"
                >
                  <span>Ver como funciona</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust signals */}
              <div className="pt-2 sm:pt-4 flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 text-xs text-[#7C6E68]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#4A7C59] shrink-0" />
                  <span>Sem necessidade de cartão</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#4A7C59] shrink-0" />
                  <span>Configuração em 3 minutos</span>
                </div>
              </div>
            </div>

            {/* Right Perspective Mockup Column (6 cols) */}
            <div className="lg:col-span-6 relative mt-4 lg:mt-0">
              {/* Floating growth badge - safely positioned inside viewport */}
              <div className="absolute left-2 sm:-left-6 bottom-3 sm:bottom-12 z-20 bg-white/95 backdrop-blur-md p-2.5 sm:p-4 rounded-2xl shadow-xl border border-[#EFE8DE] flex items-center gap-2.5 sm:gap-3">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center font-bold">
                  <TrendingUp className="w-4 h-4 sm:w-5 sm:h-5" />
                </div>
                <div>
                  <span className="text-sm sm:text-base font-serif font-bold text-[#231818] block leading-tight">
                    +32%
                  </span>
                  <span className="text-[10px] sm:text-xs text-[#7C6E68]">de crescimento médio</span>
                </div>
              </div>

              {/* Perspective Browser Window Frame - Showcase Only */}
              <div className="relative rounded-3xl bg-[#2B1D1D] p-2.5 sm:p-3 shadow-2xl transition-all duration-500">
                {/* Window Chrome */}
                <div className="px-4 py-2.5 flex items-center justify-between text-white/40 text-xs border-b border-white/10">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-red-400/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400/80 inline-block" />
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400/80 inline-block" />
                  </div>
                  <div className="px-4 py-0.5 rounded-md bg-white/10 text-white/70 text-[11px] font-mono">
                    app.comfy.com.br
                  </div>
                  <div className="w-10" />
                </div>

                {/* Dashboard Inner Screen Snapshot */}
                <div className="bg-[#FBF8F3] rounded-2xl p-4 sm:p-6 text-[#231818] overflow-hidden relative">
                  {/* Miniature Top Bar */}
                  <div className="flex items-center justify-between pb-3 border-b border-[#EFE8DE]">
                    <div className="flex items-center gap-2">
                      <div className="w-6 h-6 rounded-lg bg-[#D07A6D] text-white flex items-center justify-center text-xs font-serif font-bold">
                        c
                      </div>
                      <span className="text-xs font-bold text-[#231818]">comfy</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] text-[#7C6E68]">Olá, Marina</span>
                      <div className="w-5 h-5 rounded-full bg-[#E5B5AC] text-[9px] font-bold flex items-center justify-center text-[#2B1D1D]">
                        M
                      </div>
                    </div>
                  </div>

                  {/* Miniature KPIs */}
                  <div className="grid grid-cols-2 gap-3 mt-4">
                    <div className="bg-white p-3 rounded-xl border border-[#EFE8DE]">
                      <span className="text-[10px] text-[#7C6E68] block">Vendas este mês</span>
                      <span className="text-base font-serif font-bold text-[#231818] block mt-0.5">
                        R$ 12.480
                      </span>
                      <span className="text-[10px] text-[#4A7C59]">↑ 18,4%</span>
                    </div>

                    <div className="bg-white p-3 rounded-xl border border-[#EFE8DE]">
                      <span className="text-[10px] text-[#7C6E68] block">Pedidos</span>
                      <span className="text-base font-serif font-bold text-[#231818] block mt-0.5">
                        184
                      </span>
                      <span className="text-[10px] text-[#4A7C59]">↑ 12,2%</span>
                    </div>
                  </div>

                  {/* Miniature Chart Preview */}
                  <div className="bg-white p-3 rounded-xl border border-[#EFE8DE] mt-3">
                    <div className="flex items-center justify-between text-[11px] font-bold mb-2">
                      <span>Vendas da Semana</span>
                      <span className="text-[10px] text-[#7C6E68] font-normal">Últimos 7 dias</span>
                    </div>
                    <div className="flex items-end justify-between gap-1.5 h-16 pt-2">
                      {[35, 48, 42, 90, 65, 85, 55].map((h, i) => (
                        <div
                          key={i}
                          style={{ height: `${h}%` }}
                          className={`flex-1 rounded-t-sm ${
                            i === 3 ? 'bg-[#B85848]' : 'bg-[#E5B5AC]'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURES: Recursos da Doceria Lado a Lado & Resumidos */}
      <section id="recursos" className="py-20 bg-white border-y border-[#EFE8DE]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="max-w-2xl mb-12">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D]">
              • Recursos Feitos para Confeitaria
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#231818] mt-2 tracking-tight">
              Tudo o que sua doceria precisa, sem complicações.
            </h2>
            <p className="text-sm sm:text-base text-[#7C6E68] mt-2">
              Praticidade total para você focar no que mais ama: fazer doces incríveis.
            </p>
          </div>

          {/* 4 Cards Side by Side (1 col mobile, 2 cols tablet, 4 cols desktop) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Card 1: Encomendas */}
            <div className="bg-[#FBF8F3] rounded-3xl p-6 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center mb-5">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#231818] leading-snug">
                  Controle de Encomendas
                </h3>
                <p className="text-xs text-[#7C6E68] mt-2 leading-relaxed">
                  Fluxo de pedidos: do WhatsApp à produção e entrega com status em tempo real.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EFE8DE] flex items-center justify-between text-[11px] font-semibold text-[#D07A6D]">
                <span>Status em tempo real</span>
                <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
              </div>
            </div>

            {/* Card 2: Cardápio */}
            <div className="bg-[#FBF8F3] rounded-3xl p-6 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center mb-5">
                  <BookOpen className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#231818] leading-snug">
                  Cardápio Digital
                </h3>
                <p className="text-xs text-[#7C6E68] mt-2 leading-relaxed">
                  Cadastre doces com fotos e preços. Compartilhe link direto no WhatsApp e Instagram.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EFE8DE] flex items-center justify-between text-[11px] font-semibold text-[#D07A6D]">
                <span>Link WhatsApp</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
              </div>
            </div>

            {/* Card 3: Clientes */}
            <div className="bg-[#FBF8F3] rounded-3xl p-6 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center mb-5">
                  <Users className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#231818] leading-snug">
                  Gestão de Clientes
                </h3>
                <p className="text-xs text-[#7C6E68] mt-2 leading-relaxed">
                  Histórico de compras e aniversários para surpreender e fidelizar cada cliente.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EFE8DE] flex items-center justify-between text-[11px] font-semibold text-[#D07A6D]">
                <span>Fidelidade</span>
                <span className="w-2 h-2 rounded-full bg-amber-500" />
              </div>
            </div>

            {/* Card 4: Financeiro */}
            <div className="bg-[#FBF8F3] rounded-3xl p-6 border border-[#EFE8DE] shadow-xs hover:border-[#D07A6D]/40 transition-all flex flex-col justify-between">
              <div>
                <div className="w-11 h-11 rounded-2xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center mb-5">
                  <BarChart3 className="w-5 h-5" />
                </div>
                <h3 className="text-lg font-serif font-bold text-[#231818] leading-snug">
                  Métricas & Lucro
                </h3>
                <p className="text-xs text-[#7C6E68] mt-2 leading-relaxed">
                  Vendas do mês, pedidos e ticket médio atualizados automaticamente sem complicação.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-[#EFE8DE] flex items-center justify-between text-[11px] font-semibold text-[#4A7C59]">
                <span>Relatórios</span>
                <span className="w-2 h-2 rounded-full bg-[#4A7C59]" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: Como funciona agora (Cadastro -> Análise -> Senha WhatsApp) */}
      <section id="como-funciona" className="py-20 bg-[#FBF8F3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D]">
              • Passo a Passo Simples
            </span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-[#231818] mt-2 tracking-tight">
              Como funciona o acesso à Comfy
            </h2>
            <p className="text-xs sm:text-sm text-[#7C6E68] mt-2">
              Processo ágil e seguro para você receber seus dados e começar a usar.
            </p>
          </div>

          {/* 3 Steps Side by Side */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Step 1: Cadastro */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFE8DE] shadow-xs relative flex flex-col justify-between hover:border-[#D07A6D]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#D07A6D]">
                    01.
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <UserCheck className="w-5 h-5 text-[#D07A6D]" />
                  </div>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#231818]">
                  Você faz o cadastro da doceria
                </h3>
                <p className="text-xs sm:text-sm text-[#7C6E68] mt-2 leading-relaxed">
                  Preencha o formulário rápido com o nome da sua doceria, seu Gmail e número de WhatsApp.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EFE8DE] flex items-center gap-2 text-xs font-semibold text-[#7C6E68]">
                <Check className="w-3.5 h-3.5 text-[#4A7C59]" />
                <span>Leva menos de 2 minutos</span>
              </div>
            </div>

            {/* Step 2: Análise */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFE8DE] shadow-xs relative flex flex-col justify-between hover:border-[#D07A6D]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#D07A6D]">
                    02.
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-amber-600" />
                  </div>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#231818]">
                  Aguarde a análise da equipe
                </h3>
                <p className="text-xs sm:text-sm text-[#7C6E68] mt-2 leading-relaxed">
                  Nossa equipe analisa as informações e gera uma senha de acesso exclusiva para seu login.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EFE8DE] flex items-center gap-2 text-xs font-semibold text-[#7C6E68]">
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                <span>Aprovação rápida e segura</span>
              </div>
            </div>

            {/* Step 3: Senha no WhatsApp */}
            <div className="bg-white p-6 sm:p-7 rounded-3xl border border-[#EFE8DE] shadow-xs relative flex flex-col justify-between hover:border-[#D07A6D]/40 transition-all">
              <div>
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl sm:text-4xl font-serif font-bold text-[#D07A6D]">
                    03.
                  </span>
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
                    <MessageCircle className="w-5 h-5 text-emerald-600" />
                  </div>
                </div>
                <h3 className="text-lg font-serif font-bold text-[#231818]">
                  Receba a senha no WhatsApp
                </h3>
                <p className="text-xs sm:text-sm text-[#7C6E68] mt-2 leading-relaxed">
                  Você recebe a senha direto no seu WhatsApp, entra no painel e já pode cadastrar seus doces e vender!
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-[#EFE8DE] flex items-center gap-2 text-xs font-semibold text-[#4A7C59]">
                <Key className="w-3.5 h-3.5 text-emerald-600" />
                <span>Acesso liberado de imediato</span>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons below steps */}
          <div className="mt-10 text-center flex flex-col sm:flex-row items-center justify-center gap-3">
            <button
              onClick={() => setViewMode('register-store')}
              className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
            >
              <span>Cadastrar Minha Doceria</span>
              <ArrowRight className="w-4 h-4 text-[#D07A6D]" />
            </button>
            <button
              onClick={() => setViewMode('login')}
              className="w-full sm:w-auto min-h-[46px] inline-flex items-center justify-center px-5 py-3 rounded-xl bg-white hover:bg-[#EFE8DE]/60 border border-[#EFE8DE] text-xs font-semibold text-[#231818] transition-colors cursor-pointer"
            >
              Já tenho cadastro aprovado
            </button>
          </div>
        </div>
      </section>

      {/* 5. CALL TO ACTION / CONTATO */}
      <section id="contato" className="py-20 bg-[#261A1A] text-white">
        <div className="max-w-4xl mx-auto px-6 lg:px-12 text-center space-y-6">
          <div className="inline-flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D07A6D]" />
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D]">
              Pronta para Organizar sua Doceria?
            </span>
          </div>

          <h2 className="text-3xl sm:text-4xl md:text-5xl font-serif font-bold text-white tracking-tight leading-tight">
            Comece a usar a Comfy hoje mesmo.
          </h2>

          <p className="text-sm sm:text-base text-[#C9BCB8] max-w-xl mx-auto leading-relaxed">
            Centralize encomendas, cardápio digital para o WhatsApp e clientes em um único lugar feito
            sob medida para confeiteiras.
          </p>

          <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
            <button
              onClick={() => setViewMode('register-store')}
              className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-[#D07A6D] hover:bg-[#B85848] text-white text-sm font-bold shadow-md transition-all cursor-pointer"
            >
              <span>Cadastrar Minha Doceria Agora</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* 6. FOOTER */}
      <footer className="py-16 bg-[#F8F4EE] border-t border-[#EFE8DE]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <Logo variant="dark" size="md" />
            <p className="text-xs text-[#7C6E68] mt-2">
              A plataforma inteligente para docerias e confeitarias artesanais.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#7C6E68]">
            <a href="#recursos" className="hover:text-[#231818]">Recursos</a>
            <a href="#como-funciona" className="hover:text-[#231818]">Como funciona</a>
            <a href="#contato" className="hover:text-[#231818]">Contato</a>
            <button
              onClick={() => setViewMode('login')}
              className="text-[#D07A6D] font-semibold hover:underline cursor-pointer"
            >
              Entrar na Comfy ↗
            </button>
          </div>

          <p className="text-[11px] text-[#7C6E68]">
            © {new Date().getFullYear()} Comfy. Todos os direitos reservados.
          </p>
        </div>
      </footer>
    </div>
  );
};
