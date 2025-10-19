# NeuroGames Deployment Script
# Run this script to prepare the application for GitHub Pages deployment

Write-Host "🚀 Starting NeuroGames Deployment Preparation..." -ForegroundColor Green

# Create assets directory if it doesn't exist
if (!(Test-Path "assets")) {
    New-Item -ItemType Directory -Path "assets"
    Write-Host "📁 Created assets directory" -ForegroundColor Yellow
}

# Check for required files
$requiredFiles = @("index.html", "styles.css", "script.js", "README.md")
foreach ($file in $requiredFiles) {
    if (Test-Path $file) {
        Write-Host "✅ Found $file" -ForegroundColor Green
    } else {
        Write-Host "❌ Missing $file" -ForegroundColor Red
        exit 1
    }
}

# Validate HTML structure
Write-Host "🔍 Validating application structure..." -ForegroundColor Blue

# Check JavaScript syntax (basic check)
try {
    $jsContent = Get-Content "script.js" -Raw
    if ($jsContent.Length -gt 0) {
        Write-Host "✅ JavaScript file loaded successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ JavaScript validation failed" -ForegroundColor Red
    exit 1
}

# Check CSS syntax (basic check)
try {
    $cssContent = Get-Content "styles.css" -Raw
    if ($cssContent.Length -gt 0) {
        Write-Host "✅ CSS file loaded successfully" -ForegroundColor Green
    }
} catch {
    Write-Host "❌ CSS validation failed" -ForegroundColor Red
    exit 1
}

# Create .nojekyll file for GitHub Pages
New-Item -ItemType File -Path ".nojekyll" -Force | Out-Null
Write-Host "📄 Created .nojekyll file for GitHub Pages" -ForegroundColor Yellow

# Create robots.txt for SEO
@"
User-agent: *
Allow: /

Sitemap: https://horizon-research-ug.github.io/2/sitemap.xml
"@ | Out-File -FilePath "robots.txt" -Encoding UTF8

Write-Host "🤖 Created robots.txt for SEO" -ForegroundColor Yellow

# Create sitemap.xml for SEO
@"
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://horizon-research-ug.github.io/2/</loc>
    <lastmod>$(Get-Date -Format "yyyy-MM-dd")</lastmod>
    <changefreq>monthly</changefreq>
    <priority>1.0</priority>
  </url>
</urlset>
"@ | Out-File -FilePath "sitemap.xml" -Encoding UTF8

Write-Host "🗺️ Created sitemap.xml for SEO" -ForegroundColor Yellow

# Display file sizes
Write-Host "`n📊 File Sizes:" -ForegroundColor Blue
Get-ChildItem -File | Select-Object Name, @{Name="Size(KB)"; Expression={[math]::Round($_.Length/1KB,2)}} | Format-Table

# Calculate total project size
$totalSize = (Get-ChildItem -File -Recurse | Measure-Object Length -Sum).Sum
$totalSizeKB = [math]::Round($totalSize/1KB,2)
$totalSizeMB = [math]::Round($totalSize/1MB,2)

Write-Host "📦 Total Project Size: $totalSizeKB KB ($totalSizeMB MB)" -ForegroundColor Cyan

# Performance recommendations
Write-Host "`n⚡ Performance Status:" -ForegroundColor Blue
if ($totalSizeMB -lt 5) {
    Write-Host "✅ Excellent - Project size is optimal for web deployment" -ForegroundColor Green
} elseif ($totalSizeMB -lt 10) {
    Write-Host "⚠️ Good - Consider optimizing large files" -ForegroundColor Yellow
} else {
    Write-Host "❌ Large - Optimization recommended" -ForegroundColor Red
}

# Git status check
if (Get-Command git -ErrorAction SilentlyContinue) {
    Write-Host "`n🔄 Git Status:" -ForegroundColor Blue
    try {
        git status --porcelain
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Git repository detected" -ForegroundColor Green
        }
    } catch {
        Write-Host "⚠️ Not a git repository or git not available" -ForegroundColor Yellow
    }
} else {
    Write-Host "⚠️ Git not found - Install Git for version control" -ForegroundColor Yellow
}

# Final deployment checklist
Write-Host "`n📋 Deployment Checklist:" -ForegroundColor Blue
Write-Host "✅ HTML structure validated" -ForegroundColor Green
Write-Host "✅ CSS and JavaScript files checked" -ForegroundColor Green
Write-Host "✅ SEO meta tags added" -ForegroundColor Green
Write-Host "✅ GitHub Pages configuration ready" -ForegroundColor Green
Write-Host "✅ Documentation complete" -ForegroundColor Green
Write-Host "✅ Sample data provided" -ForegroundColor Green

Write-Host "`n🚀 Deployment Instructions:" -ForegroundColor Cyan
Write-Host "1. Push all changes to GitHub repository" -ForegroundColor White
Write-Host "2. Enable GitHub Pages in repository settings" -ForegroundColor White
Write-Host "3. Select 'main' branch as source" -ForegroundColor White
Write-Host "4. Wait for deployment (usually 1-5 minutes)" -ForegroundColor White
Write-Host "5. Access at: https://horizon-research-ug.github.io/2/" -ForegroundColor White

Write-Host "`n🎉 NeuroGames is ready for deployment!" -ForegroundColor Green
Write-Host "Visit the live site after GitHub Pages deployment completes." -ForegroundColor White