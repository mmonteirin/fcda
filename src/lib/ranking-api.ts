// Serviço para consumir a API do Google Apps Script do Ranking FCDA
const GOOGLE_APPS_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbwwsqo9VNgfcitwTkYNB9SZzWKpsjw0J8JekP1gDvRCUzgli49JtqJA1XYPU0R2N_KvNA/exec';

// Usar proxy local para evitar CORS (em desenvolvimento)
const API_URL = import.meta.env.DEV 
  ? 'http://localhost:3001/api/ranking' // Proxy local em desenvolvimento
  : GOOGLE_APPS_SCRIPT_URL; // URL direta em produção (pode precisar de proxy também)

export interface RankingAtleta {
  atleta: string;
  entidade: string;
  classe: string;
  sexo: string;
  total: number;
}

export interface RankingClube {
  entidade: string;
  atletas: number;
  total: number;
}

export interface RankingSexo {
  sexo: string;
  atletas: number;
}

export interface RankingTrofeu {
  nome: string;
  total: number;
}

export interface RankingClasse {
  classe: string;
  faixa: string;
  atletas: number;
  total: number;
}

export interface RankingGrupoSexo {
  sexo: string;
  atletas: Array<{
    posicao: number;
    atleta: string;
    entidade: string;
    total: number;
  }>;
}

export interface RankingCategoria {
  classe: string;
  faixa: string;
  porSexo: RankingGrupoSexo[];
}

export interface RankingIndicadores {
  totalAtletas: number;
  totalClubes: number;
  totalClasses: number;
}

export interface RankingData {
  temporada: string;
  federacao: string;
  atualizadoEm: string;
  indicadores: RankingIndicadores;
  top15: RankingAtleta[];
  clubes: RankingClube[];
  sexo: RankingSexo[];
  trofeus: RankingTrofeu[];
  classes: RankingClasse[];
  parcialPorClasse: RankingCategoria[];
}

export interface RankingResponse {
  atualizadoEm: string;
  top15?: RankingAtleta[];
  clubes?: RankingClube[];
  sexo?: RankingSexo[];
  trofeus?: RankingTrofeu[];
  classes?: RankingClasse[];
  indicadores?: RankingIndicadores;
  parcialPorClasse?: RankingCategoria[];
  erro?: boolean;
  mensagem?: string;
}

async function fetchRankingData(params: Record<string, string> = {}): Promise<RankingResponse> {
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
    throw new Error(data.mensagem || 'Erro ao carregar dados do ranking');
  }
  
  return data;
}

export const rankingAPI = {
  // Buscar dados completos
  getDadosCompletos: async (): Promise<RankingData> => {
    const response = await fetchRankingData();
    // Para o endpoint principal, a API retorna o objeto completo
    return response as unknown as RankingData;
  },

  // Buscar apenas Top 15
  getTop15: async (): Promise<{ atualizadoEm: string; top15: RankingAtleta[] }> => {
    const response = await fetchRankingData({ recurso: 'top15' });
    return {
      atualizadoEm: response.atualizadoEm,
      top15: response.top15 || []
    };
  },

  // Buscar ranking por clubes
  getClubes: async (): Promise<{ atualizadoEm: string; clubes: RankingClube[] }> => {
    const response = await fetchRankingData({ recurso: 'clubes' });
    return {
      atualizadoEm: response.atualizadoEm,
      clubes: response.clubes || []
    };
  },

  // Buscar distribuição por sexo
  getSexo: async (): Promise<{ atualizadoEm: string; sexo: RankingSexo[] }> => {
    const response = await fetchRankingData({ recurso: 'sexo' });
    return {
      atualizadoEm: response.atualizadoEm,
      sexo: response.sexo || []
    };
  },

  // Buscar pontuação por troféu
  getTrofeus: async (): Promise<{ atualizadoEm: string; trofeus: RankingTrofeu[] }> => {
    const response = await fetchRankingData({ recurso: 'trofeus' });
    return {
      atualizadoEm: response.atualizadoEm,
      trofeus: response.trofeus || []
    };
  },

  // Buscar distribuição por classes
  getClasses: async (): Promise<{ atualizadoEm: string; classes: RankingClasse[] }> => {
    const response = await fetchRankingData({ recurso: 'classes' });
    return {
      atualizadoEm: response.atualizadoEm,
      classes: response.classes || []
    };
  },

  // Buscar indicadores gerais
  getIndicadores: async (): Promise<{ atualizadoEm: string; indicadores: RankingIndicadores }> => {
    const response = await fetchRankingData({ recurso: 'indicadores' });
    return {
      atualizadoEm: response.atualizadoEm,
      indicadores: response.indicadores || { totalAtletas: 0, totalClubes: 0, totalClasses: 0 }
    };
  },

  // Buscar classificação parcial por categoria
  getParcial: async (classe?: string, sexo?: string): Promise<{ atualizadoEm: string; parcialPorClasse: RankingCategoria[] }> => {
    const params: Record<string, string> = { recurso: 'parcial' };
    if (classe) params.classe = classe;
    if (sexo) params.sexo = sexo;
    const response = await fetchRankingData(params);
    return {
      atualizadoEm: response.atualizadoEm,
      parcialPorClasse: response.parcialPorClasse || []
    };
  },
};