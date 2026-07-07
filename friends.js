// ==========================================
// 👥 ملف قسم الأصدقاء (Friends)
// ==========================================

// دالة لتوليد رابط إحالة حقيقي ومخصص لكل مستخدم
function generateReferralLink() {
    // نعتمد على ID المستخدم كخيار أول لأنه لا يتغير، وإذا لم يوجد نأخذ اسم المستخدم
    let uniqueIdentifier = userState.userId || userState.username || "user";
    
    // تنظيف المعرف من أي مسافات أو علامة @ ليكون الرابط برمجياً صحيحاً (URL Safe)
    let cleanIdentifier = String(uniqueIdentifier).replace(/[@\s]/g, '');
    
    // دمج المعرف مع رابط البوت الخاص بك لإنتاج رابط الدعوة
    return `https://t.me/ZeloSport_Bot/app?startapp=ref_${cleanIdentifier}`;
}

function renderFriendsPage(container) {
    // استدعاء دالة توليد الرابط
    const referralLink = generateReferralLink();
    
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
    if (typeof tg !== "undefined" && tg && tg.openTelegramLink) {
        tg.openTelegramLink(shareUrl); 
    } else {
        window.open(shareUrl, '_blank');
    }
}
