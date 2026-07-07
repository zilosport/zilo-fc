// ==========================================
// 🚀 تطبيق زيلو إف سي (Zelo Sport) - الكود الأساسي (app.js)
// ==========================================

// 2. إدارة بيانات المستخدم
let userState = {
    username: "Zelo Sport",
    userParam: "", 
    userId: "",
    photoUrl: null,
    points: 0, 
    selectedClubs: [], 
    walletConnected: false,
    walletAddress: null,
    walletBalance: "0.00",
    hasLoggedIn: false,
    lang: "ar",
    referrals: [], 
    dailyCheckInClaimed: false,
    tasks: typeof defaultTasksData !== "undefined" ? defaultTasksData.map(task => ({...task})) : [] 
};

let tonConnectUI = null;
const tg = window.Telegram?.WebApp;

// 4. دوال مساعدة للترجمة
function t(key) {
    return typeof i18n !== 'undefined' && i18n[userState.lang] && i18n[userState.lang][key] ? i18n[userState.lang][key] : key;
}

function getClubName(club) {
    return userState.lang === 'ar' ? club.nameAr : club.nameEn;
}

function getTaskName(task) {
    return userState.lang === 'ar' ? task.textAr : task.textEn;
}

// تغيير لغة التطبيق بالكامل
function toggleLanguage() {
    userState.lang = userState.lang === 'ar' ? 'en' : 'ar';
    document.documentElement.dir = userState.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = userState.lang;
    
    const navItems = document.querySelectorAll('.nav-item span:not(.icon)');
    if (navItems.length >= 5) {
        navItems[0].innerText = t('navHome');
        navItems[1].innerText = t('navTasks');
        navItems[2].innerText = t('navFriends');
        navItems[3].innerText = t('navLeaderboard');
        navItems[4].innerText = t('navWallet');
    }
    
    updateTopBar();
    const activeNav = document.querySelector(".nav-item.active");
    if (activeNav) {
        const pageId = activeNav.getAttribute("onclick").match(/'([^']+)'/)[1];
        showPage(pageId);
    } else if (!userState.hasLoggedIn && typeof renderLoginScreen === 'function') {
        renderLoginScreen();
    }
}

function injectLangButton() {
    const topBar = document.querySelector('.top-bar');
    if(topBar && !document.getElementById('lang-btn')) {
        const langBtn = document.createElement('div');
        langBtn.id = 'lang-btn';
        langBtn.innerHTML = '🌐';
        langBtn.style.cssText = 'position:fixed; top:15px; left:50%; transform:translateX(-50%); font-size:1.5rem; cursor:pointer; z-index:9999;';
        langBtn.onclick = toggleLanguage;
        document.body.appendChild(langBtn);
    }
}

// 5. تهيئة التطبيق
document.addEventListener("DOMContentLoaded", () => {
    if (typeof window.Telegram !== "undefined" && window.Telegram.WebApp) {
        const tg = window.Telegram.WebApp;
        tg.ready();
        tg.expand();
        
        if (tg.initDataUnsafe && tg.initDataUnsafe.user) {
            const tgUser = tg.initDataUnsafe.user;
            userState.username = tgUser.username ? `@${tgUser.username}` : `${tgUser.first_name} ${tgUser.last_name || ''}`.trim();
            userState.userId = tgUser.id;
            userState.userParam = tgUser.username || tgUser.id;
            
            if (tgUser.photo_url) {
                userState.photoUrl = tgUser.photo_url;
            }
            
            if (tgUser.language_code && tgUser.language_code.startsWith('en')) {
                userState.lang = 'en';
            }
        } else {
            userState.username = "مستخدم تليجرام";
            userState.userId = "غير معروف";
        }
    }

    document.documentElement.dir = userState.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = userState.lang;

    // إعداد TON Connect
    try {
        if (typeof TON_CONNECT_UI !== 'undefined') {
            tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                manifestUrl: 'https://zelo-sport-fc.github.io/zelo-fc/tonconnect-manifest.json',
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
                if (userState.hasLoggedIn && document.querySelector(".nav-item[onclick*='wallet']")?.classList.contains("active")) {
                    if(typeof renderWalletPage === "function") renderWalletPage(document.getElementById("main-content"));
                }
            });
        }
    } catch (error) {
        console.error("TON Connect Error: ", error);
    }

    if (!userState.selectedClubs || userState.selectedClubs.length === 0) {
        if(typeof renderLoginScreen === 'function') renderLoginScreen();
    } else {
        userState.hasLoggedIn = true;
        updateTopBar();
        showPage('home'); 
    }
    
    injectLangButton();
});

