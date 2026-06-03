import type { TransparenciaDocumento } from "./site-queries";

export function getTipoLabel(tipo: TransparenciaDocumento["tipo"]) {
  const labels = {
    boletim: "Boletim",
    edital: "Edital de Convocação",
    prestacao_contas: "Prestação de Contas",
  };
  return labels[tipo];
}

export const TIPOS = ["boletim", "edital", "prestacao_contas"] as const;
