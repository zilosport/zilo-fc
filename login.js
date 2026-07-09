// ==========================================
// 📱 login.js - شاشة أول دخول (اختيار الأندية + اختيار اللغة)
// ==========================================

window.tempSelectedClubs = window.tempSelectedClubs || [];

// ====================== دعم اللغة ======================
function getDefaultLanguage() {
    if (window.Telegram?.WebApp?.initDataUnsafe?.user?.language_code) {
        return window.Telegram.WebApp.initDataUnsafe.user.language_code.startsWith('ar') ? 'ar' : 'en';
    }
    return 'ar'; // عربي افتراضي
}

function getLanguageSelector() {
    return `
        <div onclick="showLanguageModal()" 
             style="position: absolute; top: 18px; right: 18px; background: rgba(0,0,0,0.75); 
                    color: white; padding: 9px 16px; border-radius: 30px; font-size: 0.93rem; 
                    cursor: pointer; z-index: 10000; border: 1px solid rgba(255,255,255,0.25);">
            🌐 ${userState.lang === 'ar' ? 'اختر اللغة' : 'Choose Language'}
        </div>
    `;
}

window.showLanguageModal = function() {
    const modalHTML = `
        <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.9); 
                    display: flex; align-items: center; justify-content: center; z-index: 20000;">
            <div style="background: #1c1c22; padding: 30px 25px; border-radius: 20px; width: 85%; max-width: 340px; text-align: center;">
                <h2 style="color: #fff; margin-bottom: 25px;">
                    ${userState.lang === 'ar' ? 'اختر لغتك' : 'Choose Your Language'}
                </h2>
                
                <div onclick="setUserLanguage('ar')" style="background: #2b2b36; padding: 18px; margin: 12px 0; border-radius: 14px; cursor: pointer; font-size: 1.1rem;">
                    🇸🇦 العربية
                </div>
                
                <div onclick="setUserLanguage('en')" style="background: #2b2b36; padding: 18px; margin: 12px 0; border-radius: 14px; cursor: pointer; font-size: 1.1rem;">
                    🇬🇧 English
                </div>
            </div>
        </div>
    `;

    const modal = document.createElement('div');
    modal.innerHTML = modalHTML;
    document.body.appendChild(modal.firstElementChild);
};

window.setUserLanguage = async function(lang) {
    userState.lang = lang;

    // حفظ اللغة في قاعدة البيانات
    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            await supabaseClient.from('users').upsert({
                telegram_id: userState.userId,
                lang: lang
            }, { onConflict: 'telegram_id' });
        } catch (e) {
            console.error("خطأ حفظ اللغة:", e);
        }
    }

    // إعادة تحميل الشاشة باللغة الجديدة
    renderLoginScreen();
};

// ====================== زر التأكيد العائم ======================
function getFloatingButton() {
    if (window.tempSelectedClubs.length === 0) return '';
    return `
        <div id="confirm-btn" onclick="confirmLogin()" 
             style="position: fixed; bottom: 25px; left: 50%; transform: translateX(-50%); 
                    background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; 
                    padding: 15px 30px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; 
                    cursor: pointer; box-shadow: 0 6px 20px rgba(0,0,0,0.5); z-index: 9999; 
                    width: 85%; text-align: center;">
            ${userState.lang === 'ar' ? `تأكيد الدخول (${window.tempSelectedClubs.length}/2)` : `Confirm (${window.tempSelectedClubs.length}/2)`}
        </div>
    `;
}

// ====================== الشاشة الرئيسية ======================
function renderLoginScreen() {
    const topBar = document.getElementById('top-bar');
    const bottomNav = document.getElementById('bottom-nav');
    if (topBar) topBar.style.display = 'none';
    if (bottomNav) bottomNav.style.display = 'none';

    if (!userState.lang) {
        userState.lang = getDefaultLanguage();
    }

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

            <div style="font-size: 3.8rem; margin-bottom: 15px;">🌍</div>
            <h2 style="color: #fff; margin-bottom: 8px;">
                ${userState.lang === 'ar' ? 'اختر أنديتك' : 'Choose Your Clubs'}
            </h2>
            <p style="color: #4caf50; font-size: 1rem; margin-bottom: 25px;">
                ${userState.lang === 'ar' ? 'اختر فريقين كحد أقصى' : 'Select up to 2 clubs'}
            </p>

            <div style="display: flex; flex-direction: column; gap: 10px; max-height: 65vh; overflow-y: auto; padding-right: 5px;">
                ${countriesHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;
}

// ====================== باقي الدوال ======================
window.showClubsForCountry = function(countryKey) {
    const clubs = allWorldCupCountriesClubs[countryKey];
    if (!clubs) return;

    let countryName = countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
    const flag = clubs[0].countryFlag;
    if (typeof getCountryName === 'function') {
        countryName = getCountryName(flag) || countryName;
    }

    const clubsHtml = clubs.map(club => {
        const isSelected = window.tempSelectedClubs.includes(club.id);
        return `
            <div onclick="toggleClubSelection('${club.id}', '${countryKey}')" 
                 style="border: ${isSelected ? '3px solid #4caf50' : '1px solid #25252d'}; 
                        background: ${isSelected ? 'rgba(76,175,80,0.15)' : '#1c1c22'}; 
                        padding: 14px; border-radius: 14px; text-align: center; cursor: pointer;">
                ${isSelected ? '<div style="color:#4caf50; font-size:1.4rem; margin-bottom:6px;">✓</div>' : ''}
                <img src="${club.logo}" style="width:50px; height:50px; object-fit:contain;" onerror="this.style.display='none'">
                <h4 style="margin: 10px 0 0; color:#fff; font-size:0.9rem;">${getClubName ? getClubName(club) : club.name}</h4>
            </div>
        `;
    }).join('');

    const mainContent = document.getElementById("main-content");
    mainContent.innerHTML = `
        <div style="padding: 20px 15px; max-width: 500px; margin: 0 auto; position: relative;">
            ${getLanguageSelector()}
            <button onclick="renderLoginScreen()" style="margin-bottom:15px; padding:10px 18px; background:#2b2b36; color:white; border:none; border-radius:10px;">← رجوع</button>
            
            <h3 style="color:white; text-align:center; margin-bottom:20px;">${flag} ${countryName}</h3>
            
            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 12px;">
                ${clubsHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;
};

window.toggleClubSelection = function(clubId, countryKey) {
    const index = window.tempSelectedClubs.indexOf(clubId);
    
    if (index > -1) {
        window.tempSelectedClubs.splice(index, 1);
    } else {
        if (window.tempSelectedClubs.length >= 2) {
            alert(userState.lang === 'ar' ? "يمكنك اختيار ناديين فقط!" : "You can select only 2 clubs!");
            return;
        }
        window.tempSelectedClubs.push(clubId);
    }
    
    showClubsForCountry(countryKey);
};

window.confirmLogin = async function() {
    if (window.tempSelectedClubs.length === 0) return;

    userState.selectedClubs = [...window.tempSelectedClubs];
    userState.hasLoggedIn = true;

    // حفظ في Supabase
    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            await supabaseClient.from('users').upsert({
                telegram_id: userState.userId,
                username: userState.username,
                selected_clubs: userState.selectedClubs,
                lang: userState.lang
            }, { onConflict: 'telegram_id' });
        } catch (e) {}
    }

    // إظهار الأشرطة و الانتقال للصفحة الرئيسية
    document.getElementById('top-bar').style.display = 'flex';
    document.getElementById('bottom-nav').style.display = 'flex';
    
    updateTopBar();
    showPage('home');
};
