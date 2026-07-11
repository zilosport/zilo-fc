// ==========================================
// 📱 login.js - النسخة النهائية (بواجهة احترافية UI/UX) 🚀
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
            .smooth-scroll::-webkit-scrollbar {
                width: 4px;
            }
            .smooth-scroll::-webkit-scrollbar-track {
                background: transparent;
            }
            .smooth-scroll::-webkit-scrollbar-thumb {
                background: rgba(255, 255, 255, 0.15);
                border-radius: 10px;
            }

            /* تأثير البطاقات الزجاجية والتفاعل عند الضغط */
            .glass-card {
                background: rgba(255, 255, 255, 0.04);
                backdrop-filter: blur(12px);
                -webkit-backdrop-filter: blur(12px);
                border: 1px solid rgba(255, 255, 255, 0.08);
                border-radius: 16px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
                transition: all 0.25s ease;
            }
            .interactive-card:active {
                transform: scale(0.97);
                background: rgba(255, 255, 255, 0.08);
            }

            /* نبض زر التأكيد */
            .btn-pulse {
                animation: pulseGlow 2s infinite;
                transition: transform 0.2s ease, box-shadow 0.2s ease;
            }
            .btn-pulse:active {
                transform: translateX(-50%) scale(0.95) !important;
            }
            @keyframes pulseGlow {
                0% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0.6); }
                70% { box-shadow: 0 0 0 12px rgba(76, 175, 80, 0); }
                100% { box-shadow: 0 0 0 0 rgba(76, 175, 80, 0); }
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
    return `
        <div style="display: flex; justify-content: center; gap: 15px; margin-bottom: 25px; flex-wrap: wrap;">
            <div class="interactive-card" onclick="setLanguage('ar')" 
                 style="background: ${userState.lang === 'ar' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'rgba(255,255,255,0.05)'}; 
                        padding: 12px 28px; border-radius: 30px; cursor: pointer; 
                        border: 1px solid ${userState.lang === 'ar' ? 'transparent' : 'rgba(255,255,255,0.1)'}; 
                        color: white; font-weight: bold; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                🇸🇦 العربية
            </div>
            <div class="interactive-card" onclick="setLanguage('en')" 
                 style="background: ${userState.lang === 'en' ? 'linear-gradient(135deg, #4caf50, #2e7d32)' : 'rgba(255,255,255,0.05)'}; 
                        padding: 12px 28px; border-radius: 30px; cursor: pointer; 
                        border: 1px solid ${userState.lang === 'en' ? 'transparent' : 'rgba(255,255,255,0.1)'}; 
                        color: white; font-weight: bold; font-size: 0.95rem; box-shadow: 0 4px 15px rgba(0,0,0,0.2);">
                🇬🇧 English
            </div>
        </div>
    `;
}

