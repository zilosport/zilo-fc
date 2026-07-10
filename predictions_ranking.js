/**
 * ملف: predictions_ranking.js
 * مخصص لجلب وعرض ترتيب توقعات ZELO FC (الأسبوعي + الكؤوس)
 * يعتمد على جدول: weekly_match_rankings
 */

async function renderLeaderboardSection(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // دمج الـ CSS الخاص بتصميم الترتيب
    const styles = `
        <style>
            .zelo-ranking-container { margin-bottom: 30px; }
            .zelo-podium-wrapper {
                display: flex; justify-content: center; align-items: flex-end; 
                gap: 10px; margin: 15px 0; padding: 15px;
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
            .zelo-podium-title { text-align: center; color: #ffd700; font-size: 1rem; margin-bottom: 5px; font-weight: bold; }
            
            .zelo-my-rank {
                background: linear-gradient(90deg, #1e3c72, #2a5298);
                padding: 12px 15px; border-radius: 10px; display: flex;
                justify-content: space-between; align-items: center;
                color: white; font-weight: bold; font-size: 0.9rem;
            }
            .zelo-eliminated { background: #4a1c1c; color: #ff8888; text-align: center; padding: 10px; border-radius: 10px; font-size: 0.85rem;}
        </style>
    `;

    container.innerHTML = styles + `<div style="text-align:center; padding: 20px; color: #888899;">⏳ جاري جلب أبطال التوقعات...</div>`;

    try {
        const currentUserId = userState.userId; 

        // رسم الترتيب الأسبوعي
        const weeklyHtml = await buildRankingBlock('weekly', '🏆 تحدي الأسبوع', currentUserId);
        
        // رسم ترتيب الكؤوس
        const cupsHtml = await buildRankingBlock('cups', '🇪🇺🏆 أبطال كؤوس أوروبا وإسبانيا', currentUserId);

        container.innerHTML = styles + weeklyHtml + cupsHtml;

    } catch (error) {
        console.error("خطأ في جلب الترتيب:", error);
        container.innerHTML = styles + `<div style="text-align:center; color: #ff4444; font-size:0.8rem;">تعذر تحميل الترتيب.</div>`;
    }
}

async function buildRankingBlock(category, title, currentUserId) {
    // 1. جلب أول 3 لاعبين من الجدول الجديد (weekly_match_rankings)
    const { data: topPlayers } = await supabaseClient
        .from('weekly_match_rankings')
        .select('points_earned, users!inner(username), is_eliminated')
        .eq('category', category)
        .eq('is_eliminated', false)
        .order('points_earned', { ascending: false })
        .limit(3);

    // 2. جلب بيانات وترتيب المستخدم الحالي
    let myRankHtml = '';
    
    const { data: myData } = await supabaseClient
        .from('weekly_match_rankings')
        .select('points_earned, is_eliminated, wrong_guesses')
        .eq('telegram_id', currentUserId)
        .eq('category', category)
        .single();

    if (myData) {
        if (myData.is_eliminated) {
            myRankHtml = `<div class="zelo-eliminated">❌ لقد تم إقصاؤك من هذا الترتيب.</div>`;
        } else {
            // استدعاء دالة RPC لمعرفة الترتيب الدقيق
            const { data: myRank } = await supabaseClient.rpc('get_user_rank', {
                p_telegram_id: currentUserId,
                p_category: category
            });

            myRankHtml = `
                <div class="zelo-my-rank">
                    <div>👤 ترتيبي: <span style="color:#ffd700; font-size: 1.1rem;">#${myRank || '+5000'}</span></div>
                    <div>نقاطي: ${myData.points_earned} ZELO</div>
                </div>`;
        }
    } else {
        myRankHtml = `<div class="zelo-my-rank" style="background: #2b2b36; justify-content: center;">لم تشارك في هذا التحدي بعد.</div>`;
    }

    // 3. بناء واجهة منصة التتويج
    let html = `
        <div class="zelo-ranking-container">
            <div class="zelo-podium-title">${title}</div>
            <div class="zelo-podium-wrapper">
    `;

    if (!topPlayers || topPlayers.length === 0) {
        html += `<div style="color:#888899; font-size:0.8rem;">لا توجد توقعات حتى الآن.</div>`;
    } else {
        if (topPlayers[1]) {
            html += `
            <div class="zelo-podium zelo-p-second">
                <div class="zelo-p-avatar">🥈</div>
                <div class="zelo-p-name">${topPlayers[1].users.username || 'لاعب'}</div>
                <div class="zelo-p-points">${topPlayers[1].points_earned} ZELO</div>
            </div>`;
        }
        if (topPlayers[0]) {
            html += `
            <div class="zelo-podium zelo-p-first">
                <div class="zelo-p-avatar">🥇</div>
                <div class="zelo-p-name">${topPlayers[0].users.username || 'لاعب'}</div>
                <div class="zelo-p-points">${topPlayers[0].points_earned} ZELO</div>
            </div>`;
        }
        if (topPlayers[2]) {
            html += `
            <div class="zelo-podium zelo-p-third">
                <div class="zelo-p-avatar">🥉</div>
                <div class="zelo-p-name">${topPlayers[2].users.username || 'لاعب'}</div>
                <div class="zelo-p-points">${topPlayers[2].points_earned} ZELO</div>
            </div>`;
        }
    }

    html += `</div> ${myRankHtml} </div>`;
    return html;
}
