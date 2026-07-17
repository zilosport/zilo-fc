// ==========================================
// 🏠 الصفحة الرئيسية (home.js) - نسخة الـ VIP الأسطورية (تدعم الترجمة 100%)
// ==========================================

window.openOfficialWebsite = window.openOfficialWebsite || function() {
    const url = "https://zelo-sport-fc.github.io/zelo-fc-site/";
    if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
        window.Telegram.WebApp.openLink(url);
    } else {
        window.open(url, '_blank');
    }
};

window.renderHomePage = async function(container) {
    const isAr = userState.lang === 'ar';

    // 🛡️ نظام حماية للترجمة
    const getSafeText = (key, fallbackAr, fallbackEn) => {
        if (typeof i18n !== 'undefined' && i18n[userState.lang] && i18n[userState.lang][key]) {
            return i18n[userState.lang][key];
        }
        return isAr ? fallbackAr : fallbackEn;
    };

    container.innerHTML = `<div style="text-align:center; padding:50px; color:#888; font-weight:bold; animation: pulseGlowIcon 1.5s infinite;">${isAr ? '⏳ جاري تجهيز الملعب...' : '⏳ Preparing the pitch...'}</div>`;

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
  
    // 3. بناء واجهة الأندية (ستايل زجاجي أنيق)
    let clubsCardsHtml = selectedClubsData.map(club => `
        <div class="glass-club-card">
            <div style="display: flex; align-items: center; gap: 15px;">
                <div class="club-logo-wrapper">
                    <img src="${club.logo}" onerror="this.style.display='none'" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.8));">
                </div>
                <div>
                    <h3 style="margin: 0; color: #fff; font-size: 1.15rem; font-weight: 900; letter-spacing: 0.5px;">${typeof getClubName === "function" ? getClubName(club) : club.name} ${club.countryFlag}</h3>
                    <p style="margin: 4px 0 0 0; color: #10b981; font-size: 0.85rem; font-weight: bold; text-shadow: 0 0 5px rgba(16, 185, 129, 0.4);">
                        👥 ${club.members ? club.members.toLocaleString() : '0'} ${isAr ? 'مشجع' : 'Fans'}
                    </p>
                </div>
            </div>
            <div style="text-align: center;">
                <div class="club-points-badge">
                    <span style="font-size: 1.1rem;">🏆</span> ${club.points ? club.points.toLocaleString() : '0'}
                </div>
            </div>
        </div>
    `).join('');

    let titleWeeklyChallenges = getSafeText('weeklyChallenges', 'تحديات الأسبوع', 'Weekly Challenges');
    let textEuropeCups = getSafeText('europeCups', 'كؤوس أوروبا', 'European Cups');
    let textSpainCups = getSafeText('spainCups', 'كؤوس إسبانيا', 'Spanish Cups');
    let titleRanking = isAr ? 'ترتيب التحديات' : 'Challenges Ranking';
    let textRankingDesc = isAr ? 'اكتشف المتصدرين وتعرف على ترتيبك' : 'Discover top players and your rank';
    let supportedClubsTitle = isAr ? 'أنديتك المفضلة' : 'Supported Clubs';
    let loadingAlert = isAr ? '⏳ جاري التحميل...' : '⏳ Loading...';
    let websiteBtnText = isAr ? 'الموقع الرسمي' : 'Official Site';

    // 4. تجميع الصفحة (مع تأثيرات الـ VIP)
    container.innerHTML = `
        <style>
            /* ====== التأثيرات الحركية ====== */
            @keyframes profileGlow {
                0% { box-shadow: 0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(252, 176, 69, 0.1); }
                50% { box-shadow: 0 15px 40px rgba(0,0,0,0.9), inset 0 0 40px rgba(252, 176, 69, 0.3); }
                100% { box-shadow: 0 10px 30px rgba(0,0,0,0.8), inset 0 0 20px rgba(252, 176, 69, 0.1); }
            }
            @keyframes levitateAvatar {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-8px); box-shadow: 0 15px 25px rgba(252, 176, 69, 0.6); }
                100% { transform: translateY(0px); }
            }
            @keyframes shimmerEffect {
                0% { transform: translateX(-150%) skewX(-25deg); }
                100% { transform: translateX(200%) skewX(-25deg); }
            }

            /* ====== بطاقة الملف الشخصي (الأسطورية) ====== */
            .royal-profile-card {
                position: relative;
                background: linear-gradient(180deg, rgba(22, 22, 30, 0.9) 0%, rgba(13, 13, 18, 0.95) 100%);
                border-radius: 24px;
                padding: 40px 20px 25px 20px;
                margin-top: 40px; /* مساحة لبروز الصورة */
                margin-bottom: 35px;
                border: 1px solid rgba(255, 215, 0, 0.15);
                text-align: center;
                animation: profileGlow 4s infinite alternate;
                backdrop-filter: blur(20px);
            }
            
            .royal-profile-card::before {
                content: '';
                position: absolute;
                top: 0; left: 0; right: 0; bottom: 0;
                background: url('${primaryClub ? primaryClub.logo : ''}') center/cover no-repeat;
                opacity: 0.05;
                border-radius: 24px;
                pointer-events: none;
            }

            .royal-avatar-wrapper {
                position: absolute;
                top: -50px;
                left: 50%;
                transform: translateX(-50%);
                width: 100px;
                height: 100px;
                border-radius: 50%;
                background: linear-gradient(135deg, #fcb045, #fd1d1d, #833ab4);
                padding: 4px;
                animation: levitateAvatar 3s ease-in-out infinite;
                z-index: 2;
            }

            .royal-avatar-inner {
                width: 100%; height: 100%;
                border-radius: 50%;
                overflow: hidden;
                border: 3px solid #121215;
                background: #111;
            }

            .royal-avatar-inner img {
                width: 100%; height: 100%; object-fit: cover;
            }

            .website-glass-btn {
                position: absolute;
                top: 15px;
                ${isAr ? 'left: 15px;' : 'right: 15px;'}
                background: rgba(255, 255, 255, 0.05);
                border: 1px solid rgba(255, 255, 255, 0.1);
                backdrop-filter: blur(10px);
                padding: 6px 14px;
                border-radius: 20px;
                color: #fff;
                font-size: 0.8rem;
                font-weight: bold;
                display: flex; align-items: center; gap: 6px;
                cursor: pointer;
                transition: all 0.3s;
                z-index: 10;
            }
            .website-glass-btn:hover {
                background: rgba(252, 176, 69, 0.2);
                border-color: rgba(252, 176, 69, 0.5);
                box-shadow: 0 0 15px rgba(252, 176, 69, 0.3);
            }

            /* ====== بطاقات الأقسام (تحديات / ترتيب) ====== */
            .action-banner {
                position: relative;
                border-radius: 20px;
                padding: 22px;
                margin-bottom: 20px;
                display: flex;
                align-items: center;
                gap: 18px;
                cursor: pointer;
                overflow: hidden;
                transition: transform 0.3s, box-shadow 0.3s;
                border: 1px solid rgba(255,255,255,0.05);
            }
            
            .action-banner::after {
                content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
                background: linear-gradient(90deg, transparent, rgba(255,255,255,0.15), transparent);
                animation: shimmerEffect 4s infinite;
            }

            .action-banner:active { transform: scale(0.97); }

            .banner-challenges {
                background: linear-gradient(135deg, rgba(28, 28, 34, 0.9), rgba(15, 23, 42, 0.95));
                border-left: 4px solid #3b82f6;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(59, 130, 246, 0.1);
            }
            .banner-challenges:hover { border-color: #60a5fa; box-shadow: 0 10px 30px rgba(59, 130, 246, 0.3); }

            .banner-ranking {
                background: linear-gradient(135deg, rgba(28, 28, 34, 0.9), rgba(67, 20, 7, 0.95));
                border-left: 4px solid #fd1d1d;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 0 20px rgba(253, 29, 29, 0.1);
            }
            .banner-ranking:hover { border-color: #fcb045; box-shadow: 0 10px 30px rgba(253, 29, 29, 0.3); }

            .banner-icon-wrapper {
                width: 60px; height: 60px;
                border-radius: 16px;
                display: flex; align-items: center; justify-content: center;
                font-size: 2.2rem;
                background: rgba(0,0,0,0.3);
                border: 1px solid rgba(255,255,255,0.05);
                box-shadow: inset 0 2px 10px rgba(255,255,255,0.1);
            }

            /* ====== قائمة الأندية ====== */
            .glass-club-card {
                background: rgba(26, 26, 34, 0.6);
                backdrop-filter: blur(12px);
                border: 1px solid rgba(255,255,255,0.03);
                border-radius: 18px;
                padding: 16px;
                display: flex;
                align-items: center;
                justify-content: space-between;
                margin-bottom: 12px;
                transition: transform 0.3s, background 0.3s;
                border-right: 3px solid rgba(252, 176, 69, 0.5);
            }
            .glass-club-card:hover {
                transform: translateX(${isAr ? '5px' : '-5px'});
                background: rgba(36, 36, 44, 0.8);
                border-color: var(--accent-gold);
            }

            .club-points-badge {
                background: linear-gradient(90deg, rgba(252, 176, 69, 0.1), rgba(253, 29, 29, 0.1));
                color: var(--accent-gold);
                padding: 6px 14px;
                border-radius: 12px;
                font-weight: 900;
                font-size: 0.95rem;
                border: 1px solid rgba(252, 176, 69, 0.2);
                box-shadow: inset 0 2px 5px rgba(0,0,0,0.5);
            }
        </style>

        <!-- 👑 البطاقة الملكية للمستخدم -->
        <div class="royal-profile-card">
            <!-- الصورة الطافية -->
            <div class="royal-avatar-wrapper">
                <div class="royal-avatar-inner">
                    <img src="${avatarSrc}" alt="Avatar">
                </div>
            </div>

            <!-- زر الموقع -->
            <button class="website-glass-btn" onclick="window.openOfficialWebsite()">
                <span style="font-size: 1rem;">🌍</span> ${websiteBtnText}
            </button>

            <!-- معلومات المستخدم -->
            <h2 style="margin: 25px 0 5px 0; color: #fff; font-size: 1.6rem; font-weight: 900; letter-spacing: 0.5px; text-shadow: 0 4px 10px rgba(0,0,0,0.8);">
                ${userState.username}
            </h2>
            <div style="display: inline-block; background: rgba(0,0,0,0.4); padding: 4px 15px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <span style="color: #888; font-size: 0.8rem; font-weight: bold;">ID:</span> 
                <span style="color: #ccc; font-size: 0.9rem; font-family: monospace;">${userState.userId}</span>
            </div>
        </div>
      
        <!-- 🎯 لافتة التحديات -->
        <div id="challenges-card" class="action-banner banner-challenges" onclick="if(typeof window.openChallengesScreen === 'function') { window.openChallengesScreen(); } else { alert('${loadingAlert}'); }">
            <div class="banner-icon-wrapper" style="text-shadow: 0 0 15px rgba(59, 130, 246, 0.6);">
                ${primaryClub ? primaryClub.countryFlag : '⚽'}
            </div>
            <div style="flex-grow: 1; text-align: ${isAr ? 'right' : 'left'};">
                <h3 style="color: #fff; margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 900;">${titleWeeklyChallenges}</h3>
                <p style="color: #94a3b8; font-size: 0.85rem; margin: 0; font-weight: bold;">
                    🇪🇺 ${textEuropeCups} <span style="color:#555;">•</span> 🇪🇸 ${textSpainCups}
                </p>
            </div>
            <div style="color: #3b82f6; font-size: 1.5rem; opacity: 0.8;">${isAr ? '👈' : '👉'}</div>
        </div>

        <!-- 🏆 لافتة الترتيب (تم التحديث هنا لاستدعاء الدالة الجديدة!) -->
        <div id="ranking-card" class="action-banner banner-ranking" onclick="if(typeof window.openLegendaryRankingScreen === 'function') { window.openLegendaryRankingScreen(); } else { alert('${loadingAlert}'); }">
            <div class="banner-icon-wrapper" style="text-shadow: 0 0 15px rgba(253, 29, 29, 0.6);">
                🔥
            </div>
            <div style="flex-grow: 1; text-align: ${isAr ? 'right' : 'left'};">
                <h3 style="color: #fff; margin: 0 0 4px 0; font-size: 1.25rem; font-weight: 900;">${titleRanking}</h3>
                <p style="color: #fca5a5; font-size: 0.85rem; margin: 0; font-weight: bold;">
                    ⭐ ${textRankingDesc}
                </p>
            </div>
            <div style="color: #fd1d1d; font-size: 1.5rem; opacity: 0.8;">${isAr ? '👈' : '👉'}</div>
        </div>

        <!-- 🛡️ قائمة الأندية -->
        <div style="margin-top: 30px;">
            <div style="display:flex; align-items:center; gap:8px; margin-bottom: 15px;">
                <span style="font-size: 1.2rem;">🛡️</span>
                <h4 style="color: #fff; margin: 0; font-size: 1.1rem; font-weight: 800;">${supportedClubsTitle}</h4>
            </div>
            ${clubsCardsHtml}
        </div>
        
        <div style="height: 20px;"></div>
    `;
};
