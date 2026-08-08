import { useState, useEffect } from "react";
import { ChevronLeft, ChevronRight, Calendar, MapPin } from "lucide-react";
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

export function HeroBanner({ slides, eventos, autoPlay = true, interval = 5000 }: HeroBannerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const nextSlide = () => {
    setCurrentIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index: number) => {
    setCurrentIndex(index);
  };

  useEffect(() => {
    if (!autoPlay || isPaused || slides.length <= 1) return;

    const timer = setInterval(nextSlide, interval);
    return () => clearInterval(timer);
  }, [autoPlay, isPaused, interval, slides.length]);

  if (slides.length === 0) return null;

  const currentSlide = slides[currentIndex];

  return (
    <div className="relative w-full min-h-[500px] md:min-h-[600px] overflow-hidden bg-secondary/30">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Coluna maior - Notícias (2/3) */}
          <div className="lg:col-span-2 relative rounded-2xl overflow-hidden shadow-elegant min-h-[400px]">
            <div
              className="relative w-full h-full"
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Slides */}
              <div className="relative w-full h-full">
                {slides.map((slide, index) => (
                  <div
                    key={slide.id}
                    className={`absolute inset-0 transition-all duration-700 ease-in-out ${
                      index === currentIndex
                        ? "opacity-100 scale-100"
                        : "opacity-0 scale-105"
                    }`}
                  >
                    <img
                      src={slide.image}
                      alt={slide.title}
                      className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-deep/95 via-deep/50 to-transparent" />
                    <div className="absolute inset-0 flex items-end">
                      <div className="p-6 md:p-8 w-full">
                        <div className="max-w-2xl">
                          <h2 className="text-2xl md:text-4xl font-bold text-primary-foreground leading-tight mb-3">
                            {slide.title}
                          </h2>
                          <p className="text-sm md:text-base text-primary-foreground/80 mb-4 line-clamp-2">
                            {slide.description}
                          </p>
                          {slide.link && slide.linkText && (
                            <Link
                              to={slide.link}
                              className="inline-flex items-center gap-2 rounded-full bg-gold-gradient px-4 md:px-5 py-2 md:py-2.5 text-xs md:text-sm font-bold text-deep hover:opacity-90 transition"
                            >
                              {slide.linkText}
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Navigation Arrows */}
              {slides.length > 1 && (
                <>
                  <button
                    onClick={prevSlide}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white hover:scale-110"
                    aria-label="Slide anterior"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  <button
                    onClick={nextSlide}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-sm transition-all text-white hover:scale-110"
                    aria-label="Próximo slide"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </>
              )}

              {/* Dots */}
              {slides.length > 1 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2.5 h-2.5 rounded-full transition-all ${
                        index === currentIndex
                          ? "bg-gold w-6"
                          : "bg-white/50 hover:bg-white/70"
                      }`}
                      aria-label={`Ir para slide ${index + 1}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Coluna menor - Próximos Eventos (1/3) */}
          <div className="bg-card rounded-2xl shadow-card border border-border/60 p-6 flex flex-col min-h-[400px]">
            <div className="flex items-center gap-2 mb-4">
              <Calendar className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-deep">Próximos Eventos</h3>
            </div>
            <div className="flex-1 overflow-y-auto space-y-4">
              {eventos.length > 0 ? (
                eventos.slice(0, 5).map((evento) => (
                  <Link
                    key={evento.id}
                    to={evento.link || "/eventos"}
                    className="block p-4 rounded-xl bg-secondary/50 hover:bg-secondary/70 transition-all group"
                  >
                    <h4 className="font-semibold text-deep text-sm mb-2 group-hover:text-primary transition-colors">
                      {evento.nome}
                    </h4>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Calendar className="h-3.5 w-3.5" />
                      <span>{evento.data_texto}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{evento.local}</span>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center py-8">
                  Nenhum evento agendado
                </p>
              )}
            </div>
            <Link
              to="/eventos"
              className="mt-4 text-center text-sm font-semibold text-primary hover:underline"
            >
              Ver todos os eventos
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
