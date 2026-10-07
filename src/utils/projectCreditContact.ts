import type { ProjectCreditContact } from "../domains/ProjectCredits";

const EMAIL_HREF = /^mailto:[^\s@]+@[^\s@]+\.[^\s@]+$/i;
const LINKEDIN_HOSTS = new Set(["linkedin.com", "www.linkedin.com"]);

export function isApprovedProjectCreditHref(
  contact: ProjectCreditContact,
): boolean {
  if (contact.kind === "email") return EMAIL_HREF.test(contact.href);

  let url: URL;
  try {
    url = new URL(contact.href);
  } catch {
    return false;
  }

  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.search ||
    url.hash
  ) {
    return false;
  }

  if (contact.kind === "portfolio") return url.protocol === "https:";

  if (contact.kind === "github") {
    return (
      url.hostname === "github.com" &&
      url.pathname.split("/").filter(Boolean).length === 1
    );
  }

  return (
    contact.kind === "linkedin" &&
    LINKEDIN_HOSTS.has(url.hostname) &&
    url.pathname.startsWith("/in/")
  );
}
