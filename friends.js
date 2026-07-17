// ==========================================
// 👥 ملف قسم الأصدقاء (Friends) - نسخة الـ VIP المتوهجة (مربوط بـ Supabase 🚀)
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

        // 3. جلب عدد الأشخاص الذين قام كل صديق بدعوتهم
        const { data: subReferrals, error: subRefError } = await supabaseClient
            .from('referrals')
            .select('referrer_id')
            .in('referrer_id', friendIds);

        const inviteCounts = {};
        if (!subRefError && subReferrals) {
            subReferrals.forEach(r => {
                inviteCounts[r.referrer_id] = (inviteCounts[r.referrer_id] || 0) + 1;
            });
        }

        // 4. بناء القائمة النهائية ودمج البيانات
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
                referralsCount: inviteCounts[ref.referred_id] || 0 
            };
        });

        return friendsList;
    } catch (error) {
        console.error("❌ خطأ أثناء جلب الأصدقاء من Supabase:", error);
        return [];
    }
};

// دالة رسم الواجهة الأسطورية
window.renderFriendsPage = async function(container) {
    const referralLink = window.generateReferralLink();
    let tFunc = typeof t === 'function' ? t : (key) => key;
    const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');

    // نصوص توضيحية ذكية لنظام العمولة
    const commissionTitle = isAr ? '🎁 نظام الأرباح والعمولة المستمرة (10%)' : '🎁 10% Continuous Commission';
    const commissionDesc = isAr 
        ? 'شارك رابط الإحالة الخاص بك، وستحصل تلقائياً وبشكل مستمر على عمولة بنسبة <b style="color:#fcb045;">10%</b> من رصيد النقاط التي يجمعونها أثناء لعبهم!' 
        : 'Share your link, and earn a lifetime <b style="color:#fcb045;">10%</b> commission from all the points they collect while playing!';

    const borderSide = isAr ? 'border-right' : 'border-left';

    container.innerHTML = `
        <style>
            /* ====== التأثيرات والبطاقات الزجاجية لقسم الأصدقاء ====== */
            .glass-info-card {
                background: linear-gradient(135deg, rgba(252, 176, 69, 0.08), rgba(28, 28, 34, 0.8));
                backdrop-filter: blur(15px);
                -webkit-backdrop-filter: blur(15px);
                border: 1px solid rgba(252, 176, 69, 0.2);
                border-radius: 20px;
                padding: 22px;
                margin-bottom: 25px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.5), inset 0 2px 15px rgba(252, 176, 69, 0.05);
                ${borderSide}: 5px solid var(--accent-gold, #fcb045);
            }

            .glass-link-card {
                background: rgba(28, 28, 34, 0.6);
                backdrop-filter: blur(15px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 20px;
                padding: 25px 20px;
                margin-bottom: 30px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.6);
                text-align: center;
            }

            .link-text-box {
                background: rgba(0, 0, 0, 0.5);
                color: var(--accent-gold, #fcb045);
                font-family: monospace;
                font-size: 0.85rem;
                padding: 15px;
                border-radius: 12px;
                word-break: break-all;
                border: 1px dashed rgba(252, 176, 69, 0.4);
                margin-bottom: 20px;
                box-shadow: inset 0 2px 10px rgba(0,0,0,0.8);
            }

            .btn-glass-secondary {
                background: rgba(255, 255, 255, 0.05);
                color: var(--accent-gold, #fcb045);
                border: 1px solid rgba(252, 176, 69, 0.3);
                backdrop-filter: blur(10px);
                padding: 14px; 
                border-radius: 14px;
                font-weight: 900; 
                font-size: 0.95rem;
                cursor: pointer; 
                flex: 1; 
                transition: all 0.3s;
            }
            .btn-glass-secondary:hover {
                background: rgba(252, 176, 69, 0.15);
                box-shadow: 0 0 15px rgba(252, 176, 69, 0.2);
                transform: translateY(-2px);
            }
            .btn-glass-secondary:active { transform: scale(0.95); }

            .glass-friend-row {
                display: flex; justify-content: space-between; align-items: center;
                background: rgba(28, 28, 34, 0.5);
                backdrop-filter: blur(12px);
                padding: 16px 20px; margin-bottom: 12px;
                border-radius: 16px; border: 1px solid rgba(255,255,255,0.03);
                transition: transform 0.2s, background 0.2s, box-shadow 0.2s;
            }
            .glass-friend-row:hover {
                background: rgba(40, 40, 50, 0.8);
                transform: translateY(-3px) scale(1.02);
                box-shadow: 0 8px 20px rgba(0,0,0,0.4);
                border-color: rgba(252, 176, 69, 0.2);
            }

            .empty-state-glass {
                text-align: center; padding: 40px 20px;
                background: rgba(255,255,255,0.02);
                border-radius: 20px; border: 1px dashed rgba(255,255,255,0.1);
            }
        </style>

        <div style="text-align: center; margin-bottom: 25px;">
            <h2 style="color: var(--accent-gold, #fcb045); margin: 0 0 5px 0; font-size: 1.8rem; font-weight: 900; text-shadow: 0 4px 15px rgba(252, 176, 69, 0.4);">
                🤝 ${tFunc('referralTitle') || (isAr ? 'نظام الدعوات' : 'Referral System')}
            </h2>
            <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0; font-weight: bold;">
                ${tFunc('referralSub') || (isAr ? 'انشر رابطك وابدأ في جني الأرباح حية!' : 'Share your link and earn live rewards!')}
            </p>
        </div>
        
        <!-- بطاقة شرح العمولة الزجاجية -->
        <div class="glass-info-card" style="text-align: ${isAr ? 'right' : 'left'};">
            <h4 style="margin: 0 0 10px 0; color: #fff; font-size: 1.15rem; font-weight: 900; letter-spacing: 0.5px;">${commissionTitle}</h4>
            <p style="margin: 0; color: #aaa; font-size: 0.9rem; line-height: 1.6;">${commissionDesc}</p>
        </div>

        <!-- صندوق رابط الإحالة الزجاجي -->
        <div class="glass-link-card">
            <div class="link-text-box" id="ref-link-box">${referralLink}</div>
            <div style="display: flex; gap: 12px; justify-content: center;">
                <button class="btn-action" onclick="window.copyToClipboard('${referralLink}')" style="margin-top: 0; flex: 1;">
                    📋 ${tFunc('btnCopy') || (isAr ? 'نسخ الرابط' : 'Copy Link')}
                </button>
                <button class="btn-glass-secondary" onclick="window.shareOnTelegram('${referralLink}')">
                    🚀 ${tFunc('btnShare') || (isAr ? 'مشاركة' : 'Share')}
                </button>
            </div>
        </div>

        <!-- قائمة الأصدقاء -->
        <div style="display: flex; align-items: center; gap: 8px; margin-bottom: 15px;">
            <span style="font-size: 1.2rem;">👥</span>
            <h4 style="color: #fff; margin: 0; font-size: 1.15rem; font-weight: 800;" id="friends-count-title">
                ${tFunc('friendsList') || (isAr ? 'قائمة الأصدقاء المنضمين' : 'Joined Friends List')} (⏳)
            </h4>
        </div>
        
        <div id="friends-list-container" style="text-align: center; padding-bottom: 30px;">
            <div style="padding: 40px; color: var(--accent-gold); font-weight: 900; animation: pulseGlowIcon 1.5s infinite;">
                ${tFunc('fetchingFriends') || (isAr ? '⏳ جاري جلب الأبطال...' : '⏳ Fetching heroes...')}
            </div>
        </div>
    `;

    const friendsListContainer = document.getElementById('friends-list-container');
    const friendsCountTitle = document.getElementById('friends-count-title');

    try {
        const realFriends = await window.fetchFriendsFromDB(userState.userId);
        friendsCountTitle.innerText = `${tFunc('friendsList') || (isAr ? 'قائمة الأصدقاء' : 'Joined Friends')} (${realFriends.length})`;

        if (realFriends.length > 0) {
            friendsListContainer.style.textAlign = isAr ? 'right' : 'left';
            
            friendsListContainer.innerHTML = realFriends.map(friend => `
                <div class="glass-friend-row">
                    <div style="display: flex; align-items: center; gap: 15px;">
                        <div style="background: rgba(255,255,255,0.1); width: 45px; height: 45px; border-radius: 12px; display: flex; align-items: center; justify-content: center; font-size: 1.4rem; border: 1px solid rgba(255,255,255,0.05);">
                            👤
                        </div>
                        <div>
                            <div style="color: #fff; font-weight: 900; font-size: 1.1rem; letter-spacing: 0.5px;">${friend.name}</div>
                            <div style="color: #94a3b8; font-size: 0.8rem; font-weight: bold; margin-top: 4px;">
                                ${tFunc('invites') || (isAr ? 'قام بدعوة:' : 'Invited:')} <span style="color:#fff;">${friend.referralsCount}</span>
                            </div>
                        </div>
                    </div>
                    <div style="text-align: ${isAr ? 'left' : 'right'};">
                        <div style="color: var(--accent-gold, #fcb045); font-size: 1.15rem; font-weight: 900; font-family: monospace; text-shadow: 0 0 10px rgba(252, 176, 69, 0.4);">
                            +${(friend.totalCommission || 0).toLocaleString()} 🏆
                        </div>
                        <div style="color: #10b981; font-size: 0.75rem; font-weight: bold; margin-top: 4px;">
                            ${isAr ? 'عمولة مكتسبة' : 'Commission'}
                        </div>
                    </div>
                </div>
            `).join('');
        } else {
            friendsListContainer.innerHTML = `
                <div class="empty-state-glass">
                    <span style="font-size: 3.5rem; display: block; margin-bottom: 15px; opacity: 0.8;">🤝</span>
                    <p style="color: #aaa; margin: 0; font-size: 1rem; line-height: 1.6; font-weight: bold;">
                        ${tFunc('emptyFriendsState') || (isAr ? 'لم تقم بدعوة أي أصدقاء حتى الآن.<br>انشر رابطك لتفعيل عمولتك المستمرة!' : "You haven't invited any friends yet.<br>Share your link to activate your commission!")}
                    </p>
                </div>
            `;
        }
    } catch (error) {
        console.error("حدث خطأ أثناء تحميل بيانات الأصدقاء:", error);
        friendsCountTitle.innerText = `${tFunc('friendsList') || (isAr ? 'قائمة الأصدقاء المنضمين' : 'Joined Friends List')} (0)`;
        friendsListContainer.innerHTML = `<div class="empty-state-glass"><span style="color: #fd1d1d; font-size: 0.95rem; font-weight: bold;">${tFunc('dbConnectionError') || (isAr ? '❌ فشل الاتصال. يرجى المحاولة لاحقاً.' : "❌ Connection failed. Please try again.")}</span></div>`;
    }
};

window.copyToClipboard = function(text) {
    navigator.clipboard.writeText(text).then(() => {
        let alertMsg = typeof t === 'function' ? t('alertCopied') : (userState.lang === 'ar' ? 'تم نسخ الرابط بنجاح! 📋' : 'Link copied successfully! 📋');
        
        // تأثير وميض خفيف لصندوق الرابط عند النسخ
        const linkBox = document.getElementById('ref-link-box');
        if(linkBox) {
            linkBox.style.background = 'rgba(252, 176, 69, 0.3)';
            setTimeout(() => { linkBox.style.background = 'rgba(0, 0, 0, 0.5)'; }, 300);
        }
        
        alert(alertMsg);
    });
};

window.shareOnTelegram = function(link) {
    const defaultShareText = userState.lang === 'ar' 
        ? 'توقع نتائج أهم المباريات واجمع المكافآت والعملات الرقمية معي مجاناً في Zelo Sport! 🏆' 
        : 'Choose your favorite club in ZELO FC and collect crypto rewards with me for free! 🏆';
    
    const text = encodeURIComponent((typeof t === 'function' ? t('shareText') : defaultShareText));
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
