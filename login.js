// ==========================================
// 📱 login.js - النسخة الأسطورية الزجاجية المتوهجة (Glassmorphism UI/UX) 🚀
// ==========================================

window.tempSelectedClubs = window.tempSelectedClubs || [];

// ====================== أنماط CSS الاحترافية ======================
function getInjectableStyles() {
    return `
        <style>
            /* تأثير الدخول الناعم للشاشة */
            .animate-screen {
                animation: slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
            }
            @keyframes slideUpFade {
                0% { opacity: 0; transform: translateY(20px); }
                100% { opacity: 1; transform: translateY(0); }
            }

            /* شريط تمرير احترافي ومخفي جزئياً */
            .smooth-scroll {
                overflow-y: auto;
                scroll-behavior: smooth;
                padding-right: 5px;
            }
            .smooth-scroll::-webkit-scrollbar { width: 4px; }
            .smooth-scroll::-webkit-scrollbar-track { background: transparent; }
            .smooth-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.15);
                border-radius: 10px;
            }

            /* تأثير البطاقات الزجاجية والتفاعل عند الضغط */
            .glass-card-elegant {
                background: rgba(28, 28, 34, 0.6);
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                box-shadow: 0 10px 30px rgba(0, 0, 0, 0.5);
                transition: transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease;
            }
            .interactive-card:hover {
                transform: translateY(-3px);
                box-shadow: 0 12px 35px rgba(0, 0, 0, 0.6);
                border-color: rgba(252, 176, 69, 0.3);
            }
            .interactive-card:active {
                transform: scale(0.97);
                background: rgba(36, 36, 44, 0.8);
            }

            /* نبض زر التأكيد */
            .btn-pulse {
                animation: pulseGlowBtn 2s infinite;
                transition: transform 0.2s ease, box-shadow 0.2s ease, background 0.3s;
                background: linear-gradient(135deg, #10b981, #059669);
            }
            .btn-pulse:active {
                transform: translateX(-50%) scale(0.95) !important;
                background: linear-gradient(135deg, #059669, #047857);
            }
            @keyframes pulseGlowBtn {
                0% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.6); }
                70% { box-shadow: 0 0 0 15px rgba(16, 185, 129, 0); }
                100% { box-shadow: 0 0 0 0 rgba(16, 185, 129, 0); }
            }

            /* تأثيرات أندية مختارة */
            .club-selected {
                background: linear-gradient(135deg, rgba(16, 185, 129, 0.15), rgba(16, 185, 129, 0.05)) !important;
                border: 2px solid #10b981 !important;
                box-shadow: inset 0 0 15px rgba(16, 185, 129, 0.1);
            }
            
            /* أزرار اللغة */
            .lang-btn {
                background: rgba(255,255,255,0.05);
                border: 1px solid rgba(255,255,255,0.1);
                padding: 12px 28px; border-radius: 30px; cursor: pointer;
                color: white; font-weight: bold; font-size: 0.95rem;
                transition: all 0.3s ease;
                backdrop-filter: blur(10px);
            }
            .lang-btn-active {
                background: linear-gradient(135deg, var(--accent-gold, #fcb045), #f59e0b);
                border-color: transparent;
                box-shadow: 0 4px 15px rgba(252, 176, 69, 0.4);
                color: #121215;
            }
        </style>
    `;
}

// ====================== اللغة الافتراضية ======================
function getDefaultLanguage() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
        return window.Telegram.WebApp.initDataUnsafe.user.language_code.startsWith('ar') ? 'ar' : 'en';
    }
    return 'ar';
}

// ====================== زر اختيار اللغة ======================
function getLanguageSelector() {
    const isAr = userState.lang === 'ar';
    return `
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
            <div class="lang-btn ${isAr ? 'lang-btn-active' : ''}" onclick="setLanguage('ar')">
                🇸🇦 العربية
            </div>
            <div class="lang-btn ${!isAr ? 'lang-btn-active' : ''}" onclick="setLanguage('en')">
                🇬🇧 English
            </div>
        </div>
    `;
}

