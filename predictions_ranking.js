/**
 * ملف: predictions_ranking.js
 * الوظيفة: جلب المباريات ديناميكياً، إدارة التوقعات، وعرض سجل التوقعات (الصح والخطأ)
 */

function getT(key) {
    const lang = userState.lang || 'ar';
    return typeof i18n !== 'undefined' && i18n[lang][key] ? i18n[lang][key] : key;
}

// متغيرات عامة لتخزين البيانات محلياً وتسهيل التنقل بين التبويبات
let globalMatches = [];
let globalPredictions = [];

window.openChallengesScreen = async function() {
    if (document.getElementById('challenges-overlay')) return;

    const isAr = userState.lang === 'ar'; 

    const overlay = document.createElement('div');
    overlay.id = 'challenges-overlay';
    
    overlay.style.cssText = `
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
    document.body.appendChild(overlay);

    // واجهة تحميل مؤقتة
    overlay.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <h2 style="margin:0; color:#ffd700;">${getT('weeklyChallenges')}</h2>
            <button onclick="window.closeChallengesScreen()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer;">✕</button>
        </div>
        <div style="text-align:center; color:#888; padding:50px;">⏳ جاري جلب المباريات...</div>
    `;

    if (!userState.predictedMatches) userState.predictedMatches = [];

    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            // 1. جلب التوقعات السابقة للمستخدم (جلبنا كل البيانات لنستخدمها في السجل)
            const { data: predData } = await supabaseClient
                .from('match_predictions')
                .select('*')
                .eq('telegram_id', userState.userId);
                
            if (predData) {
                globalPredictions = predData;
                userState.predictedMatches = predData.map(p => p.match_id);
            } else {
                globalPredictions = [];
            }

            // 2. جلب المباريات من جدول matches
            const { data: matchesData, error: matchesError } = await supabaseClient
                .from('matches')
                .select('*')
                .order('match_date', { ascending: true });

            if (!matchesError && matchesData) {
                globalMatches = matchesData;
            }
        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
        }
    }

    // استدعاء دالة التبويبات بدلاً من بناء الواجهة مباشرة هنا
    window.renderChallengesTabs('current');
};

