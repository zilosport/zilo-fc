// ==========================================
// 🚀 تطبيق زيلو إف سي (Zelo Sport) - الكود الأساسي (app.js)
// ملاحظة: يتم تحميل `i18n` و `clubsData` من ملف `data.js`
// ملاحظة: تم نقل المهام إلى tasks.js والترتيب إلى leaderboard.js
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
    tasks: [
        { id: "x", textAr: "متابعة حساب Zelo Sport على X", textEn: "Follow Zelo Sport on X", points: 500, completed: false, url: "https://x.com" },
        { id: "tg_channel", textAr: "الانضمام لقناة تليجرام", textEn: "Join Telegram Channel", points: 400, completed: false, url: "https://t.me" },
        { id: "youtube", textAr: "الاشتراك في اليوتيوب", textEn: "Subscribe on YouTube", points: 600, completed: false, url: "https://youtube.com" },
        { id: "tg_group_ar", textAr: "الانضمام للمجموعة العربية", textEn: "Join Arabic Group", points: 300, completed: false, url: "https://t.me/YourArabicGroupLink" },
        { id: "tg_group_en", textAr: "الانضمام للمجموعة الأجنبية", textEn: "Join Global Group", points: 300, completed: false, url: "https://t.me/YourEnglishGroupLink" }
    ]
};

const clubFansLeaderboard = {};

let tonConnectUI = null;
const tg = window.Telegram?.WebApp;

// 4. دوال مساعدة للترجمة
function t(key) {
    return i18n[userState.lang][key] || key;
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
    } else if (!userState.hasLoggedIn) {
        renderLoginScreen();
    }
}

// 5. تهيئة التطبيق (سحب بيانات تليجرام)
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

    try {
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
            if (userState.hasLoggedIn && document.querySelector(".nav-item[onclick*='wallet']").classList.contains("active")) {
                renderWalletPage(document.getElementById("main-content"));
            }
        });
    } catch (error) {
        console.error("TON Connect Error: ", error);
    }

    // التحقق من أن المستخدم اختار أندية أم لا
    if (!userState.selectedClubs || userState.selectedClubs.length === 0) {
        renderLoginScreen();
    } else {
        userState.hasLoggedIn = true;
        updateTopBar();
        showPage('home'); 
    }
    
    injectLangButton();
});

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

// 📱 6. شاشة تسجيل الدخول (نظام اختيار الدول والأندية المتعددة)
window.tempSelectedClubs = window.tempSelectedClubs || []; // مصفوفة مؤقتة لحفظ الاختيارات قبل التأكيد

function getFloatingButton() {
    if (window.tempSelectedClubs.length === 0) return '';
    return `
        <div onclick="confirmLogin()" style="position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%); background: linear-gradient(135deg, #4caf50, #2e7d32); color: white; padding: 14px 30px; border-radius: 30px; font-weight: bold; font-size: 1.1rem; cursor: pointer; box-shadow: 0 5px 15px rgba(0,0,0,0.5); z-index: 9999; display: flex; align-items: center; gap: 10px; width: 80%; justify-content: center;">
            ${userState.lang === 'ar' ? 'تأكيد الدخول' : 'Confirm Login'} (${window.tempSelectedClubs.length}/2) ✅
        </div>
    `;
}

