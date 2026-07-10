/**
 * ملف: weekly_ranking.js
 * الوظيفة: جلب وعرض ترتيب أفضل 3 متوقعين أسبوعياً في الشاشة الرئيسية
 */

// متغير للتحكم في رقم الأسبوع الحالي (يمكنك تعديله لاحقاً بسهولة من هنا)
const CURRENT_WEEK = 1; 

// 1. دالة جلب أفضل 3 لاعبين من قاعدة البيانات
async function fetchTopThree(weekNumber) {
    try {
        const { data, error } = await supabase
            .from('user_predictions')
            .select(`
                points_earned,
                users (username, photo_url)
            `)
            // ملاحظة: ستحتاج لاحقاً لربط هذا بجدول يحتوي على مجموع نقاط الأسبوع
            .order('points_earned', { ascending: false })
            .limit(3);

        if (error) throw error;
        return data;
    } catch (error) {
        console.error("⚠️ خطأ في جلب الترتيب الأسبوعي:", error.message);
        return [];
    }
}

// 2. دالة بناء الواجهة وحقنها في الشاشة الرئيسية
async function renderWeeklyLeaderboard(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return; // إذا لم يجد المكان المخصص في الشاشة الرئيسية، يتوقف

    // عرض حالة تحميل مؤقتة
    container.innerHTML = `<p style="text-align:center; color:#888;">جاري تحميل أبطال الأسبوع...</p>`;

    // جلب البيانات
    const topPlayers = await fetchTopThree(CURRENT_WEEK);

    // إذا لم يكن هناك فائزين بعد
    if (!topPlayers || topPlayers.length === 0) {
        container.innerHTML = `<p style="text-align:center; color:#FFD700;">كن أول من يحصل على نقاط ZELO FC هذا الأسبوع!</p>`;
        return;
    }

    // بناء شكل منصة التتويج (يفترض أن لديك تنسيقات CSS جاهزة لها)
    // نستخدم ترتيب المصفوفة: [0] للأول، [1] للثاني، [2] للثالث
    let htmlContent = `<div class="podium-container">`;

    // المركز الثاني
    if (topPlayers[1]) {
        htmlContent += `
            <div class="podium second">
                <div class="avatar">🥈</div>
                <div class="name">${topPlayers[1].users.username}</div>
                <div class="points">${topPlayers[1].points_earned} ZELO</div>
            </div>`;
    }

    // المركز الأول
    if (topPlayers[0]) {
        htmlContent += `
            <div class="podium first">
                <div class="avatar">🥇</div>
                <div class="name">${topPlayers[0].users.username}</div>
                <div class="points">${topPlayers[0].points_earned} ZELO</div>
            </div>`;
    }

    // المركز الثالث
    if (topPlayers[2]) {
        htmlContent += `
            <div class="podium third">
                <div class="avatar">🥉</div>
                <div class="name">${topPlayers[2].users.username}</div>
                <div class="points">${topPlayers[2].points_earned} ZELO</div>
            </div>`;
    }

    htmlContent += `</div>`;

    // عرض الترتيب في الشاشة الرئيسية
    container.innerHTML = htmlContent;
}
