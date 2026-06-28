"""Build index.html from cam-website.html for Vite modular app."""
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
src = (ROOT / "cam-website.html").read_text(encoding="utf-8")

# Head: fonts + icons + module entry (no inline CSS)
head = """<!DOCTYPE html>
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
"""

# Body: from <body> through toast, excluding inline <script>
body_match = re.search(r"<body>([\s\S]*?)<script>", src)
if not body_match:
    raise SystemExit("Could not extract body from cam-website.html")
body = body_match.group(1).rstrip() + "\n"

replacements = [
    (r' onclick="toggleDropdown\(event\)"', ""),
    (r" onclick=\"openModal\('profileModal'\)\"", ' data-action="open-profile"'),
    (r" onclick=\"openModal\('settingsModal'\)\"", ' data-action="open-settings"'),
    (r" onclick=\"showToast\('Help centre opening…'\)\"", ' data-action="help"'),
    (r' onclick="logout\(\)"', ' data-action="logout"'),
    (r" onclick=\"if\(event\.target===this\)closeModal\('settingsModal'\)\"", ""),
    (r" onclick=\"if\(event\.target===this\)closeModal\('profileModal'\)\"", ""),
    (r" onclick=\"closeModal\('settingsModal'\)\"", ' data-close-modal="settingsModal"'),
    (r" onclick=\"closeModal\('profileModal'\)\"", ' data-close-modal="profileModal"'),
    (r" onclick=\"setTheme\('light'\)\"", ""),
    (r" onclick=\"setTheme\('dark'\)\"", ""),
    (r" onclick=\"setTheme\('system'\)\"", ""),
    (r" onclick=\"this\.classList\.toggle\('on'\)\"", " data-toggle"),
    (
        r" onclick=\"closeModal\('settingsModal'\);showToast\('Settings saved'\)\"",
        ' data-action="save-settings"',
    ),
    (
        r" onclick=\"closeModal\('profileModal'\);showToast\('Profile updated'\)\"",
        ' data-action="save-profile"',
    ),
    (r' onclick="togglePw\(\)"', ""),
    (r" onclick=\"pickCustomerType\('company'\)\"", ""),
    (r" onclick=\"pickCustomerType\('individual'\)\"", ""),
    (r' onclick="toggleChk\(this\)"', " data-toggle-chk"),
    (
        r" onclick=\"showToast\('Password reset link sent'\)\"",
        ' data-action="forgot-password"',
    ),
    (r' onclick="doLogin\(\)"', ' data-action="login"'),
    (r' onclick="triggerActiveUpload\(\)"', ""),
    (r' onclick="reupload\(\)"', ' data-action="reupload"'),
    (r' onclick="goToReview\(\)"', ""),
    (r' onclick="goScreen\(1\)"', ' data-screen="1"'),
    (r' onclick="goScreen\(2\)"', ' data-screen="2"'),
    (r' onclick="switchFormTab\(0,this\)"', ' data-tab="0"'),
    (r' onclick="switchFormTab\(1,this\)"', ' data-tab="1"'),
    (r' onclick="switchFormTab\(2,this\)"', ' data-tab="2"'),
    (r' onclick="goToAssessment\(\)"', ' data-action="go-assessment"'),
    (r' onclick="newAssessment\(\)"', ' data-action="new-assessment"'),
    (
        r" onclick=\"showToast\('CAM report exported as PDF'\)\"",
        ' data-action="export-cam"',
    ),
]

for pattern, repl in replacements:
    body = re.sub(pattern, repl, body)

html = head + "<body>\n" + body + "\n</body>\n</html>\n"
(ROOT / "index.html").write_text(html, encoding="utf-8")
print("index.html built successfully")
