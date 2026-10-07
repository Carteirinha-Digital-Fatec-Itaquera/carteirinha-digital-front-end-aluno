export type ProjectCreditContactKind =
  | "github"
  | "linkedin"
  | "portfolio"
  | "email";

export interface ProjectCreditContact {
  kind: ProjectCreditContactKind;
  label: string;
  href: string;
}

export interface ProjectCreditParticipation {
  semester: string;
  roles: string[];
  contribution?: string;
}

export interface ProjectCreditContributor {
  id: string;
  name: string;
  participations: ProjectCreditParticipation[];
  contacts: ProjectCreditContact[];
}

export interface ProjectCreditsResponse {
  contributors: ProjectCreditContributor[];
}
