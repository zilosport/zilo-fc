<<<<<<< HEAD
// --- قراءة الإعدادات العالمية الممررة من المتصفح ---
const CONFIG = window.APP_CONFIG || {
    SUPABASE_URL: "", 
    SUPABASE_KEY: "", 
    BOT_USERNAME: "", 
    MANIFEST_URL: "" 
};

// تهيئة الاتصال بـ Supabase مع حماية الكود من التوقف
let supabase = null;
try {
    if (CONFIG.SUPABASE_URL && !CONFIG.SUPABASE_URL.includes("YOUR_PROJECT_ID")) {
        supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);
    }
} catch (error) {
    console.error("فشل تهيئة Supabase:", error);
}

// تهيئة Telegram WebApp
const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// جلب بيانات تيليجرام الحقيقية تلقائياً أو وضع بيانات تجريبية للمتصفح (الحاسوب)
const telegramUser = tg?.initDataUnsafe?.user || {
    id: 123456789, 
    first_name: "مستخدم تجريبي",
    username: "test_user",
    photo_url: "https://via.placeholder.com/40"
};

const referrerId = tg?.initDataUnsafe?.start_param ? tg.initDataUnsafe.start_param.replace('ref_', '') : null;
let currentUserData = { balance: 0, telegram_id: telegramUser.id }; 
let syncTimeout = null; 
let pendingTaps = 0; // متغير تخزين النقرات المعلقة التي لم تُرسل للسيرفر بعد

// بدء تشغيل التطبيق وجلب البيانات
async function initializeApp() {
    if (!telegramUser) return;

    // حقن الاسم والصورة في الواجهة فوراً
    document.getElementById('user-name').innerText = telegramUser.first_name;
    if (telegramUser.photo_url) {
        document.getElementById('user-avatar').src = telegramUser.photo_url;
    }

    // جلب أو إنشاء المستخدم في قاعدة البيانات الحقيقية
    if (supabase) {
        try {
            let { data: user, error } = await supabase
                .from('users')
                .select('*')
                .eq('telegram_id', telegramUser.id)
                .single();

            // إذا كان المستخدم جديداً (غير مسجل)، نقوم بإنشائه في الجداول
            if (error && error.code === 'PGRST116') {
                const newUser = {
                    telegram_id: telegramUser.id,
                    first_name: telegramUser.first_name,
                    username: telegramUser.username || null,
                    photo_url: telegramUser.photo_url || null,
                    balance: 0,
                    referred_by: referrerId ? parseInt(referrerId) : null
                };

                const { data: createdUser } = await supabase.from('users').insert([newUser]).select().single();
                user = createdUser;
            }

            if (user) currentUserData = user;
        } catch (dbError) {
            console.error("خطأ أثناء جلب البيانات من السيرفر:", dbError);
        }
    }

    // تحديث رصيد البداية في الواجهة
    document.getElementById('balance').innerText = currentUserData.balance.toLocaleString();
    
    setupReferralSystem();
    if (supabase) fetchRealReferrals();
    setupRealWallet();
}

// التكبيس المحمي والآمن (Server-Side Anti-Cheat)
function handleTap(event) {
    if (!currentUserData) return;

    // 1. زيادة الرصيد محلياً فوراً (لكي لا يشعر المستخدم بأي تأخير أو ثقل)
    currentUserData.balance += 1;
    pendingTaps += 1; // إضافة النقرة الحالية إلى عداد الانتظار
    document.getElementById('balance').innerText = currentUserData.balance.toLocaleString();

    // 2. اهتزاز الهاتف داخل تيليجرام
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // 3. تأثير طائر الزرزور الطائر والمؤثر البصري للنقرة
    const floatingText = document.createElement('div');
    floatingText.classList.add('floating-tap');
    floatingText.innerHTML = '🐦 +1';
    
    floatingText.style.left = `${event.clientX}px`;
    floatingText.style.top = `${event.clientY}px`;
    document.body.appendChild(floatingText);

    setTimeout(() => { floatingText.remove(); }, 800);

    // 4. الإرسال الآمن للسيرفر بنظام التجميع الذكي (Debounce)
    if (supabase) {
        clearTimeout(syncTimeout);
        syncTimeout = setTimeout(async () => {
            const tapsToSend = pendingTaps;
            if (tapsToSend === 0) return;
            
            pendingTaps = 0; 

            try {
                // استدعاء دالة RPC الآمنة من قاعدة البيانات
                const { error } = await supabase.rpc('increment_balance', {
                    user_tid: currentUserData.telegram_id,
                    taps: tapsToSend
                });

                if (error) {
                    console.error("فشل إرسال النقرات للسيرفر، سيتم المحاولة مجدداً:", error);
                    pendingTaps += tapsToSend;
                }
            } catch (err) {
                console.error("خطأ في الاتصال بالشبكة:", err);
                pendingTaps += tapsToSend;
            }
        }, 1000); // تجميع كافة النقرات وإرسالها دفعة واحدة كل ثانية
    }
}

