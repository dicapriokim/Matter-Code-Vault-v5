const fs = require('fs');
const path = require('path');

// 1. Read package.json (Single Source of Truth)
const pkgPath = path.join(__dirname, 'matter_code_vault_HA', 'package.json');
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const version = pkg.version;

console.log(`[Sync] Starting version synchronization to v${version}...`);

// 2. Update config.yaml
const configPath = path.join(__dirname, 'matter_code_vault_HA', 'config.yaml');
let configContent = fs.readFileSync(configPath, 'utf8');
configContent = configContent.replace(/version: ".*"/, `version: "${version}"`);
fs.writeFileSync(configPath, configContent);
console.log('✔ config.yaml updated.');

// 3. Update README.md (All occurrences)
const readmePath = path.join(__dirname, 'README.md');
let readmeContent = fs.readFileSync(readmePath, 'utf8');

// Title & Subtitle
readmeContent = readmeContent.replace(/# Matter Code Vault.* \(v.*\)/g, `# Matter Code Vault (v${version})`);
readmeContent = readmeContent.replace(/> Matter Device Management & QR Code Backup\/Restore Tool \(v.*\)/g, `> Matter Device Management & QR Code Backup/Restore Tool (v${version})`);

// Guide Section
readmeContent = readmeContent.replace(/## 📖 Quick Start Guide \(v.*\)/g, `## 📖 Quick Start Guide (v${version})`);

// Footer Signature
readmeContent = readmeContent.replace(/Designed by \*\*돼지지렁이 \(PigWorm\)\*\* v\..*/g, `Designed by **돼지지렁이 (PigWorm)** v.${version}`);

fs.writeFileSync(readmePath, readmeContent);
console.log('✔ README.md updated.');

// 4. Update index.html (Backup check for hardcoded versions)
const indexPath = path.join(__dirname, 'matter_code_vault_HA', 'public', 'index.html');
let indexContent = fs.readFileSync(indexPath, 'utf8');
// Though we use .app-version placeholders, we keep the <title> tag updated as well
indexContent = indexContent.replace(/<title>Matter Code Vault.*<\/title>/, `<title>Matter Code Vault v${version}</title>`);
fs.writeFileSync(indexPath, indexContent);
console.log('✔ index.html title updated.');

console.log(`[Sync] Done! All files are now synchronized to v${version}.`);
