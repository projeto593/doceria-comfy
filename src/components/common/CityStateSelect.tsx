import React, { useEffect, useState } from 'react';
import { ChevronDown, MapPin } from 'lucide-react';

export interface BrazilianState {
  uf: string;
  name: string;
}

export const BRAZILIAN_STATES: BrazilianState[] = [
  { uf: 'AC', name: 'Acre' },
  { uf: 'AL', name: 'Alagoas' },
  { uf: 'AP', name: 'Amapá' },
  { uf: 'AM', name: 'Amazonas' },
  { uf: 'BA', name: 'Bahia' },
  { uf: 'CE', name: 'Ceará' },
  { uf: 'DF', name: 'Distrito Federal' },
  { uf: 'ES', name: 'Espírito Santo' },
  { uf: 'GO', name: 'Goiás' },
  { uf: 'MA', name: 'Maranhão' },
  { uf: 'MT', name: 'Mato Grosso' },
  { uf: 'MS', name: 'Mato Grosso do Sul' },
  { uf: 'MG', name: 'Minas Gerais' },
  { uf: 'PA', name: 'Pará' },
  { uf: 'PB', name: 'Paraíba' },
  { uf: 'PR', name: 'Paraná' },
  { uf: 'PE', name: 'Pernambuco' },
  { uf: 'PI', name: 'Piauí' },
  { uf: 'RJ', name: 'Rio de Janeiro' },
  { uf: 'RN', name: 'Rio Grande do Norte' },
  { uf: 'RS', name: 'Rio Grande do Sul' },
  { uf: 'RO', name: 'Rondônia' },
  { uf: 'RR', name: 'Roraima' },
  { uf: 'SC', name: 'Santa Catarina' },
  { uf: 'SP', name: 'São Paulo' },
  { uf: 'SE', name: 'Sergipe' },
  { uf: 'TO', name: 'Tocantins' },
];

