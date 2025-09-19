import { chromium } from "playwright";

export async function dlMangadex({ url }) {
  try {
    const timeout = 60000;
    const browser = await chromium.launch({ headless: true });
    const ctx = await browser.newContext();
    const page = await ctx.newPage();
    await page.goto(url, { timeout, waitUntil: "load" });

    // const menu = page.locator(".reader--meta.menu");
    // await menu.waitFor({ state: "visible", timeout });
    // await menu.click();

    // const btn = page.locator("button:has-text('Single Page')");
    // await btn.waitFor({ state: "visible", timeout });
    // btn.click().then(async () => {
    //   const btn = page.locator("button:has-text('Double Page')");
    //   await btn.waitFor({ state: "visible", timeout });
    //   await btn.click();
    // });

    await page
      .waitForResponse(
        (res) => {
          const url = res.url();
          if (url.includes("cmdxd98sb0x3yprd") && url.endsWith(".png")) {
            console.log(url);
          }
        },
        { timeout },
      )
      .finally(async () => {
        await browser.close();
      });
  } catch (err) {
    console.error(err);
  }
}
