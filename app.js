// ==========================================
// 🚀 تطبيق زيلو إف سي (Zilo FC) - الكود المطور
// ==========================================

import { clubsData, i18n } from './data.js';

// 1. إدارة بيانات المستخدم مع الحفظ التلقائي
let userState = {
    username: "Zilo Fan",
    userParam: "", 
    userId: "",
    photoUrl: null,
    points: 0, 
    selectedClub: null,
    walletConnected: false,
    walletAddress: null,
    walletBalance: "0.00",
    hasLoggedIn: false,
    lang: "ar",
    referrals: [], 
    dailyCheckInClaimed: false,
    tasks: [
        { id: "x", textAr: "متابعة حساب Zilo FC على X", textEn: "Follow Zilo FC on X", points: 500, completed: false, url: "https://x.com" },
        { id: "tg_channel", textAr: "الانضمام لقناة تليجرام", textEn: "Join Telegram Channel", points: 400, completed: false, url: "https://t.me" },
        { id: "youtube", textAr: "الاشتراك في اليوتيوب", textEn: "Subscribe on YouTube", points: 600, completed: false, url: "https://youtube.com" }
    ]
};

// دالتان لحفظ واسترجاع حالة المستخدم محلياً لحين ربط الـ Backend
function saveStateToStorage() {
    localStorage.setItem('zilo_user_state', JSON.stringify(userState));
}

function loadStateFromStorage() {
    const saved = localStorage.getItem('zilo_user_state');
    if (saved) {
        try {
            const parsed = JSON.parse(saved);
            // دمج البيانات المحفوظة مع الهيكل الأساسي لتجنب المشاكل عند إضافة مهام جديدة مستقبلاً
            userState = { ...userState, ...parsed };
        } catch (e) {
            console.error("Error loading state:", e);
        }
    }
}

const clubFansLeaderboard = {};
let tonConnectUI = null;
const tg = window.Telegram?.WebApp;

// 2. دوال مساعدة للترجمة
window.t = function(key) {
    return i18n[userState.lang]?.[key] || key;
}

window.getClubName = function(club) {
    return userState.lang === 'ar' ? club.nameAr : club.nameEn;
}

window.getTaskName = function(task) {
    return userState.lang === 'ar' ? task.textAr : task.textEn;
}

// تغيير لغة التطبيق بالكامل وتحديث النوافذ بذكاء
window.toggleLanguage = function() {
    userState.lang = userState.lang === 'ar' ? 'en' : 'ar';
    saveStateToStorage();
    window.refreshDOMDirection();
    
    // تحديث نصوص القائمة السفلية
    const navItems = document.querySelectorAll('.nav-item span:not(.icon)');
    if (navItems.length >= 5) {
        navItems[0].innerText = window.t('navHome');
        navItems[1].innerText = window.t('navTasks');
        navItems[2].innerText = window.t('navFriends');
        navItems[3].innerText = window.t('navLeaderboard');
        navItems[4].innerText = window.t('navWallet');
    }
    
    window.updateTopBar();
    
    // إعادة ريندر الصفحة الحالية لتحديث النصوص فوراً
    const activeNav = document.querySelector(".nav-item.active");
    if (activeNav) {
        const pageId = activeNav.getAttribute("onclick").match(/'([^']+)'/)[1];
        window.showPage(pageId);
    } else if (!userState.hasLoggedIn) {
        window.renderLoginScreen();
    }
}

window.refreshDOMDirection = function() {
    document.documentElement.dir = userState.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = userState.lang;
}

