const APP_VERSION = "3.2.1";
const CURRENT_AI_MODEL = "gemini-2.5-flash-preview-09-2025";

// --- STATE MANAGEMENT ---
let devices = [];
let configs = {
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

let currentVerifiedMt = null;
let viewMode = 'grid';
let activeCategory = 'All';
let html5QrCode = null;
let isScanning = false;
let scanStartTime = 0;
let scanTimer = null;
let lastBlobUrl = null;
let tesseractWorker = null;
let isCreatorMode = false;
let isMobile = false;

// --- ICON REGISTRY (Inline SVG Paths) ---
// Using standard Lucide paths to ensure no external dependencies for icons
const ICONS = {
    // Detailed Realistic Icons (v2.20.4)
    'lightbulb': '<path d="M9 21h6" /><path d="M12 21v1" /><path d="M10 2a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1V3a1 1 0 0 0-1-1h-4Z" /><path d="M6 8a6 6 0 0 1 12 0c0 3.5-2 4.5-3 5.5V17a2 2 0 0 1-2 2h-2a2 2 0 0 1-2-2v-3.5C8 12.5 6 11.5 6 8Z" /><path d="M9.5 9c.5.5 1.5.5 2 0" /><path d="M12.5 10c.5.5 1.5.5 2 0" />',
    'wifi': '<path d="M12 2a10 10 0 0 1 7.07 2.93" /><path d="M12 6a6 6 0 0 1 4.24 1.76" /><path d="M12 10a2 2 0 0 1 1.41.59" /><path d="M12 16h.01" />', // Sensor (Symbolic)
    'router': '<rect width="18" height="12" x="3" y="8" rx="2" /><path d="M3 14h18" /><path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" /><circle cx="12" cy="11" r="1.5" /><path d="M6 17v2" /><path d="M18 17v2" />', // Hub/Bridge (Detailed Gate)
    'plug': '<path d="M10 13a2 2 0 0 0 2 2h4a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v6Z" /><path d="M12 5V3" /><path d="M16 5V3" /><path d="M6 10h4" /><path d="M6 14h4" /><rect width="16" height="16" x="4" y="4" rx="3" fill="none" class="opacity-30" />', // Socket/Outlet
    'toggle-left': '<rect width="16" height="18" x="4" y="3" rx="2" /><path d="M8 8h8" /><path d="M8 16h8" /><rect x="7" y="7" width="10" height="10" rx="1" fill="currentColor" fill-opacity="0.1" /><circle cx="12" cy="12" r="2" />', // Rocker Switch
    'lock': '<rect width="14" height="18" x="5" y="4" rx="2" /><path d="M9 13h6" /><path d="M9 16h6" /><path d="M9 10h6" /><circle cx="12" cy="7" r="1" /><path d="M18 10v6" />', // Digital Door Lock
    'box': '<path d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18Z" /><path d="M12 7v7l4.5 2.5" />', // Appliance/Other (Clock style as generic?) -> Reverted to detailed Box or Generic Device? Let's use Appliances
    // Robot Vacuum (Custom detailed)
    'vacuum': '<circle cx="12" cy="12" r="9" /><circle cx="12" cy="12" r="3" /><path d="M12 2v2" /><path d="M12 20v2" /><path d="M3 12h2" /><path d="M19 12h2" /><path d="M14.5 14.5 19 19" /><path d="M9.5 14.5 5 19" />',
    // Curtain (Detailed)
    'curtain': '<path d="M4 4h16" /><path d="M5 4v16c0 1.1.9 2 2 2s2-.9 2-2V4" /><path d="M15 4v16c0 1.1.9 2 2 2s2-.9 2-2V4" /><path d="M4 2h16" />',

    // UI Icons (Preserved or slightly enhanced)
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

}; function getSvg(name, size = 16, className = "") {
    const path = ICONS[name] || ICONS['box']; // Fallback
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-${name} ${className}">${path}</svg>`;
}

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
                if (addonConfig.api_key) {
                    configs.apiKey = addonConfig.api_key;
                    console.log("Synced API Key from HA Options");
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
            if (json.length > 0) devices = json;
        } else if (json.devices) {
            devices = json.devices || [];
            // Merge settings but prefer HA config for API key if it exists
            if (json.settings) {
                const savedKey = json.settings.apiKey;
                const tempKey = configs.apiKey; // Keep the one we just fetched from HA
                configs = { ...configs, ...json.settings };
                // v2.20.3: Ensure locationOrder exists
                if (!configs.locationOrder) configs.locationOrder = [...configs.locations];

                // If HA config has key, it overrides saved key
                if (tempKey) configs.apiKey = tempKey;
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

// --- HELPERS ---
function toggleCreatorMode() {
    isCreatorMode = !isCreatorMode;
    const watermark = document.getElementById('creator-watermark');
    const toggleBtn = document.getElementById('btn-creator-toggle');

    // Here we use getSvg for dynamic button update
    if (isCreatorMode) {
        watermark.style.display = 'block';
        toggleBtn.className = "bg-red-100 text-red-600 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95 border border-red-200";
        toggleBtn.innerHTML = getSvg('camera', 16);
        showToast("🎥 크리에이터 모드 ON");
    } else {
        watermark.style.display = 'none';
        toggleBtn.className = "bg-slate-200 text-slate-400 w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-sm active:scale-95";
        toggleBtn.innerHTML = getSvg('eye', 16);
        showToast("🔒 크리에이터 모드 OFF");
    }
    renderDevices();
}

function getDisplayData(originalValue, type) {
    if (!isCreatorMode) return originalValue;
    // Precision Masking v2.20.3: Only PairCode and Payload/QR are masked.
    // Name and Manufacturer are ALWAYS EXPOSED.
    if (type === 'code') return originalValue ? originalValue.replace(/\d/g, '9') : '0000-000-0000';
    else if (type === 'payload') return 'MT:DEMO-DATA-PROTECTED-0000';
    else if (type === 'name') return originalValue; // Explicitly return original
    return originalValue;
}

function renderVidMappings() {
    const container = document.getElementById('vidMappingList');
    const selectEl = document.getElementById('newVidManufacturerSelect');
    if (!container || !selectEl) return;

    // Always re-render to ensure freshness (Fixed per request)
    const currentVal = selectEl.value;
    selectEl.innerHTML = `<option value="" disabled selected>매핑할 제조사 선택</option>` +
        configs.manufacturers.map(m => `<option value="${m}">${m}</option>`).join('');
    if (currentVal && configs.manufacturers.includes(currentVal)) selectEl.value = currentVal;

    const selectedMft = selectEl.value;
    const mappings = Object.entries(configs.vidMappings);
    const filteredMappings = mappings.filter(([vid, name]) => name === selectedMft);

    if (selectedMft && filteredMappings.length > 0) {
        container.innerHTML = `<div class="mt-3 grid grid-cols-1 gap-2">` +
            `<p class="text-[9px] font-black text-indigo-500 uppercase px-1 mb-1 animate-pop">${selectedMft} 등록된 VID</p>` +
            filteredMappings.map(([vid, name]) => `
                <div class="flex justify-between items-center bg-indigo-50/50 p-2.5 rounded-xl border border-indigo-100 group animate-pop">
                    <div class="flex flex-col">
                        <span class="text-[10px] font-mono font-bold text-indigo-600 leading-none">ID: ${vid}</span>
                    </div>
                    <button onclick="removeVidMapping('${vid}')" class="text-slate-300 hover:text-red-500 transition-colors p-1">
                        ${getSvg('trash-2', 14)}
                    </button>
                </div>
            `).join('') + `</div>`;
        container.classList.remove('hidden');
    } else if (selectedMft) {
        container.innerHTML = `<p class="mt-3 text-[10px] text-slate-400 text-center py-4 bg-slate-50 rounded-xl border border-dashed border-slate-200 animate-pop">${selectedMft}에 매핑된 VID가 없습니다.</p>`;
        container.classList.remove('hidden');
    } else {
        container.innerHTML = '';
        container.classList.add('hidden');
    }
}

function autoFillVid(selectedManufacturer) {
    const vidInput = document.getElementById('newVidInput');
    if (!vidInput || !selectedManufacturer) return;
    let foundVid = Object.keys(configs.vidMappings).find(key => configs.vidMappings[key] === selectedManufacturer);
    if (foundVid) { vidInput.value = foundVid; showToast(`VID 자동 입력: ${foundVid}`); }
    else { vidInput.value = ''; }
    renderVidMappings();
}

function addVidMapping() {
    const vidInput = document.getElementById('newVidInput');
    const mftSelect = document.getElementById('newVidManufacturerSelect');
    const vid = vidInput.value.trim();
    const name = mftSelect.value;
    if (!vid || !name) return showToast("VID와 제조사를 모두 입력하세요.");
    configs.vidMappings[vid] = name;
    saveData();
    renderVidMappings();
    vidInput.value = ''; showToast("VID 매핑 추가됨");
}

function removeVidMapping(vid) {
    delete configs.vidMappings[vid];
    saveData();
    renderVidMappings();
}

// --- MATTER UTILS ---
function decodeMatterPayload(payload) {
    if (!payload || !payload.startsWith("MT:") || payload.length < 10) return null;
    try {
        const base38Alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-.";
        const base38Data = payload.substring(3);
        let bigIntValue = BigInt(0);
        for (let i = base38Data.length - 1; i >= 0; i--) {
            const charCode = base38Alphabet.indexOf(base38Data[i]);
            if (charCode === -1) return null;
            bigIntValue = bigIntValue * BigInt(38) + BigInt(charCode);
        }
        const vid = Number((bigIntValue >> BigInt(3)) & BigInt(0xFFFF));
        const setupPin = Number((bigIntValue >> BigInt(57)) & BigInt(0x7FFFFFF));
        return { vid, setupPin };
    } catch (e) { return null; }
}

function applyDecodedInfo(decoded) {
    const vidDisplay = document.getElementById('vidDisplay');
    if (!decoded) { if (vidDisplay) vidDisplay.innerText = ''; return; }
    if (vidDisplay) { vidDisplay.innerText = `(VID: ${decoded.vid})`; }
    const vendorName = configs.vidMappings[decoded.vid] || configs.vidMappings[String(decoded.vid)];
    if (vendorName) {
        const selectEl = document.getElementById('devManufacturer');
        let exists = Array.from(selectEl.options).some(opt => opt.value === vendorName);
        if (!exists) {
            const opt = document.createElement('option');
            opt.value = vendorName; opt.innerText = vendorName;
            selectEl.appendChild(opt);
        }
        selectEl.value = vendorName; showToast(`제조사 자동 선택: ${vendorName}`);
    } else { showToast(`제조사 정보 없음 (VID: ${decoded.vid})`); }
}

// --- AI & CAMERA ---
async function askGemini(prompt, isJson = false, context = "[AI]") {
    const key = configs.apiKey;
    if (!key) { showToast(`${context} API Key가 설정되지 않았습니다.`); return null; }

    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CURRENT_AI_MODEL}:generateContent?key=${key}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }] })
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error.message);

        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        if (isJson) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        }
        return text;
    } catch (e) { console.error(e); showToast(`${context} 요청 실패`); return null; }
}

