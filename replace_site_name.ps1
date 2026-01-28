$targetDir = "d:\cursor\web\todayyakuk\src"
$search = "오늘약국"
$replace = "약국오늘"

Get-ChildItem -Path $targetDir -Include *.ts,*.tsx -Recurse | ForEach-Object {
    $content = Get-Content $_.FullName -Raw -Encoding UTF8
    if ($content -match $search) {
        $newContent = $content -replace $search, $replace
        Set-Content -Path $_.FullName -Value $newContent -Encoding UTF8
        Write-Host "Updated: $($_.FullName)"
    }
}
