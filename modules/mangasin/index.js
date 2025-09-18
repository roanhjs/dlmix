import { chromium } from "playwright";
import fs from "fs";

const COOKIES_FILE = "cookies.json";

export async function dlMangaIn({ url }) {
  try {
    const browser = await chromium.launch({
      headless: true,
      slowMo: 100,
    });

    const storageState = fs.existsSync(COOKIES_FILE) ? COOKIES_FILE : undefined;

    const context = await browser.newContext({
      storageState,
      userAgent:
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
      viewport: { width: 1280, height: 720 },
      locale: "en-US",
    });

    const page = await context.newPage();
    const timeout = 180000;

    await page.goto(url, { waitUntil: "load", timeout });

    await page.waitForSelector("body", { timeout });

    const storage = await context.storageState();
    fs.writeFileSync(COOKIES_FILE, JSON.stringify(storage, null, 2));
    console.log("Cookies guardadas en", COOKIES_FILE);

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
