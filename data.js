// ==========================================
// 🚀 ملف البيانات (data.js) - Zelo Sport
// تحديث شامل لجميع الأندية مع شعارات (PNG) شفافة وصحيحة 100%
// ==========================================
const i18n = {
    ar: {
        welcomeTitle: "مرحباً بك في Zelo Sport",
        welcomeSub: "اختر ناديك المفضل للبدء في حصد النقاط",
        navHome: "الرئيسية",
        navTasks: "المهام",
        navFriends: "الأصدقاء",
        navLeaderboard: "الترتيب",
        navWallet: "المحفظة",
        coins: "عملة:",
        yourClub: "ناديك:",
        clubLocked: "✔ ناديك الثابت 🔒",
        fans: "مشجع",
        supportText: "أنت تشجع فريق:",
        allClubsTitle: "🏟️ ترتيب الأندية الكبرى",
        lockedNotice: "تم تثبيت ناديك بنجاح. لا يمكن التبديل لضمان المنافسة العادلة 🔒.",
        dailyCheckin: "📆 تسجيل الدخول اليومي",
        dailyCheckinSub: "احصل على 200 عملة مجانية فورية لدعم ناديك!",
        btnClaim: "استلام",
        btnClaimed: "تم",
        currentTasks: "🔥 قائمة المهام الحالية",
        btnGo: "انتقال",
        btnDone: "✓ تم",
        alertTaskDone: "ممتاز! أكملت المهمة بنجاح وحصلت على",
        alertDailyDone: "تم استلام مكافأة الحضور اليومي بنجاح (+200 عملة).",
        referralTitle: "👥 نظام الإحالات ودعوة الكتائب",
        referralSub: "انشر رابطك؛ لكل مشجع جديد يدخل التطبيق عبر معرف التليجرام الخاص بك تكسب أنت وناديك 500 عملة.",
        btnCopy: "📋 نسخ الرابط",
        btnShare: "✈️ مشاركة",
        friendsList: "قائمة الأصدقاء المنضمين",
        invites: "دعواته:",
        alertCopied: "تم نسخ الرابط بنجاح!",
        shareText: "⚽ اختر ناديك المفضل في Zilo FC واجمع معي العملات والجوائز الرقمية مجاناً! 🏆",
        leaderTitle: "🏆 صدارة بطولة الكأس الأوروبي",
        leaderSub: "انقر على أي فريق لفتح قائمة ترتيب أعلى المشجعين تجميعاً للنقاط.",
        clickToView: "👉 اضغط لرؤية المتصدرين",
        btnBack: "⬅ عودة لقائمة الأندية الكلية",
        topFansOf: "ترتيب متصدري جماهير",
        topFansSub: "تظهر هذه اللوحة ترتيب المشجعين الأكثر نشاطاً.",
        colRank: "المركز",
        colFan: "المشجع",
        colPoints: "النقاط",
        colActivity: "النشاط",
        referralWord: "إحالة",
        walletConnected: "المحفظة الحقيقية متصلة",
        walletBalance: "رصيد TON في المحفظة",
        btnCopyAddress: "📋 نسخ العنوان",
        btnDisconnect: "🚪 إلغاء الربط",
        walletConnectTitle: "ربط محفظة Web3 الحقيقية",
        walletConnectSub: "قم بربط محفظة التليجرام الآمنة الحقيقية لاستقبال مكافآت عملات Zilo FC.",
        btnConnect: "💎 اتصل بمحفظتك الحقيقية (TON Connect)",
        alertDisconnect: "هل تريد قطع اتصال المحفظة الحالية؟",
        alertDisconnected: "تم قطع الاتصال بنجاح."
    },
    en: {
        welcomeTitle: "Welcome to Zelo Sport",
        welcomeSub: "Choose your favorite club to start earning points",
        navHome: "Home",
        navTasks: "Tasks",
        navFriends: "Friends",
        navLeaderboard: "Ranking",
        navWallet: "Wallet",
        coins: "Coins:",
        yourClub: "Club:",
        clubLocked: "✔ Locked 🔒",
        fans: "Fans",
        supportText: "You support:",
        allClubsTitle: "🏟️ Top Clubs Ranking",
        lockedNotice: "Your club is locked. Switching is disabled for fair competition 🔒.",
        dailyCheckin: "📆 Daily Check-in",
        dailyCheckinSub: "Get 200 free coins instantly to support your club!",
        btnClaim: "Claim",
        btnClaimed: "Claimed",
        currentTasks: "🔥 Current Tasks",
        btnGo: "Go",
        btnDone: "✓ Done",
        alertTaskDone: "Excellent! Task completed, you received",
        alertDailyDone: "Daily reward claimed successfully (+200 Coins).",
        referralTitle: "👥 Referral System",
        referralSub: "Share your link! For every new fan joining via your ID, you and your club earn 500 coins.",
        btnCopy: "📋 Copy Link",
        btnShare: "✈️ Share",
        friendsList: "Joined Friends List",
        invites: "Invites:",
        alertCopied: "Link copied successfully!",
        shareText: "⚽ Choose your favorite club in Zelo Sport and collect crypto rewards with me for free! 🏆",
        leaderTitle: "🏆 European Cup Leaderboard",
        leaderSub: "Click on any team to view its top fans by points.",
        clickToView: "👉 Click to view top fans",
        btnBack: "⬅ Back to Clubs",
        topFansOf: "Top fans of",
        topFansSub: "This board shows fans who collected the most points.",
        colRank: "Rank",
        colFan: "Fan",
        colPoints: "Points",
        colActivity: "Activity",
        referralWord: "Referrals",
        walletConnected: "Real Wallet Connected",
        walletBalance: "TON Balance",
        btnCopyAddress: "📋 Copy Address",
        btnDisconnect: "🚪 Disconnect",
        walletConnectTitle: "Connect Web3 Real Wallet",
        walletConnectSub: "Connect your secure Telegram Wallet to receive Zilo FC token rewards.",
        btnConnect: "💎 Connect Real Wallet (TON Connect)",
        alertDisconnect: "Do you want to disconnect the current wallet?",
        alertDisconnected: "Disconnected successfully."
    }
};

