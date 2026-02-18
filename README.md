# Scripts

A collection of utility scripts for file management and archiving tasks.

## Output

Both scripts produce a CSV file (default: `FileDetails.csv`) with the following columns:

| Column       | Description                          |
| ------------ | ------------------------------------ |
| FullPath     | Absolute path to the file            |
| FileName     | File name including extension        |
| Extension    | File extension (e.g. `.txt`, `.csv`) |
| CreationDate | File creation timestamp              |
| LastModified | Last modified timestamp              |

## PowerShell — `Get-FileDetails.ps1`

### Prerequisites

- PowerShell 5.1+ (Windows) or PowerShell Core 7+ (cross-platform)

### Parameters

| Parameter     | Required | Default           | Description            |
| ------------- | -------- | ----------------- | ---------------------- |
| `-Path`       | Yes      | —                 | Directory path to scan |
| `-OutputFile` | No       | `FileDetails.csv` | Output CSV file name   |

### Examples

```powershell
# Scan a directory with default output file
.\Get-FileDetails.ps1 -Path "C:\MyFolder"

# Scan a directory with a custom output file name
.\Get-FileDetails.ps1 -Path "C:\MyFolder" -OutputFile "MyReport.csv"

# Scan the current directory
.\Get-FileDetails.ps1 -Path .
```

## TypeScript — `get-file-details.ts`

### Prerequisites

- Node.js 18+
- [tsx](https://github.com/privatenumber/tsx) (`npx tsx`) or another TypeScript runner

### Parameters

| Parameter  | Required | Default           | Description            |
| ---------- | -------- | ----------------- | ---------------------- |
| `--path`   | Yes      | —                 | Directory path to scan |
| `--output` | No       | `FileDetails.csv` | Output CSV file name   |

### Examples

```bash
# Scan a directory with default output file
npx tsx get-file-details.ts --path /home/user/projects

# Scan a directory with a custom output file name
npx tsx get-file-details.ts --path /home/user/projects --output MyReport.csv

# Scan the current directory
npx tsx get-file-details.ts --path .
```

## Sample Output

```csv
FullPath,FileName,Extension,CreationDate,LastModified
/home/user/docs/notes.txt,notes.txt,.txt,2025-01-15T10:30:00.000Z,2025-06-20T14:22:00.000Z
/home/user/docs/report.pdf,report.pdf,.pdf,2025-03-01T09:00:00.000Z,2025-03-01T09:00:00.000Z
```

---

# Download-Archive — `download-archive.ts`

Read a CSV file containing URLs and download each file into a local archive directory. The directory is created automatically if it does not exist.

## CSV Format

The script accepts any CSV where URLs appear one per line (lines not starting with `http://` or `https://` are skipped, so headers are handled automatically).

```csv
Column2
https://example.com/docs/file-a.pdf
https://example.com/docs/file-b.pdf
```

## Prerequisites

- Node.js 18+
- [tsx](https://github.com/privatenumber/tsx) (`npx tsx`) or another TypeScript runner

## Parameters

| Parameter | Required | Default   | Description                             |
| --------- | -------- | --------- | --------------------------------------- |
| `--csv`   | Yes      | —         | Path to the CSV file containing URLs    |
| `--dir`   | No       | `archive` | Directory to save downloaded files into |

## Examples

```bash
# Download with default archive directory
npx tsx download-archive.ts --csv adts-archive-remove-list.csv

# Download to a custom directory
npx tsx download-archive.ts --csv adts-archive-remove-list.csv --dir my-archive
```

## Behaviour

- Creates the archive directory (and any parents) if it does not exist
- Derives each filename from the URL path (e.g. `file-a.pdf`)
- Follows HTTP redirects
- Applies a 30-second timeout per file
- Prints per-file progress: `[N/total] filename ... OK` or `FAILED (reason)`
- Exits with code `1` if any downloads failed

## Sample Output

```
Archive directory: archive
Found 46 URLs. Starting downloads...

[1/46] aanuoluwa-adelani-2024-adts-poster.pdf ... OK
[2/46] ada-zamarripa-2024-adts-poster.pdf ... OK
[3/46] adts_-teaching-showcase.ics ... OK
...
[46/46] wei-zhai-2024-adts-poster.pdf ... OK

Done. 46 succeeded, 0 failed.
```
