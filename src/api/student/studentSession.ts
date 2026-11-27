export type StudentSession = {
  token: string;
  ra: string;
  owner: string;
  expiresAt?: number;
};
export function studentSession(token: string | null): StudentSession | null {
  if (!token) return null;
  try {
    const segment = token.split('.')[1];
    const value = JSON.parse(
      atob(segment.replace(/-/g, '+').replace(/_/g, '/')),
    );
    if (
      typeof value.sub !== 'string' ||
      !value.sub ||
      (value.role !== undefined && value.role !== 'student')
    )
      return null;
    if (
      value.exp !== undefined &&
      (typeof value.exp !== 'number' ||
        !Number.isFinite(value.exp) ||
        value.exp * 1000 <= Date.now())
    )
      return null;
    return {
      token,
      ra: value.sub,
      owner: JSON.stringify([value.sub, value.accountId ?? null]),
      expiresAt: typeof value.exp === 'number' ? value.exp * 1000 : undefined,
    };
  } catch {
    return null;
  }
}
