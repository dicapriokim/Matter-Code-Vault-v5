# Matter Code Vault HA (v3.2.6)

> Matter Device Management & QR Code Backup/Restore Tool (v3.2.6)

Matter Code Vault is a powerful Home Assistant add-on designed for seamless Matter device management. Securely back up complex pairing codes and QR codes, and manage them intelligently using AI-driven features.

---

## 🚀 Installation

To install this add-on, add the following URL to your Home Assistant **Add-on Store** > **Repositories**:

```text
https://github.com/dicapriokim/Matter-Code-Vault-Pcroom.git
```

1. Navigate to **Settings** > **Add-ons** > **Add-on Store** in Home Assistant.
2. Click the **Menu** (3 dots) in the top right corner and select **Repositories**.
3. Paste the URL above and click **Add**.
4. Find **Matter Code Vault** in the list and click **Install**.

---

## ✨ Key Features (v3.2.6 Update)

- **Backend AI Proxy**: Integrated backend proxy to resolve Mixed Content (HTTPS -> HTTP) and CORS issues, ensuring stable AI communication in Home Assistant environments.
- **Dynamic Loading UI**: Soft pulsing "Analyzing..." indicators for AI and standard OCR/QR scans to provide clear visual feedback during processing.
- **Local AI Engine (Ollama)**: Advanced reasoning using `antigravity-model:3b` for intelligent device naming and OCR error correction.
- **Modular Architecture**: Optimized modular structure (`state.js`, `ui.js`, `ai.js`, `scanner.js`) for high performance and maintainability.
- **Dual Storage Vault**: Redundant saving system via HA Backend API and Browser `localStorage`.
- **Creator Mode (🛡️)**: Privacy-focused masking for sensitive QR/pairing codes during screen sharing.
- **Label Ready**: High-quality QR generation optimized for thermal label printers.

---

## 📖 Quick Start Guide

### 1. Initial Setup
Before adding devices, define your ecosystem in the **[Settings ⚙️]** menu to ensure data consistency:
- **Locations**: Living Room, Bedroom, Entrance, etc.
- **Manufacturers**: Aqara, Eve, Nanoleaf, etc.
- **Platforms**: Apple Home, SmartThings, Home Assistant, etc.

### 2. Adding a Device
Click the **[+]** button. You can use your camera or upload a photo from your gallery.
- **AI Suggestion**: Click the 'Magic Wand' icon to receive a recommended name based on device type and location.
- **Manual Entry**: Pairing codes must be entered as an 11-digit number without hyphens or spaces.

---

---

## ⚙️ Configuration

To enable AI features, ensure your **Ollama** server is running:
1. Default URL: `http://192.168.0.32:11434` (configurable in `state.js`).
2. Required Models: `moondream` (Vision), `antigravity-model:3b` (Reasoning).

> **Note**: Core features (registration, backup, etc.) function perfectly even without an AI server.

---

## ⚠️ Important Notes

- **Data Safety**: Data is stored at `/data/matter_data.json`. Always export a JSON backup before deleting the add-on to prevent data loss.
- **Camera Access**: Requires **HTTPS** or **localhost** due to browser security policies. For HTTP access, use the 'Photo Upload' feature.
- **Integrity Check**: Unauthorized modification of core files will trigger a security alert, disabling the app.

---

**Designed by 돼지지렁이**
