import http from "../../../shared/api/http-common";
import { logHttpError } from "../../../shared/observability/logger";
import { requestProtectedBlob } from "../../../shared/utils/pdfDownload";

/**
 * Online radication inbox (`/api/online-radications`): requests filed from the citizen portal
 * that wait for an operator to bring them to radication or reject them.
 *
 * Every method resolves with the unwrapped `{ ok: true, ... }` payload and rejects with an
 * `OnlineRadicationError` (`status`, `code`, `message`) built from the backend envelope
 * `{ ok: false, error: { code, message } }`. Canceled requests are rethrown untouched; use
 * `isRequestCanceled` to ignore them.
 */

const route = "online-radications";
// Contract outcomes (validation, conflicts, inbox not migrated) are shown inline, so the HTTP
// client's error log is skipped for every request and only unexpected failures are logged here.
const NO_AUTO_LOG = { skipErrorLog: true };
// The shared client defaults to multipart; these commands are JSON contracts.
const JSON_BODY = { ...NO_AUTO_LOG, headers: { "Content-Type": "application/json" } };

export const ONLINE_RADICATION_STATUSES = ["pending", "radicated", "rejected"];
/** List filter for requests with `update` document entries waiting to be received. */
export const WITH_ENTRIES_FILTER = "with_entries";
export const ONLINE_RADICATION_UNAVAILABLE = "ONLINE_RADICATION_UNAVAILABLE";

const EXPECTED_CODES = new Set([
  "ONLINE_RADICATION_NOT_FOUND",
  "ONLINE_RADICATION_NOT_PENDING",
  "ONLINE_RADICATION_FUN_ID_INVALID",
  "ONLINE_RADICATION_FUN_ID_TAKEN",
  "ONLINE_RADICATION_VR_INVALID",
  "ONLINE_RADICATION_VR_TAKEN",
  "ONLINE_RADICATION_REASON_REQUIRED",
  "ONLINE_RADICATION_DATE_INVALID",
  "ONLINE_RADICATION_BUSY",
  "ONLINE_RADICATION_NOT_OPEN",
  "DOCUMENT_ENTRY_NOT_FOUND",
  "DOCUMENT_ENTRY_NOT_PENDING",
  "LIQUIDATION_NOT_FOUND",
  "LIQUIDATION_NO_RECEIPT",
  "LIQUIDATION_RECEIPT_PENDING",
  "LIQUIDATION_INVOICE_INVALID",
  "LIQUIDATION_INVOICE_TOO_LARGE",
  ONLINE_RADICATION_UNAVAILABLE,
]);

const MESSAGES = {
  network: "No fue posible conectar con el servidor. Revise su conexión e intente de nuevo.",
  unavailable: "La bandeja aún no está habilitada en este servidor: falta ejecutar la migración de base de datos.",
  forbidden: "Su usuario no tiene permiso para gestionar las solicitudes en línea.",
  invalid: "La respuesta del servidor no tiene el formato esperado. Intente de nuevo en unos minutos.",
  generic: "No fue posible completar la operación. Intente de nuevo.",
  fileMissing: "El archivo no está disponible en el servidor.",
  fileFailed: "No fue posible abrir el archivo. Intente de nuevo.",
};

export class OnlineRadicationError extends Error {
  constructor(message, { status = null, code = "UNKNOWN", cause } = {}) {
    super(message);
    this.name = "OnlineRadicationError";
    this.status = status;
    this.code = code;
    if (cause) this.cause = cause;
  }
}

export function isRequestCanceled(error) {
  return error?.code === "ERR_CANCELED" || error?.name === "CanceledError" || error?.name === "AbortError";
}

export function isUnavailableError(error) {
  return error?.code === ONLINE_RADICATION_UNAVAILABLE;
}

function toOnlineRadicationError(error) {
  if (error instanceof OnlineRadicationError) return error;
  const response = error?.response;
  if (!response) return new OnlineRadicationError(MESSAGES.network, { code: "NETWORK_ERROR", cause: error });

  const { status, data } = response;
  const envelope = data && typeof data === "object" && data.error && typeof data.error === "object" ? data.error : null;
  if (envelope?.code) {
    const message = typeof envelope.message === "string" && envelope.message.trim() ? envelope.message : MESSAGES.generic;
    return new OnlineRadicationError(message, { status, code: String(envelope.code), cause: error });
  }
  // A backend that predates the inbox answers 404 without the JSON envelope.
  if (status === 404 || status === 501) return new OnlineRadicationError(MESSAGES.unavailable, { status, code: ONLINE_RADICATION_UNAVAILABLE, cause: error });
  if (status === 403) return new OnlineRadicationError(MESSAGES.forbidden, { status, code: "FORBIDDEN", cause: error });
  return new OnlineRadicationError(MESSAGES.generic, { status, code: "UNKNOWN", cause: error });
}