function renderLoginScreen() {
    if (document.querySelector('.top-bar')) document.querySelector('.top-bar').style.display = 'none';
    if (document.querySelector('.bottom-nav')) document.querySelector('.bottom-nav').style.display = 'none';

    const mainContent = document.getElementById("main-content");
    
    const clubsByCountry = {};
    clubsData.forEach(club => {
        if(!clubsByCountry[club.countryFlag]) clubsByCountry[club.countryFlag] = [];
        clubsByCountry[club.countryFlag].push(club);
    });

    const countryNames = {
        "🏴󠁧󠁢󠁥󠁮󠁧󠁿": {ar: "إنجلترا", en: "England"}, "🇪🇸": {ar: "إسبانيا", en: "Spain"}, "🇩🇪": {ar: "ألمانيا", en: "Germany"},
        "🇮🇹": {ar: "إيطاليا", en: "Italy"}, "🇫🇷": {ar: "فرنسا", en: "France"}, "🇧🇷": {ar: "البرازيل", en: "Brazil"},
        "🇦🇷": {ar: "الأرجنتين", en: "Argentina"}, "🇵🇹": {ar: "البرتغال", en: "Portugal"}, "🇳🇱": {ar: "هولندا", en: "Netherlands"},
        "🇧🇪": {ar: "بلجيكا", en: "Belgium"}, "🇺🇾": {ar: "الأوروغواي", en: "Uruguay"}, "🇨🇴": {ar: "كولومبيا", en: "Colombia"},
        "🇲🇽": {ar: "المكسيك", en: "Mexico"}, "🇺🇸": {ar: "أمريكا", en: "USA"}, "🇨🇦": {ar: "كندا", en: "Canada"},
        "🇯🇵": {ar: "اليابان", en: "Japan"}, "🇰🇷": {ar: "كوريا الجنوبية", en: "South Korea"}, "🇸🇦": {ar: "السعودية", en: "Saudi Arabia"},
        "🇦🇪": {ar: "الإمارات", en: "UAE"}, "🇸🇾": {ar: "سوريا", en: "Syria"}, "🇶🇦": {ar: "قطر", en: "Qatar"},
        "🇲🇦": {ar: "المغرب", en: "Morocco"}, "🇪🇬": {ar: "مصر", en: "Egypt"}, "🇹🇳": {ar: "تونس", en: "Tunisia"},
        "🇩🇿": {ar: "الجزائر", en: "Algeria"}, "🇮🇷": {ar: "إيران", en: "Iran"}, "🇮🇶": {ar: "العراق", en: "Iraq"},
        "🇦🇺": {ar: "أستراليا", en: "Australia"}, "🇭🇷": {ar: "كرواتيا", en: "Croatia"}, "🇨🇭": {ar: "سويسرا", en: "Switzerland"},
        "🇩🇰": {ar: "الدنمارك", en: "Denmark"}, "🇵🇱": {ar: "بولندا", en: "Poland"}, "🇷🇸": {ar: "صربيا", en: "Serbia"},
        "🇦🇹": {ar: "النمسا", en: "Austria"}, "🇹🇷": {ar: "تركيا", en: "Turkey"}, "🇬🇷": {ar: "اليونان", en: "Greece"},
        "🇸🇪": {ar: "السويد", en: "Sweden"}, "🇳🇴": {ar: "النرويج", en: "Norway"}, "🇭🇺": {ar: "المجر", en: "Hungary"},
        "🇪🇨": {ar: "الإكوادور", en: "Ecuador"}, "🇨🇱": {ar: "تشيلي", en: "Chile"}, "🇵🇾": {ar: "باراغواي", en: "Paraguay"},
        "🇵🇪": {ar: "بيرو", en: "Peru"}, "🇳🇬": {ar: "نيجيريا", en: "Nigeria"}, "🇬🇭": {ar: "غانا", en: "Ghana"},
        "🇸🇳": {ar: "السنغال", en: "Senegal"}, "🇨🇲": {ar: "الكاميرون", en: "Cameroon"}, "🇨🇮": {ar: "ساحل العاج", en: "Ivory Coast"}
    };

    function getCountryName(flag) {
        if(countryNames[flag]) return userState.lang === 'ar' ? countryNames[flag].ar : countryNames[flag].en;
        return (userState.lang === 'ar' ? "دوري " : "League ") + flag;
    }

    let countriesHtml = Object.keys(clubsByCountry).map(flag => `
        <div onclick="showClubsForCountry('${flag}')" style="background: #1c1c22; border: 1px solid #25252d; padding: 15px; border-radius: 12px; display: flex; align-items: center; justify-content: space-between; cursor: pointer; margin-bottom: 10px; transition: 0.2s;">
            <div style="display: flex; align-items: center; gap: 12px;">
                <span style="font-size: 1.8rem;">${flag}</span>
                <h4 style="margin: 0; color: #fff; font-size: 1.1rem;">${getCountryName(flag)}</h4>
            </div>
            <span style="background: #2b2b36; padding: 4px 10px; border-radius: 20px; font-size: 0.8rem; color: #0088cc; font-weight: bold;">
                ${clubsByCountry[flag].length} ⚽
            </span>
        </div>
    `).join('');

    mainContent.innerHTML = `
        <div style="padding: 20px 10px; text-align: center; max-width: 500px; margin: 0 auto; padding-bottom: 100px;">
            <div style="font-size: 3.5rem; margin-bottom: 10px;">🌍</div>
            <h2 style="color: #fff; margin: 0 0 5px 0;">${t('welcomeTitle')}</h2>
            <p style="color: #4caf50; font-size: 0.95rem; font-weight: bold; margin-bottom: 20px;">
                ${userState.lang === 'ar' ? 'اختر فريقين كحد أقصى (محلي وعالمي)' : 'Select up to 2 clubs (Local & Global)'}
            </p>

            <div style="display: flex; flex-direction: column; text-align: ${userState.lang === 'ar' ? 'right' : 'left'}; max-height: 65vh; overflow-y: auto; padding-right: 5px;">
                ${countriesHtml}
            </div>
        </div>
        ${getFloatingButton()}
    `;

    window.showClubsForCountry = function(flag) {
        let clubs = clubsByCountry[flag];
        let clubsHtml = clubs.map(club => {
            let isSelected = window.tempSelectedClubs.includes(club.id);
            let borderStyle = isSelected ? 'border: 2px solid #4caf50; background: rgba(76, 175, 80, 0.1);' : 'border: 1px solid #25252d; background: #1c1c22;';
            return `
            <div onclick="toggleClubSelection('${club.id}', '${flag}')" style="${borderStyle} padding: 12px; border-radius: 12px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 8px; cursor: pointer; transition: 0.2s; position: relative;">
                ${isSelected ? '<div style="position: absolute; top: 5px; right: 5px; background: #4caf50; color: white; border-radius: 50%; width: 22px; height: 22px; font-size: 14px; display: flex; align-items: center; justify-content: center; z-index: 10;">✓</div>' : ''}
                <div style="position: relative;">
                    <img src="${club.logo}" alt="" onerror="this.style.display='none'" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0px 2px 4px rgba(0,0,0,0.5));">
                </div>
                <h4 style="margin: 0; color: #fff; font-size: 0.85rem; text-align: center;">${getClubName(club)}</h4>
            </div>
        `}).join('');

        mainContent.innerHTML = `
            <div style="padding: 20px 10px; text-align: center; max-width: 500px; margin: 0 auto; padding-bottom: 100px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                    <button onclick="renderLoginScreen()" style="background: #2b2b36; color: white; border: none; padding: 8px 16px; border-radius: 8px; cursor: pointer; font-weight: bold; display: flex; align-items: center; gap: 5px;">
                        ${userState.lang === 'ar' ? '⬅ رجوع' : 'Back ➡'}
                    </button>
                    <h3 style="color: #fff; margin: 0; display: flex; align-items: center; gap: 8px;">
                        ${flag} ${getCountryName(flag)}
                    </h3>
                </div>

                <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px; max-height: 65vh; overflow-y: auto; padding-right: 5px;">
                    ${clubsHtml}
                </div>
            </div>
            ${getFloatingButton()}
        `;
    }
}

