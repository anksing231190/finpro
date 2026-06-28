$root = "c:\Users\WELCOME\Desktop\FinPro"
$src = [System.IO.File]::ReadAllText("$root\cam-website.html", [System.Text.Encoding]::UTF8)

$head = @'
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>Apex Credit — AI Credit Assessment Module</title>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Inter:wght@400;450;500;600&family=JetBrains+Mono:wght@400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.5.0/dist/tabler-icons.min.css">
<script type="module" src="/src/main.js"></script>
</head>
'@

if ($src -notmatch '(?s)<body>(.*?)\s*<script>') { throw 'Could not extract body' }
$body = $Matches[1].TrimEnd()

$replacements = @(
  @(' onclick="toggleDropdown\(event\)"', ''),
  @(" onclick=`"openModal\('profileModal'\)`"", ' data-action="open-profile"'),
  @(" onclick=`"openModal\('settingsModal'\)`"", ' data-action="open-settings"'),
  @(" onclick=`"showToast\('Help centre opening…'\)`"", ' data-action="help"'),
  @(' onclick="logout\(\)"', ' data-action="logout"'),
  @(" onclick=`"if\(event\.target===this\)closeModal\('settingsModal'\)`"", ''),
  @(" onclick=`"if\(event\.target===this\)closeModal\('profileModal'\)`"", ''),
  @(" onclick=`"closeModal\('settingsModal'\)`"", ' data-close-modal="settingsModal"'),
  @(" onclick=`"closeModal\('profileModal'\)`"", ' data-close-modal="profileModal"'),
  @(" onclick=`"setTheme\('light'\)`"", ''),
  @(" onclick=`"setTheme\('dark'\)`"", ''),
  @(" onclick=`"setTheme\('system'\)`"", ''),
  @(" onclick=`"this\.classList\.toggle\('on'\)`"", ' data-toggle'),
  @(" onclick=`"closeModal\('settingsModal'\);showToast\('Settings saved'\)`"", ' data-action="save-settings"'),
  @(" onclick=`"closeModal\('profileModal'\);showToast\('Profile updated'\)`"", ' data-action="save-profile"'),
  @(' onclick="togglePw\(\)"', ''),
  @(" onclick=`"pickCustomerType\('company'\)`"", ''),
  @(" onclick=`"pickCustomerType\('individual'\)`"", ''),
  @(' onclick="toggleChk\(this\)"', ' data-toggle-chk'),
  @(" onclick=`"showToast\('Password reset link sent'\)`"", ' data-action="forgot-password"'),
  @(' onclick="doLogin\(\)"', ' data-action="login"'),
  @(' onclick="triggerActiveUpload\(\)"', ''),
  @(' onclick="reupload\(\)"', ' data-action="reupload"'),
  @(' onclick="goToReview\(\)"', ''),
  @(' onclick="goScreen\(1\)"', ' data-screen="1"'),
  @(' onclick="goScreen\(2\)"', ' data-screen="2"'),
  @(' onclick="switchFormTab\(0,this\)"', ' data-tab="0"'),
  @(' onclick="switchFormTab\(1,this\)"', ' data-tab="1"'),
  @(' onclick="switchFormTab\(2,this\)"', ' data-tab="2"'),
  @(' onclick="goToAssessment\(\)"', ' data-action="go-assessment"'),
  @(' onclick="newAssessment\(\)"', ' data-action="new-assessment"'),
  @(" onclick=`"showToast\('CAM report exported as PDF'\)`"", ' data-action="export-cam"')
)

foreach ($pair in $replacements) {
  $body = [regex]::Replace($body, $pair[0], $pair[1])
}

$html = $head + "`n<body>`n" + $body + "`n</body>`n</html>`n"
$utf8 = New-Object System.Text.UTF8Encoding $false
[System.IO.File]::WriteAllText("$root\index.html", $html, $utf8)
Write-Host 'index.html built successfully'
