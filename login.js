// ====================== عرض الأندية داخل الدولة ======================
window.showClubsForCountry = function(countryKey) {
    const clubs = allWorldCupCountriesClubs[countryKey];
    if (!clubs) return;

    const mainContent = document.getElementById("main-content");

    let clubsHtml = clubs.map(club => {
        // 🛠️ الإصلاح هنا: تحويل الـ ID إلى نص لضمان تطابق البيانات
        const stringClubId = String(club.id);
        const isSelected = window.tempSelectedClubs.some(id => String(id) === stringClubId);
        
        const borderStyle = isSelected ? 'border: 2px solid #4caf50;' : 'border: 1px solid #25252d;';
        const bgStyle = isSelected ? 'background: rgba(76, 175, 80, 0.15);' : 'background: #1c1c22;';

        let clubName = club.name;
        if (typeof getClubName === 'function') {
            clubName = getClubName(club);
        }

        return `
            <div onclick="toggleClubSelection('${stringClubId}', '${countryKey}')" 
                 style="${bgStyle} ${borderStyle} padding: 15px; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: all 0.2s;">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <img src="${club.logo}" onerror="this.style.display='none'" style="width: 45px; height: 45px; object-fit: contain;">
                    <span style="color: #fff; font-size: 1.1rem; font-weight: bold;">${clubName}</span>
                </div>
                <div style="font-size: 1.5rem;">
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
        <div style="padding: 20px 15px; max-width: 500px; margin: 0 auto; padding-bottom: 110px;">
            <div onclick="renderLoginScreen()" style="color: #4caf50; cursor: pointer; margin-bottom: 20px; font-size: 1.1rem; display: inline-block; font-weight: bold;">
                ${userState.lang === 'ar' ? '🔙 رجوع للقائمة' : '🔙 Back to list'}
            </div>
            
            <h2 style="color: #fff; margin-bottom: 20px; text-align: center;">${flag} ${countryName}</h2>
            
            <div style="display: flex; flex-direction: column; gap: 5px;">
                ${clubsHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;
};

// ====================== اختيار / إلغاء اختيار النادي ======================
window.toggleClubSelection = function(clubId, countryKey) {
    // 🛠️ الإصلاح هنا: البحث الدقيق عن الـ ID كنص
    const stringClubId = String(clubId);
    const index = window.tempSelectedClubs.findIndex(id => String(id) === stringClubId);
    
    if (index > -1) {
        // إزالة النادي إذا كان مختاراً
        window.tempSelectedClubs.splice(index, 1);
    } else {
        // إضافة النادي إذا كان العدد أقل من 2
        if (window.tempSelectedClubs.length < 2) {
            window.tempSelectedClubs.push(stringClubId);
        } else {
            alert(userState.lang === 'ar' ? 'يمكنك اختيار ناديين كحد أقصى (محلي وعالمي) ⚠️' : 'You can select a maximum of 2 clubs ⚠️');
            return; 
        }
    }
    
    // إعادة رسم الشاشة لتظهر علامة (✅) وزر التأكيد
    showClubsForCountry(countryKey);
};

// ====================== زر تأكيد الدخول ======================
window.confirmLogin = async function() {
    if (window.tempSelectedClubs.length === 0) {
        alert(userState.lang === 'ar' ? 'الرجاء اختيار نادي واحد على الأقل للمتابعة.' : 'Please select at least one club to continue.');
        return;
    }

    // 1. نقل الأندية المختارة إلى بيانات المستخدم الرسمية
    userState.selectedClubs = [...window.tempSelectedClubs];
    
    // 2. تغيير حالة الزر ليعطي إيحاء بالتحميل
    const btn = document.getElementById('confirm-btn');
    if (btn) btn.innerHTML = '⏳...';

    // 3. حفظ البيانات في قاعدة البيانات (Supabase)
    if (typeof supabaseClient !== 'undefined' && userState.userId) {
        try {
            await supabaseClient.from('users').upsert({
                telegram_id: userState.userId,
                username: userState.username,
                selected_clubs: userState.selectedClubs,
                lang: userState.lang
            }, { onConflict: 'telegram_id' });
        } catch (error) {
            console.error("⚠️ خطأ في حفظ بيانات الدخول:", error);
        }
    }

    // 4. إظهار القوائم العلوية والسفلية المخفية
    const topBar = document.getElementById('top-bar');
    const bottomNav = document.getElementById('bottom-nav');
    if (topBar) topBar.style.display = 'flex';
    if (bottomNav) bottomNav.style.display = 'flex';

    // 5. الانتقال الفعلي للشاشة الرئيسية للتطبيق
    if (typeof showPage === 'function') {
        showPage('home');
    } else {
        console.error("⚠️ الدالة showPage غير موجودة!");
    }
};
