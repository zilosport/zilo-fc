// ==========================================
// 🏆 ملف قسم الترتيب (Leaderboard) - (مُحدث ومجهز للربط مع قاعدة البيانات)
// ==========================================

// دالة لحماية التطبيق من ثغرات XSS (حقن الأكواد الخبيثة في أسماء المستخدمين)
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}

// كائن مؤقت (سيتم استبداله بجلب البيانات من Backend لاحقاً)
const clubFansLeaderboard = {}; 

function renderLeaderboardPage(container) {
    // تجميع كل الأندية من الكائن المقسم بالدول في مصفوفة واحدة
    let allClubsFlat = [];
    if (typeof allWorldCupCountriesClubs !== 'undefined') {
        for (const country in allWorldCupCountriesClubs) {
            allClubsFlat = allClubsFlat.concat(allWorldCupCountriesClubs[country]);
        }
    }

    // ترتيب الأندية ثم أخذ أول 100 نادي (يُفضل أن يتم هذا الترتيب في قاعدة البيانات مستقبلاً)
    let sortedClubs = allClubsFlat
        .sort((a, b) => (b.points || 0) - (a.points || 0))
        .slice(0, 100);
    
    let leaderboardHtml = sortedClubs.map((club, index) => {
        // تحديد لون الحدود بناءً على المركز
        let borderColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#25252d';
        let borderSide = userState.lang === 'ar' ? 'right' : 'left';
        let textAlign = userState.lang === 'ar' ? 'left' : 'right';

        return `
        <div class="leaderboard-club-row" onclick="openSpecificClubFans('${club.id}')" 
             style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1c1c22, #16161a); margin: 8px 0; padding: 14px 16px; border-radius: 12px; border: 1px solid #25252d; border-${borderSide}: 5px solid ${borderColor}; cursor: pointer;">
            
            <div style="display: flex; align-items: center; gap: 12px;">
                <b style="font-size: 1.1rem; width: 25px; color:#fff;">#${index + 1}</b>
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 25px; height: 25px; object-fit: contain;">
                <span style="color: #fff; font-weight: bold;">${getClubName(club)}</span>
            </div>
            
            <div style="text-align: ${textAlign};">
                <span style="color: #4caf50; font-weight: bold; font-family: monospace;">${(club.points || 0).toLocaleString()} ZELO FC</span>
                <br><small style="color: #888; font-size: 0.75rem;">${t('clickToView')}</small>
            </div>
        </div>
        `;
    }).join('');

    container.innerHTML = `
        <h3 style="color: #fff; margin-bottom: 5px;">${t('leaderTitle')}</h3>
        <p style="color: #888; font-size: 0.85rem; margin-bottom: 15px;">${t('leaderSub')}</p>
        <div class="leaderboard-list">${leaderboardHtml}</div>
    `;
}

function openSpecificClubFans(clubId) {
    // البحث عن النادي داخل الكائن الجديد المقسم بالدول
    let club = null;
    if (typeof allWorldCupCountriesClubs !== 'undefined') {
        for (const country in allWorldCupCountriesClubs) {
            club = allWorldCupCountriesClubs[country].find(c => c.id === clubId);
            if (club) break;
        }
    }

    if (!club) {
        console.error("لم يتم العثور على النادي");
        return; // حماية في حال لم يتم العثور على النادي
    }

    const contentDiv = document.getElementById("main-content");
    
    // جلب قائمة المشجعين الحقيقية
    let fansList = clubFansLeaderboard[clubId] || [];
    let fansTableRows = "";

    if (fansList.length > 0) {
        // الترتيب والاقتطاع
        fansList.sort((a, b) => (b.points || 0) - (a.points || 0));
        fansList = fansList.slice(0, 100);

        fansTableRows = fansList.map((fan, idx) => {
            let rankColor = idx < 3 ? '#ff9800' : '#fff';
            let safeName = escapeHTML(fan.name); // حماية اسم المستخدم

            return `
            <tr style="border-bottom: 1px solid #1c1c22; text-align: center;">
                <td style="padding: 12px; color: ${rankColor}; font-weight: bold;">#${idx + 1}</td>
                <td style="padding: 12px; color: #fff;">👤 ${safeName}</td>
                <td style="padding: 12px; color: #4caf50; font-family: monospace;">${(fan.points || 0).toLocaleString()}</td>
                <td style="padding: 12px; color: #aaa;">${fan.referrals || 0} ${t('referralWord')}</td>
            </tr>
            `;
        }).join('');
    } else {
        fansTableRows = `
            <tr>
                <td colspan="4" style="padding: 20px; text-align: center; color: #888; font-size: 0.9rem;">
                    ${typeof t === 'function' && t('noFansYet') ? t('noFansYet') : 'لا يوجد مشجعين مسجلين في هذا النادي حتى الآن.'}
                </td>
            </tr>
        `;
    }

    // إضافة overflow-x: auto للحفاظ على التنسيق في شاشات الجوال
    contentDiv.innerHTML = `
        <button onclick="showPage('leaderboard')" style="background: #2b2b36; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-bottom: 15px; font-weight: bold;">${t('btnBack')}</button>
        
        <h3 style="margin-top:0; color: #fff; display: flex; align-items: center; gap: 8px;">
            <img src="${club.logo}" onerror="this.style.display='none'" style="width: 24px; height: 24px; object-fit: contain;"> 
            ${t('topFansOf')} [ ${getClubName(club)} ]
        </h3>
        <p style="color:#aaa; font-size:0.8rem; margin-bottom:15px;">${t('topFansSub')}</p>
        
        <div style="overflow-x: auto;">
            <table style="width: 100%; min-width: 400px; border-collapse: collapse; background: #121215; border-radius: 12px; overflow: hidden;">
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
        </div>
    `;
}