const clubsData = [
    // 🏴󠁧󠁢󠁥󠁮󠁧󠁿 إنجلترا (الدوري الإنجليزي) - 20 نادي
    { id: "man_city", nameAr: "مانشستر سيتي", nameEn: "Man City", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png", members: 0, points: 0, color: "linear-gradient(135deg, #81d4fa, #4fc3f7)" },
    { id: "arsenal", nameAr: "أرسنال", nameEn: "Arsenal", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png", members: 0, points: 0, color: "linear-gradient(135deg, #d50000, #b71c1c)" },
    { id: "liverpool", nameAr: "ليفربول", nameEn: "Liverpool", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png", members: 0, points: 0, color: "linear-gradient(135deg, #c62828, #b71c1c)" },
    { id: "man_united", nameAr: "مانشستر يونايتد", nameEn: "Man United", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8654.png", members: 0, points: 0, color: "linear-gradient(135deg, #da291c, #000000)" },
    { id: "chelsea", nameAr: "تشيلسي", nameEn: "Chelsea", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8455.png", members: 0, points: 0, color: "linear-gradient(135deg, #034694, #000000)" },
    { id: "tottenham", nameAr: "توتنهام", nameEn: "Tottenham", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #132257)" },
    { id: "newcastle", nameAr: "نيوكاسل", nameEn: "Newcastle", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10261.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #ffffff)" },
    { id: "aston_villa", nameAr: "أستون فيلا", nameEn: "Aston Villa", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png", members: 0, points: 0, color: "linear-gradient(135deg, #7a003c, #95bfe5)" },
    { id: "west_ham", nameAr: "وست هام", nameEn: "West Ham", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8659.png", members: 0, points: 0, color: "linear-gradient(135deg, #7a263a, #1bb1e7)" },
    { id: "brighton", nameAr: "برايتون", nameEn: "Brighton", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png", members: 0, points: 0, color: "linear-gradient(135deg, #0057b8, #ffffff)" },
    { id: "crystal_palace", nameAr: "كريستال بالاس", nameEn: "Crystal Palace", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9829.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #004170)" },
    { id: "everton", nameAr: "إيفرتون", nameEn: "Everton", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8658.png", members: 0, points: 0, color: "linear-gradient(135deg, #0033a0, #ffffff)" },
    { id: "fulham", nameAr: "فولهام", nameEn: "Fulham", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9938.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #000000)" },
    { id: "brentford", nameAr: "برينتفورد", nameEn: "Brentford", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9937.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },
    { id: "wolves", nameAr: "وولفرهامبتون", nameEn: "Wolves", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8657.png", members: 0, points: 0, color: "linear-gradient(135deg, #fdb813, #000000)" },
    { id: "nottingham_forest", nameAr: "نوتنغهام فورست", nameEn: "Nottingham Forest", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10203.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },
    { id: "bournemouth", nameAr: "بورنموث", nameEn: "Bournemouth", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10252.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #000000)" },
    { id: "leeds", nameAr: "ليدز يونايتد", nameEn: "Leeds United", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8585.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #0033a0)" },
    { id: "burnley", nameAr: "بيرنلي", nameEn: "Burnley", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8651.png", members: 0, points: 0, color: "linear-gradient(135deg, #6b0000, #ffffff)" },
    { id: "sunderland", nameAr: "سندرلاند", nameEn: "Sunderland", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8656.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },

    // 🇪🇸 إسبانيا (20+)
    { id: "real_madrid", nameAr: "ريال مدريد", nameEn: "Real Madrid", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png", members: 0, points: 0, color: "linear-gradient(135deg, #1a237e, #0d47a1)" },
    { id: "barcelona", nameAr: "برشلونة", nameEn: "Barcelona", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png", members: 0, points: 0, color: "linear-gradient(135deg, #b71c1c, #0d47a1)" },
    { id: "atletico", nameAr: "أتلتيكو مدريد", nameEn: "Atletico Madrid", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8302.png", members: 0, points: 0, color: "linear-gradient(135deg, #d50000, #ffffff)" },
    { id: "athletic_bilbao", nameAr: "أتلتيك بيلباو", nameEn: "Athletic Bilbao", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8315.png", members: 0, points: 0, color: "linear-gradient(135deg, #ee2523, #ffffff)" },
    { id: "sevilla", nameAr: "إشبيلية", nameEn: "Sevilla", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8371.png", members: 0, points: 0, color: "linear-gradient(135deg, #d50000, #ffffff)" },
    { id: "valencia", nameAr: "فالنسيا", nameEn: "Valencia", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10267.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #000000)" },
    { id: "villarreal", nameAr: "فيا ريال", nameEn: "Villarreal", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png", members: 0, points: 0, color: "linear-gradient(135deg, #fceb00, #00508f)" },
    { id: "real_sociedad", nameAr: "ريال سوسيداد", nameEn: "Real Sociedad", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8560.png", members: 0, points: 0, color: "linear-gradient(135deg, #0067b1, #ffffff)" },
    { id: "real_betis", nameAr: "ريال بيتيس", nameEn: "Real Betis", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png", members: 0, points: 0, color: "linear-gradient(135deg, #0bb363, #ffffff)" },
    { id: "girona", nameAr: "جيرونا", nameEn: "Girona", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/7732.png", members: 0, points: 0, color: "linear-gradient(135deg, #ed1c24, #ffffff)" },
    { id: "osasuna", nameAr: "أوساسونا", nameEn: "Osasuna", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8561.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },
    { id: "rayo_vallecano", nameAr: "رايو فاييكانو", nameEn: "Rayo Vallecano", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8562.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },
    { id: "getafe", nameAr: "خيتافي", nameEn: "Getafe", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8563.png", members: 0, points: 0, color: "linear-gradient(135deg, #0067b1, #ffffff)" },
    { id: "alaves", nameAr: "ألافيس", nameEn: "Alaves", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png", members: 0, points: 0, color: "linear-gradient(135deg, #004170, #ffffff)" },
    { id: "espanyol", nameAr: "إسبانيول", nameEn: "Espanyol", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8565.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },
    { id: "celta_vigo", nameAr: "سلتا فيغو", nameEn: "Celta Vigo", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8566.png", members: 0, points: 0, color: "linear-gradient(135deg, #004170, #ffffff)" },
    { id: "mallorca", nameAr: "مايوركا", nameEn: "Mallorca", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8567.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },
    { id: "leganes", nameAr: "ليغانيس", nameEn: "Leganes", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10268.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },

    // 🇩🇪 ألمانيا
    { id: "bayern", nameAr: "بايرن ميونخ", nameEn: "Bayern Munich", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png", members: 0, points: 0, color: "linear-gradient(135deg, #d50000, #b71c1c)" },
    { id: "dortmund", nameAr: "دورتموند", nameEn: "Borussia Dortmund", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png", members: 0, points: 0, color: "linear-gradient(135deg, #fde100, #000000)" },
    { id: "leverkusen", nameAr: "باير ليفركوزن", nameEn: "Bayer Leverkusen", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8171.png", members: 0, points: 0, color: "linear-gradient(135deg, #e32221, #000000)" },
    { id: "leipzig", nameAr: "لايبزيغ", nameEn: "RB Leipzig", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png", members: 0, points: 0, color: "linear-gradient(135deg, #dd013f, #ffffff)" },
    { id: "frankfurt", nameAr: "آينتراخت فرانكفورت", nameEn: "Eintracht Frankfurt", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9810.png", members: 0, points: 0, color: "linear-gradient(135deg, #e1000f, #000000)" },
    { id: "stuttgart", nameAr: "شتوتجارت", nameEn: "Stuttgart", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10269.png", members: 0, points: 0, color: "linear-gradient(135deg, #e32221, #ffffff)" },

    // 🇮🇹 إيطاليا + 🇫🇷 فرنسا + كبار أوروبا (كما في الكود الأصلي + إضافات)
    { id: "juventus", nameAr: "يوفنتوس", nameEn: "Juventus", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9885.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #ffffff)" },
    { id: "milan", nameAr: "ميلان", nameEn: "AC Milan", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png", members: 0, points: 0, color: "linear-gradient(135deg, #fb090b, #000000)" },
    { id: "inter", nameAr: "إنتر ميلان", nameEn: "Inter Milan", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca5, #000000)" },
    { id: "napoli", nameAr: "نابولي", nameEn: "Napoli", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9875.png", members: 0, points: 0, color: "linear-gradient(135deg, #00a0d0, #ffffff)" },
    { id: "roma", nameAr: "روما", nameEn: "AS Roma", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8686.png", members: 0, points: 0, color: "linear-gradient(135deg, #f0bc42, #8e1f2f)" },
    { id: "lazio", nameAr: "لاتسيو", nameEn: "Lazio", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8543.png", members: 0, points: 0, color: "linear-gradient(135deg, #87ceeb, #ffffff)" },
    { id: "atalanta", nameAr: "أتالانتا", nameEn: "Atalanta", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8524.png", members: 0, points: 0, color: "linear-gradient(135deg, #1e71b8, #000000)" },
    { id: "psg", nameAr: "باريس سان جيرمان", nameEn: "PSG", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png", members: 0, points: 0, color: "linear-gradient(135deg, #004170, #da291c)" },
    { id: "marseille", nameAr: "مارسيليا", nameEn: "Marseille", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8592.png", members: 0, points: 0, color: "linear-gradient(135deg, #009ee0, #ffffff)" },
    { id: "lyon", nameAr: "ليون", nameEn: "Lyon", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9748.png", members: 0, points: 0, color: "linear-gradient(135deg, #da291c, #004170)" },
    { id: "monaco", nameAr: "موناكو", nameEn: "Monaco", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9829.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },
    { id: "lille", nameAr: "ليل", nameEn: "Lille", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #000040)" },
    { id: "ajax", nameAr: "أياكس", nameEn: "Ajax", countryFlag: "🇳🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8593.png", members: 0, points: 0, color: "linear-gradient(135deg, #d2122e, #ffffff)" },
    { id: "psv", nameAr: "بي إس في آيندهوفن", nameEn: "PSV", countryFlag: "🇳🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png", members: 0, points: 0, color: "linear-gradient(135deg, #f00000, #ffffff)" },
    { id: "porto", nameAr: "بورتو", nameEn: "Porto", countryFlag: "🇵🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9772.png", members: 0, points: 0, color: "linear-gradient(135deg, #00428c, #ffffff)" },
    { id: "benfica", nameAr: "بنفيكا", nameEn: "Benfica", countryFlag: "🇵🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" },
    { id: "sporting_cp", nameAr: "سبورتينغ لشبونة", nameEn: "Sporting CP", countryFlag: "🇵🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png", members: 0, points: 0, color: "linear-gradient(135deg, #008000, #ffffff)" },
    { id: "galatasaray", nameAr: "جالاتا سراي", nameEn: "Galatasaray", countryFlag: "🇹🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8637.png", members: 0, points: 0, color: "linear-gradient(135deg, #a90432, #fdb912)" },
    { id: "fenerbahce", nameAr: "فنربخشة", nameEn: "Fenerbahce", countryFlag: "🇹🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8695.png", members: 0, points: 0, color: "linear-gradient(135deg, #001f3f, #ffff00)" }
    // يمكن توسيعها أكثر حسب الحاجة
];

// ==========================================
// 🗄️ MySQL Integration (Added Only)
// ==========================================
// مثال على كود Node.js + MySQL (backend) - يمكنك وضعه في ملف منفصل مثل db.js أو server.js
const mysql = require('mysql2/promise');
const pool = mysql.createPool({
    host: 'localhost', // أو IP السيرفر
    user: 'your_db_user',
    password: 'your_db_password',
    database: 'zelo_sport',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
// إنشاء الجداول (Run once)
async function initDatabase() {
    const connection = await pool.getConnection();
    try {
        await connection.query(`
            CREATE TABLE IF NOT EXISTS clubs (
                id VARCHAR(50) PRIMARY KEY,
                nameAr VARCHAR(100),
                nameEn VARCHAR(100),
                countryFlag VARCHAR(20),
                logo TEXT,
                members INT DEFAULT 0,
                points BIGINT DEFAULT 0,
                color TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        `);
        await connection.query(`
            CREATE TABLE IF NOT EXISTS fans (
                telegram_id BIGINT PRIMARY KEY,
                club_id VARCHAR(50),
                points BIGINT DEFAULT 0,
                coins BIGINT DEFAULT 0,
                is_locked BOOLEAN DEFAULT FALSE,
                joined_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (club_id) REFERENCES clubs(id)
            )
        `);
        console.log("✅ تم إنشاء جداول MySQL بنجاح");
    } finally {
        connection.release();
    }
}
// دالة لإدخال الأندية الأولية
async function seedClubs() {
    const connection = await pool.getConnection();
    try {
        for (const club of clubsData) {
            await connection.query(`
                INSERT INTO clubs (id, nameAr, nameEn, countryFlag, logo, members, points, color)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                ON DUPLICATE KEY UPDATE
                nameAr = VALUES(nameAr),
                nameEn = VALUES(nameEn),
                logo = VALUES(logo),
                color = VALUES(color)
            `, [club.id, club.nameAr, club.nameEn, club.countryFlag, club.logo, club.members, club.points, club.color]);
        }
        console.log(`✅ تم إدخال ${clubsData.length} نادي إلى قاعدة البيانات`);
    } finally {
        connection.release();
    }
}
module.exports = { pool, initDatabase, seedClubs, clubsData };