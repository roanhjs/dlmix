import e from "express";
import cors from "cors";
import pdfkit from "pdfkit";
import fs from "fs";
import { dlPin } from "./modules/pin/index.js";
import { m3u8ToMp4 } from "./utils/m3u8ToMp4.js";
import { dlMangaIn } from "./modules/mangasin/index.js";
import { webpToJpg } from "./utils/webpToJpg.js";
import { dlMangadex } from "./modules/mangadex/index.js";
import rateLimit from "express-rate-limit";

const PORT = process.env.PORT || 3000;

const app = e();

const perSecond = rateLimit({
  windowMs: 1000,
  max: 3,
  standardHeaders: true,
  legacyHeaders: false,
});

const perMinute = rateLimit({
  windowMs: 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});

// middleware
app.use(perSecond);
app.use(perMinute);
app.use(cors());

app.get("/", (req, res) => {
  res.json({
    message: {
      en: "Welcome to the DLMix API! Developed by @roanhjs.",
      es: "Bienvenido a la API de DLMix. Desarrollada por @roanhjs.",
    },
    timestamp: Date.now(),
  });
});

app.get("/pin", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");
  console.log("Received URL:", url);

  try {
    const m3u8Url = await dlPin({ url });
    const output = await m3u8ToMp4({ m3u8Url });

    res.set("Content-Type", "video/mp4");
    res.sendFile(output);
    res.on("finish", () => fs.unlinkSync(output));
    res.on("error", (err) => console.error(err));
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "hubo un problema al procesar el video." });
  }
});

app.get("/mangasin", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");
  console.log("Received URL:", url);

  try {
    const { title, imgs } = await dlMangaIn({ url });

    res.set("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename=${title}.pdf`);

    const pdf = new pdfkit();
    pdf.pipe(res);

    for (const img of imgs) {
      const res = await fetch(img);
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const jpg = await webpToJpg({ buffer });

      pdf.image(jpg, {
        fit: [500, 800],
        align: "center",
        valign: "center",
        margins: 0,
      });

      pdf.addPage();
    }

    pdf.end();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "hubo un problema al procesar el manga." });
  }
});

app.get("/mangadex", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).send("Missing URL");
  console.log("Received URL:", url);

  try {
    const images = await dlMangadex({ url });

    res.set("Content-Type", "application/pdf");

    const pdf = new pdfkit();
    pdf.pipe(res);

    for (const img of images) {
      try {
        const res = await fetch(img.url);
        const arrayBuffer = await res.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        const jpg = await webpToJpg({ buffer });

        pdf.image(jpg, {
          fit: [500, 800],
          align: "center",
          valign: "center",
          margins: 0,
        });

        pdf.addPage();
      } catch (error) {
        console.error(error);
        res
          .status(500)
          .send({ message: "hubo un problema al procesar el manga." });
      }
    }

    pdf.end();
  } catch (err) {
    console.error(err);
    res.status(500).send({ message: "hubo un problema al procesar el manga." });
  }
});

app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});
