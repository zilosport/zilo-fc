// --- إعدادات التطبيق (استبدل هذه القيم ببياناتك الحقيقية) ---
const CONFIG = {
    SUPABASE_URL: "https://YOUR_PROJECT_ID.supabase.co",
    SUPABASE_KEY: "YOUR_SUPABASE_ANON_KEY",
    BOT_USERNAME: "YourStarlingBot", // معرف البوت بدون @
    MANIFEST_URL: "https://yourdomain.com/tonconnect-manifest.json"
};

// تهيئة الاتصال بـ Supabase
const supabase = window.supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_KEY);

// تهيئة Telegram WebApp
const tg = window.Telegram.WebApp;
if (tg) {
    tg.expand();
    tg.ready();
}

// جلب بيانات تيليجرام الحقيقية تلقائياً
const telegramUser = tg.initDataUnsafe?.user || {
    id: 123456789, // للحاسوب فقط
    first_name: "Test",
    username: "test_user",
    photo_url: "https://via.placeholder.com/40"
};

const referrerId = tg.initDataUnsafe?.start_param ? tg.initDataUnsafe.start_param.replace('ref_', '') : null;
let currentUserData = null;
let syncTimeout = null; 

// بدء تشغيل التطبيق
async function initializeApp() {
    if (!telegramUser) return;

    // حقن الاسم والصورة في الواجهة
    document.getElementById('user-name').innerText = telegramUser.first_name;
    if (telegramUser.photo_url) {
        document.getElementById('user-avatar').src = telegramUser.photo_url;
    }

    // جلب أو إنشاء المستخدم في السيرفر
    let { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', telegramUser.id)
        .single();

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

    currentUserData = user;
    document.getElementById('balance').innerText = currentUserData.balance.toLocaleString();
    
    setupReferralSystem();
    fetchRealReferrals();
    setupRealWallet();
}

// التكبيس مع المؤثرات البصرية والاهتزاز
function handleTap(event) {
    if (!currentUserData) return;

    // 1. زيادة الرصيد محلياً
    currentUserData.balance += 1;
    document.getElementById('balance').innerText = currentUserData.balance.toLocaleString();

    // 2. اهتزاز الهاتف
    if (tg && tg.HapticFeedback) {
        tg.HapticFeedback.impactOccurred('medium');
    }

    // 3. مؤثر طائر الزرزور الطائر
    const floatingText = document.createElement('div');
    floatingText.classList.add('floating-tap');
    floatingText.innerHTML = '🐦 +1';
    
    // تحديد مكان الضغطة
    floatingText.style.left = `${event.clientX}px`;
    floatingText.style.top = `${event.clientY}px`;
    document.body.appendChild(floatingText);

    setTimeout(() => { floatingText.remove(); }, 800);

    // 4. الحفظ الآمن في السيرفر (Debounce)
    clearTimeout(syncTimeout);
    syncTimeout = setTimeout(async () => {
        await supabase
            .from('users')
            .update({ balance: currentUserData.balance })
            .eq('telegram_id', currentUserData.telegram_id);
    }, 1000); 
}

// نظام المهام
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
        
        await supabase.from('users').update({ balance: currentUserData.balance }).eq('telegram_id', currentUserData.telegram_id);
    }, 3000);
}

// نظام الإحالة (10% أرباح)
function setupReferralSystem() {
    const fullRefLink = `https://t.me/${CONFIG.BOT_USERNAME}?start=ref_${currentUserData.telegram_id}`;
    document.getElementById('ref-link-input').value = fullRefLink;
}

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
                const commission = Math.floor(friend.balance * 0.1); 
                
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

function copyRefLink() {
    const copyText = document.getElementById("ref-link-input");
    copyText.select();
    navigator.clipboard.writeText(copyText.value);
    if (tg) tg.showAlert("Link copied! 🚀");
}

function inviteFriend() {
    const refLink = document.getElementById("ref-link-input").value;
    const shareText = encodeURIComponent("Join Starling App! Tap the bird and mine $STAR tokens! 🐦🌟");
    if (tg) tg.openTelegramLink(`https://t.me/share/url?url=${refLink}&text=${shareText}`);
}

// محفظة TON Connect الحقيقية
function setupRealWallet() {
    const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: CONFIG.MANIFEST_URL,
        buttonRootId: 'ton-connect-btn'
    });

    tonConnectUI.onStatusChange(async (wallet) => {
        if (wallet) {
            const rawAddress = wallet.account.address;
            document.getElementById('wallet-status').innerHTML = `<span style='color: #00ff9d; font-weight: bold;'>Connected: ${rawAddress.slice(0,4)}...${rawAddress.slice(-4)}</span>`;
            
            await supabase.from('users').update({ wallet_address: rawAddress }).eq('telegram_id', currentUserData.telegram_id);
        } else {
            document.getElementById('wallet-status').innerText = "Click above to connect securely";
        }
    });
}

// التنقل بين الصفحات
function switchPage(pageId, element) {
    document.querySelectorAll('.page').forEach(page => page.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(nav => nav.classList.remove('active'));
    document.getElementById(`page-${pageId}`).classList.add('active');
    element.classList.add('active');
    
    if(pageId === 'friends' && currentUserData) fetchRealReferrals();
}

window.onload = initializeApp;