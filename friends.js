// ==========================================
// 👥 ملف قسم الأصدقاء (Friends) - (جاهز لقواعد البيانات)
// ==========================================

// دالة لتوليد رابط إحالة حقيقي ومخصص لكل مستخدم
function generateReferralLink() {
    let uniqueIdentifier = userState.userId || userState.username || "user";
    let cleanIdentifier = String(uniqueIdentifier).replace(/[@\s]/g, '');
    
    // ⚠️ تأكد من أن 'Zelo_Sport_bot' و 'app' تطابق إعدادات BotFather الخاصة بك
    return `https://t.me/Zelo_Sport_bot/app?startapp=ref_${cleanIdentifier}`;
}

// دالة غير متزامنة (Async) لجلب الأصدقاء من قاعدة البيانات
async function fetchFriendsFromDB(userId) {
    // ⚠️ هنا ستضع كود الاتصال بقاعدة البيانات الخاصة بك (مثلاً: Render, Firebase, أو أي واجهة API برمجتها)
    // هذا مثال لمحاكاة جلب البيانات، يجب استبداله بطلب API حقيقي:
    /*
    try {
        const response = await fetch(`https://your-backend-api.com/api/referrals/${userId}`);
        const data = await response.json();
        return data.friends; // يجب أن تكون مصفوفة تحتوي على بيانات الأصدقاء
    } catch (error) {
        console.error("Error fetching friends:", error);
        return [];
    }
    */
    
    // مؤقتاً نرجع ما هو موجود في userState كقيمة افتراضية لحين تفعيل الـ API
    return userState.referrals || [];
}

// تحويل الدالة إلى async لانتظار البيانات
async function renderFriendsPage(container) {
    const referralLink = generateReferralLink();
    
    // 1. رسم الواجهة الأساسية مع حالة "جاري التحميل..." لقائمة الأصدقاء
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

        <h4 style="color:#fff;" id="friends-count-title">${t('friendsList')} (⏳)</h4>
        <div id="friends-list-container" style="text-align: center; padding: 20px;">
            <span style="color: #888; font-size: 0.9rem;">جاري جلب بيانات الأصدقاء...</span>
        </div>
    `;

    const friendsListContainer = document.getElementById('friends-list-container');
    const friendsCountTitle = document.getElementById('friends-count-title');

    try {
        // 2. جلب البيانات الحقيقية من الـ Backend
        const realFriends = await fetchFriendsFromDB(userState.userId);
        
        // تحديث العداد
        friendsCountTitle.innerText = `${t('friendsList')} (${realFriends.length})`;

        // 3. التحقق من وجود أصدقاء وعرضهم أو عرض الحالة الفارغة
        if (realFriends.length > 0) {
            friendsListContainer.style.textAlign = 'left'; // اضبطها حسب لغة الواجهة
            friendsListContainer.style.padding = '0';
            
            friendsListContainer.innerHTML = realFriends.map(friend => `
                <div style="display: flex; justify-content: space-between; align-items: center; background: #1c1c22; padding: 12px; border-radius: 10px; margin: 6px 0; border: 1px solid #25252d;">
                    <div style="display: flex; align-items: center; gap: 10px;">
                        <span style="font-size: 1.2rem;">👤</span>
                        <span style="color: #fff; font-weight: bold;">${friend.name}</span>
                    </div>
                    <div style="text-align: ${userState.lang === 'ar' ? 'left' : 'right'};">
                        <span style="color: #4caf50; font-size: 0.85rem; font-weight: bold;">+${(friend.rewardPoints || 500)} ZILO FC</span>
                        <br><small style="color: #888; font-size: 0.7rem;">${t('invites')} ${friend.referralsCount || 0}</small>
                    </div>
                </div>
            `).join('');
        } else {
            // حالة فارغة (Empty State) في حال عدم وجود إحالات
            friendsListContainer.innerHTML = `
                <div style="background: rgba(255, 255, 255, 0.02); padding: 20px; border-radius: 12px; border: 1px solid #25252d;">
                    <span style="font-size: 2.5rem; display: block; margin-bottom: 10px;">🤝</span>
                    <p style="color: #aaa; margin: 0; font-size: 0.9rem;">لم تقم بدعوة أي أصدقاء حتى الآن.<br>شارك رابطك لتبدأ بجمع نقاط ZELO FC!</p>
                </div>
            `;
        }
    } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات الأصدقاء:", error);
        friendsCountTitle.innerText = `${t('friendsList')} (0)`;
        friendsListContainer.innerHTML = `<span style="color: #f44336; font-size: 0.9rem;">تعذر الاتصال بالخادم. يرجى المحاولة لاحقاً.</span>`;
    }
}

function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => alert(t('alertCopied')));
}

function shareOnTelegram(link) {
    const text = encodeURIComponent(t('shareText'));
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
    if (typeof tg !== "undefined" && tg && tg.openTelegramLink) {
        tg.openTelegramLink(shareUrl); 
    } else {
        window.open(shareUrl, '_blank');
    }
}
