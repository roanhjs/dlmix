import { chromium } from "playwright";

export async function dlMangaIn({ url }) {
  try {
    const browser = await chromium.launch({ headless: true, slowMo: 1000 });
    const page = await browser.newPage();
    const timeout = 120000;

    // await page.route("**/*", (route) => {
    //   const url = route.request().url();
    //   const bloqueables = [
    //     "ads",
    //     "doubleclick",
    //     "googlesyndication",
    //     "tracking",
    //     "analytics",
    //   ];

    //   const dominiosPermitidos = ["m440.in"];

    //   if (
    //     bloqueables.some((p) => url.includes(p)) &&
    //     !dominiosPermitidos.some((dominio) => url.includes(dominio))
    //   ) {
    //     return route.abort();
    //   }

    //   route.continue();
    // });

    await page.goto(url, {
      waitUntil: "load",
      timeout,
    });

    await page.waitForSelector("a#modeALL", { timeout });
    const modeAll = page.locator("a#modeALL");
    await modeAll.waitFor({ state: "visible", timeout });
    await modeAll.click();

    await page.waitForSelector("div#all", { timeout });
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