async function request(promise, isValid, { background = false } = {}) {
  let response;
  try {
    response = await promise;
  } catch (error) {
    if (isRequestCanceled(error)) throw error;
    const failure = toOnlineRadicationError(error);
    if (!background && !EXPECTED_CODES.has(failure.code)) logHttpError(error);
    throw failure;
  }
  const data = response?.data;
  const status = response?.status ?? null;
  // An HTML page instead of JSON means the route does not exist on this host.
  if (!data || typeof data !== "object") throw new OnlineRadicationError(MESSAGES.unavailable, { status, code: ONLINE_RADICATION_UNAVAILABLE });
  if (data.ok !== true || (isValid && !isValid(data))) throw new OnlineRadicationError(MESSAGES.invalid, { status, code: "INVALID_RESPONSE" });
  return data;
}

function requestId(id) {
  const value = Number(id);
  if (!Number.isInteger(value) || value < 1) throw new OnlineRadicationError("La solicitud no tiene un identificador válido.", { code: "INVALID_ID" });
  return value;
}

function toCount(value) {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? Math.trunc(number) : 0;
}

export function normalizeCounts(counts) {
  if (!counts || typeof counts !== "object") return null;
  const pending = toCount(counts.pending);
  const radicated = toCount(counts.radicated);
  const rejected = toCount(counts.rejected);
  // Requests (not documents) with `update` entries waiting; they overlap the other buckets.
  const pendingEntries = toCount(counts.pendingEntries);
  return { pending, radicated, rejected, pendingEntries, all: pending + radicated + rejected };
}

function integerAtLeast(value, min, message) {
  const number = Number(value);
  if (!Number.isInteger(number) || number < min) throw new OnlineRadicationError(message, { code: "INVALID_ID" });
  return number;
}

function entryPath(id, entryId) {
  return `/${route}/${requestId(id)}/entries/${integerAtLeast(entryId, 1, "La entrada no tiene un identificador válido.")}`;
}

/** API path (relative to the shared client) of one file of a document entry. Requires the JWT. */
export function getEntryFileUrl(id, entryId, index) {
  return `${entryPath(id, entryId)}/files/${integerAtLeast(index, 0, "El archivo no tiene una posición válida.")}`;
}

const hasItem = (data) => Boolean(data.item) && typeof data.item === "object";
// Entry commands may answer with the updated Detail or only `{ ok: true }`; callers reload on null.
const itemOrNull = (data) => (hasItem(data) ? data.item : null);

class OnlineRadicationService {
  /** Paginated list. `status`: pending (default) | with_entries | radicated | rejected | all. `page` is 1-based. */
  list({ status = "pending", q = "", page = 1, pageSize = 20 } = {}, { signal } = {}) {
    const params = { status, page, pageSize };
    const query = String(q ?? "").trim();
    if (query) params.q = query;
    return request(http.get(`/${route}`, { ...NO_AUTO_LOG, params, signal }), (data) => Array.isArray(data.items)).then((data) => ({
      items: data.items,
      total: toCount(data.total),
      page: Number(data.page) || page,
      pageSize: Number(data.pageSize) || pageSize,
      counts: normalizeCounts(data.counts),
    }));
  }

  /** `{ pending, radicated, rejected, pendingEntries, all }`. `background` skips error telemetry for silent refreshes. */
  counts({ signal, background = false } = {}) {
    return request(
      http.get(`/${route}/counts`, { ...NO_AUTO_LOG, signal }),
      (data) => Boolean(data.counts) && typeof data.counts === "object",
      { background },
    ).then((data) => normalizeCounts(data.counts));
  }

  async get(id, { signal } = {}) {
    return request(http.get(`/${route}/${requestId(id)}`, { ...NO_AUTO_LOG, signal }), hasItem).then((data) => data.item);
  }

  /** Creates the FUN 0 and its VR in one transaction. `date` is YYYY-MM-DD (today when omitted). */
  async radicate(id, { funIdPublic, vr, date } = {}) {
    const body = { funIdPublic, vr };
    if (date) body.date = date;
    return request(http.post(`/${route}/${requestId(id)}/radicate`, body, JSON_BODY), hasItem).then((data) => data.item);
  }

