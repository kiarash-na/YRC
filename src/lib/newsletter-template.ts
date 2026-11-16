/**
 * Plain-text → branded newsletter HTML. Client-safe (no server imports): the
 * admin composer uses it for the live preview, the server and the Agent use
 * it to build the HTML sent to Resend — one renderer, so preview == email.
 *
 * Writing format (deliberately tiny):
 *   blank line        → new paragraph
 *   # Heading         → heading
 *   - item / * item   → bullet list
 *   **bold**          → bold
 *   [text](https://…) → link;  bare https://… → link
 * A body that already starts with "<" is treated as raw HTML and only wrapped.
 */

const ACCENT = "#ffcc04";
const INK = "#171717";
const MUTED = "#737373";

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

const linkStyle = `color:${INK};text-decoration:underline`;

/** Inline formatting on already-escaped text. */
function inline(text: string): string {
  return text
    .replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>")
    .replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      `<a href="$2" style="${linkStyle}">$1</a>`,
    )
    .replace(
      /(^|[\s(])(https?:\/\/[^\s<)]+)/g,
      `$1<a href="$2" style="${linkStyle}">$2</a>`,
    );
}

function bodyToHtml(body: string): string {
  const blocks = body.replace(/\r\n/g, "\n").trim().split(/\n{2,}/);
  return blocks
    .map((block) => {
      const lines = block.split("\n");
      if (lines.every((l) => /^\s*[-*]\s+/.test(l))) {
        const items = lines
          .map((l) => `<li style="margin:0 0 6px">${inline(escapeHtml(l.replace(/^\s*[-*]\s+/, "")))}</li>`)
          .join("");
        return `<ul style="margin:0 0 18px;padding-left:20px">${items}</ul>`;
      }
      const heading = block.match(/^#{1,3}\s+(.+)$/);
      if (heading && lines.length === 1) {
        return `<h2 style="margin:28px 0 12px;font-size:20px;line-height:1.3;color:${INK}">${inline(escapeHtml(heading[1]))}</h2>`;
      }
      return `<p style="margin:0 0 18px">${lines.map((l) => inline(escapeHtml(l))).join("<br>")}</p>`;
    })
    .join("\n");
}

/*
 * Resend stores a broadcast's HTML only, so the plain-text source rides
 * along in an HTML comment — reopening a draft restores the editable text.
 */
const SOURCE_RE = /<!--yrc-source:([A-Za-z0-9+/=]*)-->/;

function encodeSource(body: string): string {
  return btoa(unescape(encodeURIComponent(body)));
}

/** The plain-text body a draft was written in, or null for foreign HTML. */
export function extractNewsletterSource(html: string | null | undefined): string | null {
  const match = html?.match(SOURCE_RE);
  if (!match) return null;
  try {
    return decodeURIComponent(escape(atob(match[1])));
  } catch {
    return null;
  }
}

/** Resend fills this only in broadcasts; one-off/test sends get a dummy. */
export function withoutUnsubscribePlaceholder(html: string): string {
  return html.replaceAll("{{{RESEND_UNSUBSCRIBE_URL}}}", "https://yasrise.run");
}

export function renderNewsletterHtml(body: string, previewText = ""): string {
  const content = body.trim().startsWith("<") ? body : bodyToHtml(body);
  const preheader = previewText
    ? `<div style="display:none;max-height:0;overflow:hidden">${escapeHtml(previewText)}</div>`
    : "";
  return `<!doctype html>
<html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;background:#f5f5f5;font-family:Poppins,Helvetica,Arial,sans-serif;color:${INK}">
<!--yrc-source:${encodeSource(body)}-->
${preheader}
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:#f5f5f5;padding:24px 12px">
<tr><td align="center">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;background:#ffffff;border:1px solid #e5e5e5;border-radius:3px">
<tr><td style="border-top:4px solid ${ACCENT};padding:28px 32px 8px">
<p style="margin:0;font-size:12px;font-weight:700;letter-spacing:0.3em;text-transform:uppercase;color:${MUTED}">Yas Rise Community</p>
</td></tr>
<tr><td style="padding:16px 32px 24px;font-size:16px;line-height:1.625">
${content}
</td></tr>
<tr><td style="padding:0 32px 28px;font-size:12px;line-height:1.5;color:${MUTED}">
Run together. Grow together. · <a href="https://yasrise.run" style="color:${MUTED}">yasrise.run</a><br>
You're receiving this because you joined the Yas Rise Community newsletter.
<a href="{{{RESEND_UNSUBSCRIBE_URL}}}" style="color:${MUTED}">Unsubscribe</a>
</td></tr>
</table>
</td></tr></table>
</body></html>`;
}