// 3. تهيئة التطبيق
document.addEventListener("DOMContentLoaded", () => {
    // تحميل البيانات المحفوظة أولاً
    loadStateFromStorage();

    if (tg) {
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const tgUser = tg.initDataUnsafe.user;
            userState.username = tgUser.username ? `@${tgUser.username}` : `${tgUser.first_name} ${tgUser.last_name || ''}`.trim();
            userState.userId = tgUser.id;
            userState.userParam = tgUser.username || tgUser.id;
            
            if (tgUser.photo_url) userState.photoUrl = tgUser.photo_url;
            
            // الاعتماد على لغة التليجرام فقط إذا لم يكن هناك خيار محفوظ مسبقاً للمستخدم
            if (!localStorage.getItem('zilo_user_state') && tgUser.language_code && tgUser.language_code.startsWith('en')) {
                userState.lang = 'en';
            }
        } else {
            userState.username = userState.username || "مستخدم تليجرام";
            userState.userId = userState.userId || "غير معروف";
        }
    }

    window.refreshDOMDirection();

    // تهيئة محفظة TON
    try {
        tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: 'https://zilosport.github.io/zilo-fc/tonconnect-manifest.json',
            buttonRootId: null
        });

        tonConnectUI.onStatusChange((walletInfo) => {
            if (walletInfo) {
                userState.walletConnected = true;
                userState.walletAddress = walletInfo.account.address;
                userState.walletBalance = "0.00"; 
            } else {
                userState.walletConnected = false;
                userState.walletAddress = null;
                userState.walletBalance = "0.00";
            }
            saveStateToStorage();
            
            if (userState.hasLoggedIn) {
                const walletNav = document.querySelector(".nav-item[onclick*='wallet']");
                if (walletNav && walletNav.classList.contains("active")) {
                    window.renderWalletPage(document.getElementById("main-content"));
                }
            }
        });
    } catch (error) {
        console.error("TON Connect Error: ", error);
    }

    // التوجيه بناءً على حالة تسجيل الدخول الاختيارية
    if (!userState.selectedClub) {
        window.renderLoginScreen();
    } else {
        userState.hasLoggedIn = true;
        window.updateTopBar();
        window.showPage('home'); 
    }
    
    window.injectLangButton();
});

window.injectLangButton = function() {
    const topBar = document.querySelector('.top-bar');
    if(topBar && !document.getElementById('lang-btn')) {
        const langBtn = document.createElement('div');
        langBtn.id = 'lang-btn';
        langBtn.innerHTML = '🌐';
        langBtn.style.cssText = 'position:fixed; top:15px; left:50%; transform:translateX(-50%); font-size:1.5rem; cursor:pointer; z-index:9999;';
        langBtn.onclick = window.toggleLanguage;
        document.body.appendChild(langBtn);
    }
}

// 📱 4. شاشة اختيار النادي وتسجيل الدخول
window.renderLoginScreen = function() {
    if (document.querySelector('.top-bar')) document.querySelector('.top-bar').style.display = 'none';
    if (document.querySelector('.bottom-nav')) document.querySelector('.bottom-nav').style.display = 'none';

    const mainContent = document.getElementById("main-content");
    
    let optionsHtml = clubsData.map(club => `
        <div onclick="selectClubAndLogin('${club.id}')" style="background: #1c1c22; border: 1px solid #25252d; padding: 12px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s;">
            <div style="position: relative;">
                <img src="${club.logo}" alt="" onerror="this.style.display='none'" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
                <span style="position: absolute; bottom: -5px; right: -10px; font-size: 0.9rem; background: #121216; border-radius: 50%; padding: 2px;">${club.countryFlag}</span>
            </div>
            <h4 style="margin: 0; color: #fff; font-size: 0.85rem; text-align: center;">${window.getClubName(club)}</h4>
        </div>
    `).join('');

    mainContent.innerHTML = `
        <div style="padding: 20px 10px; text-align: center; max-width: 500px; margin: 0 auto;">
            <div style="font-size: 3rem; margin-bottom: 10px;">⚽</div>
            <h2 style="color: #fff; margin: 0 0 5px 0;">${window.t('welcomeTitle')}</h2>
            <p style="color: #aaa; font-size: 0.9rem; margin-bottom: 20px;">${window.t('welcomeSub')}</p>

            <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 60vh; overflow-y: auto; padding-right: 5px;">
                ${optionsHtml}
            </div>
        </div>
    `;
}