  /** `reason` must have between 10 and 1000 characters. */
  async reject(id, { reason } = {}) {
    return request(http.post(`/${route}/${requestId(id)}/reject`, { reason }, JSON_BODY), hasItem).then((data) => data.item);
  }

  /**
   * Receives a pending `update` entry as a new VR (submits + sub_lists + sub_docs). `date` is
   * YYYY-MM-DD (today when omitted). Resolves with the updated Detail, or null when the server
   * only confirms.
   */
  async receiveEntry(id, entryId, { vr, date } = {}) {
    const path = `${entryPath(id, entryId)}/receive`;
    const body = { vr };
    if (date) body.date = date;
    return request(http.post(path, body, JSON_BODY)).then(itemOrNull);
  }

  /** Rejects a pending entry. `reason` must have between 10 and 1000 characters. */
  async rejectEntry(id, entryId, { reason } = {}) {
    const path = `${entryPath(id, entryId)}/reject`;
    return request(http.post(path, { reason }, JSON_BODY)).then(itemOrNull);
  }

  /**
   * Downloads one entry file with the session JWT (same transport as ProtectedDocument) and
   * resolves with `{ blob, contentType }`. The caller owns any object URL it creates.
   */
  async fetchEntryFile(id, entryId, index, { signal } = {}) {
    return this.#fetchFile(getEntryFileUrl(id, entryId, index), { signal });
  }

  /** Liquidation of a request, or null when none was issued yet (404 LIQUIDATION_NOT_FOUND). */
  async getLiquidation(id, { signal } = {}) {
    try {
      const data = await request(http.get(`/${route}/${requestId(id)}/liquidation`, { ...NO_AUTO_LOG, signal }), hasItem);
      return data.item;
    } catch (error) {
      if (error?.code === "LIQUIDATION_NOT_FOUND") return null;
      throw error;
    }
  }

  /** Uploads (or replaces) the pre-liquidation invoice. `file` must be a PDF (max 10 MiB). */
  async issueInvoice(id, file) {
    const form = new FormData();
    form.append("file", file, file.name);
    return request(http.post(`/${route}/${requestId(id)}/liquidation/invoice`, form, NO_AUTO_LOG), hasItem).then((data) => data.item);
  }

  /** `reason` must have between 10 and 1000 characters. */
  async rejectReceipt(id, { reason } = {}) {
    return request(http.post(`/${route}/${requestId(id)}/liquidation/receipt/reject`, { reason }, JSON_BODY), hasItem).then((data) => data.item);
  }

  /** Approves the payment and radicates: same inputs as `radicate`. Resolves with the radicated Detail. */
  async approvePayment(id, { funIdPublic, vr, date } = {}) {
    const body = { funIdPublic, vr };
    if (date) body.date = date;
    return request(http.post(`/${route}/${requestId(id)}/liquidation/approve`, body, JSON_BODY), hasItem).then((data) => data.item);
  }

  /** `kind`: "invoice" | "receipt". Resolves with `{ blob, contentType }`. */
  async fetchLiquidationFile(id, kind, { signal } = {}) {
    return this.#fetchFile(`/${route}/${requestId(id)}/liquidation/${kind === "receipt" ? "receipt" : "invoice"}`, { signal });
  }

  async #fetchFile(path, { signal } = {}) {
    let response;
    try {
      response = await requestProtectedBlob(path, { ...NO_AUTO_LOG, signal });
    } catch (error) {
      if (isRequestCanceled(error)) throw error;
      const status = error?.response?.status ?? null;
      const envelope = error?.response?.data?.error;
      if (envelope?.code) throw toOnlineRadicationError(error);
      if (status === 404) throw new OnlineRadicationError(MESSAGES.fileMissing, { status, code: "DOCUMENT_ENTRY_NOT_FOUND", cause: error });
      if (status !== 403 && status !== 401) logHttpError(error);
      throw new OnlineRadicationError(error?.response ? MESSAGES.fileFailed : MESSAGES.network, { status, code: "FILE_UNAVAILABLE", cause: error });
    }
    const contentType = String(response.headers?.["content-type"] || response.data?.type || "application/octet-stream").split(";")[0].trim();
    const blob = response.data instanceof Blob && response.data.type === contentType ? response.data : new Blob([response.data], { type: contentType });
    return { blob, contentType };
  }
}

export default new OnlineRadicationService();