function getAIInsights() { document.getElementById('aiQaModal').classList.remove('hidden'); document.getElementById('aiQaInput')?.focus(); }
function closeAiQaModal() { document.getElementById('aiQaModal').classList.add('hidden'); }

async function sendAiQuery() {
    const input = document.getElementById('aiQaInput');
    if (!input) return;
    const output = document.getElementById('aiQaOutput');
    const placeholder = document.getElementById('aiQaPlaceholder');
    const query = input.value.trim();
    if (!query) return;

    placeholder.classList.add('hidden');
    output.innerHTML += `<div class="mb-4 text-right"><span class="bg-indigo-100 text-indigo-800 px-3 py-2 rounded-lg inline-block text-left font-medium">${query}</span></div>`;

    const loadingId = "ai-loading-" + Date.now();
    output.innerHTML += `<div id="${loadingId}" class="mb-4 text-left"><span class="text-slate-400 text-xs animate-pulse">AI 답변 생성 중...</span></div>`;
    output.scrollTop = output.scrollHeight;
    input.value = '';

    const response = await askGemini(query, false, "[AI 질문]");

    const loadingEl = document.getElementById(loadingId);
    if (loadingEl) loadingEl.remove();

    if (response) {
        const html = marked.parse(response);
        output.innerHTML += `<div class="mb-4 text-left"><div class="bg-white border border-slate-200 p-3 rounded-xl inline-block text-left prose-sm max-w-none">${html}</div></div>`;
    } else {
        output.innerHTML += `<div class="mb-4 text-left"><span class="text-red-400 text-xs">AI 응답 실패</span></div>`;
    }
    output.scrollTop = output.scrollHeight;
}

async function suggestDeviceName() {
    const manufacturer = document.getElementById('devManufacturer').value;
    const type = document.getElementById('devType').value;
    const location = document.getElementById('devLoc').value;
    const nameInput = document.getElementById('devName');

    if (!manufacturer || !type) { showToast("제조사와 기기 종류를 먼저 선택해주세요."); return; }

    nameInput.placeholder = "AI가 생각 중...";
    const prompt = `Matter 기기 이름을 한국어로 간결하게 추천해줘. 제조사: ${manufacturer}, 기기 종류: ${type}, 설치 장소: ${location}. 결과만 텍스트로 출력.`;

    const suggestion = await askGemini(prompt, false, "[이름 추천]");
    if (suggestion) { nameInput.value = suggestion.trim(); showToast("이름이 추천되었습니다!"); }
    else nameInput.placeholder = "예: 거실 천장 조명";
}

