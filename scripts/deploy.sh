#!/bin/bash

# Hata durumunda scripti hemen durdur
set -e

echo "============================================="
echo "🚀 Starwebflow Güvenli Dağıtım (Deploy) Başlıyor..."
echo "============================================="

# 1. Proje dizinine git (Kendi sunucu dizininize göre ayarlayabilirsiniz, varsayılan: /var/www/starwebflow)
cd /var/www/starwebflow

echo "📦 1/5: Github'dan en güncel kodlar çekiliyor..."
git fetch origin main
git reset --hard origin/main

echo "🛠️ 2/5: Yeni paketler (varsa) yükleniyor..."
npm install

echo "⚙️ 3/5: Prisma istemcisi oluşturuluyor..."
npx prisma generate

echo "🗄️ 4/5: Veritabanı GÜVENLİ bir şekilde güncelleniyor..."
# DİKKAT: --accept-data-loss komutu KASTEN EKLENMEMİŞTİR.
# Eğer veritabanında veri kaybına yol açacak bir değişiklik varsa 
# bu komut otomatik olarak HATA verecek ve projeyi bozmadan duracaktır.
# Böylece mevcut veriler (mailler, kullanıcılar) ASLA silinmez.
npx prisma db push

echo "🏗️ 5/5: Next.js Projesi derleniyor (Build)..."
npm run build

echo "🔄 6/6: Sunucu PM2 ile yeniden başlatılıyor..."
# PM2'deki uygulama adınız farklıysa "starwebflow" kısmını değiştirebilirsiniz
pm2 restart starwebflow || pm2 restart all

echo "============================================="
echo "✅ BAŞARILI: Sistem veri kaybı yaşanmadan güncellendi!"
echo "============================================="
