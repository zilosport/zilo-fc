// ==========================================
// 🛠️ ملف قسم المهام (Tasks) - (البيانات والوظائف)
// ==========================================

// 1. قائمة المهام (يمكنك تعديلها وإضافة مهام جديدة من هنا فقط)
const defaultTasksData = [
    { id: "x", textAr: "متابعة حساب Zelo Sport على X", textEn: "Follow Zelo Sport on X", points: 500, completed: false, url: "https://x.com" },
    { id: "tg_channel", textAr: "الانضمام لقناة تليجرام", textEn: "Join Telegram Channel", points: 400, completed: false, url: "https://t.me" },
    { id: "youtube", textAr: "الاشتراك في اليوتيوب", textEn: "Subscribe on YouTube", points: 600, completed: false, url: "https://youtube.com" },
    { id: "tg_group_ar", textAr: "الانضمام للمجموعة العربية", textEn: "Join Arabic Group", points: 300, completed: false, url: "https://t.me/YourArabicGroupLink" },
    { id: "tg_group_en", textAr: "الانضمام للمجموعة الأجنبية", textEn: "Join Global Group", points: 300, completed: false, url: "https://t.me/YourEnglishGroupLink" }
];

// 2. دوال واجهة المهام
function renderTasksPage(container) {
    let tasksHtml = userState.tasks.map(task => `
        <div class="task-card" style="display: flex; justify-content: space-between; align-items: center; background: #1c1c22; margin: 8px 0; padding: 14px; border-radius: 12px; border: 1px solid #25252d;">
            <div>
                <h5 style="margin: 0 0 4px 0; color: #fff;">${getTaskName(task)}</h5>
                <small style="color: #0088cc; font-weight: bold;">+ ${task.points} ZELOFC</small>
            </div>
            <button onclick="executeTask('${task.id}', '${task.url}')" ${task.completed ? 'disabled style="background:#2b2b36; color:#666; border:none; padding:8px 16px; border-radius:8px;"' : 'style="background:#0088cc; color:white; border:none; padding:8px 16px; border-radius:8px; font-weight:bold; cursor:pointer;"'}>
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
            <button onclick="claimDaily()" ${userState.dailyCheckInClaimed ? 'disabled style="background:#555;"' : 'style="background:#4caf50; color:white; border:none; padding:8px 16px; border-radius:20px; font-weight:bold; cursor:pointer;"'}>
                ${userState.dailyCheckInClaimed ? t('btnClaimed') : t('btnClaim')}
            </button>
        </div>

        <h3 style="color:#fff; font-size:1.1rem; margin-bottom:10px;">${t('currentTasks')}</h3>
        <div class="tasks-container">${tasksHtml}</div>
    `;
}

function executeTask(taskId, url) {
    if (typeof tg !== "undefined" && tg && tg.openLink) tg.openLink(url); else window.open(url, '_blank');
    setTimeout(() => {
        const task = userState.tasks.find(t => t.id === taskId);
        if (task && !task.completed) {
            task.completed = true;
            userState.points += task.points;
            alert(`${t('alertTaskDone')} ${task.points} ZILOFC.`);
            updateTopBar();
            showPage('tasks');
        }
    }, 4000);
}

function claimDaily() {
    if(!userState.dailyCheckInClaimed) {
        userState.dailyCheckInClaimed = true;
        userState.points += 200;
        alert(t('alertDailyDone'));
        updateTopBar();
        showPage('tasks');
    }
}