// --- SCANNING ---
function triggerOcrScan() { document.getElementById('ocrInputFile').click(); }

function triggerFallbackAi() {
    const video = document.querySelector("#qr-reader video");
    if (video) {
        const canvas = document.createElement("canvas");
        canvas.width = video.videoWidth; canvas.height = video.videoHeight;
        canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
        canvas.toBlob(blob => {
            resizeImage(blob, 1024).then(resizedDataUrl => {
                const base64Data = resizedDataUrl.split(',')[1];
                executeAiAnalysis(base64Data);
                stopCamera();
                document.getElementById('fallbackAiBtn').classList.add('hidden');
            });
        }, 'image/jpeg');
    } else showToast("캡처 실패");
}

function startCamera() {
    // Ingress Iframe Permission Handling
    // If getting blocked, we might need to prompt user
    if (window.self !== window.top) {
        console.warn("Running in iframe, camera might be blocked.");
    }

    document.getElementById('cameraModal').style.display = 'flex';
    document.getElementById('cameraLoading').style.display = 'flex';
    document.getElementById('fallbackAiBtn').classList.add('hidden');

    html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
        .then(() => {
            document.getElementById('cameraLoading').style.display = 'none';
            document.getElementById('guideBox').style.display = 'block';
            isScanning = true; scanStartTime = Date.now();
            scanTimer = setInterval(checkTesseractAndFallback, 1000);
        })
        .catch(err => {
            stopCamera();
            console.error(err);
            showToast("카메라 시작 실패 (HTTPS 권한 확인)");
        });
}

function stopCamera() {
    if (html5QrCode && isScanning) {
        html5QrCode.stop().then(() => html5QrCode.clear()).catch(e => { });
    }
    isScanning = false; if (scanTimer) clearInterval(scanTimer);
    document.getElementById('cameraModal').style.display = 'none';
}

function onScanSuccess(decodedText) {
    if (decodedText.startsWith('MT:')) {
        currentVerifiedMt = decodedText;
        document.getElementById('devMtPayload').value = decodedText;
        document.getElementById('displayMtPayload').value = decodedText;
        document.getElementById('qrStatusIcon').classList.remove('hidden');
        const decoded = decodeMatterPayload(decodedText);
        applyDecodedInfo(decoded);
        const currentCode = document.getElementById('devPayload').value;
        if (currentCode && currentCode.replace(/-/g, '').length === 11) {
            showToast("데이터 인식 완료!"); stopCamera();
        } else showToast("QR 인식됨! 숫자를 찾는 중...");
    }
}

async function getTesseractWorker() {
    if (!tesseractWorker) {
        tesseractWorker = await Tesseract.createWorker("eng");
        await tesseractWorker.setParameters({ tessedit_char_whitelist: '0123456789-' });
    }
    return tesseractWorker;
}

async function checkTesseractAndFallback() {
    if (!isScanning) return;
    if (Date.now() - scanStartTime > 5000) document.getElementById('fallbackAiBtn').classList.remove('hidden');
    const video = document.querySelector("#qr-reader video");
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth; canvas.height = video.videoHeight;
    canvas.getContext("2d").drawImage(video, 0, 0, canvas.width, canvas.height);
    const ocrCode = await runTesseractVersion2(canvas);
    if (ocrCode) {
        handleInput(ocrCode);
        if (currentVerifiedMt) { showToast("인식 완료!"); stopCamera(); }
        else showToast("숫자 인식됨! QR을 찾는 중...");
    }
}

async function runTesseractVersion2(imageSource) {
    try {
        const worker = await getTesseractWorker();
        const { data: { text } } = await worker.recognize(imageSource);
        const match = text.match(/\b(\d{4})[- ]?(\d{3})[- ]?(\d{4})\b/);
        if (match) return match[1] + match[2] + match[3];
        const matchContinuous = text.match(/\b\d{11}\b/);
        return matchContinuous ? matchContinuous[0] : null;
    } catch (e) { return null; }
}

async function processOcrImage(event) {
    const file = event.target.files[0]; if (!file) return;
    const modalContent = document.getElementById('modalContent');
    modalContent.classList.add('ai-border');
    showToast("스마트 분석 중...");
    let processedFile = await convertHeicIfNecessary(file);
    const ocrPromise = new Promise(resolve => {
        const reader = new FileReader();
        reader.onload = (ev) => {
            const img = new Image();
            img.onload = async () => { resolve(await runTesseractVersion2(img)); };
            img.onerror = () => resolve(null); img.src = ev.target.result;
        };
        reader.readAsDataURL(processedFile);
    });
    const qrPromise = new Promise(resolve => {
        let scanner; try { scanner = new Html5Qrcode("qr-reader"); } catch (e) { resolve(null); return; }
        scanner.scanFile(processedFile, false).then(txt => { scanner.clear(); resolve(txt); }).catch(e => { scanner.clear(); resolve(null); });
    });
    try {
        const [ocrCode, qrCode] = await Promise.all([ocrPromise, qrPromise]);
        if (qrCode && qrCode.startsWith('MT:')) {
            currentVerifiedMt = qrCode;
            document.getElementById('devMtPayload').value = qrCode;
            document.getElementById('displayMtPayload').value = qrCode;
            document.getElementById('qrStatusIcon').classList.remove('hidden');
            applyDecodedInfo(decodeMatterPayload(qrCode));
        }
        if (ocrCode) handleInput(ocrCode);
        modalContent.classList.remove('ai-border');
        if (ocrCode || qrCode) showToast("분석 성공!"); else showToast("인식 정보 없음");
    } catch (e) { modalContent.classList.remove('ai-border'); showToast("분석 오류"); }
    event.target.value = '';
}

async function convertHeicIfNecessary(file) {
    if (file.name.toLowerCase().endsWith(".heic") || file.type.includes("heic")) {
        try {
            const result = await heic2any({ blob: file, toType: "image/jpeg" });
            return new File([Array.isArray(result) ? result[0] : result], file.name.replace(/\.[^/.]+$/, ".jpg"), { type: "image/jpeg" });
        } catch (e) { return file; }
    } return file;
}

function resizeImage(file, maxDimension) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            let w = img.width, h = img.height;
            if (w > h) { if (w > maxDimension) { h *= maxDimension / w; w = maxDimension; } }
            else { if (h > maxDimension) { w *= maxDimension / h; h = maxDimension; } }
            const canvas = document.createElement('canvas');
            canvas.width = w; canvas.height = h;
            canvas.getContext('2d').drawImage(img, 0, 0, w, h);
            resolve(canvas.toDataURL('image/jpeg', 0.8));
        };
        img.onerror = reject; img.src = URL.createObjectURL(file);
    });
}