window.selectClubAndLogin = function(clubId) {
    userState.selectedClub = clubId;
    userState.hasLoggedIn = true;
    saveStateToStorage();

    if (document.querySelector('.top-bar')) document.querySelector('.top-bar').style.display = 'flex';
    if (document.querySelector('.bottom-nav')) document.querySelector('.bottom-nav').style.display = 'flex';

    window.updateTopBar();
    window.showPage('home');
}

window.updateTopBar = function() {
    const pointsEl = document.getElementById("points");
    const clubEl = document.getElementById("club");
    
    if(pointsEl) pointsEl.innerText = `${window.t('coins')} ${userState.points.toLocaleString()}`;
    
    if (clubEl && userState.selectedClub) {
        const club = clubsData.find(c => c.id === userState.selectedClub);
        if(club) clubEl.innerHTML = `${window.t('yourClub')} <img src="${club.logo}" onerror="this.style.display='none'" style="height: 18px; vertical-align: middle; margin: 0 4px; object-fit: contain;"> <b>${window.getClubName(club)}</b>`;
    }
}

window.showPage = function(pageId) {
    if(!userState.hasLoggedIn) return; 
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    const activeNav = Array.from(document.querySelectorAll(".nav-item")).find(el => el.getAttribute("onclick").includes(pageId));
    if (activeNav) activeNav.classList.add("active");

    const contentDiv = document.getElementById("main-content");
    if (!contentDiv) return;
    contentDiv.innerHTML = ""; 

    switch(pageId) {
        case 'home': window.renderHomePage(contentDiv); break;
        case 'tasks': window.renderTasksPage(contentDiv); break;
        case 'friends': window.renderFriendsPage(contentDiv); break;
        case 'leaderboard': window.renderLeaderboardPage(contentDiv); break;
        case 'wallet': window.renderWalletPage(contentDiv); break;
    }
}

