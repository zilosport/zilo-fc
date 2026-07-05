// استيراد البيانات (في حال كانت في ملف منفصل) أو استخدام المتغير الخاص بك مباشرة
// const clubsData = [...]; 

// نفترض أن لديك متغير يحدد لغة التطبيق الحالية (مأخوذ من app.js)
let currentLang = 'ar'; // أو 'en'

const LeaderboardApp = {
    // 1. دالة لترتيب وعرض الأندية
    renderClubsLeaderboard: function() {
        const container = document.getElementById('clubs-leaderboard-container');
        container.innerHTML = ''; // تفريغ الحاوية

        // ترتيب الأندية تنازلياً حسب النقاط
        const sortedClubs = [...clubsData].sort((a, b) => b.points - a.points);

        sortedClubs.forEach((club, index) => {
            const clubName = currentLang === 'ar' ? club.nameAr : club.nameEn;
            const rank = index + 1;
            
            // تصميم كرت النادي (يمكنك تعديل الكلاسات حسب ملف CSS الخاص بك)
            const clubCard = document.createElement('div');
            clubCard.className = 'leaderboard-item club-item';
            clubCard.innerHTML = `
                <div class="rank">${rank}</div>
                <img src="${club.logo}" alt="${clubName}" class="club-logo">
                <div class="info">
                    <h3 class="name">${clubName}</h3>
                    <span class="fans-count">👥 ${club.fans.length} ${currentLang === 'ar' ? 'مشجع' : 'Fans'}</span>
                </div>
                <div class="points">
                    <span>⭐ ${club.points.toLocaleString()}</span>
                </div>
            `;
            
            // عند الضغط على النادي، يعرض ترتيب مشجعيه
            clubCard.addEventListener('click', () => this.renderFansLeaderboard(club.id));
            container.appendChild(clubCard);
        });
    },

    // 2. دالة لترتيب وعرض المشجعين لنادي معين
    renderFansLeaderboard: function(clubId) {
        const container = document.getElementById('fans-leaderboard-container');
        container.innerHTML = ''; 

        // البحث عن النادي المطلوب
        const club = clubsData.find(c => c.id === clubId);
        if (!club) return;

        // ترتيب المشجعين تنازلياً حسب النقاط (ونأخذ أول 100 فقط لتجنب ثقل الصفحة)
        const sortedFans = [...club.fans].sort((a, b) => b.points - a.points).slice(0, 100);

        // إضافة عنوان يوضح اسم النادي
        const clubName = currentLang === 'ar' ? club.nameAr : club.nameEn;
        const header = document.createElement('h2');
        header.innerText = currentLang === 'ar' ? `ترتيب مشجعي ${clubName}` : `${clubName} Fans Leaderboard`;
        container.appendChild(header);

        sortedFans.forEach((fan, index) => {
            const rank = index + 1;
            
            const fanCard = document.createElement('div');
            fanCard.className = 'leaderboard-item fan-item';
            fanCard.innerHTML = `
                <div class="rank">${rank}</div>
                <div class="info">
                    <h4 class="name">${fan.name}</h4>
                    <span class="referrals">🔗 ${fan.referrals} ${currentLang === 'ar' ? 'إحالة' : 'Referrals'}</span>
                </div>
                <div class="points">
                    <span>⭐ ${fan.points.toLocaleString()}</span>
                </div>
            `;
            
            container.appendChild(fanCard);
        });
    },

    // 3. دالة لجلب أفضل المشجعين على مستوى التطبيق (Global Ranking)
    renderGlobalFansLeaderboard: function() {
        const container = document.getElementById('global-fans-container');
        container.innerHTML = '';

        // تجميع كل المشجعين من كل الأندية في مصفوفة واحدة
        let allFans = [];
        clubsData.forEach(club => {
            // إضافة اسم النادي لكل مشجع لمعرفة فريقه في الترتيب العام
            const fansWithClubInfo = club.fans.map(fan => ({
                ...fan, 
                clubLogo: club.logo,
                clubName: currentLang === 'ar' ? club.nameAr : club.nameEn
            }));
            allFans = allFans.concat(fansWithClubInfo);
        });

        // ترتيب الجميع وأخذ أفضل 100
        const topGlobalFans = allFans.sort((a, b) => b.points - a.points).slice(0, 100);

        topGlobalFans.forEach((fan, index) => {
            const rank = index + 1;
            const fanCard = document.createElement('div');
            fanCard.className = 'leaderboard-item global-fan-item';
            fanCard.innerHTML = `
                <div class="rank">${rank}</div>
                <img src="${fan.clubLogo}" alt="${fan.clubName}" class="small-club-logo">
                <div class="info">
                    <h4 class="name">${fan.name}</h4>
                    <span class="club-name">${fan.clubName}</span>
                </div>
                <div class="points">
                    <span>⭐ ${fan.points.toLocaleString()}</span>
                </div>
            `;
            container.appendChild(fanCard);
        });
    },

    // دالة التهيئة (التشغيل)
    init: function() {
        // بناءً على التصميم الخاص بك، تقوم باستدعاء الدوال المناسبة
        // مثلاً: نعرض ترتيب الأندية بشكل افتراضي
        this.renderClubsLeaderboard();
    }
};

// تشغيل السكريبت عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
    LeaderboardApp.init();
});
