import { chromium } from "playwright";

export async function dlMangaIn({ url }) {
  try {
    const browser = await chromium.launch({ headless: true });
    const page = await browser.newPage();

    await page.route("**/*", (route) => {
      const url = route.request().url();
      const bloqueables = [
        "ads",
        "doubleclick",
        "googlesyndication",
        "tracking",
        "analytics",
      ];

      const dominiosPermitidos = ["m440.in"];

      if (
        bloqueables.some((p) => url.includes(p)) &&
        !dominiosPermitidos.some((dominio) => url.includes(dominio))
      ) {
        return route.abort();
      }

      route.continue();
    });

    await page.goto(url, {
      waitUntil: "domcontentloaded",
    });

    await page.waitForSelector("a#modeALL");
    const modeAll = await page.$("a#modeALL");
    await modeAll.click();

    await page.waitForSelector("div#all");
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
  }
}
