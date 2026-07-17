// ==========================================
// 🏆 ملف قسم الترتيب (Leaderboard) - نسخة الـ VIP الأسطورية المتوهجة
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
    const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');
    
    // شاشة التحميل بالتأثير النبضي
    container.innerHTML = `<div style="text-align:center; padding:60px; color:var(--accent-gold, #fcb045); font-weight:900; font-size:1.2rem; animation: pulseGlowIcon 1.5s infinite;">
        ${isAr ? '⏳ جاري جلب الترتيب المباشر...' : '⏳ Fetching Live Rankings...'}
    </div>`;

    try {
        let clubPointsMap = {};
        let clubMembersMap = {}; 

        if (typeof supabaseClient !== 'undefined') {
            const { data: fansData, error } = await supabaseClient
                .from('club_fans_rankings')
                .select('club_id, total_fan_points');

            if (!error && fansData) {
                fansData.forEach(fan => {
                    clubPointsMap[fan.club_id] = (clubPointsMap[fan.club_id] || 0) + (fan.total_fan_points || 0);
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
            club.members = clubMembersMap[club.id] || 0; 
        });

        let sortedClubs = allClubsFlat
            .sort((a, b) => (b.points || 0) - (a.points || 0))
            .slice(0, 100);
        
        let leaderboardHtml = sortedClubs.map((club, index) => {
            let rankClass = '';
            let rankBadge = '';
            
            // تخصيص إضاءة لأصحاب المراكز الثلاثة الأولى
            if (index === 0) { rankClass = 'rank-gold'; rankBadge = '👑'; }
            else if (index === 1) { rankClass = 'rank-silver'; rankBadge = '🥈'; }
            else if (index === 2) { rankClass = 'rank-bronze'; rankBadge = '🥉'; }

            let tFunc = typeof t === 'function' ? t : (key) => key;
            let clubName = typeof getClubName === 'function' ? getClubName(club) : club.name;
            let membersWord = isAr ? 'مشجع' : 'Fans'; 
            let clickText = isAr ? 'عرض المشجعين' : 'View Fans';

            return `
            <div class="glass-leader-row ${rankClass}" onclick="window.openSpecificClubFans('${club.id}')">
                <div style="display: flex; align-items: center; gap: 15px;">
                    <div class="rank-number">${rankBadge || `#${index + 1}`}</div>
                    <div style="position: relative;">
                        <img src="${club.logo}" onerror="this.style.display='none'" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.6));">
                    </div>
                    <div style="display: flex; flex-direction: column;">
                        <span style="color: #fff; font-weight: 900; font-size: 1.15rem; letter-spacing: 0.5px;">${clubName}</span>
                        <div style="display: flex; align-items: center; gap: 6px; margin-top: 4px;">
                            <span style="color: #10b981; font-size: 0.85rem; font-weight: bold; background: rgba(16, 185, 129, 0.1); padding: 2px 8px; border-radius: 6px;">
                                👥 ${(club.members || 0).toLocaleString()} ${membersWord}
                            </span>
                        </div>
                    </div>
                </div>
                
                <div style="text-align: ${isAr ? 'left' : 'right'};">
                    <div class="points-badge">
                        ${(club.points || 0).toLocaleString()} <span style="font-size: 1rem;">🏆</span>
                    </div>
                    <div style="color: #888; font-size: 0.75rem; font-weight: bold; margin-top: 6px; display: flex; align-items: center; justify-content: flex-end; gap: 4px;">
                        ${clickText} <span style="font-size: 1rem; color: var(--accent-gold, #fcb045);">${isAr ? '👈' : '👉'}</span>
                    </div>
                </div>
            </div>
            `;
        }).join('');

        let title = typeof t === 'function' ? t('leaderTitle') : 'ترتيب الأندية';
        let subTitle = typeof t === 'function' ? t('leaderSub') : 'الأندية الأكثر جمعاً للنقاط عبر مشجعيها';

        container.innerHTML = `
            <style>
                /* ====== ستايل قائمة الترتيب الزجاجية ====== */
                .glass-leader-row {
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(28, 28, 34, 0.6);
                    backdrop-filter: blur(12px);
                    -webkit-backdrop-filter: blur(12px);
                    margin: 12px 0; padding: 16px;
                    border-radius: 18px;
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    cursor: pointer;
                    transition: transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275), box-shadow 0.3s;
                }
                .glass-leader-row:hover {
                    transform: translateY(-4px) scale(1.02);
                    background: rgba(36, 36, 44, 0.8);
                    box-shadow: 0 10px 25px rgba(0,0,0,0.5);
                }
                .glass-leader-row:active { transform: scale(0.98); }
                
                /* إضاءات المراكز الأولى */
                .rank-gold { border-left: 4px solid #ffd700; border-right: 4px solid #ffd700; box-shadow: 0 5px 15px rgba(255, 215, 0, 0.15); background: linear-gradient(90deg, rgba(255, 215, 0, 0.05), rgba(28, 28, 34, 0.8)); }
                .rank-silver { border-left: 4px solid #c0c0c0; border-right: 4px solid #c0c0c0; background: linear-gradient(90deg, rgba(192, 192, 192, 0.05), rgba(28, 28, 34, 0.8)); }
                .rank-bronze { border-left: 4px solid #cd7f32; border-right: 4px solid #cd7f32; background: linear-gradient(90deg, rgba(205, 127, 50, 0.05), rgba(28, 28, 34, 0.8)); }

                .rank-number {
                    font-size: 1.3rem; font-weight: 900; color: #888; width: 35px; text-align: center;
                }
                .rank-gold .rank-number { font-size: 1.8rem; }
                
                .points-badge {
                    background: linear-gradient(135deg, rgba(252, 176, 69, 0.15), rgba(253, 29, 29, 0.15));
                    color: var(--accent-gold, #fcb045);
                    font-weight: 900; font-family: monospace; font-size: 1.25rem;
                    padding: 6px 14px; border-radius: 12px;
                    border: 1px solid rgba(252, 176, 69, 0.3);
                    box-shadow: inset 0 2px 10px rgba(0,0,0,0.4);
                    display: inline-block;
                }
            </style>

            <div style="margin-bottom: 25px; text-align: center;">
                <h2 style="color: var(--accent-gold, #fcb045); margin: 0 0 8px 0; font-size: 1.8rem; font-weight: 900; text-shadow: 0 4px 15px rgba(252, 176, 69, 0.4);">
                    🌍 ${title}
                </h2>
                <p style="color: #94a3b8; font-size: 0.95rem; margin: 0; font-weight: bold;">${subTitle}</p>
            </div>
            <div class="leaderboard-list">${leaderboardHtml}</div>
            <div style="height: 30px;"></div>
        `;
    } catch (error) {
        console.error("خطأ في جلب الترتيب:", error);
    }
};

// 2. دالة عرض ترتيب المشجعين الفردي
window.openSpecificClubFans = async function(clubId) {
    const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');
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
    
    contentDiv.innerHTML = `<div style="text-align:center; padding:60px; color:var(--accent-gold, #fcb045); font-weight:900; font-size:1.2rem; animation: pulseGlowIcon 1.5s infinite;">
        ${isAr ? `⏳ جاري استدعاء أبطال ${clubNameStr}...` : `⏳ Summoning ${clubNameStr} heroes...`}
    </div>`;

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
                    let isMe = fan.telegram_id == currentUserId;
                    let rankColor = idx === 0 ? '#ffd700' : idx === 1 ? '#c0c0c0' : idx === 2 ? '#cd7f32' : '#888';
                    let rankBadge = idx === 0 ? '👑' : idx === 1 ? '🥈' : idx === 2 ? '🥉' : `#${idx + 1}`;
                    let safeName = window.escapeHTML((fan.users && fan.users.username) ? fan.users.username : 'مشجع مجهول');
                    
                    // تمييز صف المستخدم الحالي بستايل خاص
                    let rowClass = isMe ? 'me-row' : 'normal-row';
                    let youTag = isMe ? `<span class="you-badge">${isAr ? 'أنت' : 'You'}</span>` : '';

                    return `
                    <div class="fan-glass-row ${rowClass}">
                        <div class="fan-rank" style="color: ${rankColor};">${rankBadge}</div>
                        <div class="fan-info">
                            <span class="fan-name">👤 ${safeName}</span>
                            ${youTag}
                        </div>
                        <div class="fan-stats">
                            <div class="stat-pts">${(fan.total_fan_points || 0).toLocaleString()} 🏆</div>
                            <div class="stat-ref">${fan.referrals_count || 0} 👥</div>
                        </div>
                    </div>
                    `;
                }).join('');
            } else {
                fansTableRows = `
                    <div style="text-align:center; padding: 40px; color: #888; background: rgba(255,255,255,0.02); border-radius: 16px; border: 1px solid rgba(255,255,255,0.05);">
                        ${tFunc('noFansYet') || 'لا يوجد مشجعين مسجلين في هذا النادي حتى الآن. كن أنت الأول! 🚀'}
                    </div>
                `;
            }
        }

        contentDiv.innerHTML = `
            <style>
                .club-hero-banner {
                    position: relative;
                    background: linear-gradient(135deg, rgba(22, 22, 30, 0.9), rgba(0, 0, 0, 0.8)), url('${club.logo}') center/cover;
                    border-radius: 20px;
                    padding: 30px 20px;
                    display: flex; align-items: center; gap: 20px;
                    box-shadow: 0 15px 35px rgba(0,0,0,0.6), inset 0 0 30px rgba(252, 176, 69, 0.1);
                    border: 1px solid rgba(255, 215, 0, 0.2);
                    margin-bottom: 25px;
                    overflow: hidden;
                }
                .club-hero-banner::before {
                    content: ''; position: absolute; top: 0; left: -100%; width: 50%; height: 100%;
                    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent);
                    animation: shimmerEffect 4s infinite;
                }
                
                .fan-glass-row {
                    display: flex; justify-content: space-between; align-items: center;
                    background: rgba(28, 28, 34, 0.5);
                    backdrop-filter: blur(10px);
                    padding: 14px 16px; margin-bottom: 10px;
                    border-radius: 14px; border: 1px solid rgba(255,255,255,0.03);
                    transition: transform 0.2s, background 0.2s;
                }
                .fan-glass-row:hover { background: rgba(40, 40, 50, 0.8); transform: scale(1.01); }
                
                .me-row {
                    background: linear-gradient(90deg, rgba(59, 130, 246, 0.15), rgba(28, 28, 34, 0.8));
                    border: 1px solid rgba(59, 130, 246, 0.4);
                    box-shadow: 0 0 15px rgba(59, 130, 246, 0.2);
                }
                
                .fan-rank { font-size: 1.3rem; font-weight: 900; width: 40px; text-align: center; }
                .fan-info { flex-grow: 1; display: flex; align-items: center; gap: 10px; }
                .fan-name { color: #fff; font-weight: 900; font-size: 1.05rem; }
                .you-badge { font-size: 0.75rem; background: #3b82f6; color: white; padding: 2px 8px; border-radius: 8px; font-weight: bold; }
                
                .fan-stats { text-align: ${isAr ? 'left' : 'right'}; }
                .stat-pts { color: #10b981; font-weight: 900; font-family: monospace; font-size: 1.15rem; }
                .stat-ref { color: #94a3b8; font-size: 0.8rem; font-weight: bold; margin-top: 4px; }
                
                /* زر العودة المحدث */
                .btn-elegant-back {
                    background: rgba(255, 255, 255, 0.05); color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.1); backdrop-filter: blur(10px);
                    padding: 10px 20px; border-radius: 12px; font-weight: bold; font-size: 0.95rem;
                    cursor: pointer; display: inline-flex; align-items: center; gap: 8px;
                    transition: all 0.3s; margin-bottom: 20px;
                }
                .btn-elegant-back:hover { background: rgba(252, 176, 69, 0.2); border-color: rgba(252, 176, 69, 0.5); }
            </style>

            <button class="btn-elegant-back" onclick="window.showPage('leaderboard')">
                <span style="font-size: 1.2rem;">${isAr ? '🔙' : '🔙'}</span> ${tFunc('btnBack') || 'العودة للترتيب العام'}
            </button>
            
            <div class="club-hero-banner">
                <div style="background: rgba(0,0,0,0.5); padding: 10px; border-radius: 50%; border: 2px solid rgba(255,215,0,0.3); box-shadow: 0 0 20px rgba(255,215,0,0.2);">
                    <img src="${club.logo}" onerror="this.style.display='none'" style="width: 60px; height: 60px; object-fit: contain; filter: drop-shadow(0 4px 10px rgba(0,0,0,0.8));"> 
                </div>
                <div>
                    <h2 style="margin: 0; color: #fff; font-weight: 900; font-size: 1.6rem; text-shadow: 0 4px 10px rgba(0,0,0,0.9); letter-spacing: 0.5px;">
                        ${tFunc('topFansOf') || 'أبطال'} ${clubNameStr}
                    </h2>
                    <p style="color:var(--accent-gold, #fcb045); font-size:0.95rem; font-weight: bold; margin: 6px 0 0 0; text-shadow: 0 2px 4px rgba(0,0,0,0.8);">
                        ${tFunc('topFansSub') || 'تنافس لتكون المشجع الأول لناديك!'} 🚀
                    </p>
                </div>
            </div>
            
            <div class="fans-list-container">
                ${fansTableRows}
            </div>
            <div style="height: 40px;"></div>
        `;
    } catch (error) {
        console.error("خطأ في جلب بيانات النادي:", error);
    }
};
