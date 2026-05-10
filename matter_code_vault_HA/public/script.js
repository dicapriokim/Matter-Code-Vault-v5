window.APP_VERSION = "0.0.0";
window.CURRENT_AI_MODEL = "antigravity-model:3b";
window.VISION_MODEL = "moondream";
window.REASONING_MODEL = "antigravity-model:3b";
window.OLLAMA_PROXY_URL = "api/ai";

import './utils.js';
import './ui.js';
import './scanner.js';
import './ai.js';


// --- STATE MANAGEMENT ---
window.devices = [];
window.configs = {
    locations: ["현관", "거실", "주방", "안방", "작은방", "화장실", "베란다"],
    platforms: ["SmartThings", "HomeKit", "Google", "Home Assistant", "Hubtiat", "Homey", "ThinQ"],
    manufacturers: ["Aqara", "Philips Hue", "Eve", "Nanoleaf", "IKEA", "TP-Link", "Wiz", "Meross", "Heiman", "Zemismart", "Manhot", "Samsung", "LG"],
    deviceTypes: ["조명", "커튼", "센서", "스위치", "도어락", "허브", "가전"],
    vidMappings: {
        "4107": "Philips Hue",
        "4305": "LG",
        "4447": "Aqara",
        "4476": "IKEA",
        "4818": "Nanoleaf",
        "4865": "Eve"
    },
    locationOrder: ["현관", "거실", "주방", "안방", "작은방", "화장실", "베란다"],
    apiKey: ""
};

window.currentVerifiedMt = null;
window.viewMode = 'grid';
window.activeCategory = 'All';
window.html5QrCode = null;
window.isScanning = false;
window.scanStartTime = 0;
window.scanTimer = null;
window.lastBlobUrl = null;
window.tesseractWorker = null;
window.isCreatorMode = false;
window.isMobile = false;


// --- INIT & INGRESS ---
(async function init() {
    checkMobileEnvironment();
    await loadData();

    // Initial UI Setup
    // document.getElementById('apiKeyInput').value = configs.apiKey || ""; // Element removed
    renderLocationTags();
    renderManufacturerTags();
    renderPlatformTags();
    renderDeviceTypeTags();
    renderVidMappings();
    renderCategoryFilters();
    updateViewToggleButton();
    renderDevices();
    renderLocationReorderBar();

    // Initial verification
    _verify();
    updateVersionDisplay();

    // Setup Listeners
    setupEventListeners();
})();

function checkMobileEnvironment() {
    // Robust detection for Home Assistant Companion App (Ingress/Iframe)
    const ua = navigator.userAgent || navigator.vendor || window.opera;
    const isIOS = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isAndroid = /android/i.test(ua);
    const isLikeMobile = window.innerWidth <= 768; // Tailwind sm breakpoint

    isMobile = isIOS || isAndroid || isLikeMobile;

    console.log(`Environment Detect: Mobile=${isMobile} (UA: ${ua}, Width: ${window.innerWidth})`);
}


// --- API CLIENT ---

// --- API CLIENT ---

// --- API CLIENT ---
async function loadData() {
    showToast("데이터를 불러오는 중..."); // Initial feedback
    const timestamp = Date.now();
    try {
        // 1. Fetch Add-on Config (for API Key) - Cache Busting
        try {
            const configRes = await fetch(`api/config?t=${timestamp}`);
            if (configRes.ok) {
                const addonConfig = await configRes.json();
                if (addonConfig.version) {
                    window.APP_VERSION = addonConfig.version;
                    // Update UI Version Displays
                    document.querySelectorAll('.app-version').forEach(el => el.textContent = 'v' + window.APP_VERSION);
                    document.title = `Matter Code Vault v${window.APP_VERSION}`;
                }
            }
        } catch (configErr) {
            console.warn("Failed to sync HA config:", configErr);
        }

        // 2. Fetch Persistent Data - Cache Busting
        const res = await fetch(`api/data?t=${timestamp}`);
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        const json = await res.json();

        // Handle migration & initialization
        if (Array.isArray(json)) {
            if (json.length > 0) window.devices = json;
        } else if (json.devices) {
            window.devices = json.devices || [];
            // Merge settings but prefer HA config for API key if it exists
            if (json.settings) {
                window.configs = { ...configs, ...json.settings };
                // v2.20.3: Ensure locationOrder exists
                if (!configs.locationOrder) configs.locationOrder = [...configs.locations];
            }
        }
        // Success feedback implicit by rendering
        renderDevices(); // Ensure render happens after load
    } catch (e) {
        console.error("Load Data Error:", e);
        showToast("데이터 불러오기 실패: " + e.message);
        // Show error in list
        const list = document.getElementById('deviceList');
        if (list) list.innerHTML = `<div class="col-span-full text-center py-10 text-red-400 font-bold">데이터 로드 실패<br><span class="text-xs font-normal text-slate-400">${e.message}</span></div>`;
    }
}

