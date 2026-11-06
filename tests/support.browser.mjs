// Run against Vite: npm run dev, then BROWSER_PATH=/usr/bin/chromium npm run test:support:browser.
// API fixtures are isolated to this test; no real student data is used.
import { chromium } from "playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({
  ...(process.env.BROWSER_PATH
    ? { executablePath: process.env.BROWSER_PATH }
    : { channel: process.env.BROWSER_CHANNEL || "chrome" }),
  headless: true,
});
const context = await browser.newContext({
  viewport: { width: 390, height: 844 },
  serviceWorkers: "block",
});
await context.addInitScript(() =>
  localStorage.setItem("token", "test-student"),
);
const page = await context.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
const base = process.env.TEST_URL || "http://127.0.0.1:5173";
const ticket = {
  id: "ticket-1",
  protocol: "SUP-2026-001",
  category: "DATA",
  subject: "Correção do nome cadastrado",
  status: "OPEN",
  version: 1,
  unread: true,
  createdAt: "2026-11-05T13:00:00Z",
  requestedField: "NAME",
  proposedValue: "Nome atualizado",
  eventId: null,
  certificateId: null,
};
let mode = "normal",
  posts = [],
  release,
  actionPosts = [];
let messages = [
  {
    id: "m1",
    authorRole: "STUDENT",
    body: "Preciso corrigir meu nome cadastrado na carteirinha.",
    createdAt: ticket.createdAt,
  },
  {
    id: "m2",
    authorRole: "SECRETARY",
    body: "Recebemos sua solicitação e vamos conferir o cadastro.",
    createdAt: ticket.createdAt,
  },
];
await page.route("**/*", async (route) => {
  const url = new URL(route.request().url());
  if (url.origin === new URL(base).origin) return route.continue();
  const path = url.pathname;
  if (
    path.endsWith("/support/tickets") &&
    route.request().method() === "POST"
  ) {
    posts.push(route.request().postDataJSON());
    await new Promise((resolve) => {
      release = resolve;
    });
    return route.fulfill(
      mode === "create-error"
        ? {
            status: 400,
            json: { message: "Não foi possível registrar. Tente novamente." },
          }
        : { status: 201, json: ticket },
    );
  }
  if (path.endsWith("/support/tickets/me")) {
    if (mode === "list-error")
      return route.fulfill({
        status: 500,
        json: { message: "Falha ao consultar solicitações." },
      });
    if (mode === "loading")
      await new Promise((resolve) => {
        release = resolve;
      });
    return route.fulfill({
      json: {
        items:
          mode === "empty" || url.searchParams.has("status")
            ? []
            : [
                url.searchParams.has("cursor")
                  ? {
                      ...ticket,
                      id: "ticket-2",
                      protocol: "SUP-2026-002",
                      subject: "Segunda solicitação",
                    }
                  : ticket,
              ],
        nextCursor: url.searchParams.has("cursor") ? null : "page2",
      },
    });
  }
  if (path.includes("/support/tickets/ticket-")) {
    if (route.request().method() === "POST") {
      if (!path.endsWith("/read"))
        actionPosts.push({ path, body: route.request().postDataJSON() });
      if (path.endsWith("/messages"))
        messages.push({
          id: "m3",
          authorRole: "STUDENT",
          body: route.request().postDataJSON().message,
          createdAt: ticket.createdAt,
        });
      return route.fulfill({ json: {} });
    }
    return route.fulfill({
      json: {
        ticket,
        messages: url.searchParams.has("cursor")
          ? [{ ...messages[0], id: "older", body: "Descrição anterior" }]
          : messages,
        messageNextCursor: url.searchParams.has("cursor") ? null : "older",
      },
    });
  }
  if (path.includes("profile"))
    return route.fulfill({
      json: { id: 1, name: "Aluno de Teste", photoStatus: "APPROVED" },
    });
  return route.fulfill({ json: [] });
});
const screenshot = async (name) => {
  if (process.env.SCREENSHOT_DIR) {
    await mkdir(process.env.SCREENSHOT_DIR, { recursive: true });
    await page.screenshot({
      path: `${process.env.SCREENSHOT_DIR}/${name}.png`,
      fullPage: true,
    });
  }
};
const fits = async () =>
  assert.equal(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
    true,
  );
