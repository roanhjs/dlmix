import { chromium } from "playwright";

export async function dlMangadex({ url }) {
  const browser = await chromium.launch({
    headless: true,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--disable-software-rasterizer",
      "--disable-extensions",
      "--disable-background-networking",
      "--disable-background-timer-throttling",
      "--disable-backgrounding-occluded-windows",
      "--disable-client-side-phishing-detection",
      "--disable-sync",
      "--disable-translate",
      "--disable-popup-blocking",
      "--disable-features=AudioServiceOutOfProcess,MediaFoundationPlatform,TranslateUI",
      "--single-process",
      "--mute-audio",
      "--hide-scrollbars",
      "--disable-breakpad",
      "--no-first-run",
      "--no-zygote",
      "--disable-blink-features=AutomationControlled",
      "--disable-renderer-backgrounding",
      "--disable-accelerated-2d-canvas",
      "--disable-web-security",
      "--disable-accelerated-jpeg-decoding",
      "--disable-accelerated-mjpeg-decode",
    ],
    timeout: 300000,
  });
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
