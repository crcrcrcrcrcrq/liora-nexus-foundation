/**
 * LIORA P0.38 — adapter S3 (SERVER-ONLY, nigdy importowany z klienta).
 *
 * Implementacja jest oparta wyłącznie o `fetch` + Web Crypto (SigV4 liczony
 * ręcznie), bez AWS SDK — dzięki temu działa w runtime Cloudflare Workers,
 * w którym uruchamiany jest build Nitro tego projektu.
 *
 * Zasady bezpieczeństwa (twarde):
 *  - `process.env` czytany WYŁĄCZNIE wewnątrz funkcji (env wstrzykiwany per request),
 *  - access key i secret key nigdy nie są logowane, zwracane ani serializowane,
 *  - błędy sieciowe/HTTP są mapowane na `StorageError` bez nagłówków auth,
 *  - tryb path-style (`endpoint/bucket/key`) — wymagany przez Garage/S3-compat.
 */
import {
  StorageError,
  type ListObjectsResult,
  type PutObjectResult,
  type StorageConfigStatus,
  type StorageObjectRef,
} from "./model";

interface S3Config {
  endpoint: string;
  region: string;
  bucket: string;
  accessKeyId: string;
  secretAccessKey: string;
  forcePathStyle: boolean;
}

function env(name: string): string {
  return (process.env[name] ?? "").trim();
}

/** Status konfiguracji bez ujawniania wartości. Bezpieczny do UI. */
export function readStorageConfigStatus(): StorageConfigStatus {
  const endpointConfigured = env("S3_ENDPOINT").length > 0;
  const bucketConfigured = env("S3_BUCKET").length > 0;
  const credentialsConfigured =
    env("S3_ACCESS_KEY_ID").length > 0 && env("S3_SECRET_ACCESS_KEY").length > 0;
  return {
    endpointConfigured,
    bucketConfigured,
    credentialsConfigured,
    configured: endpointConfigured && bucketConfigured && credentialsConfigured,
    region: env("S3_REGION") || "garage",
    forcePathStyle: (env("S3_FORCE_PATH_STYLE") || "true").toLowerCase() !== "false",
  };
}

export function isStorageConfigured(): boolean {
  return readStorageConfigStatus().configured;
}

function readConfig(): S3Config {
  const status = readStorageConfigStatus();
  if (!status.configured) {
    throw new StorageError(
      "not_configured",
      "S3 storage is not configured (S3_ENDPOINT, S3_BUCKET, S3_ACCESS_KEY_ID, S3_SECRET_ACCESS_KEY required)",
    );
  }
  return {
    endpoint: env("S3_ENDPOINT").replace(/\/+$/, ""),
    region: status.region,
    bucket: env("S3_BUCKET"),
    accessKeyId: env("S3_ACCESS_KEY_ID"),
    secretAccessKey: env("S3_SECRET_ACCESS_KEY"),
    forcePathStyle: status.forcePathStyle,
  };
}

const encoder = new TextEncoder();

