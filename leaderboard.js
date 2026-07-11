// ==========================================
// 🏆 ملف قسم الترتيب (Leaderboard) - (مزود بعدد المشجعين)
// ==========================================

window.escapeHTML = function(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;'
        }[tag] || tag)
    );
};

// 1. دالة ترتيب الأندية
window.renderLeaderboardPage = async function(container) {
    container.innerHTML = `<div style="text-align:center; padding:40px; color:#888;">⏳ جاري جلب ترتيب الأندية المباشر...</div>`;

    try {
        let clubPointsMap = {};
        let clubMembersMap = {}; // 💡 إضافة: خريطة لتخزين عدد المشجعين لكل نادي

        if (typeof supabaseClient !== 'undefined') {
            const { data: fansData, error } = await supabaseClient
                .from('club_fans_rankings')
                .select('club_id, total_fan_points');

            if (!error && fansData) {
                fansData.forEach(fan => {
                    // حساب مجموع النقاط
                    clubPointsMap[fan.club_id] = (clubPointsMap[fan.club_id] || 0) + (fan.total_fan_points || 0);
                    // 💡 إضافة: حساب عدد المشجعين (كل صف يمثل مشجعاً)
                    clubMembersMap[fan.club_id] = (clubMembersMap[fan.club_id] || 0) + 1; 
                });
            }
        }

        let allClubsFlat = [];
        if (typeof allWorldCupCountriesClubs !== 'undefined') {
            for (const country in allWorldCupCountriesClubs) {
                allClubsFlat = allClubsFlat.concat(allWorldCupCountriesClubs[country]);
            }
        }

        allClubsFlat.forEach(club => {
            club.points = clubPointsMap[club.id] || 0;
            club.members = clubMembersMap[club.id] || 0; // 💡 إضافة: ربط عدد المشجعين بالنادي
        });

        let sortedClubs = allClubsFlat
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 100);
        
        let leaderboardHtml = sortedClubs.map((club, index) => {
            let borderColor = index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : index === 2 ? '#cd7f32' : '#25252d';
            let borderSide = (typeof userState !== 'undefined' && userState.lang === 'ar') ? 'right' : 'left';
            let textAlign = (typeof userState !== 'undefined' && userState.lang === 'ar') ? 'left' : 'right';
            let tFunc = typeof t === 'function' ? t : (key) => key;
            let clubName = typeof getClubName === 'function' ? getClubName(club) : club.name;
            let membersWord = typeof userState !== 'undefined' && userState.lang === 'ar' ? 'مشجع' : 'Fans'; // كلمة مشجع حسب اللغة

            return `
            <div class="leaderboard-club-row" onclick="window.openSpecificClubFans('${club.id}')" 
                 style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1c1c22, #16161a); margin: 8px 0; padding: 14px 16px; border-radius: 12px; border: 1px solid #25252d; border-${borderSide}: 5px solid ${borderColor}; cursor: pointer; transition: transform 0.2s;">
                
                <div style="display: flex; align-items: center; gap: 12px;">
                    <b style="font-size: 1.1rem; width: 25px; color:#fff;">#${index + 1}</b>
                    <img src="${club.logo}" onerror="this.style.display='none'" style="width: 32px; height: 32px; object-fit: contain;">
                    <div style="display: flex; flex-direction: column;">
                        <span style="color: #fff; font-weight: bold; font-size: 1.05rem;">${clubName}</span>
                        <small style="color: #4caf50; font-size: 0.8rem; margin-top: 2px;">
                            👥 ${(club.members || 0).toLocaleString()} ${membersWord}
                        </small>
                    </div>
                </div>
                
                <div style="text-align: ${textAlign};">
                    <span style="color: #ffd700; font-weight: bold; font-family: monospace; font-size: 1.1rem;">${(club.points || 0).toLocaleString()} 🏆</span>
                    <br><small style="color: #888; font-size: 0.75rem;">${tFunc('clickToView') || 'اضغط لعرض المشجعين'}</small>
                </div>
            </div>
            `;
        }).join('');

        let title = typeof t === 'function' ? t('leaderTitle') : 'ترتيب الأندية';
        let subTitle = typeof t === 'function' ? t('leaderSub') : 'الأندية الأكثر جمعاً للنقاط عبر مشجعيها';

        container.innerHTML = `
            <h3 style="color: #ffd700; margin-bottom: 5px; display: flex; align-items: center; gap: 8px;">🌍 ${title}</h3>
            <p style="color: #888; font-size: 0.85rem; margin-bottom: 15px;">${subTitle}</p>
            <div class="leaderboard-list">${leaderboardHtml}</div>
        `;
    } catch (error) {
        console.error("خطأ في جلب الترتيب:", error);
    }
};

