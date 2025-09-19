import { chromium } from "playwright";

export async function dlMangadex({ url }) {
  const browser = await chromium.launch({ headless: true });
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  const timeout = 60000;

  const images = [];
  const processed = new Set();

  page.on("response", async (res) => {
    const url = res.url();
    if (
      url.includes("cmdxd98sb0x3yprd") &&
      /\.(?:png|jpe?g|webp)$/i.test(url) &&
      !processed.has(url)
    ) {
      processed.add(url);
      const id = url.split("/")[5].split("-")[0];
      images.push({ url, id });
    }
  });

  await page.goto(url, { timeout, waitUntil: "load" });
  await page.waitForTimeout(timeout);

  await browser.close();

  return images.sort((a, b) => parseInt(a.id, 10) - parseInt(b.id, 10));
}
