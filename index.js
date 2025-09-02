import e from "express";
import cors from "cors";
import { dlPin } from "./modules/pin/index.js";
import { m3u8ToMp4 } from "./utils/m3u8ToMp4.js";
import fs from "fs";

const PORT = process.env.PORT || 3000;

const app = e();
app.use(cors());

app.get("/", async (req, res) => {
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

app.listen(PORT, () => {
  console.log(`Server started on port http://localhost:${PORT}`);
});
