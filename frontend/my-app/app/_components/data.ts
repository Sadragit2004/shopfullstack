import React from "react";
import { Icon, CATEGORY_ICON_MAP } from "./icons";

// ر ا export میکنیم
export { CATEGORY_ICON_MAP };

export interface Category {
  id: string;
  title: string;
  href: string;
  icon?: string;
  children?: Category[];
}

export interface Product {
  id: string;
  title: string;
  price: number;
  oldPrice?: number;
  rating?: number;
  ratingCount?: number;
  sold?: number;
  badge?: string;
  icon: string;
  hue: string;
}

export interface BlogPost {
  id: string;
  title: string;
  excerpt: string;
  date: string;
  readTime: string;
}

export interface Slide {
  id: string;
  badge: string;
  title: string;
  subtitle: string;
  cta: string;
  href: string;
  icon: (p: { className?: string }) => JSX.Element;
  from: string;
  to: string;
}

export const HUES = [
  "from-teal-500/15 to-teal-500/5 text-teal-700 dark:text-teal-300",
  "from-amber-500/15 to-amber-500/5 text-amber-700 dark:text-amber-300",
  "from-rose-500/15 to-rose-500/5 text-rose-700 dark:text-rose-300",
  "from-sky-500/15 to-sky-500/5 text-sky-700 dark:text-sky-300",
  "from-violet-500/15 to-violet-500/5 text-violet-700 dark:text-violet-300",
];

export const CATEGORIES: Category[] = [
  {
    id: "mobile",
    title: "موبایل و تبلت",
    href: "/category/mobile",
    icon: "smartphone",
    children: [
      {
        id: "mobile-phone",
        title: "گوشی موبایل",
        href: "/category/mobile/phone",
        children: [
          {
            id: "mobile-apple",
            title: "اپل",
            href: "/category/mobile/phone/apple",
            children: [
              { id: "iphone-15", title: "آیفون ۱۵", href: "/category/mobile/phone/apple/iphone-15" },
              { id: "iphone-14", title: "آیفون ۱۴", href: "/category/mobile/phone/apple/iphone-14" },
              { id: "iphone-old", title: "آیفون‌های قدیمی‌تر", href: "/category/mobile/phone/apple/older" },
              { id: "apple-access", title: "لوازم جانبی اپل", href: "/category/mobile/phone/apple/accessories" },
            ],
          },
          { id: "mobile-samsung", title: "سامسونگ", href: "/category/mobile/phone/samsung" },
          { id: "mobile-xiaomi", title: "شیائومی", href: "/category/mobile/phone/xiaomi" },
          { id: "mobile-other", title: "سایر برندها", href: "/category/mobile/phone/other" },
        ],
      },
      {
        id: "tablet",
        title: "تبلت",
        href: "/category/mobile/tablet",
        children: [
          { id: "ipad", title: "آیپد", href: "/category/mobile/tablet/ipad" },
          { id: "android-tab", title: "تبلت اندروید", href: "/category/mobile/tablet/android" },
        ],
      },
      { id: "mobile-access", title: "لوازم جانبی موبایل", href: "/category/mobile/accessories" },
    ],
  },
  {
    id: "computer",
    title: "لپ‌تاپ و کامپیوتر",
    href: "/category/computer",
    icon: "laptop",
    children: [
      {
        id: "laptop",
        title: "لپ‌تاپ",
        href: "/category/computer/laptop",
        children: [
          { id: "laptop-office", title: "لپ‌تاپ اداری", href: "/category/computer/laptop/office" },
          {
            id: "laptop-gaming",
            title: "لپ‌تاپ گیمینگ",
            href: "/category/computer/laptop/gaming",
            children: [
              { id: "asus-rog", title: "ایسوس ROG", href: "/category/computer/laptop/gaming/asus" },
              { id: "msi", title: "ام‌اس‌آی", href: "/category/computer/laptop/gaming/msi" },
              { id: "lenovo-legion", title: "لنوو لیجن", href: "/category/computer/laptop/gaming/lenovo" },
            ],
          },
          { id: "laptop-design", title: "لپ‌تاپ طراحی", href: "/category/computer/laptop/design" },
        ],
      },
      { id: "desktop", title: "کامپیوتر رومیزی", href: "/category/computer/desktop" },
      { id: "parts", title: "قطعات کامپیوتر", href: "/category/computer/parts" },
    ],
  },
  {
    id: "fashion",
    title: "مد و پوشاک زنانه",
    href: "/category/fashion",
    icon: "shirt",
    children: [
      { id: "formal-wear", title: "لباس مجلسی", href: "/category/fashion/formal" },
      { id: "casual-wear", title: "لباس روزمره", href: "/category/fashion/casual" },
      { id: "bags-shoes", title: "کیف و کفش", href: "/category/fashion/bags-shoes" },
    ],
  },
  {
    id: "home",
    title: "خانه و آشپزخانه",
    href: "/category/home",
    icon: "home",
    children: [
      {
        id: "kitchen",
        title: "لوازم آشپزخانه",
        href: "/category/home/kitchen",
        children: [
          { id: "small-appliance", title: "لوازم برقی کوچک", href: "/category/home/kitchen/small-appliance" },
          { id: "cookware", title: "ظروف پخت‌وپز", href: "/category/home/kitchen/cookware" },
        ],
      },
      { id: "decor", title: "دکوراسیون", href: "/category/home/decor" },
      { id: "furniture", title: "مبلمان", href: "/category/home/furniture" },
    ],
  },
  {
    id: "beauty",
    title: "زیبایی و آرایشی",
    href: "/category/beauty",
    icon: "sparkles",
    children: [
      { id: "skincare", title: "مراقبت پوست", href: "/category/beauty/skincare" },
      { id: "makeup", title: "آرایشی", href: "/category/beauty/makeup" },
    ],
  },
  {
    id: "sport",
    title: "ورزش و سفر",
    href: "/category/sport",
    icon: "dumbbell",
    children: [
      {
        id: "fitness",
        title: "ورزش‌های بدنسازی",
        href: "/category/sport/fitness",
        children: [
          { id: "gym-equipment", title: "تجهیزات باشگاهی", href: "/category/sport/fitness/equipment" },
          { id: "sportswear", title: "پوشاک ورزشی", href: "/category/sport/fitness/wear" },
        ],
      },
      { id: "travel-gear", title: "لوازم سفر", href: "/category/sport/travel" },
    ],
  },
  {
    id: "kids",
    title: "کودک و اسباب‌بازی",
    href: "/category/kids",
    icon: "baby",
  },
  {
    id: "books",
    title: "کتاب و لوازم‌التحریر",
    href: "/category/books",
    icon: "book",
    children: [
      { id: "novels", title: "رمان و ادبیات", href: "/category/books/novels" },
      { id: "stationery", title: "لوازم‌التحریر", href: "/category/books/stationery" },
    ],
  },
  {
    id: "auto",
    title: "خودرو و موتورسیکلت",
    href: "/category/auto",
    icon: "car",
  },
];

