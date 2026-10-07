import type { ProjectCreditContact } from "../domains/ProjectCredits";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isApprovedProjectCreditHref(
  contact: ProjectCreditContact,
): boolean {
  if (!contact || !contact.href || typeof contact.href !== "string") {
    return false;
  }

  // Reject CRLF characters
  if (/[\r\n]/.test(contact.href) || (contact.label && /[\r\n]/.test(contact.label))) {
    return false;
  }

  if (contact.kind === "email") {
    let raw = contact.href.trim();
    if (raw.toLowerCase().startsWith("mailto:")) {
      raw = raw.slice(7);
    }
    return EMAIL_REGEX.test(raw);
  }

  let url: URL;
  try {
    url = new URL(contact.href.trim());
  } catch {
    return false;
  }

  // Only allow HTTPS protocol
  if (url.protocol !== "https:") {
    return false;
  }

  // Reject embedded credentials
  if (url.username || url.password) {
    return false;
  }

  // Disallow forbidden protocols/schemes (e.g. javascript:, data:, file: - already prevented by protocol === https:)
  return true;
}

