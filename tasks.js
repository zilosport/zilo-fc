// ==========================================
// 🛠️ ملف قسم المهام (Tasks) - النسخة الحقيقية المربوطة بـ Supabase (محدث ومحمي بالكامل 🛡️)
// ==========================================

(function() {
    // 1. قائمة المهام الافتراضية
    window.defaultTasksData = [
        { id: "x", textAr: "متابعة حساب Zelo Sport على X", textEn: "Follow Zelo Sport on X", points: 500, completed: false, url: "https://x.com/Zelo_Sport" },
        { id: "tg_channel", textAr: "الانضمام لقناة تليجرام", textEn: "Join Telegram Channel", points: 400, completed: false, url: "https://t.me/ZeloSport" },
        { id: "youtube", textAr: "الاشتراك في اليوتيوب", textEn: "Subscribe on YouTube", points: 600, completed: false, url: "https://youtube.com/@zelo_sport?si=4HLPUQ1jv51UTlkP" },
        { id: "tg_group_ar", textAr: "الانضمام للمجموعة العربية", textEn: "Join Arabic Group", points: 300, completed: false, url: "https://t.me/ZeloSport_Arab" },
        { id: "tg_group_en", textAr: "الانضمام للمجموعة الأجنبية", textEn: "Join Global Group", points: 300, completed: false, url: "https://t.me/ZeloSport_Global" }
    ];

    // ==========================================
    // 🔄 دوال الاتصال بقاعدة البيانات (API Calls)
    // ==========================================

    // أ. دالة إرسال تأكيد إتمام المهمة لـ Supabase
    async function apiVerifyTask(taskId, points) {
        if (!supabaseClient) return { success: false, message: "لا يوجد اتصال بقاعدة البيانات" };
        
        try {
            // 1. تسجيل المهمة في جدول user_tasks
            const { error: taskError } = await supabaseClient
                .from('user_tasks')
                .insert([{ telegram_id: userState.userId, task_id: taskId, reward_points: points }]);

            if (taskError) {
                // إذا كانت المهمة مسجلة مسبقاً (خطأ التكرار 23505) نعيد alreadyDone لكي لا تتضاعف النقاط
                if (taskError.code === '23505') return { success: true, alreadyDone: true }; 
                throw taskError;
            }

            // 2. جلب النقاط الحالية لجدول المستخدمين
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

            // 3. تحديث أو إنشاء السجل مباشرة في جدول المستخدمين (users)
            const { error: userUpsertError } = await supabaseClient
                .from('users')
                .upsert(
                    { telegram_id: userState.userId, points: newPoints },
                    { onConflict: 'telegram_id' }
                );

            if (userUpsertError) throw userUpsertError;

            // 4. معالجة جدول الأندية (club_fans_rankings) بطريقة آمنة
            // نتحقق أولاً هل للمستخدم سجل في هذا الجدول؟
            const { data: clubData, error: clubFetchError } = await supabaseClient
                .from('club_fans_rankings')
                .select('total_fan_points')
                .eq('telegram_id', userState.userId);

            // إذا لم يكن هناك خطأ، والمستخدم موجود فعلاً في جدول الأندية
            if (!clubFetchError && clubData && clubData.length > 0) {
                // نقوم بعمل Update مباشر للنقاط لتتطابق مع نقاطه الجديدة
                const { error: clubUpdateError } = await supabaseClient
                    .from('club_fans_rankings')
                    .update({ total_fan_points: newPoints })
                    .eq('telegram_id', userState.userId);

                if (clubUpdateError) {
                    console.error("❌ خطأ في تحديث نقاط النادي:", clubUpdateError);
                }
            } else {
                // المستخدم ليس لديه نادي مسجل حتى الآن، يمكن تجاهل التحديث أو طباعة ملاحظة
                console.warn("⚠️ المستخدم ليس لديه سجل في جدول الأندية بعد، تم تحديث نقاط users فقط.");
            }

            return { success: true, alreadyDone: false };
        } catch (error) {
            console.error("❌ خطأ في حفظ المهمة وتحديث النقاط:", error);
            return { success: false };
        }
    }

    // ب. دالة طلب المكافأة اليومية من Supabase
    async function apiClaimDaily() {
        if (!supabaseClient) return { success: false };
        const dailyPoints = 200; 

        try {
            // 1. تحديث وقت آخر مطالبة في جدول المستخدمين
            const { error: updateError } = await supabaseClient
                .from('users')
                .update({ last_daily_claim: new Date().toISOString() })
                .eq('telegram_id', userState.userId);

            if (updateError) throw updateError;

            // 2. إضافة النقاط باستخدام RPC
            const { error: rpcError } = await supabaseClient.rpc('add_user_points', {
                p_telegram_id: userState.userId,
                p_amount: dailyPoints,
                p_source: 'daily_claim',
                p_description: 'مكافأة تسجيل الدخول اليومي'
            });

            if (rpcError) throw rpcError;

            return { success: true, pointsAdded: dailyPoints };
        } catch (error) {
            console.error("❌ خطأ في المطالبة اليومية:", error);
            return { success: false };
        }
    }

    // ج. دالة مزامنة المهام المكتملة من قاعدة البيانات عند فتح الصفحة
    async function syncTasksFromDB() {
        if (!supabaseClient || !userState.userId) return;

        // تأمين مصفوفة المهام محلياً قبل المزامنة
        if (!userState.tasks || userState.tasks.length === 0) {
            userState.tasks = window.defaultTasksData.map(t => ({...t}));
        }

        try {
            // جلب المهام المكتملة
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

            // التحقق من المكافأة اليومية
            const { data: userData } = await supabaseClient
                .from('users')
                .select('last_daily_claim')
                .eq('telegram_id', userState.userId)
                .single();

            if (userData && userData.last_daily_claim) {
                const lastClaim = new Date(userData.last_daily_claim);
                const now = new Date();
                
                // حساب فارق الوقت
                const diffHours = Math.abs(now.getTime() - lastClaim.getTime()) / 36e5;
                
                if (diffHours < 24) {
                    userState.dailyCheckInClaimed = true;
                } else {
                    userState.dailyCheckInClaimed = false;
                }
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

        container.innerHTML = `<div style="text-align:center; padding:50px; color:#fff;">⏳ جاري تحميل المهام...</div>`;

        await syncTasksFromDB();

        let tasksHtml = userState.tasks.map(task => `
            <div class="task-card" style="display: flex; justify-content: space-between; align-items: center; background: #1c1c22; margin: 8px 0; padding: 14px; border-radius: 12px; border: 1px solid #25252d;">
                <div>
                    <h5 style="margin: 0 0 4px 0; color: #fff;">${typeof getTaskName === "function" ? getTaskName(task) : (task.textAr || task.textEn)}</h5>
                    <small style="color: #0088cc; font-weight: bold;">+ ${task.points} ZELO FC</small>
                </div>
                <button id="btn-task-${task.id}" onclick="executeTask('${task.id}', '${task.url}', ${task.points})" ${task.completed ? 'disabled style="background:#2b2b36; color:#666; border:none; padding:8px 16px; border-radius:8px;"' : 'style="background:#0088cc; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer;"'}>
                    ${task.completed ? (typeof t === "function" ? t('btnDone') : 'مكتمل') : (typeof t === "function" ? t('btnGo') : 'انطلق')}
                </button>
            </div>
        `).join('');

        container.innerHTML = `
            <div class="daily-reward-card" style="background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 15px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
                <div>
                    <h4 style="margin: 0; color: #fff;">${typeof t === "function" ? t('dailyCheckin') : 'المكافأة اليومية'}</h4>
                    <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #e0e0e0;">${typeof t === "function" ? t('dailyCheckinSub') : 'سجل دخولك يومياً'}</p>
                </div>
                <button id="btn-daily-claim" onclick="claimDaily()" ${userState.dailyCheckInClaimed ? 'disabled style="background:#555;"' : 'style="background:#4caf50; color:white; border:none; padding:8px 16px; border-radius:20px; font-weight:bold; cursor:pointer;"'}>
                    ${userState.dailyCheckInClaimed ? (typeof t === "function" ? t('btnClaimed') : 'تمت المطالبة') : (typeof t === "function" ? t('btnClaim') : 'مطالبة')}
                </button>
            </div>

            <h3 style="color:#fff; font-size:1.1rem; margin-bottom:10px;">${typeof t === "function" ? t('currentTasks') : 'المهام الحالية'}</h3>
            <div class="tasks-container">${tasksHtml}</div>
        `;
    };

    // 🛡️ دالة تنفيذ المهمة (محمية ضد الضغط المزدوج)
    window.executeTask = async function(taskId, url, points) {
        const task = userState.tasks.find(t => t.id === taskId);
        
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
            console.error("خطأ في فتح الرابط، محاولة بديلة:", e);
            window.open(url, '_blank');
        }

        const btn = document.getElementById(`btn-task-${taskId}`);
        if (btn) {
            btn.innerHTML = "⏳ التحقق...";
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
                        const doneMsg = typeof t === "function" ? t('alertTaskDone') : 'تم إضافة النقاط بنجاح:';
                        alert(`🎉 ${doneMsg} ${points} ZELO FC.`);
                    }

                    if (typeof updateTopBar === "function") updateTopBar();
                    renderTasksPage(document.getElementById("main-content")); 
                } else {
                    alert("حدث خطأ أثناء حفظ المهمة، يرجى المحاولة لاحقاً.");
                    if (btn) {
                        btn.innerHTML = typeof t === "function" ? t('btnGo') : 'انطلق';
                        btn.disabled = false;
                    }
                }
            } catch (error) {
                console.error("خطأ في الاتصال:", error);
                task.isProcessing = false; 
                if (btn) {
                    btn.innerHTML = typeof t === "function" ? t('btnGo') : 'انطلق';
                    btn.disabled = false;
                }
            }
        }, 4000); 
    };

    // دالة المطالبة اليومية
    window.claimDaily = async function() {
        if (userState.dailyCheckInClaimed) return;

        const btn = document.getElementById('btn-daily-claim');
        if (btn) {
            btn.innerHTML = "⏳";
            btn.disabled = true;
        }

        try {
            const response = await apiClaimDaily();

            if (response.success) {
                userState.dailyCheckInClaimed = true;
                userState.points = (userState.points || 0) + (response.pointsAdded || 200);
                alert(typeof t === "function" ? t('alertDailyDone') : 'تم استلام المكافأة اليومية بنجاح!');
                if (typeof updateTopBar === "function") updateTopBar();
                renderTasksPage(document.getElementById("main-content"));
            } else {
                alert("لم تمر 24 ساعة على آخر تسجيل دخول أو حدث خطأ.");
                if (btn) {
                    btn.innerHTML = typeof t === "function" ? t('btnClaim') : 'مطالبة';
                    btn.disabled = false;
                }
            }
        } catch (error) {
            console.error("خطأ في الاتصال بالخادم:", error);
            alert("تعذر الاتصال بقاعدة البيانات.");
            if (btn) {
                btn.innerHTML = typeof t === "function" ? t('btnClaim') : 'مطالبة';
                btn.disabled = false;
            }
        }
    };
})();
