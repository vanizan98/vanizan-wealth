export interface Affirmation {
  id: number;
  text: string;
  englishTranslation: string;
  description: string;
  focusArea: string;
  visualGradient: string;
  category: string;
  symbol: string;
}

export interface BrainwaveFrequency {
  name: string;
  freq: number;
  description: string;
  color: string;
}

export interface BuiltInSound {
  id: string;
  name: string;
  subtitle: string;
  frequency: number;
  type: OscillatorType;
  modulation?: number;
}

export const AFFIRMATION_CATEGORIES = [
  { id: 'identity', name: 'باورهای هویتی', icon: '👑', color: 'from-amber-500 to-yellow-600', description: 'هویت شما به عنوان حل‌کننده مسائل ملکی' },
  { id: 'wealth', name: 'باورهای ثروت', icon: '💰', color: 'from-emerald-500 to-teal-600', description: 'فراوانی و جذب ثروت به سمت شما' },
  { id: 'negotiation', name: 'باورهای مذاکره', icon: '🤝', color: 'from-blue-500 to-indigo-600', description: 'آرامش و قدرت در هر مذاکره' },
  { id: 'partnership', name: 'باورهای مشارکت در ساخت', icon: '🏗️', color: 'from-purple-500 to-fuchsia-600', description: 'یادگیری و اتصال فرصت‌ها' },
  { id: 'mastery', name: 'سطح استادان بازار', icon: '🎯', color: 'from-rose-500 to-red-600', description: 'ذهن استادان واقعی بازار' }
];

