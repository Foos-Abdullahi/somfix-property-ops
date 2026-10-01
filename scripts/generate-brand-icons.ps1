# Export the supplied SOMFIX symbol to browser and home-screen icon formats.
Add-Type -AssemblyName System.Drawing
$projectRoot = Split-Path $PSScriptRoot -Parent
$publicPath = Join-Path $projectRoot 'public'
$source = [System.Drawing.Image]::FromFile((Join-Path $projectRoot 'resources/assets/LOGO-01.jpg.jpeg'))
try {
    # Same artwork viewport as BrandLogo, expressed relative to its 1600-unit canvas.
    $crop = [System.Drawing.RectangleF]::new(432 * $source.Width / 1600, 410 * $source.Height / 1600, 735 * $source.Width / 1600, 630 * $source.Height / 1600)
    $frames = @{}
    foreach ($size in @(16, 32, 48, 180, 192, 256, 512)) {
        $bitmap = [System.Drawing.Bitmap]::new($size, $size)
        $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
        try {
            $graphics.Clear([System.Drawing.Color]::White)
            $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $width = $size * 0.86
            $height = $width * 630 / 735
            $destination = [System.Drawing.RectangleF]::new(($size - $width) / 2, ($size - $height) / 2, $width, $height)
            $graphics.DrawImage($source, $destination, $crop, [System.Drawing.GraphicsUnit]::Pixel)
            $stream = [System.IO.MemoryStream]::new()
            try {
                $bitmap.Save($stream, [System.Drawing.Imaging.ImageFormat]::Png)
                $frames[$size] = $stream.ToArray()
            } finally { $stream.Dispose() }
        } finally { $graphics.Dispose(); $bitmap.Dispose() }
    }
    foreach ($entry in @{ 'favicon-32x32.png' = 32; 'apple-touch-icon.png' = 180; 'icon-192.png' = 192; 'icon-512.png' = 512 }.GetEnumerator()) {
        [System.IO.File]::WriteAllBytes((Join-Path $publicPath $entry.Key), $frames[$entry.Value])
    }
    $icoStream = [System.IO.MemoryStream]::new()
    $writer = [System.IO.BinaryWriter]::new($icoStream)
    try {
        $sizes = @(16, 32, 48, 256)
        $writer.Write([uint16]0); $writer.Write([uint16]1); $writer.Write([uint16]$sizes.Count)
        $offset = 6 + 16 * $sizes.Count
        foreach ($size in $sizes) {
            $dimension = if ($size -eq 256) { 0 } else { $size }
            $writer.Write([byte]$dimension); $writer.Write([byte]$dimension)
            $writer.Write([byte]0); $writer.Write([byte]0)
            $writer.Write([uint16]1); $writer.Write([uint16]32)
            $writer.Write([uint32]$frames[$size].Length); $writer.Write([uint32]$offset)
            $offset += $frames[$size].Length
        }
        foreach ($size in $sizes) { $writer.Write([byte[]]$frames[$size]) }
        [System.IO.File]::WriteAllBytes((Join-Path $publicPath 'favicon.ico'), $icoStream.ToArray())
    } finally { $writer.Dispose(); $icoStream.Dispose() }
    $encoded = [Convert]::ToBase64String($frames[512])
    $svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><title>SOMFIX</title><image width="512" height="512" href="data:image/png;base64,' + $encoded + '" /></svg>'
    [System.IO.File]::WriteAllText((Join-Path $publicPath 'favicon.svg'), $svg)
} finally { $source.Dispose() }
