// ==========================================
// 🚀 تطبيق زيلو إف سي (ZELO FC) - الكود الأساسي (app.js) المحُدّث والنهائي
// ==========================================

// 1. إعداد الاتصال بقاعدة بيانات Supabase
const supabaseUrl = 'https://ttyfcwtlasvphkariqhw.supabase.co'; 
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR0eWZjd3RsYXN2cGhrYXJpcWh3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODMxODk1MjYsImV4cCI6MjA5ODc2NTUyNn0.m3wFMEASM3K63nm3bsIlrEOXhRvMQhUZqvpXyFq7NEg'; 
const supabaseClient = window.supabase ? window.supabase.createClient(supabaseUrl, supabaseKey, {
    db: { schema: 'public' }
}) : null;

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
    lang: "ar", // اللغة الافتراضية
    referrals: [], 
    dailyCheckInClaimed: false,
    pendingReferrer: null, 
    tasks: typeof window.defaultTasksData !== "undefined" ? window.defaultTasksData.map(task => ({...task})) : [] 
};

let tonConnectUI = null;
const tg = window.Telegram?.WebApp;

// 3. دوال مساعدة للترجمة واسترجاع الأسماء
function t(key) {
    return typeof i18n !== 'undefined' && i18n[userState.lang] && i18n[userState.lang][key] ? i18n[userState.lang][key] : key;
}

function getClubName(club) {
    return userState.lang === 'ar' ? club.nameAr : club.nameEn;
}

function getTaskName(task) {
    return userState.lang === 'ar' ? task.textAr : task.textEn;
}

function applyLanguageSettings() {
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
}

// ==========================================
// 🚀 4. تهيئة التطبيق
// ==========================================

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

            if (tg.initDataUnsafe.start_param && tg.initDataUnsafe.start_param.startsWith('ref_')) {
                const referrerId = tg.initDataUnsafe.start_param.replace('ref_', '');
                if (String(referrerId) !== String(userState.userId)) {
                    userState.pendingReferrer = referrerId;
                    console.log("🔗 تم الدخول عبر رابط إحالة من الصديق:", referrerId);
                }
            }

        } else {
            console.warn("⚠️ لم يتم العثور على بيانات تليجرام حقيقية. استخدام بيانات وهمية للاختبار...");
            userState.username = "Local Tester";
            userState.userId = "123456789"; 
            userState.userParam = "123456789";
        }
    }

    applyLanguageSettings();
    initTonConnect();
    fetchDataAndRoute();
});

