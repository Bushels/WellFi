import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync } from "node:fs";
import path from "node:path";
import process from "node:process";
import { chromium } from "playwright";

const width = Number(process.env.WELLFI_CAPTURE_WIDTH ?? 1920);
const height = Number(process.env.WELLFI_CAPTURE_HEIGHT ?? 1080);
const fps = Number(process.env.WELLFI_CAPTURE_FPS ?? 30);
const seconds = Number(process.env.WELLFI_CAPTURE_SECONDS ?? 24);
const speed = Number(process.env.WELLFI_EXPORT_SPEED ?? 2);
const url =
  process.env.WELLFI_CAPTURE_URL ??
  "http://127.0.0.1:3001/wellfi?motion=force";
const outputDir = path.resolve(process.env.WELLFI_CAPTURE_OUT ?? "exports");
const finalSeconds = seconds / speed;
const secondsLabel = Number.isInteger(finalSeconds) ? String(finalSeconds) : finalSeconds.toFixed(1);
const speedLabel = speed === 1 ? "" : "-fast";
const stem = `wellfi-island-hero-${width}x${height}-${secondsLabel}s${speedLabel}`;
const rawVideoDir = path.join(outputDir, ".raw-video");
const rawWebmPath = path.join(outputDir, `${stem}.raw.webm`);
const mp4Path = path.join(outputDir, `${stem}.mp4`);
const posterPath = path.join(outputDir, `wellfi-island-hero-${width}x${height}-poster.png`);
const previewPath = path.join(outputDir, `wellfi-island-hero-1280x720-${secondsLabel}s${speedLabel}-preview.mp4`);

mkdirSync(outputDir, { recursive: true });
mkdirSync(rawVideoDir, { recursive: true });

const browser = await chromium.launch({
  headless: true,
  args: ["--autoplay-policy=no-user-gesture-required"],
});

try {
  const context = await browser.newContext({
    viewport: { width, height },
    deviceScaleFactor: 1,
    reducedMotion: "no-preference",
    recordVideo: {
      dir: rawVideoDir,
      size: { width, height },
    },
  });
  const page = await context.newPage();

  await page.goto(url, { waitUntil: "networkidle", timeout: 60000 });
  await page.waitForSelector("canvas", { timeout: 30000 });
  await page.waitForTimeout(1500);

  const canvasSize = await page.evaluate(
    async ({ width, height }) => {
      const canvas = document.querySelector("canvas");
      if (!(canvas instanceof HTMLCanvasElement)) {
        throw new Error("No canvas found for capture.");
      }

      for (const element of document.body.querySelectorAll("*")) {
        if (element === canvas || element.contains(canvas)) {
          continue;
        }
        element.style.visibility = "hidden";
      }

      Object.assign(document.documentElement.style, {
        margin: "0",
        overflow: "hidden",
        background: "#03070a",
      });

      Object.assign(document.body.style, {
        margin: "0",
        overflow: "hidden",
        background: "#03070a",
      });

      Object.assign(canvas.style, {
        position: "fixed",
        inset: "0",
        width: `${width}px`,
        height: `${height}px`,
        zIndex: "2147483647",
        visibility: "visible",
      });

      return {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
      };
    },
    { width, height },
  );

  await page.locator("canvas").screenshot({ path: posterPath });
  await page.waitForTimeout(seconds * 1000);

  const recordedVideoPath = await page.video().path();
  await context.close();
  renameSync(recordedVideoPath, rawWebmPath);

  console.log(`Captured ${canvasSize.canvasWidth}x${canvasSize.canvasHeight} browser video`);
  console.log(`Wrote ${rawWebmPath}`);
  console.log(`Wrote ${posterPath}`);

  const ffmpeg = spawnSync(
    "ffmpeg",
    [
      "-y",
      "-sseof",
      `-${seconds}`,
      "-i",
      rawWebmPath,
      "-an",
      "-vf",
      `setpts=${(1 / speed).toFixed(6)}*PTS,fps=${fps},format=yuv420p`,
      "-c:v",
      "libx264",
      "-preset",
      "slow",
      "-crf",
      "18",
      "-movflags",
      "+faststart",
      mp4Path,
    ],
    { stdio: "inherit" },
  );

  if (ffmpeg.status === 0 && existsSync(mp4Path)) {
    console.log(`Wrote ${mp4Path}`);
    const preview = spawnSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        mp4Path,
        "-vf",
        "scale=1280:720:flags=lanczos,format=yuv420p",
        "-an",
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        "20",
        "-movflags",
        "+faststart",
        previewPath,
      ],
      { stdio: "inherit" },
    );

    if (preview.status === 0 && existsSync(previewPath)) {
      console.log(`Wrote ${previewPath}`);
    } else {
      console.warn("Preview MP4 conversion failed; main MP4 export is still available.");
    }

    if (process.env.WELLFI_KEEP_RAW !== "1" && existsSync(rawWebmPath)) {
      await import("node:fs/promises").then(({ rm }) => rm(rawWebmPath, { force: true }));
    }
  } else {
    console.warn("FFmpeg MP4 conversion failed; WebM export is still available.");
    process.exitCode = ffmpeg.status ?? 1;
  }
} finally {
  await browser.close();
}
