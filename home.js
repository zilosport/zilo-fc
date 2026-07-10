// ==========================================
// 🏠 الصفحة الرئيسية (home.js) - (مُحدث مع التوقعات)
// ==========================================

// 📌 بيانات افتراضية لباقة الأسبوع (يجب جلبها لاحقاً من قاعدة البيانات Supabase)
const currentWeekData = {
    title: userState.lang === 'ar' ? "🔥 تحدي الأسبوع 12" : "🔥 Week 12 Challenge",
    totalReward: 750, // الجائزة الإجمالية
    matches: [
        { id: 1, team1: userState.lang === 'ar' ? "ريال مدريد" : "Real Madrid", logo1: "⚪", team2: userState.lang === 'ar' ? "برشلونة" : "Barcelona", logo2: "🔴", time: userState.lang === 'ar' ? "السبت - 22:00" : "Sat - 22:00" },
        { id: 2, team1: userState.lang === 'ar' ? "مان سيتي" : "Man City", logo1: "🔵", team2: userState.lang === 'ar' ? "أرسنال" : "Arsenal", logo2: "🔴", time: userState.lang === 'ar' ? "الأحد - 19:30" : "Sun - 19:30" }
    ]
};

function renderHomePage(container) {
    // 🔄 البحث عن الأندية داخل الهيكلة الجديدة
    let selectedClubsData = userState.selectedClubs.map(id => {
        if (typeof allWorldCupCountriesClubs !== 'undefined') {
            for (const country in allWorldCupCountriesClubs) {
                const foundClub = allWorldCupCountriesClubs[country].find(c => c.id === id);
                if (foundClub) return foundClub;
            }
        }
        return null;
    }).filter(Boolean);
    
    // 🔄 تأمين حالة افتراضية إذا لم يتم العثور على النادي
    if(selectedClubsData.length === 0 && typeof allWorldCupCountriesClubs !== 'undefined') {
        const firstCountry = Object.keys(allWorldCupCountriesClubs)[0];
        if (firstCountry && allWorldCupCountriesClubs[firstCountry].length > 0) {
             selectedClubsData = [allWorldCupCountriesClubs[firstCountry][0]];
        }
    }
    
    const primaryClub = selectedClubsData[0];
    
    let fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.username)}&background=1c1c22&color=0088cc&size=128&bold=true`;
    let avatarSrc = userState.photoUrl ? userState.photoUrl : fallbackAvatar;

    // التصميم الخاص بك للخلفية المتدرجة
    const profileBgStyle = primaryClub ? `background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('${primaryClub.logo}'); background-size: cover; background-position: center; border: 1px solid ${primaryClub.color || '#25252d'};` : 'background: #1c1c22;';

    // 🏆 بناء واجهة "باقة تحدي الأسبوع"
    let matchesHtml = currentWeekData.matches.map(match => `
        <div style="display: flex; justify-content: space-between; align-items: center; background: rgba(0,0,0,0.3); padding: 10px; border-radius: 8px; margin-bottom: 8px;">
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; flex: 1; justify-content: flex-start;">
                <span>${match.logo1}</span> <span style="color: #fff; font-weight: bold;">${match.team1}</span>
            </div>
            <div style="font-size: 0.7rem; color: #aaa; text-align: center; flex: 1;">
                VS<br><span style="color: #0088cc; font-weight: bold;">${match.time}</span>
            </div>
            <div style="display: flex; align-items: center; gap: 8px; font-size: 0.9rem; flex: 1; justify-content: flex-end;">
                <span style="color: #fff; font-weight: bold;">${match.team2}</span> <span>${match.logo2}</span>
            </div>
        </div>
    `).join('');

    const weeklyChallengeCard = `
        <div style="background: linear-gradient(135deg, #1e3c72, #2a5298); border-radius: 16px; padding: 20px; position: relative; box-shadow: 0 8px 25px rgba(0,0,0,0.3); margin-bottom: 25px;">
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <div style="color: #ffd700; font-size: 1rem; font-weight: bold;">${currentWeekData.title}</div>
                <div style="background: rgba(255, 215, 0, 0.2); color: #ffd700; padding: 5px 10px; border-radius: 8px; font-size: 0.8rem; font-weight: bold;">
                    ${userState.lang === 'ar' ? 'الجائزة:' : 'Reward:'} ${currentWeekData.totalReward} ZELO 🪙
                </div>
            </div>
            <div style="margin-bottom: 20px;">
                ${matchesHtml}
            </div>
            <button onclick="openWeeklyPredictions()" style="background: #ffd700; color: #000; border: none; padding: 12px; border-radius: 12px; font-weight: bold; font-size: 1rem; width: 100%; cursor: pointer; box-shadow: 0 4px 15px rgba(255, 215, 0, 0.4); transition: transform 0.2s ease;">
                ${userState.lang === 'ar' ? 'توقع باقة الأسبوع الآن! 🚀' : 'Predict Weekly Bundle Now! 🚀'}
            </button>
        </div>
    `;

    // 🛡️ بناء بطاقات الأندية المفضلة
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

    // 🚀 تجميع الصفحة بالكامل
    container.innerHTML = `
        <div class="profile-section" style="${profileBgStyle} padding: 25px 15px; border-radius: 16px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <div class="avatar-container" style="position: relative; display: inline-block;">
                <img id="user-avatar" src="${avatarSrc}" onerror="this.src='${fallbackAvatar}'" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #fff; object-fit: cover; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                <span class="verified-badge" style="position: absolute; bottom: 0; ${userState.lang === 'ar' ? 'left: 0;' : 'right: 0;'} background: #0088cc; color: #fff; width: 22px; height: 22px; line-height: 22px; border-radius: 50%; font-size: 0.8rem; border: 2px solid #fff;">✓</span>
            </div>
            <h3 id="profile-name" class="user-title" style="margin: 10px 0 2px 0; color: #fff; font-size: 1.3rem; text-shadow: 1px 1px 3px #000;">${userState.username}</h3>
            <p id="profile-id" class="user-id" style="margin: 0; color: rgba(255,255,255,0.8); font-size: 0.85rem; font-family: monospace; text-shadow: 1px 1px 2px #000;">ID: ${userState.userId}</p>
        </div>

        ${weeklyChallengeCard}

        <h4 style="color: #aaa; margin: 0 0 10px 0; font-size: 0.9rem;">${userState.lang === 'ar' ? 'أنديتك المفضلة:' : 'Your Supported Clubs:'}</h4>
        ${clubsCardsHtml}

        <div id="weekly-predictions-container" style="margin-top: 30px; margin-bottom: 20px;"></div>
    `;

    // ⏳ استدعاء دالة رسم منصة التتويج
    setTimeout(() => {
        if (typeof renderLeaderboardSection === "function") {
            // الانتباه: تم تغيير اسم الدالة لتطابق ما كتبناه في ملف predictions_ranking.js سابقاً
            renderLeaderboardSection('weekly-predictions-container');
        } else {
            console.warn("⚠️ لم يتم العثور على الدالة. تأكد من استدعاء ملف الترتيب الصحيح في index.html");
        }
    }, 100);
}

// 📌 دالة لفتح نافذة التوقعات (مؤقتة حتى نبني شاشة التوقع الفعلية)
function openWeeklyPredictions() {
    // يمكنك لاحقاً استخدام Telegram WebApp API لفتح Popup أو نقل المستخدم لصفحة أخرى
    alert(userState.lang === 'ar' 
        ? "جاري تجهيز شاشة التوقعات لـ " + currentWeekData.matches.length + " مباريات!" 
        : "Preparing prediction screen for " + currentWeekData.matches.length + " matches!");
}
