# 📱 راهنمای ساخت فایل APK اندروید برای اپلیکیشن ونیزان

این راهنما به شما کمک می‌کند تا اپلیکیشن «گرداب موفقیت ونیزان» را به یک فایل نصبی Android APK تبدیل کنید.

## ✅ پیش‌نیازها

1. **Node.js** نسخه ۲۰ یا بالاتر
2. **Android Studio** (آخرین نسخه stable)
3. **JDK 17** یا بالاتر
4. **Git** (اختیاری)

## 🚀 روش سریع (۳ دستور)

```bash
# ۱. نصب وابستگی‌ها
npm install

# ۲. ساخت APK دیباگ
npm run android:build

# ۳. فایل APK شما آماده است در:
# android/app/build/outputs/apk/debug/app-debug.apk
```

## 📋 مرحله به مرحله

### ۱. نصب وابستگی‌ها
```bash
npm install
```

### ۲. اضافه کردن پلتفرم اندروید (فقط بار اول)
```bash
npm run android:init
```

### ۳. همگام‌سازی فایل‌های وب با پروژه اندروید
```bash
npm run android:sync
```

### ۴. باز کردن در Android Studio
```bash
npm run android:open
```

### ۵. ساخت APK
در Android Studio از منوی:
**Build → Build Bundle(s) / APK(s) → Build APK(s)**

## 🔐 ساخت APK امضا شده (Release)

برای انتشار در کافه بازار، مایکت یا گوگل پلی، باید APK یا AAB را با کلید امضا کنید.

### ساخت keystore
```bash
cd android
keytool -genkey -v -keystore vanizan-key.keystore -alias vanizan -keyalg RSA -keysize 2048 -validity 10000
```

### تنظیمات امضا
فایل `android/app/build.gradle` را باز کنید و در بخش `android.signingConfigs` اضافه کنید:

```gradle
release {
    storeFile file("vanizan-key.keystore")
    storePassword "YOUR_PASSWORD"
    keyAlias "vanizan"
    keyPassword "YOUR_PASSWORD"
}
```

### ساخت Release APK
```bash
npm run android:release
```

فایل خروجی:
```
android/app/build/outputs/apk/release/app-release.apk
```

### ساخت Android App Bundle (AAB) برای گوگل پلی
```bash
npm run android:bundle
```

فایل خروجی:
```
android/app/build/outputs/bundle/release/app-release.aab
```

## 🤖 ساخت خودکار با GitHub Actions

اگر پروژه را روی GitHub قرار دهید، با هر push به شاخه main، GitHub Actions به صورت خودکار APK می‌سازد.

مسیر workflow:
```
.github/workflows/build-apk.yml
```

آرتیفکت‌های خروجی:
- `vanizan-wealth-debug-apk`
- `vanizan-wealth-release-apk`

## 🎨 شخصی‌سازی آیکون و Splash Screen

- آیکون اصلی: `public/android-icon-512.png`
- آیکون ۱۹۲: `public/android-icon-192.png`
- Splash Screen: `public/splash-screen.png`

بعد از تغییر تصاویر، دستور زیر را اجرا کنید:
```bash
npm run android:sync
```

## 🌐 انتشار در مارکت‌ها

### کافه بازار
1. در [پنل توسعه‌دهندگان کافه بازار](https://pishkhan.cafebazaar.ir) ثبت‌نام کنید
2. فایل APK امضا شده را آپلود کنید
3. اسکرین‌شات و توضیحات را تکمیل کنید
4. منتظر تایید باشید

### مایکت
1. در [پنل توسعه‌دهندگان مایکت](https://myket.ir/developer/) ثبت‌نام کنید
2. APK را آپلود کنید

### گوگل پلی
1. در [Google Play Console](https://play.google.com/console) ثبت‌نام کنید
2. فایل AAB امضا شده را آپلود کنید
3. تست و تایید را طی کنید

## 🆘 رفع مشکلات رایج

### خطای Gradle
```bash
cd android
./gradlew clean
```

### خطای Android SDK
مطمئن شوید ANDROID_SDK_ROOT تنظیم شده است:
```bash
export ANDROID_SDK_ROOT=$HOME/Android/Sdk
```

### خطای Java
مطمئن شوید Java 17 یا بالاتر نصب است:
```bash
java -version
```

## 📞 پشتیبانی

برای پشتیبانی و دوره‌های آموزشی به سایت مراجعه کنید:
**vanizan.com**