// 🏠 5. الصفحة الرئيسية
window.renderHomePage = function(container) {
    const currentClub = clubsData.find(c => c.id === userState.selectedClub) || clubsData[0];
    
    let fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.username)}&background=1c1c22&color=0088cc&size=128&bold=true`;
    let avatarSrc = userState.photoUrl ? userState.photoUrl : fallbackAvatar;

    container.innerHTML = `
        <div class="profile-section" style="background: ${currentClub.color}; padding: 25px 15px; border-radius: 16px; text-align: center; margin-bottom: 15px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <div class="avatar-container" style="position: relative; display: inline-block;">
                <img id="user-avatar" src="${avatarSrc}" onerror="this.src='${fallbackAvatar}'" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #fff; object-fit: cover;">
                <span class="verified-badge" style="position: absolute; bottom: 0; ${userState.lang === 'ar' ? 'left: 0;' : 'right: 0;'} background: #0088cc; color: #fff; width: 22px; height: 22px; line-height: 22px; border-radius: 50%; font-size: 0.8rem; border: 2px solid #fff;">✓</span>
            </div>
            <h3 id="profile-name" class="user-title" style="margin: 10px 0 2px 0; color: #fff; font-size: 1.3rem;">${userState.username}</h3>
            <p id="profile-id" class="user-id" style="margin: 0; color: rgba(255,255,255,0.7); font-size: 0.85rem; font-family: monospace;">ID: ${userState.userId}</p>
        </div>

        <div style="background: #1c1c22; border: 1px solid #25252d; border-radius: 16px; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 25px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${currentClub.logo}" onerror="this.style.display='none'" style="width: 50px; height: 50px; object-fit: contain;">
                <div>
                    <p style="margin: 0; font-size: 0.8rem; color: #aaa;">${window.t('supportText')}</p>
                    <h3 style="margin: 0; color: #fff; font-size: 1.2rem;">${window.getClubName(currentClub)} ${currentClub.countryFlag}</h3>
                </div>
            </div>
            <div>
                <span style="background: rgba(255, 215, 0, 0.2); color: #ffd700; padding: 5px 10px; border-radius: 8px; font-weight: bold; font-size: 0.85rem;">
                    ${currentClub.points.toLocaleString()} 🏆
                </span>
            </div>
        </div>
    `;
}

// 🛠️ 6. صفحة المهام
window.renderTasksPage = function(container) {
    let tasksHtml = userState.tasks.map(task => `
        <div class="task-card" style="display: flex; justify-content: space-between; align-items: center; background: #1c1c22; margin: 8px 0; padding: 14px; border-radius: 12px; border: 1px solid #25252d;">
            <div>
                <h5 style="margin: 0 0 4px 0; color: #fff;">${window.getTaskName(task)}</h5>
                <small style="color: #0088cc; font-weight: bold;">+ ${task.points} ZILOFC</small>
            </div>
            <button onclick="executeTask('${task.id}', '${task.url}')" ${task.completed ? 'disabled style="background:#2b2b36; color:#666; border:none; padding:8px 16px; border-radius:8px;"' : 'style="background:#0088cc; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer;"'}>
                ${task.completed ? window.t('btnDone') : window.t('btnGo')}
            </button>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="daily-reward-card" style="background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 15px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div>
                <h4 style="margin: 0; color: #fff;">${window.t('dailyCheckin')}</h4>
                <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #e0e0e0;">${window.t('dailyCheckinSub')}</p>
            </div>
            <button onclick="claimDaily()" ${userState.dailyCheckInClaimed ? 'disabled style="background:#555;"' : 'style="background:#4caf50; color:white; border:none; padding:8px 16px; border-radius:20px; font-weight:bold; cursor:pointer;"'}>
                ${userState.dailyCheckInClaimed ? window.t('btnClaimed') : window.t('btnClaim')}
            </button>
        </div>

        <h3 style="color:#fff; font-size:1.1rem; margin-bottom:10px;">${window.t('currentTasks')}</h3>
        <div class="tasks-container">${tasksHtml}</div>
    `;
}

window.executeTask = function(taskId, url) {
    if (tg && tg.openLink) tg.openLink(url); else window.open(url, '_blank');
    setTimeout(() => {
        const task = userState.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            userState.points += task.points;
            saveStateToStorage();
            alert(`${window.t('alertTaskDone')} ${task.points} ZILOFC.`);
            window.updateTopBar();
            window.showPage('tasks');
        }
    }, 4000);
}

window.claimDaily = function() {
    if(!userState.dailyCheckInClaimed) {
        userState.dailyCheckInClaimed = true;
        userState.points += 200;
        saveStateToStorage();
        alert(window.t('alertDailyDone'));
        window.updateTopBar();
        window.showPage('tasks');
    }
}

// 👥 7. صفحة الأصدقاء
window.renderFriendsPage = function(container) {
    const referralLink = `https://t.me/ZiloFC_Bot/app?startapp=ref_${userState.userParam}`;
    let friendsListHtml = userState.referrals.map(friend => `
        <div style="display: flex; justify-content: space-between; background: #1c1c22; padding: 12px; border-radius: 10px; margin: 6px 0; border: 1px solid #25252d;">
            <span style="color: #fff; font-weight: bold;">👤 ${friend.name}</span>
            <span style="color: #0088cc; font-size: 0.85rem;">${window.t('invites')} ${friend.referralsCount} | +500 ZILOFC</span>
        </div>
    `).join('');

    container.innerHTML = `
        <h3>${window.t('referralTitle')}</h3>
        <p style="color: #aaa; font-size: 0.85rem;">${window.t('referralSub')}</p>
        
        <div style="background: #16161a; border: 1px dashed #334; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <p style="color:#0088cc; font-family:monospace; font-size:0.8rem; word-break:break-all; margin:0 0 12px 0;">${referralLink}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="copyToClipboard('${referralLink}')" style="flex:1; padding:10px; border-radius:8px; border:none; background:#4caf50; color:white; font-weight:bold; cursor:pointer;">${window.t('btnCopy')}</button>
                <button onclick="shareOnTelegram('${referralLink}')" style="flex:1; padding:10px; border-radius:8px; border:none; background:#0088cc; color:white; font-weight:bold; cursor:pointer;">${window.t('btnShare')}</button>
            </div>
        </div>

        <h4 style="color:#fff;">${window.t('friendsList')} (${userState.referrals.length})</h4>
        <div>${friendsListHtml}</div>
    `;
}

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => alert(window.t('alertCopied')));
}

