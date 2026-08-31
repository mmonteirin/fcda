import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from "@/components/ui/command";
import {
  Search,
  Calendar,
  Newspaper,
  Building2,
  Users,
  Trophy,
  Award,
  FileText,
  HelpCircle,
  GraduationCap,
  Sparkles,
  UserPlus,
  Flame,
} from "lucide-react";
import {
  atletasBuscaQuery,
  clubesQuery,
  eventosQuery,
  noticiasQuery,
  recordesBuscaQuery,
  transparenciaQuery,
} from "@/lib/site-queries";

export function GlobalSearchModal() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();

  const { data: noticias = [] } = useQuery({
    ...noticiasQuery(true),
    enabled: open,
  });

  const { data: eventos = [] } = useQuery({
    ...eventosQuery(),
    enabled: open,
  });

  const { data: clubes = [] } = useQuery({
    ...clubesQuery(true),
    enabled: open,
  });

  const { data: atletas = [] } = useQuery({ ...atletasBuscaQuery, enabled: open });
  const { data: recordes = [] } = useQuery({ ...recordesBuscaQuery, enabled: open });
  const { data: documentos = [] } = useQuery({
    ...transparenciaQuery(true),
    enabled: open,
  });

  // Global keybinding: Cmd+K / Ctrl+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  const handleSelect = useCallback(
    (to: string) => {
      setOpen(false);
      navigate({ to });
    },
    [navigate],
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-full border border-border/80 bg-background/60 hover:bg-secondary/80 hover:border-primary/50 px-3.5 py-1.5 text-xs text-muted-foreground transition-all duration-300 shadow-xs hover:shadow-sm backdrop-blur-xs active:scale-95"
        aria-label="Pesquisar no site (Cmd+K)"
      >
        <Search className="h-3.5 w-3.5 text-primary animate-pulse-glow" />
        <span className="hidden sm:inline font-medium">Buscar...</span>
        <kbd className="pointer-events-none hidden sm:inline-flex h-5 select-none items-center gap-1 rounded border border-border bg-muted/50 px-1.5 font-mono text-[10px] font-medium opacity-100 hover:bg-muted transition-colors">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Buscar atletas, boletins, recordes, notícias ou eventos..." />
        <CommandList className="max-h-[380px] overflow-y-auto">
          <CommandEmpty>Nenhum resultado encontrado.</CommandEmpty>

          <CommandGroup heading="Páginas e Serviços">
            <CommandItem onSelect={() => handleSelect("/eventos")} className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: '0ms' }}>
              <Calendar className="h-4 w-4 text-primary" />
              <span>Calendário de Eventos & Competições</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/ranking-temporada-2026")}
              className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in"
              style={{ animationDelay: '50ms' }}
            >
              <Trophy className="h-4 w-4 text-gold" />
              <span>Ranking Temporada 2026</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/transparencia/atletas")}
              className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in"
              style={{ animationDelay: '100ms' }}
            >
              <Users className="h-4 w-4 text-primary" />
              <span>Relação Oficial de Atletas</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/clubes")} className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: '150ms' }}>
              <Building2 className="h-4 w-4 text-primary" />
              <span>Clubes Filiados</span>
            </CommandItem>
            <CommandItem
              onSelect={() => handleSelect("/transparencia")}
              className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in"
              style={{ animationDelay: '200ms' }}
            >
              <FileText className="h-4 w-4 text-primary" />
              <span>Painel de Transparência & Documentos</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/recordes")} className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: '250ms' }}>
              <Flame className="h-4 w-4 text-orange-500" />
              <span>Recordes Cearenses</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/cursos")} className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: '300ms' }}>
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Cursos & Capacitação</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/filie-se")} className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: '350ms' }}>
              <UserPlus className="h-4 w-4 text-primary" />
              <span>Filie-se / Vinculação</span>
            </CommandItem>
            <CommandItem onSelect={() => handleSelect("/contato")} className="gap-2 cursor-pointer hover:bg-primary/5 transition-colors animate-fade-in" style={{ animationDelay: '400ms' }}>
              <HelpCircle className="h-4 w-4 text-primary" />
              <span>Fale Conosco / Contato</span>
            </CommandItem>
          </CommandGroup>

          {eventos.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Competições">
                {eventos.slice(0, 6).map((evento) => (
                  <CommandItem
                    key={evento.id}
                    onSelect={() => handleSelect(`/eventos/${evento.id}`)}
                    className="gap-2 cursor-pointer"
                  >
                    <Calendar className="h-4 w-4 text-primary shrink-0" />
                    <span className="line-clamp-1">{evento.nome}</span>
                    {evento.local && (
                      <span className="text-xs text-muted-foreground ml-auto hidden sm:inline">
                        {evento.local}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {noticias.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Notícias Recentes">
                {noticias.slice(0, 6).map((noticia) => (
                  <CommandItem
                    key={noticia.id}
                    onSelect={() => handleSelect(`/noticias/${noticia.slug || noticia.id}`)}
                    className="gap-2 cursor-pointer"
                  >
                    <Newspaper className="h-4 w-4 text-primary shrink-0" />
                    <span className="line-clamp-1">{noticia.titulo}</span>
                    <span className="text-xs text-muted-foreground ml-auto uppercase shrink-0">
                      {noticia.categoria}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {clubes.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Clubes Filiados">
                {clubes.slice(0, 6).map((clube) => (
                  <CommandItem
                    key={clube.id}
                    onSelect={() => handleSelect("/clubes")}
                    className="gap-2 cursor-pointer"
                  >
                    <Building2 className="h-4 w-4 text-primary shrink-0" />
                    <span>{clube.nome}</span>
                    {clube.sigla && (
                      <span className="text-xs font-bold text-muted-foreground ml-auto">
                        {clube.sigla}
                      </span>
                    )}
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {atletas.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Atletas">
                {atletas.slice(0, 8).map((atleta) => (
                  <CommandItem key={atleta.registro} onSelect={() => handleSelect("/transparencia/atletas")} className="gap-2 cursor-pointer">
                    <Users className="h-4 w-4 text-primary shrink-0" />
                    <span className="line-clamp-1">{atleta.nome}</span>
                    <span className="text-xs text-muted-foreground ml-auto">{atleta.clube}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {documentos.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Boletins e documentos">
                {documentos.slice(0, 8).map((documento) => (
                  <CommandItem key={documento.id} onSelect={() => window.open(documento.arquivo_url, "_blank", "noopener,noreferrer")} className="gap-2 cursor-pointer">
                    <FileText className="h-4 w-4 text-primary shrink-0" />
                    <span className="line-clamp-1">{documento.titulo}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}

          {recordes.length > 0 && (
            <>
              <CommandSeparator />
              <CommandGroup heading="Recordes">
                {recordes.slice(0, 8).map((recorde) => (
                  <CommandItem key={recorde.id} onSelect={() => handleSelect("/recordes")} className="gap-2 cursor-pointer">
                    <Flame className="h-4 w-4 text-orange-500 shrink-0" />
                    <span className="line-clamp-1">{recorde.prova} · {recorde.atleta_nome}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