function hex(buffer: ArrayBuffer): string {
  return Array.from(new Uint8Array(buffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function sha256Hex(payload: string | Uint8Array): Promise<string> {
  const data = typeof payload === "string" ? encoder.encode(payload) : payload;
  return hex(await crypto.subtle.digest("SHA-256", data as BufferSource));
}

async function hmac(key: Uint8Array, data: string): Promise<Uint8Array> {
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    key as BufferSource,
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign("HMAC", cryptoKey, encoder.encode(data));
  return new Uint8Array(signature);
}

/** RFC 3986 encoding — S3 wymaga zakodowania wszystkiego poza unreserved. */
function uriEncode(value: string): string {
  return encodeURIComponent(value).replace(
    /[!'()*]/g,
    (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
  );
}

function canonicalKeyPath(config: S3Config, key: string): string {
  const keyPath = key
    .split("/")
    .filter((segment) => segment.length > 0)
    .map(uriEncode)
    .join("/");
  const prefix = config.forcePathStyle ? `/${uriEncode(config.bucket)}` : "";
  return keyPath ? `${prefix}/${keyPath}` : `${prefix}/`;
}

interface SignedRequest {
  url: string;
  init: RequestInit;
}

async function signRequest(
  config: S3Config,
  method: "GET" | "PUT" | "DELETE" | "HEAD",
  key: string,
  query: Record<string, string> = {},
  body?: Uint8Array,
  contentType?: string,
): Promise<SignedRequest> {
  const now = new Date();
  const amzDate = `${now.toISOString().replace(/[-:]/g, "").split(".")[0]}Z`;
  const dateStamp = amzDate.slice(0, 8);

  const canonicalUri = canonicalKeyPath(config, key);
  const canonicalQuery = Object.keys(query)
    .sort()
    .map((name) => `${uriEncode(name)}=${uriEncode(query[name] ?? "")}`)
    .join("&");

  const payloadHash = await sha256Hex(body ?? "");
  const host = new URL(config.endpoint).host;

  const headers: Record<string, string> = {
    host,
    "x-amz-content-sha256": payloadHash,
    "x-amz-date": amzDate,
  };
  if (contentType) headers["content-type"] = contentType;

  const signedHeaderNames = Object.keys(headers).sort();
  const canonicalHeaders = signedHeaderNames.map((name) => `${name}:${headers[name]}\n`).join("");
  const signedHeaders = signedHeaderNames.join(";");

  const canonicalRequest = [
    method,
    canonicalUri,
    canonicalQuery,
    canonicalHeaders,
    signedHeaders,
    payloadHash,
  ].join("\n");

  const scope = `${dateStamp}/${config.region}/s3/aws4_request`;
  const stringToSign = ["AWS4-HMAC-SHA256", amzDate, scope, await sha256Hex(canonicalRequest)].join(
    "\n",
  );

  const kDate = await hmac(encoder.encode(`AWS4${config.secretAccessKey}`), dateStamp);
  const kRegion = await hmac(kDate, config.region);
  const kService = await hmac(kRegion, "s3");
  const kSigning = await hmac(kService, "aws4_request");
  const signature = hex((await hmac(kSigning, stringToSign)).buffer as ArrayBuffer);

  const requestHeaders = new Headers();
  for (const name of signedHeaderNames) {
    if (name === "host") continue; // ustawiany przez runtime
    requestHeaders.set(name, headers[name]!);
  }
  requestHeaders.set(
    "authorization",
    `AWS4-HMAC-SHA256 Credential=${config.accessKeyId}/${scope}, SignedHeaders=${signedHeaders}, Signature=${signature}`,
  );

  const url = `${config.endpoint}${canonicalUri}${canonicalQuery ? `?${canonicalQuery}` : ""}`;
  const init: RequestInit = { method, headers: requestHeaders };
  if (body) init.body = body as BodyInit;
  return { url, init };
}

function mapStatus(status: number, key: string): StorageError {
  if (status === 404) return new StorageError("not_found", `Object not found: ${key}`, status);
  if (status === 401 || status === 403)
    return new StorageError("access_denied", `Access denied for object: ${key}`, status);
  return new StorageError("upstream", `Storage responded with HTTP ${status} for ${key}`, status);
}

async function send(
  method: "GET" | "PUT" | "DELETE" | "HEAD",
  key: string,
  options: { query?: Record<string, string>; body?: Uint8Array; contentType?: string } = {},
): Promise<Response> {
  const config = readConfig();
  const signed = await signRequest(
    config,
    method,
    key,
    options.query ?? {},
    options.body,
    options.contentType,
  );
  try {
    return await fetch(signed.url, signed.init);
  } catch (error) {
    // Nie propagujemy oryginalnego błędu — mógłby nieść URL z podpisem.
    throw new StorageError(
      "network",
      `Storage request failed (${method} ${key}): ${error instanceof Error ? error.name : "unknown"}`,
    );
  }
}

export async function putObject(
  key: string,
  body: string | Uint8Array,
  contentType = "application/octet-stream",
): Promise<PutObjectResult> {
  const payload = typeof body === "string" ? encoder.encode(body) : body;
  const response = await send("PUT", key, { body: payload, contentType });
  if (!response.ok) throw mapStatus(response.status, key);
  return { key, size: payload.byteLength, etag: response.headers.get("etag") };
}

export async function putJsonObject(key: string, value: unknown): Promise<PutObjectResult> {
  return putObject(key, JSON.stringify(value, null, 2), "application/json");
}

export async function getObject(key: string): Promise<Uint8Array> {
  const response = await send("GET", key);
  if (!response.ok) throw mapStatus(response.status, key);
  return new Uint8Array(await response.arrayBuffer());
}

export async function getObjectText(key: string): Promise<string> {
  const response = await send("GET", key);
  if (!response.ok) throw mapStatus(response.status, key);
  return response.text();
}

export async function getJsonObject<T>(key: string): Promise<T> {
  const raw = await getObjectText(key);
  try {
    return JSON.parse(raw) as T;
  } catch {
    throw new StorageError("upstream", `Object is not valid JSON: ${key}`);
  }
}

export async function deleteObject(key: string): Promise<void> {
  const response = await send("DELETE", key);
  // S3 zwraca 204 dla usunięcia; 404 traktujemy jako idempotentny sukces.
  if (!response.ok && response.status !== 404) throw mapStatus(response.status, key);
}

export async function objectExists(key: string): Promise<boolean> {
  const response = await send("HEAD", key);
  if (response.status === 404) return false;
  if (!response.ok) throw mapStatus(response.status, key);
  return true;
}

function extractAll(xml: string, tag: string): string[] {
  const matches = xml.matchAll(new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`, "g"));
  return Array.from(matches, (match) => match[1] ?? "");
}

function extractOne(xml: string, tag: string): string | null {
  const match = new RegExp(`<${tag}>([\\s\\S]*?)</${tag}>`).exec(xml);
  return match ? (match[1] ?? null) : null;
}

export async function listObjects(
  prefix: string,
  options: { maxKeys?: number; continuationToken?: string } = {},
): Promise<ListObjectsResult> {
  const query: Record<string, string> = { "list-type": "2", prefix };
  if (options.maxKeys) query["max-keys"] = String(Math.min(options.maxKeys, 1000));
  if (options.continuationToken) query["continuation-token"] = options.continuationToken;

  const response = await send("GET", "", { query });
  if (!response.ok) throw mapStatus(response.status, prefix);
  const xml = await response.text();

  const objects: StorageObjectRef[] = extractAll(xml, "Contents").map((entry) => ({
    key: extractOne(entry, "Key") ?? "",
    size: Number(extractOne(entry, "Size") ?? 0),
    lastModified: extractOne(entry, "LastModified"),
    etag: extractOne(entry, "ETag"),
  }));

  return {
    objects: objects.filter((object) => object.key.length > 0),
    truncated: extractOne(xml, "IsTruncated") === "true",
    nextToken: extractOne(xml, "NextContinuationToken"),
  };
}

/** Suma kontrolna artefaktu — używana przez Backup Manager. */
export async function checksum(payload: string | Uint8Array): Promise<string> {
  return `sha256:${await sha256Hex(payload)}`;
}