// 🔄 التوجيه وتحديث الواجهة الأساسية (Routing & UI Updates)
function updateTopBar() {
    const pointsEl = document.getElementById("points");
    const clubEl = document.getElementById("club");
    
    if(pointsEl) pointsEl.innerText = `${t('coins')} ${userState.points.toLocaleString()}`;
    
    if (clubEl && userState.selectedClubs && userState.selectedClubs.length > 0) {
        let logos = userState.selectedClubs.map(id => {
            const club = typeof clubsData !== 'undefined' ? clubsData.find(c => c.id === id) : null;
            return club ? `<img src="${club.logo}" style="height: 20px; vertical-align: middle; margin: 0 4px; object-fit: contain;">` : '';
        }).join('');
        
        clubEl.innerHTML = `<span style="color:#aaa;">${userState.lang === 'ar' ? 'أنديتك:' : 'Clubs:'}</span> ${logos}`;
    }
}

function showPage(pageId) {
    if(!userState.hasLoggedIn) return; 
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    const activeNav = Array.from(document.querySelectorAll(".nav-item")).find(el => el.getAttribute("onclick")?.includes(pageId));
    if (activeNav) activeNav.classList.add("active");

    const contentDiv = document.getElementById("main-content");
    if (!contentDiv) return;
    contentDiv.innerHTML = ""; 

    switch(pageId) {
        case 'home': 
            if(typeof renderHomePage === "function") renderHomePage(contentDiv); 
            break;
        case 'tasks': 
            if(typeof renderTasksPage === "function") renderTasksPage(contentDiv); 
            break;
        case 'friends':
            if(typeof renderFriendsPage === "function") renderFriendsPage(contentDiv);
            break;
        case 'leaderboard': 
            if(typeof renderLeaderboardPage === "function") renderLeaderboardPage(contentDiv); 
            break;
        case 'wallet': 
            if(typeof renderWalletPage === "function") renderWalletPage(contentDiv); 
            break;
    }
}

// 🏠 7. الرئيسية (مؤقتاً هنا حتى تقوم بفصلها لاحقاً في home.js)
function renderHomePage(container) {
    let selectedClubsData = userState.selectedClubs.map(id => typeof clubsData !== 'undefined' ? clubsData.find(c => c.id === id) : null).filter(Boolean);
    if(selectedClubsData.length === 0 && typeof clubsData !== 'undefined') selectedClubsData = [clubsData[0]];
    
    const primaryClub = selectedClubsData[0];
    
    let fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.username)}&background=1c1c22&color=0088cc&size=128&bold=true`;
    let avatarSrc = userState.photoUrl ? userState.photoUrl : fallbackAvatar;

    const profileBgStyle = primaryClub ? `background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('${primaryClub.logo}'); background-size: cover; background-position: center; border: 1px solid ${primaryClub.color || '#25252d'};` : 'background: #1c1c22;';

    let clubsCardsHtml = selectedClubsData.map(club => `
        <div style="background: #1c1c22; border: 1px solid #25252d; border-radius: 16px; padding: 15px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 15px;">
            <div style="display: flex; align-items: center; gap: 15px;">
                <img src="${club.logo}" onerror="this.style.display='none'" style="width: 50px; height: 50px; object-fit: contain;">
                <div>
                    <h3 style="margin: 0; color: #fff; font-size: 1.2rem;">${getClubName(club)} ${club.countryFlag}</h3>
                </div>
            </div>
            <div>
                <span style="background: rgba(255, 215, 0, 0.2); color: #ffd700; padding: 5px 10px; border-radius: 8px; font-weight: bold; font-size: 0.85rem;">
                    ${club.points ? club.points.toLocaleString() : '0'} 🏆
                </span>
            </div>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="profile-section" style="${profileBgStyle} padding: 25px 15px; border-radius: 16px; text-align: center; margin-bottom: 20px; box-shadow: 0 4px 15px rgba(0,0,0,0.3);">
            <div class="avatar-container" style="position: relative; display: inline-block;">
                <img id="user-avatar" src="${avatarSrc}" onerror="this.src='${fallbackAvatar}'" style="width: 80px; height: 80px; border-radius: 50%; border: 3px solid #fff; object-fit: cover; box-shadow: 0 0 10px rgba(0,0,0,0.5);">
                <span class="verified-badge" style="position: absolute; bottom: 0; ${userState.lang === 'ar' ? 'left: 0;' : 'right: 0;'} background: #0088cc; color: #fff; width: 22px; height: 22px; line-height: 22px; border-radius: 50%; font-size: 0.8rem; border: 2px solid #fff;">✓</span>
            </div>
            <h3 id="profile-name" class="user-title" style="margin: 10px 0 2px 0; color: #fff; font-size: 1.3rem; text-shadow: 1px 1px 3px #000;">${userState.username}</h3>
            <p id="profile-id" class="user-id" style="margin: 0; color: rgba(255,255,255,0.8); font-size: 0.85rem; font-family: monospace; text-shadow: 1px 1px 2px #000;">ID: ${userState.userId}</p>
        </div>

        <h4 style="color: #aaa; margin: 0 0 10px 0; font-size: 0.9rem;">${userState.lang === 'ar' ? 'أنديتك المفضلة:' : 'Your Supported Clubs:'}</h4>
        ${clubsCardsHtml}
    `;
}
