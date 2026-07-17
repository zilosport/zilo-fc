/**
 * ملف: weekly_match_rankings.js
 * الوظيفة: شاشة الترتيب الكاملة (المنصة + البطاقة الاحترافية الشاملة + سجل التوقعات + الترتيب العام)
 */

// دالة مساعدة لإنشاء الصورة الشخصية أو الحرف الأول
const generateAvatar = (name, photoUrl, size = '50px') => {
    if (photoUrl) {
        return `<img src="${photoUrl}" style="width:${size}; height:${size}; border-radius:50%; object-fit:cover; border:2px solid var(--accent-gold, #fcb045); margin: 0 auto; display: block; box-shadow: 0 4px 15px rgba(0,0,0,0.4);">`;
    } else {
        const initial = name ? String(name).charAt(0).toUpperCase() : '👤';
        return `<div style="width:${size}; height:${size}; border-radius:50%; background: linear-gradient(135deg, #833ab4, #fd1d1d); color:white; display:flex; align-items:center; justify-content:center; font-size:calc(${size} / 2.2); font-weight:bold; margin: 0 auto; border:2px solid var(--accent-gold, #fcb045); box-shadow: 0 4px 15px rgba(0,0,0,0.4);">${initial}</div>`;
    }
};

window.openRankingScreen = function() {
    if (document.getElementById('ranking-full-screen')) return;

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
            <h2 style="margin:0; color:var(--accent-gold, #fcb045); font-weight: 800; letter-spacing: 0.5px;">🏆 ${title}</h2>
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
                /* تنسيق المنصة */
                .podium-container { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; margin-top: 20px; gap: 10px; }
                .podium-card { background: var(--bg-card, #1c1c22); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; text-align: center; padding: 15px 5px; flex: 1; display: flex; flex-direction: column; justify-content: center; box-shadow: 0 5px 15px rgba(0,0,0,0.2); }
                .rank-1 { border-color: var(--accent-gold, #fcb045); background: linear-gradient(180deg, rgba(252, 176, 69, 0.15) 0%, rgba(28, 28, 34, 1) 100%); height: 180px; transform: translateY(-15px); }
                .rank-2 { border-color: #c0c0c0; background: linear-gradient(180deg, rgba(192, 192, 192, 0.1) 0%, rgba(28, 28, 34, 1) 100%); height: 150px; }
                .rank-3 { border-color: #cd7f32; background: linear-gradient(180deg, rgba(205, 127, 50, 0.1) 0%, rgba(28, 28, 34, 1) 100%); height: 140px; }
                .podium-name { font-size: 0.85rem; font-weight: bold; margin: 10px 0 5px 0; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; }
                .podium-pts { font-size: 1.2rem; font-weight: 900; }
                
                /* تنسيق البطاقة الاحترافية الشاملة الجديدة */
                .pro-unified-card {
                    background: linear-gradient(145deg, #22222c 0%, #15151a 100%);
                    border-radius: 24px;
                    padding: 25px;
                    margin: 25px 0 35px 0;
                    border: 1px solid rgba(255, 255, 255, 0.08);
                    box-shadow: 0 20px 40px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.1);
                    position: relative;
                    overflow: hidden;
                }
                
                /* توهج خلفي يعطي طابع الفخامة */
                .pro-unified-card::before {
                    content: '';
                    position: absolute;
                    top: -50px;
                    ${isAr ? 'left: -50px;' : 'right: -50px;'}
                    width: 200px;
                    height: 200px;
                    background: radial-gradient(circle, rgba(252, 176, 69, 0.15) 0%, transparent 70%);
                    border-radius: 50%;
                    pointer-events: none;
                }

                .pro-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 25px;
                }

                .pro-user-info {
                    display: flex;
                    align-items: center;
                    gap: 18px;
                    position: relative;
                    z-index: 1;
                }

                .pro-rank-badge {
                    position: absolute;
                    bottom: -5px;
                    ${isAr ? 'right: -5px;' : 'left: -5px;'}
                    background: var(--accent-gold, #fcb045);
                    color: #000;
                    font-weight: 900;
                    font-size: 0.9rem;
                    padding: 4px 10px;
                    border-radius: 12px;
                    border: 2px solid #15151a;
                    box-shadow: 0 2px 5px rgba(0,0,0,0.3);
                }

                .pro-stats-grid {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 15px;
                    background: rgba(0, 0, 0, 0.25);
                    padding: 20px;
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.03);
                    position: relative;
                    z-index: 1;
                }

                .stat-box {
                    text-align: center;
                    padding: 10px 5px;
                    border-radius: 12px;
                    background: rgba(255, 255, 255, 0.02);
                    transition: transform 0.2s;
                }

                .stat-value {
                    font-size: 1.8rem;
                    font-weight: 900;
                    margin: 8px 0 4px 0;
                    letter-spacing: 1px;
                }
                
                .stat-label {
                    font-size: 0.85rem;
                    color: rgba(255, 255, 255, 0.6);
                    font-weight: 600;
                }
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

        // -- 2. البطاقة الشاملة الاحترافية (تم تكبيرها وتحسين تصميمها بشكل جذري) --
        html += `
            <div class="pro-unified-card">
                <!-- عنوان البطاقة -->
                <div style="text-align: center; margin-bottom: 20px; font-size: 1.15rem; font-weight: 800; color: rgba(255,255,255,0.9); text-transform: uppercase; letter-spacing: 1px;">
                    ${isAr ? 'بطاقتك الأسبوعية' : 'Your Weekly Card'}
                </div>
                
                <!-- معلومات المستخدم والنقاط -->
                <div class="pro-header">
                    <div class="pro-user-info">
                        <div style="position: relative;">
                            ${generateAvatar(userState.username, userState.photoUrl, '75px')}
                            <div class="pro-rank-badge">#${myRank || '-'}</div>
                        </div>
                        <div>
                            <div style="font-weight: 800; font-size: 1.4rem; color: #fff; margin-bottom: 4px;">${userState.username || 'User'}</div>
                            <div style="display: inline-flex; align-items: center; gap: 6px; background: rgba(252, 176, 69, 0.15); padding: 6px 12px; border-radius: 10px; border: 1px solid rgba(252, 176, 69, 0.3);">
                                <span style="font-size: 1.1rem;">🏆</span>
                                <span style="color: var(--accent-gold, #fcb045); font-weight: 900; font-size: 1.2rem;">${myData ? myData.points_earned : 0}</span>
                                <span style="color: rgba(255,255,255,0.7); font-size: 0.9rem; font-weight: 600;">${isAr ? 'نقطة' : 'Pts'}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- شبكة الإحصائيات (الصح، الخطأ، الانتظار) -->
                <div class="pro-stats-grid">
                    <div class="stat-box" style="box-shadow: inset 0 -3px 0 rgba(16, 185, 129, 0.3);">
                        <div style="font-size: 1.6rem;">✅</div>
                        <div class="stat-value" style="color: #10b981; text-shadow: 0 0 15px rgba(16, 185, 129, 0.4);">${correctCount}</div>
                        <div class="stat-label">${isAr ? 'إجابة صحيحة' : 'Correct'}</div>
                    </div>
                    
                    <div class="stat-box" style="box-shadow: inset 0 -3px 0 rgba(252, 176, 69, 0.3);">
                        <div style="font-size: 1.6rem;">⏳</div>
                        <div class="stat-value" style="color: #fcb045; text-shadow: 0 0 15px rgba(252, 176, 69, 0.4);">${pendingCount}</div>
                        <div class="stat-label">${isAr ? 'قيد الانتظار' : 'Pending'}</div>
                    </div>
                    
                    <div class="stat-box" style="box-shadow: inset 0 -3px 0 rgba(253, 29, 29, 0.3);">
                        <div style="font-size: 1.6rem;">❌</div>
                        <div class="stat-value" style="color: ${wrongCount >= 2 ? '#fd1d1d' : '#fff'}; text-shadow: 0 0 15px rgba(253, 29, 29, 0.4);">
                            ${wrongCount} <span style="font-size: 1rem; color: rgba(255,255,255,0.4);">/ 2</span>
                        </div>
                        <div class="stat-label">${isAr ? 'إجابة خاطئة' : 'Wrong'}</div>
                    </div>
                </div>
            </div>
        `;

        // -- 3. سجل التوقعات (تمت إعادته إلى 10 عناصر كما طلبت، مع التصميم المحسن) --
        let historyHtml = '';
        if (predictions && predictions.length > 0) {
            // إعادة العدد إلى 10
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

        html += `
            <div style="margin-top: 10px; margin-bottom: 40px;">
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
