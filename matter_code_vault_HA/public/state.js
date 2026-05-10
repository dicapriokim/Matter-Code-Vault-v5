// state.js — Unified State Management (v3.0.7)
// 모든 모듈에서 참조를 공유할 수 있도록 appState 객체로 통합 관리합니다.
// ============================================================

export const APP_VERSION = "3.2.5";

// --- OLLAMA AI CONFIG ---
export const OLLAMA_BASE_URL = "http://192.168.0.32:11434";
export const LOCAL_AI_CONFIG = {
    reasoning: { model: "antigravity-model", role: "뇌 (Brain) — 데이터 정제, 오타 교정, 지능형 작명" },
    keepAlive: "5m",
    timeout: 120000 
};

// --- SINGLE SOURCE OF TRUTH (SSOT) ---
export const appState = {
    devices: [],
    configs: {
        locations: ["현관", "거실", "주방", "안방", "작은방", "화장실", "베란다"],
        platforms: ["SmartThings", "HomeKit", "Google", "Home Assistant", "Hubtiat", "Homey", "ThinQ"],
        manufacturers: ["Aqara", "Philips Hue", "Eve", "Nanoleaf", "IKEA", "TP-Link", "Wiz", "Meross", "Heiman", "Zemismart", "Manhot", "Samsung", "LG"],
        deviceTypes: ["조명", "커튼", "센서", "스위치", "도어락", "허브", "가전"],
        vidMappings: {
            "4107": "Philips Hue", "4305": "LG", "4447": "Aqara", "4476": "IKEA", "4818": "Nanoleaf", "4865": "Eve"
        },
        locationOrder: ["현관", "거실", "주방", "안방", "작은방", "화장실", "베란다"],
        apiKey: ""
    },
    currentVerifiedMt: null,
    viewMode: 'grid',
    activeCategory: 'All',
    html5QrCode: null,
    isScanning: false,
    scanStartTime: 0,
    scanTimer: null,
    lastBlobUrl: null,
    tesseractWorker: null,
    isCreatorMode: false,
    isMobile: false,
    isAiReady: false,
    isOfflineMode: false,
    draggedLocation: null
};

// --- ICON REGISTRY ---
export const ICONS = {
    'lightbulb': '<path d="M9 21h6" /><path d="M12 21v1" /><path d="M10 2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-4Z" /><path d="M6 8a6 6 0 0 1 12 0c0 3.5-2 4.5-3 5.5V17a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-3.5C8 12.5 6 11.5 6 8Z" /><path d="M9.5 9c.5.5 1.5.5 2 0" /><path d="M12.5 10c.5.5 1.5.5 2 0" />',
    'wifi': '<path d="M12 2a10 10 0 0 1 7.07 2.93" /><path d="M12 6a6 6 0 0 1 4.24 1.76" /><path d="M12 10a2 2 0 0 1 1.41.59" /><path d="M12 16h.01" />',
    'router': '<rect width="18" height="12" x="3" y="8" rx="2" /><path d="M3 14h18" /><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2-2v2" /><circle cx="12" cy="11" r="1.5" /><path d="M6 17v2" /><path d="M18 17v2" />',
    'plug': '<path d="M10 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6Z" /><path d="M12 5V3" /><path d="M16 5V3" /><path d="M6 10h4" /><path d="M6 14h4" /><rect width="16" height="16" x="4" y="4" rx="3" fill="none" class="opacity-30" />',
    'toggle-left': '<rect width="16" height="18" x="4" y="3" rx="2" /><path d="M8 8h8" /><path d="M8 16h8" /><rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" fill-opacity="0.1" /><circle cx="12" cy="12" r="2" />',
    'lock': '<rect width="14" height="18" x="5" y="4" rx="2" /><path d="M9 13h6" /><path d="M9 16h6" /><path d="M9 10h6" /><circle cx="12" cy="7" r="1" /><path d="M18 10v6" />',
    'box': '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M12 7v7l4.5 2.5" />',
    'vacuum': '<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M3 12h2" /><path d="M19 12h2" /><path d="M14.5 14.5 19 19" /><path d="M9.5 14.5 5 19" />',
    'curtain': '<path d="M4 4h16" /><path d="M5 4v16c0 1.1.9 2 2 2s2-.9 2-2V4" /><path d="M15 4v16c0 1.1.9 2 2 2s2-.9 2-2V4" /><path d="M4 2h16" />',
    'edit-2': '<path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z"/>',
    'trash': '<path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>',
    'qr-code': '<rect width="5" height="5" x="3" y="3" rx="1"/><rect width="5" height="5" x="16" y="3" rx="1"/><rect width="5" height="5" x="3" y="16" rx="1"/><path d="M21 16h-3a2 2 0 0 0-2 2v3"/><path d="M21 21v.01"/><path d="M12 7v3a2 2 0 0 1-2 2H7"/><path d="M3 12h.01"/><path d="M12 3h.01"/><path d="M12 16v.01"/><path d="M16 12h1"/><path d="M21 12v.01"/><path d="M12 21v-1"/>',
    'chevron-right': '<path d="m9 18 6-6-6-6"/>',
    'check-circle': '<path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>',
    'list': '<line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/>',
    'layout-grid': '<rect width="7" height="7" x="3" y="3" rx="1"/><rect width="7" height="7" x="14" y="3" rx="1"/><rect width="7" height="7" x="14" y="14" rx="1"/><rect width="7" height="7" x="3" y="14" rx="1"/>',
    'x': '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
    'eye': '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
    'camera': '<path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/>',
    'info': '<circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/>',
    'tag': '<path d="M12 2H2v10l9.29 9.29c.94.94 2.48.94 3.42 0l6.58-6.58c.94-.94.94-2.48 0-3.42L12 2Z"/><path d="M7 7h.01"/>'
};

