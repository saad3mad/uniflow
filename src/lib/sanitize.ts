// Minimal HTML sanitizer to remove script/style tags and on* event handlers.
// Note: For production-grade sanitization, consider using a library like 'sanitize-html'.
export function sanitizeHtml(input: string): string {
  if (!input) return ''
  let out = input
  // Remove script and style tags entirely
  out = out.replace(/<\/(?:script|style)>/gi, '')
  out = out.replace(/<(?:script|style)[^>]*>[\s\S]*?<\/(?:script|style)>/gi, '')
  // Remove on* attributes and javascript: URLs
  out = out.replace(/ on[a-z]+\s*=\s*"[^"]*"/gi, '')
  out = out.replace(/ on[a-z]+\s*=\s*'[^']*'/gi, '')
  out = out.replace(/ on[a-z]+\s*=\s*[^\s>]+/gi, '')
  out = out.replace(/href\s*=\s*"javascript:[^"]*"/gi, 'href="#"')
  out = out.replace(/href\s*=\s*'javascript:[^']*'/gi, "href='#'")
  return out
}
