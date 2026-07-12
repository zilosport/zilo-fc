/**
 * ملف: predictions_ranking.js
 * الوظيفة: إدارة شاشة تحديات الأسبوع (عرض المباريات + المودال الخاص بالتوقع + الحفظ في قاعدة البيانات)
 */

// دالة مساعدة لجلب الترجمة من ملف data.js
function getT(key) {
    const lang = userState.lang || 'ar';
    return typeof i18n !== 'undefined' && i18n[lang][key] ? i18n[lang][key] : key;
}

// دالة عرض شاشة التحديات (Overlay)
window.openChallengesScreen = async function() {
    if (document.getElementById('challenges-overlay')) return;

    const isAr = userState.lang === 'ar'; 

    const overlay = document.createElement('div');
    overlay.id = 'challenges-overlay';
    overlay.style.cssText = `
        position: fixed; top: 0; left: 0; width: 100%; height: 100%; 
        background: #121215; z-index: 9999; padding: 20px; 
        box-sizing: border-box; overflow-y: auto; color: white;
        direction: ${isAr ? 'rtl' : 'ltr'}; text-align: ${isAr ? 'right' : 'left'};
    `;

    // جلب التوقعات السابقة للمستخدم من قاعدة البيانات لمعرفة المباريات التي توقعها بالفعل
    if (!userState.predictedMatches) userState.predictedMatches = [];
    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            const { data, error } = await supabaseClient
                .from('match_predictions')
                .select('match_id')
                .eq('telegram_id', userState.userId);
                
            if (!error && data) {
                userState.predictedMatches = data.map(p => p.match_id);
            }
        } catch (err) {
            console.error("خطأ في جلب التوقعات السابقة:", err);
        }
    }

    const matches = [
        { id: 1, team1Ar: "ريال مدريد", team1En: "Real Madrid", team2Ar: "ليفربول", team2En: "Liverpool", time: "2026-07-11T21:00:00", league: getT('europeCups') + " 🇪🇺" },
        { id: 2, team1Ar: "برشلونة", team1En: "Barcelona", team2Ar: "أتلتيكو مدريد", team2En: "Atletico Madrid", time: "2026-07-12T20:00:00", league: getT('spainCups') + " 🇪🇸" }
    ];

    let matchesHtml = matches.map(m => {
        const matchDate = new Date(m.time);
        const now = new Date();
        const oneHourBefore = new Date(matchDate.getTime() - 60 * 60 * 1000);
        
        const isClosed = now >= oneHourBefore; // يغلق قبل ساعة من المباراة
        const hasPredicted = userState.predictedMatches.includes(m.id); // هل تم التوقع مسبقاً؟

        const team1Name = isAr ? m.team1Ar : m.team1En;
        const team2Name = isAr ? m.team2Ar : m.team2En;
        const formattedDate = matchDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US');

        // تحديد حالة الزر بناءً على التوقع والوقت
        let buttonHtml = '';
        if (hasPredicted) {
            buttonHtml = `<button disabled style="width:100%; padding:12px; background:#4caf50; color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:bold; box-sizing: border-box;">
                            ${isAr ? 'تم التوقع ✅' : 'Predicted ✅'}
                          </button>`;
        } else if (isClosed) {
            buttonHtml = `<button disabled style="width:100%; padding:12px; background:#444; color:#888; border:none; border-radius:8px; font-size:0.95rem; box-sizing: border-box;">
                            ${getT('predictionsClosed')}
                          </button>`;
        } else {
            buttonHtml = `<button id="btn-predict-${m.id}" onclick="window.showPredictionModal(${m.id}, '${team1Name}', '${team2Name}')" 
                            style="width:100%; padding:12px; background:#0088cc; border:none; color:white; border-radius:8px; font-weight:bold; font-size:1rem; box-sizing: border-box; cursor:pointer;">
                            ${getT('predictScoreBtn')}
                          </button>`;
        }

        return `
            <div style="background:#1c1c22; padding:18px; border-radius:12px; margin-bottom:18px; border: 1px solid #333; box-sizing: border-box;">
                <div style="font-size: 0.85rem; color:#888; margin-bottom: 8px;">
                    ${m.league} • ${formattedDate}
                </div>
                
                <div style="font-weight:bold; font-size: 1.15rem; margin: 10px 0; line-height: 1.4; word-break: break-word; overflow-wrap: break-word;">
                    ${team1Name} <span style="color:#ffd700; margin: 0 5px;">VS</span> ${team2Name}
                </div>
                
                <div style="color:#ffd700; font-size: 0.95rem; margin-bottom: 12px;">
                    ${matchDate.getHours()}:00
                </div>
                
                <div id="btn-container-${m.id}">
                    ${buttonHtml}
                </div>
            </div>
        `;
    }).join('');

    overlay.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <h2 style="margin:0; color:#ffd700;">${getT('weeklyChallenges')}</h2>
            <button onclick="window.closeChallengesScreen()" 
                    style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer; padding:5px 15px;">✕</button>
        </div>
        
        <div style="margin-bottom: 30px;">
            ${matchesHtml}
        </div>
    `;

    document.body.appendChild(overlay);
};

window.closeChallengesScreen = function() {
    const overlay = document.getElementById('challenges-overlay');
    if (overlay) overlay.remove();
};

// مودال التوقع المطور (اختيار الفائز + مربعات نتيجة واضحة لكل فريق)
window.showPredictionModal = function(matchId, team1, team2) {
    if (document.getElementById('prediction-modal')) return;

    const isAr = userState.lang === 'ar';

    const modal = document.createElement('div');
    modal.id = 'prediction-modal';
    modal.style.cssText = `
        position: fixed; top: 50%; left: 50%; transform: translate(-50%, -50%);
        background: #1c1c22; padding: 25px; border-radius: 16px;
        z-index: 10000; width: 90%; max-width: 420px; color: white;
        box-shadow: 0 10px 30px rgba(0,0,0,0.6);
        direction: ${isAr ? 'rtl' : 'ltr'};
        box-sizing: border-box;
    `;

    modal.innerHTML = `
        <h3 style="margin:0 0 20px 0; text-align:center; color:#ffd700;">${getT('predictMatchTitle')}</h3>
        
        <!-- اختيار من سيفوز -->
        <div style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:8px; color:#ccc;">${getT('whoWillWin')}</label>
            <select id="winner-select" style="width:100%; padding:12px; background:#25252d; border:none; border-radius:8px; color:white; box-sizing: border-box; direction: ${isAr ? 'rtl' : 'ltr'};">
                <option value="">${getT('selectWinner')}</option>
                <option value="${team1}">${team1}</option>
                <option value="${team2}">${team2}</option>
                <option value="draw">${getT('drawMatch')}</option>
            </select>
        </div>

        <!-- إدخال النتيجة لكل فريق بشكل صريح -->
        <div style="display:flex; justify-content:space-between; align-items:center; background:#25252d; padding:15px; border-radius:12px; margin-bottom:25px;">
            <div style="text-align:center; flex:1;">
                <label style="display:block; font-size:0.85rem; margin-bottom:10px; font-weight:bold;">${team1}</label>
                <input type="number" id="score-team1" min="0" placeholder="0" 
                       style="width:50px; padding:10px; background:#1c1c22; border:1px solid #444; border-radius:8px; color:white; text-align:center; font-size:1.2rem; font-weight:bold;">
            </div>
            
            <div style="font-size:1.5rem; color:#888; padding: 0 10px; margin-top:25px;">-</div>
            
            <div style="text-align:center; flex:1;">
                <label style="display:block; font-size:0.85rem; margin-bottom:10px; font-weight:bold;">${team2}</label>
                <input type="number" id="score-team2" min="0" placeholder="0" 
                       style="width:50px; padding:10px; background:#1c1c22; border:1px solid #444; border-radius:8px; color:white; text-align:center; font-size:1.2rem; font-weight:bold;">
            </div>
        </div>
        
        <div style="display:flex; gap:12px;">
            <button id="submit-prediction-btn" onclick="window.submitPrediction(${matchId}, '${team1}', '${team2}');" 
                    style="flex:1; padding:14px; background:#0088cc; border:none; color:white; border-radius:8px; font-weight:bold; box-sizing: border-box; cursor:pointer;">
                ${getT('confirmPrediction')}
            </button>
            <button onclick="window.closePredictionModal()" 
                    style="flex:1; padding:14px; background:#444; border:none; color:white; border-radius:8px; box-sizing: border-box; cursor:pointer;">
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

