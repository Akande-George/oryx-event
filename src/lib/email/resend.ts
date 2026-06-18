// Server-only Resend client + a branded HTML layout wrapper.
// Domain must be verified in Resend to send to arbitrary recipients; until then
// set RESEND_FROM to "onboarding@resend.dev" (delivers only to your own email).

import "server-only";
import { Resend } from "resend";

const API_KEY = process.env.RESEND_API_KEY?.trim();
const FROM =
  process.env.RESEND_FROM?.trim() || "Oryx Events <onboarding@resend.dev>";

const client = API_KEY ? new Resend(API_KEY) : null;

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  replyTo?: string;
};

export async function sendEmail(input: SendEmailInput) {
  if (!client) {
    console.warn("RESEND_API_KEY not set — skipping email:", input.subject);
    return { skipped: true as const };
  }
  if (!input.to) return { skipped: true as const };

  const { data, error } = await client.emails.send({
    from: FROM,
    to: input.to,
    subject: input.subject,
    html: input.html,
    replyTo: input.replyTo,
  });

  if (error) {
    console.error("Resend send failed:", error);
    return { error: error.message };
  }
  return { id: data?.id };
}

// Shared branded shell so every email looks consistent.
export function emailLayout(opts: {
  heading: string;
  intro?: string;
  bodyHtml: string;
  ctaLabel?: string;
  ctaUrl?: string;
  footerNote?: string;
}) {
  const { heading, intro, bodyHtml, ctaLabel, ctaUrl, footerNote } = opts;
  return `<!doctype html>
<html>
  <body style="margin:0;background:#f5f4f2;font-family:Helvetica,Arial,sans-serif;color:#1a1a1f;">
    <div style="max-width:560px;margin:0 auto;padding:24px;">
      <div style="background:#6b0a1f;border-radius:16px 16px 0 0;padding:24px 28px;">
        <span style="color:#fff;font-size:20px;font-weight:bold;letter-spacing:0.5px;">ORYX&nbsp;EVENTS</span>
      </div>
      <div style="background:#ffffff;border:1px solid #ececee;border-top:none;border-radius:0 0 16px 16px;padding:28px;">
        <h1 style="margin:0 0 12px;font-size:22px;color:#1a1a1f;">${heading}</h1>
        ${intro ? `<p style="margin:0 0 20px;color:#55555c;font-size:15px;line-height:1.6;">${intro}</p>` : ""}
        ${bodyHtml}
        ${
          ctaLabel && ctaUrl
            ? `<div style="margin:24px 0 8px;">
                 <a href="${ctaUrl}" style="display:inline-block;background:#6b0a1f;color:#fff;text-decoration:none;padding:12px 22px;border-radius:10px;font-weight:600;font-size:14px;">${ctaLabel}</a>
               </div>`
            : ""
        }
      </div>
      <p style="text-align:center;color:#9a9aa2;font-size:12px;margin:18px 0 0;">
        ${footerNote ?? "Oryx Events · This is an automated message, please do not reply."}
      </p>
    </div>
  </body>
</html>`;
}

// Small helper to render a label/value row table used across templates.
export function detailRows(rows: Array<[string, string]>) {
  return `<table style="width:100%;border-collapse:collapse;font-size:14px;">
    ${rows
      .map(
        ([k, v]) => `<tr>
          <td style="padding:8px 0;color:#9a9aa2;width:42%;">${k}</td>
          <td style="padding:8px 0;color:#1a1a1f;font-weight:600;">${v}</td>
        </tr>`,
      )
      .join("")}
  </table>`;
}
