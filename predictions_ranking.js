/**
 * ملف: predictions_ranking.js
 * الوظيفة: إدارة شاشة تحديات الأسبوع (عرض المباريات + الترتيب + المودال)
 */

// دالة عرض شاشة التحديات (Overlay) - محسنة للـ RTL
function openChallengesScreen() {
    const overlay = document.createElement('div');
    overlay.id = 'challenges-overlay';
    overlay.style.cssText = `
        position: fixed; 
        top: 0; left: 0; 
        width: 100%; height: 100%; 
        background: #121215; 
        z-index: 9999; 
        padding: 20px; 
        overflow-y: auto; 
        color: white;
        direction: rtl;
        text-align: right;
    `;

    // محاكاة المباريات
    const matches = [
        { id: 1, team1: "ريال مدريد", team2: "ليفربول", time: "2026-07-11T21:00:00", league: "🇪🇺" },
        { id: 2, team1: "برشلونة", team2: "أتلتيكو مدريد", time: "2026-07-12T20:00:00", league: "🇪🇸" }
    ];

    let matchesHtml = matches.map(m => {
        const matchDate = new Date(m.time);
        const now = new Date();
        const oneHourBefore = new Date(matchDate.getTime() - 60 * 60 * 1000);
        const isClosed = now >= oneHourBefore;

        return `
            <div style="background:#1c1c22; padding:18px; border-radius:12px; margin-bottom:18px; border: 1px solid #333;">
                <div style="font-size: 0.85rem; color:#888; margin-bottom: 8px;">
                    ${m.league} • ${matchDate.toLocaleDateString('ar-EG')}
                </div>
                
                <!-- تحسين عرض أسماء الفرق الطويلة -->
                <div style="font-weight:bold; font-size: 1.15rem; margin: 10px 0; line-height: 1.4; word-break: break-word; overflow-wrap: break-word;">
                    ${m.team1} <span style="color:#ffd700;">VS</span> ${m.team2}
                </div>
                
                <div style="color:#ffd700; font-size: 0.95rem; margin-bottom: 12px;">
                    ${matchDate.getHours()}:00
                </div>
                
                ${isClosed 
                    ? `<button disabled style="width:100%; padding:12px; background:#444; color:#888; border:none; border-radius:8px; font-size:0.95rem;">
                        ❌ تم إغلاق التوقعات
                       </button>`
                    : `<button onclick="showPredictionModal(${m.id}, '${m.team1}', '${m.team2}')" 
                        style="width:100%; padding:12px; background:#0088cc; border:none; color:white; border-radius:8px; font-weight:bold; font-size:1rem;">
                        🚀 تحدي النتيجة
                       </button>`
                }
            </div>
        `;
    }).join('');

    const rankingHtml = `
        <div style="margin-top: 30px;">
            <h3 style="margin: 0 0 15px 0; color:#ffd700; text-align:right;">ترتيب المتوقعين هذا الأسبوع</h3>
            <div id="overlay-ranking" style="background:#1c1c22; padding:15px; border-radius:12px; text-align:right;">
                جاري تحميل الترتيب...
            </div>
        </div>
    `;

    overlay.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <h2 style="margin:0; color:#ffd700;">تحديات الأسبوع</h2>
            <button onclick="closeChallengesScreen()" 
                    style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer; padding:5px 15px;">✕</button>
        </div>
        
        <div style="margin-bottom: 30px;">
            ${matchesHtml}
        </div>
        
        ${rankingHtml}
    `;

    document.body.appendChild(overlay);

    setTimeout(() => {
        if (typeof renderLeaderboardSection === "function") {
            renderLeaderboardSection('overlay-ranking');
        }
    }, 300);
}

// دالة إغلاق الـ overlay
function closeChallengesScreen() {
    const overlay = document.getElementById('challenges-overlay');
    if (overlay) overlay.remove();
}

// مودال التوقع
function showPredictionModal(matchId, team1, team2) {
    const modal = document.createElement('div');
    modal.id = 'prediction-modal';
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #1c1c22; padding: 25px; border-radius: 16px;
        z-index: 10000; width: 90%; max-width: 420px; color: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        direction: rtl;
    `;

    modal.innerHTML = `
        <h3 style="margin:0 0 20px 0; text-align:center; color:#ffd700;">توقع نتيجة المباراة</h3>
        <p style="text-align:center; font-size:1.1rem; margin-bottom:20px;">
            ${team1} <strong>VS</strong> ${team2}
        </p>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:8px; color:#ccc;">من سيفوز؟</label>
            <select id="winner-select" style="width:100%; padding:12px; background:#25252d; border:none; border-radius:8px; color:white;">
                <option value="">اختر...</option>
                <option value="${team1}">${team1}</option>
                <option value="${team2}">${team2}</option>
                <option value="draw">تعادل</option>
            </select>
        </div>
        
        <div style="margin-bottom:20px;">
            <label style="display:block; margin-bottom:8px; color:#ccc;">النتيجة المتوقعة (مثال: 2-1)</label>
            <input type="text" id="score-input" placeholder="2-1" 
                   style="width:100%; padding:12px; background:#25252d; border:none; border-radius:8px; color:white;">
        </div>
        
        <div style="display:flex; gap:12px;">
            <button onclick="submitPrediction(${matchId});" 
                    style="flex:1; padding:14px; background:#0088cc; border:none; color:white; border-radius:8px; font-weight:bold;">
                ✅ تأكيد التوقع
            </button>
            <button onclick="closePredictionModal()" 
                    style="flex:1; padding:14px; background:#444; border:none; color:white; border-radius:8px;">
                إلغاء
            </button>
        </div>
    `;

    document.body.appendChild(modal);
}

function closePredictionModal() {
    const modal = document.getElementById('prediction-modal');
    if (modal) modal.remove();
}

function submitPrediction(matchId) {
    const winner = document.getElementById('winner-select').value;
    const score = document.getElementById('score-input').value.trim();
    
    if (!winner || !score) {
        alert("يرجى اختيار الفائز وكتابة النتيجة");
        return;
    }
    
    alert(`✅ تم حفظ توقعك للمباراة رقم ${matchId}\nالفائز: ${winner}\nالنتيجة: ${score}`);
    closePredictionModal();
}

// دالة عرض الترتيب
async function renderLeaderboardSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;
    
    container.innerHTML = `
        <p style="color:#888; text-align:center; padding:20px;">
            📊 الترتيب سيظهر هنا (سيتم ربطه بقاعدة البيانات)
        </p>
    `;
}
