// ==========================================
// 🏆 ملف لوحة الصدارة والترتيب (leaderboard.js)
// ==========================================

function renderLeaderboardPage(container) {
    // التأكد من وجود بيانات الأندية قبل الترتيب
    if (typeof clubsData === 'undefined' || !clubsData.length) {
        container.innerHTML = `<h3 style='text-align:center; color:#ff4444;'>خطأ: بيانات الأندية غير متوفرة</h3>`;
        return;
    }

    // ترتيب الأندية تنازلياً حسب عدد النقاط (من الأعلى للأقل)
    const sortedClubs = [...clubsData].sort((a, b) => b.points - a.points);

    // بناء الكود الخاص بكل نادي في الترتيب
    let leaderboardHtml = sortedClubs.map((club, index) => {
        // تخصيص أيقونات للمراكز الثلاثة الأولى
        let rankIcon = `#${index + 1}`;
        let rankColor = '#888899'; // لون افتراضي للمراكز الأخرى
        
        if (index === 0) { rankIcon = '🥇'; rankColor = '#ffd700'; } // ذهبي
        if (index === 1) { rankIcon = '🥈'; rankColor = '#c0c0c0'; } // فضي
        if (index === 2) { rankIcon = '🥉'; rankColor = '#cd7f32'; } // برونزي

        // تمييز أندية المستخدم في قائمة الترتيب
        let isUserClub = userState.selectedClubs.includes(club.id);
        let borderStyle = isUserClub ? 'border: 1px solid #4caf50;' : 'border: 1px solid rgba(255, 255, 255, 0.05);';
        let bgStyle = isUserClub ? 'background: rgba(76, 175, 80, 0.1);' : 'background: rgba(28, 28, 34, 0.6);';

        return `
        <div style="${bgStyle} ${borderStyle} backdrop-filter: blur(8px); border-radius: 12px; padding: 12px 15px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; transition: transform 0.2s; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 1.2rem; font-weight: bold; color: ${rankColor}; width: 30px; text-align: center;">
                    ${rankIcon}
                </span>
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.4));">
                <div>
                    <h4 style="margin: 0; color: #fff; font-size: 1.05rem;">${getClubName(club)} ${club.countryFlag}</h4>
                    ${isUserClub ? `<span style="font-size: 0.7rem; color: #4caf50; font-weight: bold;">${userState.lang === 'ar' ? 'ناديك المفضل' : 'Your Club'}</span>` : ''}
                </div>
            </div>
            <div style="text-align: right;">
                <span style="display: block; color: #ffd700; font-weight: bold; font-size: 1rem;">
                    ${club.points.toLocaleString()}
                </span>
                <span style="font-size: 0.75rem; color: #aaa;">${userState.lang === 'ar' ? 'نقطة' : 'PTS'}</span>
            </div>
        </div>
        `;
    }).join('');

    // عرض الهيكل الأساسي للصفحة
    container.innerHTML = `
        <div style="text-align: center; margin-bottom: 20px;">
            <div style="font-size: 3rem; margin-bottom: 5px;">🏆</div>
            <h2 style="color: #fff; margin: 0 0 5px 0; text-shadow: 0 2px 5px rgba(0,0,0,0.5);">
                ${userState.lang === 'ar' ? 'لوحة الشرف' : 'Leaderboard'}
            </h2>
            <p style="color: #aaa; font-size: 0.85rem; margin: 0;">
                ${userState.lang === 'ar' ? 'ترتيب الأندية بناءً على نقاط المشجعين' : 'Clubs ranking based on fans points'}
            </p>
        </div>
        
        <div style="display: flex; flex-direction: column; max-height: 65vh; overflow-y: auto; padding-right: 5px;">
            ${leaderboardHtml}
        </div>
    `;
}
