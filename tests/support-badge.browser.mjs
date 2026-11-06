import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
  ...(process.env.BROWSER_PATH
    ? { executablePath: process.env.BROWSER_PATH }
    : { channel: "chrome" }),
  headless: true,
});
const context = await browser.newContext({ serviceWorkers: "block" });
await context.addInitScript(() => {
  if (!localStorage.getItem("token"))
    localStorage.setItem("token", "student-a");
});
const page = await context.newPage();
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
let unread = 0,
  fail = false,
  reads = 0,
  pages = 0;
const read = new Set();
const ticket = (id) => ({
  id,
  protocol: id,
  subject: "Solicitação de teste",
  category: "DATA",
  status: "OPEN",
  version: 2,
  createdAt: "2026-11-05T10:00:00Z",
  unread: !read.has(id),
});
await page.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.origin === base) return route.continue();
  if (url.pathname.endsWith("/support/tickets/me")) {
    pages++;
    if (fail)
      return route.fulfill({ status: 500, json: { message: "Indisponível" } });
    const count =
      route.request().headers().authorization === "Bearer student-b"
        ? 0
        : unread;
    const start = url.searchParams.has("cursor") ? 2 : 0;
    const end = start ? count : Math.min(2, count);
    return route.fulfill({
      json: {
        items: [...Array(Math.max(0, end - start))].map((_, i) =>
          ticket("t" + (start + i)),
        ),
        nextCursor: count > 2 && !start ? "next" : null,
      },
    });
  }
  if (url.pathname.endsWith("/read")) {
    reads++;
    read.add("t0");
    return route.fulfill({ json: {} });
  }
  if (url.pathname.endsWith("/support/tickets/t0"))
    return route.fulfill({
      json: { ticket: ticket("t0"), messages: [], messageNextCursor: null },
    });
  if (url.pathname.includes("profile"))
    return route.fulfill({
      json: { id: 1, name: "Teste", photoStatus: "APPROVED" },
    });
  return route.fulfill({ json: [] });
});
const card = () => page.getByRole("button", { name: /^Solicitações/ });
try {
  for (const n of [0, 1, 3, 100]) {
    unread = n;
    pages = 0;
    await page.goto(base + "/MainMenu");
    if (n)
      await page
        .getByRole("button", {
          name: `Solicitações: ${n > 99 ? "mais de 99" : n} com atualizações não lidas`,
          exact: true,
        })
        .waitFor();
    else {
      await page.waitForResponse((r) =>
        r.url().includes("/support/tickets/me"),
      );
      assert.equal(await card().locator("span").count(), 0);
    }
    if (n > 2) assert.ok(pages >= 2);
    if (n)
      assert.equal(
        await card().locator("span").innerText(),
        n > 99 ? "99+" : String(n),
      );
  }
  unread = 1;
  await page.reload();
  await page
    .getByRole("button", { name: "Solicitações: 1 com atualizações não lidas" })
    .waitFor();
  await card().click();
  await page.getByRole("link", { name: /Solicitação de teste/ }).waitFor();
  assert.equal(reads, 0);
  await page.getByRole("link", { name: /Solicitação de teste/ }).click();
  await page.waitForResponse((r) => r.url().endsWith("/read"));
  assert.equal(reads, 1);
  await page.goto(base + "/MainMenu");
  await page.waitForResponse((r) => r.url().includes("/support/tickets/me"));
  assert.equal(await card().locator("span").count(), 0);
  await page.reload();
  await page.waitForResponse((r) => r.url().includes("/support/tickets/me"));
  assert.equal(await card().locator("span").count(), 0);
  read.clear();
  unread = 3;
  await page.evaluate(() => localStorage.setItem("token", "student-b"));
  await page.reload();
  await page.waitForResponse((r) => r.url().includes("/support/tickets/me"));
  assert.equal(await card().locator("span").count(), 0);
  await page.evaluate(() => localStorage.setItem("token", "student-a"));
  fail = true;
  await page.reload();
  await page.waitForResponse((r) => r.url().includes("/support/tickets/me"));
  assert.equal(await card().locator("span").count(), 0);
  fail = false;
  await page.reload();
  await page
    .getByRole("button", { name: "Solicitações: 3 com atualizações não lidas" })
    .waitFor();
  for (const width of [390, 768, 1280]) {
    await page.setViewportSize({ width, height: 900 });
    const info = await page
      .getByRole("button", { name: "Informações da Unidade", exact: true })
      .boundingBox();
    const other = await card().boundingBox();
    assert.ok(Math.abs(info.width - other.width) < 1);
    assert.ok(Math.abs(info.height - other.height) < 1);
    assert.ok(Math.abs(info.x + info.width / 2 - width / 2) < 1);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
      true,
    );
    if (process.env.SCREENSHOT_DIR)
      await page.screenshot({
        path: `${process.env.SCREENSHOT_DIR}/menu-badge-${width}.png`,
        fullPage: true,
      });
  }
  console.log(
    "PASS: zero/one/multiple/99+, pagination, persistent read, list does not mark read, user isolation, error, responsive size and centering.",
  );
} finally {
  await browser.close();
}
