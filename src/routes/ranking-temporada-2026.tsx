import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { rankingAPI, RankingData, RankingCategoria, RankingAtleta, RankingClube } from "@/lib/ranking-api";
import { Trophy, Users, Award, TrendingUp, Medal, Filter, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/ranking-temporada-2026")({
  head: () => ({
    meta: [
      { title: "Ranking Temporada 2026 — FCDA" },
      {
        name: "description",
        content:
          "Classificação oficial e pontuação atualizada da Temporada 2026 da Federação Cearense de Desportos Aquáticos.",
      },
    ],
  }),
  component: RankingTemporada2026,
});

function RankingTemporada2026() {
  const [dados, setDados] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filtroClasse, setFiltroClasse] = useState<string>("");
  const [filtroSexo, setFiltroSexo] = useState<string>("");
  const [filtroAberto, setFiltroAberto] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await rankingAPI.getDadosCompletos();
      setDados(data);
    } catch (err) {
      setError("Erro ao carregar dados do ranking. Tente novamente mais tarde.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const categoriasDisponiveis = dados?.classes.map(c => c.classe) || [];
  const sexosDisponiveis = ["Masculino", "Feminino"];

  const categoriasFiltradas = dados?.parcialPorClasse.filter(categoria => {
    const matchClasse = !filtroClasse || categoria.classe === filtroClasse;
    const matchSexo = !filtroSexo || categoria.porSexo.some(g => g.sexo === filtroSexo);
    return matchClasse && matchSexo;
  }) || [];

  const categoriasComFiltroSexo = categoriasFiltradas.map(categoria => ({
    ...categoria,
    porSexo: filtroSexo 
      ? categoria.porSexo.filter(g => g.sexo === filtroSexo)
      : categoria.porSexo
  })).filter(c => c.porSexo.length > 0);

  const formatarData = (dataISO: string) => {
    if (!isMounted) return ''; // Não formatar no servidor
    const data = new Date(dataISO);
    return data.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getMedalColor = (posicao: number) => {
    switch (posicao) {
      case 1: return 'bg-yellow-500';
      case 2: return 'bg-gray-400';
      case 3: return 'bg-amber-700';
      default: return 'bg-muted';
    }
  };

  const getMedalIcon = (posicao: number) => {
    switch (posicao) {
      case 1: return '🥇';
      case 2: return '🥈';
      case 3: return '🥉';
      default: return '';
    }
  };

  // Aguardar montagem para evitar problemas de hydration
  if (!isMounted) {
    return (
      <SiteLayout>
        <section className="py-20 bg-hero text-primary-foreground">
          <div className="mx-auto max-w-5xl px-6">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Competições</p>
            <h1 className="mt-3 text-5xl font-bold">Ranking Temporada 2026</h1>
          </div>
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (loading) {
    return (
      <SiteLayout>
        <section className="py-20 bg-hero text-primary-foreground">
          <div className="mx-auto max-w-5xl px-6">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Competições</p>
            <h1 className="mt-3 text-5xl font-bold">Ranking Temporada 2026</h1>
          </div>
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  if (error) {
    return (
      <SiteLayout>
        <section className="py-20 bg-hero text-primary-foreground">
          <div className="mx-auto max-w-5xl px-6">
            <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Competições</p>
            <h1 className="mt-3 text-5xl font-bold">Ranking Temporada 2026</h1>
          </div>
        </section>
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-6">
            <div className="rounded-2xl border border-destructive bg-destructive/10 p-6 text-center">
              <p className="text-destructive font-semibold">{error}</p>
              <button
                onClick={carregarDados}
                className="mt-4 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
              >
                Tentar novamente
              </button>
            </div>
          </div>
        </section>
      </SiteLayout>
    );
  }

  return (
    <SiteLayout>
      <section className="py-20 bg-hero text-primary-foreground">
        <div className="mx-auto max-w-5xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">Competições</p>
          <h1 className="mt-3 text-5xl font-bold">Ranking Temporada 2026</h1>
          {dados && (
            <p className="mt-4 text-sm text-primary-foreground/80">
              Atualizado em: {formatarData(dados.atualizadoEm)}
            </p>
          )}
        </div>
      </section>

      <section className="py-16">
        <div className="mx-auto max-w-6xl px-6 space-y-12">
          {/* Indicadores Gerais */}
          {dados?.indicadores && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <Users className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Atletas</p>
                    <p className="text-3xl font-bold text-deep">{dados.indicadores.totalAtletas}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-gold/10 p-3">
                    <Award className="h-6 w-6 text-gold" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Total de Clubes</p>
                    <p className="text-3xl font-bold text-deep">{dados.indicadores.totalClubes}</p>
                  </div>
                </div>
              </div>
              <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-primary/10 p-3">
                    <TrendingUp className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Categorias</p>
                    <p className="text-3xl font-bold text-deep">{dados.indicadores.totalClasses}</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Top 15 Atletas */}
          {dados?.top15 && dados.top15.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Trophy className="h-6 w-6 text-gold" />
                <h2 className="text-2xl font-bold text-deep">Top 15 Atletas</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 px-4">Posição</th>
                      <th className="py-3 px-4">Atleta</th>
                      <th className="py-3 px-4">Entidade</th>
                      <th className="py-3 px-4">Classe</th>
                      <th className="py-3 px-4">Sexo</th>
                      <th className="py-3 px-4 text-right">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.top15.map((atleta, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getMedalColor(index + 1)} text-white`}>
                            {getMedalIcon(index + 1) || index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">{atleta.atleta}</td>
                        <td className="py-3 px-4">{atleta.entidade}</td>
                        <td className="py-3 px-4">{atleta.classe}</td>
                        <td className="py-3 px-4">{atleta.sexo}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">{atleta.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Ranking por Clubes */}
          {dados?.clubes && dados.clubes.length > 0 && (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
              <div className="flex items-center gap-3 mb-6">
                <Award className="h-6 w-6 text-gold" />
                <h2 className="text-2xl font-bold text-deep">Ranking por Clubes</h2>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="py-3 px-4">Posição</th>
                      <th className="py-3 px-4">Entidade</th>
                      <th className="py-3 px-4">Atletas</th>
                      <th className="py-3 px-4 text-right">Total Pontos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {dados.clubes.map((clube, index) => (
                      <tr key={index} className="border-b hover:bg-muted/50">
                        <td className="py-3 px-4">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getMedalColor(index + 1)} text-white`}>
                            {getMedalIcon(index + 1) || index + 1}
                          </div>
                        </td>
                        <td className="py-3 px-4 font-semibold">{clube.entidade}</td>
                        <td className="py-3 px-4">{clube.atletas}</td>
                        <td className="py-3 px-4 text-right font-bold text-primary">{clube.total}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Classificação por Categoria */}
          <div className="rounded-2xl border border-border bg-card p-6 shadow-card">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <Medal className="h-6 w-6 text-gold" />
                <h2 className="text-2xl font-bold text-deep">Classificação por Categoria</h2>
              </div>
              
              {/* Filtros */}
              <div className="flex items-center gap-4">
                <div className="relative">
                  <button
                    onClick={() => setFiltroAberto(!filtroAberto)}
                    className="flex items-center gap-2 px-4 py-2 rounded-md border border-input bg-background hover:bg-accent transition-colors"
                  >
                    <Filter className="h-4 w-4" />
                    <span>Filtros</span>
                    <ChevronDown className={`h-4 w-4 transition-transform ${filtroAberto ? 'rotate-180' : ''}`} />
                  </button>
                  
                  {filtroAberto && (
                    <div className="absolute right-0 mt-2 w-64 rounded-md border border-border bg-card shadow-lg z-10 p-4 space-y-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Categoria</label>
                        <select
                          value={filtroClasse}
                          onChange={(e) => setFiltroClasse(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                        >
                          <option value="">Todas</option>
                          {categoriasDisponiveis.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Sexo</label>
                        <select
                          value={filtroSexo}
                          onChange={(e) => setFiltroSexo(e.target.value)}
                          className="w-full px-3 py-2 rounded-md border border-input bg-background"
                        >
                          <option value="">Todos</option>
                          {sexosDisponiveis.map(sexo => (
                            <option key={sexo} value={sexo}>{sexo}</option>
                          ))}
                        </select>
                      </div>
                      <button
                        onClick={() => {
                          setFiltroClasse("");
                          setFiltroSexo("");
                          setFiltroAberto(false);
                        }}
                        className="w-full px-3 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                      >
                        Limpar Filtros
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-8">
              {categoriasComFiltroSexo.map((categoria, catIndex) => (
                <div key={catIndex} className="space-y-4">
                  <div className="flex items-center gap-3">
                    <h3 className="text-xl font-bold text-deep">
                      {categoria.classe}
                      {categoria.faixa && <span className="text-muted-foreground font-normal"> ({categoria.faixa} anos)</span>}
                    </h3>
                  </div>

                  {categoria.porSexo.map((grupo, grupoIndex) => (
                    <div key={grupoIndex} className="ml-4">
                      <h4 className="text-lg font-semibold text-primary mb-3">{grupo.sexo}</h4>
                      <div className="overflow-x-auto rounded-lg border border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="bg-muted">
                              <th className="py-3 px-4 text-left">Posição</th>
                              <th className="py-3 px-4 text-left">Atleta</th>
                              <th className="py-3 px-4 text-left">Entidade</th>
                              <th className="py-3 px-4 text-right">Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {grupo.atletas.map((atleta, atletaIndex) => (
                              <tr 
                                key={atletaIndex} 
                                className={`border-b hover:bg-muted/50 ${atleta.posicao <= 3 ? 'bg-muted/30' : ''}`}
                              >
                                <td className="py-3 px-4">
                                  <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold ${getMedalColor(atleta.posicao)} text-white`}>
                                    {getMedalIcon(atleta.posicao) || atleta.posicao}
                                  </div>
                                </td>
                                <td className="py-3 px-4 font-semibold">{atleta.atleta}</td>
                                <td className="py-3 px-4">{atleta.entidade}</td>
                                <td className="py-3 px-4 text-right font-bold text-primary">{atleta.total}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {categoriasComFiltroSexo.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                Nenhum resultado encontrado para os filtros selecionados.
              </div>
            )}
          </div>
        </div>
      </section>
    </SiteLayout>
  );
}