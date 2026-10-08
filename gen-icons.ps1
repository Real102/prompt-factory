Add-Type -AssemblyName System.Drawing

$iconDir = "D:\work\Cortex\invention\prompt-factory\prompt-factory\src-tauri\icons"
if (!(Test-Path $iconDir)) {
    New-Item -ItemType Directory -Path $iconDir -Force | Out-Null
}

function Create-Icon($size, $path, $format) {
    $bmp = New-Object System.Drawing.Bitmap($size, $size)
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.Clear([System.Drawing.Color]::Transparent)
    
    $accent = [System.Drawing.Color]::FromArgb(201, 247, 61)
    
    $brush = New-Object System.Drawing.SolidBrush($accent)
    $rectF = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $radius = [single]($size * 0.2)
    $path2 = New-Object System.Drawing.Drawing2D.GraphicsPath
    $path2.AddArc($rectF.X, $rectF.Y, $radius, $radius, 180, 90)
    $path2.AddArc($rectF.X + $rectF.Width - $radius, $rectF.Y, $radius, $radius, 270, 90)
    $path2.AddArc($rectF.X + $rectF.Width - $radius, $rectF.Y + $rectF.Height - $radius, $radius, $radius, 0, 90)
    $path2.AddArc($rectF.X, $rectF.Y + $rectF.Height - $radius, $radius, $radius, 90, 90)
    $path2.CloseFigure()
    $g.FillPath($brush, $path2)
    
    $fontSize = [single]($size * 0.45)
    $font = New-Object System.Drawing.Font("Arial", $fontSize, [System.Drawing.FontStyle]::Bold)
    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center
    $textBrush = New-Object System.Drawing.SolidBrush([System.Drawing.Color]::FromArgb(10, 15, 12))
    $g.DrawString("Pf", $font, $textBrush, $rectF, $sf)
    
    if ($format -eq "ico") {
        $icon = [System.Drawing.Icon]::FromHandle($bmp.GetHicon())
        $fs = [System.IO.File]::Create($path)
        $icon.Save($fs)
        $fs.Close()
        $icon.Dispose()
    } else {
        $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    }
    $g.Dispose()
    $bmp.Dispose()
}

Create-Icon 32 "$iconDir\32x32.png" "png"
Create-Icon 128 "$iconDir\128x128.png" "png"
Create-Icon 256 "$iconDir\128x128@2x.png" "png"
Create-Icon 512 "$iconDir\icon.png" "png"
Create-Icon 256 "$iconDir\icon.ico" "ico"
Create-Icon 256 "$iconDir\icon.icns" "ico"

Write-Host "Icons created successfully."
