// ==========================================
// 🌍 دوال مساعدة للترجمة واسترجاع الأسماء (i18n-helpers.js)
// ==========================================

function t(key) {
    return typeof i18n !== 'undefined' && i18n[userState.lang] && i18n[userState.lang][key] ? i18n[userState.lang][key] : key;
}

function getClubName(club) {
    return userState.lang === 'ar' ? club.nameAr : club.nameEn;
}

function getTaskName(task) {
    return userState.lang === 'ar' ? task.textAr : task.textEn;
}

function applyLanguageSettings() {
    document.documentElement.dir = userState.lang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = userState.lang;
    
    const navItems = document.querySelectorAll('.nav-item span:not(.icon)');
    if (navItems.length >= 5) {
        navItems[0].innerText = t('navHome');
        navItems[1].innerText = t('navTasks');
        navItems[2].innerText = t('navFriends');
        navItems[3].innerText = t('navLeaderboard');
        navItems[4].innerText = t('navWallet');
    }
}
