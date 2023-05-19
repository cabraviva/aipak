# GitHub repository information
$owner = "greencoder001"
$repo = "aipak"

# Get the latest release information from GitHub API
$latestReleaseUrl = "https://api.github.com/repos/$owner/$repo/releases/latest"
$latestRelease = Invoke-RestMethod -Uri $latestReleaseUrl

# Extract the tag name from the release information
$tagName = $latestRelease.tag_name

# Construct the download URL
$downloadUrl = "https://github.com/$owner/$repo/releases/download/$tagName/aipak.exe"

# Rest of the installation process remains the same
$downloadPath = "$env:TEMP\aipak.exe"
$installPath = "${env:ProgramFiles}\aipak"
$envPath = [Environment]::GetEnvironmentVariable("Path", "Machine")

# Download the file
Invoke-WebRequest -Uri $downloadUrl -OutFile $downloadPath

# Create the installation directory
New-Item -ItemType Directory -Path $installPath -Force | Out-Null

# Move the downloaded file to the installation directory
Move-Item -Path $downloadPath -Destination $installPath -Force

# Add the installation directory to the PATH
if (-not ($envPath -split ';' | Select-String -Pattern $installPath)) {
    $newPath = $envPath + ";" + $installPath
    [Environment]::SetEnvironmentVariable("Path", $newPath, "Machine")
}

# Refresh the environment variables
$env:Path = [Environment]::GetEnvironmentVariable("Path", "Machine")