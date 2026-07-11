// ==========================================
// 👥 ملف قسم الأصدقاء (Friends) - (مربوط بـ Supabase 🚀)
// ==========================================

// دالة لتوليد رابط إحالة حقيقي ومخصص لكل مستخدم
window.generateReferralLink = function() {
    let uniqueIdentifier = userState.userId || userState.username || "user";
    let cleanIdentifier = String(uniqueIdentifier).replace(/[@\s]/g, '');
    
    // ⚠️ تأكد من أن 'Zelo_Sport_bot' و 'app' تطابق إعدادات BotFather الخاصة بك
    return `https://t.me/Zelo_Sport_bot/app?startapp=ref_${cleanIdentifier}`;
};

// دالة غير متزامنة (Async) لجلب الأصدقاء من قاعدة بيانات Supabase
window.fetchFriendsFromDB = async function(userId) {
    if (typeof supabaseClient === 'undefined') {
        console.error("❌ لم يتم العثور على اتصال بقاعدة البيانات (supabaseClient).");
        return [];
    }

    try {
        // 1. جلب قائمة الإحالات الخاصة بهذا المستخدم (من جدول referrals)
        const { data: referrals, error: refError } = await supabaseClient
            .from('referrals')
            .select('referred_id, reward_points')
            .eq('referrer_id', userId);

        if (refError) throw refError;
        if (!referrals || referrals.length === 0) return [];

        // 2. استخراج أرقام (IDs) الأصدقاء لجلب أسمائهم من جدول users
        const friendIds = referrals.map(r => r.referred_id);
        const { data: users, error: usersError } = await supabaseClient
            .from('users')
            .select('telegram_id, username, first_name')
            .in('telegram_id', friendIds);

        if (usersError) throw usersError;

        // 3. دمج البيانات (الاسم مع النقاط) لتناسب واجهة التطبيق
        const friendsList = referrals.map(ref => {
            const friendInfo = users.find(u => u.telegram_id === ref.referred_id);
            let name = "صديق جديد";
            if (friendInfo) {
                // نفضل الاسم الأول، وإذا لم يوجد نأخذ المعرف (username)
                name = friendInfo.first_name || friendInfo.username || "صديق جديد";
            }
            return {
                name: name,
                rewardPoints: ref.reward_points || 500,
                referralsCount: 0 // يمكن لاحقاً برمجتها لحساب إحالات الصديق نفسه
            };
        });

        return friendsList;
    } catch (error) {
        console.error("❌ خطأ أثناء جلب الأصدقاء من Supabase:", error);
        return [];
    }
};

// دالة رسم الواجهة
window.renderFriendsPage = async function(container) {
    const referralLink = window.generateReferralLink();
    let tFunc = typeof t === 'function' ? t : (key) => key; // حماية لدالة الترجمة
    
    // 1. رسم الواجهة الأساسية مع حالة "جاري التحميل..."
    container.innerHTML = `
        <h3 style="color:#ffd700;">${tFunc('referralTitle') || 'دعوة الأصدقاء'}</h3>
        <p style="color: #aaa; font-size: 0.85rem;">${tFunc('referralSub') || 'ادعُ أصدقاءك واكسب نقاط ZELO FC إضافية!'}</p>
        
        <div style="background: #16161a; border: 1px dashed #334; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <p style="color:#0088cc; font-family:monospace; font-size:0.8rem; word-break:break-all; margin:0 0 12px 0;">${referralLink}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="window.copyToClipboard('${referralLink}')" style="flex:1; padding:10px; border-radius:8px; border:none; background:#4caf50; color:white; font-weight:bold; cursor:pointer;">${tFunc('btnCopy') || 'نسخ الرابط'}</button>
                <button onclick="window.shareOnTelegram('${referralLink}')" style="flex:1; padding:10px; border-radius:8px; border:none; background:#0088cc; color:white; font-weight:bold; cursor:pointer;">${tFunc('btnShare') || 'مشاركة'}</button>
            </div>
        </div>

        <h4 style="color:#fff;" id="friends-count-title">${tFunc('friendsList') || 'قائمة الأصدقاء'} (⏳)</h4>
        <div id="friends-list-container" style="text-align: center; padding: 20px;">
            <span style="color: #888; font-size: 0.9rem;">جاري جلب بيانات الأصدقاء من السيرفر...</span>
        </div>
    `;

    const friendsListContainer = document.getElementById('friends-list-container');
    const friendsCountTitle = document.getElementById('friends-count-title');

    try {
        // 2. جلب البيانات الحقيقية من Supabase
        const realFriends = await window.fetchFriendsFromDB(userState.userId);
        
        // تحديث العداد
        friendsCountTitle.innerText = `${tFunc('friendsList') || 'قائمة الأصدقاء'} (${realFriends.length})`;

        // 3. التحقق من وجود أصدقاء وعرضهم أو عرض الحالة الفارغة
        if (realFriends.length > 0) {
            friendsListContainer.style.textAlign = (typeof userState !== 'undefined' && userState.lang === 'ar') ? 'right' : 'left';
            friendsListContainer.style.padding = '0';
            
            friendsListContainer.innerHTML = realFriends.map(friend => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #1c1c22; padding: 12px; border-radius: 10px; margin: 6px 0; border: 1px solid #25252d;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">👤</span>
                        <span style="color: #fff; font-weight: bold;">${friend.name}</span>
                    </div>
                    <div style="text-align: ${(typeof userState !== 'undefined' && userState.lang === 'ar') ? 'left' : 'right'};">
                        <span style="color: #4caf50; font-size: 0.85rem; font-weight: bold;">+${(friend.rewardPoints || 500)} ZELO</span>
                        <br><small style="color: #888; font-size: 0.7rem;">${tFunc('invites') || 'دعوات:'} ${friend.referralsCount || 0}</small>
                    </div>
                </div>
            `).join('');
        } else {
            // حالة فارغة (Empty State)
            friendsListContainer.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.02); padding: 20px; border-radius: 12px; border: 1px solid #25252d;">
                    <span style="font-size: 2.5rem; display: block; margin-bottom: 10px;">🤝</span>
                    <p style="color: #aaa; margin: 0; font-size: 0.9rem;">لم تقم بدعوة أي أصدقاء حتى الآن.<br>شارك رابطك لتبدأ بجمع نقاط ZELO FC!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات الأصدقاء:", error);
        friendsCountTitle.innerText = `${tFunc('friendsList') || 'قائمة الأصدقاء'} (0)`;
        friendsListContainer.innerHTML = `<span style="color: #f44336; font-size: 0.9rem;">تعذر الاتصال بقاعدة البيانات. يرجى المحاولة لاحقاً.</span>`;
    }
};

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        let alertMsg = typeof t === 'function' ? t('alertCopied') : 'تم نسخ الرابط بنجاح!';
        alert(alertMsg);
    });
};

window.shareOnTelegram = function(link) {
    const text = encodeURIComponent((typeof t === 'function' ? t('shareText') : 'انضم إلي في تطبيق Zelo Sport!'));
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
    if (typeof tg !== "undefined" && tg && tg.openTelegramLink) {
        tg.openTelegramLink(shareUrl); 
    } else {
        window.open(shareUrl, '_blank');
    }
};