// ==========================================
// 🔄 دالة تهيئة المحفظة
// ==========================================
function initTonConnect() {
    try {
        if (typeof TON_CONNECT_UI !== 'undefined') {
            tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
                manifestUrl: 'https://zelo-sport-fc.github.io/zelo-fc/tonconnect-manifest.json',
                buttonRootId: null
            });

            tonConnectUI.onStatusChange(async (walletInfo) => {
                if (walletInfo) {
                    userState.walletConnected = true;
                    userState.walletAddress = walletInfo.account.address;
                    userState.walletBalance = "0.00"; 
                    
                    if (typeof window.saveWalletAddressToDB === "function") {
                        await window.saveWalletAddressToDB(walletInfo.account.address);
                    } else if (supabaseClient && userState.userId) {
                        const { error } = await supabaseClient.from('users')
                            .update({ wallet_address: walletInfo.account.address })
                            .eq('telegram_id', userState.userId);
                        if (error) console.error("❌ خطأ في حفظ المحفظة:", error);
                        else console.log("✅ تم حفظ المحفظة بنجاح!");
                    }
                } else {
                    userState.walletConnected = false;
                    userState.walletAddress = null;
                    userState.walletBalance = "0.00";

                    if (typeof window.removeWalletAddressFromDB === "function") {
                        await window.removeWalletAddressFromDB();
                    } else if (supabaseClient && userState.userId) {
                        await supabaseClient.from('users')
                            .update({ wallet_address: null })
                            .eq('telegram_id', userState.userId);
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
}

// 🔄 دالة جلب البيانات والتوجيه
async function fetchDataAndRoute() {
    console.log("🔄 [1] بدء جلب البيانات...");

    if (!supabaseClient) {
        console.warn("⚠️ [2] قاعدة بيانات Supabase غير مهيأة.");
        triggerLoginScreen();
        return;
    }

    try {
        console.log(`🔍 [3] جلب بيانات المستخدم (${userState.userId})...`);
        const { data, error } = await supabaseClient
            .from('users')
            .select('*')
            .eq('telegram_id', userState.userId)
            .maybeSingle();

        if (error) {
            console.error("❌ خطأ من Supabase:", error);
            throw error;
        }

        if (data) {
            console.log("✅ [4] المستخدم موجود في النظام.");
            userState.points = data.points || 0;
            userState.selectedClubs = data.selected_clubs || [];
            
            userState.lang = data.lang || userState.lang;
            applyLanguageSettings();

            userState.hasLoggedIn = true;
            
            if (data.wallet_address) {
                userState.walletAddress = data.wallet_address;
                userState.walletConnected = true;
            }

            if (userState.pendingReferrer && typeof window.apiProcessReferral === "function") {
                console.log("⚙️ جاري معالجة الإحالة المعلقة لصالح:", userState.pendingReferrer);
                window.apiProcessReferral(userState.pendingReferrer, userState.userId);
                userState.pendingReferrer = null; 
            }

        } else {
            console.log("🆕 [4] مستخدم جديد (غير مسجل).");
            userState.hasLoggedIn = false;
        }
    } catch (error) {
        console.error("❌ [خطأ] فشل في الاتصال وجلب البيانات:", error);
        userState.hasLoggedIn = false; 
    }

    if (!userState.hasLoggedIn || !userState.selectedClubs || userState.selectedClubs.length === 0) {
        triggerLoginScreen();
    } else {
        console.log("🏠 [6] توجيه للشاشة الرئيسية...");
        userState.hasLoggedIn = true;
        updateTopBar();
        showPage('home'); 
    }
}

// 🛠️ دالة تشغيل شاشة الدخول بأمان
function triggerLoginScreen() {
    console.log("🚪 [توجيه] محاولة فتح شاشة تسجيل الدخول...");
    
    const topBar = document.getElementById('top-bar');
    const bottomNav = document.getElementById('bottom-nav');
    if(topBar) topBar.style.display = 'none';
    if(bottomNav) bottomNav.style.display = 'none';

    if (typeof renderLoginScreen === 'function') {
        renderLoginScreen();
    } else {
        console.error("⛔ [خطأ] دالة renderLoginScreen غير موجودة!");
        const contentDiv = document.getElementById("main-content");
        if (contentDiv) {
            contentDiv.innerHTML = `<div style="padding: 20px; text-align: center; color: red;">
                <h3>خطأ في النظام</h3>
                <p>شاشة تسجيل الدخول مفقودة. تأكد من ملف login.js</p>
            </div>`;
        }
    }
}

// ==========================================
// 🔄 5. التوجيه وتحديث الواجهة الأساسية
// ==========================================

async function updateTopBar() {
    const topBar = document.getElementById("top-bar");
    const bottomNav = document.getElementById("bottom-nav");
    if (topBar) topBar.style.display = "flex";
    if (bottomNav) bottomNav.style.display = "flex";

    const pointsEl = document.getElementById("points");
    const clubEl = document.getElementById("club");
    
    if (typeof supabaseClient !== 'undefined' && supabaseClient !== null && userState.userId) {
        try {
            const { data } = await supabaseClient
                .from('club_fans_rankings')
                .select('total_fan_points')
                .eq('telegram_id', userState.userId)
                .maybeSingle();
                
            if (data && data.total_fan_points !== undefined) {
                userState.points = data.total_fan_points;
            }
        } catch(error) {
            console.error("❌ خطأ أثناء جلب النقاط من جدول الترتيب:", error);
        }
    }
    
    if(pointsEl) pointsEl.innerText = `${t('coins')} ${userState.points.toLocaleString()}`;
    
    if (clubEl && userState.selectedClubs && userState.selectedClubs.length > 0) {
        let logos = userState.selectedClubs.map(id => {
            let foundClub = null;
            if (typeof allWorldCupCountriesClubs !== 'undefined') {
                for (const country in allWorldCupCountriesClubs) {
                    const club = allWorldCupCountriesClubs[country].find(c => String(c.id) === String(id));
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

// ==========================================
// 🏆 6. دالة جلب وعرض شاشة الترتيب الشاملة
// ==========================================

// دالة مساعدة لإنشاء الصورة الشخصية 
const generateAvatar = (name, photoUrl, size = '50px') => {
    if (photoUrl) {
        return `<img src="${photoUrl}" style="width:${size}; height:${size}; border-radius:50%; object-fit:cover; border:2px solid var(--accent-gold, #fcb045); margin: 0 auto; display: block;">`;
    } else {
        const initial = name ? String(name).charAt(0).toUpperCase() : '👤';
        return `<div style="width:${size}; height:${size}; border-radius:50%; background: linear-gradient(135deg, #833ab4, #fd1d1d); color:white; display:flex; align-items:center; justify-content:center; font-size:calc(${size} / 2.2); font-weight:bold; margin: 0 auto; border:2px solid var(--accent-gold, #fcb045);">${initial}</div>`;
    }
};

window.renderRankingScreen = async function(container) {
    const isAr = userState.lang === 'ar'; 
    const currentUserId = userState.userId;

    container.innerHTML = `<div style="text-align:center; padding:50px; color:#aaa;">
        <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
        ${isAr ? 'جاري جلب قائمة المتصدرين وسجلك...' : 'Fetching leaderboard and history...'}
    </div>`;

    try {
        // سحب الترتيب
        const { data: rankings, error } = await supabaseClient
            .from('weekly_match_rankings')
            .select('*')
            .eq('category', 'weekly')
            .order('points_earned', { ascending: false })
            .limit(50);

        if (error) throw error;

        // جلب ترتيب المستخدم الحالي
        const { data: myRank } = await supabaseClient.rpc('get_user_rank', {
            p_telegram_id: currentUserId,
            p_category: 'weekly'
        });

        const { data: myData } = await supabaseClient
            .from('weekly_match_rankings')
            .select('points_earned')
            .eq('telegram_id', currentUserId)
            .eq('category', 'weekly')
            .maybeSingle();

        // سحب سجل التوقعات
        const { data: predictions } = await supabaseClient
            .from('match_predictions')
            .select('*')
            .eq('telegram_id', currentUserId)
            .order('created_at', { ascending: false });

        // سحب المباريات المرتبطة
        let matches = [];
        if (predictions && predictions.length > 0) {
            const matchIds = predictions.map(p => p.match_id);
            const { data: matchesData } = await supabaseClient
                .from('matches')
                .select('*')
                .in('id', matchIds);
            matches = matchesData || [];
        }

        // بناء الواجهة الشاملة
        let html = `
            <style>
                .podium-container { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 30px; margin-top: 20px; gap: 10px; }
                .podium-card { background: var(--bg-card, #1c1c22); border: 1px solid rgba(255,255,255,0.05); border-radius: 12px; text-align: center; padding: 15px 5px; flex: 1; display: flex; flex-direction: column; justify-content: center; }
                .rank-1 { border-color: var(--accent-gold, #fcb045); background: rgba(252, 176, 69, 0.1); height: 180px; transform: translateY(-15px); }
                .rank-2 { border-color: #c0c0c0; background: rgba(192, 192, 192, 0.1); height: 150px; }
                .rank-3 { border-color: #cd7f32; background: rgba(205, 127, 50, 0.1); height: 140px; }
                .podium-name { font-size: 0.85rem; font-weight: bold; margin: 10px 0 5px 0; color: #fff; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; direction: ltr; }
                .podium-pts { font-size: 1.1rem; font-weight: bold; }
                .my-rank-card { background: var(--gradient-primary, linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)); padding: 20px; border-radius: 16px; margin-top: 20px; text-align: center; box-shadow: 0 5px 15px rgba(253, 29, 29, 0.3); border: 1px solid rgba(255,255,255,0.2); }
            </style>
            
            <div style="padding: 20px; padding-bottom: 80px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="color: white; margin: 0; font-size: 1.5rem;">🏆 ${isAr ? 'ترتيب المتصدرين' : 'Leaderboard'}</h2>
                    <button onclick="showPage('home')" style="background: none; border: none; color: #aaa; font-size: 1.5rem; cursor: pointer;">✖</button>
                </div>
        `;

        // المنصة Top 3
        if (rankings && rankings.length > 0) {
            const firstPlace = rankings[0];
            const secondPlace = rankings[1];
            const thirdPlace = rankings[2];

            html += `<div class="podium-container">`;
            
            if (secondPlace) {
                const name2 = secondPlace.username || 'ID: ' + String(secondPlace.telegram_id).slice(-4);
                html += `
                    <div class="podium-card rank-2">
                        <div style="font-size: 1.5rem; margin-bottom: 5px;">🥈</div>
                        ${generateAvatar(name2, null, '50px')}
                        <div class="podium-name">${name2}</div>
                        <div class="podium-pts" style="color: #c0c0c0;">${secondPlace.points_earned || 0}</div>
                    </div>`;
            } else { html += `<div style="flex: 1;"></div>`; }

            if (firstPlace) {
                const name1 = firstPlace.username || 'ID: ' + String(firstPlace.telegram_id).slice(-4);
                html += `
                    <div class="podium-card rank-1">
                        <div style="font-size: 2rem; margin-bottom: 5px;">👑</div>
                        ${generateAvatar(name1, null, '65px')}
                        <div class="podium-name">${name1}</div>
                        <div class="podium-pts" style="color: var(--accent-gold, #fcb045);">${firstPlace.points_earned || 0}</div>
                    </div>`;
            }

            if (thirdPlace) {
                const name3 = thirdPlace.username || 'ID: ' + String(thirdPlace.telegram_id).slice(-4);
                html += `
                    <div class="podium-card rank-3">
                        <div style="font-size: 1.5rem; margin-bottom: 5px;">🥉</div>
                        ${generateAvatar(name3, null, '45px')}
                        <div class="podium-name">${name3}</div>
                        <div class="podium-pts" style="color: #cd7f32;">${thirdPlace.points_earned || 0}</div>
                    </div>`;
            } else { html += `<div style="flex: 1;"></div>`; }

            html += `</div>`;
        }

        // بطاقة المستخدم
        html += `
            <div class="my-rank-card">
                <p style="margin: 0 0 10px 0; font-size: 0.95rem; color: rgba(255,255,255,0.9);">
                    ${isAr ? 'ترتيبك الحالي في التحديات' : 'Your Current Rank'}
                </p>
                <div style="display: flex; justify-content: center; align-items: center; gap: 15px;">
                    <div style="font-size: 2.5rem; font-weight: bold; color: #fff;">
                        #${myRank || (isAr ? '-' : '-')}
                    </div>
                    ${generateAvatar(userState.username, userState.photoUrl, '60px')}
                    <div style="text-align: ${isAr ? 'right' : 'left'};">
                        <div style="font-weight: bold; font-size: 1.2rem;">${userState.username || 'User'}</div>
                        <div style="color: #fff; font-weight: bold; font-size: 1rem; margin-top: 3px; background: rgba(0,0,0,0.2); padding: 2px 8px; border-radius: 8px; display: inline-block;">
                            ${myData ? myData.points_earned : 0} ${isAr ? 'نقطة' : 'Pts'}
                        </div>
                    </div>
                </div>
            </div>
        `;

        // سجل التوقعات
        let errorCount = 0;
        let historyHtml = '';

        if (predictions && predictions.length > 0) {
            errorCount = predictions.filter(p => p.prediction_status === 'wrong').length;
            
            historyHtml = predictions.map(pred => {
                const match = matches.find(m => m.id === pred.match_id);
                if (!match) return ''; 

                let statusUi = '';
                let resultUi = '';

                if (pred.prediction_status === 'correct') {
                    statusUi = `<span style="background:rgba(16, 185, 129, 0.2); color:#10b981; padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">+3 ${isAr ? 'نقاط' : 'Pts'} ✅</span>`;
                    resultUi = `<div style="color:#10b981; font-size:0.85rem; margin-top:8px;">${isAr ? 'النتيجة النهائية:' : 'Final Score:'} ${match.home_score} - ${match.away_score}</div>`;
                } else if (pred.prediction_status === 'wrong') {
                    statusUi = `<span style="background:rgba(253, 29, 29, 0.2); color:var(--accent-red, #fd1d1d); padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">${isAr ? 'خطأ' : 'Wrong'} ❌</span>`;
                    resultUi = `<div style="color:var(--accent-red, #fd1d1d); font-size:0.85rem; margin-top:8px;">${isAr ? 'النتيجة النهائية:' : 'Final Score:'} ${match.home_score} - ${match.away_score}</div>`;
                } else {
                    statusUi = `<span style="background:rgba(252, 176, 69, 0.2); color:var(--accent-gold, #fcb045); padding:5px 10px; border-radius:8px; font-weight:bold; font-size:0.85rem;">${isAr ? 'قيد الانتظار' : 'Pending'} ⏳</span>`;
                }

                return `
                    <div style="background:var(--bg-card, #1c1c22); padding:15px; border-radius:12px; margin-bottom:15px; border: 1px solid rgba(255,255,255,0.05); display:flex; justify-content:space-between; align-items:center;">
                        <div>
                            <div style="font-weight:bold; font-size:1rem; margin-bottom:5px; color:#fff;">${match.team_a} vs ${match.team_b}</div>
                            <div style="color:#aaa; font-size:0.9rem;">
                                ${isAr ? 'توقعك:' : 'Prediction:'} <b style="color:#fff;">${pred.predicted_home} - ${pred.predicted_away}</b>
                            </div>
                            ${resultUi}
                        </div>
                        <div>${statusUi}</div>
                    </div>
                `;
            }).join('');
        } else {
            historyHtml = `<div style="text-align:center; color:#888; padding:30px; background:var(--bg-card, #1c1c22); border-radius:12px; border: 1px solid rgba(255,255,255,0.05);">${isAr ? 'لم تقم بأي توقعات بعد.' : 'No predictions yet.'}</div>`;
        }

        html += `
            <div style="margin-top: 35px; margin-bottom: 25px;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:15px;">
                    <h3 style="margin:0; color:#fff;">📜 ${isAr ? 'سجل توقعاتي' : 'My Predictions'}</h3>
                    <div style="background:var(--bg-card, #1c1c22); padding:5px 12px; border-radius:20px; font-size:0.85rem; border:1px solid rgba(255,255,255,0.1);">
                        <span style="color:#aaa;">${isAr ? 'الأخطاء:' : 'Errors:'}</span> 
                        <span style="font-weight:bold; color:${errorCount >= 2 ? 'var(--accent-red, #fd1d1d)' : '#10b981'};">${errorCount} / 2</span>
                    </div>
                </div>
                ${historyHtml}
            </div>
        `;

        // باقي الترتيب
        let leaderboardHtml = '';
        if (rankings && rankings.length > 3) {
            const restOfRankings = rankings.slice(3);
            
            leaderboardHtml = restOfRankings.map((rank, index) => {
                let actualRank = index + 4;
                let isMe = String(rank.telegram_id) === String(currentUserId);
                let cardStyle = isMe ? 'background: rgba(255, 215, 0, 0.15); border: 1px solid #ffd700;' : 'background: #1c1c22; border: 1px solid #25252d;';
                const alias = rank.username || 'ID: ' + String(rank.telegram_id).slice(-4);

                return `
                    <div style="${cardStyle} border-radius: 12px; padding: 12px 15px; margin-bottom: 10px; display: flex; align-items: center; justify-content: space-between;">
                        <div style="display: flex; align-items: center; gap: 15px;">
                            <div style="font-size: 1.1rem; font-weight: bold; color: #888; width: 30px; text-align: center;">#${actualRank}</div>
                            <div style="color: #fff; font-weight: bold; font-size: 0.95rem;">${alias} ${isMe ? `<span style="color:#ffd700; font-size:0.75rem;">(${isAr ? 'أنت' : 'You'})</span>` : ''}</div>
                        </div>
                        <div style="color: #ffd700; font-weight: bold; font-size: 1.1rem;">${rank.points_earned || 0} <span style="font-size:0.7rem; color:#aaa;">${isAr ? 'نقطة' : 'Pts'}</span></div>
                    </div>
                `;
            }).join('');

            html += `
                <div style="margin-top: 30px;">
                    <h3 style="margin:0 0 15px 0; color:#fff;">🌍 ${isAr ? 'باقي المتصدرين' : 'Other Players'}</h3>
                    ${leaderboardHtml}
                </div>
            `;
        }

        html += `</div>`;
        container.innerHTML = html;

    } catch (err) {
        console.error("❌ خطأ في جلب بيانات الترتيب:", err);
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color:#ff4d4d;">
                <h3>${isAr ? 'حدث خطأ!' : 'Error!'}</h3>
                <p>${isAr ? 'لم نتمكن من جلب الترتيب، يرجى المحاولة لاحقاً.' : 'Could not fetch rankings, please try again later.'}</p>
                <button onclick="showPage('home')" class="btn-secondary" style="margin-top: 20px;">
                    ${isAr ? 'عودة' : 'Back'}
                </button>
            </div>`;
    }
};

window.openRankingScreen = function() {
    console.log("🏆 تم طلب فتح شاشة ترتيب التحديات");
    const contentDiv = document.getElementById("main-content");
    if (contentDiv) {
        renderRankingScreen(contentDiv);
    }
};

// ==========================================
// ⚽ تهيئة دالة التحديات بأمان
// ==========================================
if (typeof window.openChallengesScreen !== 'function') {
    window.openChallengesScreen = function() {
        console.log("⚽ [احتياطي] تم طلب فتح شاشة تحديات الأسبوع");
        const contentDiv = document.getElementById("main-content");
        if (contentDiv) {
            if (typeof renderChallengesScreen === "function") {
                renderChallengesScreen(contentDiv);
            } else {
                contentDiv.innerHTML = `
                    <div style="padding: 30px 20px; text-align: center; color: white;">
                        <h2 style="font-size: 2rem; margin-bottom: 15px;">⚽ ${userState.lang === 'ar' ? 'تحديات الأسبوع' : 'Weekly Challenges'}</h2>
                        <p style="color: #ccc; margin-bottom: 25px;">${userState.lang === 'ar' ? 'قريباً سيتم عرض التحديات هنا...' : 'Challenges coming soon...'}</p>
                        <button onclick="showPage('home')" class="btn-action" style="margin-top: 20px;">
                            ${userState.lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                        </button>
                    </div>
                `;
            }
        }
    };
}
