/**
 * ملف: predictions_ranking.js
 * الوظيفة: جلب المباريات ديناميكياً من قاعدة البيانات (جدول matches) وإدارة التوقعات
 */

function getT(key) {
    const lang = userState.lang || 'ar';
    return typeof i18n !== 'undefined' && i18n[lang][key] ? i18n[lang][key] : key;
}

window.openChallengesScreen = async function() {
    if (document.getElementById('challenges-overlay')) return;

    const isAr = userState.lang === 'ar'; 

    const overlay = document.createElement('div');
    overlay.id = 'challenges-overlay';
    
    // التعديل هنا: استخدام vw و vh و !important لفرض تغطية الشاشة بالكامل
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
    let dbMatches = [];

    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            // 1. جلب التوقعات السابقة للمستخدم
            const { data: predData } = await supabaseClient
                .from('match_predictions')
                .select('match_id')
                .eq('telegram_id', userState.userId);
                
            if (predData) userState.predictedMatches = predData.map(p => p.match_id);

            // 2. جلب المباريات من جدولك الحقيقي (matches) - تم تعديل هذا الجزء بناءً على طلبك
            const { data: matches, error } = await supabaseClient
                .from('matches')
                .select('*')
                .order('match_date', { ascending: true });

            if (!error && matches) {
                dbMatches = matches;
            }
        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
        }
    }

    if (dbMatches.length === 0) {
        overlay.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
                <h2 style="margin:0; color:#ffd700;">${getT('weeklyChallenges')}</h2>
                <button onclick="window.closeChallengesScreen()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer;">✕</button>
            </div>
            <div style="text-align:center; color:#888; padding:50px;">لا توجد مباريات متاحة للتوقع حالياً.</div>
        `;
        return;
    }

    // بناء واجهة المباريات
    let matchesHtml = dbMatches.map(m => {
        const matchDate = new Date(m.match_date);
        const now = new Date();
        
        const isStarted = now >= matchDate || m.status.toUpperCase() === 'LIVE'; 
        const isClosed = isStarted; 
        const hasPredicted = userState.predictedMatches.includes(m.id);

        const team1Name = m.team_a;
        const team2Name = m.team_b;
        
        const formattedDate = !isNaN(matchDate.getTime()) ? matchDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '';
        const formattedTime = !isNaN(matchDate.getTime()) ? matchDate.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '';

        // تحديد حالة المباراة كنص جميل للمستخدم
        let statusText = isAr ? 'لم تبدأ بعد ⏳' : 'Not Started ⏳';
        let statusColor = '#4caf50'; // أخضر
        if (m.status.toUpperCase() === 'LIVE') {
            statusText = isAr ? 'جارية الآن 🔴' : 'Live 🔴';
            statusColor = '#ff4444'; // أحمر
        } else if (m.status.toUpperCase() === 'FINISHED') {
            statusText = isAr ? 'انتهت 🏁' : 'Finished 🏁';
            statusColor = '#888888'; // رمادي
        } else if (isStarted) {
            statusText = isAr ? 'انطلق التحدي ⏱️' : 'Started ⏱️';
            statusColor = '#ff9800'; // برتقالي
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

    overlay.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 20px;">
            <h2 style="margin:0; color:#ffd700;">${getT('weeklyChallenges')}</h2>
            <button onclick="window.closeChallengesScreen()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer;">✕</button>
        </div>
        <div style="background:#25252d; padding:12px 15px; border-radius:8px; margin-bottom:20px; display:flex; justify-content:space-around; border:1px solid #333;">
            <div style="text-align:center;">
                <div style="font-size:0.8rem; color:#888;">نقاطك</div>
                <div style="font-weight:bold; color:#4caf50;">-</div>
            </div>
            <div style="border-left:1px solid #444;"></div>
            <div style="text-align:center;">
                <div style="font-size:0.8rem; color:#888;">أخطاؤك</div>
                <div style="font-weight:bold; color:#ff4444;">- / 2</div>
            </div>
        </div>
        
        <div style="margin-bottom: 30px;">
            ${matchesHtml}
        </div>
    `;
};

window.closeChallengesScreen = function() {
    const overlay = document.getElementById('challenges-overlay');
    if (overlay) overlay.remove();
};

window.showPredictionModal = function(matchId, team1, team2) {
    if (document.getElementById('prediction-modal')) return;

    const isAr = userState.lang === 'ar';
    const modal = document.createElement('div');
    modal.id = 'prediction-modal';
    
    // التعديل هنا: رفع قيمة z-index لضمان ظهور النافذة المنبثقة فوق نافذة التحديات
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
    
    if (!winner || score1 === '' || score2 === '') {
        alert(getT('validationError') || 'يرجى اختيار الفائز وإدخال النتيجة لكلا الفريقين');
        return;
    }

    const t1Score = parseInt(score1);
    const t2Score = parseInt(score2);
    const finalPredictedScore = `${team1} ${t1Score} - ${t2Score} ${team2} | ${userState.lang === 'ar' ? 'الفائز:' : 'Winner:'} ${winner === 'draw' ? getT('drawMatch') : winner}`;
    
    const submitBtn = document.getElementById('submit-prediction-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳...';

    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            const { error } = await supabaseClient
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
                ]);

            if (error) throw error;
            
            if (!userState.predictedMatches) userState.predictedMatches = [];
            userState.predictedMatches.push(matchId);

        } catch (err) {
            console.error("❌ خطأ أثناء حفظ التوقع:", err);
            alert("حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.");
            submitBtn.disabled = false;
            submitBtn.innerText = userState.lang === 'ar' ? 'أرسل التخمين' : 'Submit Prediction';
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

    const btnContainer = document.getElementById(`btn-container-${matchId}`);
    if (btnContainer) {
        btnContainer.innerHTML = `<button disabled style="width:100%; padding:12px; background:#4caf50; color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:bold; box-sizing: border-box;">
                                    ${userState.lang === 'ar' ? 'تم التوقع ✅' : 'Predicted ✅'}
                                  </button>`;
    }
};
