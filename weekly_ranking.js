/**
 * ملف: weekly_ranking.js
 * مخصص لجلب وعرض ترتيب توقعات ZELO FC في الصفحة الرئيسية
 */

async function renderWeeklyLeaderboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // 1. عرض حالة تحميل أنيقة
    container.innerHTML = `<div style="text-align:center; padding: 20px; color: #888899;">⏳ جاري جلب أبطال التوقعات...</div>`;

    try {
        // 2. جلب أفضل 3 لاعبين من Supabase (تأكد من إنشاء جدول user_predictions مسبقاً)
        const { data: topPlayers, error } = await supabase
            .from('user_predictions')
            .select('points_earned, users!inner(username, photo_url)')
            .order('points_earned', { ascending: false })
            .limit(3);

        if (error) throw error;

        // 3. بناء تصميم منصة التتويج (مدمج مع CSS ليعمل فوراً دون تعديل style.css)
        let html = `
            <style>
                .zelo-podium-wrapper {
                    display: flex; justify-content: center; align-items: flex-end; 
                    gap: 10px; margin: 20px 0; padding: 15px;
                    background: rgba(18, 18, 22, 0.4); border-radius: 12px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                }
                .zelo-podium {
                    display: flex; flex-direction: column; align-items: center;
                    background: rgba(18, 18, 22, 0.8); border-radius: 8px 8px 0 0;
                    padding: 10px 5px; width: 30%; text-align: center;
                }
                .zelo-p-first { height: 130px; border-top: 3px solid #ffd700; box-shadow: 0 -5px 15px rgba(255, 215, 0, 0.1); }
                .zelo-p-second { height: 100px; border-top: 3px solid #C0C0C0; }
                .zelo-p-third { height: 80px; border-top: 3px solid #CD7F32; }
                .zelo-p-avatar { font-size: 24px; margin-bottom: 4px; }
                .zelo-p-name { font-size: 0.75rem; color: #fff; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
                .zelo-p-points { font-size: 0.7rem; color: #0088cc; margin-top: 4px; font-weight: bold; }
                .zelo-podium-title { text-align: center; color: #ffd700; font-size: 0.9rem; margin-bottom: 5px; font-weight: bold; }
            </style>
            
            <div class="zelo-podium-title">🏆 أبطال التوقعات هذا الأسبوع</div>
            <div class="zelo-podium-wrapper">
        `;

        if (!topPlayers || topPlayers.length === 0) {
            html += `<div style="color:#888899; font-size:0.8rem;">لا توجد توقعات حتى الآن. كن أول الفائزين!</div>`;
        } else {
            // المركز الثاني
            if (topPlayers[1]) {
                html += `
                <div class="zelo-podium zelo-p-second">
                    <div class="zelo-p-avatar">🥈</div>
                    <div class="zelo-p-name">${topPlayers[1].users.username || 'لاعب'}</div>
                    <div class="zelo-p-points">${topPlayers[1].points_earned} ZELO</div>
                </div>`;
            }
            // المركز الأول
            if (topPlayers[0]) {
                html += `
                <div class="zelo-podium zelo-p-first">
                    <div class="zelo-p-avatar">🥇</div>
                    <div class="zelo-p-name">${topPlayers[0].users.username || 'لاعب'}</div>
                    <div class="zelo-p-points">${topPlayers[0].points_earned} ZELO</div>
                </div>`;
            }
            // المركز الثالث
            if (topPlayers[2]) {
                html += `
                <div class="zelo-podium zelo-p-third">
                    <div class="zelo-p-avatar">🥉</div>
                    <div class="zelo-p-name">${topPlayers[2].users.username || 'لاعب'}</div>
                    <div class="zelo-p-points">${topPlayers[2].points_earned} ZELO</div>
                </div>`;
            }
        }

        html += `</div>`;
        container.innerHTML = html;

    } catch (error) {
        console.error("خطأ في جلب الترتيب:", error);
        container.innerHTML = `<div style="text-align:center; color: #ff4444; font-size:0.8rem;">تعذر تحميل الترتيب.</div>`;
    }
}
