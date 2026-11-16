import { expect, mockImageKit, PNG, test } from "./fixtures";

/** Event cover upload: signed token from the server, file straight to ImageKit (intercepted). */

test.beforeEach(async ({ page }) => {
  await page.goto("/admin/events/new");
  await expect(page.getByText("New event")).toBeVisible();
});

test("uploads a cover and fills in its path", async ({ page }) => {
  const uploads = await mockImageKit(page, "/YRC/Events/night-run_e2e.png");
  await page.getByTestId("cover-file").setInputFiles({ name: "night-run.png", mimeType: "image/png", buffer: PNG });

  await expect(page.getByLabel("Cover image")).toHaveValue("/YRC/Events/night-run_e2e.png");
  await expect(page.getByText("Uploaded night-run_e2e.png.")).toBeVisible();
  await expect(page.getByAltText("Cover preview")).toBeVisible();

  expect(uploads).toHaveLength(1);
  const body = uploads[0].body;
  for (const field of ["signature", "token", "expire", "publicKey", "folder", "useUniqueFileName"]) {
    expect(body).toContain(`name="${field}"`);
  }
  expect(body).toContain("/YRC/Events");
  expect(body).not.toContain("private_e2e_dummy"); // the private key never leaves the server
});

test("rejects a non-image file without uploading", async ({ page }) => {
  const uploads = await mockImageKit(page, "/YRC/Events/never.png");
  await page.getByTestId("cover-file").setInputFiles({ name: "notes.txt", mimeType: "text/plain", buffer: Buffer.from("hi") });
  await expect(page.getByText("Choose an image file (JPG, PNG, WebP…).")).toBeVisible();
  expect(uploads).toHaveLength(0);
});

test("shows an error when ImageKit refuses the upload", async ({ page }) => {
  await page.route("https://upload.imagekit.io/**", (route) =>
    route.fulfill({ status: 403, contentType: "application/json", body: JSON.stringify({ message: "Forbidden" }) }),
  );
  await page.getByTestId("cover-file").setInputFiles({ name: "x.png", mimeType: "image/png", buffer: PNG });
  await expect(page.getByText("Upload failed. Check your connection and try again.")).toBeVisible();
  await expect(page.getByLabel("Cover image")).toHaveValue("");
});

test("the path can still be typed by hand", async ({ page }) => {
  await page.getByLabel("Cover image").fill("/YRC/Community/IMG_2469.JPG");
  await expect(page.getByLabel("Cover image")).toHaveValue("/YRC/Community/IMG_2469.JPG");
});
