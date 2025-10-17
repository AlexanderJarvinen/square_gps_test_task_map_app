import { GeoSuggestion, Id, WithId } from "@/types/index";
import { isAbortError } from "@/types/type-guard";
import i18n from "@/i18n";

const t = (key: string, params?: Record<string, unknown>) =>
  String(i18n.t(key, params));

function safeParse<T>(raw: string | null, fallback: T): T {
  if (!raw) return fallback;

  try {
    return JSON.parse(raw) as T;
  } catch (e) {
    console.log(t("backend.log.parsingError"), e);
    return fallback;
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((res) => setTimeout(res, ms));
}

function genId(): Id {
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

async function fetchWithTimeout(
  input: RequestInfo,
  init: RequestInit & { timeoutMs?: number } = {}
) {
  const { timeoutMs = 8000, ...rest } = init;
  const ctrl = new AbortController();
  const tmr = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(input, { ...rest, signal: ctrl.signal });
    return res;
  } finally {
    clearTimeout(tmr);
  }
}

export class Backend<T extends WithId> {
  private readonly ns: string = "";
  private readonly itemsKey: string = "";
  private readonly selectedKey: string = "";
  private readonly latencyMs: number = 0;
  private geocodeApiKey = (process.env.VUE_APP_GEOCODE_API_KEY || "").trim();
  private geocodeLastTs = 0;
  private geocodeAbort: AbortController | null = null;
  private queue: Promise<unknown> = Promise.resolve();

  constructor(options: { namespace: string; latencyMs?: number }) {
    this.ns = options.namespace;
    this.itemsKey = `${this.ns}:items`;
    this.selectedKey = `${this.ns}:selectedId`;
    this.latencyMs = options.latencyMs ?? 200;

    if (!localStorage.getItem(this.itemsKey)) {
      localStorage.setItem(this.itemsKey, JSON.stringify([]));
    }
  }

  async list(): Promise<T[]> {
    await delay(this.latencyMs);
    return safeParse<T[]>(localStorage.getItem(this.itemsKey), []);
  }

  async create(input: Omit<T, "id"> & Partial<Pick<T, "id">>): Promise<T> {
    return this.enqueue(async () => {
      await delay(this.latencyMs);

      const items = safeParse<T[]>(localStorage.getItem(this.itemsKey), []);

      const id = (input.id ?? genId()) as T["id"];
      const { id: _, ...rest } = input as Omit<T, "id"> & { id?: T["id"] };
      const entity = { ...rest, id } as unknown as T;

      items.push(entity);
      localStorage.setItem(this.itemsKey, JSON.stringify(items));
      return entity;
    });
  }

  async fetchSuggestions(
    query: string,
    limit = 10
  ): Promise<{ items: GeoSuggestion[]; error?: string }> {
    const q = (query || "").trim();
    if (!q) {
      return { items: [], error: "" };
    }

    if (this.geocodeAbort) {
      try {
        this.geocodeAbort.abort();
      } catch (e) {
        console.log(t("backend.log.unknownFetchError"), e);
      }
      this.geocodeAbort = null;
    }

    const now = Date.now();
    const elapsed = now - this.geocodeLastTs;
    const needsDelay = Math.max(0, 1000 - elapsed);
    if (needsDelay > 0) {
      await new Promise((r) => setTimeout(r, needsDelay));
    }
    this.geocodeLastTs = Date.now();

    const apiKeyPart = this.geocodeApiKey
      ? `&api_key=${encodeURIComponent(this.geocodeApiKey)}`
      : "";
    const url = `https://geocode.maps.co/search?q=${encodeURIComponent(
      q
    )}&limit=${limit}${apiKeyPart}`;

    const ctrl = new AbortController();
    this.geocodeAbort = ctrl;

    let res: Response;
    try {
      res = await fetchWithTimeout(url, {
        timeoutMs: 8000,
        signal: ctrl.signal,
      });
    } catch (err: unknown) {
      if (isAbortError(err)) {
        return { items: [], error: (err as Error).message || "" };
      }
      throw err;
    } finally {
      this.geocodeAbort = null;
    }

    if (res.status === 401) {
      throw new Error(t("backend.geocoder.http401"));
    }
    if (res.status === 429) {
      const ra = res.headers.get("Retry-After");
      const retryAfter = ra ? parseInt(ra, 10) : undefined;
      const msg = Number.isFinite(retryAfter)
        ? t("backend.geocoder.tooManyRequestsWithRetry", {
            seconds: retryAfter,
          })
        : t("backend.geocoder.tooManyRequests");
      return { items: [] as GeoSuggestion[], error: msg };
    }
    if (!res.ok) {
      throw new Error(t("backend.geocoder.httpStatus", { status: res.status }));
    }

    type Raw = { lat?: string; lon?: string; display_name?: string };
    const rawText = await res.text();
    const raw = safeParse<Raw[]>(rawText, []);
    const rawSuggestions = (raw || [])
      .slice(0, limit)
      .map((it) => {
        const lat = parseFloat(it.lat || "");
        const lng = parseFloat(it.lon || "");
        if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
        const display = (it.display_name || "").trim();
        const label = display || `${lat.toFixed(5)}, ${lng.toFixed(5)}`;
        return { label, value: { lat, lng, display: label } } as GeoSuggestion;
      })
      .filter((x): x is GeoSuggestion => !!x);

    return { items: rawSuggestions };
  }

  async remove(id: Id): Promise<void> {
    return this.enqueue(async () => {
      await delay(this.latencyMs);
      const items = safeParse<T[]>(localStorage.getItem(this.itemsKey), []);
      const next = items.filter((x) => x.id !== id);
      localStorage.setItem(this.itemsKey, JSON.stringify(next));
      const selected = safeParse<string | null>(
        localStorage.getItem(this.selectedKey),
        null
      );
      if (selected === id) {
        localStorage.removeItem(this.selectedKey);
      }
    });
  }

  async getSelectedId(): Promise<string | null> {
    await delay(this.latencyMs);
    return safeParse<string | null>(
      localStorage.getItem(this.selectedKey),
      null
    );
  }

  async setSelectedId(id: string | null): Promise<void> {
    return this.enqueue(async () => {
      await delay(this.latencyMs);
      if (id) {
        localStorage.setItem(this.selectedKey, JSON.stringify(id));
      } else {
        localStorage.removeItem(this.selectedKey);
      }
    });
  }

  async clear(): Promise<void> {
    return this.enqueue(async () => {
      await delay(this.latencyMs);
      localStorage.removeItem(this.itemsKey);
      localStorage.removeItem(this.selectedKey);
      localStorage.setItem(this.itemsKey, JSON.stringify([]));
    });
  }

  private enqueue<R>(task: () => Promise<R>): Promise<R> {
    const run = this.queue.then(task, task);
    this.queue = run.catch((e) => e);
    return run as Promise<R>;
  }
}
