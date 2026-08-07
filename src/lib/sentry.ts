// import * as Sentry from "@sentry/react";

// if (import.meta.env.PROD && import.meta.env.VITE_SENTRY_DSN) {
//   Sentry.init({
//     dsn: import.meta.env.VITE_SENTRY_DSN,
//     environment: import.meta.env.MODE,
//     integrations: [
//       Sentry.browserTracingIntegration(),
//       Sentry.replayIntegration({
//         maskAllText: false,
//         blockAllMedia: false,
//       }),
//     ],
//     tracesSampleRate: 0.1, // 10% das transações serão amostradas
//     replaysSessionSampleRate: 0.1, // 10% das sessões serão gravadas
//     replaysOnErrorSampleRate: 1.0, // 100% das sessões com erro serão gravadas
//     beforeSend(event: any, hint: any) {
//       // Filtra informações sensíveis
//       if (event.request) {
//         delete event.request.cookies;
//       }
//       return event;
//     },
//   });
// }

export function captureException(error: Error) {
  // Sentry.captureException(error);
  console.error(error);
}

export function captureMessage(message: string, level: "info" | "warning" | "error" = "info") {
  // Sentry.captureMessage(message, level);
  console.log(`[${level.toUpperCase()}] ${message}`);
}
