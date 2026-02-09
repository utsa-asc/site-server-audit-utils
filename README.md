# Get-FileDetails

Recursively scan a directory and export file details to a CSV file. Available as both a PowerShell script and a TypeScript script.

## Output

Both scripts produce a CSV file (default: `FileDetails.csv`) with the following columns:

| Column | Description |
|---|---|
| FullPath | Absolute path to the file |
| FileName | File name including extension |
| Extension | File extension (e.g. `.txt`, `.csv`) |
| CreationDate | File creation timestamp |
| LastModified | Last modified timestamp |

## PowerShell — `Get-FileDetails.ps1`

### Prerequisites

- PowerShell 5.1+ (Windows) or PowerShell Core 7+ (cross-platform)

### Parameters

| Parameter | Required | Default | Description |
|---|---|---|---|
| `-Path` | Yes | — | Directory path to scan |
| `-OutputFile` | No | `FileDetails.csv` | Output CSV file name |

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

| Parameter | Required | Default | Description |
|---|---|---|---|
| `--path` | Yes | — | Directory path to scan |
| `--output` | No | `FileDetails.csv` | Output CSV file name |

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
