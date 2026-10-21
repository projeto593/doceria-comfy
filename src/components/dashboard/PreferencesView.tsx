import React, { useState } from 'react';
import { useComfy } from '../../context/ComfyContext';
import { Settings, Save, RotateCcw, Store, User, Smartphone, CreditCard, ShieldCheck } from 'lucide-react';

export const PreferencesView: React.FC = () => {
  const { storeProfile, updateStoreProfile, resetAllData } = useComfy();

  const [name, setName] = useState(storeProfile.name);
  const [ownerName, setOwnerName] = useState(storeProfile.ownerName);
  const [segment, setSegment] = useState(storeProfile.segment);
  const [city, setCity] = useState(storeProfile.city);
  const [whatsapp, setWhatsapp] = useState(storeProfile.whatsapp);
  const [pixKey, setPixKey] = useState(storeProfile.pixKey);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateStoreProfile({
      name,
      ownerName,
      segment,
      city,
      whatsapp,
      pixKey,
    });
  };

  return (
    <div className="max-w-3xl space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-2xl md:text-3xl font-serif font-bold text-[#231818]">
          Preferências da Loja
        </h1>
        <p className="text-xs text-[#7C6E68] mt-1">
          Personalize as informações da sua doceria, dados de contato e chave PIX para pagamentos.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 border border-[#EFE8DE] shadow-xs space-y-6">
        {/* Identificação */}
        <div className="space-y-4">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D] flex items-center gap-1.5">
            <Store className="w-3.5 h-3.5" /> Identificação do Ateliê
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#7C6E68] block mb-1">Nome da Loja / Ateliê</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#7C6E68] block mb-1">Nome da Confeiteira / Responsável</label>
              <input
                type="text"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#7C6E68] block mb-1">Segmento</label>
              <input
                type="text"
                value={segment}
                onChange={(e) => setSegment(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#7C6E68] block mb-1">Cidade e Estado</label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>
          </div>
        </div>

        {/* Contato & Pagamentos */}
        <div className="space-y-4 pt-4 border-t border-[#EFE8DE]">
          <h3 className="text-xs font-semibold uppercase tracking-wider text-[#D07A6D] flex items-center gap-1.5">
            <CreditCard className="w-3.5 h-3.5" /> Contato & Pagamentos
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium text-[#7C6E68] block mb-1">WhatsApp de Pedidos</label>
              <input
                type="text"
                value={whatsapp}
                onChange={(e) => setWhatsapp(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-[#7C6E68] block mb-1">Chave PIX da Doceria</label>
              <input
                type="text"
                value={pixKey}
                onChange={(e) => setPixKey(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:border-[#D07A6D] text-[#231818]"
              />
            </div>
          </div>
        </div>

        {/* Plano Atual */}
        <div className="pt-4 border-t border-[#EFE8DE] flex items-center justify-between p-4 rounded-xl bg-[#FBF8F3]">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-5 h-5 text-[#D07A6D]" />
            <div>
              <p className="text-xs font-bold text-[#231818]">{storeProfile.plan}</p>
              <p className="text-[11px] text-[#7C6E68]">Pedidos ilimitados, catálogo ativo e relatórios em tempo real</p>
            </div>
          </div>
          <span className="text-xs font-semibold text-[#4A7C59] bg-emerald-100 px-2.5 py-1 rounded-lg">
            Ativo
          </span>
        </div>

        {/* Submit */}
        <div className="pt-4 border-t border-[#EFE8DE] flex items-center justify-between">
          <button
            type="button"
            onClick={resetAllData}
            className="inline-flex items-center gap-1.5 text-xs text-[#7C6E68] hover:text-red-600 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Restaurar dados de demonstração
          </button>

          <button
            type="submit"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#2B1D1D] hover:bg-[#3D2B2B] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Save className="w-4 h-4" />
            Salvar Preferências
          </button>
        </div>
      </form>
    </div>
  );
};
