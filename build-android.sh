#!/bin/bash

# ============================================================================
# اسکریپت خودکار ساخت APK اندروید برای اپلیکیشن ونیزان
# این اسکریپت با استفاده از Capacitor فایل APK آماده نصب می‌سازد
# ============================================================================

set -e

echo "🚀 شروع فرآیند ساخت APK اندروید برای گرداب موفقیت ونیزان..."

# بررسی نصب بودن Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js نصب نیست. لطفاً ابتدا Node.js نسخه ۲۰ یا بالاتر را نصب کنید."
    exit 1
fi

# بررسی نصب بودن Java
if ! command -v java &> /dev/null; then
    echo "❌ Java نصب نیست. لطفاً Java ۱۷ یا بالاتر را نصب کنید."
    exit 1
fi

echo "✅ پیش‌نیازها بررسی شدند."

# نصب وابستگی‌ها
echo "📦 در حال نصب وابستگی‌ها..."
npm install

# ساخت نسخه وب
echo "🌐 در حال ساخت نسخه وب..."
npm run build

# بررسی وجود پوشه اندروید
if [ ! -d "android" ]; then
    echo "🤖 پلتفرم اندروید هنوز اضافه نشده. در حال اضافه کردن..."
    npx cap add android
else
    echo "🤖 پلتفرم اندروید قبلاً اضافه شده. در حال همگام‌سازی..."
fi

# همگام‌سازی با Capacitor
echo "🔄 در حال همگام‌سازی فایل‌ها..."
npx cap sync android

# ساخت APK دیباگ
echo "📱 در حال ساخت APK دیباگ..."
cd android
./gradlew assembleDebug

echo ""
echo "✅ ساخت APK با موفقیت انجام شد!"
echo ""
echo "📁 مسیر فایل APK:"
echo "   android/app/build/outputs/apk/debug/app-debug.apk"
echo ""
echo "🔐 برای ساخت APK امضا شده (Release) دستور زیر را اجرا کنید:"
echo "   npm run android:release"
echo ""
echo "🌐 برای انتشار در گوگل پلی (AAB):"
echo "   npm run android:bundle"
echo ""