const FALLBACK_CITIES_BY_UF: Record<string, string[]> = {
  AC: ['Rio Branco', 'Cruzeiro do Sul', 'Sena Madureira', 'Tarauacá'],
  AL: ['Maceió', 'Arapiraca', 'Rio Largo', 'Palmeira dos Índios', 'Marechal Deodoro'],
  AP: ['Macapá', 'Santana', 'Laranjal do Jari', 'Oiapoque'],
  AM: ['Manaus', 'Parintins', 'Itacoatiara', 'Manacapuru', 'Coari'],
  BA: ['Salvador', 'Feira de Santana', 'Vitória da Conquista', 'Camaçari', 'Itabuna', 'Juazeiro', 'Lauro de Freitas', 'Ilhéus'],
  CE: ['Fortaleza', 'Caucaia', 'Juazeiro do Norte', 'Maracanaú', 'Sobral', 'Crato'],
  DF: ['Brasília', 'Taguatinga', 'Águas Claras', 'Ceilândia', 'Guará', 'Sobradinho'],
  ES: ['Vitória', 'Vila Velha', 'Serra', 'Cariacica', 'Cachoeiro de Itapemirim', 'Linhares'],
  GO: ['Goiânia', 'Aparecida de Goiânia', 'Anápolis', 'Rio Verde', 'Luziânia', 'Águas Lindas de Goiás'],
  MA: ['São Luís', 'Imperatriz', 'São José de Ribamar', 'Timon', 'Caxias'],
  MT: ['Cuiabá', 'Várzea Grande', 'Rondonópolis', 'Sinop', 'Tangará da Serra'],
  MS: ['Campo Grande', 'Dourados', 'Três Lagoas', 'Corumbá', 'Ponta Porã'],
  MG: ['Belo Horizonte', 'Uberlândia', 'Contagem', 'Juiz de Fora', 'Betim', 'Montes Claros', 'Uberaba', 'Governador Valadares'],
  PA: ['Belém', 'Ananindeua', 'Santarém', 'Marabá', 'Parauapebas', 'Castanhal'],
  PB: ['João Pessoa', 'Campina Grande', 'Santa Rita', 'Patos', 'Bayeux'],
  PR: ['Curitiba', 'Londrina', 'Maringá', 'Ponta Grossa', 'Cascavel', 'São José dos Pinhais', 'Foz do Iguaçu'],
  PE: ['Recife', 'Jaboatão dos Guararapes', 'Olinda', 'Caruaru', 'Petrolina', 'Paulista', 'Cabo de Santo Agostinho'],
  PI: ['Teresina', 'Parnaíba', 'Picos', 'Piripiri', 'Floriano'],
  RJ: ['Rio de Janeiro', 'São Gonçalo', 'Duque de Caxias', 'Nova Iguaçu', 'Niterói', 'Belford Roxo', 'Campos dos Goytacazes', 'Petrópolis'],
  RN: ['Natal', 'Mossoró', 'Parnamirim', 'São Gonçalo do Amarante', 'Macaíba'],
  RS: ['Porto Alegre', 'Caxias do Sul', 'Canoas', 'Pelotas', 'Santa Maria', 'Gravataí', 'Novo Hamburgo', 'São Leopoldo'],
  RO: ['Porto Velho', 'Ji-Paraná', 'Ariquemes', 'Vilhena', 'Cacoal'],
  RR: ['Boa Vista', 'Rorainópolis', 'Caracaraí', 'Alto Alegre'],
  SC: ['Florianópolis', 'Joinville', 'Blumenau', 'São José', 'Chapecó', 'Itajaí', 'Criciúma', 'Balneário Camboriú'],
  SP: ['São Paulo', 'Guarulhos', 'Campinas', 'São Bernardo do Campo', 'Santo André', 'Osasco', 'São José dos Campos', 'Ribeirão Preto', 'Sorocaba', 'Santos', 'Jundiaí'],
  SE: ['Aracaju', 'Nossa Senhora do Socorro', 'Lagarto', 'Itabaiana', 'São Cristóvão'],
  TO: ['Palmas', 'Araguaína', 'Gurupi', 'Porto Nacional', 'Paraíso do Tocantins'],
};

const ibgeCitiesCache: Record<string, string[]> = {};

function parseCityState(raw: string): { uf: string; cityName: string } {
  if (!raw || !raw.trim()) {
    return { uf: 'SP', cityName: 'São Paulo' };
  }
  const parts = raw.split(',');
  if (parts.length >= 2) {
    const candidateUf = parts[parts.length - 1].trim().toUpperCase();
    const candidateCity = parts.slice(0, -1).join(',').trim();
    const validUf = BRAZILIAN_STATES.some((s) => s.uf === candidateUf) ? candidateUf : 'SP';
    return {
      uf: validUf,
      cityName: candidateCity || FALLBACK_CITIES_BY_UF[validUf][0],
    };
  }
  return { uf: 'SP', cityName: raw.trim() };
}

interface CityStateSelectProps {
  value: string;
  onChange: (formattedCityState: string) => void;
  compact?: boolean;
  showIcon?: boolean;
}

