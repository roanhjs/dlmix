import { chromium } from "playwright";

export async function dlMangaIn({ url }) {
  try {
    const browser = await chromium.launch({ headless: true, slowMo: 1000 });
    const context = await browser.newContext();
    const page = await context.newPage();
    const timeout = 180000;

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

      // Bloquea cualquier challenge de Cloudflare
      if (url.includes("/cdn-cgi/challenge-platform/")) {
        console.log("🛑 Bloqueando Cloudflare challenge:", url);
        return route.abort();
      }

      // Bloquea ads y tracking
      if (
        bloqueables.some((p) => url.includes(p)) &&
        !dominiosPermitidos.some((dominio) => url.includes(dominio))
      ) {
        return route.abort();
      }

      route.continue();
    });

    await page.goto(url, {
      waitUntil: "load",
      timeout,
    });
    const content = await page.content();
    console.log(content);
    const title = await page.title();

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
