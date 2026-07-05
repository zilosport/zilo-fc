// ==========================================
// 🚀 ملف المهام (tasks.js)
// ==========================================

// تعريف المهام الأساسية ليتم سحبها في app.js
const initialTasksData = [
    { id: "x", textAr: "متابعة حساب Zelo Sport على X", textEn: "Follow Zelo Sport on X", points: 500, completed: false, url: "https://x.com" },
    { id: "tg_channel", textAr: "الانضمام لقناة تليجرام", textEn: "Join Telegram Channel", points: 400, completed: false, url: "https://t.me" },
    { id: "youtube", textAr: "الاشتراك في اليوتيوب", textEn: "Subscribe on YouTube", points: 600, completed: false, url: "https://youtube.com" },
    { id: "tg_group_ar", textAr: "الانضمام للمجموعة العربية", textEn: "Join Arabic Group", points: 300, completed: false, url: "https://t.me/YourArabicGroupLink" },
    { id: "tg_group_en", textAr: "الانضمام للمجموعة الأجنبية", textEn: "Join Global Group", points: 300, completed: false, url: "https://t.me/YourEnglishGroupLink" }
];

// دالة عرض صفحة المهام وتصميمها
function renderTasksPage(container) {
    if (!userState.tasks || userState.tasks.length === 0) {
        userState.tasks = JSON.parse(JSON.stringify(initialTasksData));
    }

    let tasksHtml = userState.tasks.map(task => `
        <div style="background: rgba(28, 28, 34, 0.6); backdrop-filter: blur(8px); border: 1px solid rgba(255, 255, 255, 0.05); padding: 15px; border-radius: 12px; margin-bottom: 12px; display: flex; align-items: center; justify-content: space-between; box-shadow: 0 4px 10px rgba(0,0,0,0.15);">
            <div style="display: flex; flex-direction: column; gap: 5px;">
                <span style="color: #fff; font-weight: bold; font-size: 0.95rem;">${getTaskName(task)}</span>
                <span style="color: #ffd700; font-size: 0.8rem; background: rgba(255, 215, 0, 0.1); padding: 2px 8px; border-radius: 6px; width: fit-content;">+${task.points} ZILO</span>
            </div>
            ${task.completed ? 
                `<button disabled style="background: rgba(76, 175, 80, 0.2); color: #4caf50; border: 1px solid #4caf50; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: not-allowed;">${userState.lang === 'ar' ? 'مكتمل ✅' : 'Done ✅'}</button>` : 
                `<button onclick="startTask('${task.id}')" style="background: #0088cc; color: white; border: none; padding: 8px 15px; border-radius: 8px; font-weight: bold; cursor: pointer; transition: 0.2s;">${userState.lang === 'ar' ? 'تنفيذ ➡' : 'Start ➡'}</button>`
            }
        </div>
    `).join('');

    container.innerHTML = `
        <h3 style="color: #fff; text-align: center; margin-bottom: 5px;">${userState.lang === 'ar' ? 'المهام اليومية' : 'Daily Tasks'} 🛠️</h3>
        <p style="color: #aaa; font-size: 0.85rem; text-align: center; margin-bottom: 20px;">
            ${userState.lang === 'ar' ? 'أكمل المهام لزيادة نقاطك ودعم ناديك!' : 'Complete tasks to earn points and support your club!'}
        </p>
        <div style="display: flex; flex-direction: column; gap: 5px;">
            ${tasksHtml}
        </div>
    `;
}

// وظيفة تنفيذ المهمة الوهمية (محاكاة)
window.startTask = function(taskId) {
    const taskIndex = userState.tasks.findIndex(t => t.id === taskId);
    if(taskIndex > -1) {
        const task = userState.tasks[taskIndex];
        // فتح الرابط
        window.open(task.url, '_blank');
        
        // محاكاة إكمال المهمة بعد العودة
        setTimeout(() => {
            userState.tasks[taskIndex].completed = true;
            userState.points += task.points;
            updateTopBar();
            
            // إعادة رسم الصفحة لتحديث الأزرار
            const contentDiv = document.getElementById("main-content");
            if (contentDiv) renderTasksPage(contentDiv);
            
            alert(userState.lang === 'ar' ? `تهانينا! حصلت على ${task.points} ZILO` : `Congrats! You earned ${task.points} ZILO`);
        }, 3000);
    }
}
