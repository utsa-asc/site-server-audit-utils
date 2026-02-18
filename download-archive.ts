import { createWriteStream, mkdirSync, readFileSync } from "fs";
import { get as httpGet } from "http";
import { get as httpsGet } from "https";
import { join, basename } from "path";
import { IncomingMessage } from "http";

function parseUrls(csvPath: string): string[] {
  const content = readFileSync(csvPath, "utf-8");
  const lines = content.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const urls: string[] = [];

  for (const line of lines) {
    // Skip header row(s) — any line that isn't a URL
    if (/^https?:\/\//i.test(line)) {
      urls.push(line);
    }
  }

  return urls;
}

function downloadFile(url: string, destPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const getter = url.startsWith("https") ? httpsGet : httpGet;

    const request = getter(url, (response: IncomingMessage) => {
      // Follow redirects (up to 5 hops)
      if (
        response.statusCode &&
        response.statusCode >= 300 &&
        response.statusCode < 400 &&
        response.headers.location
      ) {
        return downloadFile(response.headers.location, destPath)
          .then(resolve)
          .catch(reject);
      }

      if (response.statusCode !== 200) {
        reject(new Error(`HTTP ${response.statusCode} for ${url}`));
        return;
      }

      const file = createWriteStream(destPath);
      response.pipe(file);
      file.on("finish", () => file.close(() => resolve()));
      file.on("error", reject);
    });

    request.on("error", reject);
    request.setTimeout(30_000, () => {
      request.destroy(new Error(`Timeout downloading ${url}`));
    });
  });
}

async function main() {
  const args = process.argv.slice(2);
  const csvIndex = args.indexOf("--csv");
  const dirIndex = args.indexOf("--dir");

  if (csvIndex === -1 || !args[csvIndex + 1]) {
    console.error(
      "Usage: npx ts-node download-archive.ts --csv <file.csv> [--dir <archive-dir>]"
    );
    process.exit(1);
  }

  const csvPath = args[csvIndex + 1];
  const archiveDir = dirIndex !== -1 && args[dirIndex + 1] ? args[dirIndex + 1] : "archive";

  mkdirSync(archiveDir, { recursive: true });
  console.log(`Archive directory: ${archiveDir}`);

  let urls: string[];
  try {
    urls = parseUrls(csvPath);
  } catch (err) {
    console.error(`Failed to read CSV: ${(err as Error).message}`);
    process.exit(1);
  }

  if (urls.length === 0) {
    console.error("No URLs found in the CSV file.");
    process.exit(1);
  }

  console.log(`Found ${urls.length} URLs. Starting downloads...\n`);

  let passed = 0;
  let failed = 0;

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    const filename = basename(new URL(url).pathname);
    const destPath = join(archiveDir, filename);
    const prefix = `[${i + 1}/${urls.length}]`;

    process.stdout.write(`${prefix} ${filename} ... `);
    try {
      await downloadFile(url, destPath);
      console.log("OK");
      passed++;
    } catch (err) {
      console.log(`FAILED (${(err as Error).message})`);
      failed++;
    }
  }

  console.log(`\nDone. ${passed} succeeded, ${failed} failed.`);
  if (failed > 0) process.exit(1);
}

main();
