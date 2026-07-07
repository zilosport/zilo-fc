// ==========================================
// 👥 ملف قسم الأصدقاء والإحالات (Friends)
// ==========================================

function renderFriendsPage(container) {
    const referralLink = `https://t.me/ZeloSport_Bot/app?startapp=ref_${userState.userParam}`;
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

// دالة نسخ النصوص (تُستخدم هنا وفي المحفظة أيضاً)
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => alert(t('alertCopied')));
}

// دالة المشاركة عبر تليجرام
function shareOnTelegram(link) {
    const text = encodeURIComponent(t('shareText'));
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent(link)}&text=${text}`;
    if (typeof tg !== "undefined" && tg && tg.openTelegramLink) tg.openTelegramLink(shareUrl); else window.open(shareUrl, '_blank');
}
