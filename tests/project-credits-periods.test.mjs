import { test } from "node:test";
import assert from "node:assert/strict";
import { groupParticipationPeriods } from "../src/ui/screens/credits/participationPeriods.ts";

const participation = (semester, roles = ["Orientador"], contribution = null, course = null) => ({
  semester, roles, contribution, course,
});

test("merges consecutive semesters with the same role", () => {
  const periods = groupParticipationPeriods([
    participation("2026.2"), participation("2025.2"), participation("2026.1"),
  ]);
  assert.equal(periods.length, 1);
  assert.equal(periods[0].startSemester, "2025.2");
  assert.equal(periods[0].endSemester, "2026.2");
  assert.deepEqual(periods[0].roles, ["Orientador"]);
});

test("keeps gaps and role changes as separate periods", () => {
  const periods = groupParticipationPeriods([
    participation("2025.1"), participation("2026.1"),
    participation("2026.2", ["Desenvolvedor"]),
  ]);
  assert.deepEqual(periods.map((period) => [period.startSemester, period.endSemester]), [
    ["2025.1", "2025.1"], ["2026.1", "2026.1"], ["2026.2", "2026.2"],
  ]);
});

test("retains distinct contributions when grouping and removes repeated text", () => {
  const periods = groupParticipationPeriods([
    participation("2025.2", ["Orientador"], "Supervisão"),
    participation("2026.1", ["Orientador"], "Supervisão"),
    participation("2026.2", ["Orientador"], "Revisão"),
  ]);
  assert.equal(periods.length, 1);
  assert.deepEqual(periods[0].contributions, ["Supervisão", "Revisão"]);
});

test("does not merge different courses or unknown semester identifiers", () => {
  const periods = groupParticipationPeriods([
    participation("2025.1", ["Orientador"], null, "DSM"),
    participation("2025.2", ["Orientador"], null, "ADS"),
    participation("unknown"),
  ]);
  assert.equal(periods.length, 3);
});

test("does not mutate data returned by the API", () => {
  const source = [participation("2026.1"), participation("2025.2")];
  groupParticipationPeriods(source);
  assert.equal(source[0].semester, "2026.1");
});
