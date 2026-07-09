// ==========================================
// 📱 login.js - النسخة النهائية مع صندوق التوضيح
// ==========================================

window.tempSelectedClubs = window.tempSelectedClubs || [];

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
        <div style="display: flex; justify-content: center; gap: 12px; margin-bottom: 20px; flex-wrap: wrap;">
            <div onclick="setLanguage('ar')" 
                 style="background: ${userState.lang === 'ar' ? '#4caf50' : '#2b2b36'}; 
                        padding: 11px 24px; border-radius: 30px; cursor: pointer; 
                        border: 2px solid ${userState.lang === 'ar' ? '#4caf50' : '#444'}; color: white;">
                🇸🇦 العربية
            </div>
            <div onclick="setLanguage('en')" 
                 style="background: ${userState.lang === 'en' ? '#4caf50' : '#2b2b36'}; 
                        padding: 11px 24px; border-radius: 30px; cursor: pointer; 
                        border: 2px solid ${userState.lang === 'en' ? '#4caf50' : '#444'}; color: white;">
                🇬🇧 English
            </div>
        </div>
    `;
}

// ====================== صندوق التنبيه والتوضيح ======================
function getTutorialBox() {
    return `
        <div style="background: rgba(255, 193, 7, 0.15); border: 1px solid #ffc107; color: #ffeb9e; 
                    padding: 14px 16px; border-radius: 12px; margin-bottom: 25px; text-align: center; font-size: 0.95rem; line-height: 1.5;">
            <strong>${userState.lang === 'ar' ? '⚠️ كيفية التسجيل' : '⚠️ How to Register'}</strong><br><br>
            
            <span style="color: #fff;">
                ${userState.lang === 'ar' 
                    ? 'اختر نادي <strong>محلي</strong> ونادي <strong>عالمي</strong> (حد أقصى ناديين)' 
                    : 'Choose one <strong>Local</strong> club and one <strong>Global</strong> club (max 2)'}
            </span><br><br>
            
            <a href="https://www.youtube.com/watch?v=YOUR_VIDEO_ID" target="_blank" 
               style="color: #4da8da; text-decoration: underline; font-weight: bold;">
                ${userState.lang === 'ar' ? 'شاهد الفيديو التعليمي 🎥' : 'Watch Tutorial Video 🎥'}
            </a>
        </div>
    `;
}

// ====================== تغيير اللغة ======================
window.setLanguage = async function(lang) {
    userState.lang = lang;

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
        <div id="confirm-btn" onclick="confirmLogin()" 
             style="position: fixed; bottom: 25px; left: 50%; transform: translateX(-50%); 
                    background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; 
                    padding: 15px 30px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; 
                    cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.5); z-index: 9999; width: 85%; text-align: center;">
            ${userState.lang === 'ar' ? `تأكيد (${window.tempSelectedClubs.length}/2) ✅` : `Confirm (${window.tempSelectedClubs.length}/2) ✅`}
        </div>
    `;
}

// ====================== الشاشة الرئيسية ======================
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
            <div onclick="showClubsForCountry('${countryKey}')" 
                 style="background: #1c1c22; border: 1px solid #25252d; padding: 16px; border-radius: 14px; 
                        display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 12px;">
                <div style="display: flex; align-items: center; gap: 14px;">
                    <span style="font-size: 2rem;">${flag}</span>
                    <h4 style="margin: 0; color: #fff; font-size: 1.1rem;">${countryName}</h4>
                </div>
                <span style="background: #2b2b36; padding: 6px 14px; border-radius: 20px; font-size: 0.85rem; color: #00b4d8;">
                    ${clubsInCountry.length} ⚽
                </span>
            </div>
        `;
    }

    mainContent.innerHTML = `
        <div style="padding: 20px 15px; text-align: center; max-width: 500px; margin: 0 auto; padding-bottom: 110px; position: relative;">
            
            ${getLanguageSelector()}
            
            ${getTutorialBox()}

            <div style="font-size: 3.8rem; margin-bottom: 15px;">🌍</div>
            <h2 style="color: #fff; margin-bottom: 8px;">
                ${userState.lang === 'ar' ? 'اختر أنديتك المفضلة' : 'Choose Your Favorite Clubs'}
            </h2>
            <p style="color: #4caf50; font-size: 1rem; margin-bottom: 20px;">
                ${userState.lang === 'ar' ? 'نادي محلي + نادي عالمي (حد أقصى 2)' : '1 Local + 1 Global Club (Max 2)'}
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 55vh; overflow-y: auto; padding-right: 5px;">
                ${countriesHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;
};

// ====================== باقي الدوال (كما هي) ======================
window.showClubsForCountry = function(countryKey) { /* ... نفس الكود السابق */ };
window.toggleClubSelection = function(clubId, countryKey) { /* ... نفس الكود السابق */ };
window.confirmLogin = async function() { /* ... نفس الكود السابق */ };
