import fs from 'fs';

const path = 'index.html';
let html = fs.readFileSync(path, 'utf8');

html = html.replace(/<!-- legacy styles removed[\s\S]*?<\/style>\s*/s, '');
html = html.replace(/<script>[\s\S]*?<\/script>\s*(?=<\/body>)/, '');

const replacements = [
  [/ onclick="toggleDropdown\(event\)"/g, ''],
  [/ onclick="openModal\('profileModal'\)"/g, ' data-action="open-profile"'],
  [/ onclick="openModal\('settingsModal'\)"/g, ' data-action="open-settings"'],
  [/ onclick="showToast\('Help centre opening…'\)"/g, ' data-action="help"'],
  [/ onclick="logout\(\)"/g, ' data-action="logout"'],
  [/ onclick="if\(event\.target===this\)closeModal\('settingsModal'\)"/g, ''],
  [/ onclick="if\(event\.target===this\)closeModal\('profileModal'\)"/g, ''],
  [/ onclick="closeModal\('settingsModal'\)"/g, ' data-close-modal="settingsModal"'],
  [/ onclick="closeModal\('profileModal'\)"/g, ' data-close-modal="profileModal"'],
  [/ onclick="setTheme\('light'\)"/g, ''],
  [/ onclick="setTheme\('dark'\)"/g, ''],
  [/ onclick="setTheme\('system'\)"/g, ''],
  [/ onclick="this\.classList\.toggle\('on'\)"/g, ' data-toggle'],
  [/ onclick="closeModal\('settingsModal'\);showToast\('Settings saved'\)"/g, ' data-action="save-settings"'],
  [/ onclick="closeModal\('profileModal'\);showToast\('Profile updated'\)"/g, ' data-action="save-profile"'],
  [/ onclick="togglePw\(\)"/g, ''],
  [/ onclick="pickCustomerType\('company'\)"/g, ''],
  [/ onclick="pickCustomerType\('individual'\)"/g, ''],
  [/ onclick="toggleChk\(this\)"/g, ' data-toggle-chk'],
  [/ onclick="showToast\('Password reset link sent'\)"/g, ' data-action="forgot-password"'],
  [/ onclick="doLogin\(\)"/g, ' data-action="login"'],
  [/ onclick="triggerActiveUpload\(\)"/g, ''],
  [/ onclick="reupload\(\)"/g, ' data-action="reupload"'],
  [/ onclick="goToReview\(\)"/g, ''],
  [/ onclick="goScreen\(1\)"/g, ' data-screen="1"'],
  [/ onclick="goScreen\(2\)"/g, ' data-screen="2"'],
  [/ onclick="switchFormTab\(0,this\)"/g, ' data-tab="0"'],
  [/ onclick="switchFormTab\(1,this\)"/g, ' data-tab="1"'],
  [/ onclick="switchFormTab\(2,this\)"/g, ' data-tab="2"'],
  [/ onclick="goToAssessment\(\)"/g, ' data-action="go-assessment"'],
  [/ onclick="newAssessment\(\)"/g, ' data-action="new-assessment"'],
  [/ onclick="showToast\('CAM report exported as PDF'\)"/g, ' data-action="export-cam"'],
];

for (const [re, rep] of replacements) {
  html = html.replace(re, rep);
}

if (!html.includes('src="/src/main.js"')) {
  html = html.replace(
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.5.0/dist/tabler-icons.min.css">',
    '<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.5.0/dist/tabler-icons.min.css">\n<script type="module" src="/src/main.js"></script>',
  );
}

fs.writeFileSync(path, html);
console.log('index.html migrated');
