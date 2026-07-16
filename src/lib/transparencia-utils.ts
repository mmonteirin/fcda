import type { TransparenciaDocumento } from "./site-queries";

export function getTipoLabel(tipo: TransparenciaDocumento["tipo"]) {
  const labels = {
    boletim: "Documentos",
    edital: "Editais",
    prestacao_contas: "Prestação de Contas",
    regulamento: "Regulamentos",
    ata: "Atas",
    relatorio: "Relatórios",
  };
  return labels[tipo];
}

export const TIPOS = [
  "boletim",
  "prestacao_contas",
  "regulamento",
  "ata",
  "edital",
  "relatorio",
] as const;
