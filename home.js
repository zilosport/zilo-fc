// ==========================================
// 🏠 الصفحة الرئيسية (home.js) - نسخة الـ VIP المتوهجة والطافية (تدعم الترجمة 100%)
// ==========================================
window.renderHomePage = async function(container) {
    const isAr = userState.lang === 'ar';

    // 🛡️ نظام حماية للترجمة: يضمن ظهور الكلمة باللغة الصحيحة دائماً حتى لو تأخر ملف data.js
    const getSafeText = (key, fallbackAr, fallbackEn) => {
        if (typeof i18n !== 'undefined' && i18n[userState.lang] && i18n[userState.lang][key]) {
            return i18n[userState.lang][key];
        }
        return isAr ? fallbackAr : fallbackEn;
    };

    // رسالة تحميل مؤقتة مترجمة
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#888;">${isAr ? '⏳ جاري تحميل بيانات ناديك...' : '⏳ Loading your club data...'}</div>`;

    // 1. معالجة بيانات الأندية
    let selectedClubsData = userState.selectedClubs.map(id => {
        if (typeof allWorldCupCountriesClubs !== 'undefined') {
            for (const country in allWorldCupCountriesClubs) {
                const foundClub = allWorldCupCountriesClubs[country].find(c => String(c.id) === String(id));
                if (foundClub) return foundClub;
            }
        }
        return null;
    }).filter(Boolean);
 
    if (selectedClubsData.length === 0 && typeof allWorldCupCountriesClubs !== 'undefined') {
        const firstCountry = Object.keys(allWorldCupCountriesClubs)[0];
        if (firstCountry && allWorldCupCountriesClubs[firstCountry].length > 0) {
             selectedClubsData = [allWorldCupCountriesClubs[firstCountry][0]];
        }
    }

    // 🚀 2. جلب عدد المشجعين والنقاط الحقيقية من Supabase
    if (typeof supabaseClient !== 'undefined' && selectedClubsData.length > 0) {
        const clubIds = selectedClubsData.map(c => String(c.id));
        
        try {
            const { data: fansData, error } = await supabaseClient
                .from('club_fans_rankings')
                .select('club_id, total_fan_points')
                .in('club_id', clubIds);

            if (!error && fansData) {
                let membersMap = {};
                let pointsMap = {};
                
                fansData.forEach(fan => {
                    membersMap[fan.club_id] = (membersMap[fan.club_id] || 0) + 1; 
                    pointsMap[fan.club_id] = (pointsMap[fan.club_id] || 0) + (fan.total_fan_points || 0); 
                });

                selectedClubsData.forEach(club => {
                    club.members = membersMap[String(club.id)] || 0;
                    club.points = pointsMap[String(club.id)] || 0;
                });
            }
        } catch (err) {
            console.error("خطأ في جلب إحصائيات الأندية:", err);
        }
    }

    const primaryClub = selectedClubsData[0];
    let fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.username)}&background=1c1c22&color=fcb045&size=128&bold=true`;
    let avatarSrc = userState.photoUrl ? userState.photoUrl : fallbackAvatar;
  
    const profileBgStyle = primaryClub ?
        `background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('${primaryClub.logo}'); background-size: cover; background-position: center; border: 1px solid ${primaryClub.color || 'var(--accent-gold)'};`
        : 'background: var(--bg-card); border: 1px solid rgba(255,255,255,0.05);';

    // 3. بناء واجهة الأندية
    let clubsCardsHtml = selectedClubsData.map(club => `
        <div style="background: rgba(28, 28, 34, 0.6); backdrop-filter: blur(10px); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px; transition: transform 0.3s;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 50px; height: 50px; object-fit: contain; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));">
                <div>
                    <h3 style="margin: 0; color: #fff; font-size: 1.2rem;">${typeof getClubName === "function" ? getClubName(club) : club.name} ${club.countryFlag}</h3>
                    <p style="margin: 5px 0 0 0; color: #10b981; font-size: 0.85rem; font-weight: bold;">
                        👥 ${club.members ? club.members.toLocaleString() : '0'} ${isAr ? 'مشجع' : 'Fans'}
                    </p>
                </div>
            </div>
            <div>
                <span style="background: rgba(252, 176, 69, 0.15); color: var(--accent-gold, #fcb045); padding: 6px 12px; border-radius: 12px; font-weight: bold; font-size: 0.85rem; border: 1px solid rgba(252, 176, 69, 0.3);">
                    ${club.points ? club.points.toLocaleString() : '0'} 🏆
                </span>
            </div>
        </div>
    `).join('');

    // تجهيز النصوص المترجمة بدقة فائقة باستخدام دالة الحماية
    let titleWeeklyChallenges = getSafeText('weeklyChallenges', 'تحديات الأسبوع', 'Weekly Challenges');
    let textEuropeCups = getSafeText('europeCups', 'كؤوس أوروبا', 'European Cups');
    let textSpainCups = getSafeText('spainCups', 'كؤوس إسبانيا', 'Spanish Cups');
    let titleRanking = isAr ? 'ترتيب التحديات' : 'Challenges Ranking';
    let textRankingDesc = isAr ? 'اكتشف المتصدرين وتعرف على ترتيبك' : 'Discover top players and your rank';
    let supportedClubsTitle = isAr ? 'أنديتك المفضلة:' : 'Your Supported Clubs:';
    let loadingAlert = isAr ? '⏳ جاري التحميل...' : '⏳ Loading...';

    // 4. تجميع الصفحة (مع ستايل الطفو والتوهج)
    container.innerHTML = `
        <style>
            @keyframes levitateCard {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-6px); }
                100% { transform: translateY(0px); }
            }
            @keyframes glowCardPulse {
                0% { box-shadow: 0 5px 15px rgba(253, 29, 29, 0.1), 0 0 10px rgba(131, 58, 180, 0.1); }
                50% { box-shadow: 0 15px 25px rgba(252, 176, 69, 0.25), 0 0 20px rgba(253, 29, 29, 0.3); }
                100% { box-shadow: 0 5px 15px rgba(253, 29, 29, 0.1), 0 0 10px rgba(131, 58, 180, 0.1); }
            }
            
            .floating-vip-card {
                animation: levitateCard 3.5s ease-in-out infinite, glowCardPulse 3.5s ease-in-out infinite;
                transition: all 0.3s ease;
            }
            .floating-vip-card:active {
                animation: none;
                transform: translateY(2px) scale(0.98);
                box-shadow: 0 2px 10px rgba(253, 29, 29, 0.4) !important;
            }
        </style>

        <div class="profile-section" style="${profileBgStyle} padding: 25px 15px; border-radius: 16px; text-align: center; margin-bottom: 25px; box-shadow: 0 8px 20px rgba(0,0,0,0.4);">
            <img src="${avatarSrc}" style="width: 85px; height: 85px; border-radius: 50%; border: 3px solid var(--accent-gold, #fcb045); object-fit: cover; box-shadow: 0 0 15px rgba(252, 176, 69, 0.5);">
            <h3 style="margin: 12px 0 4px 0; color: #fff; font-size: 1.3rem; text-shadow: 0 2px 4px rgba(0,0,0,0.5);">${userState.username}</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.7); font-size: 0.85rem; background: rgba(0,0,0,0.3); display: inline-block; padding: 2px 10px; border-radius: 10px;">ID: ${userState.userId}</p>
        </div>
      
        <div id="challenges-card" class="floating-vip-card" onclick="if(typeof window.openChallengesScreen === 'function') { window.openChallengesScreen(); } else { alert('${loadingAlert}'); }" style="cursor: pointer; background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 1px solid rgba(255, 215, 0, 0.4); display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 3rem; filter: drop-shadow(0 0 8px rgba(255, 215, 0, 0.5));">${primaryClub ? primaryClub.countryFlag : '⚽'}</div>
            <div>
                <h3 style="color: #ffd700; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${titleWeeklyChallenges}</h3>
                <p style="color: #fff; font-size: 0.8rem; margin: 5px 0 0 0; opacity: 0.9;">🇪🇺 ${textEuropeCups} | 🇪🇸 ${textSpainCups}</p>
            </div>
        </div>

        <div id="ranking-card" class="floating-vip-card" onclick="if(typeof window.openRankingScreen === 'function') { window.openRankingScreen(); } else { alert('${loadingAlert}'); }" style="cursor: pointer; background: linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045); padding: 20px; border-radius: 16px; margin-bottom: 30px; border: 1px solid rgba(255,255,255,0.2); display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 3rem; filter: drop-shadow(0 0 10px rgba(255, 255, 255, 0.4));">🏆</div>
            <div>
                <h3 style="color: #fff; margin: 0; text-shadow: 0 2px 4px rgba(0,0,0,0.3);">${titleRanking}</h3>
                <p style="color: rgba(255,255,255,0.9); font-size: 0.85rem; margin: 5px 0 0 0;">🔥 ${textRankingDesc}</p>
            </div>
        </div>

        <h4 style="color: #aaa; margin: 0 0 15px 0; font-size: 0.9rem; padding-right: 5px;">${supportedClubsTitle}</h4>
        ${clubsCardsHtml}
    `;
};
