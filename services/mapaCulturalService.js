const BASE_URL = "https://mapacultural.secult.ce.gov.br/api";

// 🔥 Buscar eventos
export const getEventos = async () => {
  try {
    const url = `${BASE_URL}/event/find?@select=id,name,shortDescription,location`;

    const response = await fetch(url);
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

export const getEspacos = async () => {
  try {
    const url = `${BASE_URL}/space/find?@select=id,name,location`;

    const response = await fetch(url);
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