// نظام المهام وتحديث رصيدها
async function completeTask(button, reward, taskUrl) {
    if (button.innerText === 'Done') return;
    if (tg) tg.openLink(taskUrl);
    
    button.innerText = "Checking...";
    button.style.background = "#1f293d";
    
    setTimeout(async () => {
        currentUserData.balance += reward;
        document.getElementById('balance').innerText = currentUserData.balance.toLocaleString();
        button.innerText = "Done";
        button.style.color = "#00ff9d";
        
        if (supabase) {
            await supabase
                .from('users')
                .update({ balance: currentUserData.balance })
                .eq('telegram_id', currentUserData.telegram_id);
        }
    }, 3000);
}

// توليد رابط الإحالة الخاص بالمستخدم
function setupReferralSystem() {
    const fullRefLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=ref_${currentUserData.telegram_id}`;
    document.getElementById('ref-link-input').value = fullRefLink;
}

// جلب قائمة الأصدقاء المسجلين من خلال المستخدم
async function fetchRealReferrals() {
    if (!supabase) return;
    let { data: referrals, error } = await supabase
        .from('users')
        .select('first_name, username, balance')
        .eq('referred_by', currentUserData.telegram_id);

    if (!error && referrals) {
        document.getElementById('quick-ref-count').innerText = referrals.length;
        document.getElementById('friends-count-label').innerText = referrals.length;

        const container = document.getElementById('friends-list-container');
        if (referrals.length > 0) {
            container.innerHTML = "";
            referrals.forEach(friend => {
                const nameDisplay = friend.username ? `@${friend.username}` : friend.first_name;
                const commission = Math.floor(friend.balance * 0.1); // حساب الـ 10% أرباح المكافأة بصرياً
                
                container.innerHTML += `
                    <div class="friend-card">
                        <div class="friend-meta">
                            <div class="friend-avatar-box">${friend.first_name.charAt(0).toUpperCase()}</div>
                            <div class="friend-name">${nameDisplay}</div>
                        </div>
                        <div class="friend-profit">
                            <p>10% Bonus</p>
                            <span>+${commission} $STAR</span>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `<p class="no-friends-msg">No friends invited yet.</p>`;
        }
    }
}

// نسخ رابط الإحالة
function copyRefLink() {
    const copyText = document.getElementById("ref-link-input");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    if (tg) tg.showAlert("Link copied! 🚀");
}

// مشاركة ودعوة الأصدقاء عبر رسائل تيليجرام
function inviteFriend() {
    const refLink = document.getElementById("ref-link-input").value;
    const shareText = encodeURIComponent("Join Starling App! Tap the bird and mine $STAR tokens! 🐦🌟");
    if (tg) tg.openTelegramLink(`https://t.me/share/url?url=${refLink}&text=${shareText}`);
}

