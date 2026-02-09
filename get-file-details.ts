import { readdirSync, statSync } from "fs";
import { writeFileSync } from "fs";
import { join, extname, basename } from "path";

function getFilesRecursively(dirPath: string): string[] {
  const files: string[] = [];
  for (const entry of readdirSync(dirPath, { withFileTypes: true })) {
    const fullPath = join(dirPath, entry.name);
    if (entry.isDirectory()) {
      files.push(...getFilesRecursively(fullPath));
    } else if (entry.isFile()) {
      files.push(fullPath);
    }
  }
  return files;
}

function escapeCsvField(value: string): string {
  if (value.includes(",") || value.includes('"') || value.includes("\n")) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function main() {
  const args = process.argv.slice(2);
  const pathIndex = args.indexOf("--path");
  const outputIndex = args.indexOf("--output");

  if (pathIndex === -1 || !args[pathIndex + 1]) {
    console.error("Usage: npx ts-node get-file-details.ts --path <directory> [--output <file.csv>]");
    process.exit(1);
  }

  const dirPath = args[pathIndex + 1];
  const outputFile = outputIndex !== -1 && args[outputIndex + 1] ? args[outputIndex + 1] : "FileDetails.csv";

  try {
    statSync(dirPath);
  } catch {
    console.error(`Path '${dirPath}' does not exist.`);
    process.exit(1);
  }

  const files = getFilesRecursively(dirPath);

  const header = "FullPath,FileName,Extension,CreationDate,LastModified";
  const rows = files.map((filePath) => {
    const stats = statSync(filePath);
    return [
      escapeCsvField(filePath),
      escapeCsvField(basename(filePath)),
      escapeCsvField(extname(filePath)),
      escapeCsvField(stats.birthtime.toISOString()),
      escapeCsvField(stats.mtime.toISOString()),
    ].join(",");
  });

  writeFileSync(outputFile, [header, ...rows].join("\n"));
  console.log(`File details exported to: ${outputFile}`);
}

main();
