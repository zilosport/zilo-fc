/**
 * ملف: weekly_match_rankings.js
 * الوظيفة: شاشة الترتيب الكاملة (المنصة + ترتيب المستخدم + سجل التوقعات + الترتيب العام)
 */

// دالة مساعدة لإنشاء الصورة الشخصية أو الحرف الأول
const generateAvatar = (name, photoUrl, size = '50px') => {
    if (photoUrl) {
        return `<img src="${photoUrl}" style="width:${size}; height:${size}; border-radius:50%; object-fit:cover; border:2px solid var(--accent-gold, #fcb045); margin: 0 auto; display: block;">`;
    } else {
        const initial = name ? String(name).charAt(0).toUpperCase() : '👤';
        return `<div style="width:${size}; height:${size}; border-radius:50%; background: linear-gradient(135deg, #833ab4, #fd1d1d); color:white; display:flex; align-items:center; justify-content:center; font-size:calc(${size} / 2.2); font-weight:bold; margin: 0 auto; border:2px solid var(--accent-gold, #fcb045);">${initial}</div>`;
    }
};

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
        background: var(--bg-dark, #121215) !important; 
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
            <h2 style="margin:0; color:var(--accent-gold, #fcb045);">🏆 ${title}</h2>
            <button onclick="document.getElementById('ranking-full-screen').remove()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer;">✕</button>
        </div>
        <div id="full-ranking-container">
            <div style="text-align:center; color: #888; padding: 50px;">
                ${isAr ? '⏳ جاري جلب البيانات...' : '⏳ Fetching data...'}
            </div>
        </div>
    `;

    document.body.appendChild(screen);
    window.renderHomeRankingWidget('full-ranking-container');
};

// دالة جلب وبناء واجهة الترتيب والسجل
window.renderHomeRankingWidget = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentUserId = userState.userId || userState.telegram_id;
    const isAr = userState.lang === 'ar'; 

    try {
        // 1. جلب أول 50 لاعب للترتيب العام (من ضمنهم أول 3 للمنصة)
        const { data: rankings, error: topError } = await supabaseClient
            .from('weekly_match_rankings')
            .select('*')
            .eq('is_eliminated', false)
            .eq('category', 'weekly') 
            .order('points_earned', { ascending: false })
            .limit(50);

        if (topError) throw topError;

        // 2. جلب ترتيب المستخدم الحالي
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

        // 3. جلب سجل توقعات المستخدم الحالي
        const { data: predictions } = await supabaseClient
            .from('match_predictions')
            .select('*')
            .eq('telegram_id', currentUserId)
            .order('created_at', { ascending: false });

        // 4. جلب بيانات المباريات المرتبطة بهذه التوقعات
        let matches = [];
        if (predictions && predictions.length > 0) {
            const matchIds = predictions.map(p => p.match_id);
            const { data: matchesData } = await supabaseClient
                .from('matches')
                .select('*')
                .in('id', matchIds);
            matches = matchesData || [];
        }

        // ==========================================
        // بناء الواجهة
        // ==========================================
        let html = `
            <style>
                .podium-container { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; margin-top: 20px; gap: 10px; }
                .podium-card { background: var(--bg-card, #1c1c22); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; text-align: center; padding: 15px 5px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
                .rank-1 { border-color: var(--accent-gold, #fcb045); background: rgba(252, 176, 69, 0.1); height: 180px; transform: translateY(-15px); }
                .rank-2 { border-color: #c0c0c0; background: rgba(192, 192, 192, 0.1); height: 150px; }
                .rank-3 { border-color: #cd7f32; background: rgba(205, 127, 50, 0.1); height: 140px; }
                .podium-name { font-size: 0.85rem; font-weight: bold; margin: 10px 0 5px 0; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; }
                .podium-pts { font-size: 1.1rem; font-weight: bold; }
                
                .my-rank-card { background: var(--gradient-primary, linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)); padding: 20px; border-radius: 16px; margin-top: 20px; text-align: center; box-shadow: 0 5px 15px rgba(253, 29, 29, 0.3); border: 1px solid rgba(255,255,255,0.2); }
            </style>
        `;

        // -- أ. قسم المنصة (الـ Top 3) --
        if (rankings && rankings.length > 0) {
            const firstPlace = rankings[0];
            const secondPlace = rankings[1];
            const thirdPlace = rankings[2];

            html += `<div class="podium-container">`;
            
            // المركز الثاني
            if (secondPlace) {
                const name2 = secondPlace.username || secondPlace.telegram_id;
                const photo2 = secondPlace.photo_url || null;
                html += `
                    <div class="podium-card rank-2">
                        <div style="font-size: 1.5rem; margin-bottom: 5px;">🥈</div>
                        ${generateAvatar(name2, photo2, '50px')}
                        <div class="podium-name">${name2}</div>
                        <div class="podium-pts" style="color: #c0c0c0;">${secondPlace.points_earned}</div>
                    </div>`;
            } else { html += `<div style="flex: 1;"></div>`; }

            // المركز الأول
            if (firstPlace) {
                const name1 = firstPlace.username || firstPlace.telegram_id;
                const photo1 = firstPlace.photo_url || null;
                html += `
                    <div class="podium-card rank-1">
                        <div style="font-size: 2rem; margin-bottom: 5px;">👑</div>
                        ${generateAvatar(name1, photo1, '65px')}
                        <div class="podium-name">${name1}</div>
                        <div class="podium-pts" style="color: var(--accent-gold, #fcb045);">${firstPlace.points_earned}</div>
                    </div>`;
            }

            // المركز الثالث
            if (thirdPlace) {
                const name3 = thirdPlace.username || thirdPlace.telegram_id;
                const photo3 = thirdPlace.photo_url || null;
                html += `
                    <div class="podium-card rank-3">
                        <div style="font-size: 1.5rem; margin-bottom: 5px;">🥉</div>
                        ${generateAvatar(name3, photo3, '45px')}
                        <div class="podium-name">${name3}</div>
                        <div class="podium-pts" style="color: #cd7f32;">${thirdPlace.points_earned}</div>
                    </div>`;
            } else { html += `<div style="flex: 1;"></div>`; }

            html += `</div>`;
        } else {
            html += `<div style="text-align:center; color:#666; padding: 30px;">${isAr ? 'لا توجد بيانات ترتيب حالياً' : 'No ranking data available'}</div>`;
        }

        // -- ب. قسم بطاقة ترتيب المستخدم الحالي --
        html += `
            <div class="my-rank-card">
                <p style="margin: 0 0 10px 0; font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                    ${isAr ? 'ترتيبك الحالي في التحديات' : 'Your Current Rank'}
                </p>
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px;">
                    <div style="font-size: 2.5rem; font-weight: bold; color: #fff;">
                        #${myRank || (isAr ? '-' : '-')}
                    </div>
                    ${generateAvatar(userState.username, userState.photoUrl, '60px')}
                    <div style="text-align: ${isAr ? 'right' : 'left'};">
                        <div style="font-weight: bold; font-size: 1.2rem;">${userState.username || 'User'}</div>
                        <div style="color: #fff; font-weight: bold; font-size: 1rem; margin-top: 3px; background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 8px; display: inline-block;">
                            ${myData ? myData.points_earned : 0} ${isAr ? 'نقطة' : 'Pts'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // -- ج. قسم سجل التوقعات والأخطاء --
        let errorCount = 0;
        let historyHtml = '';

        if (predictions && predictions.length > 0) {
            // حساب الأخطاء من جميع بيانات الأسبوع لكي لا يتأثر النظام
            errorCount = predictions.filter(p => p.prediction_status === 'wrong').length;
            
            // 🎯 التعديل الجذري: أخذ أحدث 10 توقعات فقط لعرضها في الواجهة لتسريع الهاتف وتخفيف الزحام
            const recentPredictions = predictions.slice(0, 10);
            
            historyHtml = recentPredictions.map(pred => {
                const match = matches.find(m => m.id === pred.match_id);
                if (!match) return ''; 

                let statusUi = '';
                let resultUi = '';

                if (pred.prediction_status === 'correct') {
                    statusUi = `<span style="background:rgba(16, 185, 129, 0.2); color:#10b981; padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">+3 ${isAr ? 'نقاط' : 'Pts'} ✅</span>`;
                    resultUi = `<div style="color:#10b981; font-size:0.85rem; margin-top:8px;">${isAr ? 'النتيجة النهائية:' : 'Final Score:'} ${match.home_score} - ${match.away_score}</div>`;
                } else if (pred.prediction_status === 'wrong') {
                    statusUi = `<span style="background:rgba(253, 29, 29, 0.2); color:var(--accent-red, #fd1d1d); padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">${isAr ? 'خطأ' : 'Wrong'} ❌</span>`;
                    resultUi = `<div style="color:var(--accent-red, #fd1d1d); font-size:0.85rem; margin-top:8px;">${isAr ? 'النتيجة النهائية:' : 'Final Score:'} ${match.home_score} - ${match.away_score}</div>`;
                } else {
                    statusUi = `<span style="background:rgba(252, 176, 69, 0.2); color:var(--accent-gold, #fcb045); padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">${isAr ? 'قيد الانتظار' : 'Pending'} ⏳</span>`;
                }

                return `
                    <div style="background:var(--bg-card, #1c1c22); padding:15px; border-radius:12px; margin-bottom:15px; border: 1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:bold; font-size:1rem; margin-bottom:5px; color:#fff;">${match.team_a} vs ${match.team_b}</div>
                            <div style="color:#aaa; font-size:0.9rem;">
                                ${isAr ? 'توقعك:' : 'Prediction:'} <b style="color:#fff;">${pred.predicted_home} - ${pred.predicted_away}</b>
                            </div>
                            ${resultUi}
                        </div>
                        <div>${statusUi}</div>
                    </div>
                `;
            }).join('');

            // رسالة توضيحية للمستخدم في حال كان لديه أكثر من 10 توقعات
            if (predictions.length > 10) {
                historyHtml += `<div style="text-align:center; color:#888; font-size: 0.85rem; margin-top: 15px; padding-bottom: 10px;">
                    ${isAr ? 'عرض أحدث 10 توقعات فقط لسهولة التصفح' : 'Showing latest 10 predictions only'}
                </div>`;
            }

        } else {
            historyHtml = `<div style="text-align:center; color:#888; padding:30px; background:rgba(255,255,255,0.02); border-radius:12px; border: 1px solid rgba(255,255,255,0.05);">${isAr ? 'لم تقم بأي توقعات بعد.' : 'No predictions yet.'}</div>`;
        }

        html += `
            <div style="margin-top: 35px; margin-bottom: 25px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="margin:0; color:#fff;">📜 ${isAr ? 'سجل توقعاتي' : 'My Predictions'}</h3>
                    <div style="background:var(--bg-card, #1c1c22); padding:5px 12px; border-radius:20px; font-size:0.85rem; border:1px solid rgba(255,255,255,0.1);">
                        <span style="color:#aaa;">${isAr ? 'الأخطاء:' : 'Errors:'}</span> 
                        <span style="font-weight:bold; color:${errorCount >= 2 ? 'var(--accent-red, #fd1d1d)' : '#10b981'};">${errorCount} / 2</span>
                    </div>
                </div>
                ${historyHtml}
            </div>
        `;

        // -- د. قسم باقي الترتيب العام (من المركز الرابع حتى الـ 50) --
        let leaderboardHtml = '';
        if (rankings && rankings.length > 3) {
            const restOfRankings = rankings.slice(3); // أخذ ما بعد أول 3
            
            leaderboardHtml = restOfRankings.map((rank, index) => {
                let actualRank = index + 4; // لأن أول 3 أخذوا المناصب الأولى
                let isMe = String(rank.telegram_id) === String(currentUserId);
                let cardStyle = isMe ? 'background: rgba(255, 215, 0, 0.15); border: 1px solid #ffd700;' : 'background: #1c1c22; border: 1px solid #25252d;';
                const alias = rank.username || 'ID: ' + String(rank.telegram_id).slice(-4);

                return `
                    <div style="${cardStyle} border-radius: 12px; padding: 12px 15px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 1.1rem; font-weight: bold; color: #888; width: 30px; text-align: center;">#${actualRank}</div>
                            <div style="color: #fff; font-weight: bold; font-size: 0.95rem;">${alias} ${isMe ? `<span style="color:#ffd700; font-size:0.75rem;">(${isAr ? 'أنت' : 'You'})</span>` : ''}</div>
                        </div>
                        <div style="color: #ffd700; font-weight: bold; font-size: 1.1rem;">${rank.points_earned || 0} <span style="font-size:0.7rem; color:#aaa;">${isAr ? 'نقطة' : 'Pts'}</span></div>
                    </div>
                `;
            }).join('');

            html += `
                <div style="margin-top: 30px;">
                    <h3 style="margin:0 0 15px 0; color:#fff;">🌍 ${isAr ? 'باقي المتصدرين' : 'Other Players'}</h3>
                    ${leaderboardHtml}
                </div>
            `;
        }

        container.innerHTML = html;

    } catch (error) {
        console.error(isAr ? "خطأ في عرض الترتيب:" : "Error displaying ranking:", error);
        
        container.innerHTML = `<div style="text-align:center; color: var(--accent-red, #fd1d1d); padding: 10px;">
            ${isAr ? 'تعذر تحميل الترتيب.' : 'Failed to load ranking.'}
        </div>`;
    }
};
