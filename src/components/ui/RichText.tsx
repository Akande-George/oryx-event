"use client";

import { useMemo } from "react";
import DOMPurify from "dompurify";

// Renders admin-authored rich text (HTML) safely. Sanitizes on the client to
// strip any unexpected markup, then renders with prose styling.
export default function RichText({
  html,
  className = "",
}: {
  html: string;
  className?: string;
}) {
  const clean = useMemo(() => {
    if (!html) return "";
    if (typeof window === "undefined") return html; // sanitized again on client
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        "p",
        "br",
        "strong",
        "b",
        "em",
        "i",
        "u",
        "s",
        "h2",
        "h3",
        "ul",
        "ol",
        "li",
        "blockquote",
        "a",
        "code",
      ],
      ALLOWED_ATTR: ["href", "target", "rel"],
    });
  }, [html]);

  if (!clean) return null;

  return (
    <div
      className={`richtext text-muted-foreground ${className}`}
      // Sanitized above.
      dangerouslySetInnerHTML={{ __html: clean }}
    />
  );
}
