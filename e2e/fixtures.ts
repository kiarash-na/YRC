import { test as base, expect, type Page } from "@playwright/test";

import { E2E_SECRET } from "../playwright.config";

/** A test whose browser carries the e2e admin cookie. */
export const test = base.extend({
  context: async ({ context, baseURL }, provide) => {
    await context.addCookies([{ name: "yrc-e2e", value: E2E_SECRET, url: baseURL! }]);
    await provide(context);
  },
});

export { expect };

/** A 1×1 PNG, for upload tests and fake ImageKit image responses. */
export const PNG = Buffer.from(
  "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8z8AARwMB/1g2tL8AAAAASUVORK5CYII=",
  "base64",
);

/**
 * Intercept ImageKit: uploads get a fake success response (recording the
 * request), and image URLs get a tiny PNG, so nothing leaves the machine.
 */
export async function mockImageKit(page: Page, filePath: string) {
  const uploads: { body: string }[] = [];
  await page.route("https://upload.imagekit.io/**", async (route) => {
    uploads.push({ body: route.request().postDataBuffer()?.toString("latin1") ?? "" });
    await route.fulfill({
      status: 200,
      contentType: "application/json",
      body: JSON.stringify({
        fileId: "e2e-file-id",
        name: filePath.split("/").pop(),
        filePath,
        url: `https://ik.imagekit.io/e2e${filePath}`,
        fileType: "image",
        size: PNG.length,
        width: 1,
        height: 1,
      }),
    });
  });
  await page.route("https://ik.imagekit.io/**", (route) =>
    route.request().resourceType() === "image"
      ? route.fulfill({ status: 200, contentType: "image/png", body: PNG })
      : route.continue(),
  );
  return uploads;
}
