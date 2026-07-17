// ==========================================
// 👛 ملف قسم المحفظة (Wallet) - النسخة الزجاجية الأسطورية 💎
// ==========================================

function renderWalletPage(container) {
    const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');
    
    // ستايلات التصميم الزجاجي الخاصة بالمحفظة
    const walletStyles = `
        <style>
            .wallet-glass-card {
                background: linear-gradient(135deg, rgba(28, 28, 34, 0.7), rgba(18, 18, 22, 0.8));
                backdrop-filter: blur(20px);
                -webkit-backdrop-filter: blur(20px);
                border: 1px solid rgba(255, 255, 255, 0.05);
                border-radius: 24px;
                padding: 40px 25px;
                text-align: center;
                box-shadow: 0 15px 35px rgba(0,0,0,0.5), inset 0 2px 20px rgba(255,255,255,0.02);
                position: relative;
                overflow: hidden;
            }
            .wallet-glass-card::before {
                content: ''; position: absolute; top: -50%; left: -50%; width: 200%; height: 200%;
                background: radial-gradient(circle, rgba(0, 136, 204, 0.1) 0%, transparent 60%);
                pointer-events: none;
                animation: slowRotate 10s linear infinite;
            }
            @keyframes slowRotate {
                100% { transform: rotate(360deg); }
            }

            .wallet-logo-container {
                position: relative;
                width: 80px; height: 80px;
                margin: 0 auto 25px auto;
                background: rgba(255,255,255,0.05);
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                box-shadow: 0 0 25px rgba(0, 136, 204, 0.2);
                border: 2px solid rgba(0, 136, 204, 0.3);
                z-index: 1;
            }

            .address-box-glass {
                background: rgba(0, 0, 0, 0.4);
                border: 1px solid rgba(0, 136, 204, 0.2);
                padding: 12px 20px;
                border-radius: 14px;
                margin-bottom: 25px;
                display: inline-block;
                box-shadow: inset 0 2px 10px rgba(0,0,0,0.5);
                position: relative; z-index: 1;
            }

            .balance-box-glass {
                background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.01));
                border: 1px solid rgba(255,255,255,0.05);
                padding: 25px;
                border-radius: 20px;
                margin-bottom: 30px;
                box-shadow: 0 5px 15px rgba(0,0,0,0.2);
                position: relative; z-index: 1;
                transition: transform 0.3s;
            }
            .balance-box-glass:hover { transform: scale(1.02); border-color: rgba(0, 136, 204, 0.3); }

            .btn-glass-primary {
                background: linear-gradient(135deg, #0088cc, #005580);
                color: white; border: none; border-radius: 16px;
                padding: 16px 24px; font-weight: 900; font-size: 1.1rem;
                cursor: pointer; box-shadow: 0 8px 20px rgba(0, 136, 204, 0.4);
                transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                display: flex; align-items: center; justify-content: center; gap: 10px;
                position: relative; z-index: 1; width: 100%;
            }
            .btn-glass-primary:hover { transform: translateY(-3px); box-shadow: 0 12px 25px rgba(0, 136, 204, 0.6); }
            .btn-glass-primary:active { transform: scale(0.95); }

            .btn-glass-danger {
                background: rgba(253, 29, 29, 0.1);
                color: #fd1d1d; border: 1px solid rgba(253, 29, 29, 0.3);
                border-radius: 14px; padding: 14px 20px; font-weight: bold;
                cursor: pointer; transition: all 0.3s;
                position: relative; z-index: 1; flex: 1;
            }
            .btn-glass-danger:hover { background: rgba(253, 29, 29, 0.2); box-shadow: 0 5px 15px rgba(253, 29, 29, 0.2); }
            
            .btn-glass-copy {
                background: rgba(255, 255, 255, 0.05);
                color: #fff; border: 1px solid rgba(255, 255, 255, 0.1);
                border-radius: 14px; padding: 14px 20px; font-weight: bold;
                cursor: pointer; transition: all 0.3s;
                position: relative; z-index: 1; flex: 1;
            }
            .btn-glass-copy:hover { background: rgba(255, 255, 255, 0.1); border-color: rgba(255, 255, 255, 0.3); }
        </style>
    `;

    if (userState.walletConnected) {
        const shortAddress = `${userState.walletAddress.slice(0, 6)}...${userState.walletAddress.slice(-6)}`;
        
        container.innerHTML = `
            ${walletStyles}
            <div class="wallet-glass-card" style="border-top: 2px solid rgba(0, 136, 204, 0.5);">
                <div class="wallet-logo-container" style="background: rgba(0, 136, 204, 0.1);">
                    <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" style="width: 45px; height: 45px; object-fit: contain; filter: drop-shadow(0 2px 5px rgba(0,0,0,0.5));">
                </div>
                
                <h3 style="color: #fff; margin: 0 0 10px 0; font-size: 1.3rem; font-weight: 900; position: relative; z-index: 1;">
                    ${isAr ? 'المحفظة متصلة' : 'Wallet Connected'}
                </h3>
                
                <div class="address-box-glass">
                    <span style="font-family: monospace; font-size: 1rem; color: #0088cc; font-weight: 900; letter-spacing: 1px;">${shortAddress}</span>
                </div>
                
                <div class="balance-box-glass">
                    <span style="font-size: 0.85rem; color: #94a3b8; display: block; margin-bottom: 8px; font-weight: bold; text-transform: uppercase; letter-spacing: 1px;">
                        ${t('walletBalance')}
                    </span>
                    <h2 id="real-ton-balance" style="margin: 0; font-size: 2.6rem; color: #fff; font-weight: 900; font-family: monospace; text-shadow: 0 4px 10px rgba(0,0,0,0.5);">
                        <span style="display:inline-block; animation: pulseGlowIcon 1.5s infinite; font-size: 2rem;">⏳</span>
                    </h2>
                </div>
                
                <div style="display: flex; gap: 15px; justify-content: center; position: relative; z-index: 1;">
                    <button class="btn-glass-copy" onclick="copyToClipboard('${userState.walletAddress}')">
                        📋 ${t('btnCopyAddress')}
                    </button>
                    
                    <button class="btn-glass-danger" onclick="triggerDisconnect()">
                        🔌 ${t('btnDisconnect')}
                    </button>
                </div>
            </div>
            <div style="height: 30px;"></div>
        `;

        // استدعاء الدالة لجلب الرصيد الحقيقي مباشرة بعد رسم الصفحة
        fetchRealTonBalance(userState.walletAddress);

    } else {
        container.innerHTML = `
            ${walletStyles}
            <div class="wallet-glass-card">
                <div class="wallet-logo-container" style="border-color: rgba(255,255,255,0.1); box-shadow: none;">
                    <img src="https://cryptologos.cc/logos/toncoin-ton-logo.png" alt="TON" style="width: 45px; height: 45px; filter: grayscale(100%) opacity(0.5); object-fit: contain;">
                </div>
                
                <h3 style="color: #fff; margin: 0 0 10px 0; font-size: 1.5rem; font-weight: 900; position: relative; z-index: 1;">
                    ${t('walletConnectTitle')}
                </h3>
                
                <p style="color: #94a3b8; font-size: 0.95rem; line-height: 1.6; margin: 0 0 35px 0; position: relative; z-index: 1; font-weight: bold;">
                    ${t('walletConnectSub')}
                </p>
                
                <button class="btn-glass-primary" onclick="triggerConnect()">
                    <span style="font-size: 1.3rem;">💎</span> ${t('btnConnect')}
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
            const balanceElement = document.getElementById('real-ton-balance');
            if(balanceElement) {
                balanceElement.innerHTML = `${balanceInTon} <span style="color:#0088cc; font-size:1.5rem;">TON</span>`;
            }
        } else {
            const balanceElement = document.getElementById('real-ton-balance');
            if(balanceElement) balanceElement.innerHTML = '0.000 <span style="color:#0088cc; font-size:1.5rem;">TON</span>';
        }
    } catch (error) {
        console.error("خطأ في جلب رصيد المحفظة:", error);
        const balanceElement = document.getElementById('real-ton-balance');
        if(balanceElement) {
            const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');
            balanceElement.innerHTML = `<span style="font-size:1.2rem; color:#fd1d1d;">${isAr ? 'خطأ بالاتصال' : 'Connection Error'}</span>`;
        }
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