async function saveData() {
    const payload = {
        devices: devices,
        settings: configs
    };
    try {
        // Cache busting on save as well
        const res = await fetch(`api/data?t=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

        const result = await res.json();
        if (!result.success) throw new Error("Server rejected save");

        // Optional: meaningful success log, but keep UI quiet for auto-saves
        // unless it's a critical manual action which usually calls showToast separately
    } catch (e) {
        console.error("Save Data Error:", e);
        showToast("⚠️ 저장 실패! (데이터가 손실될 수 있습니다)");
    }
}


// --- CORE LOGIC ---
function _verify() {
    const _m = "\ub3fc\uc9c0\uc9c0\ub801\uc774";
    // This check might fail if the HTML structure doesn't exactly match the 'devSignature' ID
    // We ensure to keep it in index.html
    const sig = document.getElementById('devSignature');
    if (!sig || !sig.textContent.includes(_m)) {
        document.getElementById('unauthorizedOverlay').style.display = 'flex';
        const main = document.getElementById('mainContainer');
        if (main) main.remove();
    }
}

function updateVersionDisplay() {
    const footerEl = document.getElementById('versionInfoFooter');
    if (footerEl) footerEl.textContent = `© 2026 Matter Code Vault | Designed by 돼지지렁이 v.${APP_VERSION}`;
}

function setupEventListeners() {
    document.addEventListener('keydown', (e) => {
        if (e.altKey && (e.code === 'KeyC')) { e.preventDefault(); toggleCreatorMode(); }
    });

    const aiInput = document.getElementById('aiQaInput');
    if (aiInput) {
        aiInput.addEventListener('keypress', function (e) {
            if (e.key === 'Enter') { sendAiQuery(); }
        });
    }
}



// Window Bindings for HTML Inline Events & Scope Sharing
if(typeof window !== 'undefined' && !window.app) window.app = {};
window.checkMobileEnvironment = typeof checkMobileEnvironment !== 'undefined' ? checkMobileEnvironment : window.checkMobileEnvironment;
if(typeof window.app !== 'undefined') window.app.checkMobileEnvironment = window.checkMobileEnvironment;
window.loadData = typeof loadData !== 'undefined' ? loadData : window.loadData;
if(typeof window.app !== 'undefined') window.app.loadData = window.loadData;
window.saveData = typeof saveData !== 'undefined' ? saveData : window.saveData;
if(typeof window.app !== 'undefined') window.app.saveData = window.saveData;
window._verify = typeof _verify !== 'undefined' ? _verify : window._verify;
if(typeof window.app !== 'undefined') window.app._verify = window._verify;
window.updateVersionDisplay = typeof updateVersionDisplay !== 'undefined' ? updateVersionDisplay : window.updateVersionDisplay;
if(typeof window.app !== 'undefined') window.app.updateVersionDisplay = window.updateVersionDisplay;
window.setupEventListeners = typeof setupEventListeners !== 'undefined' ? setupEventListeners : window.setupEventListeners;
if(typeof window.app !== 'undefined') window.app.setupEventListeners = window.setupEventListeners;
window.APP_VERSION = typeof APP_VERSION !== 'undefined' ? APP_VERSION : window.APP_VERSION;
if(typeof window.app !== 'undefined') window.app.APP_VERSION = window.APP_VERSION;
window.CURRENT_AI_MODEL = typeof CURRENT_AI_MODEL !== 'undefined' ? CURRENT_AI_MODEL : window.CURRENT_AI_MODEL;
if(typeof window.app !== 'undefined') window.app.CURRENT_AI_MODEL = window.CURRENT_AI_MODEL;
window.devices = typeof devices !== 'undefined' ? devices : window.devices;
if(typeof window.app !== 'undefined') window.app.window.devices = window.devices;
window.configs = typeof configs !== 'undefined' ? configs : window.configs;
if(typeof window.app !== 'undefined') window.app.window.configs = window.configs;
window.currentVerifiedMt = typeof currentVerifiedMt !== 'undefined' ? currentVerifiedMt : window.currentVerifiedMt;
if(typeof window.app !== 'undefined') window.app.currentVerifiedMt = window.currentVerifiedMt;
window.viewMode = typeof viewMode !== 'undefined' ? viewMode : window.viewMode;
if(typeof window.app !== 'undefined') window.app.window.viewMode = window.viewMode;
window.activeCategory = typeof activeCategory !== 'undefined' ? activeCategory : window.activeCategory;
if(typeof window.app !== 'undefined') window.app.window.activeCategory = window.activeCategory;
window.html5QrCode = typeof html5QrCode !== 'undefined' ? html5QrCode : window.html5QrCode;
if(typeof window.app !== 'undefined') window.app.window.html5QrCode = window.html5QrCode;
window.isScanning = typeof isScanning !== 'undefined' ? isScanning : window.isScanning;
if(typeof window.app !== 'undefined') window.app.window.isScanning = window.isScanning;
window.scanStartTime = typeof scanStartTime !== 'undefined' ? scanStartTime : window.scanStartTime;
if(typeof window.app !== 'undefined') window.app.window.scanStartTime = window.scanStartTime;
window.scanTimer = typeof scanTimer !== 'undefined' ? scanTimer : window.scanTimer;
if(typeof window.app !== 'undefined') window.app.window.scanTimer = window.scanTimer;
window.lastBlobUrl = typeof lastBlobUrl !== 'undefined' ? lastBlobUrl : window.lastBlobUrl;
if(typeof window.app !== 'undefined') window.app.window.lastBlobUrl = window.lastBlobUrl;
window.tesseractWorker = typeof tesseractWorker !== 'undefined' ? tesseractWorker : window.tesseractWorker;
if(typeof window.app !== 'undefined') window.app.window.tesseractWorker = window.tesseractWorker;
window.isCreatorMode = typeof isCreatorMode !== 'undefined' ? isCreatorMode : window.isCreatorMode;
if(typeof window.app !== 'undefined') window.app.window.isCreatorMode = window.isCreatorMode;
window.isMobile = typeof isMobile !== 'undefined' ? isMobile : window.isMobile;
if(typeof window.app !== 'undefined') window.app.isMobile = window.isMobile;
