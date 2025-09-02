import { chromium } from "playwright";

export async function dlPin({ url }) {
  try {
    const browser = await chromium.launch({ headless: true });
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
