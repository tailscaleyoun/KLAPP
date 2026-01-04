import express from "express";
import multer from "multer";
import cors from "cors";
import ffmpeg from "fluent-ffmpeg";
import ffmpegPath from "ffmpeg-static";
import fs from "fs";

ffmpeg.setFfmpegPath(ffmpegPath);

const app = express();
app.use(cors());
app.use(express.static("."));

const upload = multer({ dest: "uploads/" });

app.post("/upload", upload.single("video"), async (req, res) => {
  const input = req.file.path;
  const outputDir = `clips/${Date.now()}`;
  fs.mkdirSync(outputDir, { recursive: true });

  ffmpeg(input)
    .outputOptions([
      "-map 0",
      "-segment_time 30",
      "-f segment",
      "-reset_timestamps 1",
      "-vf scale=1080:1920"
    ])
    .output(`${outputDir}/clip_%03d.mp4`)
    .on("end", () => {
      res.json({
        success: true,
        clips: fs.readdirSync(outputDir).map(f => `${outputDir}/${f}`)
      });
    })
    .run();
});

app.listen(5000, () => {
  console.log("Backend running on http://localhost:5000");
});