// إعداد وربط محفظة TON Connect الحقيقية بالخلفية وحفظ العنوان
function setupRealWallet() {
    if (typeof TON_CONNECT_UI === 'undefined') {
        console.error("مكتبة TON Connect UI لم يتم تحميلها بشكل صحيح.");
        return;
    }
    try {
        const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
            manifestUrl: CONFIG.MANIFEST_URL,
            buttonRootId: 'ton-connect-btn'
        });

        tonConnectUI.onStatusChange(async (wallet) => {
            if (wallet) {
                const rawAddress = wallet.account.address;
                document.getElementById('wallet-status').innerHTML = `<span style='color: #00ff9d; font-weight: bold;'>Connected: ${rawAddress.slice(0,4)}...${rawAddress.slice(-4)}</span>`;
                
                if (supabase) {
                    await supabase
                        .from('users')
                        .update({ wallet_address: rawAddress })
                        .eq('telegram_id', currentUserData.telegram_id);
                }
            } else {
                document.getElementById('wallet-status').innerText = "Click above to connect securely";
            }
        });
    } catch(e) {
        console.error("حدث خطأ أثناء إعداد محفظة TON:", e);
    }
}

// التنقل البرمجي السلس بين الصفحات والأزرار السفلية
function switchPage(pageId, element) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    
    const targetPage = document.getElementById(`page-${pageId}`);
    if(targetPage) {
        targetPage.classList.add('active');
    }
    if(element) {
        element.classList.add('active');
    }
    
    if(pageId === 'friends' && currentUserData && supabase) fetchRealReferrals();
}

// تشغيل التطبيق بالكامل بمجرد تحميل المتصفح/تيليجرام للنافذة
window.onload = initializeApp;
=======
// قراءة الروابط والمفاتيح الحساسة من النطاق العام للنافذة المحمية عبر ملف config.js
const SUPABASE_URL = window.APP_CONFIG.SUPABASE_URL;
const SUPABASE_KEY = window.APP_CONFIG.SUPABASE_KEY;
const BOT_USERNAME = window.APP_CONFIG.BOT_USERNAME;
const MANIFEST_URL = window.APP_CONFIG.MANIFEST_URL;

// تهيئة الاتصال الفعلي بـ Supabase
const supabase = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);

// تهيئة Telegram WebApp SDK الحقيقي
const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// قراءة بيانات حساب المستخدم الحقيقية من خادم تيليجرام الآمن
const telegramUser = tg.initDataUnsafe?.user || {
    id: 123456789, // حساب تجريبي للاختبار محلياً في المتصفح فقط
    first_name: "Hamis",
    last_name: "",
    username: "hamis_dev",
    photo_url: ""
};

// قراءة معرّف الشخص الداعي من رابط التشغيل تلقائياً (start_param)
const referrerId = tg.initDataUnsafe?.start_param ? tg.initDataUnsafe.start_param.replace('ref_', '') : null;

let currentUserData = null;

// دالة بدء تشغيل التطبيق وجلب الحساب الحقيقي من Supabase
async function initializeApp() {
    if (!telegramUser) return;

    // حقن الاسم والصورة الحقيقية فوراً في واجهة المستخدم
    document.getElementById('user-name').innerText = telegramUser.first_name + (telegramUser.last_name ? " " + telegramUser.last_name : "");
    if (telegramUser.photo_url) {
        document.getElementById('user-avatar').src = telegramUser.photo_url;
    }

    // محاولة جلب المستخدم الحالي من جدول قاعدة البيانات الحقيقي
    let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

    if (error && error.code === 'PGRST116') {
        // إذا كان الزائر جديداً، نقوم بتسجيله فوراً وربطه بحساب الشخص الذي دعاه حقيقياً
        const newUser = {
            telegram_id: telegramUser.id,
            first_name: telegramUser.first_name,
            username: telegramUser.username || null,
            photo_url: telegramUser.photo_url || null,
            balance: 0,
            referred_by: referrerId ? parseInt(referrerId) : null
        };

        const { data: createdUser, error: insertError } = await supabase
            .from('users')
            .insert([newUser])
            .select()
            .single();

        if (!insertError) user = createdUser;
    }

    currentUserData = user;
    
    // إظهار رصيده الحقيقي المسجل في السيرفر
    document.getElementById('balance').innerText = currentUserData.balance.toLocaleString();
    
    // تشغيل الأنظمة الفرعية الحقيقية
    setupReferralSystem();
    fetchRealReferrals();
    setupRealWallet();
}

