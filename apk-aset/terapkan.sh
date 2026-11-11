#!/bin/sh
# Dijalankan di workflow setelah `cap add android`: pasang ikon dan splash, hapus splash bawaan yang ditarik memenuhi layar.
set -e
RES=android/app/src/main/res
find "$RES" -name 'splash.png' -delete
cp -r apk-aset/res/. "$RES"/
STYLES="$RES/values/styles.xml"
if grep -q 'Theme.SplashScreen' "$STYLES" && ! grep -q windowSplashScreenBackground "$STYLES"; then
  sed -i '/name="AppTheme.NoActionBarLaunch"/a\        <item name="windowSplashScreenBackground">@color/ssg_bg</item>\n        <item name="windowSplashScreenAnimatedIcon">@mipmap/ssg_foreground</item>' "$STYLES"
fi
echo "Aset APK terpasang"
