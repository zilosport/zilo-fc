// ==========================================
// 🏠 الصفحة الرئيسية (home.js) - نسخة كاملة
// ==========================================

function renderHomePage(container) {
    // 1. معالجة بيانات الأندية (للحصول على الشعار والعلم)
    let selectedClubsData = userState.selectedClubs.map(id => {
        if (typeof allWorldCupCountriesClubs !== 'undefined') {
            for (const country in allWorldCupCountriesClubs) {
                const foundClub = allWorldCupCountriesClubs[country].find(c => c.id === id);
                if (foundClub) return foundClub;
            }
        }
        return null;
    }).filter(Boolean);
    
    // تأمين حالة افتراضية إذا لم يتم العثور على النادي
    if(selectedClubsData.length === 0 && typeof allWorldCupCountriesClubs !== 'undefined') {
        const firstCountry = Object.keys(allWorldCupCountriesClubs)[0];
        if (firstCountry && allWorldCupCountriesClubs[firstCountry].length > 0) {
             selectedClubsData = [allWorldCupCountriesClubs[firstCountry][0]];
        }
    }
    
    const primaryClub = selectedClubsData[0];
    
    // تجهيز الصور
    let fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.username)}&background=1c1c22&color=0088cc&size=128&bold=true`;
    let avatarSrc = userState.photoUrl ? userState.photoUrl : fallbackAvatar;

    // التصميم الخاص بالخلفية
    const profileBgStyle = primaryClub ? `background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('${primaryClub.logo}'); background-size: cover; background-position: center; border: 1px solid ${primaryClub.color || '#25252d'};` : 'background: #1c1c22;';

    // 2. بناء واجهة الأندية
    let clubsCardsHtml = selectedClubsData.map(club => `
        <div style="background: #1c1c22; border: 1px solid #25252d; border-radius: 16px; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 50px; height: 50px; object-fit: contain;">
                <div>
                    <h3 style="margin: 0; color: #fff; font-size: 1.2rem;">${getClubName(club)} ${club.countryFlag}</h3>
                    <p style="margin: 5px 0 0 0; color: #888; font-size: 0.8rem;">
                        👥 ${club.members ? club.members.toLocaleString() : '0'} ${userState.lang === 'ar' ? 'عضواً' : 'members'}
                    </p>
                </div>
            </div>
            <div>
                <span style="background: rgba(255, 215, 0, 0.2); color: #ffd700; padding: 5px 10px; border-radius: 8px; font-weight: bold; font-size: 0.85rem;">
                    ${club.points ? club.points.toLocaleString() : '0'} 🏆
                </span>
            </div>
        </div>
    `).join('');

    // 3. تجميع الصفحة بالكامل
    container.innerHTML = `
        <div class="profile-section" style="${profileBgStyle} padding: 25px 15px; border-radius: 16px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <div class="avatar-container" style="position: relative; display: inline-block;">
                <img id="user-avatar" src="${avatarSrc}" onerror="this.src='${fallbackAvatar}'" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #fff; object-fit: cover; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                <span class="verified-badge" style="position: absolute; bottom: 0; ${userState.lang === 'ar' ? 'left: 0;' : 'right: 0;'} background: #0088cc; color: #fff; width: 22px; height: 22px; line-height: 22px; border-radius: 50%; font-size: 0.8rem; border: 2px solid #fff;">✓</span>
            </div>
            <h3 id="profile-name" class="user-title" style="margin: 10px 0 2px 0; color: #fff; font-size: 1.3rem; text-shadow: 1px 1px 3px #000;">${userState.username}</h3>
            <p id="profile-id" class="user-id" style="margin: 0; color: rgba(255,255,255,0.8); font-size: 0.85rem; font-family: monospace; text-shadow: 1px 1px 2px #000;">ID: ${userState.userId}</p>
        </div>

        <div onclick="openChallengesScreen()" style="cursor: pointer; background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 20px; border-radius: 16px; margin-bottom: 20px; text-align: center; border: 2px solid #ffd700;">
            <div style="font-size: 2.5rem; margin-bottom: 5px;">${primaryClub ? primaryClub.countryFlag : '⚽'}</div>
            <h3 style="color: #ffd700; margin: 0;">${userState.lang === 'ar' ? 'تحدي الأسبوع' : 'Weekly Challenge'}</h3>
            <p style="color: #fff; font-size: 0.85rem; opacity: 0.9;">${userState.lang === 'ar' ? 'اضغط هنا لتوقع نتائج المباريات' : 'Click here to predict match results'}</p>
        </div>

        <h4 style="color: #aaa; margin: 0 0 10px 0; font-size: 0.9rem;">${userState.lang === 'ar' ? 'أنديتك المفضلة:' : 'Your Supported Clubs:'}</h4>
        ${clubsCardsHtml}

        <div id="ranking-container" style="margin-top: 20px;"></div>
    `;

    // 4. استدعاء الملفات المنعزلة بعد تحميل الواجهة
    setTimeout(() => {
        // استدعاء دالة الترتيب (من ملف weekly_match_rankings.js)
        if (typeof renderWeeklyRanking === "function") {
            renderWeeklyRanking('ranking-container');
        } else {
            console.warn("⚠️ لم يتم العثور على دالة الترتيب.");
        }
    }, 100);
}

// دالة الانتقال لشاشة التحديات (يتم تعريفها هنا ليتم استدعاؤها من البطاقة)
function openChallengesScreen() {
    // يمكنك استبدال alert بنقلك إلى صفحة التحديات الفعلية
    alert(userState.lang === 'ar' ? "جارٍ فتح تحديات الأسبوع..." : "Opening weekly challenges...");
}
