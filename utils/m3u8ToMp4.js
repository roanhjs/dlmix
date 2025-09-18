import { spawn } from "child_process";
import path from "path";

export async function m3u8ToMp4({ m3u8Url }) {
  try {
    return new Promise(async (resolve, reject) => {
      const output = path.join(
        process.cwd(),
        "videos",
        `video-${Date.now()}.mp4`,
      );

      const ffmpeg = spawn("ffmpeg", [
        "-y",
        "-i",
        m3u8Url,
        "-c",
        "copy",
        output,
      ]);

      ffmpeg.stderr.on("data", (d) => console.log(d.toString()));

      ffmpeg.on("error", reject);

      ffmpeg.on("exit", (code, signal) => {
        if (code === 0) return resolve(output);
        if (signal)
          return reject(new Error(`FFmpeg fue terminado por señal: ${signal}`));
        reject(new Error(`FFmpeg salió con código ${code}`));
      });
    });
  } catch (err) {
    console.error(err);
  }
}
