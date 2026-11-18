import React, { useEffect, useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { OrderStatus } from '../../types';
import {
  buildOrderStatusWhatsAppMessage,
  buildWhatsAppUrl,
  buildWhatsAppWebUrl,
  isMobileDevice,
  openExternalLinkSafely,
} from '../../utils/orderHelpers';
import { Check, Copy, ExternalLink, MessageCircle, RotateCcw, X } from 'lucide-react';

const STATUS_META: Record<
  OrderStatus,
  { title: string; badge: string; badgeClass: string; subtitle: string }
> = {
  pending: {
    title: 'Pedido Recebido / Agendado',
    badge: 'Aguardando',
    badgeClass: 'bg-[#EFE8DE] text-[#231818]',
    subtitle: 'Confirme o recebimento e agendamento com o cliente.',
  },
  in_production: {
    title: 'Pedido em Produção!',
    badge: 'Em Produção',
    badgeClass: 'bg-[#D07A6D]/15 text-[#B85848]',
    subtitle: 'Avise o cliente que os doces já começaram a ser preparados.',
  },
  ready: {
    title: 'Pedido Pronto!',
    badge: 'Pronto p/ Retirada ou Entrega',
    badgeClass: 'bg-amber-100 text-amber-800',
    subtitle: 'Avise o cliente que o pedido já está finalizado.',
  },
  delivered: {
    title: 'Pedido Entregue!',
    badge: 'Entregue',
    badgeClass: 'bg-emerald-100 text-emerald-800',
    subtitle: 'Envie uma mensagem de agradecimento ao cliente.',
  },
};

export const StatusWhatsAppModal: React.FC = () => {
  const { statusNotification, setStatusNotification, storeProfile, showToast } = useComfy();
  const [messageText, setMessageText] = useState('');
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!statusNotification) return;
    const defaultMsg = buildOrderStatusWhatsAppMessage(
      statusNotification.order,
      statusNotification.newStatus,
      storeProfile.name,
      storeProfile.pixKey
    );
    setMessageText(defaultMsg);
    setCopied(false);
  }, [statusNotification, storeProfile.name, storeProfile.pixKey]);

  if (!statusNotification) return null;

  const { order, newStatus } = statusNotification;
  const meta = STATUS_META[newStatus];

  const handleResetMessage = () => {
    setMessageText(
      buildOrderStatusWhatsAppMessage(order, newStatus, storeProfile.name, storeProfile.pixKey)
    );
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(messageText);
    setCopied(true);
    showToast('Mensagem copiada! Agora é só colar no WhatsApp.');
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendWhatsApp = async () => {
    try {
      await navigator.clipboard.writeText(messageText);
    } catch {
      // Ignore clipboard failure
    }
    const waUrl = isMobileDevice()
      ? buildWhatsAppUrl(order.customerPhone, messageText)
      : buildWhatsAppWebUrl(order.customerPhone, messageText);
    openExternalLinkSafely(waUrl);
    setStatusNotification(null);
  };

  const handleOpenDesktopApp = () => {
    const waUrl = buildWhatsAppUrl(order.customerPhone, messageText);
    openExternalLinkSafely(waUrl);
    setStatusNotification(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/50 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl border border-[#EFE8DE] overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[#EFE8DE] bg-[#FBF8F3] flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#D07A6D]">
                • Notificação ao Cliente
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md ${meta.badgeClass}`}>
                {meta.badge}
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-serif font-bold text-[#231818] mt-0.5 truncate">
              {meta.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={() => setStatusNotification(null)}
            className="p-2 text-[#7C6E68] hover:text-[#231818] hover:bg-[#EFE8DE]/60 rounded-xl transition-colors cursor-pointer shrink-0"
            aria-label="Fechar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-5 space-y-4 overflow-y-auto">
          <div className="p-3 rounded-xl bg-[#FBF8F3] border border-[#EFE8DE] flex items-center justify-between gap-3 text-xs">
            <div className="min-w-0">
              <p className="font-bold text-[#231818] truncate">
                {order.customerName}{' '}
                <span className="font-mono font-normal text-[#7C6E68]">{order.orderNumber}</span>
              </p>
              <p className="text-[11px] text-[#7C6E68] mt-0.5 truncate">
                WhatsApp: {order.customerPhone || 'Não informado (escolher contato)'}
              </p>
            </div>
            <span className="text-[11px] text-[#7C6E68] shrink-0 font-serif font-bold">
              R$ {order.totalAmount.toFixed(2).replace('.', ',')}
            </span>
          </div>

          <div>
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <label className="text-xs font-semibold text-[#7C6E68]">
                Mensagem para o WhatsApp (você pode editar)
              </label>
              <button
                type="button"
                onClick={handleResetMessage}
                className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#D07A6D] hover:underline cursor-pointer"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Restaurar padrão</span>
              </button>
            </div>
            <textarea
              rows={5}
              value={messageText}
              onChange={(e) => setMessageText(e.target.value)}
              className="w-full p-3 text-sm sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] leading-relaxed"
            />
            <p className="text-[11px] text-[#7C6E68] mt-1">{meta.subtitle}</p>
          </div>
        </div>

        {/* Footer */}
        <div className="px-5 py-3.5 border-t border-[#EFE8DE] bg-[#FBF8F3] flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5">
          <button
            type="button"
            onClick={handleCopy}
            className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#EFE8DE]/60 border border-[#EFE8DE] text-xs font-semibold text-[#231818] transition-colors cursor-pointer"
          >
            {copied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copied ? 'Copiado!' : 'Copiar texto'}</span>
          </button>

          <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center gap-2">
            <button
              type="button"
              onClick={() => setStatusNotification(null)}
              className="px-4 py-2.5 text-xs font-medium text-[#7C6E68] hover:text-[#231818] rounded-xl cursor-pointer"
            >
              Agora não
            </button>
            <button
              type="button"
              onClick={handleOpenDesktopApp}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-white hover:bg-[#EFE8DE]/60 border border-[#EFE8DE] text-xs font-semibold text-[#231818] transition-colors cursor-pointer min-h-[42px]"
              title="Abrir no aplicativo do WhatsApp"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>App</span>
            </button>
            <button
              type="button"
              onClick={handleSendWhatsApp}
              className="inline-flex items-center justify-center gap-1.5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition-colors cursor-pointer min-h-[42px]"
            >
              <MessageCircle className="w-4 h-4 shrink-0" />
              <span>Enviar no WhatsApp</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
