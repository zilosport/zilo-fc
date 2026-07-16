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

// دالة غير متزامنة (Async) لجلب الأصدقاء من قاعدة بيانات Supabase واحتساب إحالاتهم
window.fetchFriendsFromDB = async function(userId) {
    if (typeof supabaseClient === 'undefined') {
        console.error("❌ لم يتم العثور على اتصال بقاعدة البيانات (supabaseClient).");
        return [];
    }

    try {
        // 1. جلب الإحالات الخاصة بالمستخدم الحالي
        const { data: referrals, error: refError } = await supabaseClient
            .from('referrals')
            .select('referred_id, total_commission') 
            .eq('referrer_id', userId);

        if (refError) throw refError;
        if (!referrals || referrals.length === 0) return [];

        const friendIds = referrals.map(r => r.referred_id);

        // 2. جلب البيانات الشخصية للأصدقاء (الاسم والمعرف)
        const { data: users, error: usersError } = await supabaseClient
            .from('users')
            .select('telegram_id, username, first_name')
            .in('telegram_id', friendIds);

        if (usersError) throw usersError;

        // 3. 🎯 التعديل الذكي: جلب عدد الأشخاص الذين قام كل صديق بدعوتهم
        // نبحث في جدول الإحالات عن الإحالات التي قام بها هؤلاء الأصدقاء بأنفسهم
        const { data: subReferrals, error: subRefError } = await supabaseClient
            .from('referrals')
            .select('referrer_id')
            .in('referrer_id', friendIds);

        // تجميع وحساب عدد الإحالات الفرعية لكل صديق
        const inviteCounts = {};
        if (!subRefError && subReferrals) {
            subReferrals.forEach(r => {
                inviteCounts[r.referrer_id] = (inviteCounts[r.referrer_id] || 0) + 1;
            });
        }

        // 4. بناء القائمة النهائية ودمج البيانات الشخصية مع العمولات وعدد الإحالات الحقيقي
        const friendsList = referrals.map(ref => {
            const friendInfo = users.find(u => u.telegram_id === ref.referred_id);
            let fallbackName = typeof t === 'function' ? t('newFriend') : "New Friend";
            let name = fallbackName;
            
            if (friendInfo) {
                name = friendInfo.first_name || friendInfo.username || fallbackName;
            }
            return {
                name: name,
                totalCommission: ref.total_commission || 0, 
                referralsCount: inviteCounts[ref.referred_id] || 0 // 🎯 الآن أصبح الرقم ديناميكياً وحقيقياً من قاعدة البيانات!
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
    let tFunc = typeof t === 'function' ? t : (key) => key;
    
    container.innerHTML = `
        <h3 style="color: var(--accent-gold); text-align: center;">${tFunc('referralTitle') || 'Referral System'}</h3>
        <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center;">${tFunc('referralSub') || 'Share your link!'}</p>
        
        <div class="card" style="text-align: center; margin-bottom: 20px; padding: 20px;">
            <p style="color: var(--accent-orange); font-family:monospace; font-size:0.8rem; word-break:break-all; margin:0 0 15px 0;">${referralLink}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button class="btn-action" onclick="window.copyToClipboard('${referralLink}')" style="margin-top: 0; padding: 12px; font-size: 0.9rem; flex: 1;">${tFunc('btnCopy') || 'Copy Link'}</button>
                <button class="btn-secondary" onclick="window.shareOnTelegram('${referralLink}')" style="margin-top: 0; padding: 12px; font-size: 0.9rem; flex: 1; border-color: var(--accent-orange); color: var(--accent-gold);">${tFunc('btnShare') || 'Share'}</button>
            </div>
        </div>

        <h4 style="color: var(--text-main);" id="friends-count-title">${tFunc('friendsList') || 'Joined Friends List'} (⏳)</h4>
        <div id="friends-list-container" style="text-align: center; padding: 10px 0;">
            <span style="color: var(--text-muted); font-size: 0.9rem;">${tFunc('fetchingFriends') || 'Fetching friends data from server...'}</span>
        </div>
    `;

    const friendsListContainer = document.getElementById('friends-list-container');
    const friendsCountTitle = document.getElementById('friends-count-title');

    try {
        const realFriends = await window.fetchFriendsFromDB(userState.userId);
        friendsCountTitle.innerText = `${tFunc('friendsList') || 'Joined Friends List'} (${realFriends.length})`;

        if (realFriends.length > 0) {
            friendsListContainer.style.textAlign = (typeof userState !== 'undefined' && userState.lang === 'ar') ? 'right' : 'left';
            
            friendsListContainer.innerHTML = realFriends.map(friend => `
                <div class="card" style="display: flex; justify-content: space-between; align-items: center; padding: 15px; margin-bottom: 12px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span style="font-size: 1.5rem;">👤</span>
                        <span style="color: var(--text-main); font-weight: bold; font-size: 1.1rem;">${friend.name}</span>
                    </div>
                    <div style="text-align: ${(typeof userState !== 'undefined' && userState.lang === 'ar') ? 'left' : 'right'};">
                        <span style="color: var(--accent-gold); font-size: 0.95rem; font-weight: 900;">+${friend.totalCommission} ZELO</span>
                        <br><small style="color: var(--text-muted); font-size: 0.75rem;">${tFunc('invites') || 'Invites:'} ${friend.referralsCount}</small>
                    </div>
                </div>
            `).join('');
        } else {
            friendsListContainer.innerHTML = `
                <div class="card" style="text-align: center; padding: 30px 20px;">
                    <span style="font-size: 3rem; display: block; margin-bottom: 15px;">🤝</span>
                    <p style="color: var(--text-muted); margin: 0; font-size: 1rem; line-height: 1.5;">${tFunc('emptyFriendsState') || "You haven't invited any friends yet.<br>Share your link to start collecting ZELO points!"}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات الأصدقاء:", error);
        friendsCountTitle.innerText = `${tFunc('friendsList') || 'Joined Friends List'} (0)`;
        friendsListContainer.innerHTML = `<span style="color: var(--accent-red); font-size: 0.9rem;">${tFunc('dbConnectionError') || "Could not connect to the database. Please try again later."}</span>`;
    }
};

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        let alertMsg = typeof t === 'function' ? t('alertCopied') : 'Link copied successfully!';
        alert(alertMsg);
    });
};

window.shareOnTelegram = function(link) {
    const text = encodeURIComponent((typeof t === 'function' ? t('shareText') : 'Choose your favorite club in ZELO FC and collect crypto rewards with me for free! 🏆'));
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
    if (typeof tg !== "undefined" && tg && tg.openTelegramLink) {
        tg.openTelegramLink(shareUrl); 
    } else {
        window.open(shareUrl, '_blank');
    }
};

// ==========================================
// 🚀 دالة معالجة الإحالة 
// ==========================================
window.apiProcessReferral = async function(referrerId, newUserId) {
    if (!supabaseClient) return { success: false, message: "لا يوجد اتصال بقاعدة البيانات" };

    try {
        const { error: refError } = await supabaseClient
            .from('referrals')
            .insert([{ referrer_id: referrerId, referred_id: newUserId, total_commission: 0 }]);

        if (refError) {
            if (refError.code === '23505') return { success: true, alreadyProcessed: true }; 
            throw refError;
        }

        return { success: true, message: "تم تسجيل الإحالة بنجاح وبدء حساب العمولة!" };

    } catch (error) {
        console.error("❌ خطأ في عملية معالجة الإحالة:", error);
        return { success: false };
    }
};
