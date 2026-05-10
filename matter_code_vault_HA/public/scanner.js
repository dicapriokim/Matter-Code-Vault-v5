// Version: 3.3.2 (Algorithmic Voting Stable)

const VISION_MODEL = "moondream";
const REASONING_MODEL = "antigravity-model:3b";
const OLLAMA_PROXY_URL = "api/ai";

let currentVerifiedMt = null;

// --- UTILS ---
function showToast(msg) {
    const toast = document.createElement('div');
    toast.className = "fixed bottom-24 left-1/2 -translate-x-1/2 bg-slate-800 text-white px-4 py-2 rounded-full text-xs z-[100] shadow-lg animate-fade-in";
    toast.textContent = msg;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function handleInput(val) {
    const code = val.replace(/-/g, '');
    if (code.length === 11) {
        const formatted = code.replace(/(\d{4})(\d{3})(\d{4})/, '$1-$2-$3');
        const input = document.getElementById('devPayload');
        if (input) {
            input.value = formatted;
            input.dispatchEvent(new Event('input'));
        }
    }
}

async function convertHeicIfNecessary(file) {
    if (file.name.toLowerCase().endsWith('.heic')) {
        showToast("HEIC 변환 중...");
        const blob = await heic2any({ blob: file, toType: "image/jpeg", quality: 0.7 });
        return new File([blob], file.name.replace(/\.heic$/i, '.jpg'), { type: "image/jpeg" });
    }
    return file;
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
        img.onerror = reject; 
        img.src = URL.createObjectURL(file);
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
                prompt: "Describe all visible Matter QR codes (starting with MT:) and 11-digit pairing codes in this image. Be precise.",
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
                prompt: `Based on the description, extract the Matter QR and the 11-digit code as strict JSON { "mt": "MT:...", "code": "xxxx-xxx-xxxx" }. Description: ${visionText}`,
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

            if (existingCode.length === 11 && aiCodeRaw.length === 11) {
                let mergedCode = "";
                for (let i = 0; i < 11; i++) {
                    // 한쪽이라도 0이고 다른 한쪽이 8이면, Slashed Zero 오인식으로 간주하고 '0' 채택
                    if ((existingCode[i] === '0' && aiCodeRaw[i] === '8') || 
                        (existingCode[i] === '8' && aiCodeRaw[i] === '0')) {
                        mergedCode += '0';
                    } else {
                        mergedCode += aiCodeRaw[i];
                    }
                }
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

// Global Export
window.processAiImage = processAiImage;
window.executeAiAnalysis = executeAiAnalysis;
