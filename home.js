// ==========================================
// 🏠 الصفحة الرئيسية (home.js) - نسخة محسنة ومرتبطة بقاعدة البيانات
// ==========================================
window.renderHomePage = async function(container) {
    // رسالة تحميل مؤقتة حتى لا تظهر الصفحة فارغة أثناء جلب البيانات
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#888;">⏳ جاري تحميل بيانات ناديك...</div>`;

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
 
    if (selectedClubsData.length === 0 && typeof allWorldCupCountriesClubs !== 'undefined') {
        const firstCountry = Object.keys(allWorldCupCountriesClubs)[0];
        if (firstCountry && allWorldCupCountriesClubs[firstCountry].length > 0) {
             selectedClubsData = [allWorldCupCountriesClubs[firstCountry][0]];
        }
    }

    // 🚀 2. جلب عدد المشجعين والنقاط الحقيقية من Supabase
    if (typeof supabaseClient !== 'undefined' && selectedClubsData.length > 0) {
        // نجلب فقط أرقام أندية المستخدم الحالي لتسريع العملية
        const clubIds = selectedClubsData.map(c => c.id);
        
        try {
            const { data: fansData, error } = await supabaseClient
                .from('club_fans_rankings')
                .select('club_id, total_fan_points')
                .in('club_id', clubIds);

            if (!error && fansData) {
                let membersMap = {};
                let pointsMap = {};
                
                fansData.forEach(fan => {
                    membersMap[fan.club_id] = (membersMap[fan.club_id] || 0) + 1; // زيادة عدد المشجعين
                    pointsMap[fan.club_id] = (pointsMap[fan.club_id] || 0) + (fan.total_fan_points || 0); // جمع النقاط
                });

                // حقن البيانات الحقيقية داخل كائن النادي
                selectedClubsData.forEach(club => {
                    club.members = membersMap[club.id] || 0;
                    club.points = pointsMap[club.id] || 0;
                });
            }
        } catch (err) {
            console.error("خطأ في جلب إحصائيات الأندية:", err);
        }
    }

    const primaryClub = selectedClubsData[0];
    let fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.username)}&background=1c1c22&color=0088cc&size=128&bold=true`;
    let avatarSrc = userState.photoUrl ? userState.photoUrl : fallbackAvatar;
  
    const profileBgStyle = primaryClub ?
        `background: linear-gradient(rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.9)), url('${primaryClub.logo}'); background-size: cover; background-position: center; border: 1px solid ${primaryClub.color || '#25252d'};`
        : 'background: #1c1c22;';

    // 3. بناء واجهة الأندية
    let clubsCardsHtml = selectedClubsData.map(club => `
        <div style="background: #1c1c22; border: 1px solid #25252d; border-radius: 16px; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 50px; height: 50px; object-fit: contain;">
                <div>
                    <h3 style="margin: 0; color: #fff; font-size: 1.2rem;">${typeof getClubName === "function" ? getClubName(club) : club.name} ${club.countryFlag}</h3>
                    <p style="margin: 5px 0 0 0; color: #4caf50; font-size: 0.85rem; font-weight: bold;">
                        👥 ${club.members ? club.members.toLocaleString() : '0'} ${userState.lang === 'ar' ? 'مشجع' : 'Fans'}
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

    // 4. تجميع الصفحة
    container.innerHTML = `
        <div class="profile-section" style="${profileBgStyle} padding: 25px 15px; border-radius: 16px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <img src="${avatarSrc}" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #fff; object-fit: cover;">
            <h3 style="margin: 10px 0 2px 0; color: #fff;">${userState.username}</h3>
            <p style="margin: 0; color: rgba(255,255,255,0.8); font-size: 0.85rem;">ID: ${userState.userId}</p>
        </div>
      
        <div id="challenges-card" style="cursor: pointer; background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 20px; border-radius: 16px; margin-bottom: 20px; border: 2px solid #ffd700; display: flex; align-items: center; gap: 15px;">
            <div style="font-size: 3rem;">${primaryClub ? primaryClub.countryFlag : '⚽'}</div>
            <div>
                <h3 style="color: #ffd700; margin: 0;">${userState.lang === 'ar' ? 'تحديات الأسبوع' : 'Weekly Challenges'}</h3>
                <p style="color: #fff; font-size: 0.8rem; margin: 5px 0 0 0;">🇪🇺 كؤوس أوروبا | 🇪🇸 كؤوس إسبانيا</p>
            </div>
        </div>

        <h4 style="color: #aaa; margin: 0 0 10px 0; font-size: 0.9rem;">${userState.lang === 'ar' ? 'أنديتك المفضلة:' : 'Your Supported Clubs:'}</h4>
        ${clubsCardsHtml}
        
        <div id="ranking-container" style="margin-top: 25px;"></div>
    `;

    // 5. إضافة حدث النقر + تحقق أمان
    setTimeout(() => {
        const challengesCard = document.getElementById('challenges-card');
        if (challengesCard) {
            challengesCard.addEventListener('click', function() {
                if (typeof window.openChallengesScreen === "function") {
                    window.openChallengesScreen();
                } else {
                    console.error("❌ خطأ: دالة openChallengesScreen غير معرفة!");
                    alert("يرجى تحديث الصفحة أو التحقق من ترتيب تحميل الملفات");
                }
            });
        }

        // استدعاء دالة بطاقة الترتيب الجديدة بدلاً من القديمة
        if (typeof window.renderHomeRankingWidget === "function") {
            window.renderHomeRankingWidget('ranking-container');
        } else {
            console.warn("⚠️ دالة renderHomeRankingWidget غير موجودة");
        }
    }, 200);
};
