import { useEffect, useSyncExternalStore } from 'react';
import { studentProfileResource as resource } from '../api/student/profileResource';
import { studentSession } from '../api/student/studentSession';
export default function useStudentProfile(revalidateOnMount = false) {
  const snapshot = useSyncExternalStore(
    resource.subscribe,
    resource.getSnapshot,
  );
  useEffect(() => {
    const refresh = () => {
      void resource.refresh(true);
    };
    const visible = () => {
      if (document.visibilityState !== 'hidden') refresh();
    };
    const invalidate = () => resource.invalidate();
    void resource.refresh(revalidateOnMount);
    window.addEventListener('focus', refresh);
    window.addEventListener('online', refresh);
    window.addEventListener('offline', refresh);
    window.addEventListener('storage', refresh);
    window.addEventListener('student:profile-invalidated', invalidate);
    document.addEventListener('visibilitychange', visible);
    const interval = window.setInterval(visible, 60000);
    const expiresAt = studentSession(snapshot.token)?.expiresAt;
    const expiry = expiresAt
      ? window.setTimeout(
          refresh,
          Math.min(2147483647, Math.max(0, expiresAt - Date.now() + 1)),
        )
      : undefined;
    return () => {
      window.removeEventListener('focus', refresh);
      window.removeEventListener('online', refresh);
      window.removeEventListener('offline', refresh);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('student:profile-invalidated', invalidate);
      document.removeEventListener('visibilitychange', visible);
      window.clearInterval(interval);
      window.clearTimeout(expiry);
    };
  }, [snapshot.token, revalidateOnMount]);
  return snapshot;
}