export const WEALTH_AFFIRMATIONS: Affirmation[] = [
  // === باورهای هویتی ===
  {
    id: 1,
    text: "من واسطه معامله نیستم؛ من حل‌کننده مسائل ملکی هستم.",
    englishTranslation: "I am not a middleman; I am a real estate problem solver.",
    description: "هویت شما از یک واسطه ساده به یک مشاور استاد تبدیل می‌شود که مشکل‌های پیچیده ملکی افراد را با تخصص حل می‌کند. این تغییر هویت، قیمت خدمات شما را ده برابر می‌کند.",
    focusArea: "تثبیت هویت حرفه‌ای و تخصصی",
    visualGradient: "from-amber-500 via-yellow-600 to-amber-900",
    category: "identity",
    symbol: "🧩"
  },
  {
    id: 2,
    text: "مردم به من اعتماد می‌کنند چون منافع آنها را به منافع خودم ترجیح می‌دهم.",
    englishTranslation: "People trust me because I put their interests above mine.",
    description: "اعتماد یعنی اولویت دادن به منافع مشتری. وقتی مشتری ببیند شما اول از او فکر می‌کنید، او هم برای شما سرمایه‌گذاری می‌کند و این چرخه، ثروتمندی شما را تضمین می‌کند.",
    focusArea: "ساخت اعتماد بی‌قیدوشرط",
    visualGradient: "from-amber-600 via-orange-700 to-amber-950",
    category: "identity",
    symbol: "🤲"
  },
  {
    id: 3,
    text: "هر روز ارزش بیشتری به بازار اضافه می‌کنم.",
    englishTranslation: "Every day I add more value to the market.",
    description: "شما خالق ارزش هستید، نه مصرف‌کننده آن. هر پروژه، هر مشاوره و هر معامله شما، ارزشی به بازار اضافه می‌کند که قبل از شما وجود نداشت.",
    focusArea: "ذهنیت خالق ارزش",
    visualGradient: "from-yellow-500 via-amber-600 to-yellow-900",
    category: "identity",
    symbol: "💎"
  },
  {
    id: 4,
    text: "من آهنربای فرصت‌های بزرگ ملکی هستم.",
    englishTranslation: "I am a magnet for big real estate opportunities.",
    description: "فرصت‌ها به سمت افرادی جذب می‌شوند که آماده شنیدن و اجرا کردن آن‌ها هستند. ذهن شما مثل یک رادار قدرتمند، فرصت‌های پنهان بازار را پیدا می‌کند.",
    focusArea: "جذب فرصت‌های بزرگ",
    visualGradient: "from-amber-400 via-yellow-500 to-amber-800",
    category: "identity",
    symbol: "🧲"
  },
  {
    id: 5,
    text: "سرمایه، زمین و فرصت به سمت من جذب می‌شوند.",
    englishTranslation: "Capital, land and opportunities are attracted to me.",
    description: "ثروت، زمین و فرصت‌های تجاری به سمت ذهن‌هایی جذب می‌شوند که برای پذیرش آن‌ها آماده‌اند. شما اکنون آماده هستید.",
    focusArea: "مغناطیس فراوانی",
    visualGradient: "from-yellow-600 via-amber-700 to-emerald-950",
    category: "identity",
    symbol: "🏔️"
  },
  {
    id: 6,
    text: "من در هر مذاکره آرام، مسلط و قدرتمند هستم.",
    englishTranslation: "I am calm, masterful and powerful in every negotiation.",
    description: "آرامش شما در مذاکره، قدرت شماست. وقتی ذهنتان آرام باشد، طرف مقابل احساس امنیت می‌کند و توافق‌های بزرگ‌تری امضا می‌کند.",
    focusArea: "قدرت آرامش در مذاکره",
    visualGradient: "from-amber-500 via-rose-600 to-amber-950",
    category: "identity",
    symbol: "🦁"
  },
  {
    id: 7,
    text: "من برای پول کار نمی‌کنم؛ پول برای ارزشی که خلق می‌کنم به سمت من می‌آید.",
    englishTranslation: "I don't work for money; money comes to me for the value I create.",
    description: "شما فروشنده وقت نیستید، شما خالق ارزش هستید. پول فقط یک نتیجه طبیعی از ارزشی است که شما به بازار اضافه می‌کنید.",
    focusArea: "تغییر رابطه با پول",
    visualGradient: "from-emerald-600 via-teal-700 to-emerald-950",
    category: "identity",
    symbol: "⚡"
  },
  {
    id: 8,
    text: "نام من مترادف با اعتبار، تخصص و نتایج عالی است.",
    englishTranslation: "My name is synonymous with credibility, expertise and high results.",
    description: "هر بار که نام شما در بازار مطرح می‌شود، با سه کلمه همراه است: اعتبار، تخصص و نتایج. این هویت شما ثروتمند می‌سازد.",
    focusArea: "برند شخصی قدرتمند",
    visualGradient: "from-amber-600 via-yellow-700 to-amber-950",
    category: "identity",
    symbol: "👑"
  },

  // === باورهای ثروت ===
  {
    id: 9,
    text: "در بازار همیشه معاملات عالی وجود دارد.",
    englishTranslation: "There are always excellent deals in the market.",
    description: "بازار بی‌نهایت فرصت دارد. مهم این نیست که بازار رکود است یا رونق، مهم این است که شما همیشه معاملات عالی را پیدا می‌کنید.",
    focusArea: "باور فراوانی بازار",
    visualGradient: "from-emerald-500 via-teal-600 to-emerald-950",
    category: "wealth",
    symbol: "🔑"
  },
  {
    id: 10,
    text: "هیچ محدودیتی برای میزان درآمد من وجود ندارد.",
    englishTranslation: "There is no limit to my income.",
    description: "سقف درآمدی برای شما وجود ندارد. هرچه بیشتر تخصص و اعتماد بسازید، بازار بیشتر به شما می‌دهد. سقف در ذهن شماست، نه در بازار.",
    focusArea: "حذف محدودیت‌های ذهنی",
    visualGradient: "from-emerald-600 via-green-700 to-emerald-950",
    category: "wealth",
    symbol: "♾️"
  },
  {
    id: 11,
    text: "هر معامله موفق، راه را برای معاملات بزرگ‌تر باز می‌کند.",
    englishTranslation: "Every successful deal opens the door to bigger deals.",
    description: "معامله‌های شما مثل دانه‌های یک زنجیر هستند. هر موفقیت، اعتماد بیشتری می‌سازد و درهای بزرگ‌تری را باز می‌کند.",
    focusArea: "چرخه رشد معاملات",
    visualGradient: "from-teal-500 via-emerald-600 to-teal-900",
    category: "wealth",
    symbol: "🚀"
  },
  {
    id: 12,
    text: "ثروت از طریق خدمت‌رسانی صادقانه وارد زندگی من می‌شود.",
    englishTranslation: "Wealth enters my life through honest service.",
    description: "ثروت فقط از راه خدمت می‌آید. وقتی شما به مشتری‌هایتان با صداقت و تخصص خدمت می‌کنید، ثروت به صورت طبیعی به سمت شما جاری می‌شود.",
    focusArea: "خدمت‌رسانی به عنوان راه ثروت",
    visualGradient: "from-emerald-500 via-green-600 to-emerald-950",
    category: "wealth",
    symbol: "🤲"
  },
  {
    id: 13,
    text: "هر روز کانال‌های جدید درآمدی برای من باز می‌شود.",
    englishTranslation: "Every day new income channels open for me.",
    description: "شما فقط یک منبع درآمدی ندارید. هر روز، ذهن شما کانال‌های جدیدی برای خلق درآمد باز می‌کند: مشاوره، بورسیه، پروژه‌های مشارکتی، فرصت‌های سرمایه‌گذاری.",
    focusArea: "کانال‌های متنوع درآمدی",
    visualGradient: "from-green-500 via-emerald-600 to-green-900",
    category: "wealth",
    symbol: "🚪"
  },
  {
    id: 14,
    text: "من شایسته ثروت فراوان هستم.",
    englishTranslation: "I am worthy of abundant wealth.",
    description: "شایستگی ثروت با تخصص و خدمت ساخته می‌شود. شما با سال‌ها تلاش و تخصص، به این شایستگی رسیدید و اکنون حق دریافت ثروت فراوان را دارید.",
    focusArea: "لیاقت ثروت فراوان",
    visualGradient: "from-amber-500 via-emerald-600 to-emerald-950",
    category: "wealth",
    symbol: "👑"
  },
  {
    id: 15,
    text: "پول عاشق جریان داشتن به سمت افرادی است که ارزش خلق می‌کنند.",
    englishTranslation: "Money loves flowing towards value creators.",
    description: "پول مثل آب است؛ به سمت پایین می‌ریزد. وقتی شما ارزش خلق می‌کنید، پول به سمت شما جاری می‌شود چون می‌داند شما بهترین مقصد ممکن برای آن است.",
    focusArea: "جریان طبیعی پول",
    visualGradient: "from-emerald-600 via-teal-700 to-emerald-950",
    category: "wealth",
    symbol: "🌊"
  },
  {
    id: 16,
    text: "فراوانی حالت طبیعی زندگی من است.",
    englishTranslation: "Abundance is my natural state of life.",
    description: "شما برای فقر به دنیا نیامده‌اید. فراوانی حالت طبیعی زندگی شماست. هرچه بیشتر به آن باور داشته باشید، آنچه را که حق آن دارید دریافت می‌کنید.",
    focusArea: "حالت طبیعی فراوانی",
    visualGradient: "from-yellow-500 via-emerald-600 to-emerald-950",
    category: "wealth",
    symbol: "🌳"
  },

  // === باورهای مذاکره ===
  {
    id: 17,
    text: "من در هر مذاکره آرامش خود را حفظ می‌کنم.",
    englishTranslation: "I maintain my peace in every negotiation.",
    description: "آرامش شما در مذاکره، سلاح قدرتمند شماست. وقتی طرف مقابل احساس کند شما عصبانی نیستید، او هم آرام می‌شود و توافق واقعی شکل می‌گیرد.",
    focusArea: "آرامش در مذاکره",
    visualGradient: "from-blue-500 via-indigo-600 to-blue-950",
    category: "negotiation",
    symbol: "🧘"
  },
  {
    id: 18,
    text: "هیچ معامله‌ای ارزش از دست دادن عزت نفس و آرامش مرا ندارد.",
    englishTranslation: "No deal is worth losing my self-respect and peace.",
    description: "شما هرگز یک معامله را به قیمت عزت نفس و آرامش خود نمی‌فروشید. اگر معامله‌ای این دو را تهدید کند، شما با احترام از آن دوری می‌کنید.",
    focusArea: "حفظ عزت نفس در معامله",
    visualGradient: "from-indigo-500 via-blue-600 to-indigo-950",
    category: "negotiation",
    symbol: "🛡️"
  },
  {
    id: 19,
    text: "من به راحتی توافق‌های برد-برد خلق می‌کنم.",
    englishTranslation: "I easily create win-win agreements.",
    description: "توافق‌های برد-برد هنر شماست. شما به هر دو طرف می‌فهمانید چرا این معامله برایشان عالی است و این باعث می‌شود معاملات شما همیشه بسته شوند.",
    focusArea: "هنر خلق برد-برد",
    visualGradient: "from-blue-600 via-cyan-700 to-blue-950",
    category: "negotiation",
    symbol: "🤝"
  },
  {
    id: 20,
    text: "همیشه راه‌حلی وجود دارد که همه طرف‌ها از آن سود ببرند.",
    englishTranslation: "There is always a solution that benefits all parties.",
    description: "در هر مذاکره، راه‌حل وجود دارد. وظیفه شما پیدا کردن آن راه‌حل است، نه جنگ برای برد بیشتر. راه‌حل همیشه وجود دارد.",
    focusArea: "باور به وجود راه‌حل",
    visualGradient: "from-cyan-500 via-blue-600 to-cyan-900",
    category: "negotiation",
    symbol: "⚖️"
  },
  {
    id: 21,
    text: "سکوت، اعتماد به نفس و شنیدن از بزرگ‌ترین ابزارهای من هستند.",
    englishTranslation: "Silence, self-confidence and listening are my greatest tools.",
    description: "شما بیشتر حرف می‌زنید یا بیشتر می‌شنوید؟ استادان بازار بیشتر می‌شنوند. سکوت شما فضای اعتماد به نفس را برای طرف مقابل باز می‌کند.",
    focusArea: "هنر سکوت و شنیدن",
    visualGradient: "from-blue-700 via-indigo-800 to-blue-950",
    category: "negotiation",
    symbol: "👂"
  },

  // === باورهای مشارکت در ساخت ===
  {
    id: 22,
    text: "بهترین پروژه‌های مشارکتی به راحتی مرا پیدا می‌کنند.",
    englishTranslation: "The best partnership projects find me easily.",
    description: "شما یک مگنت برای پروژه‌های بزرگ هستید. سرمایه‌گذاران و سازندگان، وقتی به دنبال مشاوران استاد می‌گردند، نام شما را پیدا می‌کنند.",
    focusArea: "جذب پروژه‌های مشارکتی",
    visualGradient: "from-purple-500 via-fuchsia-600 to-purple-950",
    category: "partnership",
    symbol: "🏗️"
  },
  {
    id: 23,
    text: "مالکان به من اعتماد می‌کنند.",
    englishTranslation: "Property owners trust me.",
    description: "اعتماد مالکان به شما، ارزشمندترین دارایی شماست. این اعتماد با سال‌ها صداقت و تخصص ساخته شده و هیچ پولی نمی‌تواند آن را خریداری کند.",
    focusArea: "اعتماد مالکان",
    visualGradient: "from-fuchsia-500 via-purple-600 to-fuchsia-950",
    category: "partnership",
    symbol: "🤝"
  },
  {
    id: 24,
    text: "من فرصت‌های ارزشمند را قبل از دیگران تشخیص می‌دهم.",
    englishTranslation: "I identify valuable opportunities before others.",
    description: "ذهن شما مثل یک رادار قدرتمند کار می‌کند. وقتی فرصتی در بازار پنهان می‌شود، شما اولین نفر هستید که آن را می‌بیند.",
    focusArea: "تشخیص زودهنگام فرصت",
    visualGradient: "from-purple-600 via-violet-700 to-purple-950",
    category: "partnership",
    symbol: "🔍"
  },
  {
    id: 25,
    text: "ذهن من مانند یک رادار قدرتمند، پروژه‌های سودآور را شناسایی می‌کند.",
    englishTranslation: "My mind is like a powerful radar that detects profitable projects.",
    description: "شما یک رادار هستید. ذهن شما همیشه در حال اسکن بازار است و فرصت‌های پنهان را پیدا می‌کند که دیگران نمی‌بینند.",
    focusArea: "رادار ذهنی سودآور",
    visualGradient: "from-violet-500 via-purple-600 to-violet-950",
    category: "partnership",
    symbol: "📡"
  },
  {
    id: 26,
    text: "هر زمین مناسب، مالک مناسب و سازنده مناسب را به هم متصل می‌کنم.",
    englishTranslation: "I connect the right land, the right owner and the right builder.",
    description: "شما یک پل بین فرصت‌ها هستید. وقتی زمین مناسب را به سازنده مناسب متصل می‌کنید، یک پروژه طلایی متولد می‌شود و شما سود سه‌جانبه می‌برید.",
    focusArea: "اتصال فرصت‌ها",
    visualGradient: "from-purple-700 via-fuchsia-800 to-purple-950",
    category: "partnership",
    symbol: "🌉"
  },

  // === سطح استادان بازار ===
  {
    id: 27,
    text: "من از شرایط بازار بزرگ‌تر هستم.",
    englishTranslation: "I am bigger than the market conditions.",
    description: "بازار می‌تواند رکود باشد یا رونق، اما شما همیشه بزرگ‌تر از شرایط هستید. شما شرایط را مدیریت می‌کنید، نه برعکس.",
    focusArea: "ذهنیت بزرگ‌تر از بازار",
    visualGradient: "from-rose-500 via-red-600 to-rose-950",
    category: "mastery",
    symbol: "🦅"
  },
  {
    id: 28,
    text: "رکود و رونق، هر دو برای من فرصت می‌سازند.",
    englishTranslation: "Both recession and boom create opportunities for me.",
    description: "در رکود، فرصت‌های ارزان وجود دارد. در رونق، تقاضا بالا می‌رود. شما در هر دو شرایط، فرصت می‌بینید و از آن‌ها سود می‌برید.",
    focusArea: "فرصت در هر شرایط",
    visualGradient: "from-red-500 via-rose-600 to-red-950",
    category: "mastery",
    symbol: "♻️"
  },
  {
    id: 29,
    text: "موفقیت دیگران موفقیت مرا محدود نمی‌کند.",
    englishTranslation: "Others' success doesn't limit my success.",
    description: "بازار بی‌نهایت بزرگ است. موفقیت دیگران، سقف شما را نمی‌سنجد. هرچه دیگران بیشتر بفروشند، شما هم می‌توانید بیشتر بفروشید.",
    focusArea: "حذف حس رقابت منفی",
    visualGradient: "from-rose-600 via-pink-700 to-rose-950",
    category: "mastery",
    symbol: "🌊"
  },
  {
    id: 30,
    text: "بازار بی‌نهایت فرصت دارد.",
    englishTranslation: "The market has infinite opportunities.",
    description: "شما در یک بازار بی‌نهایت هستید. هر روز فرصت‌های جدیدی متولد می‌شوند و شما همیشه آماده دریافت آن‌ها هستید.",
    focusArea: "باور به فرصت‌های بی‌پایان",
    visualGradient: "from-red-600 via-rose-700 to-red-950",
    category: "mastery",
    symbol: "🌍"
  },
  {
    id: 31,
    text: "من همیشه در زمان مناسب در مکان مناسب قرار می‌گیرم.",
    englishTranslation: "I am always in the right place at the right time.",
    description: "وقتی ذهن شما آماده باشد، فرصت‌ها هم درست زمان می‌آیند. شما همیشه در زمان و مکان درست برای پذیرش فرصت‌ها قرار دارید.",
    focusArea: "زمان و مکان درست",
    visualGradient: "from-amber-600 via-rose-700 to-rose-950",
    category: "mastery",
    symbol: "⏰"
  },
  {
    id: 32,
    text: "ثروت ابتدا در ذهن ساخته می‌شود و سپس در واقعیت ظاهر می‌گردد.",
    englishTranslation: "Wealth is first built in the mind, then appears in reality.",
    description: "شما ابتدا باور می‌کنید، سپس می‌بینید. ذهن شما اول ثروتمند می‌شود، سپس واقعیت. این ترتیب بسیار مهم است.",
    focusArea: "ساخت ثروت در ذهن",
    visualGradient: "from-rose-500 via-amber-600 to-rose-950",
    category: "mastery",
    symbol: "🧠"
  },

  // === باور محوری استادان ===
  {
    id: 33,
    text: "من منبع اعتماد، ارزش و راه‌حل هستم؛ بنابراین فرصت‌ها، افراد و ثروت به طور طبیعی به سمت من جذب می‌شوند.",
    englishTranslation: "I am the source of trust, value and solution; therefore opportunities, people and wealth are naturally attracted to me.",
    description: "این باور محوری شماست. وقتی این جمله را می‌گویید، کائنات می‌فهمد شما آماده هستید. این باور را هر شب قبل از خواب و هر صبح پس از بیداری تکرار کنید.",
    focusArea: "باور محوری استادان بازار",
    visualGradient: "from-amber-400 via-yellow-500 to-emerald-700",
    category: "mastery",
    symbol: "✨"
  }
];

