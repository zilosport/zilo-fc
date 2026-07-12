// ==========================================
// 👛 ملف قسم المحفظة (Wallet) - (مُحدث بتصميم الأزرار الجديد)
// ==========================================

function renderWalletPage(container) {
    if (userState.walletConnected) {
        const shortAddress = `${userState.walletAddress.slice(0, 6)}...${userState.walletAddress.slice(-6)}`;
        
        container.innerHTML = `
            <div style="background: linear-gradient(145deg, #16161a, #1c1c22); border: 1px solid rgba(76, 175, 80, 0.4); border-radius: 20px; padding: 30px 20px; text-align: center;">
                
                <div style="margin-bottom: 20px;">
                    <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" style="width: 55px; height: 55px; object-fit: contain;">
                </div>
                
                <div style="background: #0d0d11; padding: 12px; border-radius: 10px; border: 1px solid #22222a; margin: 10px 0 20px 0;">
                    <span style="font-family: monospace; font-size: 0.95rem; color: #0088cc; font-weight: bold;">${shortAddress}</span>
                </div>
                
                <div style="background: rgba(255, 255, 255, 0.02); padding: 15px; border-radius: 12px; margin-bottom: 25px;">
                    <span style="font-size: 0.8rem; color: #777788; display: block; margin-bottom: 5px;">${t('walletBalance')}</span>
                    <h2 id="real-ton-balance" style="margin: 0; font-size: 2.2rem; color: #fff; font-weight: bold;">⏳</h2>
                </div>
                
                <div style="display: flex; gap: 12px; justify-content: center;">
                    <!-- 🚀 زر نسخ العنوان بالتصميم الناري الجديد -->
                    <button onclick="copyToClipboard('${userState.walletAddress}')" style="flex: 1; padding: 12px 24px; background: var(--gradient-primary, linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 1rem; box-shadow: 0 4px 15px rgba(253, 29, 29, 0.3);">
                        ${t('btnCopyAddress')}
                    </button>
                    
                    <!-- 🚀 زر قطع الاتصال بنفس الشكل ولكن بلون تحذيري أحمر غامق -->
                    <button onclick="triggerDisconnect()" style="flex: 1; padding: 12px 24px; background: #2a2a35; color: #ff4d4d; border: 1px solid rgba(255, 77, 77, 0.2); border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 1rem;">
                        ${t('btnDisconnect')}
                    </button>
                </div>
            </div>
        `;

        // استدعاء الدالة لجلب الرصيد الحقيقي مباشرة بعد رسم الصفحة
        fetchRealTonBalance(userState.walletAddress);

    } else {
        container.innerHTML = `
            <div style="background: linear-gradient(145deg, #16161a, #1c1c22); border: 1px solid #25252d; border-radius: 20px; padding: 30px 20px; text-align: center;">
                <div style="margin-bottom: 20px;">
                    <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" style="width: 55px; height: 55px; filter: grayscale(100%) opacity(0.6); object-fit: contain;">
                </div>
                <h3 style="color: #fff;">${t('walletConnectTitle')}</h3>
                <p style="color: #aaa; font-size: 0.9rem; line-height: 1.5; margin-bottom: 30px;">${t('walletConnectSub')}</p>
                
                <!-- 🚀 زر ربط المحفظة بالتصميم الناري الجذاب -->
                <button onclick="triggerConnect()" style="padding: 14px 28px; background: var(--gradient-primary, linear-gradient(135deg, #833ab4, #fd1d1d, #fcb045)); color: white; border: none; border-radius: 12px; cursor: pointer; font-weight: bold; font-size: 1.1rem; display: inline-flex; align-items: center; justify-content: center; gap: 10px; box-shadow: 0 4px 20px rgba(253, 29, 29, 0.4); width: 80%;">
                    ${t('btnConnect')}
                </button>
            </div>
        `;
    }
}

// ==========================================
// 🔄 دالة جلب الرصيد الحقيقي من بلوك تشين TON
// ==========================================
async function fetchRealTonBalance(walletAddress) {
    try {
        // الاتصال بـ API مجاني لشبكة TON
        const response = await fetch(`https://toncenter.com/api/v2/getAddressBalance?address=${walletAddress}`);
        const data = await response.json();
        
        if (data.ok) {
            // الرصيد يأتي بوحدة النانو (nanoTON)، نقسمه على مليار للحصول على الرقم الصحيح
            const balanceInTon = (parseInt(data.result) / 1000000000).toFixed(3);
            document.getElementById('real-ton-balance').innerText = `${balanceInTon} TON`;
        } else {
            document.getElementById('real-ton-balance').innerText = '0.000 TON';
        }
    } catch (error) {
        console.error("خطأ في جلب رصيد المحفظة:", error);
        document.getElementById('real-ton-balance').innerText = 'خطأ بالاتصال';
    }
}

// ==========================================
// 💾 دوال حفظ وحذف المحفظة من قاعدة البيانات
// ==========================================
window.saveWalletAddressToDB = async function(walletAddress) {
    if (typeof supabaseClient === 'undefined' || !walletAddress || !userState.userId) return;

    try {
        const { error } = await supabaseClient
            .from('users') 
            .update({ wallet_address: walletAddress }) 
            .eq('telegram_id', userState.userId);

        if (error) throw error;
        console.log("✅ تم حفظ عنوان المحفظة بنجاح في قاعدة البيانات:", walletAddress);
    } catch (err) {
        console.error("❌ خطأ أثناء حفظ عنوان المحفظة في قاعدة البيانات:", err);
    }
};

window.removeWalletAddressFromDB = async function() {
    if (typeof supabaseClient === 'undefined' || !userState.userId) return;

    try {
        const { error } = await supabaseClient
            .from('users')
            .update({ wallet_address: null }) 
            .eq('telegram_id', userState.userId);

        if (!error) console.log("✅ تم مسح عنوان المحفظة من قاعدة البيانات بنجاح.");
    } catch (err) {
        console.error("❌ خطأ أثناء مسح عنوان المحفظة:", err);
    }
};

// ==========================================
// دوال الاتصال وقطع الاتصال
// ==========================================
function triggerConnect() {
    if (typeof tonConnectUI !== "undefined" && tonConnectUI) {
        tonConnectUI.openModal().catch(err => console.error("Error", err));
    }
}

function triggerDisconnect() {
    if (typeof tonConnectUI !== "undefined" && tonConnectUI && tonConnectUI.connected) {
        if(confirm(t('alertDisconnect'))) {
            tonConnectUI.disconnect().then(async () => {
                // 🚀 تنفيذ عملية المسح من قاعدة البيانات عند تأكيد الانفصال
                await window.removeWalletAddressFromDB();
                
                alert(t('alertDisconnected'));
                showPage('wallet');
            });
        }
    }
}