export const NAV_LINKS = [
  { title: "خانه", href: "/" },
  { title: "ارتباط با ما", href: "/contact" },
  { title: "درباره ما", href: "/about" },
];

export const AMAZING_PRODUCTS: Product[] = [
  { id: "a1", title: "هدفون بی‌سیم نویزکنسل", price: 2450000, oldPrice: 3600000, icon: "smartphone", hue: HUES[0], rating: 4.7, ratingCount: 212 },
  { id: "a2", title: "ساعت هوشمند مدل اسپرت", price: 1890000, oldPrice: 2550000, icon: "smartphone", hue: HUES[1], rating: 4.5, ratingCount: 134 },
  { id: "a3", title: "بلندگوی قابل حمل ضدآب", price: 990000, oldPrice: 1450000, icon: "smartphone", hue: HUES[2], rating: 4.6, ratingCount: 98 },
  { id: "a4", title: "کتری برقی استیل ۲ لیتری", price: 1250000, oldPrice: 1690000, icon: "home", hue: HUES[3], rating: 4.8, ratingCount: 301 },
  { id: "a5", title: "کوله‌پشتی روزمره ضدآب", price: 780000, oldPrice: 1100000, icon: "shirt", hue: HUES[4], rating: 4.4, ratingCount: 76 },
  { id: "a6", title: "پاوربانک ۲۰۰۰۰ میلی‌آمپر", price: 640000, oldPrice: 890000, icon: "smartphone", hue: HUES[0], rating: 4.6, ratingCount: 189 },
];

export const BEST_SELLERS: Product[] = [
  { id: "b1", title: "گوشی موبایل نسل جدید ۱۲۸ گیگ", price: 18900000, sold: 1240, icon: "smartphone", hue: HUES[1] },
  { id: "b2", title: "قهوه‌ساز اتوماتیک خانگی", price: 3450000, sold: 860, icon: "home", hue: HUES[3] },
  { id: "b3", title: "کفش پیاده‌روی سبک", price: 1290000, sold: 742, icon: "shirt", hue: HUES[2] },
  { id: "b4", title: "لپ‌تاپ اداری ۱۴ اینچ", price: 27500000, sold: 511, icon: "laptop", hue: HUES[0] },
  { id: "b5", title: "ست مراقبت پوست روزانه", price: 980000, sold: 693, icon: "sparkles", hue: HUES[4] },
];

