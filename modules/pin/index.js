import { chromium } from "playwright";

export async function dlPin({ url }) {
  try {
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
        "--no-zygote",
        "--single-process",
        "--disable-blink-features=AutomationControlled",
        "--mute-audio",
        "--hide-scrollbars",
        "--disable-breakpad",
        "--disable-renderer-backgrounding",
        "--disable-accelerated-2d-canvas",
        "--disable-accelerated-jpeg-decoding",
        "--disable-accelerated-mjpeg-decode",
        "--disable-web-security",
      ],
      timeout: 300000,
    });
    const page = await browser.newPage();
    await page.goto(url);
    await page.waitForSelector("video.hwa");

    const m3u8Response = await page.waitForResponse((res) =>
      res.url().endsWith(".m3u8"),
    );

    const m3u8Url = m3u8Response.url();

    await browser.close();
    return m3u8Url;
  } catch (err) {
    console.error(err);
  }
}
