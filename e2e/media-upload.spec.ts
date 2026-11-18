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

test.describe("event gallery editor", () => {
  const galleryJson = (page: import("@playwright/test").Page) =>
    page.locator('input[type=hidden][name="gallery"]').inputValue();

  test("uploads photos into the gallery list", async ({ page }) => {
    const uploads = await mockImageKit(page, "/YRC/Events/Gallery/finish_e2e.png");
    await page.getByTestId("gallery-files").setInputFiles({ name: "finish.png", mimeType: "image/png", buffer: PNG });

    await expect(page.getByText("1 · image")).toBeVisible();
    await expect(page.getByText("Added 1 item. Save the event to publish.")).toBeVisible();
    expect(JSON.parse(await galleryJson(page))).toEqual([{ src: "/YRC/Events/Gallery/finish_e2e.png", type: "image" }]);
    expect(uploads).toHaveLength(1);
    expect(uploads[0].body).toContain("/YRC/Events/Gallery");
  });

  test("adds existing paths, captions, reorders and removes", async ({ page }) => {
    await mockImageKit(page, "/unused.png");
    const path = page.getByLabel("ImageKit path to add");
    await path.fill("/YRC/Events/x/IMG_1.jpg");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await path.fill("/YRC/Events/x/clip one.mov");
    await path.press("Enter");

    await expect(page.getByText("2 · video")).toBeVisible();
    await page.getByLabel("Caption for item 2").fill("Hill drills");
    await page.getByLabel("Poster image path for item 2").fill("/YRC/Events/x/clip-poster.jpg");
    await page.getByRole("button", { name: "Move item 2 earlier" }).click();
    expect(JSON.parse(await galleryJson(page))).toEqual([
      { src: "/YRC/Events/x/clip%20one.mov", type: "video", alt: "Hill drills", poster: "/YRC/Events/x/clip-poster.jpg" },
      { src: "/YRC/Events/x/IMG_1.jpg", type: "image" },
    ]);

    await page.getByRole("button", { name: "Remove item 1" }).click();
    expect(JSON.parse(await galleryJson(page))).toEqual([{ src: "/YRC/Events/x/IMG_1.jpg", type: "image" }]);
  });

  test("rejects a path that isn't an ImageKit path", async ({ page }) => {
    await page.getByLabel("ImageKit path to add").fill("https://example.com/x.jpg");
    await page.getByRole("button", { name: "Add", exact: true }).click();
    await expect(page.getByText(/Paste an ImageKit path that starts with \//)).toBeVisible();
    expect(JSON.parse(await galleryJson(page))).toEqual([]);
  });

  test("a new event starts from the template body", async ({ page }) => {
    await expect(page.getByLabel("Overview (Markdown)")).toBeVisible();
    const body = await page.getByLabel("Explore the details (Markdown)").inputValue();
    for (const part of ["## The session", "## Meet & move", "- **07:45** ·", "## Pack your kit", "> Come for the run."]) {
      expect(body).toContain(part);
    }
  });
});
