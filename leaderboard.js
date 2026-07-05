// ==========================================
// 🏆 ملف لوحة الصدارة والترتيب (leaderboard.js)
// ==========================================

// دالة عرض الترتيب العام للأندية
function renderLeaderboardPage(container) {
    if (typeof clubsData === 'undefined' || !clubsData.length) {
        container.innerHTML = `<h3 style='text-align:center; color:#ff4444;'>خطأ: بيانات الأندية غير متوفرة</h3>`;
        return;
    }

    const sortedClubs = [...clubsData].sort((a, b) => b.points - a.points);

    let leaderboardHtml = sortedClubs.map((club, index) => {
        let rankIcon = `#${index + 1}`;
        if (index === 0) rankIcon = '🥇';
        if (index === 1) rankIcon = '🥈';
        if (index === 2) rankIcon = '🥉';

        return `
        <div onclick="showClubFans('${club.id}')" style="background: rgba(28, 28, 34, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); border-radius: 12px; padding: 12px 15px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; transition: 0.3s;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <span style="font-size: 1.2rem; font-weight: bold; color: ${index < 3 ? '#ffd700' : '#888'}; width: 30px;">${rankIcon}</span>
                <img src="${club.logo}" style="width: 45px; height: 45px; object-fit: contain;">
                <h4 style="margin: 0; color: #fff;">${getClubName(club)}</h4>
            </div>
            <div style="text-align: right;">
                <span style="display: block; color: #ffd700; font-weight: bold;">${club.points.toLocaleString()}</span>
                <span style="font-size: 0.7rem; color: #aaa;">ZELO FC</span>
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = `
        <h2 style="color: #fff; text-align: center;">${userState.lang === 'ar' ? 'لوحة الشرف' : 'Leaderboard'}</h2>
        <div style="display: flex; flex-direction: column; max-height: 70vh; overflow-y: auto;">${leaderboardHtml}</div>
    `;
}

// دالة عرض المشجعين عند الضغط على النادي
window.showClubFans = function(clubId) {
    const club = clubsData.find(c => c.id === clubId);
    const contentDiv = document.getElementById("main-content");
    
    // هنا نفترض أن كل نادٍ لديه مصفوفة اسمها 'fans' في بياناته
    // في حال عدم وجود بيانات، نظهر رسالة
    const fans = club.fans || []; 

    let fansHtml = fans.length > 0 
        ? fans.sort((a, b) => b.points - a.points).map((fan, i) => `
            <div style="background: rgba(28, 28, 34, 0.6); padding: 12px; border-radius: 10px; margin-bottom: 8px; display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #fff;">${i + 1}. ${fan.name}</span>
                <div style="text-align: right;">
                    <div style="color: #ffd700; font-weight: bold;">${fan.points.toLocaleString()} ZELO FC</div>
                    <div style="font-size: 0.75rem; color: #0088cc;">${fan.referrals} ${userState.lang === 'ar' ? 'إحالة' : 'Referrals'}</div>
                </div>
            </div>
        `).join('')
        : `<p style="text-align:center; color:#aaa;">${userState.lang === 'ar' ? 'لا يوجد مشجعين لعرضهم حالياً' : 'No fans to display'}</p>`;

    contentDiv.innerHTML = `
        <button onclick="showPage('leaderboard')" style="background:none; border:none; color:#0088cc; font-size:1rem; cursor:pointer; margin-bottom:15px;">⬅ ${userState.lang === 'ar' ? 'العودة' : 'Back'}</button>
        <div style="text-align:center; margin-bottom:20px;">
            <img src="${club.logo}" style="width: 80px; height: 80px; border-radius: 50%;">
            <h2 style="color:#fff; margin-top:10px;">${getClubName(club)}</h2>
        </div>
        <div style="max-height: 50vh; overflow-y: auto;">${fansHtml}</div>
    `;
};
