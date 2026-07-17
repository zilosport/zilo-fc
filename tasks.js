// ==========================================
// 🛠️ ملف قسم المهام (Tasks) - النسخة الحقيقية المربوطة بـ Supabase
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
            // حل المشكلة: جلب النقاط الحالية أولاً بدلاً من الاعتماد على RPC
            let currentPoints = 0;
            const { data: userData, error: fetchError } = await supabaseClient
                .from('users')
                .select('points')
                .eq('telegram_id', userState.userId);

            if (!fetchError && userData && userData.length > 0) {
                currentPoints = parseInt(userData[0].points) || 0;
            }

            const newPoints = currentPoints + dailyPoints;

            // تحديث النقاط ووقت المطالبة بطريقة مباشرة ومضمونة
            const { error: updateError } = await supabaseClient
                .from('users')
                .update({ 
                    points: newPoints,
                    last_daily_claim: new Date().toISOString() 
                })
                .eq('telegram_id', userState.userId);

            if (updateError) throw updateError;

            // تحديث نقاط النادي أيضاً لضمان التزامن
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
    // 🎨 دوال واجهة المهام
    // ==========================================

    window.renderTasksPage = async function(container) {
        if (!userState.tasks || userState.tasks.length === 0) {
            userState.tasks = window.defaultTasksData.map(t => ({...t}));
        }

        container.innerHTML = `<div style="text-align:center; padding:50px; color: var(--text-main);">⏳ جاري تحميل المهام...</div>`;

        await syncTasksFromDB();
        const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');

        let tasksHtml = userState.tasks.map(task => `
            <div class="card" style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; padding: 15px;">
                <div style="text-align: ${isAr ? 'right' : 'left'};">
                    <h5 style="margin: 0 0 5px 0; color: var(--text-main); font-size: 1rem;">${isAr ? task.textAr : task.textEn}</h5>
                    <small style="color: var(--accent-gold); font-weight: 900; font-size: 0.9rem;">+ ${task.points} ZERO</small>
                </div>
                <button id="btn-task-${task.id}" 
                        class="${task.completed ? 'btn-secondary' : 'btn-action'}" 
                        onclick="executeTask('${task.id}', '${task.url}', ${task.points})" 
                        ${task.completed ? 'disabled style="opacity: 0.5; cursor: not-allowed; padding: 10px 15px; font-size: 0.9rem; margin: 0;"' : 'style="padding: 10px 15px; font-size: 0.9rem; margin: 0;"'}>
                    ${task.completed ? (isAr ? 'مكتمل' : 'Completed') : (isAr ? 'انطلق' : 'Go')}
                </button>
            </div>
        `).join('');

        container.innerHTML = `
            <h3 style="color: var(--accent-gold); text-align: center; margin-bottom: 5px;">${isAr ? 'ضاعف رصيدك' : 'Earn More ZERO'}</h3>
            <p style="color: var(--text-muted); font-size: 0.85rem; text-align: center; margin-bottom: 20px;">${isAr ? 'أكمل المهام اليومية لزيادة نقاطك ومكافآتك!' : 'Complete tasks to boost your balance!'}</p>

            <div class="card" style="display: flex; align-items: center; justify-content: space-between; padding: 20px; margin-bottom: 25px; border-left: 4px solid var(--accent-orange);">
                <div style="text-align: ${isAr ? 'right' : 'left'};">
                    <h4 style="margin: 0; color: var(--text-main); font-size: 1.1rem;">🎁 ${isAr ? 'المكافأة اليومية' : 'Daily Reward'}</h4>
                    <p style="margin: 5px 0 0 0; font-size: 0.85rem; color: var(--text-muted);">${isAr ? 'سجل دخولك يومياً لتحصل على مكافأتك' : 'Claim your daily free points'}</p>
                </div>
                <button id="btn-daily-claim" 
                        class="${userState.dailyCheckInClaimed ? 'btn-secondary' : 'btn-action'}" 
                        onclick="claimDaily()" 
                        ${userState.dailyCheckInClaimed ? 'disabled style="opacity: 0.5; cursor: not-allowed; margin: 0; padding: 12px 20px;"' : 'style="margin: 0; padding: 12px 20px;"'}>
                    ${userState.dailyCheckInClaimed ? (isAr ? 'تمت المطالبة' : 'Claimed') : (isAr ? 'مطالبة' : 'Claim')}
                </button>
            </div>

            <h4 style="color: var(--text-main); margin-bottom: 15px; text-align: center;">${isAr ? 'المهام الحالية' : 'Current Tasks'} 📋</h4>
            <div class="tasks-container">${tasksHtml}</div>
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
            btn.innerHTML = isAr ? "⏳ التحقق..." : "⏳ Verifying...";
            btn.disabled = true;
            btn.style.opacity = "0.7";
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
                        btn.innerHTML = isAr ? 'انطلق' : 'Go';
                        btn.disabled = false;
                        btn.style.opacity = "1";
                    }
                }
            } catch (error) {
                console.error("خطأ في الاتصال:", error);
                task.isProcessing = false; 
                if (btn) {
                    btn.innerHTML = isAr ? 'انطلق' : 'Go';
                    btn.disabled = false;
                    btn.style.opacity = "1";
                }
            }
        }, 4000); 
    };

    window.claimDaily = async function() {
        if (userState.dailyCheckInClaimed) return;

        const isAr = (typeof userState !== 'undefined' && userState.lang === 'ar');
        const btn = document.getElementById('btn-daily-claim');
        if (btn) {
            btn.innerHTML = "⏳";
            btn.disabled = true;
            btn.style.opacity = "0.7";
        }

        try {
            const response = await apiClaimDaily();

            if (response.success) {
                userState.dailyCheckInClaimed = true;
                userState.points = (userState.points || 0) + (response.pointsAdded || 200);
                alert(isAr ? 'تم استلام المكافأة اليومية بنجاح!' : 'Daily reward claimed successfully!');
                if (typeof updateTopBar === "function") updateTopBar();
                renderTasksPage(document.getElementById("main-content"));
            } else {
                alert(isAr ? "لم تمر 24 ساعة على آخر تسجيل دخول أو حدث خطأ." : "Claim not ready yet or database error.");
                if (btn) {
                    btn.innerHTML = isAr ? 'مطالبة' : 'Claim';
                    btn.disabled = false;
                    btn.style.opacity = "1";
                }
            }
        } catch (error) {
            console.error("خطأ في الاتصال بالخادم:", error);
            alert(isAr ? "تعذر الاتصال بقاعدة البيانات." : "Could not connect to database.");
            if (btn) {
                btn.innerHTML = isAr ? 'مطالبة' : 'Claim';
                btn.disabled = false;
                btn.style.opacity = "1";
            }
        }
    };
})();
