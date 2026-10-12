Add-Type -AssemblyName System.Drawing

$srcPath = "E:\My Projects\Laptop Backup\Pharmacy Inventory Management Software\src\assets\App Icon.png"
$resDir = "E:\My Projects\Laptop Backup\Pharmacy Inventory Management Software\android\app\src\main\res"

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

$splashTargets = @(
    @{ folder = "drawable";             w = 480;  h = 320;  logoSize = 120 },
    @{ folder = "drawable-port-mdpi";   w = 320;  h = 480;  logoSize = 120 },
    @{ folder = "drawable-port-hdpi";   w = 480;  h = 800;  logoSize = 160 },
    @{ folder = "drawable-port-xhdpi";  w = 720;  h = 1280; logoSize = 220 },
    @{ folder = "drawable-port-xxhdpi"; w = 960;  h = 1600; logoSize = 300 },
    @{ folder = "drawable-port-xxxhdpi";w = 1280; h = 1920; logoSize = 380 },
    @{ folder = "drawable-land-mdpi";   w = 480;  h = 320;  logoSize = 120 },
    @{ folder = "drawable-land-hdpi";   w = 800;  h = 480;  logoSize = 150 },
    @{ folder = "drawable-land-xhdpi";  w = 1280; h = 720;  logoSize = 200 },
    @{ folder = "drawable-land-xxhdpi"; w = 1600; h = 960;  logoSize = 260 },
    @{ folder = "drawable-land-xxxhdpi";w = 1920; h = 1280; logoSize = 320 }
)

function Create-Splash($source, $targetW, $targetH, $logoS) {
    $canvas = New-Object System.Drawing.Bitmap($targetW, $targetH, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::White)

    $offsetX = [int](($targetW - $logoS) / 2)
    $offsetY = [int](($targetH - $logoS) / 2)
    $g.DrawImage($source, $offsetX, $offsetY, $logoS, $logoS)

    $g.Dispose()
    return $canvas
}

foreach ($st in $splashTargets) {
    $dir = Join-Path $resDir $st.folder
    if (Test-Path $dir) {
        $splash = Create-Splash $srcBmp $st.w $st.h $st.logoSize
        $outPath = Join-Path $dir "splash.png"
        $splash.Save($outPath, [System.Drawing.Imaging.ImageFormat]::Png)
        $splash.Dispose()
        Write-Output "Generated splash for $($st.folder)"
    }
}

$srcBmp.Dispose()
Write-Output "Splash screens generated successfully!"
