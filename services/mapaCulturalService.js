const BASE_URL = "https://mapacultural.secult.ce.gov.br/api";

// ✅ Limites para evitar sobrecarga de RAM
const EVENTOS_LIMIT = 50;
const ESPACOS_LIMIT = 50;

// 🔥 Buscar eventos com limite
export const getEventos = async (offset = 0) => {
  try {
    // ✅ Usando @limit para paginar e reduzir carga
    const url = `${BASE_URL}/event/find?@select=id,name,shortDescription,location&@limit=${EVENTOS_LIMIT}&@offset=${offset}`;

    const response = await fetch(url, {
      timeout: 10000, // 10s timeout
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const json = await response.json();

    // 🛠️ garante array
    if (Array.isArray(json)) return json;

    if (json?.data) return json.data;

    if (json?.results) return json.results;

    return [];
  } catch (error) {
    console.log("Erro ao buscar eventos:", error);
    return [];
  }
};

// 🔥 Buscar espaços com limite
export const getEspacos = async (offset = 0) => {
  try {
    // ✅ Usando @limit para paginar e reduzir carga
    const url = `${BASE_URL}/space/find?@select=id,name,location&@limit=${ESPACOS_LIMIT}&@offset=${offset}`;

    const response = await fetch(url, {
      timeout: 10000, // 10s timeout
    });
    
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    
    const json = await response.json();

    if (Array.isArray(json)) return json;

    if (json?.data) return json.data;

    if (json?.results) return json.results;

    return [];
  } catch (error) {
    console.log("Erro ao buscar espaços:", error);
    return [];
  }
};

