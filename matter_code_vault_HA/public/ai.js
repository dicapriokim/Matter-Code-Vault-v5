// Constants are now managed globally in script.js

async function askOllama(prompt, model, isJson = false) {
    const targetModel = model || window.REASONING_MODEL || "antigravity-model:3b";
    const proxyUrl = window.OLLAMA_PROXY_URL || "api/ai";
    try {
        const res = await fetch(proxyUrl, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: targetModel,
                prompt: prompt,
                stream: false,
                options: { temperature: 0.1, keep_alive: "5m" }
            })
        });
        const data = await res.json();
        let text = data.response || "";
        if (isJson) {
            const jsonMatch = text.match(/\{[\s\S]*\}/);
            return jsonMatch ? JSON.parse(jsonMatch[0]) : null;
        }
        return text;
    } catch (e) {
        console.error("Ollama Error:", e);
        showToast("AI 요청 실패");
        return null;
    }
}

function getAIInsights() { 
    document.getElementById('aiQaModal').classList.remove('hidden'); 
    const output = document.getElementById('aiQaOutput');
    if (output) output.scrollTop = 0;
    document.getElementById('aiQaInput')?.focus(); 
}
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

    const systemInstruction = "너는 스마트홈, IoT, Matter 표준 전문 AI 어시스턴트야. 별도의 언급이 없더라도 모든 답변은 스마트홈, 홈 자동화, IoT 기기 맥락에서 전문적으로 답변해줘. 브랜드명(예: 아카라, 필립스 휴 등)은 일반 명사가 아닌 IoT 제품 브랜드로 인식해야 해. ";
    const model = window.REASONING_MODEL || "antigravity-model:3b";
    const response = await askOllama(systemInstruction + query, model, false);

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
    console.log("[AI-Naming] Button clicked.");
    const manufacturer = document.getElementById('devManufacturer')?.value;
    const type = document.getElementById('devType')?.value;
    const location = document.getElementById('devLoc')?.value;
    const nameInput = document.getElementById('devName');
    const statusEl = document.getElementById('aiNameStatus');

    if (!manufacturer || !type) { 
        console.warn("[AI-Naming] Missing required fields:", { manufacturer, type });
        showToast("제조사와 기기 종류를 먼저 선택해야 작명이 가능합니다."); 
        return; 
    }

    try {
        if(statusEl) statusEl.classList.remove('hidden');
        if(nameInput) nameInput.placeholder = "AI가 멋진 이름을 생각 중...";
        
        const prompt = `Matter 기기 이름을 한국어로 간결하게 추천해줘. 제조사: ${manufacturer}, 기기 종류: ${type}, 설치 장소: ${location || '미지정'}. 결과만 텍스트로 출력.`;

        console.log("[AI-Naming] Requesting suggestion for:", { manufacturer, type, location });
        const model = window.REASONING_MODEL || "antigravity-model:3b";
        const suggestion = await askOllama(prompt, model, false);
        
        if (suggestion && nameInput) { 
            console.log("[AI-Naming] Success:", suggestion);
            nameInput.value = suggestion.trim(); 
            showToast("이름이 추천되었습니다!"); 
        } else {
            console.error("[AI-Naming] No response from AI.");
            showToast("AI가 답변을 하지 못했습니다. 다시 시도해주세요.");
            if(nameInput) nameInput.placeholder = "예: 거실 천장 조명";
        }
    } catch (err) {
        console.error("[AI-Naming] Error:", err);
        showToast("작명 실패! HA 설정의 Ollama IP를 확인해 주세요.");
    } finally {
        if(statusEl) statusEl.classList.add('hidden');
    }
}



// Window Bindings for HTML Inline Events & Scope Sharing
if(typeof window !== 'undefined' && !window.app) window.app = {};
window.askOllama = typeof askOllama !== 'undefined' ? askOllama : window.askOllama;
if(typeof window.app !== 'undefined') window.app.askOllama = window.askOllama;
window.getAIInsights = typeof getAIInsights !== 'undefined' ? getAIInsights : window.getAIInsights;
if(typeof window.app !== 'undefined') window.app.getAIInsights = window.getAIInsights;
window.closeAiQaModal = typeof closeAiQaModal !== 'undefined' ? closeAiQaModal : window.closeAiQaModal;
if(typeof window.app !== 'undefined') window.app.closeAiQaModal = window.closeAiQaModal;
window.sendAiQuery = typeof sendAiQuery !== 'undefined' ? sendAiQuery : window.sendAiQuery;
if(typeof window.app !== 'undefined') window.app.sendAiQuery = window.sendAiQuery;
window.suggestDeviceName = typeof suggestDeviceName !== 'undefined' ? suggestDeviceName : window.suggestDeviceName;
if(typeof window.app !== 'undefined') window.app.suggestDeviceName = window.suggestDeviceName;
window.OLLAMA_PROXY_URL = typeof OLLAMA_PROXY_URL !== 'undefined' ? OLLAMA_PROXY_URL : window.OLLAMA_PROXY_URL;
if(typeof window.app !== 'undefined') window.app.OLLAMA_PROXY_URL = window.OLLAMA_PROXY_URL;