window.shareOnTelegram = function(link) {
    const text = encodeURIComponent(window.t('shareText'));
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
    if (tg && tg.openTelegramLink) tg.openTelegramLink(shareUrl); else window.open(shareUrl, '_blank');
}

// 🏆 8. متصدرين الأندية والجماهير
window.renderLeaderboardPage = function(container) {
    let sortedClubs = [...clubsData].sort((a, b) => b.points - a.points);
    let leaderboardHtml = sortedClubs.map((club, index) => `
        <div class="leaderboard-club-row" onclick="openSpecificClubFans('${club.id}')" style="display: flex; justify-content: space-between; align-items: center; background: linear-gradient(135deg, #1c1c22, #16161a); margin: 8px 0; padding: 14px 16px; border-radius: 12px; border: 1px solid #25252d; border-${userState.lang === 'ar' ? 'right' : 'left'}: 5px solid ${index === 0 ? '#ffd700' : index === 1 ? '#c0c0c0' : '#cd7f32'}; cursor: pointer;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <b style="font-size: 1.1rem; width: 25px; color:#fff;">#${index + 1}</b>
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 25px; height: 25px; object-fit: contain;">
                <span style="color: #fff; font-weight: bold;">${window.getClubName(club)}</span>
            </div>
            <div style="text-align: ${userState.lang === 'ar' ? 'left' : 'right'};">
                <span style="color: #4caf50; font-weight: bold; font-family: monospace;">${club.points.toLocaleString()} ZILOFC</span>
                <br><small style="color: #888; font-size: 0.75rem;">${window.t('clickToView')}</small>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <h3 style="color: #fff; margin-bottom: 5px;">${window.t('leaderTitle')}</h3>
        <p style="color: #888; font-size: 0.85rem; margin-bottom: 15px;">${window.t('leaderSub')}</p>
        <div class="leaderboard-list">${leaderboardHtml}</div>
    `;
}

window.openSpecificClubFans = function(clubId) {
    const club = clubsData.find(c => c.id === clubId);
    const contentDiv = document.getElementById("main-content");
    let fansList = clubFansLeaderboard[clubId] || [
        { name: userState.username + " (أنت)", points: userState.points, referrals: userState.referrals.length }
    ];
    fansList.sort((a, b) => b.points - a.points);

    let fansTableRows = fansList.map((fan, idx) => `
        <tr style="border-bottom: 1px solid #1c1c22; text-align: center;">
            <td style="padding: 12px; color: ${idx < 3 ? '#ff9800' : '#fff'}; font-weight: bold;">#${idx + 1}</td>
            <td style="padding: 12px; color: #fff;">👤 ${fan.name}</td>
            <td style="padding: 12px; color: #4caf50; font-family: monospace;">${fan.points.toLocaleString()}</td>
            <td style="padding: 12px; color: #aaa;">${fan.referrals} ${window.t('referralWord')}</td>
        </tr>
    `).join('');

    contentDiv.innerHTML = `
        <button onclick="showPage('leaderboard')" style="background: #2b2b36; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; margin-bottom: 15px; font-weight: bold;">${window.t('btnBack')}</button>
        <h3 style="margin-top:0; color: #fff; display: flex; align-items: center; gap: 8px;">
            <img src="${club.logo}" onerror="this.style.display='none'" style="width: 24px; height: 24px; object-fit: contain;"> ${window.t('topFansOf')} [ ${window.getClubName(club)} ]
        </h3>
        <p style="color:#aaa; font-size:0.8rem; margin-bottom:15px;">${window.t('topFansSub')}</p>
        <div style="overflow-x: auto;">
            <table style="width: 100%; border-collapse: collapse; background: #121215; border-radius: 12px; overflow: hidden; min-width: 400px;">
                <thead style="background: #1c1c22;">
                    <tr>
                        <th style="padding: 12px; color: #aaa;">${window.t('colRank')}</th>
                        <th style="padding: 12px; color: #aaa;">${window.t('colFan')}</th>
                        <th style="padding: 12px; color: #aaa;">${window.t('colPoints')}</th>
                        <th style="padding: 12px; color: #aaa;">${window.t('colActivity')}</th>
                    </tr>
                </thead>
                <tbody>${fansTableRows}</tbody>
            </table>
        </div>
    `;
}

// 👛 9. المحفظة (TON Connect)
window.renderWalletPage = function(container) {
    if (userState.walletConnected && userState.walletAddress) {
        const shortAddress = `${userState.walletAddress.slice(0, 6)}...${userState.walletAddress.slice(-6)}`;
        container.innerHTML = `
            <div style="background: linear-gradient(145deg, #16161a, #1c1c22); border: 1px solid rgba(76, 175, 80, 0.4); border-radius: 20px; padding: 30px 20px; text-align: center;">
                <div style="font-size: 3.5rem;">💎</div>
                <h3 style="color: #4caf50; margin: 10px 0;">${window.t('walletConnected')}</h3>
                <div style="background: #0d0d11; padding: 12px; border-radius: 10px; border: 1px solid #22222a; margin: 20px 0;">
                    <span style="font-family: monospace; font-size: 0.9rem; color: #0088cc; font-weight: bold;">${shortAddress}</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.02); padding: 15px; border-radius: 12px; margin-bottom: 25px;">
                    <span style="font-size: 0.8rem; color: #777788; display: block; margin-bottom: 5px;">${window.t('walletBalance')}</span>
                    <h2 style="margin: 0; font-size: 2.2rem; color: #fff; font-weight: bold;">${userState.walletBalance} TON</h2>
                </div>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="copyToClipboard('${userState.walletAddress}')" style="flex: 1; border: none; padding: 12px; border-radius: 10px; font-weight: bold; background: #2b2b36; color: #fff; cursor: pointer;">${window.t('btnCopyAddress')}</button>
                    <button onclick="triggerDisconnect()" style="flex: 1; border: none; padding: 12px; border-radius: 10px; font-weight: bold; background: rgba(244, 67, 54, 0.15); color: #f44336; border: 1px solid rgba(244, 67, 54, 0.3); cursor: pointer;">${window.t('btnDisconnect')}</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="background: linear-gradient(145deg, #16161a, #1c1c22); border: 1px solid #25252d; border-radius: 20px; padding: 30px 20px; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 15px;">👛</div>
                <h3 style="color: #fff;">${window.t('walletConnectTitle')}</h3>
                <p style="color: #aaa; font-size: 0.9rem; line-height: 1.5; margin-bottom: 30px;">${window.t('walletConnectSub')}</p>
                <button onclick="triggerConnect()" style="background: linear-gradient(135deg, #0088cc, #005580); color: white; border: none; padding: 14px 28px; border-radius: 25px; font-size: 1rem; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 20px rgba(0, 136, 204, 0.4);">
                    ${window.t('btnConnect')}
                </button>
            </div>
        `;
    }
}

window.triggerConnect = function() {
    if (tonConnectUI) tonConnectUI.openModal().catch(err => console.error("Error", err));
}

window.triggerDisconnect = function() {
    if (tonConnectUI && tonConnectUI.connected) {
        if(confirm(window.t('alertDisconnect'))) {
            tonConnectUI.disconnect().then(() => {
                alert(window.t('alertDisconnected'));
                window.showPage('wallet');
            });
        }
    }
}
