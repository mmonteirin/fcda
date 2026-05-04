import { useEffect, useState } from "react";
import { getEventos } from "../services/mapaCulturalService";

export function useEventos() {
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    carregar();
  }, []);

  const carregar = async () => {
    try {
      const data = await getEventos();

      const normalizados = data.map((item) => ({
        id: item.id,
        titulo: item.name || "Sem título",
        descricao: item.shortDescription || "",
        local: item?.location?.name || "",
        data: item.startDate || "",
        tipo: "evento_publico",
        original: item,
      }));

      setEventos(normalizados);
    } catch (e) {
      console.log(e);
    }

    setLoading(false);
  };

  return { eventos, loading };
}
