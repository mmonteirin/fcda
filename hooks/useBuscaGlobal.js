import { useMemo } from "react";

export function useBuscaGlobal(query, eventos) {
  const resultados = useMemo(() => {
    if (!query) return [];

    const q = query.toLowerCase();

    return eventos.filter((item) =>
      item.titulo.toLowerCase().includes(q) ||
      item.local.toLowerCase().includes(q) ||
      item.descricao.toLowerCase().includes(q)
    );
  }, [query, eventos]);

  return resultados;
}
