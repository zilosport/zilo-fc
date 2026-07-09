// ==========================================
// 🚀 تطبيق زيلو إف سي (Zelo FC) - الكود الأساسي (app.js)
// ==========================================

// 1. إعداد الاتصال بقاعدة بيانات Supabase
const supabaseUrl = 'https://ttyfcwtlasvphkariqhw.supabase.co/rest/v1/'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eWZjd3RsYXN2cGhrYXJpcWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxODk1MjYsImV4cCI6MjA5ODc2NTUyNn0.m3wFMEASM3K63nm3bsIlrEOXhRvMQhUZqvpXyFq7NEg'; 
const supabase = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey) : null;

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

// 5. تهيئة التطبيق (مُحدثة لتدعم Supabase)
document.addEventListener("DOMContentLoaded", async () => {
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

            // تحديث المحفظة في الواجهة وقاعدة البيانات
            tonConnectUI.onStatusChange(async (walletInfo) => {
                if (walletInfo) {
                    userState.walletConnected = true;
                    userState.walletAddress = walletInfo.account.address;
                    userState.walletBalance = "0.00"; 
                    
                    if (supabase && userState.hasLoggedIn) {
                        await supabase.from('users').update({ wallet_address: userState.walletAddress }).eq('telegram_id', userState.userId);
                    }
                } else {
                    userState.walletConnected = false;
                    userState.walletAddress = null;
                    userState.walletBalance = "0.00";

                    if (supabase && userState.hasLoggedIn) {
                        await supabase.from('users').update({ wallet_address: null }).eq('telegram_id', userState.userId);
                    }
                }
                
                if (userState.hasLoggedIn && document.querySelector(".nav-item[onclick*='wallet']")?.classList.contains("active")) {
                    if(typeof renderWalletPage === "function") renderWalletPage(document.getElementById("main-content"));
                }
            });
        }
    } catch (error) {
        console.error("TON Connect Error: ", error);
    }

    // 🔄 جلب بيانات المستخدم الحقيقية من قاعدة البيانات
    if (supabase && userState.userId !== "غير معروف") {
        try {
            const { data, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', userState.userId)
                .single();

            if (data) {
                userState.points = data.points || 0;
                userState.selectedClubs = data.selected_clubs || [];
                userState.lang = data.lang || userState.lang;
                userState.hasLoggedIn = true;
                
                if (data.wallet_address) {
                    userState.walletAddress = data.wallet_address;
                    userState.walletConnected = true;
                }
            }
        } catch (error) {
            console.error("خطأ في جلب بيانات المستخدم:", error);
        }
    }

    // التوجيه: إما لشاشة تسجيل الدخول أو الشاشة الرئيسية
    if (!userState.hasLoggedIn || !userState.selectedClubs || userState.selectedClubs.length === 0) {
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
            let foundClub = null;
            if (typeof allWorldCupCountriesClubs !== 'undefined') {
                for (const country in allWorldCupCountriesClubs) {
                    const club = allWorldCupCountriesClubs[country].find(c => c.id === id);
                    if (club) {
                        foundClub = club;
                        break;
                    }
                }
            }
            return foundClub ? `<img src="${foundClub.logo}" style="height: 20px; vertical-align: middle; margin: 0 4px; object-fit: contain;">` : '';
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