// ====================== تغيير اللغة ======================
window.setLanguage = async function(lang) {
    userState.lang = lang;

    if (typeof applyLanguageSettings === 'function') {
        applyLanguageSettings();
    }

    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            await supabaseClient.from('users').upsert({
                telegram_id: userState.userId,
                lang: lang
            }, { onConflict: 'telegram_id' });
        } catch (e) {}
    }

    renderLoginScreen();
};

// ====================== زر التأكيد ======================
function getFloatingButton() {
    if (window.tempSelectedClubs.length === 0) return '';
    const isAr = userState.lang === 'ar';
    return `
        <div id="confirm-btn" class="btn-pulse" onclick="confirmLogin()" 
             style="position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); 
                    color: white; padding: 16px 35px; border-radius: 40px; font-weight: 900; font-size: 1.15rem; 
                    cursor: pointer; z-index: 9999; width: 85%; max-width: 400px; text-align: center; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px);">
            ${isAr ? `تأكيد واستمـرار (${window.tempSelectedClubs.length}/2) ✅` : `Confirm & Continue (${window.tempSelectedClubs.length}/2) ✅`}
        </div>
    `;
}

// ====================== الشاشة الرئيسية للتسجيل ======================
window.renderLoginScreen = function() {
    const topBar = document.getElementById('top-bar');
    const bottomNav = document.getElementById('bottom-nav');
    if (topBar) topBar.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';

    if (!userState.lang) userState.lang = getDefaultLanguage();

    const mainContent = document.getElementById("main-content");
    const isAr = userState.lang === 'ar';

    let countriesHtml = "";

    for (const countryKey in allWorldCupCountriesClubs) {
        const clubsInCountry = allWorldCupCountriesClubs[countryKey];
        if (!clubsInCountry || clubsInCountry.length === 0) continue;

        const flag = clubsInCountry[0].countryFlag;
        let countryName = countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
        if (typeof getCountryName === 'function') {
            countryName = getCountryName(flag) || countryName;
        }

        // حساب عدد الأندية المختارة من هذه الدولة
        const selectedInThisCountry = clubsInCountry.filter(c => window.tempSelectedClubs.includes(String(c.id))).length;
        const selectionBadge = selectedInThisCountry > 0 
            ? `<span style="background: rgba(16, 185, 129, 0.2); padding: 4px 10px; border-radius: 12px; font-size: 0.8rem; color: #10b981; border: 1px solid rgba(16, 185, 129, 0.4);">✓ ${selectedInThisCountry}</span>`
            : '';

        countriesHtml += `
            <div class="glass-card-elegant interactive-card" onclick="showClubsForCountry('${countryKey}')" 
                 style="padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="font-size: 2.2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.4));">${flag}</span>
                    <h4 style="margin: 0; color: #fff; font-size: 1.15rem; font-weight: 800; letter-spacing: 0.5px;">${countryName}</h4>
                    ${selectionBadge}
                </div>
                <div style="display: flex; align-items: center; gap: 10px;">
                    <span style="background: rgba(255,255,255,0.05); padding: 6px 14px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; color: var(--accent-gold, #fcb045); border: 1px solid rgba(255,255,255,0.1);">
                        ${clubsInCountry.length} ⚽
                    </span>
                    <span style="color: #666; font-size: 1.2rem;">${isAr ? '👈' : '👉'}</span>
                </div>
            </div>
        `;
    }

    mainContent.innerHTML = `
        ${getInjectableStyles()}
        <div class="animate-screen" style="padding: 25px 15px; text-align: center; max-width: 500px; margin: 0 auto; padding-bottom: 120px; position: relative;">
            
            ${getLanguageSelector()}

            <div style="margin-top: 15px; margin-bottom: 25px;">
                <div style="font-size: 4rem; margin-bottom: 10px; filter: drop-shadow(0 0 20px rgba(59, 130, 246, 0.3));">🌍</div>
                <h2 style="color: #fff; margin-bottom: 8px; font-weight: 900; font-size: 1.7rem; text-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                    ${isAr ? 'اختر أنديتك المفضلة' : 'Choose Your Clubs'}
                </h2>
                <p style="color: var(--accent-gold, #fcb045); font-size: 1rem; margin-bottom: 0; font-weight: bold;">
                    ${isAr ? 'نادي محلي + نادي عالمي (حد أقصى 2)' : '1 Local + 1 Global Club (Max 2)'}
                </p>
            </div>

            <div class="smooth-scroll" style="display: flex; flex-direction: column; height: 50vh; text-align: ${isAr ? 'right' : 'left'};">
                ${countriesHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;
};

// ====================== عرض الأندية داخل الدولة ======================
window.showClubsForCountry = function(countryKey) {
    const clubs = allWorldCupCountriesClubs[countryKey];
    if (!clubs) return;

    const mainContent = document.getElementById("main-content");
    const isAr = userState.lang === 'ar';

    let clubsHtml = clubs.map(club => {
        const stringClubId = String(club.id);
        const isSelected = window.tempSelectedClubs.some(id => String(id) === stringClubId);
        const selectedClass = isSelected ? 'club-selected' : '';

        let clubName = club.name;
        if (typeof getClubName === 'function') {
            clubName = getClubName(club);
        }

        return `
            <div class="glass-card-elegant interactive-card ${selectedClass}" onclick="toggleClubSelection('${stringClubId}', '${countryKey}')" 
                 style="padding: 16px 20px; border-radius: 16px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer;">
                <div style="display: flex; align-items: center; gap: 18px;">
                    <div style="background: rgba(255,255,255,0.05); padding: 8px; border-radius: 50%; border: 1px solid rgba(255,255,255,0.05);">
                        <img src="${club.logo}" onerror="this.style.display='none'" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.5));">
                    </div>
                    <span style="color: #fff; font-size: 1.15rem; font-weight: 800; letter-spacing: 0.5px;">${clubName}</span>
                </div>
                <div style="font-size: 1.5rem; transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);" class="${isSelected ? 'scale-up' : ''}">
                    ${isSelected ? '<span style="filter: drop-shadow(0 0 8px rgba(16, 185, 129, 0.6));">✅</span>' : '<span style="opacity: 0.3;">⭕</span>'}
                </div>
            </div>
        `;
    }).join('');

    const flag = clubs[0].countryFlag;
    let countryName = countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
    if (typeof getCountryName === 'function') {
        countryName = getCountryName(flag) || countryName;
    }

    mainContent.innerHTML = `
        ${getInjectableStyles()}
        <div class="animate-screen" style="padding: 25px 15px; max-width: 500px; margin: 0 auto; padding-bottom: 120px;">
            <div onclick="renderLoginScreen()" 
                 style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.05); color: #fff; padding: 10px 20px; border-radius: 30px; cursor: pointer; margin-bottom: 25px; font-weight: bold; border: 1px solid rgba(255,255,255,0.1); backdrop-filter: blur(10px); transition: all 0.3s;">
                <span style="font-size: 1.2rem;">${isAr ? '🔙' : '🔙'}</span>
                ${isAr ? 'الرجوع للقائمة' : 'Back to list'}
            </div>
            
            <div style="text-align: center; margin-bottom: 25px; background: linear-gradient(135deg, rgba(255,255,255,0.02), rgba(255,255,255,0)); padding: 20px; border-radius: 24px; border: 1px solid rgba(255,255,255,0.05);">
                <span style="font-size: 3.5rem; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.4));">${flag}</span>
                <h2 style="color: #fff; margin: 10px 0 0 0; font-weight: 900; font-size: 1.6rem; letter-spacing: 1px;">${countryName}</h2>
                <p style="color: #888; font-size: 0.9rem; margin: 5px 0 0 0; font-weight: bold;">${isAr ? 'اضغط على النادي لاختياره' : 'Tap a club to select it'}</p>
            </div>
            
            <div class="smooth-scroll" style="display: flex; flex-direction: column; height: 50vh; text-align: ${isAr ? 'right' : 'left'};">
                ${clubsHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;
};