// دالة اختيار أو إلغاء اختيار النادي
window.toggleClubSelection = function(clubId, flag) {
    const index = window.tempSelectedClubs.indexOf(clubId);
    
    if (index > -1) {
        window.tempSelectedClubs.splice(index, 1); 
    } else {
        if (window.tempSelectedClubs.length >= 2) {
            alert(userState.lang === 'ar' ? "يمكنك اختيار ناديين كحد أقصى!" : "You can only select up to 2 clubs!");
            return;
        }
        window.tempSelectedClubs.push(clubId); 
    }
    
    if (flag) showClubsForCountry(flag); else renderLoginScreen();
}

// زر تأكيد الدخول
window.confirmLogin = function() {
    if (window.tempSelectedClubs.length === 0) return;
    
    userState.selectedClubs = [...window.tempSelectedClubs];
    userState.hasLoggedIn = true;

    if (document.querySelector('.top-bar')) document.querySelector('.top-bar').style.display = 'flex';
    if (document.querySelector('.bottom-nav')) document.querySelector('.bottom-nav').style.display = 'flex';

    toggleLanguage(); 
    toggleLanguage(); 

    updateTopBar();
    showPage('home');
}

function updateTopBar() {
    const pointsEl = document.getElementById("points");
    const clubEl = document.getElementById("club");
    
    if(pointsEl) pointsEl.innerText = `${t('coins')} ${userState.points.toLocaleString()}`;
    
    if (clubEl && userState.selectedClubs && userState.selectedClubs.length > 0) {
        let logos = userState.selectedClubs.map(id => {
            const club = clubsData.find(c => c.id === id);
            return club ? `<img src="${club.logo}" style="height: 20px; vertical-align: middle; margin: 0 4px; object-fit: contain;">` : '';
        }).join('');
        
        clubEl.innerHTML = `<span style="color:#aaa;">${userState.lang === 'ar' ? 'أنديتك:' : 'Clubs:'}</span> ${logos}`;
    }
}

