import type { Student } from '../../domains/Student';
import type { ApiError } from '../../utils/Types';
import { findProfile } from './findProfile';
import { studentSession } from './studentSession';
export type ProfileSnapshot = {
  token: string | null;
  data?: Student;
  availability: 'loading' | 'ready' | 'unavailable';
  expired: boolean;
};
type Options = {
  token: () => string | null;
  fetch: (signal: AbortSignal) => Promise<Student | ApiError>;
  online: () => boolean;
  save?: (student: Student, owner: string) => void;
  expire?: () => void;
};
export function createProfileResource(options: Options) {
  let snapshot: ProfileSnapshot = {
    token: null,
    availability: 'loading',
    expired: false,
  };
  let controller: AbortController | undefined;
  let pending: Promise<void> | undefined;
  let confirmedAt = 0;
  let generation = 0;
  const listeners = new Set<() => void>();
  const emit = () => listeners.forEach((fn) => fn());
  const getSnapshot = () => {
    const token = options.token(),
      session = studentSession(token);
    if (snapshot.token !== token || snapshot.expired !== !session) {
      controller?.abort();
      generation++;
      pending = undefined;
      confirmedAt = 0;
      snapshot = { token, availability: 'loading', expired: !session };
    }
    return snapshot;
  };
  const refresh = (force = false) => {
    const current = getSnapshot(),
      session = studentSession(current.token);
    if (!session) {
      if (current.token) {
        options.expire?.();
        snapshot = {
          token: options.token(),
          availability: 'unavailable',
          expired: true,
        };
      }
      emit();
      return Promise.resolve();
    }
    if (pending) return pending;
    if (
      !force &&
      current.availability === 'ready' &&
      Date.now() - confirmedAt < 30000
    )
      return Promise.resolve();
    if (!options.online()) {
      snapshot = { ...current, availability: 'unavailable' };
      emit();
      return Promise.resolve();
    }
    controller = new AbortController();
    const active = controller;
    const version = ++generation;
    if (!current.data) {
      snapshot = { ...current, availability: 'loading' };
      emit();
    }
    pending = (async () => {
      try {
        const result = await options.fetch(active.signal);
        if (
          active.signal.aborted ||
          version !== generation ||
          options.token() !== session.token
        )
          return;
        if ('code' in result) {
          if (String(result.status) === '401') {
            options.expire?.();
            snapshot = {
              token: options.token(),
              availability: 'unavailable',
              expired: true,
            };
          } else snapshot = { ...current, availability: 'unavailable' };
        } else if (result.ra !== session.ra) {
          snapshot = {
            token: session.token,
            availability: 'unavailable',
            expired: false,
          };
        } else {
          const data = {
            ...result,
            rejectionReason:
              result.photoStatus === 'REJECTED' &&
              typeof result.rejectionReason === 'string' &&
              result.rejectionReason.trim()
                ? result.rejectionReason
                : null,
          };
          snapshot = {
            token: session.token,
            data,
            availability: 'ready',
            expired: false,
          };
          confirmedAt = Date.now();
          options.save?.(data, session.owner);
        }
      } catch {
        if (
          !active.signal.aborted &&
          version === generation &&
          options.token() === session.token
        )
          snapshot = { ...current, availability: 'unavailable' };
      } finally {
        if (version === generation) {
          pending = undefined;
          emit();
        }
      }
    })();
    return pending;
  };
  const invalidate = () => {
    getSnapshot();
    controller?.abort();
    generation++;
    pending = undefined;
    confirmedAt = 0;
    snapshot = { ...snapshot, availability: 'loading' };
    emit();
  };
  return {
    getSnapshot,
    refresh,
    invalidate,
    subscribe: (fn: () => void) => {
      listeners.add(fn);
      return () => {
        listeners.delete(fn);
      };
    },
  };
}
const storage = () => {
  try {
    return localStorage.getItem('token');
  } catch {
    return null;
  }
};
export const studentProfileResource = createProfileResource({
  token: storage,
  fetch: (signal) => findProfile(signal),
  online: () => navigator.onLine,
  save: (data) => {
    try {
      localStorage.setItem('@Carteirinha:profile', JSON.stringify(data));
    } catch {
      /* Memory remains usable. */
    }
  },
  expire: () => {
    for (const key of [
      'token',
      '@Carteirinha:profile',
      '@Carteirinha:photoOffline',
    ]) {
      try {
        localStorage.removeItem(key);
      } catch {
        /* Session already unavailable. */
      }
    }
  },
});