// ====================== اختيار / إلغاء اختيار النادي ======================
window.toggleClubSelection = function(clubId, countryKey) {
    const stringClubId = String(clubId);
    const index = window.tempSelectedClubs.findIndex(id => String(id) === stringClubId);
    
    if (index > -1) {
        window.tempSelectedClubs.splice(index, 1);
    } else {
        if (window.tempSelectedClubs.length < 2) {
            window.tempSelectedClubs.push(stringClubId);
        } else {
            alert(userState.lang === 'ar' ? 'يمكنك اختيار ناديين كحد أقصى (محلي وعالمي) ⚠️' : 'You can select a maximum of 2 clubs ⚠️');
            return; 
        }
    }
    
    showClubsForCountry(countryKey);
};

// ====================== زر تأكيد الدخول المحدث والآمن ======================
window.confirmLogin = async function() {
    if (window.tempSelectedClubs.length === 0) {
        alert(userState.lang === 'ar' ? 'الرجاء اختيار نادي واحد على الأقل للمتابعة.' : 'Please select at least one club to continue.');
        return;
    }

    userState.selectedClubs = [...window.tempSelectedClubs];
    
    const btn = document.getElementById('confirm-btn');
    if (btn) btn.innerHTML = '⏳...';

    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            const { error: userErr } = await supabaseClient.from('users').upsert({
                telegram_id: userState.userId,
                username: userState.username,
                selected_clubs: userState.selectedClubs,
                lang: userState.lang
            }, { onConflict: 'telegram_id' });

            if (userErr) {
                alert("❌ فشل حفظ البيانات في جدول users:\n" + userErr.message);
                throw userErr;
            }

            let startingPoints = 0; 
            const { data: userData } = await supabaseClient
                .from('users')
                .select('points')
                .eq('telegram_id', userState.userId)
                .maybeSingle();
            
            if (userData && userData.points) {
                startingPoints = userData.points;
            }

            const rankingsData = userState.selectedClubs.map(clubId => ({
                telegram_id: userState.userId,
                club_id: String(clubId),
                total_fan_points: startingPoints,
                points_activity: 0,
                referrals_count: 0
            }));

            const { error: rankErr } = await supabaseClient
                .from('club_fans_rankings')
                .upsert(rankingsData, { onConflict: 'telegram_id,club_id' });
            
            if (rankErr) {
                alert("❌ فشل ربط حسابك بجدول club_fans_rankings:\n" + rankErr.message);
                throw rankErr;
            }
            
            console.log("✅ تم التسجيل بنجاح!");

            // 🚀 ==================== بداية كود الإحالة المضاف ==================== 🚀
            if (userState.pendingReferrer && typeof window.apiProcessReferral === "function") {
                console.log("🔄 جاري معالجة نظام الإحالة للمُحيل:", userState.pendingReferrer);
                
                // استدعاء دالة الإحالة لتسجيل النقاط والمكافآت
                window.apiProcessReferral(userState.pendingReferrer, userState.userId);
                
                // تنظيف المتغير فوراً لمنع تكرار العملية مستقبلاً
                userState.pendingReferrer = null; 
            }
            // 🚀 ==================== نهاية كود الإحالة المضاف ==================== 🚀

        } catch (error) {
            console.error("⚠️ تم إيقاف التوجيه بسبب خطأ:", error);
            if (btn) btn.innerHTML = userState.lang === 'ar' ? 'إعادة المحاولة 🔄' : 'Retry 🔄';
            return; 
        }
    }

    userState.hasLoggedIn = true;

    const topBar = document.getElementById('top-bar');
    const bottomNav = document.getElementById('bottom-nav');
    if (topBar) topBar.style.display = 'flex';
    if (bottomNav) bottomNav.style.display = 'flex';

    if (typeof updateTopBar === 'function') {
        updateTopBar();
    }

    if (typeof showPage === 'function') {
        showPage('home');
    }
};
