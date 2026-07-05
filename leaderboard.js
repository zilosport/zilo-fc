/**
 * ملف leaderboard.js
 * مسؤول عن ترتيب وعرض الأندية والمشجعين (أفضل 100 فقط)
 */

const LeaderboardManager = {
    /**
     * 1. دالة عرض ترتيب الأندية (أفضل 100 نادي)
     * @param {Array} clubsData - مصفوفة الأندية
     * @param {String} clubsContainerId - ID الحاوية التي ستعرض فيها الأندية
     * @param {String} fansContainerId - ID الحاوية التي ستعرض فيها المشجعين عند النقر
     * @param {Function} onClubClickCallback - دالة اختيارية تنفذ عند النقر (مثلاً لإخفاء قسم الأندية وإظهار قسم المشجعين)
     */
    renderClubs: function(clubsData, clubsContainerId, fansContainerId, onClubClickCallback) {
        const container = document.getElementById(clubsContainerId);
        if (!container) return;
        
        container.innerHTML = ''; // تنظيف اللوحة قبل إضافة البيانات

        // ترتيب الأندية تنازلياً بالنقاط وأخذ أفضل 100 نادي فقط
        const top100Clubs = [...clubsData]
            .sort((a, b) => b.points - a.points)
            .slice(0, 100);

        top100Clubs.forEach((club, index) => {
            const rank = index + 1;
            const clubDiv = document.createElement('div');
            
            // الكلاسات الخاصة بتصميمك لكروت الأندية
            clubDiv.className = 'leaderboard-item club-item'; 
            
            // شكل النادي في اللوحة (يمكنك تعديل الـ HTML ليتطابق مع تصميمك)
            clubDiv.innerHTML = `
                <div class="rank">${rank}</div>
                <img src="${club.logo}" alt="${club.nameAr}" class="club-logo">
                <div class="info">
                    <h3 class="name">${club.nameAr}</h3>
                </div>
                <div class="points">
                    <span>⭐ ${club.points.toLocaleString()}</span>
                </div>
            `;

            // عند الضغط على النادي
            clubDiv.onclick = () => {
                // استدعاء دالة عرض أفضل 100 شخص داخل هذا النادي
                this.renderClubFans(club, fansContainerId);
                
                // تنفيذ الدالة الإضافية (مثل تبديل الشاشات في تطبيقك)
                if (typeof onClubClickCallback === 'function') {
                    onClubClickCallback(club);
                }
            };

            container.appendChild(clubDiv);
        });
    },

    /**
     * 2. دالة عرض ترتيب المشجعين داخل النادي (أفضل 100 مستخدم)
     * @param {Object} club - كائن النادي المختار
     * @param {String} containerId - ID الحاوية التي ستعرض فيها المشجعين
     */
    renderClubFans: function(club, containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;
        
        container.innerHTML = ''; // تنظيف اللوحة

        // ترتيب المستخدمين (بالنقاط أولاً، ثم الإحالات) وأخذ أفضل 100 فقط
        const top100Fans = [...club.fans]
            .sort((a, b) => {
                if (b.points !== a.points) {
                    return b.points - a.points; // الترتيب بالنقاط تنازلياً
                }
                return b.referrals - a.referrals; // في حال التعادل، الترتيب بالإحالات تنازلياً
            })
            .slice(0, 100);

        top100Fans.forEach((fan, index) => {
            const rank = index + 1;
            
            // تمييز أصحاب المراكز الثلاثة الأولى
            let rankDisplay = rank;
            if (rank === 1) rankDisplay = '🥇';
            if (rank === 2) rankDisplay = '🥈';
            if (rank === 3) rankDisplay = '🥉';

            const fanDiv = document.createElement('div');
            
            // الكلاسات الخاصة بتصميمك لكروت المشجعين
            fanDiv.className = 'leaderboard-item fan-item'; 
            
            // شكل المستخدم في اللوحة (يمكنك تعديل الـ HTML ليتطابق مع تصميمك)
            fanDiv.innerHTML = `
                <div class="rank">${rankDisplay}</div>
                <div class="info">
                    <h4 class="name">${fan.name}</h4>
                    <span class="referrals">🔗 ${fan.referrals} إحالة</span>
                </div>
                <div class="points">
                    <span>⭐ ${fan.points.toLocaleString()}</span>
                </div>
            `;
            
            container.appendChild(fanDiv);
        });
    }
};