export const NEWEST_PRODUCTS: Product[] = [
  { id: "n1", title: "تبلت اندرویدی صفحه بزرگ", price: 6900000, icon: "smartphone", hue: HUES[2] },
  { id: "n2", title: "میز تحریر تاشوی چوبی", price: 2150000, icon: "home", hue: HUES[3] },
  { id: "n3", title: "کیف دوشی چرم طبیعی", price: 1450000, icon: "shirt", hue: HUES[1] },
  { id: "n4", title: "دمبل ست قابل تنظیم", price: 3200000, icon: "dumbbell", hue: HUES[0] },
  { id: "n5", title: "رمان برگزیده‌ی نویسنده‌ی سال", price: 245000, icon: "book", hue: HUES[4] },
  { id: "n6", title: "اسباب‌بازی آموزشی خردسال", price: 390000, icon: "baby", hue: HUES[2] },
];

export const TODAY_SHIP_PRODUCTS: Product[] = [
  { id: "t1", title: "شارژر فست شارژ ۶۵ وات", price: 590000, icon: "smartphone", hue: HUES[0] },
  { id: "t2", title: "تی‌شرت نخی مردانه", price: 320000, icon: "shirt", hue: HUES[1] },
  { id: "t3", title: "ماگ سرامیکی طرح‌دار", price: 180000, icon: "home", hue: HUES[3] },
  { id: "t4", title: "دفترچه یادداشت جلدچرمی", price: 210000, icon: "book", hue: HUES[4] },
  { id: "t5", title: "عینک آفتابی کلاسیک", price: 560000, icon: "shirt", hue: HUES[2] },
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: "p1",
    title: "چطور گوشی مناسب بودجه‌مان را انتخاب کنیم؟",
    excerpt: "راهنمای کوتاهی برای مقایسه‌ی مشخصات فنی و قیمت پیش از خرید گوشی جدید.",
    date: "۱۵ شهریور ۱۴۰۴",
    readTime: "۴ دقیقه مطالعه",
  },
  {
    id: "p2",
    title: "۷ نکته برای چیدمان دکوراسیون خانه‌های کوچک",
    excerpt: "با چند تغییر ساده می‌توانید فضای خانه‌ی خود را بزرگ‌تر و دنج‌تر نشان دهید.",
    date: "۱۰ شهریور ۱۴۰۴",
    readTime: "۶ دقیقه مطالعه",
  },
  {
    id: "p3",
    title: "راهنمای مراقبت از پوست در فصل پاییز",
    excerpt: "تغییر فصل یعنی تغییر روتین مراقبت پوستی؛ این نکات را از دست ندهید.",
    date: "۳ شهریور ۱۴۰۴",
    readTime: "۵ دقیقه مطالعه",
  },
];

export const HERO_SLIDES: Slide[] = [
  {
    id: "s1",
    badge: "پیشنهاد ویژه امروز",
    title: "تا ۴۰٪ تخفیف روی محصولات منتخب",
    subtitle: "فرصت محدوده؛ قبل از تمام‌شدن موجودی، انتخابت رو نهایی کن.",
    cta: "مشاهده تخفیف‌ها",
    href: "/deals",
    icon: Icon.Tag,
    from: "from-teal-800",
    to: "to-teal-950",
  },
  {
    id: "s2",
    badge: "ارسال سریع",
    title: "سفارش تا ظهر، همون امروز درِ خونه‌ات",
    subtitle: "بدون معطلی، بدون دغدغه؛ فقط لذت باز کردن بسته‌ات.",
    cta: "ارسالی‌های امروز",
    href: "/today-shipping",
    icon: Icon.Truck,
    from: "from-amber-600",
    to: "to-amber-800",
  },
  {
    id: "s3",
    badge: "ضمانت اصالت کالا",
    title: "خرید با خیال راحت، امنیت اولویت ماست",
    subtitle: "پرداخت امن، بازگشت ۷ روزه و پشتیبانی ۲۴ ساعته؛ همیشه کنارتیم.",
    cta: "بیشتر بدانید",
    href: "/about",
    icon: Icon.Shield,
    from: "from-stone-800",
    to: "to-teal-950",
  },
];

export function fmtPrice(n: number) {
  return n.toLocaleString("fa-IR");
}