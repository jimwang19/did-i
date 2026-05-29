$pptxPath = 'D:\jim\aiwork\memo-tool\scripts\过门不忘-项目介绍.pptx'
$outDir = 'D:\jim\aiwork\memo-tool\scripts\slides-preview'
$pp = New-Object -ComObject PowerPoint.Application
$pp.Visible = $true
$pres = $pp.Presentations.Open($pptxPath)
for ($i = 1; $i -le $pres.Slides.Count; $i++) {
    $name = 'slide-' + $i.ToString('00') + '.png'
    $fullPath = Join-Path $outDir $name
    $pres.Slides.Item($i).Export($fullPath, 'PNG', 1280, 720)
    Write-Host "Exported: $name"
}
$pres.Close()
$pp.Quit()
