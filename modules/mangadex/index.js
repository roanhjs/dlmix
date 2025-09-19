import { chromium } from "playwright";

export async function dlMangadex({ url }) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const timeout = 60000;

  const images = [];

  page.on("response", async (res) => {
    const url = res.url();
    if (url.includes("cmdxd98sb0x3yprd") && url.endsWith(".png")) {
      try {
        const buf = await fetch(url).then((res) => res.arrayBuffer());
        const match = url.split("/");
        const match2 = match[5].split("-");
        images.push({ url, buffer: buf, id: match2[0] });
      } catch (e) {
        console.error("error leyendo", url, e);
      }
    }
  });

  await page.goto(url, { timeout, waitUntil: "load" });

  await page.waitForTimeout(timeout);

  await browser.close();
  const parsedImages = images.sort((a, b) => parseInt(a.id) - parseInt(b.id));
  return parsedImages;
}
