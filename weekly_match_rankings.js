/**
 * ملف: weekly_match_rankings.js
 * الوظيفة: شاشة الترتيب الكاملة (المنصة + البطاقة الأسطورية الشاملة + سجل التوقعات + الترتيب العام)
 */

// دالة مساعدة للمنصة فقط (لا تؤثر على البطاقة الأسطورية)
const generateAvatar = (name, photoUrl, size = '50px') => {
    if (photoUrl) {
        return `<img src="${photoUrl}" style="width:${size}; height:${size}; border-radius:50%; object-fit:cover; border:2px solid var(--accent-gold, #fcb045); margin: 0 auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">`;
    } else {
        const initial = name ? String(name).charAt(0).toUpperCase() : '👤';
        return `<div style="width:${size}; height:${size}; border-radius:50%; background: linear-gradient(135deg, #833ab4, #fd1d1d); color:white; display:flex; align-items:center; justify-content:center; font-size:calc(${size} / 2.2); font-weight:bold; margin: 0 auto; border:2px solid var(--accent-gold, #fcb045); box-shadow: 0 4px 15px rgba(0,0,0,0.4);">${initial}</div>`;
    }
};

// ✅ تم تغيير اسم الدالة هنا لتجنب أي تضارب مع الملف القديم
window.openLegendaryRankingScreen = function() {
    // ✅ تم تعديل هذا السطر ليقوم بحذف الواجهة القديمة إن وجدت بدلاً من إيقاف العمل
    const existingScreen = document.getElementById('ranking-full-screen');
    if (existingScreen) existingScreen.remove();

    const isAr = userState.lang === 'ar';
    const title = isAr ? 'ترتيب التحديات' : 'Challenges Ranking';

    const screen = document.createElement('div');
    screen.id = 'ranking-full-screen';
    
    screen.style.cssText = `
        position: fixed !important; 
        top: 0 !important; 
        left: 0 !important; 
        right: 0 !important;
        bottom: 0 !important;
        width: 100vw !important; 
        height: 100vh !important; 
        background: var(--bg-dark, #0d0d12) !important; 
        z-index: 99999 !important; 
        padding: 20px; 
        box-sizing: border-box; 
        overflow-y: auto; 
        color: white;
        direction: ${isAr ? 'rtl' : 'ltr'}; 
        text-align: ${isAr ? 'right' : 'left'};
        scroll-behavior: smooth;
    `;

    screen.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <h2 style="margin:0; color:var(--accent-gold, #fcb045); font-weight: 900; letter-spacing: 0.5px;">🏆 ${title}</h2>
            <button onclick="document.getElementById('ranking-full-screen').remove()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer; transition: 0.2s;">✕</button>
        </div>
        <div id="full-ranking-container">
            <div style="text-align:center; color: #888; padding: 50px; font-size: 1.1rem;">
                ${isAr ? '⏳ جاري جلب البيانات...' : '⏳ Fetching data...'}
            </div>
        </div>
    `;

    document.body.appendChild(screen);
    window.renderHomeRankingWidget('full-ranking-container');
};

window.renderHomeRankingWidget = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentUserId = userState.userId || userState.telegram_id;
    const isAr = userState.lang === 'ar'; 

    try {
        const { data: rankings, error: topError } = await supabaseClient
            .from('weekly_match_rankings')
            .select('*')
            .eq('is_eliminated', false)
            .eq('category', 'weekly') 
            .order('points_earned', { ascending: false })
            .limit(50);

        if (topError) throw topError;

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

        const { data: predictions } = await supabaseClient
            .from('match_predictions')
            .select('*')
            .eq('telegram_id', currentUserId)
            .order('created_at', { ascending: false });

        let matches = [];
        if (predictions && predictions.length > 0) {
            const matchIds = predictions.map(p => p.match_id);
            const { data: matchesData } = await supabaseClient
                .from('matches')
                .select('*')
                .in('id', matchIds);
            matches = matchesData || [];
        }

        let correctCount = 0;
        let wrongCount = 0;
        let pendingCount = 0;

        if (predictions && predictions.length > 0) {
            const totalPredictions = predictions.length;
            correctCount = predictions.filter(p => p.prediction_status === 'correct').length;
            wrongCount = predictions.filter(p => p.prediction_status === 'wrong').length;
            pendingCount = totalPredictions - (correctCount + wrongCount);
        }

        let html = `
            <style>
                /* ====== تأثيرات الحركة ====== */
                @keyframes floatAvatar {
                    0% { transform: translate(-50%, 0px); }
                    50% { transform: translate(-50%, -8px); }
                    100% { transform: translate(-50%, 0px); }
                }
                @keyframes glowPulse {
                    0% { box-shadow: 0 0 15px rgba(252, 176, 69, 0.4), inset 0 0 10px rgba(252, 176, 69, 0.1); }
                    50% { box-shadow: 0 0 30px rgba(253, 29, 29, 0.6), inset 0 0 20px rgba(253, 29, 29, 0.2); }
                    100% { box-shadow: 0 0 15px rgba(252, 176, 69, 0.4), inset 0 0 10px rgba(252, 176, 69, 0.1); }
                }

                /* ====== البطاقة الأسطورية للمستخدم ====== */
                .legendary-card {
                    position: relative;
                    background: rgba(22, 22, 30, 0.8);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border-radius: 25px;
                    padding: 65px 25px 35px 25px; 
                    margin: 80px 0 40px 0; 
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.6), inset 0 2px 15px rgba(255,255,255,0.05);
                    text-align: center;
                }
                
                .legendary-card::before {
                    content: '';
                    position: absolute;
                    top: 0; left: 0; right: 0; bottom: 0;
                    background: radial-gradient(circle at 50% 0%, rgba(131, 58, 180, 0.2) 0%, transparent 70%);
                    border-radius: 25px;
                    pointer-events: none;
                    z-index: 0;
                }

                /* -- شارة الترتيب البارزة (البطاقة الحمراء/الصفراء) -- */
                .legendary-rank-badge {
                    position: absolute;
                    top: -20px;
                    ${isAr ? 'left: -10px;' : 'right: -10px;'}
                    color: white;
                    font-weight: 900;
                    font-size: 1.6rem;
                    padding: 10px 22px;
                    border-radius: 12px;
                    border: 3px solid rgba(255,255,255,0.9);
                    transform: rotate(${isAr ? '-8deg' : '8deg'});
                    z-index: 10;
                    letter-spacing: 1px;
                    box-shadow: 0 8px 25px rgba(0,0,0,0.5);
                    text-shadow: 0 2px 4px rgba(0,0,0,0.4);
                    transition: transform 0.3s;
                }
                .legendary-rank-badge:hover {
                    transform: rotate(0deg) scale(1.05);
                }
                .badge-top {
                    background: linear-gradient(135deg, #f6d365 0%, #fda085 100%);
                    box-shadow: 0 8px 25px rgba(253, 160, 133, 0.5);
                    color: #fff;
                }
                .badge-normal {
                    background: linear-gradient(135deg, #ff0844 0%, #ffb199 100%);
                    box-shadow: 0 8px 25px rgba(255, 8, 68, 0.5);
                }

                /* تصميم الصورة الشخصية الطافية */
                .legendary-avatar-wrapper {
                    position: absolute;
                    top: -60px; 
                    left: 50%;
                    transform: translateX(-50%);
                    width: 110px;
                    height: 110px;
                    border-radius: 50%;
                    padding: 5px;
                    background: linear-gradient(135deg, #fcb045, #fd1d1d, #833ab4);
                    animation: floatAvatar 4s ease-in-out infinite, glowPulse 3s infinite;
                    z-index: 2;
                }

                .legendary-avatar-inner {
                    width: 100%;
                    height: 100%;
                    border-radius: 50%;
                    background: #111;
                    overflow: hidden;
                    border: 4px solid #16161e; 
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    color: white;
                    font-size: 3rem;
                    font-weight: bold;
                }

                .legendary-avatar-inner img {
                    width: 100%;
                    height: 100%;
                    object-fit: cover;
                }

                /* نصوص البطاقة */
                .legendary-name {
                    position: relative;
                    z-index: 1;
                    font-size: 1.8rem;
                    font-weight: 900;
                    color: #fff;
                    margin-bottom: 10px;
                    text-shadow: 0 3px 15px rgba(0,0,0,0.8);
                    letter-spacing: 0.5px;
                }

                .legendary-points {
                    position: relative;
                    z-index: 1;
                    display: inline-flex;
                    align-items: center;
                    gap: 10px;
                    background: rgba(0, 0, 0, 0.4);
                    padding: 10px 25px;
                    border-radius: 15px;
                    border: 1px solid rgba(255, 215, 0, 0.3);
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.6);
                }

                /* شبكة الإحصائيات الفخمة */
                .legendary-stats-grid {
                    position: relative;
                    z-index: 1;
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    margin-top: 30px;
                }

                .legendary-stat-box {
                    background: rgba(0, 0, 0, 0.3);
                    border-radius: 18px;
                    padding: 18px 5px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    backdrop-filter: blur(10px);
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                }
                
                .legendary-stat-box:hover {
                    transform: translateY(-5px) scale(1.03);
                }

                .stat-correct { border-bottom: 4px solid #10b981; box-shadow: 0 10px 20px rgba(16, 185, 129, 0.1); }
                .stat-pending { border-bottom: 4px solid #fcb045; box-shadow: 0 10px 20px rgba(252, 176, 69, 0.1); }
                .stat-wrong   { border-bottom: 4px solid #fd1d1d; box-shadow: 0 10px 20px rgba(253, 29, 29, 0.1); }

                /* -- زر سجل التوقعات -- */
                .btn-my-predictions {
                    position: relative;
                    z-index: 1;
                    margin-top: 30px;
                    background: linear-gradient(90deg, #fd1d1d, #fcb045);
                    color: white;
                    border: none;
                    padding: 14px 35px;
                    border-radius: 30px;
                    font-size: 1.15rem;
                    font-weight: 900;
                    cursor: pointer;
                    box-shadow: 0 6px 20px rgba(253, 29, 29, 0.4);
                    transition: all 0.3s ease;
                    width: 85%;
                    max-width: 300px;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 10px;
                    text-decoration: none;
                }
                .btn-my-predictions:hover {
                    transform: translateY(-3px) scale(1.02);
                    box-shadow: 0 10px 25px rgba(253, 29, 29, 0.6);
                    background: linear-gradient(90deg, #fcb045, #fd1d1d);
                }

                /* باقي التنسيقات (المنصة) */
                .podium-container { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; margin-top: 20px; gap: 10px; }
                .podium-card { background: var(--bg-card, #1c1c22); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; text-align: center; padding: 15px 5px; flex: 1; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
                .rank-1 { border-color: var(--accent-gold, #fcb045); background: linear-gradient(180deg, rgba(252, 176, 69, 0.15) 0%, rgba(28, 28, 34, 1) 100%); height: 180px; transform: translateY(-15px); }
                .rank-2 { border-color: #c0c0c0; background: linear-gradient(180deg, rgba(192, 192, 192, 0.1) 0%, rgba(28, 28, 34, 1) 100%); height: 150px; }
                .rank-3 { border-color: #cd7f32; background: linear-gradient(180deg, rgba(205, 127, 50, 0.1) 0%, rgba(28, 28, 34, 1) 100%); height: 140px; }
                .podium-name { font-size: 0.85rem; font-weight: bold; margin: 10px 0 5px 0; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; }
                .podium-pts { font-size: 1.2rem; font-weight: 900; }
            </style>
        `;

        // -- 1. قسم المنصة --
        if (rankings && rankings.length > 0) {
            const firstPlace = rankings[0];
            const secondPlace = rankings[1];
            const thirdPlace = rankings[2];

            html += `<div class="podium-container">`;
            
            if (secondPlace) {
                const name2 = secondPlace.username || secondPlace.telegram_id;
                html += `
                    <div class="podium-card rank-2">
                        <div style="font-size: 1.5rem; margin-bottom: 5px;">🥈</div>
                        ${generateAvatar(name2, secondPlace.photo_url, '50px')}
                        <div class="podium-name">${name2}</div>
                        <div class="podium-pts" style="color: #c0c0c0;">${secondPlace.points_earned}</div>
                    </div>`;
            } else { html += `<div style="flex: 1;"></div>`; }

            if (firstPlace) {
                const name1 = firstPlace.username || firstPlace.telegram_id;
                html += `
                    <div class="podium-card rank-1">
                        <div style="font-size: 2rem; margin-bottom: 5px;">👑</div>
                        ${generateAvatar(name1, firstPlace.photo_url, '65px')}
                        <div class="podium-name">${name1}</div>
                        <div class="podium-pts" style="color: var(--accent-gold, #fcb045);">${firstPlace.points_earned}</div>
                    </div>`;
            }

            if (thirdPlace) {
                const name3 = thirdPlace.username || thirdPlace.telegram_id;
                html += `
                    <div class="podium-card rank-3">
                        <div style="font-size: 1.5rem; margin-bottom: 5px;">🥉</div>
                        ${generateAvatar(name3, thirdPlace.photo_url, '45px')}
                        <div class="podium-name">${name3}</div>
                        <div class="podium-pts" style="color: #cd7f32;">${thirdPlace.points_earned}</div>
                    </div>`;
            } else { html += `<div style="flex: 1;"></div>`; }

            html += `</div>`;
        } else {
            html += `<div style="text-align:center; color:#666; padding: 30px;">${isAr ? 'لا توجد بيانات ترتيب حالياً' : 'No ranking data available'}</div>`;
        }

        // -- 2. البطاقة الأسطورية الشاملة --
        const userInitial = userState.username ? String(userState.username).charAt(0).toUpperCase() : '👤';
        const userImageHtml = userState.photoUrl 
            ? `<img src="${userState.photoUrl}" alt="User">` 
            : `${userInitial}`;

        const displayRank = myRank || '-';
        const badgeClass = (myRank && myRank <= 3) ? 'badge-top' : 'badge-normal';

        html += `
            <div class="legendary-card">
                <!-- شارة الترتيب البارزة (البطاقة الملونة) -->
                <div class="legendary-rank-badge ${badgeClass}">
                    #${displayRank}
                </div>

                <!-- الصورة الطافية خارج حدود البطاقة -->
                <div class="legendary-avatar-wrapper">
                    <div class="legendary-avatar-inner">
                        ${userImageHtml}
                    </div>
                </div>
                
                <!-- الاسم والنقاط -->
                <div class="legendary-name">${userState.username || 'User'}</div>
                <div class="legendary-points">
                    <span style="font-size: 1.3rem;">🏆</span>
                    <span style="color: var(--accent-gold, #fcb045); font-weight: 900; font-size: 1.4rem;">${myData ? myData.points_earned : 0}</span>
                    <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem; font-weight: bold; text-transform: uppercase;">${isAr ? 'نقطة' : 'Pts'}</span>
                </div>

                <!-- شبكة الإحصائيات المضيئة -->
                <div class="legendary-stats-grid">
                    <div class="legendary-stat-box stat-correct">
                        <div style="font-size: 1.8rem; margin-bottom: 5px; text-shadow: 0 0 15px rgba(16, 185, 129, 0.6);">✅</div>
                        <div style="color: #10b981; font-size: 1.6rem; font-weight: 900;">${correctCount}</div>
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: bold; margin-top: 4px;">${isAr ? 'صحيح' : 'Correct'}</div>
                    </div>
                    
                    <div class="legendary-stat-box stat-pending">
                        <div style="font-size: 1.8rem; margin-bottom: 5px; text-shadow: 0 0 15px rgba(252, 176, 69, 0.6);">⏳</div>
                        <div style="color: #fcb045; font-size: 1.6rem; font-weight: 900;">${pendingCount}</div>
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: bold; margin-top: 4px;">${isAr ? 'انتظار' : 'Pending'}</div>
                    </div>
                    
                    <div class="legendary-stat-box stat-wrong">
                        <div style="font-size: 1.8rem; margin-bottom: 5px; text-shadow: 0 0 15px rgba(253, 29, 29, 0.6);">❌</div>
                        <div style="color: ${wrongCount >= 2 ? '#fd1d1d' : '#fff'}; font-size: 1.6rem; font-weight: 900;">
                            ${wrongCount} <span style="font-size: 0.9rem; color: rgba(255,255,255,0.4);">/ 2</span>
                        </div>
                        <div style="color: rgba(255,255,255,0.6); font-size: 0.85rem; font-weight: bold; margin-top: 4px;">${isAr ? 'أخطاء' : 'Wrong'}</div>
                    </div>
                </div>

                <!-- زر سجل التوقعات الجديد -->
                <button class="btn-my-predictions" onclick="document.getElementById('predictions-history-section').scrollIntoView({behavior: 'smooth'})">
                    📝 ${isAr ? 'سجل توقعاتي' : 'My Predictions'}
                </button>
            </div>
        `;

        // -- 3. سجل التوقعات --
        let historyHtml = '';
        if (predictions && predictions.length > 0) {
            const recentPredictions = predictions.slice(0, 10); 
            
            historyHtml = recentPredictions.map(pred => {
                const match = matches.find(m => m.id === pred.match_id);
                if (!match) return ''; 

                let statusColor = '';
                let statusBg = '';
                let statusText = '';
                let resultUi = '';

                if (pred.prediction_status === 'correct') {
                    statusColor = '#10b981';
                    statusBg = 'rgba(16, 185, 129, 0.05)';
                    statusText = `+3 ${isAr ? 'نقاط' : 'Pts'} ✅`;
                    resultUi = `<div style="color:${statusColor}; font-size:0.85rem; margin-top:8px; font-weight:600;">${isAr ? 'النتيجة النهائية:' : 'Final Score:'} ${match.home_score} - ${match.away_score}</div>`;
                } else if (pred.prediction_status === 'wrong') {
                    statusColor = 'var(--accent-red, #fd1d1d)';
                    statusBg = 'rgba(253, 29, 29, 0.05)';
                    statusText = `${isAr ? 'خطأ' : 'Wrong'} ❌`;
                    resultUi = `<div style="color:${statusColor}; font-size:0.85rem; margin-top:8px; font-weight:600;">${isAr ? 'النتيجة النهائية:' : 'Final Score:'} ${match.home_score} - ${match.away_score}</div>`;
                } else {
                    statusColor = 'var(--accent-gold, #fcb045)';
                    statusBg = 'rgba(252, 176, 69, 0.05)';
                    statusText = `${isAr ? 'بالانتظار' : 'Pending'} ⏳`;
                }

                return `
                    <div style="background: linear-gradient(to ${isAr ? 'left' : 'right'}, var(--bg-card, #1c1c22), ${statusBg}); padding:18px; border-radius:16px; margin-bottom:15px; border: 1px solid rgba(255,255,255,0.03); border-${isAr ? 'right' : 'left'}: 4px solid ${statusColor}; display:flex; justify-content:space-between; align-items:center; box-shadow: 0 4px 12px rgba(0,0,0,0.15);">
                        <div>
                            <div style="font-weight:900; font-size:1.1rem; margin-bottom:8px; color:#fff; letter-spacing: 0.5px;">${match.team_a} <span style="color:#555; font-size:0.9rem; margin: 0 4px;">VS</span> ${match.team_b}</div>
                            <div style="color:#ccc; font-size:0.95rem; background: rgba(0,0,0,0.3); display: inline-block; padding: 5px 12px; border-radius: 8px;">
                                ${isAr ? 'توقعك:' : 'Prediction:'} <b style="color:#fff; font-size:1rem;">${pred.predicted_home} - ${pred.predicted_away}</b>
                            </div>
                            ${resultUi}
                        </div>
                        <div style="text-align: center; background: rgba(0,0,0,0.2); padding: 8px 12px; border-radius: 12px;">
                            <span style="color:${statusColor}; font-weight:bold; font-size:1rem; display:block;">${statusText}</span>
                        </div>
                    </div>
                `;
            }).join('');

            if (predictions.length > 10) {
                historyHtml += `<div style="text-align:center; color:#888; font-size: 0.9rem; margin-top: 20px; padding-bottom: 10px;">
                    ${isAr ? 'يتم عرض أحدث 10 توقعات فقط' : 'Showing latest 10 predictions only'}
                </div>`;
            }
        } else {
            historyHtml = `<div style="text-align:center; color:#888; padding:40px; background:rgba(255,255,255,0.02); border-radius:16px; border: 1px solid rgba(255,255,255,0.03); font-size:1.1rem;">${isAr ? 'لم تقم بأي توقعات بعد.' : 'No predictions yet.'}</div>`;
        }

        // تمت إضافة الـ ID هنا ليتم التمرير إليه عند ضغط الزر
        html += `
            <div id="predictions-history-section" style="margin-top: 10px; margin-bottom: 40px; scroll-margin-top: 25px;">
                <h3 style="margin:0 0 20px 0; color:#fff; font-size: 1.3rem; font-weight: 800;">📜 ${isAr ? 'سجل التوقعات' : 'Prediction History'}</h3>
                ${historyHtml}
            </div>
        `;

        // -- 4. قسم الترتيب العام --
        let leaderboardHtml = '';
        if (rankings && rankings.length > 3) {
            const restOfRankings = rankings.slice(3); 
            
            leaderboardHtml = restOfRankings.map((rank, index) => {
                let actualRank = index + 4; 
                let isMe = String(rank.telegram_id) === String(currentUserId);
                let cardStyle = isMe ? 'background: linear-gradient(90deg, rgba(255, 215, 0, 0.1) 0%, rgba(28, 28, 34, 1) 100%); border: 1px solid rgba(255, 215, 0, 0.3);' : 'background: #1c1c22; border: 1px solid rgba(255,255,255,0.03);';
                const alias = rank.username || 'ID: ' + String(rank.telegram_id).slice(-4);

                return `
                    <div style="${cardStyle} border-radius: 14px; padding: 16px 20px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.1);">
                        <div style="display: flex; align-items: center; gap: 18px;">
                            <div style="font-size: 1.2rem; font-weight: 900; color: ${isMe ? '#ffd700' : '#666'}; width: 35px; text-align: center;">#${actualRank}</div>
                            <div style="color: #fff; font-weight: bold; font-size: 1.05rem;">${alias} ${isMe ? `<span style="color:#ffd700; font-size:0.8rem; margin-${isAr ? 'right' : 'left'}:8px; background: rgba(255,215,0,0.15); padding: 2px 8px; border-radius: 6px;">${isAr ? 'أنت' : 'You'}</span>` : ''}</div>
                        </div>
                        <div style="color: #ffd700; font-weight: 900; font-size: 1.2rem;">${rank.points_earned || 0} <span style="font-size:0.8rem; color:#888; font-weight: 600;">${isAr ? 'نقطة' : 'Pts'}</span></div>
                    </div>
                `;
            }).join('');

            html += `
                <div>
                    <h3 style="margin:0 0 20px 0; color:#fff; font-size: 1.3rem; font-weight: 800;">🌍 ${isAr ? 'الترتيب العام' : 'Global Ranking'}</h3>
                    ${leaderboardHtml}
                </div>
            `;
        }

        container.innerHTML = html;

    } catch (error) {
        console.error(isAr ? "خطأ في عرض الترتيب:" : "Error displaying ranking:", error);
        
        container.innerHTML = `<div style="text-align:center; color: var(--accent-red, #fd1d1d); padding: 25px; background: rgba(253, 29, 29, 0.05); border-radius: 16px; border: 1px solid rgba(253, 29, 29, 0.2); font-weight: bold;">
            ${isAr ? 'تعذر تحميل الترتيب. يرجى المحاولة لاحقاً.' : 'Failed to load ranking. Please try again later.'}
        </div>`;
    }
};
