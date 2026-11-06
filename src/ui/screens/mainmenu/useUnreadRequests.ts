import { useEffect, useState } from "react";
import { apiClient } from "../../../api/config/apiClient";

type TicketPage = {
  items: { id: string; unread: boolean }[];
  nextCursor: string | null;
};

/** Count tickets, not messages: unread is the server's per-ticket read marker. */
export async function countUnreadRequests(
  signal: AbortSignal,
): Promise<number> {
  const seenTickets = new Set<string>();
  const seenCursors = new Set<string>();
  let cursor: string | null = null;
  let count = 0;
  do {
    signal.throwIfAborted();
    const response = await apiClient(
      "/support/tickets/me?limit=100" +
        (cursor ? "&cursor=" + encodeURIComponent(cursor) : ""),
      {
        authenticated: true,
        cache: "no-store",
        signal,
      },
    );
    if (!response.ok)
      throw new Error("Não foi possível consultar atualizações.");
    const page = (await response.json()) as TicketPage;
    for (const ticket of page.items) {
      if (!seenTickets.has(ticket.id) && ticket.unread) count++;
      seenTickets.add(ticket.id);
    }
    // The UI displays 99+; no need to fetch further pages after that threshold.
    if (count > 99) return 100;
    cursor = page.nextCursor;
    if (cursor && seenCursors.has(cursor)) throw new Error("Cursor repetido.");
    if (cursor) seenCursors.add(cursor);
  } while (cursor);
  return count;
}

export default function useUnreadRequests() {
  const [count, setCount] = useState<number | null>(null);
  useEffect(() => {
    let controller: AbortController | null = null;
    let active = true;
    let pending = false;
    const refresh = async () => {
      if (pending || document.visibilityState === "hidden") return;
      const token = localStorage.getItem("token");
      if (!token) {
        setCount(null);
        return;
      }
      pending = true;
      controller = new AbortController();
      try {
        const value = await countUnreadRequests(controller.signal);
        if (active)
          setCount(token === localStorage.getItem("token") ? value : null);
      } catch {
        if (active) setCount(null); // Unknown is not zero; never show a stale count.
      } finally {
        pending = false;
      }
    };
    const sessionChanged = (event: StorageEvent) => {
      if (event.key !== "token" && event.key !== null) return;
      controller?.abort();
      setCount(null);
      void refresh();
    };
    void refresh();
    const timer = window.setInterval(() => void refresh(), 60000);
    window.addEventListener("focus", refresh);
    window.addEventListener("online", refresh);
    window.addEventListener("storage", sessionChanged);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      active = false;
      controller?.abort();
      window.clearInterval(timer);
      window.removeEventListener("focus", refresh);
      window.removeEventListener("online", refresh);
      window.removeEventListener("storage", sessionChanged);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  return count;
}
