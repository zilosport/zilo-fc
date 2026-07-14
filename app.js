// ==========================================
// 🚀 تطبيق زيلو إف سي (ZELO FC) - الكود الأساسي (app.js) المحُدّث
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
    lang: "ar", // اللغة الافتراضية، سيتم تحديثها من قاعدة البيانات أو شاشة الدخول
    referrals: [], 
    dailyCheckInClaimed: false,
    pendingReferrer: null, // 💡 [جديد] لحفظ معرف الداعي مؤقتاً عند الدخول من رابط إحالة
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

// 💡 دالة جديدة لتطبيق إعدادات اللغة على الواجهة بناءً على اختيار المستخدم
function applyLanguageSettings() {
    document.documentElement.dir = userState.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = userState.lang;
    
    // تحديث نصوص القائمة السفلية إذا كانت موجودة
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
    // 1. استخراج بيانات تليجرام فوراً أو وضع بيانات وهمية للاختبار المحلي
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
            
            // تحديد اللغة المبدئية من تليجرام (سيتم الكتابة فوقها إذا كان مسجلاً في قاعدة البيانات)
            if (tgUser.language_code && tgUser.language_code.startsWith('en')) {
                userState.lang = 'en';
            }

            // 🚀 [جديد] التقاط رابط الإحالة من تليجرام (start_param)
            if (tg.initDataUnsafe.start_param && tg.initDataUnsafe.start_param.startsWith('ref_')) {
                const referrerId = tg.initDataUnsafe.start_param.replace('ref_', '');
                // التأكد أن الشخص لا يحيل نفسه بطريق الخطأ
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

    // 2. تطبيق إعدادات اللغة المبدئية
    applyLanguageSettings();

    // 3. تهيئة المحفظة وجلب البيانات
    initTonConnect();
    fetchDataAndRoute();
});