export const BUILT_IN_SOUNDS: BuiltInSound[] = [
  { id: "delta", name: "Delta Waves", subtitle: "خواب عمیق و بازسازی ذهن مالی", frequency: 3, type: "sine", modulation: 174 },
  { id: "theta", name: "Theta Waves", subtitle: "برنامه‌ریزی ضمیر ناخودآگاه", frequency: 8, type: "sine", modulation: 432 },
  { id: "rain", name: "Rain", subtitle: "باران آرامش‌بخش برای رهایی مقاومت", frequency: 180, type: "triangle", modulation: 12 },
  { id: "cosmic", name: "Cosmic Ambient", subtitle: "فضای کیهانی جذب فراوانی", frequency: 432, type: "sine", modulation: 16 },
  { id: "bowls", name: "Tibetan Bowls", subtitle: "کاسه تبتی و پاکسازی ارتعاشی", frequency: 528, type: "sine", modulation: 66 }
];

export const DEFAULT_CUSTOM_AFFIRMATION = "من منبع اعتماد، ارزش و راه‌حل هستم؛ بنابراین فرصت‌ها، افراد و ثروت به طور طبیعی به سمت من جذب می‌شوند.";

export const BRAINWAVE_FREQUENCIES: BrainwaveFrequency[] = [
  { name: "فرکانس ۵۲۸ هرتز (تحول و جذب معجزات)", freq: 528, description: "فرکانس عشق و ترمیم DNA که سدهای ذهنی را برای جذب سریع ثروت می‌شکند.", color: "from-amber-500 to-yellow-600" },
  { name: "فرکانس ۸۸۸ هرتز (فراوانی و ثروت بی‌نهایت)", freq: 888, description: "رزونانس مستقیم با فرکانس ریاضی ثروت و فراوانی مادی در کائنات.", color: "from-emerald-500 to-teal-600" },
  { name: "فرکانس ۴۳۲ هرتز (هارمونی و آرامش کیهانی)", freq: 432, description: "تنظیم ارتعاشات قلب با ریتم طبیعت برای جذب آسان و بدون مقاومت پول.", color: "from-blue-500 to-indigo-600" },
  { name: "امواج تتا ۸ هرتز (خلسه برنامه‌ریزی ناخودآگاه)", freq: 8, description: "فرکانس عمیق مغزی برای دور زدن ذهن منطقی و کاشت مستقیم باورها در ناخودآگاه.", color: "from-purple-500 to-fuchsia-600" }
];