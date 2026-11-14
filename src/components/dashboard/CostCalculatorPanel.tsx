import React, { useEffect, useState } from 'react';
import {
  Calculator,
  ChevronDown,
  ChevronUp,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Lock,
} from 'lucide-react';

interface CostCalculatorPanelProps {
  sellingPrice: number;
  costPrice: number;
  onCostPriceChange: (nextCost: number) => void;
  onApplySuggestedPrice: (suggestedPrice: number) => void;
}

function parseDecimalInput(raw: string): number {
  const normalized = raw.replace(/\s+/g, '').replace(',', '.');
  const parsed = parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function formatBRL(value: number): string {
  return value.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export const CostCalculatorPanel: React.FC<CostCalculatorPanelProps> = ({
  sellingPrice,
  costPrice,
  onCostPriceChange,
  onApplySuggestedPrice,
}) => {
  const [costText, setCostText] = useState<string>(() =>
    costPrice > 0 ? costPrice.toFixed(2).replace('.', ',') : ''
  );
  const [showRecipeBreakdown, setShowRecipeBreakdown] = useState(false);

  const [ingredientsText, setIngredientsText] = useState('');
  const [packagingText, setPackagingText] = useState('');
  const [extrasText, setExtrasText] = useState('');
  const [yieldText, setYieldText] = useState('1');

  useEffect(() => {
    const currentParsed = parseDecimalInput(costText);
    if (Math.abs(currentParsed - costPrice) > 0.009) {
      setCostText(costPrice > 0 ? costPrice.toFixed(2).replace('.', ',') : '');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [costPrice]);

  const handleDirectCostChange = (raw: string) => {
    setCostText(raw);
    const parsed = parseDecimalInput(raw);
    onCostPriceChange(Math.round(parsed * 100) / 100);
  };

  const handleBreakdownChange = (
    nextIng: string,
    nextPack: string,
    nextExtra: string,
    nextYield: string
  ) => {
    const ing = parseDecimalInput(nextIng);
    const pack = parseDecimalInput(nextPack);
    const extra = parseDecimalInput(nextExtra);
    const yieldCount = Math.max(1, parseInt(nextYield.replace(/\D/g, ''), 10) || 1);

    const totalBatch = ing + pack + extra;
    const unitCost = Math.round((totalBatch / yieldCount) * 100) / 100;
    setCostText(unitCost > 0 ? unitCost.toFixed(2).replace('.', ',') : '');
    onCostPriceChange(unitCost);
  };

  const profit = sellingPrice - costPrice;
  const marginPercent = sellingPrice > 0 ? (profit / sellingPrice) * 100 : 0;
  const markupPercent = costPrice > 0 ? (profit / costPrice) * 100 : 0;

  const hasBothValues = sellingPrice > 0 && costPrice > 0;

  let statusLabel = 'Preencha custo e preço para calcular';
  let statusClass = 'bg-[#F8F4EE] text-[#7C6E68] border-[#EFE8DE]';
  let StatusIcon = Calculator;

  if (hasBothValues) {
    if (profit < 0) {
      statusLabel = 'Prejuízo: preço abaixo do custo';
      statusClass = 'bg-red-50 text-red-700 border-red-200';
      StatusIcon = AlertTriangle;
    } else if (profit < 0.01) {
      statusLabel = 'Sem lucro (empate no custo)';
      statusClass = 'bg-amber-50 text-amber-800 border-amber-200';
      StatusIcon = AlertTriangle;
    } else if (marginPercent < 25) {
      statusLabel = 'Margem apertada (abaixo de 25%)';
      statusClass = 'bg-amber-50 text-amber-800 border-amber-200';
      StatusIcon = AlertTriangle;
    } else if (marginPercent < 50) {
      statusLabel = 'Margem saudável';
      statusClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      StatusIcon = CheckCircle2;
    } else {
      statusLabel = 'Excelente margem de lucro';
      statusClass = 'bg-emerald-50 text-emerald-800 border-emerald-200';
      StatusIcon = TrendingUp;
    }
  }

  const targetMargins = [0.35, 0.45, 0.5, 0.6];

  return (
    <div className="rounded-2xl border border-[#E8DCCB] bg-[#FAF6F0] p-3.5 sm:p-4 space-y-3.5">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#D07A6D]/15 text-[#D07A6D] flex items-center justify-center shrink-0">
            <Calculator className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-[#231818]">Calculadora de Custos & Margem</h4>
            <p className="text-[11px] text-[#7C6E68] flex items-center gap-1">
              <Lock className="w-3 h-3 text-[#D07A6D] shrink-0" />
              <span>Visível apenas no seu painel administrativo</span>
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowRecipeBreakdown((prev) => !prev)}
          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-white hover:bg-[#EFE8DE]/60 border border-[#EFE8DE] text-[11px] font-semibold text-[#231818] transition-colors cursor-pointer"
        >
          <span>{showRecipeBreakdown ? 'Ocultar receita' : 'Calcular por receita'}</span>
          {showRecipeBreakdown ? (
            <ChevronUp className="w-3.5 h-3.5 text-[#7C6E68]" />
          ) : (
            <ChevronDown className="w-3.5 h-3.5 text-[#7C6E68]" />
          )}
        </button>
      </div>

      {/* Expandable Recipe Cost Breakdown */}
      {showRecipeBreakdown && (
        <div className="bg-white rounded-xl border border-[#EFE8DE] p-3 space-y-2.5">
          <p className="text-[11px] font-semibold text-[#7C6E68]">
            Some os gastos da receita e divida pelo rendimento:
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            <div>
              <label className="text-[11px] font-semibold text-[#7C6E68] block mb-1">
                Ingredientes (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={ingredientsText}
                onChange={(e) => {
                  const val = e.target.value;
                  setIngredientsText(val);
                  handleBreakdownChange(val, packagingText, extrasText, yieldText);
                }}
                className="w-full px-2.5 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-lg focus:outline-hidden focus:border-[#D07A6D] tabular-nums"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#7C6E68] block mb-1">
                Embalagem (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={packagingText}
                onChange={(e) => {
                  const val = e.target.value;
                  setPackagingText(val);
                  handleBreakdownChange(ingredientsText, val, extrasText, yieldText);
                }}
                className="w-full px-2.5 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-lg focus:outline-hidden focus:border-[#D07A6D] tabular-nums"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#7C6E68] block mb-1">
                Gás/Taxas (R$)
              </label>
              <input
                type="text"
                inputMode="decimal"
                placeholder="0,00"
                value={extrasText}
                onChange={(e) => {
                  const val = e.target.value;
                  setExtrasText(val);
                  handleBreakdownChange(ingredientsText, packagingText, val, yieldText);
                }}
                className="w-full px-2.5 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-lg focus:outline-hidden focus:border-[#D07A6D] tabular-nums"
              />
            </div>
            <div>
              <label className="text-[11px] font-semibold text-[#7C6E68] block mb-1">
                Rendimento (un.)
              </label>
              <input
                type="number"
                min="1"
                value={yieldText}
                onChange={(e) => {
                  const val = e.target.value;
                  setYieldText(val);
                  handleBreakdownChange(ingredientsText, packagingText, extrasText, val);
                }}
                className="w-full px-2.5 py-2 text-base sm:text-xs bg-[#FBF8F3] border border-[#EFE8DE] rounded-lg focus:outline-hidden focus:border-[#D07A6D] tabular-nums"
              />
            </div>
          </div>
        </div>
      )}

      {/* Direct Unit Cost Input + Live KPI Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5 items-stretch">
        <div className="bg-white rounded-xl border border-[#EFE8DE] p-2.5">
          <label className="text-[11px] font-semibold text-[#7C6E68] block mb-1">
            Custo Unitário (R$)
          </label>
          <input
            type="text"
            inputMode="decimal"
            placeholder="0,00"
            value={costText}
            onChange={(e) => handleDirectCostChange(e.target.value)}
            className="w-full px-2.5 py-1.5 text-base sm:text-xs font-semibold text-[#231818] bg-[#FBF8F3] border border-[#EFE8DE] rounded-lg focus:outline-hidden focus:border-[#D07A6D] tabular-nums"
          />
        </div>

        <div className="bg-white rounded-xl border border-[#EFE8DE] p-2.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#7C6E68]">Lucro por unidade</span>
          <span
            className={`text-sm font-serif font-bold tabular-nums mt-1 ${
              !hasBothValues
                ? 'text-[#7C6E68]'
                : profit < 0
                ? 'text-red-600'
                : 'text-emerald-700'
            }`}
          >
            {hasBothValues
              ? `${profit < 0 ? '-' : ''}R$ ${formatBRL(Math.abs(profit))}`
              : '—'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#EFE8DE] p-2.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#7C6E68]">Margem de lucro</span>
          <span
            className={`text-sm font-serif font-bold tabular-nums mt-1 ${
              !hasBothValues
                ? 'text-[#7C6E68]'
                : marginPercent < 25
                ? marginPercent < 0
                  ? 'text-red-600'
                  : 'text-amber-700'
                : 'text-emerald-700'
            }`}
          >
            {hasBothValues ? `${marginPercent.toFixed(1).replace('.', ',')}%` : '—'}
          </span>
        </div>

        <div className="bg-white rounded-xl border border-[#EFE8DE] p-2.5 flex flex-col justify-between">
          <span className="text-[11px] font-semibold text-[#7C6E68]">Markup s/ custo</span>
          <span className="text-sm font-serif font-bold text-[#231818] tabular-nums mt-1">
            {hasBothValues ? `${markupPercent.toFixed(0)}%` : '—'}
          </span>
        </div>
      </div>

      {/* Explicit Status Feedback */}
      <div
        className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-[11px] font-semibold ${statusClass}`}
      >
        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
        <span>{statusLabel}</span>
      </div>

      {/* Quick Target Margin Price Suggestions */}
      {costPrice > 0 && (
        <div className="space-y-1.5">
          <span className="text-[11px] font-semibold text-[#7C6E68] block">
            Sugerir preço de venda para atingir margem:
          </span>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {targetMargins.map((margin) => {
              const suggested = Math.ceil((costPrice / (1 - margin)) * 2) / 2;
              const pctLabel = `${Math.round(margin * 100)}%`;
              return (
                <button
                  key={pctLabel}
                  type="button"
                  onClick={() => onApplySuggestedPrice(suggested)}
                  className="px-2.5 py-2 rounded-xl bg-white hover:bg-[#2B1D1D] hover:text-white border border-[#E8DCCB] text-left transition-colors cursor-pointer group"
                >
                  <span className="block text-[10px] font-semibold text-[#7C6E68] group-hover:text-white/80">
                    Margem {pctLabel}
                  </span>
                  <span className="block text-xs font-bold text-[#231818] group-hover:text-white tabular-nums">
                    R$ {formatBRL(suggested)}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
