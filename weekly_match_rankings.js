/**
 * ملف: weekly_match_rankings.js
 * الوظيفة: عرض الثلاثة الأوائل + ترتيب المستخدم الحالي (الترتيب فقط)
 * التحديث: دعم الترجمة الثنائية (عربي/إنجليزي) وتصحيح الاتجاهات
 */

window.renderHomeRankingWidget = async function(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const currentUserId = userState.userId; 
    const isAr = userState.lang === 'ar'; // التحقق من لغة المستخدم

    // إظهار حالة التحميل
    container.innerHTML = `<div style="text-align:center; color: #888; padding: 15px; direction: ${isAr ? 'rtl' : 'ltr'};">
        ${isAr ? '⏳ جاري جلب الترتيب...' : '⏳ Fetching ranking...'}
    </div>`;

    try {
        // 1. جلب أول 3 لاعبين (المنصة)
        const { data: top3 } = await supabaseClient
            .from('weekly_match_rankings')
            .select('points_earned, users!inner(username)')
            .eq('is_eliminated', false)
            .eq('category', 'weekly') // حددنا الفئة هنا
            .order('points_earned', { ascending: false })
            .limit(3);

        // 2. جلب ترتيب المستخدم الحالي
        const { data: myRank } = await supabaseClient.rpc('get_user_rank', {
            p_telegram_id: currentUserId,
            p_category: 'weekly'
        });

        const { data: myData } = await supabaseClient
            .from('weekly_match_rankings')
            .select('points_earned')
            .eq('telegram_id', currentUserId)
            .eq('category', 'weekly')
            .maybeSingle();

        // 3. بناء الواجهة
        const html = `
            <style>
                .podium { display: flex; justify-content: center; gap: 10px; margin-bottom: 15px; direction: ${isAr ? 'rtl' : 'ltr'}; }
                .winner { text-align: center; background: #1c1c22; padding: 10px; border-radius: 10px; width: 30%; border: 1px solid #333; }
                .my-rank-card { background: linear-gradient(135deg, #1e3c72, #2a5298); color: white; padding: 15px; border-radius: 12px; text-align: center; box-shadow: 0 4px 10px rgba(0,0,0,0.2); direction: ${isAr ? 'rtl' : 'ltr'}; }
            </style>

            <div class="podium">
                ${top3 && top3.length > 0 ? top3.map((p, i) => `
                    <div class="winner">
                        <div style="font-size: 1.2rem;">${i === 0 ? '🥇' : i === 1 ? '🥈' : '🥉'}</div>
                        <div style="font-size: 0.75rem; font-weight: bold; margin: 5px 0; overflow: hidden; text-overflow: ellipsis;">${p.users.username}</div>
                        <div style="color: #ffd700; font-size: 0.85rem; font-weight: bold;">${p.points_earned}</div>
                    </div>
                `).join('') : `<div style="color:#666;">${isAr ? 'لا توجد بيانات ترتيب حالياً' : 'No ranking data available'}</div>`}
            </div>

            <div class="my-rank-card">
                <div style="font-size: 0.9rem;">
                    ${isAr ? 'أنت حالياً في المركز:' : 'You are currently ranked:'} 
                    <b style="font-size: 1.1rem;">#${myRank || (isAr ? 'غير مصنف' : 'Unranked')}</b>
                </div>
                <div style="font-size: 0.8rem; margin-top: 5px; opacity: 0.9;">
                    ${isAr ? 'نقاطك:' : 'Your points:'} ${myData ? myData.points_earned : 0} ZELO
                </div>
            </div>
        `;

        container.innerHTML = html;

    } catch (error) {
        console.error(isAr ? "خطأ في عرض الترتيب:" : "Error displaying ranking:", error);
        container.innerHTML = `<div style="text-align:center; color: #ff4444; padding: 10px; direction: ${isAr ? 'rtl' : 'ltr'};">
            ${isAr ? 'تعذر تحميل الترتيب.' : 'Failed to load ranking.'}
        </div>`;
    }
};