function showPage(pageId) {
    if(!userState.hasLoggedIn) return; 
    document.querySelectorAll(".nav-item").forEach(el => el.classList.remove("active"));
    const activeNav = Array.from(document.querySelectorAll(".nav-item")).find(el => el.getAttribute("onclick").includes(pageId));
    if (activeNav) activeNav.classList.add("active");

    const contentDiv = document.getElementById("main-content");
    if (!contentDiv) return;
    contentDiv.innerHTML = ""; 

    switch(pageId) {
        case 'home': renderHomePage(contentDiv); break;
        case 'tasks': renderTasksPage(contentDiv); break;
        case 'friends': renderFriendsPage(contentDiv); break;
        case 'leaderboard': renderLeaderboardPage(contentDiv); break;
        case 'wallet': renderWalletPage(contentDiv); break;
    }
}

// 🏠 7. الرئيسية (تدعم عرض ناديين)
function renderHomePage(container) {
    let selectedClubsData = userState.selectedClubs.map(id => clubsData.find(c => c.id === id)).filter(Boolean);
    if(selectedClubsData.length === 0) selectedClubsData = [clubsData[0]]; 
    
    const primaryClub = selectedClubsData[0]; 
    
    let fallbackAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(userState.username)}&background=1c1c22&color=0088cc&size=128&bold=true`;
    let avatarSrc = userState.photoUrl ? userState.photoUrl : fallbackAvatar;

    const profileBgStyle = `background: linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.8)), url('${primaryClub.logo}'); background-size: cover; background-position: center; border: 1px solid ${primaryClub.color || '#25252d'};`;

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
                    ${club.points.toLocaleString()} 🏆
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

// 👥 9. الأصدقاء
function renderFriendsPage(container) {
    const referralLink = `https://t.me/ZeloSport_Bot/app?startapp=ref_${userState.userParam}`;
    let friendsListHtml = userState.referrals.map(friend => `
        <div style="display: flex; justify-content: space-between; background: #1c1c22; padding: 12px; border-radius: 10px; margin: 6px 0; border: 1px solid #25252d;">
            <span style="color: #fff; font-weight: bold;">👤 ${friend.name}</span>
            <span style="color: #0088cc; font-size: 0.85rem;">${t('invites')} ${friend.referralsCount} | +500 ZILOFC</span>
        </div>
    `).join('');

    container.innerHTML = `
        <h3>${t('referralTitle')}</h3>
        <p style="color: #aaa; font-size: 0.85rem;">${t('referralSub')}</p>
        
        <div style="background: #16161a; border: 1px dashed #334; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <p style="color:#0088cc; font-family:monospace; font-size:0.8rem; word-break:break-all; margin:0 0 12px 0;">${referralLink}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="copyToClipboard('${referralLink}')" style="flex:1; padding:10px; border-radius:8px; border:none; background:#4caf50; color:white; font-weight:bold; cursor:pointer;">${t('btnCopy')}</button>
                <button onclick="shareOnTelegram('${referralLink}')" style="flex:1; padding:10px; border-radius:8px; border:none; background:#0088cc; color:white; font-weight:bold; cursor:pointer;">${t('btnShare')}</button>
            </div>
        </div>

        <h4 style="color:#fff;">${t('friendsList')} (${userState.referrals.length})</h4>
        <div>${friendsListHtml}</div>
    `;
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => alert(t('alertCopied')));
}

