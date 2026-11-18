import { Order, OrderStatus } from '../types';

export function getOrderPaidAmount(order: Pick<Order, 'totalAmount' | 'paymentStatus' | 'depositAmount'>): number {
  if (order.paymentStatus === 'pago') {
    return order.totalAmount;
  }
  if (typeof order.depositAmount === 'number' && Number.isFinite(order.depositAmount)) {
    return Math.min(order.totalAmount, Math.max(0, order.depositAmount));
  }
  if (order.paymentStatus === '50_sinal') {
    return Math.round(order.totalAmount * 0.5 * 100) / 100;
  }
  return 0;
}

export function getOrderRemainingAmount(order: Pick<Order, 'totalAmount' | 'paymentStatus' | 'depositAmount'>): number {
  return Math.max(0, Math.round((order.totalAmount - getOrderPaidAmount(order)) * 100) / 100);
}

export function formatScheduledLabel(scheduledDate?: string, scheduledTime?: string): string {
  const dateStr = (scheduledDate || '').trim();
  const timeStr = (scheduledTime || '').trim();
  if (!dateStr && !timeStr) return 'A combinar';

  let formattedDate = '';
  if (dateStr) {
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      formattedDate = `${parts[2]}/${parts[1]}/${parts[0]}`;
    } else {
      formattedDate = dateStr;
    }
  }

  if (formattedDate && timeStr) {
    return `${formattedDate} às ${timeStr}`;
  }
  return formattedDate || timeStr || 'A combinar';
}

