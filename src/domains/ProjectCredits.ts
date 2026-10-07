export type ProjectCreditContactKind =
  | "github"
  | "linkedin"
  | "portfolio"
  | "email"
  | "external";

export interface ProjectCreditContact {
  kind: ProjectCreditContactKind;
  label: string;
  href: string;
}

export interface ProjectCreditParticipation {
  semester: string;
  course?: string | null;
  roles: string[];
  contribution?: string | null;
}

export interface ProjectCreditContributor {
  id: string;
  name: string;
  photoUrl?: string | null;
  participations: ProjectCreditParticipation[];
  contacts: ProjectCreditContact[];
}

export interface ProjectCreditsResponse {
  contributors: ProjectCreditContributor[];
}
