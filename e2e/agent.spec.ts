import { expect, mockImageKit, PNG, test } from "./fixtures";

/**
 * The admin Agent end to end: browser → server action → tool loop → tools,
 * on the scripted mock model (src/lib/agent/e2e-fixtures.ts). No tokens.
 */

const composer = (page: import("@playwright/test").Page) => page.getByPlaceholder("Ask the Agent…");

async function ask(page: import("@playwright/test").Page, text: string) {
  await composer(page).fill(text);
  await composer(page).press("Enter");
}

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/agent");
  await expect(page.getByRole("heading", { name: "Agent" })).toBeVisible();
});

test("answers using a read-only tool, with no confirmation", async ({ page }) => {
  await ask(page, "show me the upcoming events");
  await expect(page.getByText("Upcoming events:")).toBeVisible();
  await expect(page.getByRole("link", { name: "/events/loop-of-love" })).toBeVisible();
  await expect(page.getByText("list events", { exact: true })).toBeVisible(); // tool chip
  await expect(page.getByText(/Confirm (this change|\d changes)/)).toHaveCount(0);
});

test("asks before a change and runs it on Confirm", async ({ page }) => {
  await ask(page, 'create an event called "E2E Night Run"');
  const card = page.getByText("Confirm this change").locator("..");
  await expect(card.getByText('Create event "E2E Night Run"')).toBeVisible();
  await expect(composer(page)).toHaveCount(0); // placeholder switches while waiting

  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("E2E Night Run").last()).toBeVisible();
  await expect(page.getByRole("link", { name: "/events/e2e-night-run" })).toBeVisible();
  await expect(page.getByText("Confirm this change")).toHaveCount(0);
});

test("Cancel declines the change and the model is told", async ({ page }) => {
  await ask(page, 'create an event called "Never Made"');
  await page.getByRole("button", { name: "Cancel" }).click();
  await expect(page.getByText("Okay, I didn't run create_event.")).toBeVisible();
  await expect(page.getByRole("link", { name: "/events/never-made" })).toHaveCount(0);
});

test("approving only one of two changes", async ({ page }) => {
  await ask(page, "make two changes");
  await expect(page.getByText("Confirm 2 changes")).toBeVisible();
  await page.getByRole("button", { name: "Only this" }).first().click();
  await expect(page.getByRole("link", { name: "/events/alpha-run" })).toBeVisible();
  await expect(page.getByText("Okay, I didn't run create_event.")).toBeVisible();
});

test("the model picker reaches the server and is remembered", async ({ page }) => {
  const picker = page.getByLabel("Model");
  await expect(picker).toHaveValue("anthropic/claude-haiku-5.5");
  for (const id of ["google/gemini-3.8-flash", "deepseek/deepseek-v4.1-flash", "deepseek/deepseek-v4-pro"]) {
    await picker.selectOption(id);
    await ask(page, "which model are you?");
    await expect(page.getByText(`Running on ${id}.`)).toBeVisible();
  }
  await page.reload();
  await expect(page.getByLabel("Model")).toHaveValue("deepseek/deepseek-v4-pro");
});

test("a model failure shows an error and keeps the chat usable", async ({ page }) => {
  await ask(page, "crash please");
  await expect(page.getByText("The agent failed. Check the server logs.")).toBeVisible();
  await ask(page, "which model are you?");
  await expect(page.getByText(/^Running on /)).toBeVisible();
});

test("New chat clears the conversation", async ({ page }) => {
  await ask(page, "hello");
  await expect(page.getByText(/^Mock agent\./)).toBeVisible();
  await page.getByRole("button", { name: "New chat" }).click();
  await expect(page.getByText(/^Mock agent\./)).toHaveCount(0);
});

test("uploading an image puts its ImageKit path into the message", async ({ page }) => {
  const uploads = await mockImageKit(page, "/YRC/Events/agent-cover_e2e.png");
  await page.getByTestId("agent-image-file").setInputFiles({ name: "cover.png", mimeType: "image/png", buffer: PNG });
  await expect(composer(page)).toHaveValue(/\/YRC\/Events\/agent-cover_e2e\.png/);
  expect(uploads).toHaveLength(1);
  expect(uploads[0].body).toContain("public_e2e_dummy");
  expect(uploads[0].body).toContain('name="signature"');
});

test.describe("without the e2e cookie", () => {
  test("the admin area still requires login", async ({ browser, baseURL }) => {
    const context = await browser.newContext({ baseURL });
    const page = await context.newPage();
    await page.goto("/admin/agent");
    await expect(page).toHaveURL(/\/login\?next=%2Fadmin%2Fagent/);
    await context.close();
  });
});
