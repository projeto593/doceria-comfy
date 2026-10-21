# Plataforma Comfy — Sistema de Gestão e Landing Page para Docerias

Plataforma completa inspirada na identidade visual da Comfy: uma Landing Page institucional minimalista de alta conversão aliada a um Painel de Gestão operacional intuitivo para confeitarias e docerias artesanais, com gestão em tempo real de pedidos, catálogo de produtos e cadastro de clientes.

## Decisões Confirmadas com o Usuário

> [!IMPORTANT]
> As seguintes escolhas de escopo e arquitetura foram definidas na etapa de alinhamento:

- **Escopo Duplo Integrado**: Tanto a Landing Page pública de apresentação do produto quanto o Painel de Gestão interno operacional serão construídos e conectados de forma fluida.
- **Módulos Operacionais Interativos**: O painel contará com gestão completa de pedidos (criação via modal, visualização e transição de status), catálogo de doces (produtos com fotos, categorias, preços e edição) e cadastro de clientes com histórico de compras.
- **Foco da Marca**: A marca Comfy é preservada e direcionada especificamente para docerias, ateliês de confeitaria e confeiteiras artesanais.
- **Paleta Minimalista Autêntica**: Baseada nas referências enviadas pelo usuário — fundo creme aconchegante (`#FBF8F3`), marrom chocolate profundo (`#2B1D1D`), toques elegantes de terracota/rosa queimado (`#D07A6D`) e cartões brancos com tipografia serifada editorial.

---

## 1. Visão Geral e Conceito Central

- **O que faz**: A Comfy une a vitrine de apresentação de um software moderno para confeiteiros com um sistema web completo de gestão do dia a dia da doceria: controle de encomendas, cálculo automático de pedidos, cardápio de doces e ficha de clientes.
- **Público-Alvo**: Confeiteiras autônomas, pequenos ateliês de doces finos, docerias artesanais e padarias boutique que precisam de agilidade e organização sem complicação visual.
- **Proposta de Valor**: "Mais tempo para criar. Mais vendas para crescer." — Centraliza o fluxo de atendimento por WhatsApp/Instagram, produção na cozinha e entrega, eliminando anotações perdidas em cadernos.

---

## 2. Experiência do Usuário e Design Visual

### Fluxos Principais
1. **Landing Page Institucional**:
   - Barra de navegação com logotipo `comfy.`, links de âncoras (`Recursos`, `Como funciona`, `Planos`, `Contato`) e botões de ação (`Entrar` e `Testar Grátis ↗`).
   - Hero Section idêntica ao design de referência: título serifado com destaque para as palavras *"criar."* e *"crescer."*, subtítulo explicativo, badges flutuantes de crescimento (`+32% de crescimento`) e preview interativo do painel em perspectiva.
   - Seção de recursos em grade assimétrica (Gestão de Encomendas, Catálogo Digital, Ficha de Clientes e Métricas Financeiras).
   - Seção "Como funciona" em 3 passos simples (Cadastre seus doces, receba e organize pedidos, acompanhe seu lucro).
   - Tabela de planos e chamada para ação final.
   - Alternador dinâmico direto: permite entrar no modo "Painel Operacional" em 1 clique a qualquer momento.

2. **Painel de Gestão da Loja (Dashboard)**:
   - Sidebar lateral em marrom chocolate profundo (`#2B1D1D`), com navegação para *Visão geral*, *Catálogo*, *Pedidos* (com contador de pendências), *Clientes*, *Relatórios* e *Preferências*.
   - Cabeçalho com data dinâmica, nome da confeiteira ("Marina Alves - Plano Profissional") e troca rápida de visualização.
   - Resumo da Operação: saudação personalizada ("Bom dia, Marina ✨"), cartões de KPIs com tipografia serifada de alta legibilidade (Vendas no mês, Pedidos recebidos, Ticket médio) e indicadores de crescimento.
   - Gráfico de Vendas dos últimos 7 dias com barras em tom terracota e tooltips com valores diários.
   - Painel de Pedidos Recentes com identificadores, quantidades e tags de status ("Em produção", "Aguardando retirada", "Finalizado").
   - Modal interativo "+ Novo pedido" com seleção instantânea de clientes, produtos do catálogo e cálculo automático do total da encomenda.

### Identidade Visual e Tokens de Cor
- **Canvas Neutro (60%)**: `#FBF8F3` (fundo creme caloroso, suave e anti-fadiga visual).
- **Superfícies Estruturais (30%)**:
  - Sidebar: `#261A1A` com itens ativos em tom translúcido sutil.
  - Cartões do Painel: `#FFFFFF` com bordas ultrafinas (`#EFE8E1`).
  - Textos Principais: `#231818` (marrom café profundo para máximo contraste legível).
  - Textos de Apoio: `#7C6E68` (marrom acinzentado neutro).
