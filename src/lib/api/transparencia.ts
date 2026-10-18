// Serviço para consumir a API do Google Apps Script do Portal da Transparência
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbxS6LRJVOfw8QHPwgkDUx5zUBoJqDKz3zkrYTribDUNBiCP6LN-GKiIwsqhB5g9dnvu/exec';

// Usar proxy local para evitar CORS (em desenvolvimento)
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api/transparencia' // Proxy local em desenvolvimento
  : GOOGLE_APPS_SCRIPT_URL; // URL direta em produção (pode precisar de proxy também)

export interface AtletaTransparencia {
  registro: string;
  nome: string;
  apelido: string;
  clube: string;
  dataNascimento: string;
  modalidades: string;
  tipoNatacao: string;
  tipoAguasAbertas: string;
  statusNatacao: string;
  statusAguasAbertas: string;
  statusGeral: string;
  idadeReferencia: number;
  classe: string;
}

export interface ClubeInfo {
  nome: string;
  logo_url?: string;
  sigla?: string;
}

export interface TransparenciaAtletasResponse {
  total: number;
  anoReferencia: number;
  avisoRenovacao: string | null;
  atletas: AtletaTransparencia[];
  atualizadoEm: string;
}

export interface TransparenciaDashboardResponse {
  totalAtletas: number;
  anoReferencia: number;
  porClube: Record<string, number>;
  porStatus: Record<string, number>;
  porModalidade: Record<string, number>;
  porTipoVinculo: Record<string, number>;
  porClasse: Record<string, number>;
  avisoRenovacao: string | null;
  atualizadoEm: string;
}

export type TransparenciaResponse = TransparenciaAtletasResponse | TransparenciaDashboardResponse;

async function fetchTransparenciaData(params: Record<string, string> = {}): Promise<any> {
  const url = new URL(API_URL);
  Object.entries(params).forEach(([key, value]) => {
    if (value) url.searchParams.append(key, value);
  });

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'Accept': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  
  if (data.erro) {
    throw new Error(data.mensagem || 'Erro ao carregar dados do Portal da Transparência');
  }
  
  return data;
}

export const transparenciaAPI = {
  // Buscar todos os atletas
  getAtletas: async (): Promise<{ atletas: AtletaTransparencia[]; atualizadoEm: string; total: number }> => {
    const response = await fetchTransparenciaData({ action: 'atletas' }) as TransparenciaAtletasResponse;
    return {
      atletas: response.atletas || [],
      atualizadoEm: response.atualizadoEm,
      total: response.total
    };
  },

  // Buscar atletas com filtro
  getAtletasComFiltro: async (filtros: {
    clube?: string;
    status?: string;
    modalidade?: string;
    classe?: string;
    busca?: string;
  }): Promise<{ atletas: AtletaTransparencia[]; atualizadoEm: string; total: number }> => {
    const params: Record<string, string> = { action: 'atletas' };
    if (filtros.clube) params.clube = filtros.clube;
    if (filtros.status) params.status = filtros.status;
    if (filtros.modalidade) params.modalidade = filtros.modalidade;
    if (filtros.classe) params.classe = filtros.classe;
    if (filtros.busca) params.busca = filtros.busca;

    const response = await fetchTransparenciaData(params) as TransparenciaAtletasResponse;
    return {
      atletas: response.atletas || [],
      atualizadoEm: response.atualizadoEm,
      total: response.total
    };
  },

  // Buscar dashboard com resumos
  getDashboard: async (): Promise<TransparenciaDashboardResponse> => {
    return await fetchTransparenciaData({ action: 'dashboard' }) as TransparenciaDashboardResponse;
  },

  // Buscar apenas resumo
  getResumo: async (): Promise<TransparenciaDashboardResponse> => {
    return await fetchTransparenciaData({ action: 'resumo' }) as TransparenciaDashboardResponse;
  },
};