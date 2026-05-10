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

    window.html5QrCode = new Html5Qrcode("qr-reader");
    const config = { fps: 10, qrbox: { width: 250, height: 250 } };

    html5QrCode.start({ facingMode: "environment" }, config, onScanSuccess)
        .then(() => {
            document.getElementById('cameraLoading').style.display = 'none';
            document.getElementById('guideBox').style.display = 'block';
            window.isScanning = true; window.scanStartTime = Date.now();
            window.scanTimer = setInterval(checkTesseractAndFallback, 1000);
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
    window.isScanning = false; if (scanTimer) clearInterval(scanTimer);
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
        window.tesseractWorker = await Tesseract.createWorker("eng");
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
    
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = "ocrLoadingOverlay";
    loadingOverlay.className = "absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl soft-pulse";
    loadingOverlay.innerHTML = '<span class="text-orange-600 font-bold text-sm">📸 이미지 분석 중...</span>';

    if (modalContent) {
        modalContent.classList.add('ai-border');
        modalContent.appendChild(loadingOverlay);
    }
    
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

        // Fallback: If QR didn't fill the 11-digit pairing code, try OCR
        const devPayload = document.getElementById('devPayload');
        if ((!devPayload || !devPayload.value) && ocrCode) {
            handleInput(ocrCode);
        }
        if (ocrCode || qrCode) showToast("분석 성공!"); else showToast("인식 정보 없음");
    } catch (e) { 
        showToast("분석 오류"); 
    } finally {
        if (modalContent) modalContent.classList.remove('ai-border');
        const overlay = document.getElementById('ocrLoadingOverlay');
        if (overlay) overlay.remove();
    }
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
    const modalContent = document.getElementById('modalContent');
    const loadingOverlay = document.createElement('div');
    loadingOverlay.id = "aiLoadingOverlay";
    loadingOverlay.className = "absolute inset-0 bg-white/60 backdrop-blur-[2px] z-50 flex items-center justify-center rounded-2xl soft-pulse";
    loadingOverlay.innerHTML = '<span class="text-orange-600 font-bold text-sm">🤖 AI 정밀 분석 중...</span>';

    if (modalContent) {
        modalContent.classList.add('ai-border');
        modalContent.appendChild(loadingOverlay);
    }
    
    showToast("AI 정밀 판독 (Dual Model)...");
    
    try {
        // Step 1: Vision Pass (Moondream)
        const visionRes = await fetch(OLLAMA_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: VISION_MODEL,
                prompt: "Describe all visible Matter QR codes (starting with MT:) and 11-digit pairing codes in this image. Be precise. Pay close attention to slashed zeros '0' which are often misread as '8'.",
                images: [base64Data],
                stream: false,
                options: { keep_alive: "5m" }
            })
        });
        const visionData = await visionRes.json();
        const visionText = visionData.response;

        // Step 2: Reasoning Pass (Qwen2.5)
        const reasoningRes = await fetch(OLLAMA_PROXY_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: REASONING_MODEL,
                prompt: `Based on the description, extract the Matter QR and the 11-digit code as strict JSON { "mt": "MT:...", "code": "xxxx-xxx-xxxx" }. Rule: Slashed zeros MUST be transcribed as the digit '0'. Output EXACTLY 11 digits for the code. Do NOT add any notes, explanations, or extra text. Description: ${visionText}`,
                stream: false,
                format: "json",
                options: { temperature: 0.1, keep_alive: "5m" }
            })
        });
        const reasoningData = await reasoningRes.json();
        const info = JSON.parse(reasoningData.response);

        // --- Algorithmic Voting: Cross-Validation for Slashed Zeros (v3.3.2) ---
        const existingInput = document.getElementById('devPayload');
        if (info.code && existingInput && existingInput.value) {
            const existingCode = existingInput.value.replace(/-/g, '');
            let aiCodeRaw = info.code.replace(/-/g, '');

            // 두 코드 모두 11자리일 때만 1:1 문자 대조 실행
            if (existingCode.length === 11 && aiCodeRaw.length === 11) {
                let mergedCode = "";
                for (let i = 0; i < 11; i++) {
                    // 한쪽이라도 0이고 다른 한쪽이 8이면, Slashed Zero 오인식으로 간주하고 '0' 채택
                    if ((existingCode[i] === '0' && aiCodeRaw[i] === '8') || 
                        (existingCode[i] === '8' && aiCodeRaw[i] === '0')) {
                        mergedCode += '0';
                    } else {
                        // 그 외의 경우는 정밀도가 높은 AI(aiCodeRaw)의 결과를 우선 신뢰
                        mergedCode += aiCodeRaw[i];
                    }
                }
                // 병합된 코드를 다시 포맷팅 (xxxx-xxx-xxxx)
                info.code = mergedCode.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
                console.log("[Cross-Validation] Merged Code applied:", info.code);
            }
        }

        if (info.code) handleInput(info.code);
        if (info.mt) {
            currentVerifiedMt = info.mt;
            document.getElementById('devMtPayload').value = info.mt;
            document.getElementById('displayMtPayload').value = info.mt;
            document.getElementById('qrStatusIcon').classList.remove('hidden');
            applyDecodedInfo(decodeMatterPayload(info.mt));
        }
        showToast("AI 분석 완료");
    } catch (e) {
        console.error("AI Analysis Error:", e);
        showToast("AI 분석 실패");
    } finally {
        if (modalContent) modalContent.classList.remove('ai-border');
        const overlay = document.getElementById('aiLoadingOverlay');
        if (overlay) overlay.remove();
    }
}