export const CityStateSelect: React.FC<CityStateSelectProps> = ({
  value,
  onChange,
  compact = false,
  showIcon = true,
}) => {
  const initial = parseCityState(value);
  const [selectedUf, setSelectedUf] = useState<string>(initial.uf);
  const [selectedCity, setSelectedCity] = useState<string>(initial.cityName);
  const [cities, setCities] = useState<string[]>(
    ibgeCitiesCache[initial.uf] || FALLBACK_CITIES_BY_UF[initial.uf] || ['São Paulo']
  );
  const [loadingCities, setLoadingCities] = useState<boolean>(false);

  useEffect(() => {
    const parsed = parseCityState(value);
    if (parsed.uf !== selectedUf) {
      setSelectedUf(parsed.uf);
    }
    if (parsed.cityName && parsed.cityName !== selectedCity) {
      setSelectedCity(parsed.cityName);
    }
  }, [value]);

  useEffect(() => {
    let isMounted = true;

    if (ibgeCitiesCache[selectedUf]) {
      setCities(ibgeCitiesCache[selectedUf]);
      return;
    }

    const fallback = FALLBACK_CITIES_BY_UF[selectedUf] || [];
    setCities(fallback);
    setLoadingCities(true);

    fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${selectedUf}/municipios?orderBy=nome`)
      .then((res) => (res.ok ? res.json() : Promise.reject(new Error('IBGE error'))))
      .then((data: Array<{ nome: string }>) => {
        if (!isMounted || !Array.isArray(data) || data.length === 0) return;
        const names = data.map((item) => item.nome);
        ibgeCitiesCache[selectedUf] = names;
        setCities(names);
      })
      .catch(() => {
        // Keep fallback cities on offline or network failure
      })
      .finally(() => {
        if (isMounted) setLoadingCities(false);
      });

    return () => {
      isMounted = false;
    };
  }, [selectedUf]);

  const handleUfChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newUf = e.target.value;
    setSelectedUf(newUf);
    const defaultCity =
      (FALLBACK_CITIES_BY_UF[newUf] && FALLBACK_CITIES_BY_UF[newUf][0]) ||
      (ibgeCitiesCache[newUf] && ibgeCitiesCache[newUf][0]) ||
      '';
    setSelectedCity(defaultCity);
    onChange(`${defaultCity}, ${newUf}`);
  };

  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newCity = e.target.value;
    setSelectedCity(newCity);
    onChange(`${newCity}, ${selectedUf}`);
  };

  // Ensure current selectedCity is present in options list even before IBGE finishes loading
  const cityOptions = cities.includes(selectedCity) || !selectedCity
    ? cities
    : [selectedCity, ...cities];

  const selectHeightClass = compact
    ? 'py-2 text-xs min-h-[38px]'
    : 'py-3 text-base sm:text-sm min-h-[46px]';

  return (
    <div>
      <label
        className={`text-xs font-semibold text-[#7C6E68] ${
          compact ? '' : 'uppercase tracking-wider'
        } block mb-1.5 flex items-center gap-1.5`}
      >
        {showIcon && <MapPin className="w-3.5 h-3.5 text-[#D07A6D]" />}
        <span>Estado & Cidade *</span>
      </label>

      <div className="grid grid-cols-12 gap-2.5 sm:gap-3">
        {/* Select Dropdown: Estado (UF) */}
        <div className="col-span-5 sm:col-span-5 relative">
          <select
            value={selectedUf}
            onChange={handleUfChange}
            aria-label="Selecionar Estado"
            className={`w-full pl-3.5 pr-8 ${selectHeightClass} bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] appearance-none cursor-pointer truncate font-medium`}
          >
            {BRAZILIAN_STATES.map((st) => (
              <option key={st.uf} value={st.uf}>
                {st.uf} - {st.name}
              </option>
            ))}
          </select>
          <ChevronDown className="w-4 h-4 text-[#7C6E68] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2" />
        </div>

        {/* Select Dropdown: Cidade */}
        <div className="col-span-7 sm:col-span-7 relative">
          <select
            value={selectedCity}
            onChange={handleCityChange}
            aria-label="Selecionar Cidade"
            className={`w-full pl-3.5 pr-8 ${selectHeightClass} bg-[#FBF8F3] border border-[#EFE8DE] rounded-xl focus:outline-hidden focus:border-[#D07A6D] text-[#231818] appearance-none cursor-pointer truncate`}
          >
            {cityOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <ChevronDown
            className={`w-4 h-4 text-[#7C6E68] pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 ${
              loadingCities ? 'animate-pulse text-[#D07A6D]' : ''
            }`}
          />
        </div>
      </div>
    </div>
  );
};
