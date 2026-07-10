/**
 * ملف: predictions_ranking.js
 * المسؤول فقط عن عرض منصة التتويج وترتيب اللاعبين.
 */

// دالة لحماية التطبيق من ثغرات XSS
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, tag => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
    }[tag] || tag));
}

/**
 * الدالة الرئيسية لعرض الترتيب في أي حاوية (Container)
 */
async function renderLeaderboardSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // تعريف الـ CSS الخاص بالترتيب
    const styles = `
        <style>
            .zelo-ranking-container { margin-bottom: 20px; font-family: sans-serif; }
            .zelo-podium-wrapper {
                display: flex; justify-content: center; align-items: flex-end; 
                gap: 8px; margin: 15px 0; padding: 15px;
                background: rgba(18, 18, 22, 0.6); border-radius: 12px;
                border: 1px solid rgba(255, 255, 255, 0.05);
            }
            .zelo-podium {
                display: flex; flex-direction: column; align-items: center;
                background: rgba(28, 28, 34, 0.9); border-radius: 8px 8px 0 0;
                padding: 10px 5px; width: 32%; text-align: center;
            }
            .zelo-p-first { height: 120px; border-top: 3px solid #ffd700; }
            .zelo-p-second { height: 90px; border-top: 3px solid #C0C0C0; }
            .zelo-p-third { height: 70px; border-top: 3px solid #CD7F32; }
            .zelo-p-avatar { font-size: 20px; margin-bottom: 4px; }
            .zelo-p-name { font-size: 0.75rem; color: #fff; font-weight: bold; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; width: 100%; }
            .zelo-p-points { font-size: 0.7rem; color: #0088cc; margin-top: 4px; font-weight: bold; }
            .zelo-podium-title { text-align: center; color: #ffd700; font-size: 0.95rem; margin-bottom: 5px; font-weight: bold; text-transform: uppercase; }
            .zelo-my-rank {
                background: linear-gradient(90deg, #1e3c72, #2a5298);
                padding: 10px 15px; border-radius: 10px; display: flex;
                justify-content: space-between; align-items: center;
                color: white; font-weight: bold; font-size: 0.85rem; margin-top: 10px;
            }
            .zelo-eliminated { background: #4a1c1c; color: #ff8888; text-align: center; padding: 8px; border-radius: 8px; font-size: 0.8rem; margin-top: 5px;}
        </style>
    `;

    container.innerHTML = styles + `<div style="text-align:center; padding: 20px; color: #888899;">⏳ جاري تحديث الترتيب...</div>`;

    try {
        const currentUserId = userState.userId; 

        // جلب الترتيب للأسبوع وللكؤوس
        const weeklyHtml = await buildRankingBlock('weekly', '🏆 تحدي الأسبوع', currentUserId);
        const cupsHtml = await buildRankingBlock('cups', '🇪🇺 الكؤوس', currentUserId);

        container.innerHTML = styles + weeklyHtml + cupsHtml;
    } catch (error) {
        console.error("خطأ في جلب الترتيب:", error);
        container.innerHTML = styles + `<div style="text-align:center; color: #ff4444; font-size:0.8rem;">تعذر تحميل الترتيب.</div>`;
    }
}

/**
 * دالة بناء كتل الترتيب (لإعادة استخدامها في الأسبوع والكؤوس)
 */
async function buildRankingBlock(category, title, currentUserId) {
    // 1. جلب التوب 3
    const { data: topPlayers } = await supabaseClient
        .from('weekly_match_rankings')
        .select('points_earned, users!inner(username), is_eliminated')
        .eq('category', category)
        .eq('is_eliminated', false)
        .order('points_earned', { ascending: false })
        .limit(3);

    // 2. جلب ترتيب المستخدم الحالي
    const { data: myData } = await supabaseClient
        .from('weekly_match_rankings')
        .select('points_earned, is_eliminated')
        .eq('telegram_id', currentUserId)
        .eq('category', category)
        .maybeSingle();

    let myRankHtml = '';
    if (myData) {
        if (myData.is_eliminated) {
            myRankHtml = `<div class="zelo-eliminated">❌ تم إقصاؤك من هذا التحدي.</div>`;
        } else {
            const { data: myRank } = await supabaseClient.rpc('get_user_rank', {
                p_telegram_id: currentUserId,
                p_category: category
            });
            myRankHtml = `
                <div class="zelo-my-rank">
                    <div>👤 ترتيبي: <span style="color:#ffd700;">#${myRank || '+5000'}</span></div>
                    <div>${myData.points_earned} نقطة</div>
                </div>`;
        }
    } else {
        myRankHtml = `<div class="zelo-my-rank" style="background: #2b2b36; justify-content: center;">لم تشارك بعد في ${title}.</div>`;
    }

    // 3. بناء المنصة
    let html = `<div class="zelo-ranking-container"><div class="zelo-podium-title">${title}</div><div class="zelo-podium-wrapper">`;

    if (!topPlayers || topPlayers.length === 0) {
        html += `<div style="color:#888; font-size:0.8rem; text-align:center; padding:10px;">لا يوجد مشاركون بعد.</div>`;
    } else {
        // الترتيب: الثاني، الأول، الثالث (ليظهر الأول في المنتصف)
        if (topPlayers[1]) {
            html += `<div class="zelo-podium zelo-p-second"><div class="zelo-p-avatar">🥈</div><div class="zelo-p-name">${escapeHTML(topPlayers[1].users.username)}</div><div class="zelo-p-points">${topPlayers[1].points_earned}</div></div>`;
        }
        if (topPlayers[0]) {
            html += `<div class="zelo-podium zelo-p-first"><div class="zelo-p-avatar">🥇</div><div class="zelo-p-name">${escapeHTML(topPlayers[0].users.username)}</div><div class="zelo-p-points">${topPlayers[0].points_earned}</div></div>`;
        }
        if (topPlayers[2]) {
            html += `<div class="zelo-podium zelo-p-third"><div class="zelo-p-avatar">🥉</div><div class="zelo-p-name">${escapeHTML(topPlayers[2].users.username)}</div><div class="zelo-p-points">${topPlayers[2].points_earned}</div></div>`;
        }
    }

    html += `</div> ${myRankHtml} </div>`;
    return html;
}
