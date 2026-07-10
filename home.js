// ==========================================
// 🏠 الصفحة الرئيسية (home.js) - نسخة متكاملة
// ==========================================

function renderHomePage(container) {
    // 1. معالجة بيانات الأندية
    let selectedClubsData = userState.selectedClubs.map(id => {
        if (typeof allWorldCupCountriesClubs !== 'undefined') {
            for (const country in allWorldCupCountriesClubs) {
                const foundClub = allWorldCupCountriesClubs[country].find(c => c.id === id);
                if (foundClub) return foundClub;
            }
        }
        return null;
    }).filter(Boolean);
    
    if(selectedClubsData.length === 0 && typeof allWorldCupCountriesClubs !== 'undefined') {
        const firstCountry = Object.keys(allWorldCupCountriesClubs)[0];
        if (firstCountry && allWorldCupCountriesClubs[firstCountry].length > 0) {
             selectedClubsData = [allWorldCupCountriesClubs[firstCountry][0]];
        }
    }
    
    const primaryClub = selectedClubsData[0];
    let fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.username)}&background=1c1c22&color=0088cc&size=128&bold=true`;
    let avatarSrc = userState.photoUrl ? userState.photoUrl : fallbackAvatar;
    const profileBgStyle = primaryClub ? `background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('${primaryClub.logo}'); background-size: cover; background-position: center; border: 1px solid ${primaryClub.color || '#25252d'};` : 'background: #1c1c22;';

    // 2. بناء واجهة الأندية
    let clubsCardsHtml = selectedClubsData.map(club => `
        <div style="background: #1c1c22; border: 1px solid #25252d; border-radius: 16px; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 50px; height: 50px; object-fit: contain;">
                <div>
                    <h3 style="margin: 0; color: #fff; font-size: 1.2rem;">${getClubName(club)} ${club.countryFlag}</h3>
                    <p style="margin: 5px 0 0 0; color: #888; font-size: 0.8rem;">
                        👥 ${club.members ? club.members.toLocaleString() : '0'} 
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
            <img src="${avatarSrc}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #fff; object-fit: cover;">
            <h3 style="margin: 10px 0 2px 0; color: #fff;">${userState.username}</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 0.85rem;">ID: ${userState.userId}</p>
        </div>

        <div onclick="openChallengesScreen()" style="cursor: pointer; background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 2px solid #ffd700; display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 3rem;">${primaryClub ? primaryClub.countryFlag : '⚽'}</div>
            <div>
                <h3 style="color: #ffd700; margin: 0;">${userState.lang === 'ar' ? 'تحديات الأسبوع' : 'Weekly Challenges'}</h3>
                <p style="color: #fff; font-size: 0.8rem; margin: 5px 0 0 0;">🇪🇺 كؤوس أوروبا | 🇪🇸 كؤوس إسبانيا</p>
            </div>
        </div>

        <h4 style="color: #aaa; margin: 0 0 10px 0; font-size: 0.9rem;">${userState.lang === 'ar' ? 'أنديتك المفضلة:' : 'Your Supported Clubs:'}</h4>
        ${clubsCardsHtml}

        <div id="ranking-container" style="margin-top: 20px;"></div>
    `;

    // 4. استدعاء دوال الملفات المنعزلة
    setTimeout(() => {
        // استدعاء الترتيب
        if (typeof renderWeeklyRanking === "function") renderWeeklyRanking('ranking-container');
    }, 100);
}
