// --- MODALS ---
function openGuideModal() { 
    const modal = document.getElementById('guideModal');
    modal.classList.remove('hidden');
    const scrollable = modal.querySelector('.overflow-y-auto');
    if (scrollable) scrollable.scrollTop = 0;
}
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

            // Remove default state for all selects in edit mode
            ['devManufacturer', 'devType', 'devLoc', 'devPlatform'].forEach(id => {
                document.getElementById(id).classList.remove('is-default');
            });
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

        // Reset to default state for all selects in new mode
        ['devManufacturer', 'devType', 'devLoc', 'devPlatform'].forEach(id => {
            document.getElementById(id).classList.add('is-default');
        });
    }
    document.getElementById('modal').classList.remove('hidden');
    const scrollable = document.querySelector('#modal .overflow-y-auto');
    if (scrollable) scrollable.scrollTop = 0;
    // Icons are static now or inline-svg based, no createIcons needed
}

function closeModal() { document.getElementById('modal').classList.add('hidden'); }
function openSettingsModal() {
    const modal = document.getElementById('settingsModal');
    modal.classList.remove('hidden');
    const scrollable = modal.querySelector('.overflow-y-auto');
    if (scrollable) scrollable.scrollTop = 0;
    _verify();
    // Re-fetch to ensure UI is in sync with server state
    loadData();
}

