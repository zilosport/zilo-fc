// ==========================================
// 🛠️ ملف قسم المهام (Tasks) - (جاهز لقاعدة البيانات)
// ==========================================

// 1. قائمة المهام الافتراضية (سيتم دمجها أو استبدالها ببيانات الخادم)
const defaultTasksData = [
    { id: "x", textAr: "متابعة حساب Zelo Sport على X", textEn: "Follow Zelo Sport on X", points: 500, completed: false, url: "https://x.com" },
    { id: "tg_channel", textAr: "الانضمام لقناة تليجرام", textEn: "Join Telegram Channel", points: 400, completed: false, url: "https://t.me" },
    { id: "youtube", textAr: "الاشتراك في اليوتيوب", textEn: "Subscribe on YouTube", points: 600, completed: false, url: "https://youtube.com" },
    { id: "tg_group_ar", textAr: "الانضمام للمجموعة العربية", textEn: "Join Arabic Group", points: 300, completed: false, url: "https://t.me/YourArabicGroupLink" },
    { id: "tg_group_en", textAr: "الانضمام للمجموعة الأجنبية", textEn: "Join Global Group", points: 300, completed: false, url: "https://t.me/YourEnglishGroupLink" }
];

// ==========================================
// 🔄 دوال محاكاة الاتصال بقاعدة البيانات (API Calls)
// ==========================================

// أ. دالة إرسال تأكيد إتمام المهمة للسيرفر
async function apiVerifyTask(taskId) {
    // ⚠️ استبدل هذا الكود بطلب fetch حقيقي إلى الخادم الخاص بك
    /*
    const response = await fetch('https://your-api.com/verify-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userState.userId, taskId: taskId })
    });
    return await response.json(); // { success: true, pointsAdded: 500 }
    */
    
    // محاكاة لنجاح العملية مؤقتاً
    return new Promise(resolve => setTimeout(() => resolve({ success: true }), 1000));
}

// ب. دالة طلب المكافأة اليومية من السيرفر
async function apiClaimDaily() {
    // ⚠️ السيرفر هو من يتحقق من تاريخ آخر تسجيل دخول (يجب أن يمر 24 ساعة)
    /*
    const response = await fetch('https://your-api.com/claim-daily', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: userState.userId })
    });
    return await response.json(); // { success: true, pointsAdded: 200 } أو { success: false, message: "انتظر 24 ساعة" }
    */
    
    // محاكاة مؤقتة
    return new Promise(resolve => setTimeout(() => resolve({ success: true, pointsAdded: 200 }), 1000));
}

// ==========================================
// 🎨 دوال واجهة المهام
// ==========================================

async function renderTasksPage(container) {
    // التأكد من تهيئة مهام المستخدم إذا لم تكن موجودة
    if (!userState.tasks || userState.tasks.length === 0) {
        userState.tasks = [...defaultTasksData];
    }

    let tasksHtml = userState.tasks.map(task => `
        <div class="task-card" style="display: flex; justify-content: space-between; align-items: center; background: #1c1c22; margin: 8px 0; padding: 14px; border-radius: 12px; border: 1px solid #25252d;">
            <div>
                <h5 style="margin: 0 0 4px 0; color: #fff;">${getTaskName(task)}</h5>
                <small style="color: #0088cc; font-weight: bold;">+ ${task.points} ZILO FC</small>
            </div>
            <button id="btn-task-${task.id}" onclick="executeTask('${task.id}', '${task.url}')" ${task.completed ? 'disabled style="background:#2b2b36; color:#666; border:none; padding:8px 16px; border-radius:8px;"' : 'style="background:#0088cc; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer;"'}>
                ${task.completed ? t('btnDone') : t('btnGo')}
            </button>
        </div>
    `).join('');

    container.innerHTML = `
        <div class="daily-reward-card" style="background: linear-gradient(135deg, #1e3c72, #2a5298); padding: 15px; border-radius: 14px; display: flex; align-items: center; justify-content: space-between; margin-bottom: 20px;">
            <div>
                <h4 style="margin: 0; color: #fff;">${t('dailyCheckin')}</h4>
                <p style="margin: 4px 0 0 0; font-size: 0.8rem; color: #e0e0e0;">${t('dailyCheckinSub')}</p>
            </div>
            <button id="btn-daily-claim" onclick="claimDaily()" ${userState.dailyCheckInClaimed ? 'disabled style="background:#555;"' : 'style="background:#4caf50; color:white; border:none; padding:8px 16px; border-radius:20px; font-weight:bold; cursor:pointer;"'}>
                ${userState.dailyCheckInClaimed ? t('btnClaimed') : t('btnClaim')}
            </button>
        </div>

        <h3 style="color:#fff; font-size:1.1rem; margin-bottom:10px;">${t('currentTasks')}</h3>
        <div class="tasks-container">${tasksHtml}</div>
    `;
}