// الدالة المسؤولة عن حفظ التوقع في قاعدة البيانات
window.submitPrediction = async function(matchId, team1, team2) {
    const winner = document.getElementById('winner-select').value;
    const score1 = document.getElementById('score-team1').value;
    const score2 = document.getElementById('score-team2').value;
    
    // التحقق من تعبئة جميع الحقول
    if (!winner || score1 === '' || score2 === '') {
        alert(getT('validationError') || 'يرجى اختيار الفائز وإدخال النتيجة لكلا الفريقين');
        return;
    }

    const t1Score = parseInt(score1);
    const t2Score = parseInt(score2);
    
    // دمج النتيجة بشكل نصي واضح جداً لقاعدة البيانات لعدم حدوث أي التباس
    // مثال: "ريال مدريد 2 - 1 برشلونة | الفائز: ريال مدريد"
    const finalPredictedScore = `${team1} ${t1Score} - ${t2Score} ${team2} | ${userState.lang === 'ar' ? 'الفائز:' : 'Winner:'} ${winner === 'draw' ? getT('drawMatch') : winner}`;
    
    // إيقاف الزر لمنع الضغط المزدوج
    const submitBtn = document.getElementById('submit-prediction-btn');
    submitBtn.disabled = true;
    submitBtn.innerText = '⏳...';

    // 1. الحفظ في قاعدة البيانات بالأسماء الدقيقة للأعمدة (match_predictions)
    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            const { error } = await supabaseClient
                .from('match_predictions')
                .insert([
                    { 
                        telegram_id: userState.userId, 
                        match_id: matchId, 
                        predicted_score: finalPredictedScore, // تخزين النتيجة النصية الواضحة
                        points_awarded: 0 // مبدئياً 0 نقطة
                    }
                ]);

            if (error) throw error;
            
            // 2. تحديث قائمة التوقعات للمستخدم لمنعه من التوقع مرة أخرى في الواجهة
            if (!userState.predictedMatches) userState.predictedMatches = [];
            userState.predictedMatches.push(matchId);

        } catch (err) {
            console.error("❌ خطأ أثناء حفظ التوقع في قاعدة البيانات:", err);
            alert("حدث خطأ في الاتصال. يرجى المحاولة لاحقاً.");
            submitBtn.disabled = false;
            submitBtn.innerText = getT('confirmPrediction');
            return;
        }
    }

    // 3. عرض رسالة النجاح
    let successMsg = getT('predictionSuccess');
    successMsg = successMsg.replace('{winner}', winner === 'draw' ? getT('drawMatch') : winner);
    successMsg = successMsg.replace('{score}', `${t1Score} - ${t2Score}`);
    
    alert(successMsg);
    
    // 4. إغلاق النافذة المنبثقة للتوقع فوراً
    window.closePredictionModal();

    // 5. تحويل زر "تحدي النتيجة" في الشاشة الأساسية إلى "تم التوقع ✅" ليتم إغلاقه
    const btnContainer = document.getElementById(`btn-container-${matchId}`);
    if (btnContainer) {
        btnContainer.innerHTML = `<button disabled style="width:100%; padding:12px; background:#4caf50; color:#fff; border:none; border-radius:8px; font-size:1rem; font-weight:bold; box-sizing: border-box;">
                                    ${userState.lang === 'ar' ? 'تم التوقع ✅' : 'Predicted ✅'}
                                  </button>`;
    }
};
