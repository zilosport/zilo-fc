// ==========================================
// 📱 ملف login.js - شاشة تسجيل الدخول واختيار الأندية (مُحدث)
// ==========================================

window.tempSelectedClubs = window.tempSelectedClubs || []; 

function getFloatingButton() {
    if (window.tempSelectedClubs.length === 0) return '';
    return `
        <div onclick="confirmLogin()" style="position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 14px 30px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; gap: 10px; width: 80%; justify-content: center;">
            ${userState.lang === 'ar' ? 'تأكيد الدخول' : 'Confirm Login'} (${window.tempSelectedClubs.length}/2) ✅
        </div>
    `;
}

function renderLoginScreen() {
    if (document.querySelector('.top-bar')) document.querySelector('.top-bar').style.display = 'none';
    if (document.querySelector('.bottom-nav')) document.querySelector('.bottom-nav').style.display = 'none';

    const mainContent = document.getElementById("main-content");
    
    // 🔄 التعديل هنا: استخدام allWorldCupCountriesClubs بدلاً من clubsData
    let countriesHtml = "";
    
    // نمر على الكائن الجديد لاستخراج الدول وأعلامها
    for (const countryKey in allWorldCupCountriesClubs) {
        const clubsInCountry = allWorldCupCountriesClubs[countryKey];
        if (clubsInCountry && clubsInCountry.length > 0) {
            // نأخذ العلم من أول نادي في المصفوفة
            const flag = clubsInCountry[0].countryFlag; 
            
            // دالة للحصول على اسم الدولة بناءً على المفتاح (يمكنك تحسينها لاحقاً إذا أردت)
            let countryName = countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
            if(typeof getCountryName === 'function') {
                countryName = getCountryName(flag) || countryName;
            }

            countriesHtml += `
                <div onclick="showClubsForCountry('${countryKey}')" style="background: #1c1c22; border: 1px solid #25252d; padding: 15px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 10px; transition: 0.2s;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.8rem;">${flag}</span>
                        <h4 style="margin: 0; color: #fff; font-size: 1.1rem;">${countryName}</h4>
                    </div>
                    <span style="background: #2b2b36; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; color: #0088cc; font-weight: bold;">
                        ${clubsInCountry.length} ⚽
                    </span>
                </div>
            `;
        }
    }

    mainContent.innerHTML = `
        <div style="padding: 20px 10px; text-align: center; max-width: 500px; margin: 0 auto; padding-bottom: 100px;">
            <div style="font-size: 3.5rem; margin-bottom: 10px;">🌍</div>
            <h2 style="color: #fff; margin: 0 0 5px 0;">${t('welcomeTitle')}</h2>
            <p style="color: #4caf50; font-size: 0.95rem; font-weight: bold; margin-bottom: 20px;">
                ${userState.lang === 'ar' ? 'اختر فريقين كحد أقصى (محلي وعالمي)' : 'Select up to 2 clubs (Local & Global)'}
            </p>

            <div style="display: flex; flex-direction: column; text-align: ${userState.lang === 'ar' ? 'right' : 'left'}; max-height: 65vh; overflow-y: auto; padding-right: 5px;">
                ${countriesHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;

    // 🔄 التعديل هنا: استقبال countryKey بدلاً من العلم
    window.showClubsForCountry = function(countryKey) {
        let clubs = allWorldCupCountriesClubs[countryKey];
        if (!clubs) return;

        let flag = clubs[0].countryFlag;
        
        let countryName = countryKey.charAt(0).toUpperCase() + countryKey.slice(1);
        if(typeof getCountryName === 'function') {
            countryName = getCountryName(flag) || countryName;
        }

        let clubsHtml = clubs.map(club => {
            let isSelected = window.tempSelectedClubs.includes(club.id);
            let borderStyle = isSelected ? 'border: 2px solid #4caf50; background: rgba(76, 175, 80, 0.1);' : 'border: 1px solid #25252d; background: #1c1c22;';
            return `
            <div onclick="toggleClubSelection('${club.id}', '${countryKey}')" style="${borderStyle} padding: 12px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s; position: relative;">
                ${isSelected ? '<div style="position: absolute; top: 5px; right: 5px; background: #4caf50; color: white; border-radius: 50%; width: 22px; height: 22px; font-size: 14px; display: flex; align-items: center; justify-content: center; z-index: 10;">✓</div>' : ''}
                <div style="position: relative;">
                    <img src="${club.logo}" alt="" onerror="this.style.display='none'" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
                </div>
                <h4 style="margin: 0; color: #fff; font-size: 0.85rem; text-align: center;">${getClubName(club)}</h4>
            </div>
        `}).join('');

        mainContent.innerHTML = `
            <div style="padding: 20px 10px; text-align: center; max-width: 500px; margin: 0 auto; padding-bottom: 100px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <button onclick="renderLoginScreen()" style="background: #2b2b36; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                        ${userState.lang === 'ar' ? '⬅ رجوع' : 'Back ➡'}
                    </button>
                    <h3 style="color: #fff; margin: 0; display: flex; align-items: center; gap: 8px;">
                        ${flag} ${countryName}
                    </h3>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 65vh; overflow-y: auto; padding-right: 5px;">
                    ${clubsHtml}
                </div>
            </div>
            ${getFloatingButton()}
        `;
    }
}

// دالة اختيار أو إلغاء اختيار النادي (تم تحديث المعامل الثاني ليكون countryKey بدلاً من flag)
window.toggleClubSelection = function(clubId, countryKey) {
    const index = window.tempSelectedClubs.indexOf(clubId);
    
    if (index > -1) {
        window.tempSelectedClubs.splice(index, 1); 
    } else {
        if (window.tempSelectedClubs.length >= 2) {
            alert(userState.lang === 'ar' ? "يمكنك اختيار ناديين كحد أقصى!" : "You can only select up to 2 clubs!");
            return;
        }
        window.tempSelectedClubs.push(clubId); 
    }
    
    if (countryKey) showClubsForCountry(countryKey); else renderLoginScreen();
}

// زر تأكيد الدخول
window.confirmLogin = function() {
    if (window.tempSelectedClubs.length === 0) return;
    
    userState.selectedClubs = [...window.tempSelectedClubs];
    userState.hasLoggedIn = true;

    if (document.querySelector('.top-bar')) document.querySelector('.top-bar').style.display = 'flex';
    if (document.querySelector('.bottom-nav')) document.querySelector('.bottom-nav').style.display = 'flex';

    toggleLanguage(); 
    toggleLanguage(); // إعادة استدعاء لضمان تحديث النصوص

    updateTopBar();
    showPage('home');
}