// دالة تنفيذ المهمة (مربوطة بقاعدة البيانات)
async function executeTask(taskId, url) {
    const task = userState.tasks.find(t => t.id === taskId);
    if (!task || task.completed) return;

    // فتح الرابط أولاً
    if (typeof tg !== "undefined" && tg && tg.openLink) {
        tg.openLink(url); 
    } else {
        window.open(url, '_blank');
    }

    const btn = document.getElementById(`btn-task-${taskId}`);
    btn.innerHTML = "⏳";
    btn.disabled = true;

    // ننتظر قليلاً لمحاكاة وقت قراءة المستخدم أو انضمامه للقناة
    setTimeout(async () => {
        try {
            // إرسال الطلب لقاعدة البيانات لتسجيل إتمام المهمة
            const response = await apiVerifyTask(taskId);
            
            if (response.success) {
                task.completed = true;
                userState.points += task.points; // تحديث النقاط محلياً بعد تأكيد السيرفر
                alert(`${t('alertTaskDone')} ${task.points} ZILO FC.`);
                updateTopBar();
                showPage('tasks'); // إعادة رسم الصفحة لتحديث حالة الزر
            } else {
                alert("لم يتم التحقق من المهمة، يرجى المحاولة لاحقاً.");
                btn.innerHTML = t('btnGo');
                btn.disabled = false;
            }
        } catch (error) {
            console.error("خطأ في الاتصال بالخادم:", error);
            btn.innerHTML = t('btnGo');
            btn.disabled = false;
        }
    }, 4000); // تأخير 4 ثوانٍ بعد فتح الرابط لضمان قيام المستخدم بالمهمة
}

// دالة المطالبة اليومية (مربوطة بقاعدة البيانات)
async function claimDaily() {
    if (userState.dailyCheckInClaimed) return;

    const btn = document.getElementById('btn-daily-claim');
    btn.innerHTML = "⏳";
    btn.disabled = true;

    try {
        // إرسال طلب للسيرفر للتحقق من مرور 24 ساعة وإضافة النقاط
        const response = await apiClaimDaily();

        if (response.success) {
            userState.dailyCheckInClaimed = true;
            userState.points += response.pointsAdded || 200;
            alert(t('alertDailyDone'));
            updateTopBar();
            showPage('tasks');
            
            // ملاحظة: يجب أن يقوم السيرفر بحفظ وقت آخر مطالبة،
            // وعند تحميل التطبيق للمستخدم في اليوم التالي، السيرفر يرسل `dailyCheckInClaimed = false`
        } else {
            // في حال رفض السيرفر (لم تمر 24 ساعة)
            alert(response.message || "لم تمر 24 ساعة على آخر تسجيل دخول.");
            btn.innerHTML = t('btnClaim');
            btn.disabled = false;
        }
    } catch (error) {
        console.error("خطأ في الاتصال بالخادم:", error);
        alert("تعذر الاتصال بالخادم.");
        btn.innerHTML = t('btnClaim');
        btn.disabled = false;
    }
}
