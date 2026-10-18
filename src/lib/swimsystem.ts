const SWIMSYSTEM_API_BASE_URL = "https://swimsystem.app/api/v1";
const SWIMSYSTEM_USER_AGENT = "FCDA-Website/1.0";

export type SwimSystemEvent =
  | "heat.racestatus_changed"
  | "event.racestatus_changed"
  | "meet.startlist_updated"
  | "meet.schedule_updated"
  | "entry.changed";

/** Server-side SwimSystem API client. Keep this module out of browser imports. */
export async function swimSystemGet<T>(path: string): Promise<T> {
  const apiKey = process.env.SWIMSYSTEM_API_KEY;
  if (!apiKey) {
    throw new Error("SWIMSYSTEM_API_KEY não está configurada no servidor.");
  }

  const response = await fetch(`${SWIMSYSTEM_API_BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      Accept: "application/json",
      "User-Agent": SWIMSYSTEM_USER_AGENT,
    },
  });

  if (!response.ok) {
    throw new Error(`SwimSystem respondeu ${response.status} para ${path}.`);
  }

  return (await response.json()) as T;
}

export type SwimSystemCompetitionSnapshot = {
  meet: Record<string, unknown>;
  sessions: Record<string, unknown>[];
  events: Record<string, unknown>[];
  results: {
    pointsTableLabel?: string;
    results: Record<string, unknown>[];
  };
  scoring: unknown;
  medals: unknown;
};

function removePrivateFields(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(removePrivateFields);
  if (!value || typeof value !== "object") return value;

  const privateKeys = new Set([
    "license",
    "externalRef",
    "external_references",
    "email",
    "cpf",
    "birthDate",
    "dateOfBirth",
  ]);
  return Object.fromEntries(
    Object.entries(value)
      .filter(([key]) => !privateKeys.has(key))
      .map(([key, entry]) => [key, removePrivateFields(entry)]),
  );
}

export async function fetchSwimSystemCompetition(
  meetId: string,
): Promise<SwimSystemCompetitionSnapshot> {
  const encodedMeetId = encodeURIComponent(meetId);
  const [meet, sessions, events, results, scoring, medals] = await Promise.all([
    swimSystemGet<Record<string, unknown>>(`/swimming/meets/${encodedMeetId}`),
    swimSystemGet<{ sessions?: Record<string, unknown>[] }>(
      `/swimming/meets/${encodedMeetId}/sessions`,
    ),
    swimSystemGet<{ events?: Record<string, unknown>[] }>(
      `/swimming/meets/${encodedMeetId}/events`,
    ),
    swimSystemGet<{
      pointsTableLabel?: string;
      results?: Record<string, unknown>[];
    }>(`/swimming/meets/${encodedMeetId}/results`),
    swimSystemGet<unknown>(`/swimming/meets/${encodedMeetId}/scoring`),
    swimSystemGet<unknown>(`/swimming/meets/${encodedMeetId}/medals`),
  ]);

  return {
    meet,
    sessions: sessions.sessions ?? [],
    events: events.events ?? [],
    results: {
      pointsTableLabel: results.pointsTableLabel,
      results: (results.results ?? []).map((result) =>
        removePrivateFields(result),
      ) as Record<string, unknown>[],
    },
    scoring: removePrivateFields(scoring),
    medals: removePrivateFields(medals),
  };
}

export function findSwimSystemMeetId(value: unknown): string | null {
  if (!value || typeof value !== "object") return null;
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findSwimSystemMeetId(item);
      if (found) return found;
    }
    return null;
  }

  const record = value as Record<string, unknown>;
  for (const key of ["meetId", "meet_id"]) {
    const candidate = record[key];
    if (typeof candidate === "string" && candidate.length > 0) return candidate;
  }
  for (const child of Object.values(record)) {
    const found = findSwimSystemMeetId(child);
    if (found) return found;
  }
  return null;
}

function hexToBytes(hex: string): Uint8Array | null {
  if (!/^[\da-f]{64}$/i.test(hex)) return null;
  const bytes = new Uint8Array(32);
  for (let index = 0; index < bytes.length; index += 1) {
    bytes[index] = Number.parseInt(hex.slice(index * 2, index * 2 + 2), 16);
  }
  return bytes;
}

export async function verifySwimSystemWebhook(
  rawBody: ArrayBuffer,
  signatureHeader: string | null,
): Promise<boolean> {
  const secret = process.env.SWIMSYSTEM_WEBHOOK_SECRET;
  const match = signatureHeader?.match(/^sha256=([\da-f]{64})$/i);
  if (!secret || !match) return false;

  const signature = hexToBytes(match[1]);
  if (!signature) return false;

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  return crypto.subtle.verify("HMAC", key, signature, rawBody);
}
