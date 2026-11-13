/**
 * Only allow same-site relative redirects (open-redirect protection).
 *
 * Rejects more than "//host": a backslash variant like "/\evil.com" also
 * passes a naive startsWith("/") check, and browsers' WHATWG URL parser
 * treats "\" as "/" for http(s) URLs — resolving the Location header to the
 * attacker's origin. Control characters and whitespace are rejected too, so
 * the value stays a single well-formed path.
 */
export function safeNext(value: string | null | undefined): string {
  if (
    value &&
    value.startsWith("/") &&
    !value.startsWith("//") &&
    !/[\\\s\x00-\x1f\x7f]/.test(value)
  ) {
    return value;
  }
  return "/profile";
}
