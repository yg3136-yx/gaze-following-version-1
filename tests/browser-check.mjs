import { chromium } from "/Users/yiduoxiaobaiyun/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs";
import assert from "node:assert/strict";

const browser = await chromium.launch({
  headless: true,
  executablePath: "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
});

try {
  const page = await browser.newPage({ viewport: { width: 1280, height: 900 } });
  const errors = [];
  page.on("console", (message) => {
    if (message.type() === "error") errors.push(message.text());
  });
  page.on("pageerror", (error) => errors.push(error.message));

  await page.goto("http://127.0.0.1:4173/", { waitUntil: "networkidle" });
  assert.equal(await page.locator(".person").count(), 8);
  assert.equal(await page.locator("#looking-count").textContent(), "0");

  await page.getByText("2 neighbors", { exact: true }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await page.waitForFunction(() => document.querySelector("#status")?.textContent?.startsWith("No more changes."));
  assert.equal(await page.locator("#looking-count").textContent(), "4");

  await page.getByRole("button", { name: "Reset" }).click();
  assert.equal(await page.locator("#looking-count").textContent(), "0");

  await page.getByText("1 neighbor", { exact: true }).click();
  await page.getByRole("button", { name: "Start" }).click();
  await page.waitForFunction(() => document.querySelector("#status")?.textContent?.startsWith("No more changes."));
  assert.equal(await page.locator("#looking-count").textContent(), "8");
  assert.deepEqual(errors, []);

  await page.screenshot({ path: "/tmp/gaze-following-preview.png", fullPage: true });
  console.log("Browser checks passed: Start, Reset, thresholds 1 and 2, counter, and console errors.");
} finally {
  await browser.close();
}
