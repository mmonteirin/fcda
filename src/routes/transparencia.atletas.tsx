import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { SiteLayout } from "@/components/layout/SiteLayout";
import { transparenciaAPI, type AtletaTransparencia } from "@/lib/transparencia-api";
import { clubesQuery, type Clube } from "@/lib/site-queries";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { asDynamicSupabase } from "@/lib/supabase-helpers";
import { Users, Building2, Search, Filter, AlertCircle } from "lucide-react";

type Atleta = AtletaTransparencia & {
  vinculoCalculado: "confederado" | "vinculado";
};

export const Route = createFileRoute("/transparencia/atletas")({ component: AtletasTransparencia });

function AtletasTransparencia() {
  const [items, setItems] = useState<Atleta[]>([]);
  const [tipo, setTipo] = useState("todos");
  const [busca, setBusca] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [usingFallback, setUsingFallback] = useState(false);

  // Buscar dados dos clubes
  const { data: clubes = [] } = useQuery(clubesQuery(true));

  useEffect(() => {
    void (async () => {
      try {
        setLoading(true);
        setError(null);
        setUsingFallback(false);
        
        // Tentar buscar da API do Google Apps Script primeiro
        const { atletas } = await transparenciaAPI.getAtletas();
        
        // Calcular vínculo baseado nos tipos de natação e águas abertas
        const atletasComVinculo = atletas.map(atleta => {
          const ehConfederado = atleta.tipoNatacao === 'Confederado' || atleta.tipoAguasAbertas === 'Confederado';
          return {
            ...atleta,
            vinculoCalculado: ehConfederado ? 'confederado' : 'vinculado'
          };
        });
        
        setItems(atletasComVinculo);
      } catch (err) {
        console.error('Erro ao carregar atletas da API, usando fallback do Supabase:', err);
        
        // Fallback: buscar dados do Supabase
        try {
          const { data } = await asDynamicSupabase(supabase)
            .from("atletas_transparencia")
            .select("*")
            .order("nome");
          
          if (data && data.length > 0) {
            // Converter dados do Supabase para o formato esperado
            const atletasFallback = data.map(atleta => ({
              registro: atleta.registro,
              nome: atleta.nome,
              apelido: '',
              clube: atleta.clube,
              dataNascimento: atleta.data_nascimento || '',
              modalidades: 'Natação',
              tipoNatacao: atleta.vinculo === 'confederado' ? 'Confederado' : 'Vinculado',
              tipoAguasAbertas: '',
              statusNatacao: atleta.status,
              statusAguasAbertas: '',
              statusGeral: atleta.status,
              idadeReferencia: 0,
              classe: '',
              vinculoCalculado: atleta.vinculo
            }));
            
            setItems(atletasFallback);
            setUsingFallback(true);
          } else {
            throw new Error('Nenhum dado encontrado no Supabase');
          }
        } catch (fallbackErr) {
          console.error('Erro no fallback do Supabase:', fallbackErr);
          setError('Erro ao carregar dados dos atletas. Tente novamente mais tarde.');
        }
      } finally {
        setLoading(false);
      }
    })();
  }, []);
  // Criar mapa de clubes com logos para fácil acesso
  const clubesMap = useMemo(() => {
    const map = new Map<string, Clube>();
    clubes.forEach(clube => {
      // Normalizar nome do clube para comparação
      const normalizedName = clube.nome.toLowerCase().trim();
      map.set(normalizedName, clube);
    });
    return map;
  }, [clubes]);

  const clubesDashboard = useMemo(
    () =>
      Object.entries(
        items.reduce<Record<string, number>>(
          (a, x) => ({ ...a, [x.clube]: (a[x.clube] ?? 0) + 1 }),
          {},
        ),
      ).sort((a, b) => b[1] - a[1]),
    [items],
  );

  // Função para obter logo do clube
  const getClubeLogo = (nomeClube: string) => {
    const normalizedName = nomeClube.toLowerCase().trim();
    const clube = clubesMap.get(normalizedName);
    return clube?.logo_url || null;
  };

  // Função para obter sigla do clube
  const getClubeSigla = (nomeClube: string) => {
    const normalizedName = nomeClube.toLowerCase().trim();
    const clube = clubesMap.get(normalizedName);
    return clube?.sigla || null;
  };
  const lista = items.filter(
    (x) =>
      (tipo === "todos" || x.vinculoCalculado === tipo) &&
      `${x.nome} ${x.apelido} ${x.clube}`.toLowerCase().includes(busca.toLowerCase()),
  );
  return (
    <SiteLayout>
      <section className="bg-hero py-16 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-6">
          <p className="text-xs font-bold uppercase tracking-[.2em] text-gold">
            Portal da Transparência
          </p>
          <h1 className="mt-3 text-4xl font-bold md:text-5xl">Atletas da FCDA</h1>
          <p className="mt-4 text-primary-foreground/80">
            Relação de atletas confederados e vinculados à Federação Cearense de Desportos
            Aquáticos.
          </p>
        </div>
      </section>
      <main className="mx-auto max-w-7xl space-y-10 px-6 py-12">
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="text-center">
              <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-primary border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]"></div>
              <p className="mt-4 text-muted-foreground">Carregando dados dos atletas...</p>
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-destructive/50 bg-destructive/10 p-8 text-center">
            <p className="text-destructive font-semibold">{error}</p>
          </div>
        ) : (
          <>
            {usingFallback && (
              <div className="rounded-2xl border border-amber-500/50 bg-amber-500/10 p-4 mb-6 flex items-start gap-3">
                <AlertCircle className="text-amber-500 h-5 w-5 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="font-semibold text-amber-700">Usando dados de contingência</p>
                  <p className="text-sm text-amber-600/80">
                    A API principal está indisponível no momento. Exibindo dados armazenados localmente que podem não estar atualizados.
                  </p>
                </div>
              </div>
            )}
          <>
            <section className="grid gap-4 sm:grid-cols-3">
              <div className="rounded-2xl border border-border bg-card p-5">
                <Users className="text-primary" />
                <strong className="mt-3 block text-3xl text-deep">{items.length}</strong>
                <span className="text-sm text-muted-foreground">Atletas ativos</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <strong className="block text-3xl text-deep">
                  {items.filter((x) => x.vinculoCalculado === "confederado").length}
                </strong>
                <span className="text-sm text-muted-foreground">Confederados</span>
              </div>
              <div className="rounded-2xl border border-border bg-card p-5">
                <strong className="block text-3xl text-deep">
                  {items.filter((x) => x.vinculoCalculado === "vinculado").length}
                </strong>
                <span className="text-sm text-muted-foreground">Vinculados</span>
              </div>
            </section>
            <section>
              <h2 className="text-2xl font-bold text-deep">Dashboard por clube</h2>
              <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {clubesDashboard.map(([clube, total]) => {
                  const logoUrl = getClubeLogo(clube);
                  const sigla = getClubeSigla(clube);
                  return (
                    <div
                      key={clube}
                      className="flex items-center gap-3 rounded-xl border border-border bg-card p-4"
                    >
                      {logoUrl ? (
                        <img 
                          src={logoUrl} 
                          alt={clube}
                          className="h-10 w-10 rounded-full object-cover"
                        />
                      ) : (
                        <Building2 className="text-primary h-10 w-10" />
                      )}
                      <div className="flex-1">
                        <span className="font-semibold text-deep block">{clube}</span>
                        {sigla && <span className="text-xs text-muted-foreground">{sigla}</span>}
                      </div>
                      <strong className="text-lg">{total}</strong>
                    </div>
                  );
                })}
              </div>
            </section>
            <section className="rounded-2xl border border-border bg-card p-5">
              <div className="flex flex-col gap-3 md:flex-row">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    value={busca}
                    onChange={(e) => setBusca(e.target.value)}
                    placeholder="Buscar atleta ou clube"
                    className="w-full rounded-lg border border-border pl-10 pr-3 py-2"
                  />
                </div>
                <div className="relative flex items-center gap-2">
                  <Filter className="text-muted-foreground h-4 w-4" />
                  <select
                    value={tipo}
                    onChange={(e) => setTipo(e.target.value)}
                    className="rounded-lg border border-border px-3 py-2"
                  >
                    <option value="todos">Todos os vínculos</option>
                    <option value="confederado">Confederados</option>
                    <option value="vinculado">Vinculados</option>
                  </select>
                </div>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="border-b text-left text-muted-foreground">
                    <tr>
                      <th className="p-3">Atleta</th>
                      <th>Clube</th>
                      <th>Vínculo</th>
                      <th>Modalidades</th>
                      <th>Classe</th>
                      <th>Nascimento</th>
                    </tr>
                  </thead>
                  <tbody>
                    {lista.map((x) => {
                      const logoUrl = getClubeLogo(x.clube);
                      return (
                        <tr key={x.registro} className="border-b">
                          <td className="p-3">
                            <div>
                              <div className="font-semibold text-deep">{x.nome}</div>
                              {x.apelido && <div className="text-xs text-muted-foreground">"{x.apelido}"</div>}
                            </div>
                          </td>
                          <td>
                            <div className="flex items-center gap-2">
                              {logoUrl ? (
                                <img 
                                  src={logoUrl} 
                                  alt={x.clube}
                                  className="h-6 w-6 rounded-full object-cover"
                                />
                              ) : null}
                              <span>{x.clube}</span>
                            </div>
                          </td>
                          <td className="capitalize">{x.vinculoCalculado}</td>
                          <td>
                            <div className="text-xs">
                              {x.modalidades}
                            </div>
                          </td>
                          <td>
                            <span className="inline-flex items-center rounded-full bg-primary/10 px-2 py-1 text-xs font-medium text-primary">
                              {x.classe || '—'}
                            </span>
                          </td>
                          <td>
                            {x.dataNascimento
                              ? x.dataNascimento // Já vem formatado dd/MM/yyyy da API
                              : "—"}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        )}
      </main>
    </SiteLayout>
  );
}