export function getTodayIsoDate(): string {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getTomorrowIsoDate(): string {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const y = tomorrow.getFullYear();
  const m = String(tomorrow.getMonth() + 1).padStart(2, '0');
  const d = String(tomorrow.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export function getOrderMonthKey(order: Pick<Order, 'createdAt' | 'scheduledDate'>): string {
  if (order.createdAt && order.createdAt.length >= 7) {
    const parsed = new Date(order.createdAt);
    if (!Number.isNaN(parsed.getTime())) {
      const y = parsed.getFullYear();
      const m = String(parsed.getMonth() + 1).padStart(2, '0');
      return `${y}-${m}`;
    }
    if (/^\d{4}-\d{2}/.test(order.createdAt)) {
      return order.createdAt.slice(0, 7);
    }
  }
  if (order.scheduledDate && /^\d{4}-\d{2}/.test(order.scheduledDate)) {
    return order.scheduledDate.slice(0, 7);
  }
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
}

export function formatMonthLabel(monthKey: string): string {
  const [yStr, mStr] = monthKey.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (!y || !m) return monthKey;
  const date = new Date(y, m - 1, 1);
  const raw = date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' });
  return raw.charAt(0).toUpperCase() + raw.slice(1);
}

export function formatShortMonthLabel(monthKey: string): string {
  const [yStr, mStr] = monthKey.split('-');
  const y = Number(yStr);
  const m = Number(mStr);
  if (!y || !m) return monthKey;
  const date = new Date(y, m - 1, 1);
  const monthShort = date.toLocaleDateString('pt-BR', { month: 'short' }).replace('.', '');
  return `${monthShort.charAt(0).toUpperCase() + monthShort.slice(1)}/${String(y).slice(2)}`;
}

export function openExternalLinkSafely(url: string): void {
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
}

export function isMobileDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Windows WhatsApp Desktop's `whatsapp://` protocol handler corrupts
 * Emoji_Presentation codepoints into U+FFFD () and collapses newlines.
 * This converts rich emojis into proven BMP text symbols for Desktop deep-links
 * while preserving readable spacing.
 */
export function sanitizeForWhatsAppDesktopLink(message: string): string {
  const mapped = message
    .replace(/✨/g, '✦')
    .replace(/✅/g, '✓')
    .replace(/✔/g, '✓')
    .replace(/🧁|🎂|🛍️|🛍/g, '✿')
    .replace(/📅|⏰/g, '▸')
    .replace(/💰|💳/g, '▸')
    .replace(/📍/g, '▸')
    .replace(/📝|✏️|✏/g, '✎')
    .replace(/☕/g, '✿')
    .replace(/⭐/g, '★')
    .replace(/❤️|❤/g, '♡')
    .replace(/🔐|🚀|📲/g, '▸');

  // Remove any remaining supplementary-plane or variation-selector characters
  return mapped
    .replace(/[\u{1F000}-\u{1FAFF}]/gu, '✦')
    .replace(/\uFE0F/g, '');
}

export function normalizeWhatsAppPhone(phone: string | undefined): string {
  const digits = (phone || '').replace(/\D/g, '').replace(/^0+/, '');
  if (!digits) return '';
  if (digits.startsWith('55') && digits.length >= 12) return digits;
  return `55${digits}`;
}

export function buildWhatsAppUrl(phone: string | undefined, message: string): string {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  const mobile = isMobileDevice();
  const payload = mobile ? message : sanitizeForWhatsAppDesktopLink(message);
  const encoded = encodeURIComponent(payload);
  if (mobile) {
    return normalizedPhone
      ? `https://wa.me/${normalizedPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
  }
  return normalizedPhone
    ? `https://api.whatsapp.com/send?phone=${normalizedPhone}&text=${encoded}`
    : `https://api.whatsapp.com/send?text=${encoded}`;
}

export function buildWhatsAppWebUrl(phone: string | undefined, message: string): string {
  const normalizedPhone = normalizeWhatsAppPhone(phone);
  const encoded = encodeURIComponent(message);
  return normalizedPhone
    ? `https://web.whatsapp.com/send?phone=${normalizedPhone}&text=${encoded}`
    : `https://web.whatsapp.com/send?text=${encoded}`;
}

export function buildOrderStatusWhatsAppMessage(
  order: Order,
  status: OrderStatus,
  storeName: string,
  pixKey?: string
): string {
  const firstName = (order.customerName || 'Cliente').trim().split(' ')[0];
  const shop = (storeName || 'nossa doceria').trim();
  const cleanPix = (pixKey || '').trim();
  const itemsSummary =
    order.items.length > 0
      ? order.items.map((it) => `${it.quantity}x ${it.productName}`).join(', ')
      : 'seus doces';

  const scheduleText =
    order.scheduledDate || order.scheduledTime
      ? formatScheduledLabel(order.scheduledDate, order.scheduledTime)
      : order.deliveryDate && order.deliveryDate !== 'A combinar' && order.deliveryDate !== 'Hoje'
      ? order.deliveryDate
      : '';

  const scheduleLine = scheduleText ? `\n📅 *Agendamento:* ${scheduleText}` : '';
  const remaining = getOrderRemainingAmount(order);
  const paymentLine =
    remaining > 0.01
      ? `\n💰 *Restante a pagar:* R$ ${remaining.toFixed(2).replace('.', ',')}`
      : '';
  const pixLine =
    cleanPix && (remaining > 0.01 || status === 'pending')
      ? `\n💳 *Chave PIX:* ${cleanPix}`
      : '';

  switch (status) {
    case 'pending':
      return `✨ *Olá, ${firstName}!*\n\nRecebemos o seu pedido *${order.orderNumber}* na *${shop}*!\n\n🧁 *Itens:* ${itemsSummary}${scheduleLine}${paymentLine}${pixLine}\n\nAssim que iniciarmos o preparo, te avisamos por aqui. ❤️`;
    case 'in_production':
      return `☕ *Olá, ${firstName}!*\n\nPassando para avisar que o seu pedido *${order.orderNumber}* na *${shop}* já *está em produção*!\n\n🧁 *Itens:* ${itemsSummary}${scheduleLine}${remaining > 0.01 ? paymentLine + pixLine : ''}\n\nEstamos preparando tudo com muito carinho. Qualquer dúvida, estamos à disposição! ✨`;
    case 'ready':
      if (order.deliveryType === 'entrega') {
        return `✅ *Boas notícias, ${firstName}!*\n\nO seu pedido *${order.orderNumber}* na *${shop}* *está pronto* e em breve sairá para entrega!\n\n🧁 *Itens:* ${itemsSummary}${scheduleLine}${paymentLine}${pixLine}\n\nFique de olho no celular! ❤️`;
      }
      return `✅ *Boas notícias, ${firstName}!*\n\nO seu pedido *${order.orderNumber}* na *${shop}* *já está pronto para retirada*!\n\n🧁 *Itens:* ${itemsSummary}${scheduleLine}${paymentLine}${pixLine}\n\nTe esperamos por aqui! ❤️`;
    case 'delivered':
      return `⭐ *Olá, ${firstName}!*\n\nO seu pedido *${order.orderNumber}* da *${shop}* foi marcado como *entregue*.\n\nMuito obrigada pela confiança! Esperamos que você ame cada doce. ❤️✨`;
  }
}
