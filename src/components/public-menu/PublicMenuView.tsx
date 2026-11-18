import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Logo } from '../common/Logo';
import {
  buildWhatsAppUrl,
  buildWhatsAppWebUrl,
  formatScheduledLabel,
  isMobileDevice,
  openExternalLinkSafely,
} from '../../utils/orderHelpers';
import {
  PHONE_DIGITS_LENGTH,
  extractPhoneDigits,
  formatPhone11,
} from '../../utils/validation';
import {
  ShoppingBag,
  Plus,
  Minus,
  MapPin,
  MessageCircle,
  ArrowLeft,
  CheckCircle2,
  Share2,
  Sparkles,
  X,
  Send,
  Info,
  Copy,
  Check,
  ExternalLink,
  Lock,
} from 'lucide-react';

export const PublicMenuView: React.FC = () => {
  const {
    products,
    storeProfile,
    currentStore,
    currentStoreId,
    hasActiveStore,
    currentUserRole,
    addOrder,
    setViewMode,
    showToast,
  } = useComfy();

  const [cart, setCart] = useState<{ [productId: string]: number }>({});
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [orderCompleted, setOrderCompleted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [lastWhatsAppUrl, setLastWhatsAppUrl] = useState('');
  const [lastWhatsAppWebUrl, setLastWhatsAppWebUrl] = useState('');
  const [lastFormattedMessage, setLastFormattedMessage] = useState('');
  const [copiedMessage, setCopiedMessage] = useState(false);

  // Checkout form
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  const [deliveryType, setDeliveryType] = useState<'retirada' | 'entrega'>('retirada');
  const [address, setAddress] = useState('');
  const [notes, setNotes] = useState('');

  const hasPublicStoreQuery =
    typeof window !== 'undefined' && Boolean(new URLSearchParams(window.location.search).get('loja'));
  const isInternalPreview =
    !hasPublicStoreQuery &&
    Boolean(currentStore.id) &&
    (currentUserRole === 'superadmin' ||
      (currentUserRole === 'store' && currentStoreId === currentStore.id));
  const activeProducts = products.filter((p) => p.active);

  const handleUpdateQuantity = (productId: string, delta: number) => {
    setCart((prev) => {
      const current = prev[productId] || 0;
      const next = current + delta;
      if (next <= 0) {
        const copy = { ...prev };
        delete copy[productId];
        return copy;
      }
      return { ...prev, [productId]: next };
    });
  };

  const totalItemsCount = Object.values(cart).reduce((a, b) => a + b, 0);
  const totalAmount = Object.entries(cart).reduce((sum, [prodId, qty]) => {
    const prod = products.find((p) => p.id === prodId);
    return sum + (prod ? prod.price * qty : 0);
  }, 0);

  const depositPercent = storeProfile.defaultDepositPercent ?? 50;
  const depositAmountRequired =
    depositPercent > 0
      ? Math.round(totalAmount * (depositPercent / 100) * 100) / 100
      : 0;
  const remainingOnDelivery = Math.max(0, totalAmount - depositAmountRequired);
  const cleanPixKey = (storeProfile.pixKey || '').trim();

  const rawStorePhone = storeProfile.whatsapp.replace(/\D/g, '');
  const headerWhatsAppHref = buildWhatsAppUrl(
    storeProfile.whatsapp,
    `✨ Olá, *${storeProfile.name}*! Gostaria de fazer uma encomenda.`
  );

  const customerPhoneDigits = extractPhoneDigits(customerPhone);
  const isScheduledDateBlocked = Boolean(
    scheduledDate && (storeProfile.blockedDates || []).includes(scheduledDate)
  );

  const handleFinishOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim() || totalItemsCount === 0 || isSubmitting) return;
    if (customerPhoneDigits.length !== PHONE_DIGITS_LENGTH) {
      showToast('Informe um WhatsApp válido com 11 números (DDD + 9 dígitos).');
      return;
    }
    if (isScheduledDateBlocked) {
      showToast('Esta data está bloqueada na agenda da doceria. Escolha outra data disponível.');
      return;
    }

    const items = Object.entries(cart).map(([productId, quantity]) => ({
      productId,
      quantity,
    }));

    // Rich formatted WhatsApp message (full emojis + line breaks for Mobile, WhatsApp Web & Clipboard)
    const itemLines = items
      .map((it) => {
        const prod = products.find((p) => p.id === it.productId);
        const linePrice = ((prod?.price || 0) * it.quantity).toFixed(2).replace('.', ',');
        return `• ${it.quantity}x ${prod?.name || 'Doce'} — R$ ${linePrice}`;
      })
      .join('\n');

    const scheduleLabel =
      scheduledDate || scheduledTime
        ? formatScheduledLabel(scheduledDate, scheduledTime)
        : 'A combinar';

    const depositSection =
      depositPercent > 0 && depositAmountRequired > 0
        ? `\n• *Sinal para confirmação (${depositPercent}%):* R$ ${depositAmountRequired
            .toFixed(2)
            .replace('.', ',')}${
            remainingOnDelivery > 0.01
              ? `\n• *Restante na ${deliveryType === 'retirada' ? 'retirada' : 'entrega'}:* R$ ${remainingOnDelivery
                  .toFixed(2)
                  .replace('.', ',')}`
              : ''
          }`
        : '';

    const deliveryLabel =
      deliveryType === 'retirada'
        ? 'Retirada no Ateliê'
        : `Entrega Delivery${address.trim() ? ` (${address.trim()})` : ''}`;

    const pixLine = cleanPixKey ? `\n• *Chave PIX da doceria:* ${cleanPixKey}` : '';

    const richMessage = [
      `✨ *NOVO PEDIDO — ${storeProfile.name}* ✨`,
      '',
      `Olá, *${storeProfile.ownerName}*! Vi o cardápio e quero fazer uma encomenda:`,
      '',
      `🧁 *ITENS DO PEDIDO*`,
      itemLines,
      '',
      `────────────────────`,
      `💰 *RESUMO DE VALORES*`,
      `• *Total:* R$ ${totalAmount.toFixed(2).replace('.', ',')}${depositSection}${pixLine}`,
      '',
      `────────────────────`,
      `📅 *DADOS & AGENDAMENTO*`,
      `• *Cliente:* ${customerName.trim()}`,
      `• *WhatsApp:* ${formatPhone11(customerPhoneDigits)}`,
      `• *Modalidade:* ${deliveryLabel}`,
      ...(scheduledDate || scheduledTime ? [`• *Agendamento:* ${scheduleLabel}`] : []),
      ...(notes.trim() ? [`📝 *Observações:* ${notes.trim()}`] : []),
      '',
      depositPercent > 0 && depositAmountRequired > 0
        ? cleanPixKey
          ? `Vou enviar o comprovante do sinal via PIX para confirmação do pedido! ❤️`
          : `Aguardo a confirmação e os dados do PIX para o envio do sinal! ❤️`
        : `Aguardo a confirmação do pedido! ❤️`,
    ].join('\n');

    const waUrl = buildWhatsAppUrl(storeProfile.whatsapp, richMessage);
    const waWebUrl = buildWhatsAppWebUrl(storeProfile.whatsapp, richMessage);

    setLastFormattedMessage(richMessage);
    setLastWhatsAppUrl(waUrl);
    setLastWhatsAppWebUrl(waWebUrl);
    setCopiedMessage(false);
    setIsSubmitting(true);

    try {
      const ok = await addOrder({
        customerName: customerName.trim(),
        customerPhone: formatPhone11(customerPhoneDigits),
        items,
        deliveryDate: scheduleLabel,
        scheduledDate: scheduledDate || undefined,
        scheduledTime: scheduledTime || undefined,
        deliveryType,
        paymentStatus: 'pendente',
        notes: notes.trim()
          ? `${notes.trim()}${address ? ` (Endereço: ${address})` : ''}`
          : address
          ? `Endereço: ${address}`
          : undefined,
      });

      if (!ok) return;

      // Copy complete formatted message with emojis & line breaks so desktop users can paste if desired
      try {
        await navigator.clipboard.writeText(richMessage);
        setCopiedMessage(true);
      } catch {
        // Ignore clipboard errors if blocked by iframe/browser policy
      }

      openExternalLinkSafely(isMobileDevice() ? waUrl : waWebUrl);

      setOrderCompleted(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shareUrl = `${window.location.origin}/?loja=${encodeURIComponent(currentStore.id)}`;

  if (!hasActiveStore) {
    return (
      <div className="min-h-screen bg-[#FBF8F3] text-[#231818] flex flex-col items-center justify-center p-6 text-center antialiased">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-[#EFE8DE] shadow-xs space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-[#F8F4EE] text-[#D07A6D] flex items-center justify-center mx-auto">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <h1 className="text-xl font-serif font-bold text-[#231818]">
            Cardápio não encontrado
          </h1>
          <p className="text-xs text-[#7C6E68] leading-relaxed">
            Esta doceria ainda não está ativa ou não possui cadastro no banco de dados.
          </p>
          <button
            type="button"
            onClick={() => setViewMode('landing')}
            className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar ao Início</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FBF8F3] text-[#231818] pb-28 antialiased">
      {/* Top Banner shown ONLY during internal dashboard preview, NEVER on ?loja= public links */}
      {isInternalPreview && (
        <div className="bg-[#2B1D1D] text-white px-4 py-2.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 sm:gap-4">
          <div className="flex items-start sm:items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#D07A6D] shrink-0 mt-1 sm:mt-0" />
            <span>
              <strong>Prévia do Cardápio Público:</strong> Este é o link que seus clientes abrem pelo
              Status do WhatsApp em qualquer aparelho.
            </span>
          </div>
          <button
            type="button"
            onClick={() => setViewMode('dashboard')}
            className="underline font-semibold hover:text-[#D07A6D] text-xs cursor-pointer shrink-0 self-start sm:self-auto"
          >
            Voltar ao Painel da Doceria →
          </button>
        </div>
      )}

      {/* Header of the Confectionery */}
      <header className="bg-white border-b border-[#EFE8DE] px-4 sm:px-6 py-6 sm:py-8">
        <div className="max-w-3xl mx-auto flex flex-col sm:flex-row items-center sm:items-start justify-between gap-5 sm:gap-6 text-center sm:text-left">
          <div className="flex flex-col sm:flex-row items-center gap-4 min-w-0">
            {storeProfile.logoUrl ? (
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl overflow-hidden bg-white border border-[#EFE8DE] shadow-md shrink-0">
                <img
                  src={storeProfile.logoUrl}
                  alt={`Logo ${storeProfile.name}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-16 h-16 rounded-3xl bg-[#D07A6D] text-white flex items-center justify-center font-serif text-3xl font-bold shadow-md shrink-0">
                {(storeProfile.name || 'c').charAt(0).toLowerCase()}
              </div>
            )}
            <div className="min-w-0">
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-lg bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-semibold mb-1">
                Aceitando encomendas hoje
              </div>
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#231818] break-words">
                {storeProfile.name}
              </h1>
              <p className="text-xs text-[#7C6E68] mt-0.5">
                Por {storeProfile.ownerName} · {storeProfile.segment}
              </p>
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-x-4 gap-y-1.5 text-xs text-[#7C6E68] mt-2">
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-[#D07A6D] shrink-0" /> {storeProfile.city}
                </span>
              </div>
            </div>
          </div>

          {rawStorePhone && (
            <a
              href={headerWhatsAppHref}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-semibold border border-emerald-200 transition-colors min-h-[42px] whitespace-nowrap shrink-0"
            >
              <MessageCircle className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Falar no WhatsApp</span>
            </a>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-3xl mx-auto px-4 sm:px-6 pt-6">
        {/* Status Callout Banner */}
        <div className="bg-[#FAF4EB] border border-[#E8DCCB] rounded-2xl p-4 mb-6 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="text-2xl">✨</span>
            <div>
              <h3 className="text-xs font-bold text-[#231818]">
                Cardápio de Encomendas & Pronta Entrega
              </h3>
              <p className="text-[11px] text-[#7C6E68]">
                Escolha seus doces favoritos, personalize seu pedido e confirme direto pelo WhatsApp.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => {
              navigator.clipboard.writeText(shareUrl);
              showToast('Link do cardápio copiado!');
            }}
            className="p-2 rounded-xl bg-white hover:bg-[#EFE8DE] text-[#231818] border border-[#E8DCCB] text-xs font-medium flex items-center gap-1.5 shrink-0 cursor-pointer"
            title="Copiar link do cardápio"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Compartilhar</span>
          </button>
        </div>

        {/* Product Cards List */}
        <div className="space-y-4">
          {activeProducts.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-[#EFE8DE] space-y-2">
              <Sparkles className="w-7 h-7 text-[#D07A6D] mx-auto" />
              <h3 className="text-base font-serif font-bold text-[#231818]">
                Cardápio em preparação
              </h3>
              <p className="text-xs text-[#7C6E68]">
                Esta doceria ainda não cadastrou produtos ativos no cardápio digital.
              </p>
            </div>
          ) : (
            activeProducts.map((prod) => {
            const qty = cart[prod.id] || 0;
            return (
              <div
                key={prod.id}
                className={`bg-white rounded-2xl p-4 sm:p-5 border transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 ${
                  qty > 0
                    ? 'border-[#D07A6D] shadow-sm'
                    : 'border-[#EFE8DE] hover:border-[#D07A6D]/40'
                }`}
              >
                <div className="flex items-start gap-4">
                  {prod.imageUrl ? (
                    <img
                      src={prod.imageUrl}
                      alt={prod.name}
                      className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl object-cover border border-[#EFE8DE] shrink-0 shadow-2xs"
                    />
                  ) : (
                    <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F8F4EE] flex items-center justify-center text-3xl shrink-0 shadow-2xs border border-[#EFE8DE]/60">
                      {prod.emoji || '🧁'}
                    </div>
                  )}

                  <div>
                    {prod.tag && (
                      <div className="mb-1">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-[#D07A6D]/10 text-[#D07A6D]">
                          {prod.tag}
                        </span>
                      </div>
                    )}
                    <h3 className="text-base font-serif font-bold text-[#231818]">
                      {prod.name}
                    </h3>
                    <p className="text-xs text-[#7C6E68] mt-1 leading-relaxed max-w-md">
                      {prod.description}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#7C6E68] mt-2">
                      <span>{prod.unit}</span>
                    </div>
                  </div>
                </div>

                {/* Price and Cart Controls */}
                <div className="w-full sm:w-auto flex sm:flex-col items-center sm:items-end justify-between pt-3 sm:pt-0 border-t sm:border-0 border-[#EFE8DE] gap-2">
                  <div className="text-left sm:text-right">
                    <span className="text-xs text-[#7C6E68] block">Valor</span>
                    <span className="text-lg font-serif font-bold text-[#231818] tabular-nums">
                      R$ {prod.price.toFixed(2).replace('.', ',')}
                    </span>
                  </div>

                  {qty > 0 ? (
                    <div className="flex items-center gap-2 bg-[#FBF8F3] border border-[#EFE8DE] px-2.5 py-1.5 rounded-xl">
                      <button
                        onClick={() => handleUpdateQuantity(prod.id, -1)}
                        className="p-1 hover:bg-[#EFE8DE] rounded-lg text-[#231818] transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="text-xs font-bold text-[#231818] w-5 text-center tabular-nums">
                        {qty}
                      </span>
                      <button
                        onClick={() => handleUpdateQuantity(prod.id, 1)}
                        className="p-1 hover:bg-[#EFE8DE] rounded-lg text-[#231818] transition-colors"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpdateQuantity(prod.id, 1)}
                      className="px-4 py-2 text-xs font-semibold text-white bg-[#2B1D1D] hover:bg-[#3D2B2B] rounded-xl transition-all shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Pedir</span>
                    </button>
                  )}
                </div>
              </div>
            );
          })
          )}
        </div>
      </main>

      {/* Floating Bottom Cart Bar */}
      {totalItemsCount > 0 && (
        <div className="fixed bottom-6 left-0 right-0 z-40 px-4">
          <div className="max-w-2xl mx-auto bg-[#2B1D1D] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-white/10 flex items-center justify-between gap-4 animate-in slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D07A6D] text-white flex items-center justify-center font-bold relative">
                <ShoppingBag className="w-5 h-5" />
                <span className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-white text-[#2B1D1D] text-[10px] font-bold flex items-center justify-center">
                  {totalItemsCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-white/80">Sua Sacola de Doces</p>
                <p className="text-base font-serif font-bold text-white tabular-nums">
                  R$ {totalAmount.toFixed(2).replace('.', ',')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCheckoutOpen(true)}
              className="px-4 sm:px-5 py-2.5 rounded-xl bg-[#D07A6D] hover:bg-[#B85848] text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center gap-1.5 cursor-pointer min-h-[44px] shrink-0"
            >
              <span>Avançar</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Checkout Drawer / Modal */}
      {isCheckoutOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl border border-[#EFE8DE] overflow-hidden max-h-[92vh] sm:max-h-[90vh] flex flex-col">
            <div className="px-5 sm:px-6 py-4 border-b border-[#EFE8DE] flex items-center justify-between bg-[#FBF8F3]">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D]">
                  • Finalizar Pedido
                </span>
                <h3 className="text-lg font-serif font-bold text-[#231818]">Sua Encomenda</h3>
              </div>
              <button
                onClick={() => setIsCheckoutOpen(false)}
                className="p-1.5 text-[#7C6E68] hover:text-[#231818] rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {orderCompleted ? (
              <div className="p-5 sm:p-7 text-center space-y-4 overflow-y-auto">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h3 className="text-xl font-serif font-bold text-[#231818]">
                  Pedido Registrado com Sucesso! ✨
                </h3>
                <p className="text-xs text-[#7C6E68] leading-relaxed max-w-md mx-auto">
                  Sua encomenda já foi sincronizada no painel da doceria{' '}
                  <strong>{storeProfile.name}</strong>.{' '}
                  {depositPercent > 0 && depositAmountRequired > 0 && (
                    <>
                      Envie a mensagem no WhatsApp e realize o pagamento do sinal de{' '}
                      <strong className="text-[#231818]">
                        R$ {depositAmountRequired.toFixed(2).replace('.', ',')}
                      </strong>{' '}
                      ({depositPercent}%) para confirmar a produção.
                    </>
                  )}
                </p>

                {cleanPixKey && (
                  <div className="bg-amber-50 border border-amber-200 rounded-2xl p-3 flex items-center justify-between gap-2 text-left">
                    <div className="min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800 block">
                        Chave PIX para Pagamento
                      </span>
                      <p className="text-xs font-mono font-bold text-[#231818] truncate mt-0.5">
                        {cleanPixKey}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        navigator.clipboard.writeText(cleanPixKey);
                        showToast('Chave PIX copiada!');
                      }}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white hover:bg-amber-100 border border-amber-200 text-[11px] font-bold text-amber-950 shrink-0 cursor-pointer"
                    >
                      <Copy className="w-3 h-3" />
                      <span>Copiar PIX</span>
                    </button>
                  </div>
                )}

                {lastFormattedMessage && (
                  <div className="text-left bg-[#FBF8F3] border border-[#EFE8DE] rounded-2xl p-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#7C6E68]">
                        Prévia da Mensagem Formatada
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          navigator.clipboard.writeText(lastFormattedMessage);
                          setCopiedMessage(true);
                          showToast('Mensagem completa copiada! Cole no WhatsApp com Ctrl+V.');
                          setTimeout(() => setCopiedMessage(false), 2500);
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D07A6D] hover:underline cursor-pointer"
                      >
                        {copiedMessage ? (
                          <Check className="w-3 h-3 text-emerald-600" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                        <span>{copiedMessage ? 'Copiada!' : 'Copiar com emojis'}</span>
                      </button>
                    </div>
                    <pre className="text-[11px] text-[#231818] whitespace-pre-wrap font-sans leading-relaxed max-h-40 overflow-y-auto bg-white p-2.5 rounded-xl border border-[#EFE8DE]">
                      {lastFormattedMessage}
                    </pre>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-2">
                  {isMobileDevice() ? (
                    <>
                      {lastWhatsAppUrl && (
                        <a
                          href={lastWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[44px]"
                        >
                          <MessageCircle className="w-4 h-4 shrink-0" />
                          <span>
                            {rawStorePhone
                              ? `Enviar no WhatsApp da ${storeProfile.name}`
                              : 'Abrir WhatsApp'}
                          </span>
                        </a>
                      )}
                      {lastWhatsAppWebUrl && (
                        <a
                          href={lastWhatsAppWebUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#EFE8DE] text-[#231818] border border-[#EFE8DE] text-xs font-semibold transition-colors min-h-[42px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>WhatsApp Web</span>
                        </a>
                      )}
                    </>
                  ) : (
                    <>
                      {lastWhatsAppWebUrl && (
                        <a
                          href={lastWhatsAppWebUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-colors min-h-[42px]"
                        >
                          <MessageCircle className="w-4 h-4 shrink-0" />
                          <span>WhatsApp Web (com emojis)</span>
                        </a>
                      )}
                      {lastWhatsAppUrl && (
                        <a
                          href={lastWhatsAppUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#FBF8F3] hover:bg-[#EFE8DE] text-[#231818] border border-[#EFE8DE] text-xs font-semibold transition-colors min-h-[42px]"
                        >
                          <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                          <span>App WhatsApp</span>
                        </a>
                      )}
                    </>
                  )}
                </div>

                {!rawStorePhone && (
                  <p className="text-[11px] text-amber-800 bg-amber-50 border border-amber-200 rounded-xl px-3 py-2">
                    O WhatsApp desta doceria ainda não foi sincronizado. Copie a mensagem acima ou
                    peça para a doceria salvar as <strong>Preferências</strong> no painel.
                  </p>
                )}
                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setCart({});
                      setOrderCompleted(false);
                      setIsCheckoutOpen(false);
                    }}
                    className="px-5 py-2 text-xs font-semibold text-[#7C6E68] hover:text-[#231818] cursor-pointer"
                  >
                    Fechar
                  </button>
                  {isInternalPreview && (
                    <button
                      type="button"
                      onClick={() => setViewMode('dashboard')}
                      className="px-5 py-2 text-xs font-semibold text-white bg-[#2B1D1D] rounded-xl hover:bg-[#3D2B2B] cursor-pointer"
                    >
                      Ver no Painel da Loja
                    </button>
                  )}
                </div>
              </div>
            ) : (
              <form onSubmit={handleFinishOrder} className="p-6 space-y-4 overflow-y-auto">
                {/* Summary of items */}
                <div className="bg-[#FBF8F3] p-3 rounded-2xl border border-[#EFE8DE] space-y-2">
                  <p className="text-xs font-bold text-[#7C6E68] uppercase tracking-wider">
                    Itens selecionados ({totalItemsCount})
                  </p>
                  {Object.entries(cart).map(([prodId, qty]) => {
                    const prod = products.find((p) => p.id === prodId);
                    return (
                      <div key={prodId} className="flex items-center justify-between text-xs">
                        <span className="text-[#231818]">
                          <strong className="text-[#D07A6D]">{qty}x</strong> {prod?.name}
                        </span>
                        <span className="font-serif font-bold text-[#231818]">
                          R$ {((prod?.price || 0) * qty).toFixed(2).replace('.', ',')}
                        </span>
                      </div>
                    );
                  })}
                  <div className="pt-2 border-t border-[#EFE8DE] flex items-center justify-between text-xs">
                    <span className="font-bold text-[#231818]">Total:</span>
                    <span className="font-serif font-bold text-base text-[#231818]">
                      R$ {totalAmount.toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                </div>

                {/* Form fields */}
                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                    Seu Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Beatriz Lima"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[44px]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between mb-1">
                    <label className="text-xs font-semibold text-[#7C6E68]">
                      Seu WhatsApp *
                    </label>
                    <span
                      className={`text-[10px] font-mono ${
                        customerPhoneDigits.length === PHONE_DIGITS_LENGTH
                          ? 'text-emerald-700 font-semibold'
                          : 'text-[#7C6E68]/80'
                      }`}
                    >
                      {customerPhoneDigits.length}/{PHONE_DIGITS_LENGTH} números
                    </span>
                  </div>
                  <input
                    type="tel"
                    inputMode="numeric"
                    required
                    maxLength={15}
                    placeholder="(11) 98765-4321"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(formatPhone11(e.target.value))}
                    className="w-full px-3.5 py-2.5 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] font-mono min-h-[44px]"
                  />
                </div>

                {/* Delivery toggle */}
                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                    Como deseja receber?
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setDeliveryType('retirada')}
                      className={`py-2.5 text-xs font-medium rounded-xl border transition-all min-h-[42px] cursor-pointer ${
                        deliveryType === 'retirada'
                          ? 'bg-[#2B1D1D] text-white border-[#2B1D1D]'
                          : 'bg-white text-[#7C6E68] border-[#EFE8DE]'
                      }`}
                    >
                      Retirar no Ateliê
                    </button>
                    <button
                      type="button"
                      onClick={() => setDeliveryType('entrega')}
                      className={`py-2.5 text-xs font-medium rounded-xl border transition-all min-h-[42px] cursor-pointer ${
                        deliveryType === 'entrega'
                          ? 'bg-[#2B1D1D] text-white border-[#2B1D1D]'
                          : 'bg-white text-[#7C6E68] border-[#EFE8DE]'
                      }`}
                    >
                      Entrega Delivery
                    </button>
                  </div>
                </div>

                {deliveryType === 'entrega' && (
                  <div>
                    <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                      Endereço de Entrega
                    </label>
                    <input
                      type="text"
                      placeholder="Rua, número e bairro"
                      value={address}
                      onChange={(e) => setAddress(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[44px]"
                    />
                  </div>
                )}

                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                    Preferência de Data e Hora (Opcional)
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    <input
                      type="date"
                      value={scheduledDate}
                      onChange={(e) => setScheduledDate(e.target.value)}
                      className={`w-full px-3 py-2 text-base sm:text-xs bg-[#FBF8F3] border rounded-xl focus:outline-hidden min-h-[42px] ${
                        isScheduledDateBlocked
                          ? 'border-rose-400 focus:border-rose-500 text-rose-900'
                          : 'border-[#EFE8DE] focus:border-[#D07A6D]'
                      }`}
                    />
                    <input
                      type="time"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full px-3 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] min-h-[42px]"
                    />
                  </div>
                  {isScheduledDateBlocked && (
                    <div className="mt-2 p-2.5 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-2 text-[11px] text-rose-900">
                      <Lock className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                      <span>
                        <strong>Data indisponível:</strong> esta data foi bloqueada na agenda da doceria.
                        Por favor, escolha outro dia para sua encomenda.
                      </span>
                    </div>
                  )}
                </div>

                <div>
                  <label className="text-xs font-semibold text-[#7C6E68] block mb-1">
                    Frase para o Bolo ou Observações
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Ex: Escrever 'Parabéns Rafa' em pasta americana; embalar para presente..."
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    className="w-full px-3.5 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D]"
                  />
                </div>

                {((depositPercent > 0 && depositAmountRequired > 0) || cleanPixKey) && (
                  <div className="p-3.5 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                    <Info className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
                    <div className="text-xs text-amber-950 leading-relaxed flex-1 min-w-0">
                      {depositPercent > 0 && depositAmountRequired > 0 ? (
                        <>
                          <p className="font-bold">
                            Sinal para confirmação ({depositPercent}%):{' '}
                            <span className="font-serif text-sm text-[#B85848] tabular-nums">
                              R$ {depositAmountRequired.toFixed(2).replace('.', ',')}
                            </span>
                          </p>
                          <p className="text-[11px] text-amber-900/90 mt-0.5">
                            Para confirmar sua encomenda, é necessário o pagamento do sinal de{' '}
                            <strong className="tabular-nums">
                              R$ {depositAmountRequired.toFixed(2).replace('.', ',')}
                            </strong>{' '}
                            via PIX.
                            {remainingOnDelivery > 0.01 && (
                              <>
                                {' '}
                                O restante de{' '}
                                <strong className="tabular-nums">
                                  R$ {remainingOnDelivery.toFixed(2).replace('.', ',')}
                                </strong>{' '}
                                será pago na {deliveryType === 'retirada' ? 'retirada' : 'entrega'}.
                              </>
                            )}
                          </p>
                        </>
                      ) : (
                        <p className="font-bold">Pagamento via PIX disponível</p>
                      )}

                      {cleanPixKey && (
                        <div className="mt-2 pt-2 border-t border-amber-200/80 flex items-center justify-between gap-2">
                          <span className="text-[11px] text-amber-950 truncate">
                            <strong>Chave PIX:</strong>{' '}
                            <span className="font-mono font-semibold">{cleanPixKey}</span>
                          </span>
                          <button
                            type="button"
                            onClick={() => {
                              navigator.clipboard.writeText(cleanPixKey);
                              showToast('Chave PIX copiada!');
                            }}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white hover:bg-amber-100 border border-amber-200 text-[10px] font-bold text-amber-950 shrink-0 cursor-pointer"
                          >
                            <Copy className="w-3 h-3" />
                            <span>Copiar</span>
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-[#EFE8DE] flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-2.5 sm:gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCheckoutOpen(false)}
                    className="px-4 py-2.5 text-xs font-medium text-[#7C6E68] hover:text-[#231818] min-h-[42px] cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || isScheduledDateBlocked}
                    className="px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5 min-h-[46px] cursor-pointer"
                  >
                    <MessageCircle className="w-4 h-4 shrink-0" />
                    <span>Confirmar no WhatsApp (R$ {totalAmount.toFixed(2).replace('.', ',')})</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
