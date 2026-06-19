$subdirs = @("blogs", "users", "settings", "write", "analytics", "security", "media-library")
$basePath = "c:\Users\mukun\Downloads\global-chanakya-1\apps\web\src\app\admin"
$errorPath = "$basePath\error.tsx"
$loadingPath = "$basePath\loading.tsx"

foreach ($dir in $subdirs) {
    $dirPath = "$basePath\$dir"
    if (-not (Test-Path $dirPath)) {
        New-Item -ItemType Directory -Path $dirPath
    }
    
    Copy-Item -Path $errorPath -Destination "$dirPath\error.tsx" -Force
    Copy-Item -Path $loadingPath -Destination "$dirPath\loading.tsx" -Force
    
    $pagePath = "$dirPath\page.tsx"
    if (-not (Test-Path $pagePath)) {
        $pageContent = "export default function Admin$($dir.Replace('-', ''))Page() { return <div className='p-8'><h1 className='text-2xl font-bold text-white capitalize'>$($dir.Replace('-', ' '))</h1><p className='text-gray-400 mt-2'>This module is under construction.</p></div>; }"
        Set-Content -Path $pagePath -Value $pageContent
    }
}
