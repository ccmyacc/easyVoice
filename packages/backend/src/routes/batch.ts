import express from "express";
import multer from "multer";
import fs from "fs";
import path from "path";
import archiver from "archiver";
import { synthesizeText } from "../services/ttsService"; // 假设已有的 TTS 调用函数

const router = express.Router();

// 存放上传临时 TXT
const upload = multer({ dest: "batch_tmp/" });

// 批量上传处理
router.post(
  "/batch",
  upload.array("files"),
  async (req, res) => {
    try {
      const files = req.files as Express.Multer.File[];
      const outDir = path.join("batch_out", Date.now().toString());
      fs.mkdirSync(outDir, { recursive: true });

      for (const file of files) {
        const txt = fs.readFileSync(file.path, "utf-8");
        const mp3Buffer = await synthesizeText(txt);

        const name = path.basename(file.originalname, ".txt") + ".mp3";
        fs.writeFileSync(path.join(outDir, name), mp3Buffer);
        fs.unlinkSync(file.path);
      }

      const zipName = `${outDir}.zip`;
      const output = fs.createWriteStream(zipName);
      const archive = archiver("zip");

      output.on("close", () => {
        res.download(zipName, "tts_batch.zip", err => {
          fs.rmSync(outDir, { recursive: true, force: true });
          fs.unlinkSync(zipName);
        });
      });

      archive.pipe(output);
      archive.directory(outDir, false);
      archive.finalize();
    } catch (e) {
      console.error(e);
      res.status(500).json({ error: "Batch TTS error" });
    }
  }
);

export default router;
