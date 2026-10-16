import type { ProjectCreditParticipation } from "../../../domains/ProjectCredits";

/** A chronological interval with the same role and course throughout. */
export interface ParticipationPeriod {
  startSemester: string;
  endSemester: string;
  course?: string | null;
  roles: string[];
  contributions: string[];
}

function semesterIndex(semester: string): number | null {
  const match = /^(\d{4})\.([12])$/.exec(semester);
  if (!match) return null;
  return Number(match[1]) * 2 + Number(match[2]) - 1;
}

function sameRoleAndCourse(
  period: ParticipationPeriod,
  participation: ProjectCreditParticipation,
): boolean {
  if ((period.course ?? "") !== (participation.course ?? "")) return false;
  const left = [...period.roles].sort();
  const right = [...participation.roles].sort();
  return left.length === right.length && left.every((role, index) => role === right[index]);
}

/** Groups consecutive semesters; a gap or change of role/course starts a new interval. */
export function groupParticipationPeriods(
  participations: ProjectCreditParticipation[],
): ParticipationPeriod[] {
  const sorted = [...participations].sort((left, right) => {
    const leftIndex = semesterIndex(left.semester);
    const rightIndex = semesterIndex(right.semester);
    if (leftIndex !== null && rightIndex !== null) return leftIndex - rightIndex;
    if (leftIndex !== null) return -1;
    if (rightIndex !== null) return 1;
    return left.semester.localeCompare(right.semester);
  });

  const periods: ParticipationPeriod[] = [];
  for (const participation of sorted) {
    const previous = periods[periods.length - 1];
    const previousIndex = previous ? semesterIndex(previous.endSemester) : null;
    const currentIndex = semesterIndex(participation.semester);
    const contribution = participation.contribution?.trim();

    if (
      previous &&
      previousIndex !== null &&
      currentIndex !== null &&
      currentIndex === previousIndex + 1 &&
      sameRoleAndCourse(previous, participation)
    ) {
      previous.endSemester = participation.semester;
      if (contribution && !previous.contributions.includes(contribution)) {
        previous.contributions.push(contribution);
      }
    } else {
      periods.push({
        startSemester: participation.semester,
        endSemester: participation.semester,
        course: participation.course,
        roles: [...participation.roles],
        contributions: contribution ? [contribution] : [],
      });
    }
  }

  return periods;
}
