@echo off
chcp 65001 >nul

:: ============================================================================
:: اسکریپت خودکار ساخت APK اندروید برای اپلیکیشن ونیزان (Windows)
:: این اسکریپت با استفاده از Capacitor فایل APK آماده نصب می‌سازد
:: ============================================================================

echo 🚀 شروع فرآیند ساخت APK اندروید برای گرداب موفقیت ونیزان...

:: بررسی Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js نصب نیست. لطفاً ابتدا Node.js نسخه ۲۰ یا بالاتر را نصب کنید.
    exit /b 1
)

:: بررسی Java
java -version >nul 2>&1
if errorlevel 1 (
    echo ❌ Java نصب نیست. لطفاً Java ۱۷ یا بالاتر را نصب کنید.
    exit /b 1
)

echo ✅ پیش‌نیازها بررسی شدند.

:: نصب وابستگی‌ها
echo 📦 در حال نصب وابستگی‌ها...
call npm install

:: ساخت نسخه وب
echo 🌐 در حال ساخت نسخه وب...
call npm run build

:: بررسی وجود پوشه اندروید
if not exist "android" (
    echo 🤖 پلتفرم اندروید هنوز اضافه نشده. در حال اضافه کردن...
    call npx cap add android
) else (
    echo 🤖 پلتفرم اندروید قبلاً اضافه شده. در حال همگام‌سازی...
)

:: همگام‌سازی با Capacitor
echo 🔄 در حال همگام‌سازی فایل‌ها...
call npx cap sync android

:: ساخت APK دیباگ
echo 📱 در حال ساخت APK دیباگ...
cd android
gradlew assembleDebug

echo.
echo ✅ ساخت APK با موفقیت انجام شد!
echo.
echo 📁 مسیر فایل APK:
echo    android/app/build/outputs/apk/debug/app-debug.apk
echo.
echo 🔐 برای ساخت APK امضا شده ^(Release^) دستور زیر را اجرا کنید:
echo    npm run android:release
echo.
echo 🌐 برای انتشار در گوگل پلی ^(AAB^):
echo    npm run android:bundle
echo.

pause