try {
  await page.goto(base + "/MainMenu");
  await page
    .getByRole("button", { name: "Solicitações", exact: true })
    .waitFor();
  await fits();
  await screenshot("menu-mobile");
  await page.getByRole("button", { name: "Informações da Unidade" }).click();
  await page.getByRole("heading", { name: "Informações da Unidade" }).waitFor();
  assert.equal(await page.getByText("Suporte da carteirinha").count(), 0);
  await page.getByRole("heading", { name: "Contatos", exact: true }).waitFor();
  await page.getByRole("link", { name: "Voltar ao menu" }).click();
  await page.getByRole("button", { name: "Solicitações", exact: true }).click();
  await page
    .getByRole("heading", { name: "Minhas Solicitações", exact: true })
    .waitFor();
  await page.getByRole("link", { name: /Correção do nome/ }).waitFor();
  await fits();
  await screenshot("list-mobile");
  await page
    .getByRole("button", { name: "Carregar mais solicitações" })
    .click();
  await page.getByRole("heading", { name: "Segunda solicitação" }).waitFor();
  await page.getByLabel("Filtrar por situação").selectOption("RESOLVED");
  await page
    .getByRole("heading", { name: "Nenhuma solicitação nesta situação" })
    .waitFor();
  await page.getByRole("button", { name: "Limpar filtro" }).click();
  await page.getByRole("link", { name: /Correção do nome/ }).click();
  await page.getByRole("heading", { name: "Acompanhamento" }).waitFor();
  await fits();
  await screenshot("detail-mobile");
  await page.getByText("Informações da solicitação", { exact: true }).click();
  await page.getByText("Informação proposta: Nome atualizado").waitFor();
  await page.getByRole("button", { name: "Mensagens anteriores" }).click();
  await page.getByText("Descrição anterior", { exact: true }).waitFor();
  await page
    .getByLabel("Sua mensagem", { exact: true })
    .fill("Obrigada pelo retorno.");
  await page
    .getByRole("button", { name: "Enviar mensagem", exact: true })
    .click();
  await page.getByText("Obrigada pelo retorno.", { exact: true }).waitFor();
  assert.equal(actionPosts[0].body.expectedVersion, 1);
  await page.getByRole("button", { name: "Outras ações" }).click();
  await page
    .getByLabel("Motivo para cancelar ou excluir")
    .fill("Não preciso mais do atendimento.");
  await page
    .getByRole("button", { name: "Cancelar solicitação", exact: true })
    .click();
  await page.getByRole("dialog").waitFor();
  await page.getByRole("button", { name: "Voltar", exact: true }).click();
  assert.equal(actionPosts.length, 1);
  await page.setViewportSize({ width: 1280, height: 900 });
  await fits();
  await screenshot("detail-desktop");
  await page
    .getByRole("link", { name: "Minhas solicitações", exact: true })
    .click();
  await page
    .getByRole("button", { name: "Nova solicitação", exact: true })
    .click();
  await page
    .getByLabel("Assunto *", { exact: true })
    .fill("Correção do nome cadastrado");
  await page
    .getByLabel("Descrição do problema *", { exact: true })
    .fill("Preciso corrigir meu nome cadastrado na carteirinha.");
  await page
    .getByLabel("Informação a conferir (opcional)")
    .selectOption("NAME");
  await page
    .getByLabel("Informação correta proposta (opcional)")
    .fill("Nome atualizado");
  await screenshot("create-desktop");
  await page.setViewportSize({ width: 390, height: 844 });
  await fits();
  await screenshot("create-mobile");
  mode = "create-error";
  await page.locator("form").evaluate((form) => {
    form.requestSubmit();
    form.requestSubmit();
  });
  await page.getByRole("button", { name: "Enviando solicitação…" }).waitFor();
  await page.waitForFunction(
    () => document.querySelector("fieldset")?.disabled,
  );
  assert.equal(posts.length, 1);
  assert.equal(await page.getByRole("dialog").count(), 0);
  release();
  await page.getByRole("alert").waitFor();
  assert.equal(
    await page.getByLabel("Assunto *", { exact: true }).inputValue(),
    ticket.subject,
  );
  assert.equal(await page.getByRole("dialog").count(), 0);
  mode = "normal";
  await page
    .getByRole("button", { name: "Enviar solicitação", exact: true })
    .click();
  await page.waitForTimeout(100);
  assert.equal(posts.length, 2);
  assert.equal(posts[0].requestId, posts[1].requestId);
  assert.equal(posts[1].requestedField, "NAME");
  assert.equal(posts[1].proposedValue, "Nome atualizado");
  release();
  await page
    .getByRole("heading", {
      name: "Solicitação criada com sucesso!",
      exact: true,
    })
    .waitFor();
  await fits();
  await screenshot("success-mobile");
  await page
    .getByRole("button", { name: "Ver solicitação", exact: true })
    .click();
  await page.getByRole("heading", { name: "Acompanhamento" }).waitFor();
  await page
    .getByRole("link", { name: "Minhas solicitações", exact: true })
    .click();
  await page.getByRole("link", { name: /Correção do nome/ }).waitFor();
  await page.setViewportSize({ width: 1280, height: 900 });
  await fits();
  await screenshot("list-desktop");
  mode = "empty";
  await page.reload();
  await page
    .getByRole("heading", { name: "Você ainda não tem solicitações" })
    .waitFor();
  mode = "list-error";
  await page.reload();
  await page.getByRole("alert").waitFor();
  mode = "normal";
  await page.getByRole("button", { name: "Tentar novamente" }).click();
  await page.getByRole("link", { name: /Correção do nome/ }).waitFor();
  mode = "loading";
  await page.reload();
  await page.getByText("Carregando solicitações…", { exact: true }).waitFor();
  release();
  await page.getByRole("link", { name: /Correção do nome/ }).waitFor();
  assert.deepEqual(errors, []);
  console.log(
    "PASS: navigation, responsive layouts, list/filter/pagination/states, details/history/reply, confirmation, create failure/retry/idempotency/success.",
  );
} finally {
  await browser.close();
}