- **Acentos e Ações (10%)**:
  - Terracota Comfy: `#D07A6D` e `#C26D60` para pontos de destaque, pílulas de status ativas e barras de gráficos.
  - Botões Primários: `#2B1D1D` com cantos arredondados elegantes (`rounded-xl` / `rounded-2xl`).

### Tipografia
- **Títulos e Números de Destaque**: Fonte Serifada elegante (`Fraunces` / `Playfair Display`) com pesos 600/700, evocando sofisticação de ateliê gourmet.
- **Interface e Dados**: Fonte Sans-Serif geométrica contemporânea (`Plus Jakarta Sans`) para menus, tabelas, formulários e metadados, com suporte estrito a `tabular-nums`.

---

## 3. Decisões de Produto e Arquitetura

1. **Navegação Híbrida (Landing Page + Painel Vivo)**:
   - *Abordagem*: O app disponibilizará um alternador fluido entre o modo Landing Page e o modo Painel Operacional no topo, garantindo que o usuário visualize a landing page fiel à foto e possa testar o sistema real funcionando.
   - *Motivo*: Atende integralmente a preferência confirmada pelo usuário de ter ambos no mesmo projeto de forma intuitiva.

2. **Estado e Persistência Local dos Dados da Doceria**:
   - *Abordagem*: Gerenciamento de estado em React com persistência automática no `localStorage`, pré-populado com dados realistas de doces gourmet (brigadeiros, bolos no pote, caixas de macarons, tortas artesanais) e pedidos em andamento.
   - *Motivo*: Permite ao usuário criar pedidos, mudar status de produção, adicionar novos doces e cadastrar clientes com feedback instantâneo e sem necessidade de login complexo em desenvolvimento.

3. **Design System Customizado sem Dependências Pesadas**:
   - *Abordagem*: Uso do Tailwind CSS 4 nativo com ícones da biblioteca `lucide-react` (já instalada) e transições suaves com `motion`.
   - *Motivo*: Performance de carregamento instantâneo, zero bugs de compatibilidade e fidelidade pixel-a-pixel aos layouts fornecidos.

---

## 4. Arquitetura Técnica e Estrutura de Componentes

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                             Aplicação Comfy                                  │
│             (Alternador de Modo: Landing Page vs. Painel de Gestão)         │
└──────────────────────────────────────┬──────────────────────────────────────┘
                                       │
         ┌─────────────────────────────┴─────────────────────────────┐
         ▼                                                           ▼
┌─────────────────────────────────┐         ┌─────────────────────────────────┐
│     Landing Page Comfy          │         │      Painel Operacional         │
│  - TopBar Institucional         │         │  - Sidebar Marrom Chocolate     │
│  - Hero com Tipografia Serifada │         │  - Topbar do Usuário / Loja     │
│  - Perspective App Mockup       │         │  - Módulos Selecionáveis:       │
│  - Grade Bento de Recursos      │         │    • Visão Geral (Dashboard)    │
│  - Demonstração "Como Funciona" │         │    • Catálogo de Doces          │
│  - Planos e Chamada para Ação   │         │    • Gestão de Pedidos (Kanban) │
│  - Rodapé Editorial             │         │    • Cadastro de Clientes       │
│                                 │         │    • Relatórios e Configurações │
│                                 │         │  - Modal "+ Novo Pedido"        │
└─────────────────────────────────┘         └─────────────────────────────────┘
                                       ▲
                                       │
                   ┌───────────────────┴───────────────────┐
                   │    Store Central & Estado Reativo     │
                   │  - Doces e Categorias                 │
                   │  - Pedidos, Itens e Status            │
                   │  - Base de Clientes e Contatos        │
                   │  - Cálculos de Vendas e Faturamento   │
                   └───────────────────────────────────────┘
```

### Entidades de Dados
- **Product (Doce/Produto)**: `id`, `name`, `category`, `price`, `description`, `preparationTime`, `imageUrl`, `active`.
- **Order (Pedido)**: `id`, `orderNumber`, `customerName`, `customerPhone`, `items`, `totalAmount`, `status` (`'pending' | 'in_production' | 'ready' | 'delivered'`), `deliveryDate`, `createdAt`, `notes`.
- **Customer (Cliente)**: `id`, `name`, `phone`, `email`, `totalOrders`, `totalSpent`, `lastOrderDate`, `address`.

---

## Próximos Passos após Aprovação

1. Configurar as fontes do Google Fonts (`Fraunces` e `Plus Jakarta Sans`) no `index.html`.
2. Preparar os dados iniciais enriquecidos da doceria (catálogo de doces artesanais, pedidos da Marina e histórico de clientes).
3. Construir os componentes da Landing Page com o hero em destaque e o mockup interativo.
4. Construir o Painel de Gestão completo com a sidebar escura, cartões de métricas, gráfico de vendas, listagem/kanban de pedidos e modal de novo pedido.
5. Conectar todas as ações e validar a compilação com `compile_applet`.
