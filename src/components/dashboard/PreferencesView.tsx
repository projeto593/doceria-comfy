import React, { useEffect, useRef, useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { CityStateSelect } from '../common/CityStateSelect';
import { compressStoreLogo } from '../../utils/imageUpload';
import {
  MAX_OWNER_NAME,
  MAX_STORE_NAME,
  PHONE_DIGITS_LENGTH,
  extractPhoneDigits,
  formatPhone11,
  sanitizeOwnerName,
  sanitizeStoreName,
} from '../../utils/validation';
import { Save, RotateCcw, Store, CreditCard, ShieldCheck, Camera, ImagePlus, Trash2 } from 'lucide-react';

export const PreferencesView: React.FC = () => {
  const { storeProfile, updateStoreProfile, resetAllData, showToast } = useComfy();

  const [name, setName] = useState(storeProfile.name);
  const [ownerName, setOwnerName] = useState(storeProfile.ownerName);
  const [segment, setSegment] = useState(storeProfile.segment);
  const [city, setCity] = useState(storeProfile.city);
  const [whatsapp, setWhatsapp] = useState(formatPhone11(storeProfile.whatsapp));
  const [pixKey, setPixKey] = useState(storeProfile.pixKey);
  const [logoUrl, setLogoUrl] = useState(storeProfile.logoUrl || '');
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);

  const logoInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setName(storeProfile.name);
    setOwnerName(storeProfile.ownerName);
    setSegment(storeProfile.segment);
    setCity(storeProfile.city);
    setWhatsapp(formatPhone11(storeProfile.whatsapp));
    setPixKey(storeProfile.pixKey);
    setLogoUrl(storeProfile.logoUrl || '');
  }, [
    storeProfile.name,
    storeProfile.ownerName,
    storeProfile.segment,
    storeProfile.city,
    storeProfile.whatsapp,
    storeProfile.pixKey,
    storeProfile.logoUrl,
  ]);

  const whatsappDigits = extractPhoneDigits(whatsapp);

  const processLogoFile = async (file: File | undefined) => {
    if (!file) return;
    setIsUploadingLogo(true);
    try {
      const compressed = await compressStoreLogo(file);
      setLogoUrl(compressed);
      await updateStoreProfile({ logoUrl: compressed });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Erro ao carregar a logo da doceria.';
      showToast(message);
    } finally {
      setIsUploadingLogo(false);
    }
  };

  const handleLogoFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    processLogoFile(file);
    e.target.value = '';
  };

  const handleRemoveLogo = async () => {
    setLogoUrl('');
    await updateStoreProfile({ logoUrl: '' });
  };

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
      logoUrl,
    });
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
      <div className="min-w-0">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-serif font-bold text-[#231818]">
          Preferências da Loja
        </h1>
        <p className="text-xs text-[#7C6E68] mt-1">
          Personalize a logo, informações da sua doceria, dados de contato e chave PIX para pagamentos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-4 sm:p-6 border border-[#EFE8DE] shadow-xs space-y-6">
        {/* Identificação */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D] flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" /> Identificação do Ateliê
          </h3>

          {/* Logo / Foto da Marca */}
          <div className="p-4 rounded-2xl bg-[#FBF8F3] border border-[#EFE8DE] flex flex-col sm:flex-row sm:items-center gap-4">
            <input
              ref={logoInputRef}
              type="file"
              accept="image/*"
              onChange={handleLogoFileChange}
              className="hidden"
            />

            {logoUrl ? (
              <div className="w-20 h-20 rounded-3xl overflow-hidden bg-white border border-[#EFE8DE] shadow-sm shrink-0 self-center sm:self-auto">
                <img
                  src={logoUrl}
                  alt={`Logo ${name || 'da doceria'}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ) : (
              <div className="w-20 h-20 rounded-3xl bg-[#D07A6D] text-white flex items-center justify-center font-serif text-3xl font-bold shadow-sm shrink-0 self-center sm:self-auto">
                {(name || 'c').charAt(0).toLowerCase()}
              </div>
            )}

            <div className="flex-1 min-w-0 text-center sm:text-left space-y-2">
              <div>
                <p className="text-xs font-bold text-[#231818]">Logo ou Foto da Marca</p>
                <p className="text-[11px] text-[#7C6E68] mt-0.5">
                  Substitui a letra inicial no topo do seu Cardápio Digital e aparece no painel da loja.
                </p>
              </div>

              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                <button
                  type="button"
                  disabled={isUploadingLogo}
                  onClick={() => logoInputRef.current?.click()}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50 min-h-[38px]"
                >
                  {logoUrl ? (
                    <Camera className="w-3.5 h-3.5 text-[#D07A6D]" />
                  ) : (
                    <ImagePlus className="w-3.5 h-3.5 text-[#D07A6D]" />
                  )}
                  <span>
                    {isUploadingLogo
                      ? 'Enviando...'
                      : logoUrl
                      ? 'Trocar logo'
                      : 'Enviar logo / foto'}
                  </span>
                </button>

                {logoUrl && (
                  <button
                    type="button"
                    disabled={isUploadingLogo}
                    onClick={handleRemoveLogo}
                    className="inline-flex items-center gap-1 px-3 py-2 rounded-xl bg-white hover:bg-red-50 text-red-600 border border-[#EFE8DE] hover:border-red-200 text-xs font-semibold transition-colors cursor-pointer min-h-[38px]"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Remover</span>
                  </button>
                )}
              </div>
            </div>
          </div>

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
            <RotateCcw className="w-3.5 h-3.5" /> Zerar catálogo, pedidos e clientes desta loja
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
