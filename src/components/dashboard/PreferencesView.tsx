import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { CityStateSelect } from '../common/CityStateSelect';
import {
  MAX_OWNER_NAME,
  MAX_STORE_NAME,
  PHONE_DIGITS_LENGTH,
  extractPhoneDigits,
  formatPhone11,
  sanitizeOwnerName,
  sanitizeStoreName,
} from '../../utils/validation';
import { Save, RotateCcw, Store, CreditCard, ShieldCheck } from 'lucide-react';

export const PreferencesView: React.FC = () => {
  const { storeProfile, updateStoreProfile, resetAllData, showToast } = useComfy();

  const [name, setName] = useState(storeProfile.name);
  const [ownerName, setOwnerName] = useState(storeProfile.ownerName);
  const [segment, setSegment] = useState(storeProfile.segment);
  const [city, setCity] = useState(storeProfile.city);
  const [whatsapp, setWhatsapp] = useState(formatPhone11(storeProfile.whatsapp));
  const [pixKey, setPixKey] = useState(storeProfile.pixKey);

  const whatsappDigits = extractPhoneDigits(whatsapp);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (whatsappDigits.length > 0 && whatsappDigits.length !== PHONE_DIGITS_LENGTH) {
      showToast('O WhatsApp deve conter 11 números (DDD + 9 dígitos).');
      return;
    }

    updateStoreProfile({
      name: name.trim().slice(0, MAX_STORE_NAME),
      ownerName: ownerName.trim().slice(0, MAX_OWNER_NAME),
      segment: segment.trim().slice(0, 60),
      city,
      whatsapp: formatPhone11(whatsappDigits),
      pixKey: pixKey.trim().slice(0, 80),
    });
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
          Preferências da Loja
        </h1>
        <p className="text-xs text-[#7C6E68] mt-1">
          Personalize as informações da sua doceria, dados de contato e chave PIX para pagamentos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EFE8DE] shadow-xs space-y-6">
        {/* Identificação */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D] flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" /> Identificação do Ateliê
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#7C6E68]">Nome da Loja / Ateliê</label>
                <span className="text-[10px] font-mono text-[#7C6E68]/80">
                  {name.length}/{MAX_STORE_NAME}
                </span>
              </div>
              <input
                type="text"
                maxLength={MAX_STORE_NAME}
                value={name}
                onChange={(e) => setName(sanitizeStoreName(e.target.value))}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#7C6E68]">Nome da Confeiteira / Responsável</label>
                <span className="text-[10px] font-mono text-[#7C6E68]/80">
                  {ownerName.length}/{MAX_OWNER_NAME}
                </span>
              </div>
              <input
                type="text"
                maxLength={MAX_OWNER_NAME}
                value={ownerName}
                onChange={(e) => setOwnerName(sanitizeOwnerName(e.target.value))}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
            <div>
              <label className="text-xs font-medium text-[#7C6E68] block mb-1.5">Segmento</label>
              <input
                type="text"
                maxLength={60}
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[46px] text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>

            <CityStateSelect value={city} onChange={setCity} showIcon={false} />
          </div>
        </div>

        {/* Contato & Pagamentos */}
        <div className="space-y-4 pt-4 border-t border-[#EFE8DE]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D] flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Contato & Pagamentos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-medium text-[#7C6E68]">WhatsApp de Pedidos</label>
                <span className="text-[10px] font-mono text-[#7C6E68]/80">
                  {whatsappDigits.length}/{PHONE_DIGITS_LENGTH} números
                </span>
              </div>
              <input
                type="tel"
                inputMode="numeric"
                maxLength={15}
                placeholder="(11) 98765-4321"
                value={whatsapp}
                onChange={(e) => setWhatsapp(formatPhone11(e.target.value))}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818] font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#7C6E68] block mb-1">Chave PIX da Doceria</label>
              <input
                type="text"
                maxLength={80}
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full px-3.5 py-2.5 min-h-[44px] text-base sm:text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>
          </div>
        </div>

        {/* Plano Atual */}
        <div className="pt-4 border-t border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-[#FBF8F3]">
          <div className="flex items-start sm:items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D07A6D] shrink-0 mt-0.5 sm:mt-0" />
            <div>
              <p className="text-xs font-bold text-[#231818]">{storeProfile.plan}</p>
              <p className="text-[11px] text-[#7C6E68]">Pedidos ilimitados, catálogo ativo e relatórios em tempo real</p>
            </div>
          </div>
          <span className="self-start sm:self-center text-xs font-semibold text-[#4A7C59] bg-emerald-100 px-2.5 py-1 rounded-lg shrink-0">
            Ativo
          </span>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <button
            type="button"
            onClick={resetAllData}
            className="inline-flex items-center justify-center sm:justify-start gap-1.5 text-xs text-[#7C6E68] hover:text-red-600 transition-colors py-2 cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar dados de demonstração
          </button>

          <button
            type="submit"
            className="w-full sm:w-auto min-h-[44px] inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Preferências
          </button>
        </div>
      </form>
    </div>
  );
};