// ====================== صندوق التنبيه والتوضيح ======================
function getTutorialBox() {
    return `
        <div class="glass-card" style="background: linear-gradient(135deg, rgba(255, 193, 7, 0.1), rgba(255, 152, 0, 0.05)); 
                    border: 1px solid rgba(255, 193, 7, 0.2); color: #ffeb9e; 
                    padding: 18px 20px; margin-bottom: 30px; text-align: center; font-size: 0.95rem; line-height: 1.6;">
            <strong style="font-size: 1.1rem; color: #ffc107;">
                ${userState.lang === 'ar' ? '⚠️ كيفية التسجيل' : '⚠️ How to Register'}
            </strong><br><br>
            
            <span style="color: #e0e0e0;">
                ${userState.lang === 'ar' 
                    ? 'اختر نادي <strong style="color:#fff;">محلي</strong> ونادي <strong style="color:#fff;">عالمي</strong> (حد أقصى ناديين)' 
                    : 'Choose one <strong style="color:#fff;">Local</strong> club and one <strong style="color:#fff;">Global</strong> club (max 2)'}
            </span><br><br>
            
            <a href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID" target="_blank" 
               style="display: inline-block; background: rgba(77, 168, 218, 0.15); color: #4da8da; 
                      padding: 8px 16px; border-radius: 20px; text-decoration: none; font-weight: bold; transition: background 0.3s;">
                ${userState.lang === 'ar' ? 'شاهد الفيديو التعليمي 🎥' : 'Watch Tutorial Video 🎥'}
            </a>
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
    return `
        <div id="confirm-btn" class="btn-pulse" onclick="confirmLogin()" 
             style="position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); 
                    background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; 
                    padding: 16px 35px; border-radius: 40px; font-weight: bold; font-size: 1.15rem; 
                    cursor: pointer; z-index: 9999; width: 85%; text-align: center; border: 1px solid rgba(255,255,255,0.2);">
            ${userState.lang === 'ar' ? `تأكيد واستمـرار (${window.tempSelectedClubs.length}/2) ✅` : `Confirm & Continue (${window.tempSelectedClubs.length}/2) ✅`}
        </div>
    `;
}

// ====================== الشاشة الرئيسية للتسجيل ======================
function renderLoginScreen() {
    const topBar = document.getElementById('top-bar');
    const bottomNav = document.getElementById('bottom-nav');
    if (topBar) topBar.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';

    if (!userState.lang) userState.lang = getDefaultLanguage();

    const mainContent = document.getElementById("main-content");

    let countriesHtml = "";

    for (const countryKey in allWorldCupCountriesClubs) {
        const clubsInCountry = allWorldCupCountriesClubs[countryKey];
        if (!clubsInCountry || clubsInCountry.length === 0) continue;

        const flag = clubsInCountry[0].countryFlag;
        let countryName = countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
        if (typeof getCountryName === 'function') {
            countryName = getCountryName(flag) || countryName;
        }

        countriesHtml += `
            <div class="glass-card interactive-card" onclick="showClubsForCountry('${countryKey}')" 
                 style="padding: 18px 20px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 14px;">
                <div style="display: flex; align-items: center; gap: 16px;">
                    <span style="font-size: 2.2rem; filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));">${flag}</span>
                    <h4 style="margin: 0; color: #fff; font-size: 1.15rem; letter-spacing: 0.5px;">${countryName}</h4>
                </div>
                <span style="background: rgba(255,255,255,0.08); padding: 6px 16px; border-radius: 20px; font-size: 0.9rem; font-weight: bold; color: #00b4d8;">
                    ${clubsInCountry.length} ⚽
                </span>
            </div>
        `;
    }

    mainContent.innerHTML = `
        ${getInjectableStyles()}
        <div class="animate-screen" style="padding: 25px 15px; text-align: center; max-width: 500px; margin: 0 auto; padding-bottom: 120px; position: relative;">
            
            ${getLanguageSelector()}
            ${getTutorialBox()}

            <div style="font-size: 3.8rem; margin-bottom: 10px; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.3));">🌍</div>
            <h2 style="color: #fff; margin-bottom: 8px; font-weight: 800; font-size: 1.6rem;">
                ${userState.lang === 'ar' ? 'اختر أنديتك المفضلة' : 'Choose Your Favorite Clubs'}
            </h2>
            <p style="color: #4caf50; font-size: 1.05rem; margin-bottom: 25px; opacity: 0.9;">
                ${userState.lang === 'ar' ? 'نادي محلي + نادي عالمي (حد أقصى 2)' : '1 Local + 1 Global Club (Max 2)'}
            </p>

            <div class="smooth-scroll" style="display: flex; flex-direction: column; gap: 5px; height: 50vh;">
                ${countriesHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;
}

// ====================== عرض الأندية داخل الدولة ======================
window.showClubsForCountry = function(countryKey) {
    const clubs = allWorldCupCountriesClubs[countryKey];
    if (!clubs) return;

    const mainContent = document.getElementById("main-content");

    let clubsHtml = clubs.map(club => {
        const stringClubId = String(club.id);
        const isSelected = window.tempSelectedClubs.some(id => String(id) === stringClubId);
        
        const borderStyle = isSelected ? 'border: 2px solid #4caf50;' : 'border: 1px solid rgba(255,255,255,0.08);';
        const bgStyle = isSelected ? 'background: linear-gradient(135deg, rgba(76, 175, 80, 0.15), rgba(76, 175, 80, 0.05));' : 'background: rgba(255, 255, 255, 0.04);';

        let clubName = club.name;
        if (typeof getClubName === 'function') {
            clubName = getClubName(club);
        }

        return `
            <div class="interactive-card" onclick="toggleClubSelection('${stringClubId}', '${countryKey}')" 
                 style="${bgStyle} ${borderStyle} padding: 16px 20px; border-radius: 16px; margin-bottom: 14px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.3s ease; backdrop-filter: blur(12px);">
                <div style="display: flex; align-items: center; gap: 18px;">
                    <img src="${club.logo}" onerror="this.style.display='none'" style="width: 48px; height: 48px; object-fit: contain; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));">
                    <span style="color: #fff; font-size: 1.15rem; font-weight: 700; letter-spacing: 0.5px;">${clubName}</span>
                </div>
                <div style="font-size: 1.6rem; transition: transform 0.3s ease;" class="${isSelected ? 'scale-up' : ''}">
                    ${isSelected ? '✅' : '⭕'}
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
                 style="display: inline-flex; align-items: center; gap: 8px; background: rgba(255,255,255,0.08); color: #fff; padding: 10px 20px; border-radius: 30px; cursor: pointer; margin-bottom: 25px; font-weight: bold; transition: background 0.3s;">
                <span style="font-size: 1.2rem;">${userState.lang === 'ar' ? '🔙' : '🔙'}</span>
                ${userState.lang === 'ar' ? 'الرجـوع' : 'Back'}
            </div>
            
            <div style="text-align: center; margin-bottom: 25px;">
                <span style="font-size: 3rem; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.3));">${flag}</span>
                <h2 style="color: #fff; margin-top: 10px; font-weight: 800; font-size: 1.5rem;">${countryName}</h2>
            </div>
            
            <div class="smooth-scroll" style="display: flex; flex-direction: column; height: 50vh; padding-top: 5px;">
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
