# Script para remover console.logs de arquivos TypeScript/TSX
# Mantém apenas console.error para logs de erro críticos

Write-Host "🧹 Limpando console.logs dos arquivos..." -ForegroundColor Cyan

$filesToClean = @(
    "src\components\admin\TeamManager.tsx",
    "src\components\AdBanner.tsx",
    "src\components\admin\ProductForm.tsx",
    "src\components\AdminPanel.tsx",
    "src\App.tsx",
    "src\components\CheckoutPage.tsx",
    "src\components\PriceAlertButton.tsx",
    "src\components\AuthModal.tsx",
    "src\components\admin\PriceAlertsPanel.tsx",
    "src\components\MyPriceAlertsPage.tsx",
    "src\components\TradeInForm.tsx",
    "src\components\admin\TradeInEvaluator.tsx",
    "src\components\TradeInCredits.tsx",
    "src\components\BusinessRegistration.tsx",
    "src\components\admin\B2BManager.tsx"
)

$totalRemoved = 0

foreach ($file in $filesToClean) {
    if (Test-Path $file) {
        $content = Get-Content $file -Raw
        $originalLines = ($content -split "`n").Count
        
        # Remove linhas que são apenas console.log/info/warn/debug
        # Mantém console.error
        $newContent = $content -replace "(?m)^\s*console\.(log|info|warn|debug)\([^)]*\);\s*$", ""
        
        # Remove console.log inline (mas não dentro de strings)
        $newContent = $newContent -replace "console\.(log|info|warn|debug)\([^)]*\);\s*", ""
        
        $newLines = ($newContent -split "`n").Count
        $removed = $originalLines - $newLines
        
        if ($removed -gt 0) {
            Set-Content $file $newContent -NoNewline
            Write-Host "  ✅ $file - Removidas $removed linhas" -ForegroundColor Green
            $totalRemoved += $removed
        } else {
            Write-Host "  ⏭️  $file - Nenhuma alteração" -ForegroundColor Gray
        }
    } else {
        Write-Host "  ⚠️  $file - Arquivo não encontrado" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "✨ Limpeza concluída! Total de linhas removidas: $totalRemoved" -ForegroundColor Cyan
Write-Host "⚠️  Nota: console.error foi mantido para logs de erro críticos" -ForegroundColor Yellow