// --- INITIALIZATION ---
export async function initState() {
    console.log("[State] Initializing unified appState...");
    const timestamp = Date.now();
    let serverSuccess = false;

    try {
        // 1. HA Config Sync
        try {
            const configRes = await fetch(`api/config?t=${timestamp}`);
            if (configRes.ok) {
                const addonConfig = await configRes.json();
                if (addonConfig.api_key) appState.configs.apiKey = addonConfig.api_key;
            }
        } catch (e) { console.warn("[State] HA config sync failed:", e); }

        // 2. Data Sync
        const res = await fetch(`api/data?t=${timestamp}`);
        if (res.ok) {
            const json = await res.json();
            const impDevices = json.devices || (Array.isArray(json) ? json : []);
            const impConfigs = json.configs || json.settings || {};

            if (impDevices.length > 0) appState.devices = impDevices;
            if (Object.keys(impConfigs).length > 0) {
                Object.assign(appState.configs, impConfigs);
                if (!appState.configs.locationOrder) appState.configs.locationOrder = [...appState.configs.locations];
            }
            
            serverSuccess = true;
            appState.isOfflineMode = false;
            console.log(`[State] Server data loaded: ${appState.devices.length} devices`);
            syncToLocalCache();
        }
    } catch (e) { console.warn("[State] Server fetch failed:", e.message); }

    if (!serverSuccess) {
        const cache = localStorage.getItem('matter_vault_cache');
        if (cache) {
            const json = JSON.parse(cache);
            appState.devices = json.devices || [];
            appState.configs = json.configs || appState.configs;
            appState.isOfflineMode = true;
            console.log("[State] Loaded from local cache.");
        }
    }
    
    // Sync to window for modules
    window.appState = appState;
    return true;
}

export function syncToLocalCache() {
    try {
        localStorage.setItem('matter_vault_cache', JSON.stringify({ devices: appState.devices, configs: appState.configs }));
    } catch (e) { console.warn("[State] Cache sync failed:", e); }
}

export async function saveData() {
    console.log("[State] Saving appState...");
    syncToLocalCache();
    try {
        const res = await fetch(`api/data?t=${Date.now()}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ devices: appState.devices, configs: appState.configs })
        });
        if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
        console.log("[State] Server save successful.");
    } catch (e) {
        console.error("[State] Server save failed:", e);
        if (window.showToast) window.showToast("⚠️ 서버 저장 실패! 로컬 캐시에 저장됨");
    }
}

// Window Bindings for Compatibility
if (typeof window !== 'undefined') {
    if(!window.app) window.app = {};
    window.app.state = { appState, APP_VERSION, OLLAMA_BASE_URL, LOCAL_AI_CONFIG, initState, saveData, syncToLocalCache, ICONS };
    window.appState = appState;
}
