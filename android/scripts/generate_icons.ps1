Add-Type -AssemblyName System.Drawing

$srcPath = "E:\My Projects\Laptop Backup\Pharmacy Inventory Management Software\src\assets\App Icon.png"
$resDir = "E:\My Projects\Laptop Backup\Pharmacy Inventory Management Software\android\app\src\main\res"

$srcBmp = [System.Drawing.Bitmap]::FromFile($srcPath)

# Standard icon sizes:
# launcher: mdpi=48, hdpi=72, xhdpi=96, xxhdpi=144, xxxhdpi=192
# foreground (108dp canvas): mdpi=108, hdpi=162, xhdpi=216, xxhdpi=324, xxxhdpi=432

$densities = @(
    @{ folder = "mipmap-mdpi";    iconSize = 48;  fgSize = 108 },
    @{ folder = "mipmap-hdpi";    iconSize = 72;  fgSize = 162 },
    @{ folder = "mipmap-xhdpi";   iconSize = 96;  fgSize = 216 },
    @{ folder = "mipmap-xxhdpi";  iconSize = 144; fgSize = 324 },
    @{ folder = "mipmap-xxxhdpi"; iconSize = 192; fgSize = 432 }
)

function Resize-Image($source, $targetWidth, $targetHeight, $paddingRatio) {
    # If paddingRatio > 0, the source image is placed in the center with padding
    $canvas = New-Object System.Drawing.Bitmap($targetWidth, $targetHeight, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    if ($paddingRatio -gt 0) {
        $drawnWidth = [int]($targetWidth * (1.0 - $paddingRatio))
        $drawnHeight = [int]($targetHeight * (1.0 - $paddingRatio))
        $offsetX = [int](($targetWidth - $drawnWidth) / 2)
        $offsetY = [int](($targetHeight - $drawnHeight) / 2)
        $g.DrawImage($source, $offsetX, $offsetY, $drawnWidth, $drawnHeight)
    } else {
        $g.DrawImage($source, 0, 0, $targetWidth, $targetHeight)
    }

    $g.Dispose()
    return $canvas
}

function Create-RoundImage($sourceSquare) {
    $w = $sourceSquare.Width
    $h = $sourceSquare.Height
    $canvas = New-Object System.Drawing.Bitmap($w, $h, [System.Drawing.Imaging.PixelFormat]::Format32bppArgb)
    $g = [System.Drawing.Graphics]::FromImage($canvas)
    $g.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $g.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
    $g.Clear([System.Drawing.Color]::Transparent)

    $path = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse(0, 0, $w, $h)
    $g.SetClip($path)
    $g.DrawImage($sourceSquare, 0, 0, $w, $h)

    $path.Dispose()
    $g.Dispose()
    return $canvas
}

foreach ($d in $densities) {
    $dir = Join-Path $resDir $d.folder
    
    # 1. Standard ic_launcher.png (scaled to fit full size)
    $launcher = Resize-Image $srcBmp $d.iconSize $d.iconSize 0.0
    $launcherPath = Join-Path $dir "ic_launcher.png"
    $launcher.Save($launcherPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $launcher.Dispose()

    # 2. Round ic_launcher_round.png
    $round = Resize-Image $srcBmp $d.iconSize $d.iconSize 0.05
    $roundMasked = Create-RoundImage $round
    $roundPath = Join-Path $dir "ic_launcher_round.png"
    $roundMasked.Save($roundPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $round.Dispose()
    $roundMasked.Dispose()

    # 3. Adaptive Foreground: 108dp canvas, logo sized at 70dp in center (safe zone is inner 72dp)
    # So padding ratio = (108 - 72) / 108 ~ 0.33
    $fg = Resize-Image $srcBmp $d.fgSize $d.fgSize 0.28
    $fgPath = Join-Path $dir "ic_launcher_foreground.png"
    $fg.Save($fgPath, [System.Drawing.Imaging.ImageFormat]::Png)
    $fg.Dispose()

    Write-Output "Generated icons for $($d.folder)"
}

$srcBmp.Dispose()
Write-Output "All icons successfully generated!"
