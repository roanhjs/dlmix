import { chromium } from "playwright-extra";
import StealthPlugin from "puppeteer-extra-plugin-stealth";

export async function dlMangaIn({ url }) {
  try {
    const browser = await chromium.use(StealthPlugin()).launch({
      headless: true,
      slowMo: 100,
    });

    const context = await browser.newContext();

    const page = await context.newPage();
    const timeout = 180000;

    await page.goto(url, { waitUntil: "load", timeout });

    await page.waitForSelector("body", { timeout });

    const title = await page.title();

    const modeAll = page.locator("a#modeALL");
    await modeAll.waitFor({ state: "visible", timeout });
    await modeAll.click();

    await page.waitForSelector("div#all", { state: "visible", timeout });
    const allDiv = await page.$("div#all");

    const imgHandles = await allDiv.$$("img");
    const imgs = [];
    for (const img of imgHandles) {
      const src =
        (await img.getAttribute("data-src")) || (await img.getAttribute("src"));
      if (src) imgs.push(src);
    }

    await browser.close();
    return { title, imgs };
  } catch (err) {
    console.error("❌ Error en dlMangaIn:", err);
    return { title: "", imgs: [] };
  }
}
