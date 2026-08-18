/**
 * LIORA P0.15 — wspólne, transport-agnostyczne renderowanie prostego HTML.
 * Bez template engine: jedynie bezpieczna zamiana linii tekstu na akapity.
 */

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function textToHtml(subject: string, text: string): string {
  const body = text
    .split("\n")
    .map((line) =>
      line.trim()
        ? `<p style="margin:0 0 12px;font-size:15px;line-height:1.7;color:#2b2530;">${escapeHtml(line)}</p>`
        : `<div style="height:8px"></div>`,
    )
    .join("");
  return [
    `<!doctype html><html><body style="margin:0;padding:0;background-color:#ffffff;">`,
    `<div style="max-width:560px;margin:0 auto;padding:32px 28px;font-family:Georgia,'Times New Roman',serif;">`,
    `<h1 style="margin:0 0 20px;font-size:20px;font-weight:400;letter-spacing:0.04em;color:#7a5c2e;">${escapeHtml(subject)}</h1>`,
    body,
    `<p style="margin:28px 0 0;font-size:12px;color:#8a8290;">Liora Ylva</p>`,
    `</div></body></html>`,
  ].join("");
}