// دالة التنقل وبناء التبويبات
window.renderChallengesTabs = function(activeTab) {
    const overlay = document.getElementById('challenges-overlay');
    if (!overlay) return;

    const isAr = userState.lang === 'ar';
    // حساب عدد الأخطاء من السجل
    const errorCount = globalPredictions.filter(p => p.prediction_status === 'wrong').length;

    const tabActiveStyle = `flex:1; padding:12px; background:#0088cc; color:white; border:none; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.95rem;`;
    const tabInactiveStyle = `flex:1; padding:12px; background:#25252d; color:#888; border:1px solid #333; border-radius:8px; font-weight:bold; cursor:pointer; font-size:0.95rem;`;

    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h2 style="margin:0; color:#ffd700;">${getT('weeklyChallenges')}</h2>
            <button onclick="window.closeChallengesScreen()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer;">✕</button>
        </div>

        <div style="background:#25252d; padding:12px 15px; border-radius:8px; margin-bottom:20px; display:flex; justify-content:space-around; border:1px solid #333;">
            <div style="text-align:center;">
                <div style="font-size:0.8rem; color:#888;">أخطاؤك</div>
                <div style="font-weight:bold; color:${errorCount >= 2 ? '#ff4444' : '#4caf50'};">${errorCount} / 2</div>
            </div>
        </div>

        <div style="display:flex; gap:10px; margin-bottom: 25px;">
            <button onclick="window.renderChallengesTabs('current')" style="${activeTab === 'current' ? tabActiveStyle : tabInactiveStyle}">
                ${isAr ? 'المباريات ⚽' : 'Matches ⚽'}
            </button>
            <button onclick="window.renderChallengesTabs('history')" style="${activeTab === 'history' ? tabActiveStyle : tabInactiveStyle}">
                ${isAr ? 'سجل توقعاتي 📜' : 'History 📜'}
            </button>
        </div>
        
        <div id="tab-content-container"></div>
    `;

    overlay.innerHTML = html;
    
    const contentContainer = document.getElementById('tab-content-container');
    if (activeTab === 'current') {
        contentContainer.innerHTML = buildCurrentMatchesHtml(isAr, errorCount);
    } else {
        contentContainer.innerHTML = buildPredictionHistoryHtml(isAr);
    }
};

// بناء واجهة المباريات (نفس تصميمك الأصلي)
function buildCurrentMatchesHtml(isAr, errorCount) {
    if (errorCount >= 2) {
        return `<div style="text-align:center; padding:30px; background:#25252d; border-radius:12px; border:1px solid #ff4444;">
            <div style="font-size:3rem; margin-bottom:10px;">❌</div>
            <h3 style="color:#ff4444; margin:0 0 10px 0;">${isAr ? 'لقد خرجت من التحدي' : 'Eliminated'}</h3>
            <p style="color:#aaa; font-size:0.9rem;">${isAr ? 'لقد استنفدت عدد الأخطاء المسموح بها.' : 'You have reached the maximum allowed errors.'}</p>
        </div>`;
    }

    if (globalMatches.length === 0) {
        return `<div style="text-align:center; color:#888; padding:50px;">لا توجد مباريات متاحة للتوقع حالياً.</div>`;
    }

    return globalMatches.map(m => {
        const matchDate = new Date(m.match_date);
        const now = new Date();
        
        const isStarted = now >= matchDate || m.status.toUpperCase() === 'LIVE'; 
        const isClosed = isStarted; 
        const hasPredicted = userState.predictedMatches.includes(m.id);

        const team1Name = m.team_a;
        const team2Name = m.team_b;
        
        const formattedDate = !isNaN(matchDate.getTime()) ? matchDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '';
        const formattedTime = !isNaN(matchDate.getTime()) ? matchDate.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '';

        let statusText = isAr ? 'لم تبدأ بعد ⏳' : 'Not Started ⏳';
        let statusColor = '#4caf50';
        if (m.status.toUpperCase() === 'LIVE') {
            statusText = isAr ? 'جارية الآن 🔴' : 'Live 🔴';
            statusColor = '#ff4444';
        } else if (m.status.toUpperCase() === 'FINISHED') {
            statusText = isAr ? 'انتهت 🏁' : 'Finished 🏁';
            statusColor = '#888888';
        } else if (isStarted) {
            statusText = isAr ? 'انطلق التحدي ⏱️' : 'Started ⏱️';
            statusColor = '#ff9800';
        }

        let buttonHtml = '';
        if (hasPredicted) {
            buttonHtml = `<button disabled style="width:100%; padding:12px; background:#4caf50; color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:bold; box-sizing: border-box;">
                            ${isAr ? 'تم التوقع ✅' : 'Predicted ✅'}
                          </button>`;
        } else if (isClosed) {
            buttonHtml = `<button disabled style="width:100%; padding:12px; background:#444; color:#888; border:none; border-radius:8px; font-size:0.95rem; box-sizing: border-box;">
                            ${isAr ? 'تم إغلاق التحدي 🔒' : 'Predictions Closed 🔒'}
                          </button>`;
        } else {
            buttonHtml = `<button id="btn-predict-${m.id}" onclick="window.showPredictionModal(${m.id}, '${team1Name}', '${team2Name}')" 
                            style="width:100%; padding:12px; background:#0088cc; border:none; color:white; border-radius:8px; font-weight:bold; font-size:1rem; box-sizing: border-box; cursor:pointer;">
                            ${isAr ? 'توقع النتيجة الآن 🎯' : 'Predict Score 🎯'}
                          </button>`;
        }

        return `
            <div style="background:#1c1c22; padding:20px; border-radius:12px; margin-bottom:18px; border: 1px solid #333; box-sizing: border-box; position: relative;">
                <div style="position: absolute; top: 0; left: 0; width: 100%; background: #25252d; padding: 6px 15px; border-radius: 12px 12px 0 0; box-sizing: border-box; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid #333;">
                    <span style="font-size: 0.8rem; color:#aaa;">🏆 ${getT('weeklyChallenges')}</span>
                    <span style="font-size: 0.8rem; font-weight:bold; color:${statusColor};">حالة المباراة: ${statusText}</span>
                </div>
                
                <div style="margin-top: 25px; display:flex; justify-content:space-between; align-items:center;">
                    <div style="text-align:center; flex:1;">
                        <div style="font-weight:bold; font-size: 1.1rem; color:#fff;">${team1Name}</div>
                    </div>
                    <div style="font-weight:bold; font-size: 1.2rem; color:#ffd700; margin: 0 15px;">VS</div>
                    <div style="text-align:center; flex:1;">
                        <div style="font-weight:bold; font-size: 1.1rem; color:#fff;">${team2Name}</div>
                    </div>
                </div>
                
                <div style="color:#aaa; font-size: 0.9rem; margin: 15px 0; text-align:center; background:#121215; padding:8px; border-radius:8px;">
                    📅 ${formattedDate} &nbsp;|&nbsp; 🕒 ${formattedTime}
                </div>
                
                <div id="btn-container-${m.id}">
                    ${buttonHtml}
                </div>
            </div>
        `;
    }).join('');
}

// بناء تبويب سجل التوقعات
function buildPredictionHistoryHtml(isAr) {
    if (globalPredictions.length === 0) {
        return `<div style="text-align:center; color:#888; padding:50px;">${isAr ? 'لم تقم بأي توقعات بعد.' : 'No predictions yet.'}</div>`;
    }

    return globalPredictions.map(pred => {
        const match = globalMatches.find(m => m.id === pred.match_id);
        if (!match) return ''; 

        let statusUi = '';
        let resultUi = '';

        if (pred.prediction_status === 'correct') {
            statusUi = `<span style="background:rgba(76, 175, 80, 0.2); color:#4caf50; padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">+3 ${isAr ? 'نقاط' : 'Pts'} ✅</span>`;
            resultUi = `<div style="color:#4caf50; font-size:0.85rem; margin-top:8px;">${isAr ? 'النتيجة النهائية:' : 'Final Score:'} ${match.home_score} - ${match.away_score}</div>`;
        } else if (pred.prediction_status === 'wrong') {
            statusUi = `<span style="background:rgba(255, 68, 68, 0.2); color:#ff4444; padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">${isAr ? 'خطأ' : 'Wrong'} ❌</span>`;
            resultUi = `<div style="color:#ff4444; font-size:0.85rem; margin-top:8px;">${isAr ? 'النتيجة النهائية:' : 'Final Score:'} ${match.home_score} - ${match.away_score}</div>`;
        } else {
            statusUi = `<span style="background:rgba(255, 215, 0, 0.2); color:#ffd700; padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">${isAr ? 'قيد الانتظار' : 'Pending'} ⏳</span>`;
        }

        return `
            <div style="background:#1c1c22; padding:15px; border-radius:12px; margin-bottom:15px; border: 1px solid #333; display:flex; justify-content:space-between; align-items:center;">
                <div>
                    <div style="font-weight:bold; font-size:1rem; margin-bottom:5px;">${match.team_a} vs ${match.team_b}</div>
                    <div style="color:#aaa; font-size:0.9rem;">
                        ${isAr ? 'توقعك:' : 'Prediction:'} <b style="color:#fff;">${pred.predicted_home} - ${pred.predicted_away}</b>
                    </div>
                    ${resultUi}
                </div>
                <div>${statusUi}</div>
            </div>
        `;
    }).join('');
}

window.closeChallengesScreen = function() {
    const overlay = document.getElementById('challenges-overlay');
    if (overlay) overlay.remove();
};

// وافذة إدخال التوقع (نفس تصميمك الأصلي)
window.showPredictionModal = function(matchId, team1, team2) {
    if (document.getElementById('prediction-modal')) return;

    const isAr = userState.lang === 'ar';
    const modal = document.createElement('div');
    modal.id = 'prediction-modal';
    
    modal.style.cssText = `
        position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important;
        background: #1c1c22; padding: 25px; border-radius: 16px;
        z-index: 100000 !important; width: 90%; max-width: 400px; color: white;
        box-shadow: 0 10px 40px rgba(0,0,0,0.8);
        border: 1px solid #333;
        direction: ${isAr ? 'rtl' : 'ltr'}; box-sizing: border-box;
    `;

    modal.innerHTML = `
        <h3 style="margin:0 0 20px 0; text-align:center; color:#ffd700;">${isAr ? 'أدخل توقعك للمباراة' : 'Enter your prediction'}</h3>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:8px; color:#ccc;">${getT('whoWillWin')}</label>
            <select id="winner-select" style="width:100%; padding:12px; background:#25252d; border:1px solid #444; border-radius:8px; color:white; box-sizing: border-box; direction: ${isAr ? 'rtl' : 'ltr'}; font-size:1rem;">
                <option value="">${getT('selectWinner')}</option>
                <option value="${team1}">${team1}</option>
                <option value="${team2}">${team2}</option>
                <option value="draw">${getT('drawMatch')}</option>
            </select>
        </div>

        <div style="background:#25252d; padding:20px; border-radius:12px; margin-bottom:25px; border:1px solid #333;">
            <div style="margin-bottom: 20px;">
                <label style="display:block; font-size:1rem; margin-bottom:10px; font-weight:bold; color:#fff;">
                    ⚽ ${isAr ? 'تخمين أهداف' : 'Guess'} <span style="color:#0088cc;">${team1}</span>
                </label>
                <input type="number" id="score-team1" min="0" placeholder="0" 
                       style="width:100%; padding:15px; background:#121215; border:1px solid #444; border-radius:8px; color:white; text-align:center; font-size:1.3rem; font-weight:bold; box-sizing: border-box;">
            </div>
            
            <div>
                <label style="display:block; font-size:1rem; margin-bottom:10px; font-weight:bold; color:#fff;">
                    ⚽ ${isAr ? 'تخمين أهداف' : 'Guess'} <span style="color:#0088cc;">${team2}</span>
                </label>
                <input type="number" id="score-team2" min="0" placeholder="0" 
                       style="width:100%; padding:15px; background:#121215; border:1px solid #444; border-radius:8px; color:white; text-align:center; font-size:1.3rem; font-weight:bold; box-sizing: border-box;">
            </div>
        </div>
        
        <div style="display:flex; flex-direction: column; gap:12px;">
            <button id="submit-prediction-btn" onclick="window.submitPrediction(${matchId}, '${team1}', '${team2}');" 
                    style="width:100%; padding:15px; background:#0088cc; border:none; color:white; border-radius:8px; font-weight:bold; font-size:1.1rem; box-sizing: border-box; cursor:pointer;">
                ${isAr ? 'أرسل التخمين' : 'Submit Prediction'}
            </button>
            <button onclick="window.closePredictionModal()" 
                    style="width:100%; padding:15px; background:transparent; border:1px solid #444; color:#aaa; border-radius:8px; font-weight:bold; font-size:1rem; box-sizing: border-box; cursor:pointer;">
                ${getT('cancelBtn')}
            </button>
        </div>
    `;
    document.body.appendChild(modal);
};

window.closePredictionModal = function() {
    const modal = document.getElementById('prediction-modal');
    if (modal) modal.remove();
};

window.submitPrediction = async function(matchId, team1, team2) {
    const winner = document.getElementById('winner-select').value;
    const score1 = document.getElementById('score-team1').value;
    const score2 = document.getElementById('score-team2').value;
    const isAr = userState.lang === 'ar';
    
    if (!winner || score1 === '' || score2 === '') {
        alert(getT('validationError') || 'يرجى اختيار الفائز وإدخال النتيجة لكلا الفريقين');
        return;
    }

    const t1Score = parseInt(score1);
    const t2Score = parseInt(score2);
    const finalPredictedScore = `${team1} ${t1Score} - ${t2Score} ${team2} | ${isAr ? 'الفائز:' : 'Winner:'} ${winner === 'draw' ? getT('drawMatch') : winner}`;
    
    const submitBtn = document.getElementById('submit-prediction-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳...';

    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            const { data, error } = await supabaseClient
                .from('match_predictions') 
                .insert([
                    { 
                        telegram_id: userState.userId, 
                        match_id: matchId, 
                        predicted_score: finalPredictedScore,
                        predicted_home: t1Score, 
                        predicted_away: t2Score,
                        points_awarded: 0
                    }
                ])
                .select(); // جلب البيانات بعد إدخالها مباشرة

            if (error) throw error;
            
            // تحديث المصفوفة المحلية ليظهر التوقع فوراً في السجل
            if (data && data[0]) {
                globalPredictions.push(data[0]);
            }
            if (!userState.predictedMatches) userState.predictedMatches = [];
            userState.predictedMatches.push(matchId);

        } catch (err) {
            console.error("❌ خطأ أثناء حفظ التوقع:", err);
            // التقاط الخطأ القادم من قاعدة البيانات في حال التلاعب بالوقت
            if (err.message && err.message.includes('التلاعب مرفوض')) {
                alert(isAr ? 'عذراً، لا يمكن تسجيل التوقع لأن المباراة بدأت بالفعل.' : 'Match has already started.');
            } else {
                alert("حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.");
            }
            submitBtn.disabled = false;
            submitBtn.innerText = isAr ? 'أرسل التخمين' : 'Submit Prediction';
            return;
        }
    }

    let successMsg = getT('predictionSuccess') || 'تم حفظ توقعك بنجاح!';
    if (successMsg.includes('{winner}')) {
        successMsg = successMsg.replace('{winner}', winner === 'draw' ? getT('drawMatch') : winner);
        successMsg = successMsg.replace('{score}', `${t1Score} - ${t2Score}`);
    }
    alert(successMsg);
    
    window.closePredictionModal();

    // تحديث الواجهة فوراً
    renderChallengesTabs('current');
};
