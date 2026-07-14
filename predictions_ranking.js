/**
 * ملف: predictions_ranking.js
 * الوظيفة: جلب المباريات، وعرضها بشكل مباشر ونظيف، وإدارة التوقعات (نسخة مزودة بكاشف الأخطاء والاتصال وإصلاح الشفافية)
 */

function getT(key) {
    const lang = userState.lang || 'ar';
    return typeof i18n !== 'undefined' && i18n[lang][key] ? i18n[lang][key] : key;
}

// متغيرات عامة
let globalMatches = [];
let globalPredictions = [];

window.openChallengesScreen = async function() {
    if (document.getElementById('challenges-overlay')) return;

    // ==========================================
    // 🔴 مستشعرات فحص الاتصال والمتغيرات العامة:
    // ==========================================
    console.log("🔍 فحص الاتصال: supabaseClient هل هو موجود؟", typeof supabaseClient !== 'undefined');
    console.log("👤 فحص المستخدم: userState.userId هل هو موجود؟", typeof userState !== 'undefined' ? userState.userId : 'userState غير معرّف');
    // ==========================================

    const isAr = userState.lang === 'ar'; 

    const overlay = document.createElement('div');
    overlay.id = 'challenges-overlay';
    
    // الشاشة الكاملة (تم التعديل لإزالة الشفافية وجعل اللون صلباً)
    overlay.style.cssText = `
        position: fixed !important; 
        top: 0 !important; left: 0 !important; right: 0 !important; bottom: 0 !important;
        width: 100vw !important; height: 100vh !important; 
        background: #121215 !important; 
        z-index: 99999 !important; 
        padding: 20px; box-sizing: border-box; overflow-y: auto; color: white;
        direction: ${isAr ? 'rtl' : 'ltr'}; text-align: ${isAr ? 'right' : 'left'};
    `;
    document.body.appendChild(overlay);

    // واجهة التحميل المؤقتة
    overlay.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <h2 style="margin:0; color:#ffd700;">🏆 ${getT('weeklyChallenges')}</h2>
            <button onclick="window.closeChallengesScreen()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer;">✕</button>
        </div>
        <div style="text-align:center; color:#888; padding:50px;">⏳ جاري جلب المباريات...</div>
    `;

    if (!userState.predictedMatches) userState.predictedMatches = [];

    // جلب البيانات من السيرفر
    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            const { data: predData } = await supabaseClient
                .from('match_predictions')
                .select('*')
                .eq('telegram_id', userState.userId);
                
            if (predData) {
                globalPredictions = predData;
                userState.predictedMatches = predData.map(p => p.match_id);
            }

            const { data: matchesData, error: matchesError } = await supabaseClient
                .from('matches')
                .select('*')
                .order('match_date', { ascending: true });

            if (matchesError) {
                console.error("❌ خطأ من Supabase (غالباً بسبب الـ RLS):", matchesError);
                alert("حدث خطأ في صلاحيات قراءة المباريات، تحقق من الـ Console.");
            } else if (matchesData) {
                console.log("🍏 عدد المباريات القادمة من قاعدة البيانات:", matchesData.length);
                console.log("📄 تفاصيل المباريات:", matchesData);
                
                // تحقق سريع لمعرفة إذا كانت المشكلة في حقل الـ status
                const hasNullStatus = matchesData.some(m => !m.status);
                if (hasNullStatus) {
                    console.warn("⚠️ تحذير: هناك مباريات بدون حالة (status فارغ)، ولن تظهر في التطبيق!");
                }
                
                globalMatches = matchesData;
            }

        } catch (err) {
            console.error("خطأ في جلب البيانات:", err);
        }
    } else {
        console.error("⛔ تم إلغاء جلب البيانات: تأكد من تعريف supabaseClient وأن userState.userId غير فارغ.");
    }

    // بعد جلب البيانات، نعرض المباريات فوراً
    renderMatchList(overlay, isAr);
};

function renderMatchList(overlay, isAr) {
    let html = `
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom: 25px;">
            <h2 style="margin:0; color:var(--accent-gold, #ffd700);">🏆 ${getT('weeklyChallenges')}</h2>
            <button onclick="window.closeChallengesScreen()" style="background:none; border:none; color:white; font-size:1.8rem; cursor:pointer;">✕</button>
        </div>
        <div id="matches-container">
    `;

    // الحماية هنا: التحقق من وجود status قبل استخدام toUpperCase
    const availableMatches = globalMatches.filter(m => m.status && m.status.toUpperCase() !== 'FINISHED');

    if (availableMatches.length === 0) {
        html += `<div style="text-align:center; color:#888; padding:50px;">لا توجد مباريات متاحة للتوقع حالياً.</div>`;
    } else {
        html += availableMatches.map(m => {
            const matchDate = new Date(m.match_date);
            const now = new Date();
            
            // تحديد الحالة بشكل آمن
            const safeStatus = m.status ? m.status.toUpperCase() : 'NOT_STARTED';
            
            const isStarted = now >= matchDate || safeStatus === 'LIVE'; 
            const hasPredicted = userState.predictedMatches.includes(m.id);

            const team1Name = m.team_a;
            const team2Name = m.team_b;
            
            const formattedDate = !isNaN(matchDate.getTime()) ? matchDate.toLocaleDateString(isAr ? 'ar-EG' : 'en-US') : '';
            const formattedTime = !isNaN(matchDate.getTime()) ? matchDate.toLocaleTimeString(isAr ? 'ar-EG' : 'en-US', { hour: '2-digit', minute: '2-digit' }) : '';

            let statusText = isAr ? 'لم تبدأ بعد ⏳' : 'Not Started ⏳';
            let statusColor = '#10b981';
            
            if (safeStatus === 'LIVE') {
                statusText = isAr ? 'جارية الآن 🔴' : 'Live 🔴';
                statusColor = '#fd1d1d';
            } else if (isStarted) {
                statusText = isAr ? 'انطلق التحدي ⏱️' : 'Started ⏱️';
                statusColor = '#fcb045';
            }

            let buttonHtml = '';
            if (hasPredicted) {
                buttonHtml = `<button disabled style="width:100%; padding:12px; background:rgba(16, 185, 129, 0.2); color:#10b981; border:1px solid #10b981; border-radius:12px; font-size:1rem; font-weight:bold;">
                                ${isAr ? 'تم التوقع ✅' : 'Predicted ✅'}
                              </button>`;
            } else if (isStarted) {
                buttonHtml = `<button disabled style="width:100%; padding:12px; background:rgba(255,255,255,0.05); color:#888; border:1px solid #333; border-radius:12px; font-size:0.95rem;">
                                ${isAr ? 'تم إغلاق التحدي 🔒' : 'Predictions Closed 🔒'}
                              </button>`;
            } else {
                buttonHtml = `<button id="btn-predict-${m.id}" onclick="window.showPredictionModal(${m.id}, '${team1Name}', '${team2Name}')" 
                                style="width:100%; padding:12px; background:var(--gradient-primary, linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)); border:none; color:white; border-radius:12px; font-weight:bold; font-size:1rem; cursor:pointer;">
                                ${isAr ? 'توقع النتيجة الآن 🎯' : 'Predict Score 🎯'}
                              </button>`;
            }

            return `
                <div class="card" style="position: relative; overflow: hidden; padding-top: 40px;">
                    <div style="position: absolute; top: 0; left: 0; width: 100%; background: rgba(255,255,255,0.05); padding: 8px 15px; box-sizing: border-box; display:flex; justify-content:space-between; align-items:center; border-bottom: 1px solid rgba(255,255,255,0.05);">
                        <span style="font-size: 0.8rem; font-weight:bold; color:${statusColor};">حالة المباراة: ${statusText}</span>
                        <span style="font-size: 0.8rem; color:#aaa;">📅 ${formattedDate} | 🕒 ${formattedTime}</span>
                    </div>
                    
                    <div style="display:flex; justify-content:space-between; align-items:center; margin: 15px 0;">
                        <div style="text-align:center; flex:1;">
                            <div style="font-weight:bold; font-size: 1.1rem; color:#fff;">${team1Name}</div>
                        </div>
                        <div style="font-weight:bold; font-size: 1.2rem; color:var(--accent-gold, #fcb045); margin: 0 15px;">VS</div>
                        <div style="text-align:center; flex:1;">
                            <div style="font-weight:bold; font-size: 1.1rem; color:#fff;">${team2Name}</div>
                        </div>
                    </div>
                    
                    <div id="btn-container-${m.id}">
                        ${buttonHtml}
                    </div>
                </div>
            `;
        }).join('');
    }

    html += `</div>`;
    overlay.innerHTML = html;
}

window.closeChallengesScreen = function() {
    const overlay = document.getElementById('challenges-overlay');
    if (overlay) overlay.remove();
};

// ---------------------------------------------------------
// واجهة إدخال التوقع (Modal) 
// ---------------------------------------------------------
window.showPredictionModal = function(matchId, team1, team2) {
    if (document.getElementById('prediction-modal')) return;

    const isAr = userState.lang === 'ar';
    const modal = document.createElement('div');
    modal.id = 'prediction-modal';
    
    // (تم التعديل لإزالة الشفافية وإضافة تعتيم قوي للشاشة في الخلفية)
    modal.style.cssText = `
        position: fixed !important; top: 50% !important; left: 50% !important; transform: translate(-50%, -50%) !important;
        background: #1c1c22 !important; padding: 25px; border-radius: 20px;
        z-index: 100000 !important; width: 90%; max-width: 400px; color: white;
        box-shadow: 0 0 0 100vw rgba(0,0,0,0.85), 0 10px 40px rgba(0,0,0,0.8) !important; 
        border: 1px solid rgba(255,255,255,0.1);
        direction: ${isAr ? 'rtl' : 'ltr'}; box-sizing: border-box;
    `;

    modal.innerHTML = `
        <h3 style="margin:0 0 20px 0; text-align:center; color:var(--accent-gold, #fcb045);">${isAr ? 'أدخل توقعك للمباراة' : 'Enter your prediction'}</h3>
        
        <div style="margin-bottom:15px;">
            <label style="display:block; margin-bottom:8px; color:#ccc;">${getT('whoWillWin')}</label>
            <select id="winner-select" style="width:100%; padding:12px; background:rgba(0,0,0,0.2); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white; box-sizing: border-box; direction: ${isAr ? 'rtl' : 'ltr'}; font-size:1rem;">
                <option value="">${getT('selectWinner')}</option>
                <option value="${team1}">${team1}</option>
                <option value="${team2}">${team2}</option>
                <option value="draw">${getT('drawMatch')}</option>
            </select>
        </div>

        <div style="background:rgba(0,0,0,0.2); padding:20px; border-radius:16px; margin-bottom:25px; border:1px solid rgba(255,255,255,0.05);">
            <div style="margin-bottom: 20px;">
                <label style="display:block; font-size:1rem; margin-bottom:10px; font-weight:bold; color:#fff;">
                    ⚽ ${isAr ? 'أهداف' : 'Goals'} <span style="color:var(--accent-blue, #3b82f6);">${team1}</span>
                </label>
                <input type="number" id="score-team1" min="0" placeholder="0" 
                       style="width:100%; padding:15px; background:var(--bg-dark, #121215); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white; text-align:center; font-size:1.3rem; font-weight:bold; box-sizing: border-box;">
            </div>
            
            <div>
                <label style="display:block; font-size:1rem; margin-bottom:10px; font-weight:bold; color:#fff;">
                    ⚽ ${isAr ? 'أهداف' : 'Goals'} <span style="color:var(--accent-blue, #3b82f6);">${team2}</span>
                </label>
                <input type="number" id="score-team2" min="0" placeholder="0" 
                       style="width:100%; padding:15px; background:var(--bg-dark, #121215); border:1px solid rgba(255,255,255,0.1); border-radius:12px; color:white; text-align:center; font-size:1.3rem; font-weight:bold; box-sizing: border-box;">
            </div>
        </div>
        
        <div style="display:flex; flex-direction: column; gap:12px;">
            <button id="submit-prediction-btn" onclick="window.submitPrediction(${matchId}, '${team1}', '${team2}');" 
                    style="width:100%; padding:15px; background:var(--gradient-primary, linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)); border:none; color:white; border-radius:12px; font-weight:bold; font-size:1.1rem; cursor:pointer;">
                ${isAr ? 'أرسل التخمين 🎯' : 'Submit Prediction 🎯'}
            </button>
            <button onclick="document.getElementById('prediction-modal').remove()" 
                    style="width:100%; padding:15px; background:transparent; border:1px solid rgba(255,255,255,0.2); color:#ccc; border-radius:12px; font-weight:bold; font-size:1rem; cursor:pointer;">
                ${getT('cancelBtn') || 'إلغاء'}
            </button>
        </div>
    `;
    document.body.appendChild(modal);
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
                .select();

            if (error) throw error;
            
            if (data && data[0]) {
                globalPredictions.push(data[0]);
            }
            if (!userState.predictedMatches) userState.predictedMatches = [];
            userState.predictedMatches.push(matchId);

        } catch (err) {
            console.error("❌ خطأ أثناء حفظ التوقع:", err);
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

    let successMsg = getT('predictionSuccess') || 'تم حفظ توقعك بنجاح! 🎯';
    alert(successMsg);
    
    document.getElementById('prediction-modal').remove();

    const btnContainer = document.getElementById(`btn-container-${matchId}`);
    if (btnContainer) {
        btnContainer.innerHTML = `<button disabled style="width:100%; padding:12px; background:rgba(16, 185, 129, 0.2); color:#10b981; border:1px solid #10b981; border-radius:12px; font-size:1rem; font-weight:bold;">
                                    ${isAr ? 'تم التوقع ✅' : 'Predicted ✅'}
                                  </button>`;
    }
};

window.openPredictionHistoryScreen = function() {
    // ...
};