async function executeAiAnalysis(base64Data) {
    const key = configs.apiKey; if (!key) return showToast("API Key 필요");
    const modalContent = document.getElementById('modalContent');
    modalContent.classList.add('ai-border'); showToast("AI 정밀 판독...");
    try {
        const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${CURRENT_AI_MODEL}:generateContent?key=${key}`, {
            method: 'POST', headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                contents: [{ parts: [{ text: "Extract Matter QR (MT:...) and 11-digit pairing code as JSON {mt, code}." }, { inlineData: { mimeType: "image/jpeg", data: base64Data } }] }]
            })
        });
        const data = await res.json();

        const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
        if (text) {
            const match = text.match(/\{[\s\S]*\}/);
            if (match) {
                const info = JSON.parse(match[0]);
                if (info.code) handleInput(info.code);
                if (info.mt) {
                    currentVerifiedMt = info.mt;
                    document.getElementById('devMtPayload').value = info.mt;
                    document.getElementById('displayMtPayload').value = info.mt;
                    document.getElementById('qrStatusIcon').classList.remove('hidden');
                    applyDecodedInfo(decodeMatterPayload(info.mt));
                }
                showToast("AI 분석 완료");
            }
        }
    } catch (e) { showToast("통신 오류"); }
    finally { modalContent.classList.remove('ai-border'); }
}

async function processAiImage(event) {
    const originalFile = event.target.files[0]; if (!originalFile) return;
    const file = await convertHeicIfNecessary(originalFile);
    try { resizeImage(file, 1024).then(url => executeAiAnalysis(url.split(',')[1])); } catch (e) { showToast("처리 실패"); }
    event.target.value = '';
}

// --- MODALS ---
function openGuideModal() { document.getElementById('guideModal').classList.remove('hidden'); }
function closeGuideModal() { document.getElementById('guideModal').classList.add('hidden'); }
function closeSettingsModal() { document.getElementById('settingsModal').classList.add('hidden'); }

function renderLocationTags() { document.getElementById('locationTags').innerHTML = configs.locations.map(loc => `<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 border border-slate-200">${loc}<button onclick="removeLocation('${loc}')" class="text-slate-400 hover:text-red-500 ml-1">${getSvg('x', 10)}</button></span>`).join(''); }
function renderPlatformTags() { document.getElementById('platformTags').innerHTML = configs.platforms.map(p => `<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 border border-slate-200">${p}<button onclick="removePlatform('${p}')" class="text-slate-400 hover:text-red-500 ml-1">${getSvg('x', 10)}</button></span>`).join(''); }
function renderManufacturerTags() { document.getElementById('manufacturerTags').innerHTML = configs.manufacturers.map(p => `<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 border border-slate-200">${p}<button onclick="removeManufacturer('${p}')" class="text-slate-400 hover:text-red-500 ml-1">${getSvg('x', 10)}</button></span>`).join(''); }
function renderDeviceTypeTags() {
    document.getElementById('deviceTypeTags').innerHTML = configs.deviceTypes.map(t => `<span class="bg-slate-100 text-slate-600 px-2 py-0.5 rounded-md text-[10px] flex items-center gap-1 border border-slate-200">${t}<button onclick="removeDeviceType('${t}')" class="text-slate-400 hover:text-red-500 ml-1">${getSvg('x', 10)}</button></span>`).join('');
    renderCategoryFilters();
}

function addLocation() { const val = document.getElementById('newLocationInput').value.trim(); if (val && !configs.locations.includes(val)) { configs.locations.push(val); saveData(); renderLocationTags(); document.getElementById('newLocationInput').value = ''; } }
function addPlatform() { const val = document.getElementById('newPlatformInput').value.trim(); if (val && !configs.platforms.includes(val)) { configs.platforms.push(val); saveData(); renderPlatformTags(); document.getElementById('newPlatformInput').value = ''; } }
function addManufacturer() { const val = document.getElementById('newManufacturerInput').value.trim(); if (val && !configs.manufacturers.includes(val)) { configs.manufacturers.push(val); saveData(); renderManufacturerTags(); renderVidMappings(); document.getElementById('newManufacturerInput').value = ''; } }
function addDeviceType() { const val = document.getElementById('newDeviceTypeInput').value.trim(); if (val && !configs.deviceTypes.includes(val)) { configs.deviceTypes.push(val); saveData(); renderDeviceTypeTags(); document.getElementById('newDeviceTypeInput').value = ''; } }

function removeLocation(val) {
    // 1. 기본 장소 목록에서 제거
    configs.locations = configs.locations.filter(l => l !== val);
    // 2. 순서 관리 목록에서도 즉시 제거 (데이터 무결성 확보)
    if (configs.locationOrder) {
        configs.locationOrder = configs.locationOrder.filter(l => l !== val);
    }
    saveData();
    renderLocationTags();
    renderLocationReorderBar(); // 핸들 바 즉시 동기화
}
function removePlatform(val) { configs.platforms = configs.platforms.filter(p => p !== val); saveData(); renderPlatformTags(); }
function removeManufacturer(val) {
    configs.manufacturers = configs.manufacturers.filter(p => p !== val);
    // also remove VID mappings? keeping logic from original
    let vidsToRemove = [];
    for (const [vid, mft] of Object.entries(configs.vidMappings)) { if (mft === val) { vidsToRemove.push(vid); } }
    if (vidsToRemove.length > 0) { vidsToRemove.forEach(vid => delete configs.vidMappings[vid]); }
    saveData();
    renderManufacturerTags(); renderVidMappings();
}
function removeDeviceType(val) { configs.deviceTypes = configs.deviceTypes.filter(t => t !== val); saveData(); renderDeviceTypeTags(); }


function showToast(m) { const t = document.getElementById('toast'); t.innerText = m; t.style.opacity = '1'; setTimeout(() => t.style.opacity = '0', 3000); }
function handleInput(val) { const inputEl = document.getElementById('devPayload'); let cleanVal = val.trim(); const numericOnly = cleanVal.replace(/[^0-9]/g, ''); if (numericOnly.length === 11) { inputEl.value = `${numericOnly.slice(0, 4)}-${numericOnly.slice(4, 7)}-${numericOnly.slice(7)}`; } else { inputEl.value = cleanVal; } }

function toggleMtVisibility() {
    const input = document.getElementById('displayMtPayload');
    const open = document.getElementById('iconEyeOpen');
    const closed = document.getElementById('iconEyeClosed');
    if (input.type === 'password') { input.type = 'text'; open.classList.add('hidden'); closed.classList.remove('hidden'); }
    else { input.type = 'password'; open.classList.remove('hidden'); closed.classList.add('hidden'); }
}


function openModal(editId = null) {
    _verify();

    // Always fetch latest data when opening modals
    loadData();

    const mSelect = document.getElementById('devManufacturer');
    mSelect.innerHTML = `<option value="" disabled selected>제조사를 선택하세요</option>` +
        configs.manufacturers.map(m => `<option value="${m}">${m}</option>`).join('');

    const vidEl = document.getElementById('vidDisplay');
    if (vidEl) vidEl.innerText = '';

    document.getElementById('devLoc').innerHTML = configs.locations.map(l => `<option value="${l}">${l}</option>`).join('');
    document.getElementById('devPlatform').innerHTML = configs.platforms.map(p => `<option value="${p}">${p}</option>`).join('');
    document.getElementById('devType').innerHTML = configs.deviceTypes.map(t => `<option value="${t}">${t}</option>`).join('');

    const camBtn = document.getElementById('cameraBtn');
    if (camBtn) { camBtn.style.display = isMobile ? 'flex' : 'none'; }

    document.getElementById('qrStatusIcon').classList.add('hidden');
    currentVerifiedMt = null;
    document.getElementById('displayMtPayload').value = '';
    document.getElementById('devMtPayload').value = '';
    document.getElementById('displayMtPayload').type = 'password';
    document.getElementById('iconEyeOpen').classList.remove('hidden');
    document.getElementById('iconEyeClosed').classList.add('hidden');

    const quickScan = document.getElementById('quickScanSection');
    const dateDisplay = document.getElementById('devDateDisplay');

    if (editId) {
        const d = devices.find(x => String(x.id) === String(editId));
        if (d) {
            document.getElementById('editId').value = editId;
            document.getElementById('devName').value = d.name;
            mSelect.value = d.manufacturer || '';
            document.getElementById('devType').value = d.type || (configs.deviceTypes[0] || '');
            document.getElementById('devLoc').value = d.location;
            document.getElementById('devPlatform').value = d.platform;
            document.getElementById('devRemarks').value = d.remarks || '';
            document.getElementById('devPayload').value = d.payload;
            if (d.mtPayload) {
                currentVerifiedMt = d.mtPayload; document.getElementById('devMtPayload').value = d.mtPayload;
                document.getElementById('displayMtPayload').value = d.mtPayload; document.getElementById('qrStatusIcon').classList.remove('hidden');
                const decoded = decodeMatterPayload(d.mtPayload);
                if (decoded && vidEl) vidEl.innerText = `(VID: ${decoded.vid})`;
            }
            document.getElementById('modalTitle').innerText = '정보 수정';
            if (quickScan) quickScan.classList.add('hidden');
            if (dateDisplay) dateDisplay.innerText = `Registered: ${d.date || ''}`;
        }
    } else {
        document.getElementById('editId').value = '';
        document.getElementById('devName').value = '';
        document.getElementById('devPayload').value = '';
        document.getElementById('devMtPayload').value = '';
        document.getElementById('devRemarks').value = '';
        document.getElementById('modalTitle').innerText = '새 기기 등록';
        if (quickScan) quickScan.classList.remove('hidden');
        if (dateDisplay) dateDisplay.innerText = `Registered: ${new Date().toLocaleDateString()}`;
    }
    document.getElementById('modal').classList.remove('hidden');
    // Icons are static now or inline-svg based, no createIcons needed
}

function closeModal() { document.getElementById('modal').classList.add('hidden'); }
function openSettingsModal() {
    document.getElementById('settingsModal').classList.remove('hidden');
    _verify();
    // Re-fetch to ensure UI is in sync with server state
    loadData();
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilterContainer');
    const types = ['All', ...configs.deviceTypes];
    container.innerHTML = types.map(type => {
        const isActive = activeCategory === type;
        const activeClass = isActive ? "bg-indigo-600 text-white shadow-lg shadow-indigo-500/30" : "bg-white text-slate-500 hover:bg-slate-100 border border-slate-200";
        return `<button onclick="setCategory('${type}')" class="${activeClass} px-4 py-1.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95">${type}</button>`;
    }).join('');
}

function renderLocationReorderBar() {
    const container = document.getElementById('locationReorderContainer');
    if (!container) return;

    // 1. 실제로 기기가 1개 이상 등록된 장소들 추출
    const activeLocations = [...new Set(devices.map(d => d.location))];

    // 2. 현재 설정에 저장된 유효한 장소 목록
    const validLocations = configs.locations || [];

    // 3. 순서 결정 (locationOrder 기준)
    let order = (configs.locationOrder && configs.locationOrder.length > 0)
        ? configs.locationOrder
        : [...validLocations];

    // 4. 최종 필터링: (설정에 존재함) AND (등록된 기기가 있음)
    const finalOrder = order.filter(loc => validLocations.includes(loc) && activeLocations.includes(loc));

    container.innerHTML = finalOrder.map(loc => `
        <div class="bg-white border border-slate-200 px-3 py-1.5 rounded-xl text-[11px] font-bold text-slate-600 flex items-center gap-2.5 cursor-grab active:cursor-grabbing shadow-sm whitespace-nowrap transition-all hover:border-orange-400 hover:shadow-md hover:scale-105 active:scale-95"
             draggable="true" ondragstart="handleDragStart(event, '${loc}')" ondragover="handleDragOver(event)" ondrop="handleDrop(event, '${loc}')" onclick="scrollToLocation('${loc}')">
            <div class="flex flex-col items-center justify-center gap-0.5 text-orange-400 shrink-0">
                <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="m18 8 4 4-4 4M6 8l-4 4 4 4M2 12h20"/></svg>
            </div>
            ${loc}
        </div>`).join('');
}

function scrollToLocation(loc) {
    const element = document.getElementById(`loc-section-${loc}`);
    if (element) {
        // 부드러운 스크롤 이동
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

// --- DRAG & DROP HANDLERS (v2.20.3) ---
let draggedLocation = null;

function handleDragStart(e, loc) {
    draggedLocation = loc;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', loc);
    e.target.classList.add('opacity-50');
}

function handleDragOver(e) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e, targetLoc) {
    e.stopPropagation();
    const headers = document.querySelectorAll('.location-header');
    headers.forEach(h => h.classList.remove('opacity-50'));

    if (draggedLocation !== targetLoc) {
        const order = configs.locationOrder && configs.locationOrder.length > 0 ? [...configs.locationOrder] : [...configs.locations];
        const fromIndex = order.indexOf(draggedLocation);
        const toIndex = order.indexOf(targetLoc);

        if (fromIndex > -1 && toIndex > -1) {
            order.splice(fromIndex, 1);
            order.splice(toIndex, 0, draggedLocation);
            configs.locationOrder = order;
            // Always sync locations array order too for consistency across UI parts
            // configs.locations = [...new Set([...order, ...configs.locations])]; // Optional strategy
            saveData();
            renderDevices();
            renderLocationReorderBar();
            showToast("장소 순서가 변경되었습니다.");
        }
    }
    return false;
}


function setCategory(category) { activeCategory = category; renderCategoryFilters(); renderDevices(); }

function getIconForType(type) {
    if (type.includes('조명') || type.includes('Light')) return 'lightbulb';
    if (type.includes('센서') || type.includes('Sensor')) return 'wifi';
    if (type.includes('허브') || type.includes('Hub')) return 'router';
    if (type.includes('플러그') || type.includes('Plug')) return 'plug';
    if (type.includes('스위치') || type.includes('Switch')) return 'toggle-left';
    if (type.includes('도어') || type.includes('Lock')) return 'lock';
    if (type.includes('커튼') || type.includes('Curtain') || type.includes('블라인드')) return 'curtain';
    if (type.includes('가전') || type.includes('청소기') || type.includes('Vacuum')) return 'vacuum';
    return 'box';
}

function renderDevices() {
    const list = document.getElementById('deviceList');
    const totalStat = document.getElementById('stat-total-devices');
    totalStat.innerText = devices.length;

    const query = document.getElementById('searchInput').value.toLowerCase();

    // 1. Group by Location
    const grouped = {};
    // Initialize groups based on locationOrder to ensure empty sections don't appear unless needed? 
    // Actually user wants to group filtered devices.
    // We should use configs.locationOrder to determine sort order of groups.

    // Ensure locationOrder matches current locations if new ones added
    if (!configs.locationOrder || configs.locationOrder.length === 0) {
        configs.locationOrder = [...configs.locations];
    }
    // Add any missing locations
    configs.locations.forEach(l => {
        if (!configs.locationOrder.includes(l)) configs.locationOrder.push(l);
    });

    const devicesToRender = devices.filter(d => {
        const matchesSearch = d.name.toLowerCase().includes(query) || d.location.toLowerCase().includes(query) ||
            (d.manufacturer && d.manufacturer.toLowerCase().includes(query)) ||
            (d.platform && d.platform.toLowerCase().includes(query)) || (d.type && d.type.toLowerCase().includes(query));
        const matchesCategory = activeCategory === 'All' || d.type === activeCategory;
        return matchesSearch && matchesCategory;
    });

    if (devicesToRender.length === 0) {
        list.className = 'space-y-4'; // Reset grid/list class
        list.innerHTML = '';
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    document.getElementById('emptyState').classList.add('hidden');
    list.className = 'space-y-6'; // Vertical spacing between groups
    list.innerHTML = '';

    // Sort groups by locationOrder
    // [v2.22.7 개선] 기기가 1개 이상 있는 장소만 선별하여 정렬
    const sortedLocations = (configs.locationOrder || configs.locations).filter(loc =>
        devicesToRender.some(d => d.location === loc)
    );

    if (sortedLocations.length === 0) {
        list.className = 'space-y-4';
        list.innerHTML = '';
        document.getElementById('emptyState').classList.remove('hidden');
        return;
    }

    document.getElementById('emptyState').classList.add('hidden');
    list.innerHTML = '';

    sortedLocations.forEach(loc => {
        const groupDevices = devicesToRender.filter(d => d.location === loc);

        // 기기가 0개인 장소는 렌더링 단계에서 완전히 제외 (이중 확인)
        if (groupDevices.length === 0) return;

        groupDevices.sort((a, b) => b.id - a.id);

        const groupHeader = `
            <div id="loc-section-${loc}" class="location-header mt-2 mb-3 bg-slate-100 text-slate-500 font-bold text-[11px] px-3 py-1 rounded-lg flex items-center gap-2 w-fit cursor-grab active:cursor-grabbing transition-all hover:bg-slate-200"
                 draggable="true"
                 ondragstart="handleDragStart(event, '${loc}')"
                 ondragover="handleDragOver(event)"
                 ondrop="handleDrop(event, '${loc}')">
                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="opacity-50"><circle cx="9" cy="12" r="1"/><circle cx="9" cy="5" r="1"/><circle cx="9" cy="19" r="1"/><circle cx="15" cy="12" r="1"/><circle cx="15" cy="5" r="1"/><circle cx="15" cy="19" r="1"/></svg>
                ${loc} (${groupDevices.length})
            </div>
        `;

        let groupContent = '';
        if (viewMode === 'grid') {
            const gridContainer = `<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">`;
            const items = groupDevices.map(d => {
                const displayName = getDisplayData(d.name, 'name');
                const displayPayload = getDisplayData(d.payload, 'code');
                const qrBlurClass = isCreatorMode ? 'creator-blur' : '';
                const textClass = isCreatorMode ? 'creator-text' : '';
                const typeIcon = getIconForType(d.type || '');
                const payloadColor = d.mtPayload ? 'text-blue-600' : 'text-red-500';

                return `
                <div class="bg-white rounded-2xl p-4 border border-slate-100 shadow-sm hover:shadow-md transition-all group relative">
                    <div class="flex justify-between items-start mb-3">
                        <div class="flex items-center gap-3 overflow-hidden">
                            <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                                ${getSvg(typeIcon, 36)}
                            </div>
                            <div class="min-w-0">
                                <h3 class="font-bold text-sm text-slate-800 truncate leading-tight">${displayName}</h3>
                                <p class="text-[10px] text-slate-400 mt-0.5 truncate">${d.manufacturer || 'Unknown'} | ${d.date}</p>
                            </div>
                        </div>
                        <div class="flex gap-1 shrink-0">
                            <button onclick="openModal('${d.id}')" class="p-1.5 text-slate-300 hover:text-indigo-500 transition-colors">${getSvg('edit-2', 14)}</button>
                            <button onclick="confirmDelete('${d.id}')" class="p-1.5 text-slate-300 hover:text-red-500 transition-colors">${getSvg('trash', 14)}</button>
                        </div>
                    </div>
                    <div class="bg-slate-50 rounded-xl p-3 border border-slate-100 mb-3 flex gap-3 items-center cursor-pointer hover:bg-slate-100 transition-colors" onclick="previewImage('${d.id}')">
                        <div class="w-12 h-12 bg-white rounded-lg flex items-center justify-center shrink-0 overflow-hidden relative border border-slate-200 ${qrBlurClass}">
                            ${d.mtPayload ? `<canvas id="canvas-thumb-${d.id}" class="w-full h-full object-contain"></canvas>` : getSvg('qr-code', 20, 'text-slate-300')}
                        </div>
                        <div class="min-w-0 flex-1">
                            <div class="text-[9px] text-slate-400 font-bold mb-0.5 uppercase tracking-wider">Manual Code</div>
                            <div class="text-xs font-mono font-bold ${payloadColor} tracking-wider truncate ${textClass}">${displayPayload}</div>
                        </div>
                    </div>
                    <div class="flex items-center justify-between gap-2">
                        <div class="flex gap-1.5 overflow-x-auto hide-scrollbar">
                            <span class="text-[9px] font-bold px-2 py-1 rounded bg-orange-50 text-orange-600 border border-orange-100 whitespace-nowrap">${d.location}</span>
                            <span class="text-[9px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">${d.platform}</span>
                        </div>
                        ${getSvg('chevron-right', 14, 'text-slate-300')}
                    </div>
                </div>`;
            }).join('');
            groupContent = gridContainer + items + `</div>`;
        } else {
            const listContainer = `<div class="space-y-3">`;
            const items = groupDevices.map(d => {
                const displayName = getDisplayData(d.name, 'name');
                const displayPayload = getDisplayData(d.payload, 'code');
                const textClass = isCreatorMode ? 'creator-text' : '';
                const payloadColor = d.mtPayload ? 'text-blue-600' : 'text-red-500';
                const typeIcon = getIconForType(d.type || '');

                return `
                <div class="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-all" onclick="previewImage('${d.id}')">
                    <div class="flex items-center gap-3 min-w-0 flex-1">
                        <div class="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                            ${getSvg(typeIcon, 36)}
                        </div>
                        <div class="min-w-0">
                            <h3 class="font-bold text-sm text-slate-800 truncate">${displayName}</h3>
                            <p class="text-[10px] text-slate-400 mb-1">${d.manufacturer || 'Unknown'}</p>
                            <div class="flex items-center gap-2 mt-0.5">
                                <span class="text-[9px] font-bold px-2 py-1 rounded bg-orange-50 text-orange-600 border border-orange-100 whitespace-nowrap">${d.location}</span>
                                <span class="text-[9px] font-bold px-2 py-1 rounded bg-blue-50 text-blue-600 border border-blue-100 whitespace-nowrap">${d.platform}</span>
                                <span class="text-[10px] font-mono ${payloadColor} bg-slate-50 px-1.5 rounded border border-slate-100 truncate max-w-[100px] ${textClass}">${displayPayload}</span>
                            </div>
                        </div>
                    </div>
                    <div class="flex gap-1 shrink-0" onclick="event.stopPropagation();">
                        <button onclick="openModal('${d.id}')" class="p-2 text-slate-300 hover:text-indigo-500">${getSvg('edit-2', 16)}</button>
                        <button onclick="confirmDelete('${d.id}')" class="p-2 text-slate-300 hover:text-red-500">${getSvg('trash', 16)}</button>
                    </div>
                </div>`;
            }).join('');
            groupContent = listContainer + items + `</div>`;
        }

        const section = document.createElement('section');
        section.innerHTML = groupHeader + groupContent;
        list.appendChild(section);
    });

    // Post-render QR Canvases
    if (viewMode === 'grid') {
        window.requestAnimationFrame(() => {
            devicesToRender.forEach(d => {
                if (d.mtPayload) {
                    const canvas = document.getElementById(`canvas-thumb-${d.id}`);
                    if (canvas) QRCode.toCanvas(canvas, d.mtPayload, { margin: 0, width: 64, color: { dark: '#334155', light: '#ffffff' } });
                }
            });
        });
    }
}


async function saveDevice() {
    const id = document.getElementById('editId').value;
    const name = document.getElementById('devName').value.trim();
    const payload = document.getElementById('devPayload').value.trim();
    const manufacturer = document.getElementById('devManufacturer').value;
    const mtPayload = document.getElementById('devMtPayload').value;
    const type = document.getElementById('devType').value;
    const location = document.getElementById('devLoc').value;
    const platform = document.getElementById('devPlatform').value;
    const remarks = document.getElementById('devRemarks').value;

    // 1. Validation
    if (!name) { showToast("기기 이름을 입력하세요."); return; }
    if (!payload) { showToast("Pairing Code (11자리 숫자)는 필수입니다."); return; }

    // 2. Confirmation (v2.17.6 Logic)
    if (!confirm("QR(바코드)로 페어링 정상 여부를 확인하세요. 저장하시겠습니까?")) return;

    // 3. Object Construction
    const newDevice = {
        id: id || Date.now(),
        name: name,
        manufacturer: manufacturer,
        type: type,
        location: location,
        platform: platform,
        payload: payload,
        mtPayload: mtPayload || null,
        remarks: remarks,
        date: id ? (devices.find(d => String(d.id) === String(id))?.date || new Date().toLocaleDateString()) : new Date().toLocaleDateString()
    };

    // 4. Update or Unshift
    if (id) {
        const idx = devices.findIndex(d => String(d.id) === String(id));
        if (idx > -1) devices[idx] = newDevice;
    } else {
        devices.unshift(newDevice);
    }

    // 5. VID Learning Logic (v2.17.6)
    if (mtPayload) {
        const decoded = decodeMatterPayload(mtPayload);
        if (decoded && decoded.vid && manufacturer) {
            // Learn mapping if not exists or update
            configs.vidMappings[decoded.vid] = manufacturer;
            configs.vidMappings[String(decoded.vid)] = manufacturer; // Ensure string key coverage
        }
    }

    // 6. Save & Sync
    await saveData();

    // 7. Cleanup
    closeModal();
    renderDevices();
    renderVidMappings(); // Refresh mappings in settings if learned
    showToast(id ? "기기 정보가 수정되었습니다." : "새 기기가 저장되었습니다.");
}

async function previewImage(id) {
    const d = devices.find(x => String(x.id) === String(id)); if (!d) return;
    const canvas = document.createElement('canvas'); const composedCanvas = document.createElement('canvas');
    let previewContent = '';
    const displayPayload = getDisplayData(d.payload, 'code');
    const displayName = getDisplayData(d.name, 'name');
    const isBlur = isCreatorMode;
    const downloadBtn = document.getElementById('downloadImageBtn');

    // Button Visibility Control (v2.17.6)
    if (d.mtPayload) {
        downloadBtn.classList.remove('hidden');
    } else {
        downloadBtn.classList.add('hidden');
    }

    // Helper for download (Fixed: Button trigger only)
    const updateDownloadLink = (finalCanvas) => {
        finalCanvas.toBlob((blob) => {
            if (lastBlobUrl) URL.revokeObjectURL(lastBlobUrl);
            lastBlobUrl = URL.createObjectURL(blob);

            // Remove previous listeners by overwriting onclick
            downloadBtn.onclick = (e) => {
                e.preventDefault(); // Prevent any default button behavior
                const link = document.createElement('a');
                link.href = lastBlobUrl;
                link.download = `Matter_${d.name}_Card.png`; // Improved filename
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            };
        }, 'image/png');
    };
    const decoded = decodeMatterPayload(d.mtPayload);
    const decoderUi = decoded ? `
        <div class="mt-4 p-3 bg-slate-50 rounded-2xl border border-slate-100 text-left">
            <div class="flex items-center gap-1.5 mb-2 border-b border-slate-100 pb-1">${getSvg('info', 12, 'text-indigo-500')}<span class="text-[10px] font-bold text-slate-400 uppercase">Device Info</span></div>
            <div class="grid grid-cols-2 gap-2">
                <div><p class="text-[9px] text-slate-400 font-bold uppercase">Location</p><p class="text-xs font-bold text-slate-700">${d.location}</p></div>
                <div><p class="text-[9px] text-slate-400 font-bold uppercase">Platform</p><p class="text-xs font-bold text-slate-700">${d.platform}</p></div>
            </div>
        </div>` : '';
    const blurStyle = isBlur ? 'filter: blur(8px) grayscale(80%);' : '';

    if (d.mtPayload) {
        // v2.20.3 Precision: Only blur Image if Creator Mode
        await QRCode.toCanvas(canvas, d.mtPayload, { width: 400, margin: 2 });
        // Use inline style for blur if isBlur
        const imgStyle = isBlur ? 'filter: blur(8px) grayscale(80%);' : '';
        previewContent = `<img src="${canvas.toDataURL('image/png')}" class="mx-auto rounded-xl w-64 h-64 mb-4" style="${imgStyle}">`;

        const ctx = composedCanvas.getContext('2d');
        const qrSize = 400; const baseHeight = qrSize + 160; const infoBoxHeight = 140; const totalHeight = decoded ? (baseHeight + infoBoxHeight) : baseHeight;
        composedCanvas.width = qrSize; composedCanvas.height = totalHeight;
        ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, composedCanvas.width, composedCanvas.height);

        // Name is always Clear (v2.20.3)
        ctx.fillStyle = '#1e293b'; ctx.textAlign = 'center'; ctx.font = 'bold 28px sans-serif';
        ctx.fillText(displayName, qrSize / 2, 60);

        // QR Image - no blur in download, but we are just drawing it here.
        // User didn't specify download logic constraints, just "preview".
        ctx.drawImage(canvas, 0, 80);

        // Payload - Blurred if creator mode? Logic says "Name/Mft exposed, Code/QR masked"
        // In Canvas (Download), we usually export clear data. 
        // But the preview HTML `previewContent` handles the blurring view.
        // `displayPayload` variable already handles masking via getDisplayData IF we used 'code' type
        // Wait, getDisplayData(d.payload, 'code') returns masked string "*****". 
        // So canvas will draw "*****". That is correct "Masking".

        ctx.fillStyle = '#64748b'; ctx.font = 'bold 20px monospace';
        ctx.fillText(displayPayload, qrSize / 2, 80 + qrSize + 40);
        if (decoded) {
            const boxTop = 80 + qrSize + 70; const boxX = 20; const boxW = qrSize - 40; const boxH = 120;
            ctx.fillStyle = '#f8fafc'; ctx.fillRect(boxX, boxTop, boxW, boxH);
            ctx.strokeStyle = '#e2e8f0'; ctx.lineWidth = 2; ctx.strokeRect(boxX, boxTop, boxW, boxH);
            ctx.textAlign = 'left'; ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 12px sans-serif';
            ctx.fillText('DEVICE INFO', boxX + 15, boxTop + 30);
            ctx.beginPath(); ctx.moveTo(boxX + 15, boxTop + 45); ctx.lineTo(boxX + boxW - 15, boxTop + 45); ctx.strokeStyle = '#e2e8f0'; ctx.stroke();
            const col1 = boxX + 15; const col2 = boxX + (boxW / 2) + 10; const rowLabel = boxTop + 70; const rowVal = boxTop + 95;
            ctx.fillStyle = '#94a3b8'; ctx.font = 'bold 10px sans-serif';
            ctx.fillText('LOCATION', col1, rowLabel); ctx.fillText('PLATFORM', col2, rowLabel);
            ctx.fillStyle = '#334155'; ctx.font = 'bold 14px sans-serif';
            ctx.fillText(d.location, col1, rowVal); ctx.fillText(d.platform, col2, rowVal);
        }
        updateDownloadLink(composedCanvas);
    } else {
        // Empty State
        previewContent = `<div class="mx-auto w-64 h-64 mb-4 bg-slate-100 rounded-xl flex flex-col items-center justify-center text-slate-400">${getSvg('qr-code', 48, 'mb-2 opacity-50')}<span class="text-sm font-bold">QR 데이터 없음</span></div>`;
    }
    document.getElementById('previewContainer').innerHTML = `<div class="bg-white p-6 rounded-3xl shadow-xl text-center"><h2 class="font-bold text-xl mb-2">${displayName}</h2>${previewContent}<p class="font-mono font-bold text-lg text-slate-700 ${isCreatorMode ? 'creator-text' : ''}">${displayPayload}</p>${decoderUi}</div>`;
    document.getElementById('imageViewer').classList.remove('hidden');
}

function closeImageViewer() {
    document.getElementById('imageViewer').classList.add('hidden');
    if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); lastBlobUrl = null; }
}

function confirmDelete(id) {
    if (confirm("삭제하시겠습니까?")) {
        devices = devices.filter(d => String(d.id) !== String(id));
        saveData();
        renderDevices();
    }
}

function toggleViewMode() { viewMode = viewMode === 'grid' ? 'list' : 'grid'; updateViewToggleButton(); renderDevices(); }
function updateViewToggleButton() { document.getElementById('viewToggleBtn').innerHTML = viewMode === 'grid' ? getSvg('list', 20) : getSvg('layout-grid', 20); }

async function exportData() {
    const dataStr = JSON.stringify({ version: APP_VERSION, date: new Date().toISOString(), devices, settings: configs }, null, 2);
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([dataStr], { type: 'application/json' })); link.download = "matter_backup.json"; link.click();
}
function importData(event) {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const imported = JSON.parse(e.target.result);
            // Support legacy array format
            const impDevices = Array.isArray(imported) ? imported : (imported.devices || []);
            let added = 0; let updated = 0;

            if (impDevices.length > 0) {
                impDevices.forEach(item => {
                    const idx = devices.findIndex(d => d.id === item.id);
                    if (idx > -1) { devices[idx] = item; updated++; }
                    else { devices.unshift(item); added++; }
                });

                if (!Array.isArray(imported) && imported.settings) {
                    configs = { ...configs, ...imported.settings };
                }

                await saveData();

                renderLocationTags(); renderManufacturerTags(); renderPlatformTags(); renderDeviceTypeTags(); renderVidMappings();
                renderDevices();
                showToast(`복구 완료 (기기: ${added}추가/${updated}수정)`);
            }
        } catch (err) { showToast("형식 오류: " + err.message); }
    };
    reader.readAsText(file); event.target.value = '';
}

// [v2.22.3] 최상단 이동 함수
function scrollToTop() {
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// [v2.22.3] 스크롤 위치에 따른 버튼 노출 제어
window.addEventListener('scroll', () => {
    const btn = document.getElementById('backToTopBtn');
    if (!btn) return;
    if (window.scrollY > 300) {
        btn.classList.remove('opacity-0', 'pointer-events-none');
        btn.classList.add('opacity-100', 'pointer-events-all');
    } else {
        btn.classList.add('opacity-0', 'pointer-events-none');
        btn.classList.remove('opacity-100', 'pointer-events-all');
    }
});
