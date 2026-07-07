// ==========================================
// 🏆 ملف قسم الترتيب (Leaderboard) - (مُحدث)
// ==========================================

const clubFansLeaderboard = {};

function renderLeaderboardPage(container) {
    // 🔄 التعديل الأول: تجميع كل الأندية من الكائن الجديد في مصفوفة واحدة لترتيبها
    let allClubsFlat = [];
    if (typeof allWorldCupCountriesClubs !== 'undefined') {
        for (const country in allWorldCupCountriesClubs) {
            allClubsFlat = allClubsFlat.concat(allWorldCupCountriesClubs[country]);
        }
    }

    // ترتيب الأندية ثم أخذ أول 100 نادي فقط
    let sortedClubs = allClubsFlat.sort((a, b) => (b.points || 0) - (a.points || 0)).slice(0, 100);
    
    let leaderboardHtml = sortedClubs.map((club, index) => `
        <div class="leaderboard-club-row" onclick="openSpecificClubFans('${club.id}')" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1c1c22, #16161a); margin: 8px 0; padding: 14px 16px; border-radius: 12px; border: 1px solid #25252d; border-${userState.lang === 'ar' ? 'right' : 'left'}: 5px solid ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32'}; cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <b style="font-size: 1.1rem; width: 25px; color:#fff;">#${index + 1}</b>
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 25px; height: 25px; object-fit: contain;">
                <span style="color: #fff; font-weight: bold;">${getClubName(club)}</span>
            </div>
            <div style="text-align: ${userState.lang === 'ar' ? 'left' : 'right'};">
                <span style="color: #4caf50; font-weight: bold; font-family: monospace;">${(club.points || 0).toLocaleString()} ZELOFC</span>
                <br><small style="color: #888; font-size: 0.75rem;">${t('clickToView')}</small>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h3 style="color: #fff; margin-bottom: 5px;">${t('leaderTitle')}</h3>
        <p style="color: #888; font-size: 0.85rem; margin-bottom: 15px;">${t('leaderSub')}</p>
        <div class="leaderboard-list">${leaderboardHtml}</div>
    `;
}

function openSpecificClubFans(clubId) {
    // 🔄 التعديل الثاني: البحث عن النادي داخل الكائن الجديد المقسم بالدول
    let club = null;
    if (typeof allWorldCupCountriesClubs !== 'undefined') {
        for (const country in allWorldCupCountriesClubs) {
            club = allWorldCupCountriesClubs[country].find(c => c.id === clubId);
            if (club) break;
        }
    }

    if (!club) return; // حماية في حال لم يتم العثور على النادي

    const contentDiv = document.getElementById("main-content");
    let fansList = clubFansLeaderboard[clubId] || [
        { name: userState.username + " (أنت)", points: userState.points, referrals: userState.referrals.length }
    ];
    
    // ترتيب المشجعين تنازلياً حسب النقاط
    fansList.sort((a, b) => b.points - a.points);
    
    // أخذ أفضل 100 مشجع فقط بعد الترتيب
    fansList = fansList.slice(0, 100);

    let fansTableRows = fansList.map((fan, idx) => `
        <tr style="border-bottom: 1px solid #1c1c22; text-align: center;">
            <td style="padding: 12px; color: ${idx < 3 ? '#ff9800' : '#fff'}; font-weight: bold;">#${idx + 1}</td>
            <td style="padding: 12px; color: #fff;">👤 ${fan.name}</td>
            <td style="padding: 12px; color: #4caf50; font-family: monospace;">${fan.points.toLocaleString()}</td>
            <td style="padding: 12px; color: #aaa;">${fan.referrals} ${t('referralWord')}</td>
        </tr>
    `).join('');

    contentDiv.innerHTML = `
        <button onclick="showPage('leaderboard')" style="background: #2b2b36; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-bottom: 15px; font-weight: bold;">${t('btnBack')}</button>
        <h3 style="margin-top:0; color: #fff; display: flex; align-items: center; gap: 8px;">
            <img src="${club.logo}" onerror="this.style.display='none'" style="width: 24px; height: 24px; object-fit: contain;"> ${t('topFansOf')} [ ${getClubName(club)} ]
        </h3>
        <p style="color:#aaa; font-size:0.8rem; margin-bottom:15px;">${t('topFansSub')}</p>
        <table style="width: 100%; border-collapse: collapse; background: #121215; border-radius: 12px; overflow: hidden;">
            <thead style="background: #1c1c22;">
                <tr>
                    <th style="padding: 12px; color: #aaa;">${t('colRank')}</th>
                    <th style="padding: 12px; color: #aaa;">${t('colFan')}</th>
                    <th style="padding: 12px; color: #aaa;">${t('colPoints')}</th>
                    <th style="padding: 12px; color: #aaa;">${t('colActivity')}</th>
                </tr>
            </thead>
            <tbody>${fansTableRows}</tbody>
        </table>
    `;
}
