# clean-ts-output.ps1
# 清理 TypeScript 編譯產物（不影響源碼中的手動類型宣告）

Write-Host "🧹 開始清理 TypeScript 編譯產物..." -ForegroundColor Cyan
Write-Host ""

# 1. 刪除 js/ 目錄中的 .d.ts 和 .d.ts.map 檔案
Write-Host "清理 js/ 目錄中的類型宣告檔案..."
$jsDeclarationFiles = Get-ChildItem -Path "js" -Include "*.d.ts", "*.d.ts.map" -Recurse -ErrorAction SilentlyContinue
if ($jsDeclarationFiles) {
    $jsDeclarationFiles | Remove-Item -Force
    Write-Host "  已刪除 $($jsDeclarationFiles.Count) 個 .d.ts/.d.ts.map 檔案" -ForegroundColor Green
}
else {
    Write-Host "  無 .d.ts 檔案需要清理" -ForegroundColor Gray
}

# 2. 刪除 js/ 根目錄的 .js.map 檔案
Write-Host "清理 js/ 目錄中的 Source Map 檔案..."
$jsMapFiles = Get-ChildItem -Path "js" -Filter "*.js.map" -Recurse -ErrorAction SilentlyContinue
if ($jsMapFiles) {
    $jsMapFiles | Remove-Item -Force
    Write-Host "  已刪除 $($jsMapFiles.Count) 個 .js.map 檔案" -ForegroundColor Green
}
else {
    Write-Host "  無 .js.map 檔案需要清理" -ForegroundColor Gray
}

# 3. 刪除 dist/ 目錄
if (Test-Path "dist") {
    Write-Host "刪除 dist/ 目錄..."
    Remove-Item -Path "dist" -Recurse -Force
    Write-Host "  done" -ForegroundColor Green
}

Write-Host ""
Write-Host "✅ 清理完成!" -ForegroundColor Green
Write-Host ""
Write-Host "重要提示:" -ForegroundColor Yellow
Write-Host "  - src/*.d.ts 是手動編寫的類型宣告，已保留" -ForegroundColor Yellow
Write-Host "  - src/**/calculation.js 和 cdc-data.js 是輔助檔案，已保留" -ForegroundColor Yellow
Write-Host ""
Write-Host "執行 'npx tsc -p tsconfig.json' 重新編譯 TypeScript" -ForegroundColor Cyan