// ==========================================
// 🔄 دالة تهيئة المحفظة (تم إصلاح حفظ البيانات)
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
                    
                    // 🚀 الإصلاح: الحفظ المباشر دون انتظار حالة hasLoggedIn
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

                    // 🚀 الإصلاح: المسح المباشر من قاعدة البيانات عند الانفصال
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
            
            // 💡 جلب لغة المستخدم المحفوظة في قاعدة البيانات وتطبيقها
            userState.lang = data.lang || userState.lang;
            applyLanguageSettings();

            userState.hasLoggedIn = true;
            
            if (data.wallet_address) {
                userState.walletAddress = data.wallet_address;
                userState.walletConnected = true;
            }

            // 🚀 [جديد] معالجة الإحالة فوراً إذا كان المستخدم مسجلاً بالفعل ولديه إحالة معلقة
            if (userState.pendingReferrer && typeof window.apiProcessReferral === "function") {
                console.log("⚙️ جاري معالجة الإحالة المعلقة لصالح:", userState.pendingReferrer);
                window.apiProcessReferral(userState.pendingReferrer, userState.userId);
                userState.pendingReferrer = null; // تفريغ بعد التنفيذ لتجنب التكرار
            }

        } else {
            console.log("🆕 [4] مستخدم جديد (غير مسجل).");
            userState.hasLoggedIn = false;
        }
    } catch (error) {
        console.error("❌ [خطأ] فشل في الاتصال وجلب البيانات:", error);
        userState.hasLoggedIn = false; 
    }

    // التوجيه النهائي
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
    
    // التأكد من بقاء الأشرطة مخفية
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
    
    // التحقق من الرصيد الحقيقي في جدول الترتيب وتحديثه
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
// 🏆 6. دالة جلب وعرض شاشة الترتيب الحقيقية من قاعدة البيانات
// ==========================================
window.renderRankingScreen = async function(container) {
    // 1. إظهار رسالة تحميل أثناء جلب البيانات
    container.innerHTML = `<div style="text-align:center; padding:50px; color:#aaa;">
        <div style="font-size: 2rem; margin-bottom: 10px;">⏳</div>
        ${userState.lang === 'ar' ? 'جاري جلب قائمة المتصدرين...' : 'Fetching leaderboard...'}
    </div>`;

    try {
        // 2. سحب البيانات من جدول الترتيب (الأعلى نقاطاً أولاً)
        const { data: rankings, error } = await supabaseClient
            .from('weekly_match_rankings')
            .select('*')
            .order('points_earned', { ascending: false }) // ترتيب تنازلي حسب النقاط
            .limit(50); // جلب أعلى 50 لاعب

        if (error) throw error;

        // في حال كان الجدول فارغاً
        if (!rankings || rankings.length === 0) {
            container.innerHTML = `
                <div style="text-align:center; padding:50px; color:#fff;">
                    <h2 style="font-size: 2rem; margin-bottom: 15px;">🏆 ${userState.lang === 'ar' ? 'الترتيب الأسبوعي' : 'Weekly Ranking'}</h2>
                    <p style="color: #aaa;">${userState.lang === 'ar' ? 'لا توجد بيانات في الترتيب حالياً.' : 'No ranking data available yet.'}</p>
                    <button onclick="showPage('home')" class="btn-secondary" style="margin-top: 20px;">
                        ${userState.lang === 'ar' ? 'العودة للرئيسية' : 'Back to Home'}
                    </button>
                </div>`;
            return;
        }

        // 3. سحب أسماء وصور المستخدمين بناءً على الـ ID
        const userIds = rankings.map(r => r.telegram_id);
        const { data: usersData } = await supabaseClient
            .from('users')
            .select('telegram_id, username, photo_url')
            .in('telegram_id', userIds);

        let usersMap = {};
        if (usersData) {
            usersData.forEach(u => { usersMap[u.telegram_id] = u; });
        }

        // 4. رسم البطاقات الخاصة بكل لاعب
        let listHtml = rankings.map((rank, index) => {
            // تجهيز بيانات اللاعب (الاسم المستعار فقط)
            let userInfo = usersMap[rank.telegram_id] || { username: userState.lang === 'ar' ? 'لاعب مجهول' : 'Unknown Player', photo_url: null };
            let aliasName = userInfo.username;
            
            // تجهيز الصورة البديلة في حال لم توجد صورة أو كانت معطلة
            let defaultAvatar = `https://ui-avatars.com/api/?name=${encodeURIComponent(aliasName)}&background=25252d&color=fff`;
            let avatar = userInfo.photo_url || defaultAvatar;
            
            // تمييز بطاقة المستخدم الحالي بلون مختلف
            let isMe = String(rank.telegram_id) === String(userState.userId);
            let cardStyle = isMe 
                ? 'background: rgba(255, 215, 0, 0.15); border: 1px solid #ffd700;' 
                : 'background: #1c1c22; border: 1px solid #25252d;';

            // تحديد شكل المرتبة (أول 3 مراكز لهم كؤوس)
            let rankBadge = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : `#${index + 1}`;
            let rankColor = index < 3 ? '#fff' : '#888';

            let youText = userState.lang === 'ar' ? '(أنت)' : '(You)';
            let pointsText = userState.lang === 'ar' ? 'نقطة' : 'Pts';

            return `
                <div style="${cardStyle} border-radius: 16px; padding: 15px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between;">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="font-size: 1.2rem; font-weight: bold; color: ${rankColor}; width: 30px; text-align: center;">${rankBadge}</div>
                        
                        <img src="${avatar}" onerror="this.onerror=null; this.src='${defaultAvatar}';" style="width: 45px; height: 45px; border-radius: 50%; object-fit: cover; border: 2px solid ${isMe ? '#ffd700' : '#333'};">
                        
                        <div>
                            <h4 style="margin: 0; color: #fff; font-size: 1rem;">${aliasName} ${isMe ? `<span style="color:#ffd700; font-size:0.8rem;">${youText}</span>` : ''}</h4>
                        </div>
                    </div>
                    <div style="text-align: center; background: rgba(0,0,0,0.3); padding: 8px 12px; border-radius: 12px;">
                        <div style="color: #ffd700; font-weight: bold; font-size: 1.1rem;">${rank.points_earned || 0}</div>
                        <div style="color: #aaa; font-size: 0.7rem;">${pointsText}</div>
                    </div>
                </div>
            `;
        }).join('');

        // 5. عرض الصفحة بالكامل
        container.innerHTML = `
            <div style="padding: 20px; padding-bottom: 80px;">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 25px;">
                    <h2 style="color: white; margin: 0; font-size: 1.5rem;">🏆 ${userState.lang === 'ar' ? 'ترتيب المتصدرين' : 'Leaderboard'}</h2>
                    <button onclick="showPage('home')" style="background: none; border: none; color: #aaa; font-size: 1.5rem; cursor: pointer;">✖</button>
                </div>
                ${listHtml}
            </div>
        `;

    } catch (err) {
        console.error("❌ خطأ في جلب بيانات الترتيب:", err);
        container.innerHTML = `
            <div style="text-align:center; padding:50px; color:#ff4d4d;">
                <h3>${userState.lang === 'ar' ? 'حدث خطأ!' : 'Error!'}</h3>
                <p>${userState.lang === 'ar' ? 'لم نتمكن من جلب الترتيب، يرجى المحاولة لاحقاً.' : 'Could not fetch rankings, please try again later.'}</p>
                <button onclick="showPage('home')" class="btn-secondary" style="margin-top: 20px;">
                    ${userState.lang === 'ar' ? 'عودة' : 'Back'}
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
// ⚽ تهيئة دالة التحديات بأمان لمنع التعارض
// ==========================================
// نقوم بتعريف هذه الدالة كدالة احتياطية فقط في حال لم يتم تحميل ملف predictions_ranking.js
// هذا يمنع ملف app.js من إلغاء أو حذف الكود الحقيقي الخاص بالمباريات والتوقعات عند تحميله لاحقاً.
if (typeof window.openChallengesScreen !== 'function') {
    window.openChallengesScreen = function() {
        console.log("⚽ [احتياطي] تم طلب فتح شاشة تحديات الأسبوع (لم يتم تحميل الملف الرئيسي)");
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
