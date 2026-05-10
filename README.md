# Matter Code Vault (v5.0.3)

> Matter Device Management & QR Code Backup/Restore Tool (v5.0.3)

Matter Code Vault is a powerful Home Assistant add-on designed for seamless Matter device management. Securely back up complex pairing codes and QR codes, and manage them intelligently using AI-driven features.

---

## 🚀 Installation

To install this add-on, add the following URL to your Home Assistant **Add-on Store** > **Repositories**:

```text
https://github.com/dicapriokim/Matter-Code-Vault-v5.git
```

1. Navigate to **Settings** > **Add-ons** > **Add-on Store** in Home Assistant.
2. Click the **Menu** (3 dots) in the top right corner and select **Repositories**.
3. Paste the URL above and click **Add**.
4. Find **Matter Code Vault** in the list and click **Install**.

---

## 🏆 Official Release (v5.0.3)

- **Backend AI Proxy**: Integrated backend proxy to resolve Mixed Content (HTTPS -> HTTP) and CORS issues, ensuring stable AI communication in Home Assistant environments.
- **Dynamic Loading UI**: Soft pulsing "Analyzing..." indicators for AI and standard OCR/QR scans to provide clear visual feedback during processing.
- **Local AI Engine (Ollama)**: Advanced reasoning using `antigravity-model:3b` for intelligent device naming and OCR error correction.
- **Modular Architecture**: Optimized modular structure (`state.js`, `ui.js`, `ai.js`, `scanner.js`) for high performance and maintainability.
- **Official Rebranding (v5.0.3)**: Transitioned from beta to official release as "Matter Code Vault".
- **Enhanced AI Reasoning**: Finalized context-aware AI engine for smart home automation accuracy.
- **Smart Input States**: Polished UI with visual field state indicators for effortless registration.
- **Adaptive Card Actions (v4.2.0)**: Sophisticated multi-stage hover interaction for device management icons.
- **Modal Auto-Scroll**: Intelligent scroll-to-top behavior for all modals to enhance user interaction flow.
- **Label Ready**: High-quality QR generation optimized for thermal label printers.

---

## 📖 Quick Start Guide (v5.0.3)

### 1. Initial Setup
Before adding devices, configure your ecosystem in the **[Settings ⚙️]** menu to ensure data consistency:
- **Locations**: Living Room, Bedroom, Entrance, etc.
- **Manufacturers**: Aqara, Eve, Nanoleaf, etc.
- **Platforms**: Apple Home, SmartThings, Home Assistant, etc.

### 2. Smart Registration & AI
Click the **[+]** button to add a new device.
- **AI Recommendation**: Click the 'Magic Wand' icon for AI-generated device names.
- **Fallback Logic**: If QR scanning fails to extract the pairing code, the system automatically uses OCR data as a backup.
- **Slashed Zero (0) Correction**: The AI is specifically tuned to distinguish between slashed zeros '0' and the digit '8' in pairing codes.

---

## ⚙️ Configuration (AI Proxy)

This add-on features a built-in **Backend AI Proxy** to enable stable communication with local AI servers in HTTPS environments.
1. **Ollama Server**: Set your local AI server IP in the **Add-on Options** (default: `192.168.0.32`).
2. **Required Models**:
   - `moondream` (Vision Pass)
   - `antigravity-model:3b` (Reasoning Pass)
3. **Internal Routing**: Requests are proxied via `api/ai` to bypass browser Mixed Content and CORS restrictions.

> **Note**: Core features (registration, backup, label printing) work perfectly even without an AI server.

---

## ⚠️ Important Notes

- **Data Safety**: Data is stored at `/data/matter_data.json`. Always export a JSON backup before deleting the add-on to prevent data loss.
- **Camera Access**: Requires **HTTPS** or **localhost** due to browser security policies. For HTTP access, use the 'Photo Upload' feature.
- **Integrity Check**: Unauthorized modification of core files will trigger a security alert, disabling the app.

---

---

Designed by **돼지지렁이 (PigWorm)** v.5.0.3

### 📄 라이선스 (License)
이 프로젝트는 **MIT 라이선스** 하에 배포됩니다.  
Copyright (c) 2026 돼지지렁이. All rights reserved.

### 👑 Contributor
- **돼지지렁이** (Antigravity Developer)