function renderCategoryFilters() {
    const container = document.getElementById('categoryFilterContainer');
    const types = ['All', ...configs.deviceTypes];
    container.innerHTML = types.map(type => {
        const isActive = window.activeCategory === type;
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


function setCategory(category) { window.activeCategory = category; renderCategoryFilters(); renderDevices(); }

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
        const matchesCategory = window.activeCategory === 'All' || d.type === activeCategory;
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
    // [v3.0.0 개선] 기기가 1개 이상 있는 장소만 선별하여 정렬
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
        if (window.viewMode === 'grid') {
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
                            <button onclick="openModal('${d.id}')" class="card-action-btn p-1.5 text-slate-300 hover:text-indigo-500 transition-colors">${getSvg('edit-2', 14)}</button>
                            <button onclick="confirmDelete('${d.id}')" class="card-action-btn p-1.5 text-slate-300 hover:text-red-500 transition-colors">${getSvg('trash', 14)}</button>
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
                <div class="group bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex items-center justify-between gap-3 cursor-pointer hover:bg-slate-50 transition-all" onclick="previewImage('${d.id}')">
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
                        <button onclick="openModal('${d.id}')" class="card-action-btn p-2 text-slate-300 hover:text-indigo-500">${getSvg('edit-2', 16)}</button>
                        <button onclick="confirmDelete('${d.id}')" class="card-action-btn p-2 text-slate-300 hover:text-red-500">${getSvg('trash', 16)}</button>
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
    if (window.viewMode === 'grid') {
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
            window.lastBlobUrl = URL.createObjectURL(blob);

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
    const scrollable = document.getElementById('imageViewer');
    if (scrollable) scrollable.scrollTop = 0;
}

function closeImageViewer() {
    document.getElementById('imageViewer').classList.add('hidden');
    if (lastBlobUrl) { URL.revokeObjectURL(lastBlobUrl); window.lastBlobUrl = null; }
}

function confirmDelete(id) {
    if (confirm("삭제하시겠습니까?")) {
        window.devices = devices.filter(d => String(d.id) !== String(id));
        saveData();
        renderDevices();
    }
}

function toggleViewMode() { window.viewMode = window.viewMode === 'grid' ? 'list' : 'grid'; updateViewToggleButton(); renderDevices(); }
function updateViewToggleButton() { document.getElementById('viewToggleBtn').innerHTML = window.viewMode === 'grid' ? getSvg('list', 20) : getSvg('layout-grid', 20); }

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
                    window.configs = { ...configs, ...imported.settings };
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


// Window Bindings for HTML Inline Events & Scope Sharing
if(typeof window !== 'undefined' && !window.app) window.app = {};
window.openGuideModal = typeof openGuideModal !== 'undefined' ? openGuideModal : window.openGuideModal;
if(typeof window.app !== 'undefined') window.app.openGuideModal = window.openGuideModal;
window.closeGuideModal = typeof closeGuideModal !== 'undefined' ? closeGuideModal : window.closeGuideModal;
if(typeof window.app !== 'undefined') window.app.closeGuideModal = window.closeGuideModal;
window.closeSettingsModal = typeof closeSettingsModal !== 'undefined' ? closeSettingsModal : window.closeSettingsModal;
if(typeof window.app !== 'undefined') window.app.closeSettingsModal = window.closeSettingsModal;
window.renderLocationTags = typeof renderLocationTags !== 'undefined' ? renderLocationTags : window.renderLocationTags;
if(typeof window.app !== 'undefined') window.app.renderLocationTags = window.renderLocationTags;
window.renderPlatformTags = typeof renderPlatformTags !== 'undefined' ? renderPlatformTags : window.renderPlatformTags;
if(typeof window.app !== 'undefined') window.app.renderPlatformTags = window.renderPlatformTags;
window.renderManufacturerTags = typeof renderManufacturerTags !== 'undefined' ? renderManufacturerTags : window.renderManufacturerTags;
if(typeof window.app !== 'undefined') window.app.renderManufacturerTags = window.renderManufacturerTags;
window.renderDeviceTypeTags = typeof renderDeviceTypeTags !== 'undefined' ? renderDeviceTypeTags : window.renderDeviceTypeTags;
if(typeof window.app !== 'undefined') window.app.renderDeviceTypeTags = window.renderDeviceTypeTags;
window.addLocation = typeof addLocation !== 'undefined' ? addLocation : window.addLocation;
if(typeof window.app !== 'undefined') window.app.addLocation = window.addLocation;
window.addPlatform = typeof addPlatform !== 'undefined' ? addPlatform : window.addPlatform;
if(typeof window.app !== 'undefined') window.app.addPlatform = window.addPlatform;
window.addManufacturer = typeof addManufacturer !== 'undefined' ? addManufacturer : window.addManufacturer;
if(typeof window.app !== 'undefined') window.app.addManufacturer = window.addManufacturer;
window.addDeviceType = typeof addDeviceType !== 'undefined' ? addDeviceType : window.addDeviceType;
if(typeof window.app !== 'undefined') window.app.addDeviceType = window.addDeviceType;
window.removeLocation = typeof removeLocation !== 'undefined' ? removeLocation : window.removeLocation;
if(typeof window.app !== 'undefined') window.app.removeLocation = window.removeLocation;
window.removePlatform = typeof removePlatform !== 'undefined' ? removePlatform : window.removePlatform;
if(typeof window.app !== 'undefined') window.app.removePlatform = window.removePlatform;
window.removeManufacturer = typeof removeManufacturer !== 'undefined' ? removeManufacturer : window.removeManufacturer;
if(typeof window.app !== 'undefined') window.app.removeManufacturer = window.removeManufacturer;
window.removeDeviceType = typeof removeDeviceType !== 'undefined' ? removeDeviceType : window.removeDeviceType;
if(typeof window.app !== 'undefined') window.app.removeDeviceType = window.removeDeviceType;
window.showToast = typeof showToast !== 'undefined' ? showToast : window.showToast;
if(typeof window.app !== 'undefined') window.app.showToast = window.showToast;
window.handleInput = typeof handleInput !== 'undefined' ? handleInput : window.handleInput;
if(typeof window.app !== 'undefined') window.app.handleInput = window.handleInput;
window.toggleMtVisibility = typeof toggleMtVisibility !== 'undefined' ? toggleMtVisibility : window.toggleMtVisibility;
if(typeof window.app !== 'undefined') window.app.toggleMtVisibility = window.toggleMtVisibility;
window.openModal = typeof openModal !== 'undefined' ? openModal : window.openModal;
if(typeof window.app !== 'undefined') window.app.openModal = window.openModal;
window.closeModal = typeof closeModal !== 'undefined' ? closeModal : window.closeModal;
if(typeof window.app !== 'undefined') window.app.closeModal = window.closeModal;
window.openSettingsModal = typeof openSettingsModal !== 'undefined' ? openSettingsModal : window.openSettingsModal;
if(typeof window.app !== 'undefined') window.app.openSettingsModal = window.openSettingsModal;
window.renderCategoryFilters = typeof renderCategoryFilters !== 'undefined' ? renderCategoryFilters : window.renderCategoryFilters;
if(typeof window.app !== 'undefined') window.app.renderCategoryFilters = window.renderCategoryFilters;
window.renderLocationReorderBar = typeof renderLocationReorderBar !== 'undefined' ? renderLocationReorderBar : window.renderLocationReorderBar;
if(typeof window.app !== 'undefined') window.app.renderLocationReorderBar = window.renderLocationReorderBar;
window.scrollToLocation = typeof scrollToLocation !== 'undefined' ? scrollToLocation : window.scrollToLocation;
if(typeof window.app !== 'undefined') window.app.scrollToLocation = window.scrollToLocation;
window.handleDragStart = typeof handleDragStart !== 'undefined' ? handleDragStart : window.handleDragStart;
if(typeof window.app !== 'undefined') window.app.handleDragStart = window.handleDragStart;
window.handleDragOver = typeof handleDragOver !== 'undefined' ? handleDragOver : window.handleDragOver;
if(typeof window.app !== 'undefined') window.app.handleDragOver = window.handleDragOver;
window.handleDrop = typeof handleDrop !== 'undefined' ? handleDrop : window.handleDrop;
if(typeof window.app !== 'undefined') window.app.handleDrop = window.handleDrop;
window.setCategory = typeof setCategory !== 'undefined' ? setCategory : window.setCategory;
if(typeof window.app !== 'undefined') window.app.setCategory = window.setCategory;
window.getIconForType = typeof getIconForType !== 'undefined' ? getIconForType : window.getIconForType;
if(typeof window.app !== 'undefined') window.app.getIconForType = window.getIconForType;
window.renderDevices = typeof renderDevices !== 'undefined' ? renderDevices : window.renderDevices;
if(typeof window.app !== 'undefined') window.app.renderDevices = window.renderDevices;
window.saveDevice = typeof saveDevice !== 'undefined' ? saveDevice : window.saveDevice;
if(typeof window.app !== 'undefined') window.app.saveDevice = window.saveDevice;
window.previewImage = typeof previewImage !== 'undefined' ? previewImage : window.previewImage;
if(typeof window.app !== 'undefined') window.app.previewImage = window.previewImage;
window.closeImageViewer = typeof closeImageViewer !== 'undefined' ? closeImageViewer : window.closeImageViewer;
if(typeof window.app !== 'undefined') window.app.closeImageViewer = window.closeImageViewer;
window.confirmDelete = typeof confirmDelete !== 'undefined' ? confirmDelete : window.confirmDelete;
if(typeof window.app !== 'undefined') window.app.confirmDelete = window.confirmDelete;
window.toggleViewMode = typeof toggleViewMode !== 'undefined' ? toggleViewMode : window.toggleViewMode;
if(typeof window.app !== 'undefined') window.app.toggleViewMode = window.toggleViewMode;
window.updateViewToggleButton = typeof updateViewToggleButton !== 'undefined' ? updateViewToggleButton : window.updateViewToggleButton;
if(typeof window.app !== 'undefined') window.app.updateViewToggleButton = window.updateViewToggleButton;
window.exportData = typeof exportData !== 'undefined' ? exportData : window.exportData;
if(typeof window.app !== 'undefined') window.app.exportData = window.exportData;
window.importData = typeof importData !== 'undefined' ? importData : window.importData;
if(typeof window.app !== 'undefined') window.app.importData = window.importData;
window.scrollToTop = typeof scrollToTop !== 'undefined' ? scrollToTop : window.scrollToTop;
if(typeof window.app !== 'undefined') window.app.scrollToTop = window.scrollToTop;
window.draggedLocation = typeof draggedLocation !== 'undefined' ? draggedLocation : window.draggedLocation;
if(typeof window.app !== 'undefined') window.app.draggedLocation = window.draggedLocation;
