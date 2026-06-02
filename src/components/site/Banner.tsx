import { useSuspenseQuery } from "@tanstack/react-query";
import { bannerQuery } from "@/lib/site-queries";
import { X } from "lucide-react";
import { useState } from "react";

export function Banner() {
  const banner = useSuspenseQuery(bannerQuery).data;
  const [dismissed, setDismissed] = useState(false);

  if (!banner.ativo || !banner.texto || dismissed) {
    return null;
  }

  return (
    <div className="bg-primary text-primary-foreground px-4 py-3">
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-4">
        <p className="text-sm font-medium flex-1">{banner.texto}</p>
        <div className="flex items-center gap-3">
          {banner.link && (
            <a
              href={banner.link}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm font-bold underline hover:no-underline"
            >
              Saiba mais
            </a>
          )}
          <button
            onClick={() => setDismissed(true)}
            className="p-1 hover:bg-primary-foreground/10 rounded"
            aria-label="Fechar banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
