// ==========================================
// 🛠️ ملف قسم المهام (Tasks) - النسخة الحقيقية المربوطة بـ Supabase (بتصميم أسطوري)
// ==========================================

(function() {
    // 1. تحديث الروابط والأسماء إلى Zelo Sport
    window.defaultTasksData = [
        { id: "x", textAr: "متابعة حساب Zelo Sport على X", textEn: "Follow Zelo Sport on X", points: 500, completed: false, url: "https://x.com/Zelo_Sport" },
        { id: "tg_channel", textAr: "الانضمام لقناة تليجرام", textEn: "Join Telegram Channel", points: 400, completed: false, url: "https://t.me/ZeloSport" },
        { id: "youtube", textAr: "الاشتراك في اليوتيوب", textEn: "Subscribe on YouTube", points: 600, completed: false, url: "https://www.youtube.com/@Zelo_Sport" },
        { id: "tg_group_ar", textAr: "الانضمام للمجموعة العربية", textEn: "Join Arabic Group", points: 300, completed: false, url: "https://t.me/ZeloSport_Arab" },
        { id: "tg_group_en", textAr: "الانضمام للمجموعة الأجنبية", textEn: "Join Global Group", points: 300, completed: false, url: "https://t.me/ZeloSport_Global" }
    ];

    // ==========================================
    // 🔄 دوال الاتصال بقاعدة البيانات (API Calls)
    // ==========================================

    async function apiVerifyTask(taskId, points) {
        if (!supabaseClient) return { success: false, message: "لا يوجد اتصال بقاعدة البيانات" };
        
        try {
            const { error: taskError } = await supabaseClient
                .from('user_tasks')
                .insert([{ telegram_id: userState.userId, task_id: taskId, reward_points: points }]);

            if (taskError) {
                if (taskError.code === '23505') return { success: true, alreadyDone: true }; 
                throw taskError;
            }

            let currentPoints = 0;
            const { data: userData, error: fetchError } = await supabaseClient
                .from('users')
                .select('points')
                .eq('telegram_id', userState.userId);

            if (!fetchError && userData && userData.length > 0) {
                currentPoints = parseInt(userData[0].points) || 0;
            }

            const pointsToAdd = parseInt(points) || 0;
            const newPoints = currentPoints + pointsToAdd;

            const { error: userUpsertError } = await supabaseClient
                .from('users')
                .upsert(
                    { telegram_id: userState.userId, points: newPoints },
                    { onConflict: 'telegram_id' }
                );

            if (userUpsertError) throw userUpsertError;

            const { data: clubData, error: clubFetchError } = await supabaseClient
                .from('club_fans_rankings')
                .select('total_fan_points')
                .eq('telegram_id', userState.userId);

            if (!clubFetchError && clubData && clubData.length > 0) {
                const { error: clubUpdateError } = await supabaseClient
                    .from('club_fans_rankings')
                    .update({ total_fan_points: newPoints })
                    .eq('telegram_id', userState.userId);

                if (clubUpdateError) console.error("❌ خطأ في تحديث نقاط النادي:", clubUpdateError);
            }

            return { success: true, alreadyDone: false };
        } catch (error) {
            console.error("❌ خطأ في حفظ المهمة وتحديث النقاط:", error);
            return { success: false };
        }
    }

    async function apiClaimDaily() {
        if (!supabaseClient) return { success: false };
        const dailyPoints = 200; 

        try {
            let currentPoints = 0;
            const { data: userData, error: fetchError } = await supabaseClient
                .from('users')
                .select('points')
                .eq('telegram_id', userState.userId);

            if (!fetchError && userData && userData.length > 0) {
                currentPoints = parseInt(userData[0].points) || 0;
            }

            const newPoints = currentPoints + dailyPoints;

            const { error: updateError } = await supabaseClient
                .from('users')
                .update({ 
                    points: newPoints,
                    last_daily_claim: new Date().toISOString() 
                })
                .eq('telegram_id', userState.userId);

            if (updateError) throw updateError;

            const { data: clubData, error: clubFetchError } = await supabaseClient
                .from('club_fans_rankings')
                .select('total_fan_points')
                .eq('telegram_id', userState.userId);

            if (!clubFetchError && clubData && clubData.length > 0) {
                const { error: clubUpdateError } = await supabaseClient
                    .from('club_fans_rankings')
                    .update({ total_fan_points: newPoints })
                    .eq('telegram_id', userState.userId);
            }

            return { success: true, pointsAdded: dailyPoints };
        } catch (error) {
            console.error("❌ خطأ في المطالبة اليومية:", error);
            return { success: false };
        }
    }

    async function syncTasksFromDB() {
        if (!supabaseClient || !userState.userId) return;

        if (!userState.tasks || userState.tasks.length === 0) {
            userState.tasks = window.defaultTasksData.map(t => ({...t}));
        }

        try {
            const { data: tasksData } = await supabaseClient
                .from('user_tasks')
                .select('task_id')
                .eq('telegram_id', userState.userId);

            if (tasksData) {
                const completedIds = tasksData.map(t => t.task_id);
                userState.tasks.forEach(task => {
                    if (completedIds.includes(task.id)) task.completed = true;
                });
            }

            const { data: userData } = await supabaseClient
                .from('users')
                .select('last_daily_claim')
                .eq('telegram_id', userState.userId)
                .single();

            if (userData && userData.last_daily_claim) {
                const lastClaim = new Date(userData.last_daily_claim);
                const now = new Date();
                const diffHours = Math.abs(now.getTime() - lastClaim.getTime()) / 36e5;
                
                userState.dailyCheckInClaimed = (diffHours < 24);
            } else {
                userState.dailyCheckInClaimed = false;
            }
        } catch (error) {
            console.error("❌ خطأ في مزامنة بيانات المهام:", error);
        }
    }

    // ==========================================
    // 🎨 دوال واجهة المهام (التصميم الأسطوري الجديد)
    // ==========================================

    window.renderTasksPage = async function(container) {
        if (!userState.tasks || userState.tasks.length === 0) {
            userState.tasks = window.defaultTasksData.map(t => ({...t}));
        }

        // ستايلات التصميم الجديد المدمجة في الصفحة
        const styles = `
            <style>
                @keyframes floatGlow {
                    0% { box-shadow: 0 10px 30px rgba(252, 176, 69, 0.15), inset 0 0 15px rgba(253, 29, 29, 0.1); transform: translateY(0); }
                    50% { box-shadow: 0 15px 40px rgba(253, 29, 29, 0.3), inset 0 0 25px rgba(252, 176, 69, 0.2); transform: translateY(-3px); }
                    100% { box-shadow: 0 10px 30px rgba(252, 176, 69, 0.15), inset 0 0 15px rgba(253, 29, 29, 0.1); transform: translateY(0); }
                }

                .legendary-daily-card {
                    background: linear-gradient(135deg, rgba(28, 28, 34, 0.9), rgba(22, 22, 30, 0.9));
                    border: 2px solid rgba(252, 176, 69, 0.3);
                    border-radius: 20px;
                    padding: 22px;
                    margin-bottom: 30px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    position: relative;
                    overflow: hidden;
                    animation: floatGlow 4s infinite alternate;
                    backdrop-filter: blur(15px);
                }

                .legendary-daily-card::before {
                    content: '';
                    position: absolute;
                    top: -50%; left: -50%; width: 200%; height: 200%;
                    background: radial-gradient(circle at center, rgba(252, 176, 69, 0.15) 0%, transparent 60%);
                    pointer-events: none;
                }

                .task-premium-card {
                    background: rgba(26, 26, 34, 0.7);
                    backdrop-filter: blur(10px);
                    border: 1px solid rgba(255, 255, 255, 0.05);
                    border-radius: 18px;
                    padding: 16px;
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    justify-content: space-between;
                    transition: transform 0.3s, box-shadow 0.3s;
                    position: relative;
                    overflow: hidden;
                }

                .task-premium-card:hover {
                    transform: translateY(-4px) scale(1.02);
                }

                .task-icon-box {
                    width: 48px;
                    height: 48px;
                    border-radius: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 1.6rem;
                    flex-shrink: 0;
                    box-shadow: inset 0 2px 10px rgba(255,255,255,0.1);
                }

                /* تخصيص ألوان الأيقونات لكل منصة */
                .icon-x { background: linear-gradient(135deg, #333, #000); border: 1px solid #555; color: white; box-shadow: 0 0 15px rgba(255,255,255,0.1); }
                .icon-tg { background: linear-gradient(135deg, #0088cc, #005580); border: 1px solid #00aaff; color: white; box-shadow: 0 0 15px rgba(0, 136, 204, 0.3); }
                .icon-yt { background: linear-gradient(135deg, #ff0000, #990000); border: 1px solid #ff4444; color: white; box-shadow: 0 0 15px rgba(255, 0, 0, 0.3); }

                .task-info {
                    flex-grow: 1;
                    padding: 0 15px;
                }

                .task-points-badge {
                    display: inline-block;
                    background: rgba(252, 176, 69, 0.15);
                    color: var(--accent-gold);
                    padding: 4px 10px;
                    border-radius: 8px;
                    font-size: 0.85rem;
                    font-weight: 900;
                    margin-top: 6px;
                    border: 1px solid rgba(252, 176, 69, 0.3);
                }

                .btn-task-go {
                    background: linear-gradient(90deg, #833ab4, #fd1d1d);
                    color: white;
                    border: none;
                    padding: 10px 22px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 0.95rem;
                    cursor: pointer;
                    box-shadow: 0 4px 15px rgba(253, 29, 29, 0.3);
                    transition: all 0.3s ease;
                }

                .btn-task-go:hover {
                    background: linear-gradient(90deg, #fd1d1d, #fcb045);
                    box-shadow: 0 6px 20px rgba(252, 176, 69, 0.5);
                    transform: scale(1.05);
                }

                .btn-task-done {
                    background: rgba(255, 255, 255, 0.05);
                    color: #888;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    padding: 10px 22px;
                    border-radius: 20px;
                    font-weight: bold;
                    font-size: 0.95rem;
                    cursor: not-allowed;
                }
            </style>
        `;

        container.innerHTML = styles + `<div style="text-align:center; padding:50px; color: var(--text-main);">⏳ جاري تحميل المهام...</div>`;

        await syncTasksFromDB();
        const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');

        // بناء قائمة المهام بتصميمها الجديد
        let tasksHtml = userState.tasks.map(task => {
            // تحديد شكل الأيقونة واللون بناءً على نوع المهمة
            let iconClass = 'icon-tg';
            let iconSymbol = '✈️';
            
            if (task.id === 'x') {
                iconClass = 'icon-x';
                iconSymbol = '𝕏';
            } else if (task.id === 'youtube') {
                iconClass = 'icon-yt';
                iconSymbol = '▶️';
            }

            // تحديد شكل الزر حسب حالة الاكتمال
            const btnClass = task.completed ? 'btn-task-done' : 'btn-task-go';
            const btnText = task.completed ? (isAr ? 'مكتمل ✅' : 'Done ✅') : (isAr ? 'انطلق 🚀' : 'Go 🚀');
            const btnState = task.completed ? 'disabled' : '';

            return `
                <div class="task-premium-card" style="border-${isAr ? 'right' : 'left'}: 3px solid ${task.completed ? '#10b981' : 'transparent'};">
                    <div class="task-icon-box ${iconClass}">
                        ${iconSymbol}
                    </div>
                    
                    <div class="task-info" style="text-align: ${isAr ? 'right' : 'left'};">
                        <h5 style="margin: 0; color: #fff; font-size: 1.05rem; font-weight: 800; letter-spacing: 0.3px;">${isAr ? task.textAr : task.textEn}</h5>
                        <div class="task-points-badge">+ ${task.points} ZELO</div>
                    </div>
                    
                    <button id="btn-task-${task.id}" 
                            class="${btnClass}" 
                            onclick="executeTask('${task.id}', '${task.url}', ${task.points})" 
                            ${btnState}>
                        ${btnText}
                    </button>
                </div>
            `;
        }).join('');

        // تجميع الهيكل النهائي للصفحة
        container.innerHTML = styles + `
            <div style="text-align: center; margin-bottom: 20px;">
                <h2 style="color: var(--accent-gold); margin: 0 0 5px 0; font-weight: 900; text-shadow: 0 2px 10px rgba(252, 176, 69, 0.4);">
                    ${isAr ? 'مركز المكافآت' : 'Rewards Center'}
                </h2>
                <p style="color: var(--text-muted); font-size: 0.9rem; margin: 0;">
                    ${isAr ? 'أكمل المهام اليومية لزيادة ثروتك من نقاط زيلو!' : 'Complete tasks to boost your ZERO wealth!'}
                </p>
            </div>

            <!-- بطاقة المكافأة اليومية الأسطورية -->
            <div class="legendary-daily-card">
                <div style="text-align: ${isAr ? 'right' : 'left'}; z-index: 1;">
                    <h3 style="margin: 0 0 5px 0; color: #fff; font-size: 1.3rem; font-weight: 900; display:flex; align-items:center; gap:8px;">
                        🎁 ${isAr ? 'صندوق المكافأة اليومية' : 'Daily Reward Chest'}
                    </h3>
                    <p style="margin: 0; font-size: 0.9rem; color: #ccc;">
                        ${isAr ? 'سجل دخولك يومياً لتحصل على' : 'Check in daily to earn'} <b style="color:var(--accent-gold);">+200 ZELO</b>
                    </p>
                </div>
                
                <button id="btn-daily-claim" 
                        class="${userState.dailyCheckInClaimed ? 'btn-task-done' : 'btn-task-go'}" 
                        style="padding: 12px 25px; z-index: 1;"
                        onclick="claimDaily()" 
                        ${userState.dailyCheckInClaimed ? 'disabled' : ''}>
                    ${userState.dailyCheckInClaimed ? (isAr ? 'استلمتها ✔️' : 'Claimed ✔️') : (isAr ? 'استلام الآن ✨' : 'Claim Now ✨')}
                </button>
            </div>

            <div style="display:flex; align-items:center; gap:10px; margin-bottom: 15px;">
                <span style="font-size:1.2rem;">📋</span>
                <h4 style="color: #fff; margin: 0; font-size: 1.15rem;">${isAr ? 'المهام المتاحة' : 'Available Tasks'}</h4>
            </div>
            
            <div class="tasks-container">${tasksHtml}</div>
            
            <div style="height: 20px;"></div>
        `;
    };

    window.executeTask = async function(taskId, url, points) {
        const task = userState.tasks.find(t => t.id === taskId);
        const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');
        
        if (!task || task.completed || task.isProcessing) return;

        task.isProcessing = true; 

        try {
            if (window.Telegram && window.Telegram.WebApp && window.Telegram.WebApp.initData) {
                if (url.includes("t.me")) {
                    window.Telegram.WebApp.openTelegramLink(url);
                } else {
                    window.Telegram.WebApp.openLink(url);
                }
            } else {
                window.open(url, '_blank');
            }
        } catch (e) {
            console.error("خطأ في فتح الرابط:", e);
            window.open(url, '_blank');
        }

        const btn = document.getElementById(`btn-task-${taskId}`);
        if (btn) {
            btn.innerHTML = isAr ? "⏳ جاري التحقق..." : "⏳ Verifying...";
            btn.className = "btn-task-done"; // إعطاء شكل معطل مؤقتاً
            btn.disabled = true;
        }

        setTimeout(async () => {
            try {
                const response = await apiVerifyTask(taskId, points);
                task.isProcessing = false; 

                if (response.success) {
                    task.completed = true;
                    
                    if (!response.alreadyDone) {
                        userState.points = (userState.points || 0) + points; 
                        alert(`🎉 ${isAr ? 'تم إضافة النقاط بنجاح:' : 'Points added successfully:'} ${points} ZERO.`);
                    }

                    if (typeof updateTopBar === "function") updateTopBar();
                    renderTasksPage(document.getElementById("main-content")); 
                } else {
                    alert(isAr ? "حدث خطأ أثناء حفظ المهمة، يرجى المحاولة لاحقاً." : "An error occurred, please try again.");
                    if (btn) {
                        btn.innerHTML = isAr ? 'انطلق 🚀' : 'Go 🚀';
                        btn.className = "btn-task-go";
                        btn.disabled = false;
                    }
                }
            } catch (error) {
                console.error("خطأ في الاتصال:", error);
                task.isProcessing = false; 
                if (btn) {
                    btn.innerHTML = isAr ? 'انطلق 🚀' : 'Go 🚀';
                    btn.className = "btn-task-go";
                    btn.disabled = false;
                }
            }
        }, 4000); 
    };

    window.claimDaily = async function() {
        if (userState.dailyCheckInClaimed) return;

        const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');
        const btn = document.getElementById('btn-daily-claim');
        if (btn) {
            btn.innerHTML = "⏳...";
            btn.className = "btn-task-done";
            btn.disabled = true;
        }

        try {
            const response = await apiClaimDaily();

            if (response.success) {
                userState.dailyCheckInClaimed = true;
                userState.points = (userState.points || 0) + (response.pointsAdded || 200);
                alert(isAr ? 'تم استلام المكافأة اليومية بنجاح! 🎁' : 'Daily reward claimed successfully! 🎁');
                if (typeof updateTopBar === "function") updateTopBar();
                renderTasksPage(document.getElementById("main-content"));
            } else {
                alert(isAr ? "لم تمر 24 ساعة على آخر تسجيل دخول أو حدث خطأ." : "Claim not ready yet or database error.");
                if (btn) {
                    btn.innerHTML = isAr ? 'استلام الآن ✨' : 'Claim Now ✨';
                    btn.className = "btn-task-go";
                    btn.disabled = false;
                }
            }
        } catch (error) {
            console.error("خطأ في الاتصال بالخادم:", error);
            alert(isAr ? "تعذر الاتصال بقاعدة البيانات." : "Could not connect to database.");
            if (btn) {
                btn.innerHTML = isAr ? 'استلام الآن ✨' : 'Claim Now ✨';
                btn.className = "btn-task-go";
                btn.disabled = false;
            }
        }
    };
})();