function shareOnTelegram(link) {
    const text = encodeURIComponent(t('shareText'));
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
    if (tg && tg.openTelegramLink) tg.openTelegramLink(shareUrl); else window.open(shareUrl, '_blank');
}

// 👛 10. المحفظة
function renderWalletPage(container) {
    if (userState.walletConnected) {
        const shortAddress = `${userState.walletAddress.slice(0, 6)}...${userState.walletAddress.slice(-6)}`;
        container.innerHTML = `
            <div style="background: linear-gradient(145deg, #16161a, #1c1c22); border: 1px solid rgba(76, 175, 80, 0.4); border-radius: 20px; padding: 30px 20px; text-align: center;">
                <div style="font-size: 3.5rem;">💎</div>
                <h3 style="color: #4caf50; margin: 10px 0;">${t('walletConnected')}</h3>
                <div style="background: #0d0d11; padding: 12px; border-radius: 10px; border: 1px solid #22222a; margin: 20px 0;">
                    <span style="font-family: monospace; font-size: 0.9rem; color: #0088cc; font-weight: bold;">${shortAddress}</span>
                </div>
                <div style="background: rgba(255, 255, 255, 0.02); padding: 15px; border-radius: 12px; margin-bottom: 25px;">
                    <span style="font-size: 0.8rem; color: #777788; display: block; margin-bottom: 5px;">${t('walletBalance')}</span>
                    <h2 style="margin: 0; font-size: 2.2rem; color: #fff; font-weight: bold;">${userState.walletBalance} TON</h2>
                </div>
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <button onclick="copyToClipboard('${userState.walletAddress}')" style="flex: 1; border: none; padding: 12px; border-radius: 10px; font-weight: bold; background: #2b2b36; color: #fff; cursor: pointer;">${t('btnCopyAddress')}</button>
                    <button onclick="triggerDisconnect()" style="flex: 1; border: none; padding: 12px; border-radius: 10px; font-weight: bold; background: rgba(244, 67, 54, 0.15); color: #f44336; border: 1px solid rgba(244, 67, 54, 0.3); cursor: pointer;">${t('btnDisconnect')}</button>
                </div>
            </div>
        `;
    } else {
        container.innerHTML = `
            <div style="background: linear-gradient(145deg, #16161a, #1c1c22); border: 1px solid #25252d; border-radius: 20px; padding: 30px 20px; text-align: center;">
                <div style="font-size: 4rem; margin-bottom: 15px;">👛</div>
                <h3 style="color: #fff;">${t('walletConnectTitle')}</h3>
                <p style="color: #aaa; font-size: 0.9rem; line-height: 1.5; margin-bottom: 30px;">${t('walletConnectSub')}</p>
                <button onclick="triggerConnect()" style="background: linear-gradient(135deg, #0088cc, #005580); color: white; border: none; padding: 14px 28px; border-radius: 25px; font-size: 1rem; font-weight: bold; cursor: pointer; display: inline-flex; align-items: center; gap: 10px; box-shadow: 0 4px 20px rgba(0, 136, 204, 0.4);">
                    ${t('btnConnect')}
                </button>
            </div>
        `;
    }
}

function triggerConnect() {
    if (tonConnectUI) tonConnectUI.openModal().catch(err => console.error("Error", err));
}

function triggerDisconnect() {
    if (tonConnectUI && tonConnectUI.connected) {
        if(confirm(t('alertDisconnect'))) {
            tonConnectUI.disconnect().then(() => {
                alert(t('alertDisconnected'));
                showPage('wallet');
            });
        }
    }
}
