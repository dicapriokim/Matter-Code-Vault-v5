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


// --- HELPERS ---
function toggleCreatorMode() {
    window.isCreatorMode = !isCreatorMode;
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
        
        // 1. Matter 표준 Base38 블록 디코딩 (5 chars -> 3 bytes)
        let bytes = [];
        let offset = 0;
        while (offset < base38Data.length) {
            let len = Math.min(5, base38Data.length - offset);
            let chars = base38Data.substring(offset, offset + len);
            let val = 0;
            let multiplier = 1;
            for (let i = 0; i < len; i++) {
                const charIndex = base38Alphabet.indexOf(chars[i]);
                if (charIndex === -1) return null;
                val += charIndex * multiplier;
                multiplier *= 38;
            }
            if (len >= 2) bytes.push(val & 0xFF);
            if (len >= 4) bytes.push((val >> 8) & 0xFF);
            if (len === 5) bytes.push((val >> 16) & 0xFF);
            offset += len;
        }

        // 2. 바이트 배열을 하나의 리틀엔디안 BigInt로 결합
        let bigIntValue = BigInt(0);
        for (let i = 0; i < bytes.length; i++) {
            bigIntValue |= BigInt(bytes[i]) << BigInt(i * 8);
        }

        // 3. 비트 추출 (Matter Payload 구조)
        const vid = Number((bigIntValue >> BigInt(3)) & BigInt(0xFFFF));
        const discriminator = Number((bigIntValue >> BigInt(45)) & BigInt(0xFFF));
        const setupPin = Number((bigIntValue >> BigInt(57)) & BigInt(0x7FFFFFF));

        // 4. 11자리 수동 코드 연산 (Matter Spec 5.1.4.1)
        const shortDiscriminator = discriminator >> 8;
        const digit1 = (shortDiscriminator >> 2) & 0x3;
        const digit2To6 = ((shortDiscriminator & 0x3) << 14) | (setupPin & 0x3FFF);
        const digit7To10 = (setupPin >> 14) & 0x1FFF;

        const manualCodeStr = `${digit1}${String(digit2To6).padStart(5, '0')}${String(digit7To10).padStart(4, '0')}`;

        // 5. Verhoeff Checksum (Check Digit 생성)
        const d = [
            [0,1,2,3,4,5,6,7,8,9], [1,2,3,4,0,6,7,8,9,5], [2,3,4,0,1,7,8,9,5,6],
            [3,4,0,1,2,8,9,5,6,7], [4,0,1,2,3,9,5,6,7,8], [5,9,8,7,6,0,4,3,2,1],
            [6,5,9,8,7,1,0,4,3,2], [7,6,5,9,8,2,1,0,4,3], [8,7,6,5,9,3,2,1,0,4],
            [9,8,7,6,5,4,3,2,1,0]
        ];
        const p = [
            [0,1,2,3,4,5,6,7,8,9], [1,5,7,6,2,8,3,0,9,4], [5,8,0,3,7,9,6,1,4,2],
            [8,9,1,6,0,4,3,5,2,7], [9,4,5,3,1,2,6,8,7,0], [4,2,8,6,5,7,3,9,0,1],
            [2,7,9,3,8,0,6,4,1,5], [7,0,4,6,9,1,3,2,5,8]
        ];
        const inv = [0,4,3,2,1,5,6,7,8,9];

        let c = 0;
        let reversed = manualCodeStr.split('').reverse();
        for (let i = 0; i < reversed.length; i++) {
            c = d[c][p[(i + 1) % 8][parseInt(reversed[i])]];
        }
        
        const fullCode = manualCodeStr + inv[c];
        const formattedManualCode = `${fullCode.substring(0,4)}-${fullCode.substring(4,7)}-${fullCode.substring(7,11)}`;

        return { vid, setupPin, discriminator, manualCode: formattedManualCode };
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
        selectEl.value = vendorName; 
        selectEl.classList.remove('is-default');
        showToast(`제조사 자동 선택: ${vendorName}`);
    } else { showToast(`제조사 정보 없음 (VID: ${decoded.vid})`); }
}



// Window Bindings for HTML Inline Events & Scope Sharing
if(typeof window !== 'undefined' && !window.app) window.app = {};
window.getSvg = typeof getSvg !== 'undefined' ? getSvg : window.getSvg;
if(typeof window.app !== 'undefined') window.app.getSvg = window.getSvg;
window.toggleCreatorMode = typeof toggleCreatorMode !== 'undefined' ? toggleCreatorMode : window.toggleCreatorMode;
if(typeof window.app !== 'undefined') window.app.toggleCreatorMode = window.toggleCreatorMode;
window.getDisplayData = typeof getDisplayData !== 'undefined' ? getDisplayData : window.getDisplayData;
if(typeof window.app !== 'undefined') window.app.getDisplayData = window.getDisplayData;
window.renderVidMappings = typeof renderVidMappings !== 'undefined' ? renderVidMappings : window.renderVidMappings;
if(typeof window.app !== 'undefined') window.app.renderVidMappings = window.renderVidMappings;
window.autoFillVid = typeof autoFillVid !== 'undefined' ? autoFillVid : window.autoFillVid;
if(typeof window.app !== 'undefined') window.app.autoFillVid = window.autoFillVid;
window.addVidMapping = typeof addVidMapping !== 'undefined' ? addVidMapping : window.addVidMapping;
if(typeof window.app !== 'undefined') window.app.addVidMapping = window.addVidMapping;
window.removeVidMapping = typeof removeVidMapping !== 'undefined' ? removeVidMapping : window.removeVidMapping;
if(typeof window.app !== 'undefined') window.app.removeVidMapping = window.removeVidMapping;
window.decodeMatterPayload = typeof decodeMatterPayload !== 'undefined' ? decodeMatterPayload : window.decodeMatterPayload;
if(typeof window.app !== 'undefined') window.app.decodeMatterPayload = window.decodeMatterPayload;
window.applyDecodedInfo = typeof applyDecodedInfo !== 'undefined' ? applyDecodedInfo : window.applyDecodedInfo;
if(typeof window.app !== 'undefined') window.app.applyDecodedInfo = window.applyDecodedInfo;
window.ICONS = typeof ICONS !== 'undefined' ? ICONS : window.ICONS;
if(typeof window.app !== 'undefined') window.app.ICONS = window.ICONS;
