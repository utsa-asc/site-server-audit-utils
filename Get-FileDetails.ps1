# Get-FileDetails.ps1
# 
# This script recursively scans a directory and exports file details to a CSV file.
# 
# USAGE:
#   .\Get-FileDetails.ps1 -Path "C:\MyFolder"
#   .\Get-FileDetails.ps1 -Path "C:\MyFolder" -OutputFile "MyReport.csv"
# 
# PARAMETERS:
#   -Path: (Required) The directory path to scan
#   -OutputFile: (Optional) Output CSV file name (default: FileDetails.csv)
# 
# OUTPUT:
#   CSV file containing: FullPath, FileName, Extension, CreationDate, LastModified

param(
    [Parameter(Mandatory=$true)]
    [string]$Path,
    [Parameter(Mandatory=$false)]
    [string]$OutputFile = "FileDetails.csv"
)

if (-not (Test-Path $Path)) {
    Write-Error "Path '$Path' does not exist."
    exit 1
}

Get-ChildItem -Path $Path -Recurse -File | ForEach-Object {
    [PSCustomObject]@{
        FullPath = $_.FullName
        FileName = $_.Name
        Extension = $_.Extension
        CreationDate = $_.CreationTime
        LastModified = $_.LastWriteTime
    }
} | Export-Csv -Path $OutputFile -NoTypeInformation

Write-Host "File details exported to: $OutputFile"