import { chromium } from "playwright";

export async function dlMangaIn({ url }) {
  try {
    const browser = await chromium.launch({ headless: true, slowMo: 1000 });
    const context = await browser.newContext();
    const page = await context.newPage();
    const timeout = 180000;

    await page.goto(url, {
      waitUntil: "load",
      timeout,
    });

    const modeAll = page.locator("a#modeALL");
    await modeAll.waitFor({ state: "visible", timeout });
    await modeAll.click();

    await page.waitForSelector("div#all", { state: "visible", timeout });
    const allDiv = await page.$("div#all");

    const imgHandles = await allDiv.$$("img");
    let imgs = [];
    for (const img of imgHandles) {
      const src =
        (await img.getAttribute("data-src")) || (await img.getAttribute("src"));
      imgs.push(src);
    }

    const title = await page.title();
    await browser.close();
    return {
      title,
      imgs,
    };
  } catch (err) {
    console.error(err);
    return { title: "", imgs: [] };
  }
}
