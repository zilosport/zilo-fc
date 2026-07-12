/**
 * ملف: weekly_match_rankings.js
 * الوظيفة: شاشة الترتيب الكاملة وعرض الثلاثة الأوائل + ترتيب المستخدم الحالي فقط
 */

// دالة لفتح شاشة الترتيب المنبثقة بحجم الشاشة الكاملة
window.openRankingScreen = function() {
    if (document.getElementById('ranking-full-screen')) return;

    const isAr = userState.lang === 'ar';
    const title = isAr ? 'ترتيب التحديات' : 'Challenges Ranking';

    const screen = document.createElement('div');
    screen.id = 'ranking-full-screen';
    
    // تصميم الشاشة الكاملة
    screen.style.cssText = `
        position: fixed !important; 
        top: 0 !important; 
        left: 0 !important; 
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important; 
        height: 100vh !important; 
        background: #121215 !important; 
        z-index: 99999 !important; 
        padding: 20px; 
        box-sizing: border-box; 
        overflow-y: auto; 
        color: white;
        direction: ${isAr ? 'rtl' : 'ltr'}; 
        text-align: ${isAr ? 'right' : 'left'};
    `;

    screen.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <h2 style="margin:0; color:#ffd700;">🏆 ${title}</h2>
            <button onclick="document.getElementById('ranking-full-screen').remove()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer;">✕</button>
        </div>
        <div id="full-ranking-container">
            <div style="text-align:center; color: #888; padding: 50px;">
                ${isAr ? '⏳ جاري جلب الترتيب...' : '⏳ Fetching ranking...'}
            </div>
        </div>
    `;

    document.body.appendChild(screen);

    // استدعاء دالة جلب البيانات وعرضها داخل هذه الحاوية
    window.renderHomeRankingWidget('full-ranking-container');
};

// دالة جلب وبناء واجهة الترتيب
window.renderHomeRankingWidget = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentUserId = userState.userId; 
    const isAr = userState.lang === 'ar'; 

    try {
        // 1. جلب أول 3 لاعبين (المنصة)
        const { data: top3 } = await supabaseClient
            .from('weekly_match_rankings')
            .select('points_earned, users!inner(username)')
            .eq('is_eliminated', false)
            .eq('category', 'weekly') 
            .order('points_earned', { ascending: false })
            .limit(3);

        // 2. جلب ترتيب المستخدم الحالي باستخدام الدالة RPC التي وفرتها مسبقاً
        const { data: myRank } = await supabaseClient.rpc('get_user_rank', {
            p_telegram_id: currentUserId,
            p_category: 'weekly'
        });

        const { data: myData } = await supabaseClient
            .from('weekly_match_rankings')
            .select('points_earned')
            .eq('telegram_id', currentUserId)
            .eq('category', 'weekly')
            .maybeSingle();

        // 3. بناء واجهة الترتيب (الـ Top 3 ثم المستخدم)
        let html = `
            <style>
                .podium-container { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; margin-top: 20px; gap: 10px; }
                .podium-card { background: #1c1c22; border: 1px solid #333; border-radius: 12px; text-align: center; padding: 15px 5px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
                .rank-1 { border-color: #ffd700; background: rgba(255, 215, 0, 0.1); height: 160px; transform: translateY(-15px); }
                .rank-2 { border-color: #c0c0c0; background: rgba(192, 192, 192, 0.1); height: 140px; }
                .rank-3 { border-color: #cd7f32; background: rgba(205, 127, 50, 0.1); height: 130px; }
                .podium-name { font-size: 0.85rem; font-weight: bold; margin: 10px 0 5px 0; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
                .podium-pts { font-size: 1.1rem; font-weight: bold; }
                
                .my-rank-card { background: linear-gradient(135deg, #1e3c72, #2a5298); border: 2px solid #ffd700; padding: 20px; border-radius: 16px; margin-top: 20px; text-align: center; box-shadow: 0 5px 15px rgba(0,0,0,0.3); }
            </style>
        `;

        if (top3 && top3.length > 0) {
            // ترتيب البيانات لكي تظهر المنصة بشكل صحيح: (2 - 1 - 3)
            const secondPlace = top3[1];
            const firstPlace = top3[0];
            const thirdPlace = top3[2];

            html += `<div class="podium-container">`;
            
            // المركز الثاني
            if (secondPlace) {
                html += `
                    <div class="podium-card rank-2">
                        <div style="font-size: 2rem;">🥈</div>
                        <div class="podium-name">${secondPlace.users.username}</div>
                        <div class="podium-pts" style="color: #c0c0c0;">${secondPlace.points_earned}</div>
                    </div>`;
            } else {
                html += `<div style="flex: 1;"></div>`;
            }

            // المركز الأول
            if (firstPlace) {
                html += `
                    <div class="podium-card rank-1">
                        <div style="font-size: 2.5rem;">👑</div>
                        <div class="podium-name">${firstPlace.users.username}</div>
                        <div class="podium-pts" style="color: #ffd700;">${firstPlace.points_earned}</div>
                    </div>`;
            }

            // المركز الثالث
            if (thirdPlace) {
                html += `
                    <div class="podium-card rank-3">
                        <div style="font-size: 1.8rem;">🥉</div>
                        <div class="podium-name">${thirdPlace.users.username}</div>
                        <div class="podium-pts" style="color: #cd7f32;">${thirdPlace.points_earned}</div>
                    </div>`;
            } else {
                html += `<div style="flex: 1;"></div>`;
            }

            html += `</div>`;
        } else {
            html += `<div style="text-align:center; color:#666; padding: 30px;">${isAr ? 'لا توجد بيانات ترتيب حالياً' : 'No ranking data available'}</div>`;
        }

        // بطاقة المستخدم الحالي المنفصلة
        html += `
            <div class="my-rank-card">
                <p style="margin: 0 0 10px 0; font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                    ${isAr ? 'ترتيبك الحالي في التحديات' : 'Your Current Rank'}
                </p>
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px;">
                    <div style="font-size: 2.5rem; font-weight: bold; color: #fff;">
                        #${myRank || (isAr ? '-' : '-')}
                    </div>
                    <div style="text-align: ${isAr ? 'right' : 'left'};">
                        <div style="font-weight: bold; font-size: 1.2rem;">${userState.username}</div>
                        <div style="color: #ffd700; font-weight: bold; font-size: 1rem; margin-top: 3px;">
                            ${myData ? myData.points_earned : 0} ${isAr ? 'نقطة' : 'Pts'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        console.error(isAr ? "خطأ في عرض الترتيب:" : "Error displaying ranking:", error);
        container.innerHTML = `<div style="text-align:center; color: #ff4444; padding: 10px;">
            ${isAr ? 'تعذر تحميل الترتيب.' : 'Failed to load ranking.'}
        </div>`;
    }
};
