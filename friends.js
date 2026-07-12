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
            // جلب الترجمة لكلمة "صديق جديد"
            let fallbackName = typeof t === 'function' ? t('newFriend') : "New Friend";
            let name = fallbackName;
            
            if (friendInfo) {
                // نفضل الاسم الأول، وإذا لم يوجد نأخذ المعرف (username)
                name = friendInfo.first_name || friendInfo.username || fallbackName;
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
        <h3 style="color:#ffd700;">${tFunc('referralTitle') || 'Referral System'}</h3>
        <p style="color: #aaa; font-size: 0.85rem;">${tFunc('referralSub') || 'Share your link!'}</p>
        
        <div style="background: #16161a; border: 1px dashed #334; padding: 15px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
            <p style="color:#0088cc; font-family:monospace; font-size:0.8rem; word-break:break-all; margin:0 0 12px 0;">${referralLink}</p>
            <div style="display: flex; gap: 10px; justify-content: center;">
                <button onclick="window.copyToClipboard('${referralLink}')" style="flex:1; padding:10px; border-radius:8px; border:none; background:#4caf50; color:white; font-weight:bold; cursor:pointer;">${tFunc('btnCopy') || 'Copy Link'}</button>
                <button onclick="window.shareOnTelegram('${referralLink}')" style="flex:1; padding:10px; border-radius:8px; border:none; background:#0088cc; color:white; font-weight:bold; cursor:pointer;">${tFunc('btnShare') || 'Share'}</button>
            </div>
        </div>

        <h4 style="color:#fff;" id="friends-count-title">${tFunc('friendsList') || 'Joined Friends List'} (⏳)</h4>
        <div id="friends-list-container" style="text-align: center; padding: 20px;">
            <span style="color: #888; font-size: 0.9rem;">${tFunc('fetchingFriends') || 'Fetching friends data from server...'}</span>
        </div>
    `;

    const friendsListContainer = document.getElementById('friends-list-container');
    const friendsCountTitle = document.getElementById('friends-count-title');

    try {
        // 2. جلب البيانات الحقيقية من Supabase
        const realFriends = await window.fetchFriendsFromDB(userState.userId);
        
        // تحديث العداد
        friendsCountTitle.innerText = `${tFunc('friendsList') || 'Joined Friends List'} (${realFriends.length})`;

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
                        <br><small style="color: #888; font-size: 0.7rem;">${tFunc('invites') || 'Invites:'} ${friend.referralsCount || 0}</small>
                    </div>
                </div>
            `).join('');
        } else {
            // حالة فارغة (Empty State) - تم ربطها بالترجمة الآن
            friendsListContainer.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.02); padding: 20px; border-radius: 12px; border: 1px solid #25252d;">
                    <span style="font-size: 2.5rem; display: block; margin-bottom: 10px;">🤝</span>
                    <p style="color: #aaa; margin: 0; font-size: 0.9rem;">${tFunc('emptyFriendsState') || "You haven't invited any friends yet.<br>Share your link to start collecting ZELO FC points!"}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات الأصدقاء:", error);
        friendsCountTitle.innerText = `${tFunc('friendsList') || 'Joined Friends List'} (0)`;
        // رسالة الخطأ تم ربطها بالترجمة أيضاً
        friendsListContainer.innerHTML = `<span style="color: #f44336; font-size: 0.9rem;">${tFunc('dbConnectionError') || "Could not connect to the database. Please try again later."}</span>`;
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
// 🚀 [جديد] دالة معالجة الإحالة وتوزيع النقاط على جميع الجداول
// ==========================================
window.apiProcessReferral = async function(referrerId, newUserId) {
    if (!supabaseClient) return { success: false, message: "لا يوجد اتصال بقاعدة البيانات" };
    const rewardPoints = 500; // نقاط الإحالة الثابتة

    try {
        // 1. تسجيل الإحالة في جدول referrals (لتجنب التكرار إذا سجل نفس الشخص مرتين)
        const { error: refError } = await supabaseClient
            .from('referrals')
            .insert([{ referrer_id: referrerId, referred_id: newUserId, reward_points: rewardPoints }]);

        if (refError) {
            // كود 23505 يعني أن الصديق مسجل مسبقاً כـ referred_id (تمت مكافأة الداعي سابقاً)
            if (refError.code === '23505') return { success: true, alreadyProcessed: true }; 
            throw refError;
        }

        // 2. جلب النقاط الحالية للداعي (referrer_id) لضمان عدم ضياع أي نقاط سابقة
        let currentPoints = 0;
        const { data: userData, error: fetchError } = await supabaseClient
            .from('users')
            .select('points')
            .eq('telegram_id', referrerId);

        if (!fetchError && userData && userData.length > 0) {
            currentPoints = parseInt(userData[0].points) || 0;
        }

        const newTotalPoints = currentPoints + rewardPoints;

        // 3. تحديث جدول المستخدمين (users) للداعي
        const { error: userUpsertError } = await supabaseClient
            .from('users')
            .upsert(
                { telegram_id: referrerId, points: newTotalPoints },
                { onConflict: 'telegram_id' }
            );

        if (userUpsertError) throw userUpsertError;

        // 4. تحديث جدول الأندية (club_fans_rankings) بطريقة آمنة تماماً مثل المهام
        const { data: clubData, error: clubFetchError } = await supabaseClient
            .from('club_fans_rankings')
            .select('total_fan_points')
            .eq('telegram_id', referrerId);

        if (!clubFetchError && clubData && clubData.length > 0) {
            const { error: clubUpdateError } = await supabaseClient
                .from('club_fans_rankings')
                .update({ total_fan_points: newTotalPoints })
                .eq('telegram_id', referrerId);

            if (clubUpdateError) {
                console.error("❌ خطأ في تحديث نقاط نادي الداعي:", clubUpdateError);
            }
        }

        console.log(`🎉 تمت معالجة الإحالة بنجاح! إضافة ${rewardPoints} للداعي: ${referrerId}`);
        return { success: true, pointsAdded: rewardPoints };

    } catch (error) {
        console.error("❌ خطأ في عملية معالجة الإحالة:", error);
        return { success: false };
    }
};
