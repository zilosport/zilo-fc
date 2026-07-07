const allWorldCupCountriesClubs = {
    // ==========================================
    // 1. الدول ذات القوائم الشاملة (الموسعة)
    // ==========================================
    
    england: [
        { id: "man_united", nameAr: "مانشستر يونايتد", nameEn: "Manchester United", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png", members: 0, points: 0, color: "linear-gradient(135deg, #da291c, #000000)" },
        { id: "man_city", nameAr: "مانشستر سيتي", nameEn: "Manchester City", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8456.png", members: 0, points: 0, color: "linear-gradient(135deg, #6cabdd, #ffffff)" },
        { id: "liverpool", nameAr: "ليفربول", nameEn: "Liverpool", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8650.png", members: 0, points: 0, color: "linear-gradient(135deg, #c8102e, #00b2a9)" },
        { id: "arsenal", nameAr: "أرسنال", nameEn: "Arsenal", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9825.png", members: 0, points: 0, color: "linear-gradient(135deg, #ef0107, #ffffff)" },
        { id: "chelsea", nameAr: "تشيلسي", nameEn: "Chelsea", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8455.png", members: 0, points: 0, color: "linear-gradient(135deg, #034694, #ffffff)" },
        { id: "tottenham", nameAr: "توتنهام", nameEn: "Tottenham Hotspur", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/1650.png", members: 0, points: 0, color: "linear-gradient(135deg, #132257, #ffffff)" },
        { id: "newcastle", nameAr: "نيوكاسل يونايتد", nameEn: "Newcastle United", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10260.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #41b6e6)" },
        { id: "aston_villa", nameAr: "أستون فيلا", nameEn: "Aston Villa", countryFlag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10238.png", members: 0, points: 0, color: "linear-gradient(135deg, #95bfe5, #7a003c)" }
    ],

    spain: [
        { id: "real_madrid", nameAr: "ريال مدريد", nameEn: "Real Madrid", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8633.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #febe10)" },
        { id: "barcelona", nameAr: "برشلونة", nameEn: "Barcelona", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8634.png", members: 0, points: 0, color: "linear-gradient(135deg, #004d98, #a50044)" },
        { id: "atletico_madrid", nameAr: "أتلتيكو مدريد", nameEn: "Atletico Madrid", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9906.png", members: 0, points: 0, color: "linear-gradient(135deg, #cb3524, #ffffff)" },
        { id: "sevilla", nameAr: "إشبيلية", nameEn: "Sevilla", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8302.png", members: 0, points: 0, color: "linear-gradient(135deg, #f43333, #ffffff)" },
        { id: "real_sociedad", nameAr: "ريال سوسيداد", nameEn: "Real Sociedad", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8560.png", members: 0, points: 0, color: "linear-gradient(135deg, #0000ff, #ffffff)" },
        { id: "villarreal", nameAr: "فاريال", nameEn: "Villarreal", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10205.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe600, #005187)" },
        { id: "real_betis", nameAr: "ريال بيتيس", nameEn: "Real Betis", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png", members: 0, points: 0, color: "linear-gradient(135deg, #00933b, #ffffff)" },
        { id: "athletic_bilbao", nameAr: "أتلتيك بيلباو", nameEn: "Athletic Bilbao", countryFlag: "🇪🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8315.png", members: 0, points: 0, color: "linear-gradient(135deg, #ee2524, #ffffff)" }
    ],

    germany: [
        { id: "bayern_munich", nameAr: "بايرن ميونخ", nameEn: "Bayern Munich", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9823.png", members: 0, points: 0, color: "linear-gradient(135deg, #dc052d, #0066b2)" },
        { id: "dortmund", nameAr: "بوروسيا دورتموند", nameEn: "Borussia Dortmund", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9789.png", members: 0, points: 0, color: "linear-gradient(135deg, #fde100, #000000)" },
        { id: "bayer_leverkusen", nameAr: "باير ليفركوزن", nameEn: "Bayer Leverkusen", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8178.png", members: 0, points: 0, color: "linear-gradient(135deg, #e32221, #000000)" },
        { id: "leipzig", nameAr: "لايبزيغ", nameEn: "RB Leipzig", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/178475.png", members: 0, points: 0, color: "linear-gradient(135deg, #0c2340, #dd013f)" },
        { id: "frankfurt", nameAr: "آينتراخت فرانكفورت", nameEn: "Eintracht Frankfurt", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9810.png", members: 0, points: 0, color: "linear-gradient(135deg, #e10012, #ffffff)" },
        { id: "stuttgart", nameAr: "شتوتغارت", nameEn: "VfB Stuttgart", countryFlag: "🇩🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9777.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #e32221)" }
    ],

    france: [
        { id: "psg", nameAr: "باريس سان جيرمان", nameEn: "Paris Saint-Germain", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9847.png", members: 0, points: 0, color: "linear-gradient(135deg, #0052b4, #e30613)" },
        { id: "marseille", nameAr: "أولمبيك مارسيليا", nameEn: "Olympique de Marseille", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8592.png", members: 0, points: 0, color: "linear-gradient(135deg, #00a2e3, #ffffff)" },
        { id: "lyon", nameAr: "أولمبيك ليون", nameEn: "Olympique Lyonnais", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9748.png", members: 0, points: 0, color: "linear-gradient(135deg, #102c57, #da1622)" },
        { id: "monaco", nameAr: "موناكو", nameEn: "AS Monaco", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9829.png", members: 0, points: 0, color: "linear-gradient(135deg, #e21319, #ffffff)" },
        { id: "lille", nameAr: "ليل", nameEn: "LOSC Lille", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8639.png", members: 0, points: 0, color: "linear-gradient(135deg, #e01e26, #122240)" },
        { id: "lens", nameAr: "لانس", nameEn: "RC Lens", countryFlag: "🇫🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8586.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe200, #cc0000)" }
    ],

    saudiArabia: [
        { id: "alhilal", nameAr: "الهلال", nameEn: "Al-Hilal", countryFlag: "🇸🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10216.png", members: 0, points: 0, color: "linear-gradient(135deg, #0053a0, #ffffff)" },
        { id: "alnassr", nameAr: "النصر", nameEn: "Al-Nassr", countryFlag: "🇸🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10217.png", members: 0, points: 0, color: "linear-gradient(135deg, #fff200, #0054a6)" },
        { id: "alittihad", nameAr: "الاتحاد", nameEn: "Al-Ittihad", countryFlag: "🇸🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10211.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #fcf003)" },
        { id: "alahli", nameAr: "الأهلي", nameEn: "Al-Ahli", countryFlag: "🇸🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10215.png", members: 0, points: 0, color: "linear-gradient(135deg, #007a3d, #ffffff)" },
        { id: "alshabab", nameAr: "الشباب", nameEn: "Al-Shabab", countryFlag: "🇸🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10214.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #ffffff)" },
        { id: "alettifaq", nameAr: "الاتفاق", nameEn: "Al-Ettifaq", countryFlag: "🇸🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10213.png", members: 0, points: 0, color: "linear-gradient(135deg, #00753f, #e31b23)" }
    ],

    egypt: [
        { id: "alahly_eg", nameAr: "الأهلي", nameEn: "Al Ahly SC", countryFlag: "🇪🇬", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10218.png", members: 0, points: 0, color: "linear-gradient(135deg, #cc0000, #ffffff)" },
        { id: "zamalek", nameAr: "الزمالك", nameEn: "Zamalek SC", countryFlag: "🇪🇬", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10219.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #ff0000)" },
        { id: "pyramids", nameAr: "بيراميدز", nameEn: "Pyramids FC", countryFlag: "🇪🇬", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/860011.png", members: 0, points: 0, color: "linear-gradient(135deg, #11284b, #1d70b8)" },
        { id: "almasry", nameAr: "المصري البورسعيدي", nameEn: "Al Masry", countryFlag: "🇪🇬", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10220.png", members: 0, points: 0, color: "linear-gradient(135deg, #008751, #ffffff)" },
        { id: "ismaily", nameAr: "الإسماعيلي", nameEn: "Ismaily SC", countryFlag: "🇪🇬", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10221.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffcc00, #0000ff)" },
        { id: "alittihad_alex", nameAr: "الاتحاد السكندري", nameEn: "Itthad Alexandria", countryFlag: "🇪🇬", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10222.png", members: 0, points: 0, color: "linear-gradient(135deg, #006633, #ffffff)" }
    ],

    morocco: [
        { id: "raja", nameAr: "الرجاء الرياضي", nameEn: "Raja Casablanca", countryFlag: "🇲🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10223.png", members: 0, points: 0, color: "linear-gradient(135deg, #008542, #ffffff)" },
        { id: "wydad", nameAr: "الوداد الرياضي", nameEn: "Wydad Casablanca", countryFlag: "🇲🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10224.png", members: 0, points: 0, color: "linear-gradient(135deg, #e31b23, #ffffff)" },
        { id: "far_rabat", nameAr: "الجيش الملكي", nameEn: "FAR Rabat", countryFlag: "🇲🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10225.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #007a3d)" },
        { id: "berkane", nameAr: "نهضة بركان", nameEn: "RS Berkane", countryFlag: "🇲🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/198231.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff6600, #000000)" },
        { id: "fath_rabat", nameAr: "الفتح الرباطي", nameEn: "FUS Rabat", countryFlag: "🇲🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10226.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #ff0000)" },
        { id: "itihad_tanger", nameAr: "اتحاد طنجة", nameEn: "Ittihad Tanger", countryFlag: "🇲🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/198232.png", members: 0, points: 0, color: "linear-gradient(135deg, #0000ff, #ffffff)" }
    ],

    qatar: [
        { id: "alsadd", nameAr: "السد", nameEn: "Al-Sadd SC", countryFlag: "🇶🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10227.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #000000)" },
        { id: "alduhail", nameAr: "الدحيل", nameEn: "Al-Duhail SC", countryFlag: "🇶🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/241857.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0044, #ffffff)" },
        { id: "alrayyan", nameAr: "الريان", nameEn: "Al-Rayyan SC", countryFlag: "🇶🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10228.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #000000)" },
        { id: "algharafa", nameAr: "الغرافة", nameEn: "Al-Gharafa SC", countryFlag: "🇶🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10229.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe600, #0000ff)" },
        { id: "alarabi_qa", nameAr: "العربي", nameEn: "Al-Arabi SC", countryFlag: "🇶🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10230.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" },
        { id: "alwakra", nameAr: "الوكرة", nameEn: "Al-Wakrah SC", countryFlag: "🇶🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10231.png", members: 0, points: 0, color: "linear-gradient(135deg, #6cabdd, #ffffff)" }
    ],

    // ==========================================
    // 2. باقي الدول الـ 40 (أقوى وأشهر الأندية فقط)
    // ==========================================

    italy: [
        { id: "inter_milan", nameAr: "إنتر ميلان", nameEn: "Inter Milan", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8636.png", members: 0, points: 0, color: "linear-gradient(135deg, #001489, #000000)" },
        { id: "ac_milan", nameAr: "إي سي ميلان", nameEn: "AC Milan", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #000000)" },
        { id: "juventus", nameAr: "يوفنتوس", nameEn: "Juventus", countryFlag: "🇮🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9885.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #ffffff)" }
    ],

    portugal: [
        { id: "benfica", nameAr: "بنفيكا", nameEn: "Benfica", countryFlag: "🇵🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9772.png", members: 0, points: 0, color: "linear-gradient(135deg, #e30613, #ffffff)" },
        { id: "fc_porto", nameAr: "بورتو", nameEn: "FC Porto", countryFlag: "🇵🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9773.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca9, #ffffff)" },
        { id: "sporting_lisbon", nameAr: "سبورتينغ لشبونة", nameEn: "Sporting CP", countryFlag: "🇵🇹", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9768.png", members: 0, points: 0, color: "linear-gradient(135deg, #008057, #ffffff)" }
    ],

    netherlands: [
        { id: "ajax", nameAr: "أياكس أمستردام", nameEn: "Ajax", countryFlag: "🇳🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8593.png", members: 0, points: 0, color: "linear-gradient(135deg, #da291c, #ffffff)" },
        { id: "psv", nameAr: "آيندهوفن", nameEn: "PSV Eindhoven", countryFlag: "🇳🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8640.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" },
        { id: "feyenoord", nameAr: "فينورد", nameEn: "Feyenoord", countryFlag: "🇳🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9920.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #000000)" }
    ],

    brazil: [
        { id: "flamengo", nameAr: "فلامينغو", nameEn: "Flamengo", countryFlag: "🇧🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/5976.png", members: 0, points: 0, color: "linear-gradient(135deg, #c4122d, #000000)" },
        { id: "palmeiras", nameAr: "بالميراس", nameEn: "Palmeiras", countryFlag: "🇧🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/3103.png", members: 0, points: 0, color: "linear-gradient(135deg, #006437, #ffffff)" },
        { id: "sao_paulo", nameAr: "ساو باولو", nameEn: "Sao Paulo", countryFlag: "🇧🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/5977.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" }
    ],

    argentina: [
        { id: "boca_juniors", nameAr: "بوكا جونيورز", nameEn: "Boca Juniors", countryFlag: "🇦🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9741.png", members: 0, points: 0, color: "linear-gradient(135deg, #003b46, #f3db00)" },
        { id: "river_plate", nameAr: "ريفر بليت", nameEn: "River Plate", countryFlag: "🇦🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9742.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #ff0000)" }
    ],

    uae: [
        { id: "alain", nameAr: "العين", nameEn: "Al Ain FC", countryFlag: "🇦🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10232.png", members: 0, points: 0, color: "linear-gradient(135deg, #4b237b, #ffffff)" },
        { id: "alshabab_ahli", nameAr: "شباب الأهلي", nameEn: "Shabab Al-Ahli", countryFlag: "🇦🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/242207.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #008000)" }
    ],

    tunisia: [
        { id: "esperance", nameAr: "الترجي التونسي", nameEn: "Esperance de Tunis", countryFlag: "🇹🇳", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10233.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffcc00)" },
        { id: "club_africain", nameAr: "النادي الإفريقي", nameEn: "Club Africain", countryFlag: "🇹🇳", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10234.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" }
    ],

    algeria: [
        { id: "mouloudia_alger", nameAr: "مولودية الجزائر", nameEn: "MC Alger", countryFlag: "🇩🇿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10235.png", members: 0, points: 0, color: "linear-gradient(135deg, #008000, #ff0000)" },
        { id: "cr_belouizdad", nameAr: "شباب بلوزداد", nameEn: "CR Belouizdad", countryFlag: "🇩🇿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10236.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" }
    ],

    usa: [
        { id: "inter_miami", nameAr: "إنتر ميامي", nameEn: "Inter Miami CF", countryFlag: "🇺🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/923485.png", members: 0, points: 0, color: "linear-gradient(135deg, #f7b5cd, #231f20)" },
        { id: "la_galaxy", nameAr: "لوس أنجلوس غالاكسي", nameEn: "LA Galaxy", countryFlag: "🇺🇸", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/3501.png", members: 0, points: 0, color: "linear-gradient(135deg, #00245d, #ffd200)" }
    ],

    mexico: [
        { id: "club_america", nameAr: "كلوب أمريكا", nameEn: "Club América", countryFlag: "🇲🇽", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/3567.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffed00, #001c43)" },
        { id: "chivas", nameAr: "غوادالاخارا (شيفاس)", nameEn: "Chivas", countryFlag: "🇲🇽", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/3563.png", members: 0, points: 0, color: "linear-gradient(135deg, #002d62, #ce1126)" }
    ],

    canada: [
        { id: "toronto_fc", nameAr: "تورونتو", nameEn: "Toronto FC", countryFlag: "🇨🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/20786.png", members: 0, points: 0, color: "linear-gradient(135deg, #b31b1b, #8a8d8f)" },
        { id: "vancouver", nameAr: "فانكوفر وايت كابس", nameEn: "Whitecaps FC", countryFlag: "🇨🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/22535.png", members: 0, points: 0, color: "linear-gradient(135deg, #00245d, #ffffff)" }
    ],

    japan: [
        { id: "vissel_kobe", nameAr: "فيسيل كوبي", nameEn: "Vissel Kobe", countryFlag: "🇯🇵", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10189.png", members: 0, points: 0, color: "linear-gradient(135deg, #6c1d45, #ffffff)" },
        { id: "urawa_reds", nameAr: "أوراوا ريد دايموندز", nameEn: "Urawa Red Diamonds", countryFlag: "🇯🇵", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/5656.png", members: 0, points: 0, color: "linear-gradient(135deg, #e60012, #000000)" }
    ],

    southKorea: [
        { id: "ulsan_hd", nameAr: "أولسان إتش دي", nameEn: "Ulsan HD", countryFlag: "🇰🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10123.png", members: 0, points: 0, color: "linear-gradient(135deg, #003366, #ffcc00)" },
        { id: "jeonbuk", nameAr: "جونبوك موتورز", nameEn: "Jeonbuk Hyundai", countryFlag: "🇰🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10124.png", members: 0, points: 0, color: "linear-gradient(135deg, #006633, #99cc33)" }
    ],

    australia: [
        { id: "sydney_fc", nameAr: "سيدني إف سي", nameEn: "Sydney FC", countryFlag: "🇦🇺", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/17231.png", members: 0, points: 0, color: "linear-gradient(135deg, #75b2dd, #002b49)" },
        { id: "melbourne_victory", nameAr: "ملبورن فيكتوري", nameEn: "Melbourne Victory", countryFlag: "🇦🇺", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/17232.png", members: 0, points: 0, color: "linear-gradient(135deg, #00245d, #ffffff)" }
    ],

    senegal: [
        { id: "jaraf", nameAr: "دياراف", nameEn: "ASC Jaraaf", countryFlag: "🇸🇳", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10101.png", members: 0, points: 0, color: "linear-gradient(135deg, #008000, #ffffff)" },
        { id: "teungueth", nameAr: "تونغيث", nameEn: "Teungueth FC", countryFlag: "🇸🇳", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/10102.png", members: 0, points: 0, color: "linear-gradient(135deg, #0000ff, #ffe600)" }
    ],

    ivoryCoast: [
        { id: "asec_mimosas", nameAr: "أسيك ميموزا", nameEn: "ASEC Mimosas", countryFlag: "🇨🇮", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8467.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe600, #000000)" },
        { id: "san_pedro", nameAr: "سان بيدرو", nameEn: "FC San Pedro", countryFlag: "🇨🇮", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8468.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff6600, #ffffff)" }
    ],

    nigeria: [
        { id: "enymba", nameAr: "إنييمبا", nameEn: "Enyimba FC", countryFlag: "🇳🇬", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8454.png", members: 0, points: 0, color: "linear-gradient(135deg, #0000ff, #ffffff)" },
        { id: "kano_pillars", nameAr: "كانو بيلارس", nameEn: "Kano Pillars", countryFlag: "🇳🇬", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8455.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe600, #000000)" }
    ],

    cameroon: [
        { id: "coton_sport", nameAr: "قطن سبورت", nameEn: "Coton Sport", countryFlag: "🇨🇲", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8411.png", members: 0, points: 0, color: "linear-gradient(135deg, #008000, #ffffff)" },
        { id: "canon_yaounde", nameAr: "كانون ياوندي", nameEn: "Canon Yaounde", countryFlag: "🇨🇲", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8412.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #008000)" }
    ],

    ghana: [
        { id: "asante_kotoko", nameAr: "أشانتي كوتوكو", nameEn: "Asante Kotoko", countryFlag: "🇬🇭", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8321.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffe600)" },
        { id: "hearts_of_oak", nameAr: "هارتس أوف أوك", nameEn: "Hearts of Oak", countryFlag: "🇬🇭", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8322.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #0000ff)" }
    ],

    uruguay: [
        { id: "penarol", nameAr: "بينارول", nameEn: "Penarol", countryFlag: "🇺🇾", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8101.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #ffe600)" },
        { id: "nacional_ur", nameAr: "ناسيونال", nameEn: "Nacional", countryFlag: "🇺🇾", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8102.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #0000ff)" }
    ],

    colombia: [
        { id: "atletico_nacional", nameAr: "أتلتيكو ناسيونال", nameEn: "Atletico Nacional", countryFlag: "🇨🇴", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8103.png", members: 0, points: 0, color: "linear-gradient(135deg, #008542, #ffffff)" },
        { id: "millonarios", nameAr: "ميلوناريوس", nameEn: "Millonarios", countryFlag: "🇨🇴", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8104.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca9, #ffffff)" }
    ],

    belgium: [
        { id: "club_brugge", nameAr: "كلوب بروج", nameEn: "Club Brugge", countryFlag: "🇧🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8105.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca9, #000000)" },
        { id: "anderlecht", nameAr: "أندرلخت", nameEn: "Anderlecht", countryFlag: "🇧🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8106.png", members: 0, points: 0, color: "linear-gradient(135deg, #4b237b, #ffffff)" }
    ],

    croatia: [
        { id: "dinamo_zagreb", nameAr: "دينامو زغرب", nameEn: "Dinamo Zagreb", countryFlag: "🇭🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8564.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca9, #ffffff)" },
        { id: "hajduk_split", nameAr: "هايدوك سبليت", nameEn: "Hajduk Split", countryFlag: "🇭🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8565.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #0000ff)" }
    ],

    switzerland: [
        { id: "young_boys", nameAr: "يانغ بويز", nameEn: "Young Boys", countryFlag: "🇨🇭", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8201.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe600, #000000)" },
        { id: "fc_basel", nameAr: "بازل", nameEn: "FC Basel", countryFlag: "🇨🇭", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8202.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #0000ff)" }
    ],

    denmark: [
        { id: "copenhagen", nameAr: "كوبنهاغن", nameEn: "FC Copenhagen", countryFlag: "🇩🇰", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8301.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #0000ff)" },
        { id: "midtjylland", nameAr: "ميتييلاند", nameEn: "FC Midtjylland", countryFlag: "🇩🇰", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8302.png", members: 0, points: 0, color: "linear-gradient(135deg, #cc0000, #000000)" }
    ],

    sweden: [
        { id: "malmo", nameAr: "مالمو", nameEn: "Malmö FF", countryFlag: "🇸🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8401.png", members: 0, points: 0, color: "linear-gradient(135deg, #75b2dd, #ffffff)" },
        { id: "ai_stockholm", nameAr: "آيك سولنا", nameEn: "AIK", countryFlag: "🇸🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8402.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe600, #000000)" }
    ],

    norway: [
        { id: "bodo_glimt", nameAr: "بودو غليمت", nameEn: "Bodø/Glimt", countryFlag: "🇳🇴", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8501.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe600, #000000)" },
        { id: "molde", nameAr: "مولده", nameEn: "Molde FK", countryFlag: "🇳🇴", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8502.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca9, #ffffff)" }
    ],

    poland: [
        { id: "legia_warsaw", nameAr: "ليغيا وارسو", nameEn: "Legia Warsaw", countryFlag: "🇵🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8601.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #008542)" },
        { id: "lech_poznan", nameAr: "ليخ بوزنان", nameEn: "Lech Poznań", countryFlag: "🇵🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8602.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca9, #ffffff)" }
    ],

    turkey: [
        { id: "galatasaray", nameAr: "غلطة سراي", nameEn: "Galatasaray", countryFlag: "🇹🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8603.png", members: 0, points: 0, color: "linear-gradient(135deg, #a50044, #ffcc00)" },
        { id: "fenerbahce", nameAr: "فنربخشة", nameEn: "Fenerbahçe", countryFlag: "🇹🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8604.png", members: 0, points: 0, color: "linear-gradient(135deg, #002d62, #ffcc00)" },
        { id: "besiktas", nameAr: "بشكتاش", nameEn: "Beşiktaş", countryFlag: "🇹🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8605.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #ffffff)" }
    ],

    ukraine: [
        { id: "shakhtar", nameAr: "شاختار دونيتسك", nameEn: "Shakhtar Donetsk", countryFlag: "🇺🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8701.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff6600, #000000)" },
        { id: "dynamo_kyiv", nameAr: "دينامو كييف", nameEn: "Dynamo Kyiv", countryFlag: "🇺🇦", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8702.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca9, #ffffff)" }
    ],

    scotland: [
        { id: "celtic", nameAr: "سيلتيك", nameEn: "Celtic FC", countryFlag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8801.png", members: 0, points: 0, color: "linear-gradient(135deg, #008542, #ffffff)" },
        { id: "rangers", nameAr: "رينجرز", nameEn: "Rangers FC", countryFlag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8802.png", members: 0, points: 0, color: "linear-gradient(135deg, #005ca9, #ffffff)" }
    ],

    greece: [
        { id: "olympiacos", nameAr: "أولمبياكوس", nameEn: "Olympiacos FC", countryFlag: "🇬🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8901.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" },
        { id: "panathinaikos", nameAr: "باناثينايكوس", nameEn: "Panathinaikos", countryFlag: "🇬🇷", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/8902.png", members: 0, points: 0, color: "linear-gradient(135deg, #008542, #ffffff)" }
    ],

    chile: [
        { id: "colo_colo", nameAr: "كولو كولو", nameEn: "Colo-Colo", countryFlag: "🇨🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9001.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #000000)" },
        { id: "univ_chile", nameAr: "أونيفيرسيداد دي تشيلي", nameEn: "U. de Chile", countryFlag: "🇨🇱", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9002.png", members: 0, points: 0, color: "linear-gradient(135deg, #00245d, #ff0000)" }
    ],

    peru: [
        { id: "universitario", nameAr: "أونيفيرسيتاريو", nameEn: "Universitario", countryFlag: "🇵🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9101.png", members: 0, points: 0, color: "linear-gradient(135deg, #fffdd0, #800020)" },
        { id: "alianza_lima", nameAr: "أليانزا ليما", nameEn: "Alianza Lima", countryFlag: "🇵🇪", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9102.png", members: 0, points: 0, color: "linear-gradient(135deg, #00245d, #ffffff)" }
    ],

    ecuador: [
        { id: "ldu_quito", nameAr: "إل دي يو كيتو", nameEn: "LDU Quito", countryFlag: "🇪🇨", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9201.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #0000ff)" },
        { id: "independiente_valle", nameAr: "إنديبندينتي ديل فالي", nameEn: "IDV", countryFlag: "🇪🇨", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9202.png", members: 0, points: 0, color: "linear-gradient(135deg, #000000, #ff00ff)" }
    ],

    paraguay: [
        { id: "olimpia", nameAr: "أوليمبيا", nameEn: "Olimpia", countryFlag: "🇵🇾", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9301.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffffff, #000000)" },
        { id: "cerro_porteno", nameAr: "سيرو بورتينيو", nameEn: "Cerro Porteño", countryFlag: "🇵🇾", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9302.png", members: 0, points: 0, color: "linear-gradient(135deg, #0000ff, #ff0000)" }
    ],

    iraq: [
        { id: "al_shurta", nameAr: "الشرطة", nameEn: "Al-Shorta SC", countryFlag: "🇮🇶", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9401.png", members: 0, points: 0, color: "linear-gradient(135deg, #008542, #ffffff)" },
        { id: "al_quwa_al_jawiya", nameAr: "القوة الجوية", nameEn: "Al-Quwa Al-Jawiya", countryFlag: "🇮🇶", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9402.png", members: 0, points: 0, color: "linear-gradient(135deg, #0000ff, #ffffff)" }
    ],

    jordan: [
        { id: "al_wehdat", nameAr: "الوحدات", nameEn: "Al-Wehdat SC", countryFlag: "🇯🇴", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9501.png", members: 0, points: 0, color: "linear-gradient(135deg, #008542, #ff0000)" },
        { id: "al_faisaly_jo", nameAr: "الفيصلي", nameEn: "Al-Faisaly SC", countryFlag: "🇯🇴", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9502.png", members: 0, points: 0, color: "linear-gradient(135deg, #6cabdd, #ffffff)" }
    ],

    syria: [
        { id: "al_jaish", nameAr: "الجيش", nameEn: "Al-Jaish SC", countryFlag: "🇸🇾", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9601.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" },
        { id: "al_ittihad_sy", nameAr: "أهلي حلب", nameEn: "Al-Ittihad Aleppo", countryFlag: "🇸🇾", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9602.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #000000)" }
    ],

    oman: [
        { id: "al_seeb", nameAr: "السيب", nameEn: "Al-Seeb Club", countryFlag: "🇴🇲", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9701.png", members: 0, points: 0, color: "linear-gradient(135deg, #ffe600, #000000)" },
        { id: "dhofar", nameAr: "ظفار", nameEn: "Dhofar Club", countryFlag: "🇴🇲", logo: "https://images.fotmob.com/image_resources/logo/teamlogo/9702.png", members: 0, points: 0, color: "linear-gradient(135deg, #ff0000, #ffffff)" }
    ]
};
