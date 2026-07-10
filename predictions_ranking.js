/**
 * ملف: predictions_ranking.js
 * الوظيفة: إدارة شاشة تحديات الأسبوع (عرض المباريات + الإغلاق التلقائي) + عرض الترتيب العام
 */

// دالة عرض شاشة التحديات (Overlay)
function openChallengesScreen() {
    // إنشاء طبقة التحديات
    const overlay = document.createElement('div');
    overlay.id = 'challenges-overlay';
    overlay.style.cssText = "position:fixed; top:0; left:0; width:100%; height:100%; background:#121215; z-index:9999; padding:20px; overflow-y:auto; color:white;";
    
    // محاكاة لجلب المباريات (يمكنك استبدالها بـ fetch من Supabase)
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
            <div style="background:#1c1c22; padding:15px; border-radius:12px; margin-bottom:15px; border: 1px solid #333;">
                <div style="font-size: 0.8rem; color:#888;">${m.league} | ${matchDate.toLocaleDateString()}</div>
                <div style="font-weight:bold; margin: 5px 0; font-size: 1.1rem;">${m.team1} vs ${m.team2}</div>
                <div style="font-size: 0.9rem; color:#ffd700; margin-bottom: 10px;">التوقيت: ${matchDate.getHours()}:00</div>
                ${isClosed 
                    ? '<button disabled style="width:100%; padding:10px; background:#444; border:none; color:#888; border-radius:8px;">❌ تم إغلاق التوقعات</button>'
                    : `<button onclick="showPredictionModal(${m.id})" style="width:100%; padding:10px; background:#0088cc; border:none; color:white; border-radius:8px; font-weight:bold;">🚀 تحدي النتيجة</button>`
                }
            </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h2 style="margin:0;">مباريات الأسبوع</h2>
            <button onclick="document.getElementById('challenges-overlay').remove()" style="background:none; border:none; color:white; font-size:1.5rem; cursor:pointer;">✕</button>
        </div>
        ${matchesHtml}
    `;
    
    document.body.appendChild(overlay);
}

// دالة عرض الترتيب (تستدعى في الصفحة الرئيسية)
async function renderLeaderboardSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // جلب البيانات من Supabase وعرضها (الكود الذي اعتمدناه سابقاً)
    // ... (هنا يتم وضع منطق عرض الترتيب والمنصة كما في الكود السابق)
}

// دالة وهمية للمودال (سيتم استبدالها لاحقاً)
function showPredictionModal(matchId) {
    alert("جاري فتح نموذج التوقع للمباراة رقم: " + matchId);
}
