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
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { setViewMode } = useComfy();

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] antialiased selection:bg-[#D07A6D]/20 selection:text-[#231818]">
      {/* 1. TOP BAR CONTRACT: Brand | 4-5 Links | 1-2 Actions */}
      <header className="sticky top-0 z-30 bg-[#FBF8F3]/90 backdrop-blur-md border-b border-[#EFE8DE] transition-all">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between gap-8">
          {/* Zone 1: Single Brand element */}
          <div className="shrink-0">
            <Logo variant="dark" size="md" />
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
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setViewMode('login')}
              className="px-4 py-2 text-sm font-medium text-[#231818] hover:bg-[#EFE8DE]/60 rounded-xl transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Entrar
            </button>
            <button
              onClick={() => setViewMode('register-store')}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 text-sm font-semibold text-white bg-[#2B1D1D] hover:bg-[#3D2B2B] rounded-xl shadow-xs transition-all whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Começar agora</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION: Replicating Image 2 with High Precision */}
      <section className="relative pt-12 pb-20 lg:pt-20 lg:pb-32 overflow-hidden">
        {/* Subtle decorative confectionery background blurbs */}
        <div className="absolute top-1/4 right-0 w-96 h-96 bg-[#D07A6D]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-10 w-80 h-80 bg-[#E5B5AC]/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            {/* Left Content Column (6 cols) */}
            <div className="lg:col-span-6 space-y-6">
              {/* Kicker Tag */}
              <div className="inline-flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#D07A6D]" />
                <span className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D]">
                  A Plataforma da sua Doceria
                </span>
              </div>

              {/* Giant Serif Headline */}
              <h1 className="text-4xl sm:text-5xl lg:text-[62px] font-serif font-bold text-[#231818] leading-[1.08] tracking-tight text-balance">
                Mais tempo para{' '}
                <span className="text-[#D07A6D] italic font-normal">criar.</span>
                <br />
                Mais vendas para{' '}
                <span className="text-[#D07A6D] italic font-normal">crescer.</span>
              </h1>

              {/* Body Text */}
              <p className="text-base sm:text-lg text-[#7C6E68] leading-relaxed max-w-xl">
                A Comfy reúne pedidos, catálogo, clientes e financeiro em um só lugar, para você
                cuidar do que realmente importa: seus doces.
              </p>

              {/* CTA Action Row */}
              <div className="flex flex-wrap items-center gap-4 pt-3">
                <button
                  onClick={() => setViewMode('register-store')}
                  className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-sm font-semibold shadow-md transition-all hover:-translate-y-0.5 cursor-pointer"
                >
                  <span>Teste grátis por 14 dias</span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>

                <a
                  href="#como-funciona"
                  className="inline-flex items-center gap-2 px-4 py-3 text-sm font-semibold text-[#231818] hover:text-[#D07A6D] transition-colors"
                >
                  <span>Ver como funciona</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
              </div>

              {/* Trust signals */}
              <div className="pt-4 flex items-center gap-6 text-xs text-[#7C6E68]">
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Sem necessidade de cartão</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-[#4A7C59]" />
                  <span>Configuração em 3 minutos</span>
                </div>
              </div>
            </div>

            {/* Right Perspective Mockup Column (6 cols) */}
            <div className="lg:col-span-6 relative">
              {/* Floating growth badge */}
              <div className="absolute -left-4 sm:-left-8 bottom-8 sm:bottom-12 z-20 bg-white/95 backdrop-blur-md p-3.5 sm:p-4 rounded-2xl shadow-xl border border-[#EFE8DE] flex items-center gap-3 animate-bounce-slow">
                <div className="w-10 h-10 rounded-xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center font-bold">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-base font-serif font-bold text-[#231818] block leading-tight">
                    +32%
                  </span>
                  <span className="text-xs text-[#7C6E68]">de crescimento médio</span>
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

      {/* 3. BENTO GRID FEATURES: Recursos da Doceria */}
      <section id="recursos" className="py-24 bg-white border-y border-[#EFE8DE]">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="max-w-2xl mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D]">
              • Recursos Feitos para Confeitaria
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#231818] mt-2 tracking-tight">
              Tudo o que sua doceria precisa, sem complicações.
            </h2>
            <p className="text-sm sm:text-base text-[#7C6E68] mt-3 leading-relaxed">
              Diga adeus a papéis espalhados e mensagens perdidas. Com a Comfy, sua cozinha opera no
              ritmo certo e suas encomendas saem no horário exato.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Bento Card 1: Encomendas e Pedidos (Span 2) */}
            <div className="md:col-span-2 bg-[#FBF8F3] rounded-3xl p-8 border border-[#EFE8DE] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center mb-6">
                  <ShoppingBag className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#231818]">
                  Controle de Encomendas & Produção
                </h3>
                <p className="text-sm text-[#7C6E68] mt-2 max-w-lg leading-relaxed">
                  Fluxo organizado de pedidos: da confirmação pelo WhatsApp à bancada de produção e
                  embalagem. Notifique o cliente e saiba exatamente o que assar a cada dia.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#EFE8DE] flex items-center justify-between text-xs font-semibold text-[#2B1D1D]">
                <span className="text-[#7C6E68]">Status em tempo real</span>
                <span className="text-[#D07A6D] font-mono font-bold">Produção & Entregas</span>
              </div>
            </div>

            {/* Bento Card 2: Catálogo de Doces */}
            <div className="bg-[#FBF8F3] rounded-3xl p-8 border border-[#EFE8DE] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center mb-6">
                  <BookOpen className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#231818]">
                  Cardápio Digital & Ficha Técnica
                </h3>
                <p className="text-xs sm:text-sm text-[#7C6E68] mt-2 leading-relaxed">
                  Cadastre brigadeiros, tortas, bentô cakes e trufas com tempo de preparo e preços
                  definidos para nunca errar a margem de lucro.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#EFE8DE] text-xs font-semibold text-[#7C6E68]">
                <span>Pronto para link no WhatsApp e Instagram</span>
              </div>
            </div>

            {/* Bento Card 3: Gestão de Clientes */}
            <div className="bg-[#FBF8F3] rounded-3xl p-8 border border-[#EFE8DE] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center mb-6">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#231818]">
                  Histórico de Clientes & Fidelidade
                </h3>
                <p className="text-xs sm:text-sm text-[#7C6E68] mt-2 leading-relaxed">
                  Saiba quais doces cada cliente mais pede, datas de aniversário e endereço de
                  entrega para enviar mimos e mensagens personalizadas.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#EFE8DE] text-xs font-semibold text-[#7C6E68]">
                <span>Histórico completo de compras</span>
              </div>
            </div>

            {/* Bento Card 4: Faturamento e Finanças (Span 2) */}
            <div className="md:col-span-2 bg-[#FBF8F3] rounded-3xl p-8 border border-[#EFE8DE] shadow-xs flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-2xl bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center mb-6">
                  <BarChart3 className="w-6 h-6" />
                </div>
                <h3 className="text-2xl font-serif font-bold text-[#231818]">
                  Financeiro Claro, Sem Mistérios
                </h3>
                <p className="text-sm text-[#7C6E68] mt-2 max-w-lg leading-relaxed">
                  Acompanhe suas vendas no mês, ticket médio e desempenho diário. Saiba se as vendas
                  estão subindo e tome decisões com base em números reais da confeitaria.
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-[#EFE8DE] flex items-center justify-between text-xs font-semibold text-[#2B1D1D]">
                <span className="text-[#7C6E68]">Métricas automáticas</span>
                <span className="text-[#4A7C59] font-mono font-bold">Relatórios consolidados</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 4. HOW IT WORKS: 3 Steps */}
      <section id="como-funciona" className="py-24">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center max-w-xl mx-auto mb-16">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D]">
              • Passo a Passo
            </span>
            <h2 className="text-3xl sm:text-4xl font-serif font-bold text-[#231818] mt-2 tracking-tight">
              Como funciona a Comfy na sua rotina
            </h2>
            <p className="text-sm text-[#7C6E68] mt-3">
              Em menos de 10 minutos sua doceria passa a operar com profissionalismo de ponta.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-3xl border border-[#EFE8DE] shadow-xs relative">
              <span className="text-4xl font-serif font-bold text-[#D07A6D]/30 block mb-4">
                01.
              </span>
              <h3 className="text-lg font-serif font-bold text-[#231818]">
                Cadastre seus doces e preços
              </h3>
              <p className="text-xs sm:text-sm text-[#7C6E68] mt-2 leading-relaxed">
                Adicione suas receitas, opções de caixas, tamanhos de bolos e tempo médio de forno.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#EFE8DE] shadow-xs relative">
              <span className="text-4xl font-serif font-bold text-[#D07A6D]/30 block mb-4">
                02.
              </span>
              <h3 className="text-lg font-serif font-bold text-[#231818]">
                Lance encomendas em segundos
              </h3>
              <p className="text-xs sm:text-sm text-[#7C6E68] mt-2 leading-relaxed">
                Quando uma mensagem chegar no WhatsApp, gere o pedido com 2 toques e envie o link de
                confirmação.
              </p>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-[#EFE8DE] shadow-xs relative">
              <span className="text-4xl font-serif font-bold text-[#D07A6D]/30 block mb-4">
                03.
              </span>
              <h3 className="text-lg font-serif font-bold text-[#231818]">
                Produza sem atrasos e lucre mais
              </h3>
              <p className="text-xs sm:text-sm text-[#7C6E68] mt-2 leading-relaxed">
                Acompanhe o painel de produção diário, despache no horário e veja seu faturamento crescer.
              </p>
            </div>
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
