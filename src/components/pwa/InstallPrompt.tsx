import { useEffect, useState } from "react";
import { Download, X } from "lucide-react";

type InstallEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

export function InstallPrompt() {
  const [installEvent, setInstallEvent] = useState<InstallEvent | null>(null);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    setDismissed(localStorage.getItem("fcda-pwa-dismissed") === "1");
  }, []);

  useEffect(() => {
    const handleInstall = (event: Event) => {
      event.preventDefault();
      setInstallEvent(event as InstallEvent);
    };
    window.addEventListener("beforeinstallprompt", handleInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleInstall);
  }, []);

  if (!installEvent || dismissed) return null;

  const install = async () => {
    await installEvent.prompt();
    setInstallEvent(null);
  };
  const dismiss = () => {
    localStorage.setItem("fcda-pwa-dismissed", "1");
    setDismissed(true);
  };

  return (
    <div className="fixed inset-x-4 bottom-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-xl border border-border bg-card p-4 shadow-elegant">
      <Download className="h-5 w-5 shrink-0 text-primary" />
      <p className="flex-1 text-sm font-semibold text-deep">Instale o app FCDA para acesso rápido.</p>
      <button type="button" onClick={install} className="rounded-lg bg-primary px-3 py-2 text-xs font-bold text-primary-foreground">Instalar</button>
      <button type="button" onClick={dismiss} aria-label="Fechar" className="text-muted-foreground hover:text-foreground"><X className="h-4 w-4" /></button>
    </div>
  );
}