// 2. دالة عرض ترتيب المشجعين الفردي
window.openSpecificClubFans = async function(clubId) {
    let club = null;
    if (typeof allWorldCupCountriesClubs !== 'undefined') {
        for (const country in allWorldCupCountriesClubs) {
            club = allWorldCupCountriesClubs[country].find(c => c.id === clubId);
            if (club) break;
        }
    }

    if (!club) return;

    const contentDiv = document.getElementById("main-content");
    let clubNameStr = typeof getClubName === 'function' ? getClubName(club) : club.name;
    let tFunc = typeof t === 'function' ? t : (key) => key;
    
    contentDiv.innerHTML = `<div style="text-align:center; padding:50px; color:#888;">⏳ جاري جلب أبطال ومشجعي ${clubNameStr}...</div>`;

    try {
        let fansTableRows = "";
        
        if (typeof supabaseClient !== 'undefined') {
            const { data: fansList, error } = await supabaseClient
                .from('club_fans_rankings')
                .select(`
                    telegram_id, 
                    total_fan_points, 
                    referrals_count, 
                    users!inner(username)
                `)
                .eq('club_id', clubId)
                .order('total_fan_points', { ascending: false })
                .limit(100);

            if (!error && fansList && fansList.length > 0) {
                const currentUserId = (typeof userState !== 'undefined') ? userState.userId : null;

                fansTableRows = fansList.map((fan, idx) => {
                    let rankColor = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#fff';
                    let safeName = window.escapeHTML((fan.users && fan.users.username) ? fan.users.username : 'مشجع مجهول');
                    
                    let isMe = fan.telegram_id == currentUserId;
                    let rowBg = isMe ? 'background: rgba(0, 136, 204, 0.2); border-left: 3px solid #0088cc;' : 'border-bottom: 1px solid #1c1c22;';
                    let youTag = isMe ? `<span style="font-size:0.7rem; background:#0088cc; padding:2px 6px; border-radius:4px; margin-right:5px;">أنت</span>` : '';

                    return `
                    <tr style="${rowBg} text-align: center;">
                        <td style="padding: 14px 10px; color: ${rankColor}; font-weight: bold; font-size: 1.1rem;">#${idx + 1}</td>
                        <td style="padding: 14px 10px; color: #fff; text-align: right; font-weight: ${isMe ? 'bold' : 'normal'};">
                            👤 ${safeName} ${youTag}
                        </td>
                        <td style="padding: 14px 10px; color: #4caf50; font-family: monospace; font-weight: bold;">${(fan.total_fan_points || 0).toLocaleString()}</td>
                        <td style="padding: 14px 10px; color: #aaa; font-size: 0.85rem;">${fan.referrals_count || 0} ${tFunc('referralWord') || 'إحالة'}</td>
                    </tr>
                    `;
                }).join('');
            } else {
                fansTableRows = `
                    <tr>
                        <td colspan="4" style="padding: 30px; text-align: center; color: #888; font-size: 0.95rem;">
                            ${tFunc('noFansYet') || 'لا يوجد مشجعين مسجلين في هذا النادي حتى الآن. كن أنت الأول! 🚀'}
                        </td>
                    </tr>
                `;
            }
        }

        contentDiv.innerHTML = `
            <button onclick="window.showPage('leaderboard')" style="background: #2b2b36; color: white; border: none; padding: 10px 18px; border-radius: 8px; cursor: pointer; margin-bottom: 20px; font-weight: bold; display: flex; align-items: center; gap: 8px;">
                ◀ ${tFunc('btnBack') || 'رجوع للترتيب العام'}
            </button>
            
            <div style="background: linear-gradient(135deg, rgba(28,28,34,0.9), rgba(0,0,0,0.8)), url('${club.logo}'); background-size: cover; background-position: center; padding: 20px; border-radius: 12px; border: 1px solid #333; margin-bottom: 20px; display: flex; align-items: center; gap: 15px;">
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 50px; height: 50px; object-fit: contain; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));"> 
                <div>
                    <h3 style="margin: 0; color: #fff; text-shadow: 1px 1px 3px #000;">${tFunc('topFansOf') || 'أبطال ومشجعي'} ${clubNameStr}</h3>
                    <p style="color:#ddd; font-size:0.85rem; margin: 4px 0 0 0; text-shadow: 1px 1px 2px #000;">${tFunc('topFansSub') || 'تنافس لتكون المشجع الأول لناديك المفضل!'}</p>
                </div>
            </div>
            
            <div style="overflow-x: auto; box-shadow: 0 4px 15px rgba(0,0,0,0.3); border-radius: 12px;">
                <table style="width: 100%; min-width: 450px; border-collapse: collapse; background: #121215; overflow: hidden;">
                    <thead style="background: #25252d;">
                        <tr>
                            <th style="padding: 15px 10px; color: #aaa; text-align: center;">${tFunc('colRank') || 'المركز'}</th>
                            <th style="padding: 15px 10px; color: #aaa; text-align: right;">${tFunc('colFan') || 'المشجع'}</th>
                            <th style="padding: 15px 10px; color: #aaa; text-align: center;">${tFunc('colPoints') || 'النقاط'}</th>
                            <th style="padding: 15px 10px; color: #aaa; text-align: center;">${tFunc('colActivity') || 'الإحالات'}</th>
                        </tr>
                    </thead>
                    <tbody>${fansTableRows}</tbody>
                </table>
            </div>
        `;
    } catch (error) {
        console.error("خطأ في جلب بيانات النادي:", error);
    }
};
