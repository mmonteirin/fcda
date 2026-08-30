import { ArrowUpRight, Calendar, MapPin } from "lucide-react";
import { Link } from "@tanstack/react-router";

interface BannerSlide {
  id: string;
  title: string;
  description: string;
  image: string;
  link?: string;
  linkText?: string;
}

interface Evento {
  id: string;
  nome: string;
  data_texto: string;
  local: string;
  link?: string;
}

interface HeroBannerProps {
  slides: BannerSlide[];
  eventos: Evento[];
  autoPlay?: boolean;
  interval?: number;
}

export function HeroBanner({ slides, eventos }: HeroBannerProps) {
  if (slides.length === 0) return null;

  const featuredSlides = slides.slice(0, 3);

  return (
    <section className="bg-gradient-to-br from-secondary/30 to-secondary/50 py-7 md:py-9 animate-fade-in-up">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="mb-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.24em] text-primary">FCDA em foco</p>
            <h1 className="mt-2 text-3xl font-bold tracking-tight text-deep md:text-4xl">Notícias e movimento</h1>
          </div>
          <Link to="/noticias" className="hidden items-center gap-1 text-sm font-bold text-primary hover:text-deep sm:inline-flex">
            Todas as notícias <ArrowUpRight className="h-4 w-4" />
          </Link>
        </div>

        <div className="grid gap-2 md:min-h-[500px] md:grid-cols-2 md:grid-rows-2">
          {featuredSlides.map((slide, index) => (
            <Link
              key={slide.id}
              to={slide.link || "/noticias"}
              className={`group relative isolate min-h-[260px] overflow-hidden bg-deep ${index === 0 ? "md:row-span-2 md:min-h-0" : "md:min-h-0"}`}
            >
              <img
                src={slide.image}
                alt=""
                className="absolute inset-0 -z-10 h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 -z-10 bg-gradient-hero" />
              <div className="absolute inset-x-0 bottom-0 p-5 md:p-7">
                <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.2em] text-gold">
                  {index === 0 ? "Destaque" : "Em evidência"}
                </p>
                <h2 className={`max-w-2xl font-bold leading-tight text-primary-foreground ${index === 0 ? "text-2xl md:text-4xl" : "text-xl md:text-2xl"}`}>
                  {slide.title}
                </h2>
                {index === 0 && (
                  <p className="mt-3 line-clamp-2 max-w-xl text-sm text-primary-foreground/80">
                    {slide.description}
                  </p>
                )}
              </div>
            </Link>
          ))}
        </div>

        <div className="mt-2 flex flex-col gap-3 border-t border-border/70 bg-card px-4 py-4 sm:flex-row sm:items-center sm:justify-between md:px-5">
          <div className="flex items-center gap-2 text-sm font-bold text-deep">
            <Calendar className="h-4 w-4 text-primary" />
            Próximas competições
          </div>
          {eventos.length > 0 ? (
            <Link to="/eventos" className="flex min-w-0 items-center gap-2 text-sm text-muted-foreground hover:text-primary">
              <span className="truncate">{eventos[0].nome}</span>
              <span className="hidden shrink-0 text-xs sm:inline">{eventos[0].data_texto}</span>
              <MapPin className="hidden h-3.5 w-3.5 shrink-0 sm:block" />
              <ArrowUpRight className="h-4 w-4 shrink-0 text-primary" />
            </Link>
          ) : (
            <span className="text-sm text-muted-foreground">Nenhum evento agendado</span>
          )}
          <Link to="/eventos" className="text-sm font-bold text-primary sm:hidden">
            Ver calendário
          </Link>
        </div>
      </div>
    </section>
  );
}