async function processAiImage(event) {
    const originalFile = event.target.files[0]; if (!originalFile) return;
    const file = await convertHeicIfNecessary(originalFile);
    try { resizeImage(file, 1024).then(url => executeAiAnalysis(url.split(',')[1])); } catch (e) { showToast("처리 실패"); }
    event.target.value = '';
}



// Window Bindings for HTML Inline Events & Scope Sharing
if(typeof window !== 'undefined' && !window.app) window.app = {};
window.triggerOcrScan = typeof triggerOcrScan !== 'undefined' ? triggerOcrScan : window.triggerOcrScan;
if(typeof window.app !== 'undefined') window.app.triggerOcrScan = window.triggerOcrScan;
window.triggerFallbackAi = typeof triggerFallbackAi !== 'undefined' ? triggerFallbackAi : window.triggerFallbackAi;
if(typeof window.app !== 'undefined') window.app.triggerFallbackAi = window.triggerFallbackAi;
window.startCamera = typeof startCamera !== 'undefined' ? startCamera : window.startCamera;
if(typeof window.app !== 'undefined') window.app.startCamera = window.startCamera;
window.stopCamera = typeof stopCamera !== 'undefined' ? stopCamera : window.stopCamera;
if(typeof window.app !== 'undefined') window.app.stopCamera = window.stopCamera;
window.onScanSuccess = typeof onScanSuccess !== 'undefined' ? onScanSuccess : window.onScanSuccess;
if(typeof window.app !== 'undefined') window.app.onScanSuccess = window.onScanSuccess;
window.getTesseractWorker = typeof getTesseractWorker !== 'undefined' ? getTesseractWorker : window.getTesseractWorker;
if(typeof window.app !== 'undefined') window.app.getTesseractWorker = window.getTesseractWorker;
window.checkTesseractAndFallback = typeof checkTesseractAndFallback !== 'undefined' ? checkTesseractAndFallback : window.checkTesseractAndFallback;
if(typeof window.app !== 'undefined') window.app.checkTesseractAndFallback = window.checkTesseractAndFallback;
window.runTesseractVersion2 = typeof runTesseractVersion2 !== 'undefined' ? runTesseractVersion2 : window.runTesseractVersion2;
if(typeof window.app !== 'undefined') window.app.runTesseractVersion2 = window.runTesseractVersion2;
window.processOcrImage = typeof processOcrImage !== 'undefined' ? processOcrImage : window.processOcrImage;
if(typeof window.app !== 'undefined') window.app.processOcrImage = window.processOcrImage;
window.convertHeicIfNecessary = typeof convertHeicIfNecessary !== 'undefined' ? convertHeicIfNecessary : window.convertHeicIfNecessary;
if(typeof window.app !== 'undefined') window.app.convertHeicIfNecessary = window.convertHeicIfNecessary;
window.resizeImage = typeof resizeImage !== 'undefined' ? resizeImage : window.resizeImage;
if(typeof window.app !== 'undefined') window.app.resizeImage = window.resizeImage;
window.executeAiAnalysis = typeof executeAiAnalysis !== 'undefined' ? executeAiAnalysis : window.executeAiAnalysis;
if(typeof window.app !== 'undefined') window.app.executeAiAnalysis = window.executeAiAnalysis;
window.processAiImage = typeof processAiImage !== 'undefined' ? processAiImage : window.processAiImage;
if(typeof window.app !== 'undefined') window.app.processAiImage = window.processAiImage;