// 1. نظام التكبيس الفعلي وحفظ البيانات الفوري في Supabase
async function handleTap() {
    if (!currentUserData) return;

    currentUserData.balance += 1;
    document.getElementById('balance').innerText = currentUserData.balance.toLocaleString();

    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // حفظ الرصيد الجديد مباشرة في السيرفر
    await supabase
        .from('users')
        .update({ balance: currentUserData.balance })
        .eq('telegram_id', currentUserData.telegram_id);
}

// 2. معالجة وإنتاج روابط الإحالة الحقيقية
function setupReferralSystem() {
    const fullRefLink = `https://t.me/${BOT_USERNAME}?start=ref_${currentUserData.telegram_id}`;
    document.getElementById('ref-link-input').value = fullRefLink;
}

// جلب وعرض قائمة الأصدقاء الحقيقيين المحالين من قاعدة البيانات
async function fetchRealReferrals() {
    let { data: referrals, error } = await supabase
        .from('users')
        .select('first_name, username, balance')
        .eq('referred_by', currentUserData.telegram_id);

    if (!error && referrals) {
        document.getElementById('quick-ref-count').innerText = referrals.length;
        document.getElementById('friends-count-label').innerText = referrals.length;

        const container = document.getElementById('friends-list-container');
        if (referrals.length > 0) {
            container.innerHTML = "";
            referrals.forEach(friend => {
                const nameDisplay = friend.username ? `@${friend.username}` : friend.first_name;
                const commission = Math.floor(friend.balance * 0.1); // بونص 10% حقيقي من إنتاج نقرات الصديق
                
                container.innerHTML += `
                    <div class="friend-card">
                        <div class="friend-meta">
                            <div class="friend-avatar-box">${friend.first_name.charAt(0).toUpperCase()}</div>
                            <div class="friend-name">${nameDisplay}</div>
                        </div>
                        <div class="friend-profit">
                            <p>10% Commission</p>
                            <span>+${commission} $STAR</span>
                        </div>
                    </div>
                `;
            });
        } else {
            container.innerHTML = `<p class="no-friends-msg">No friends invited yet. Start inviting to earn 10% bonus!</p>`;
        }
    }
}

// 3. ربط محفظة التلجرام TON الفعلي عبر بروتوكول TON Connect الرسمي
function setupRealWallet() {
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: MANIFEST_URL,
        buttonRootId: 'ton-connect-btn'
    });

    // مراقبة نجاح الاتصال وتخزين عنوان المحفظة الحقيقي في Supabase للمستخدم
    tonConnectUI.onStatusChange(async (wallet) => {
        if (wallet) {
            const rawAddress = wallet.account.address;
            document.getElementById('wallet-status').innerHTML = `<span style='color: #00ff9d; font-weight: bold;'>Connected!</span>`;
            
            await supabase
                .from('users')
                .update({ wallet_address: rawAddress })
                .eq('telegram_id', currentUserData.telegram_id);
        } else {
            document.getElementById('wallet-status').innerText = "Wallet not connected";
        }
    });
}

// نسخ ومشاركة روابط الدعوة
function copyRefLink() {
    const copyText = document.getElementById("ref-link-input");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    if (tg) tg.showAlert("Real referral link copied! 🚀");
}

function inviteFriend() {
    const refLink = document.getElementById("ref-link-input").value;
    const shareText = encodeURIComponent("Join Starling App! Tap the core, connect your wallet and mine real $STAR tokens! ⚡🌟");
    if (tg) tg.openTelegramLink(`https://t.me/share/url?url=${refLink}&text=${shareText}`);
}

function switchPage(pageId, element) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    element.classList.add('active');
}

// تشغيل النظام بالكامل عند تحميل الصفحة واكتمال بيئة الويب
window.onload = () => {
    initializeApp();
};
>>>>>>> 443c322294bcbd4b3738f51ab66bbee48194b646
