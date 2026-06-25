# starwebflow.com İçin Elite Pro Dağıtım (Deployment) Kılavuzu

Bu kılavuz, uygulamanızı Hostinger VPS'inize Cloudflare, PM2 ve Nginx kullanarak güvenli ve sağlam bir şekilde dağıtmanız için adım adım talimatlar içerir.

## Adım 1: Cloudflare Kurulumu (DNS ve WAF)
1. [Cloudflare](https://dash.cloudflare.com/sign-up) üzerinden ücretsiz bir hesap oluşturun.
2. `starwebflow.com` sitenizi ekleyin.
3. Cloudflare size iki adet **Nameserver (İsim Sunucusu)** verecektir.
4. **Ionos** kontrol panelinize gidin, domain ayarlarını bulun ve mevcut nameserver'ları Cloudflare'in verdikleriyle değiştirin.
5. Cloudflare'in **DNS** sekmesinde, `@` ve `www` için `A` kayıtlarınızın **Hostinger VPS IP Adresinize** yönlendirildiğinden emin olun.
6. Proxy durumunu **Proxied (Turuncu Bulut)** olarak ayarlayın.
7. **SSL/TLS -> Overview** menüsüne gidin ve şifreleme modunu **Full (Strict)** olarak seçin.

## Adım 2: VPS Bağlantısı ve Dosya Aktarımı
1. SSH ile VPS'inize bağlanın:
   ```bash
   ssh root@<VPS_IP_ADRESINIZ>
   ```
2. Bu projenin tüm klasörünü VPS'inize yükleyin. Bunun için SCP, SFTP (FileZilla) veya Git kullanabilirsiniz:
   ```bash
   scp -r C:\Users\sinan\Desktop\projeler\starwebflow root@<VPS_IP_ADRESINIZ>:/var/www/starwebflow
   ```

## Adım 3: Sunucu Sıkılaştırma (Hardening) ve Kurulum
1. VPS'inizde, deploy klasörüne gidin:
   ```bash
   cd /var/www/starwebflow/deploy
   ```
2. Kurulum scriptini çalıştırılabilir yapın ve başlatın:
   ```bash
   chmod +x setup-server.sh
   ./setup-server.sh
   ```
   *Bu komut UFW (Güvenlik Duvarı), Fail2ban, Node.js 20, Nginx, Certbot ve PM2'yi kurar.*

## Adım 4: Nginx Yapılandırması
1. Güvenliği artırılmış Nginx yapılandırmasını kopyalayın:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/starwebflow.com
   sudo ln -s /etc/nginx/sites-available/starwebflow.com /etc/nginx/sites-enabled/
   ```
2. Varsayılan Nginx yapılandırmasını silin:
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   ```
3. Nginx ayarlarını test edin ve yeniden başlatın:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Adım 5: Uygulamayı Başlatma (Sıfır Kesinti Kümesi / Zero-Downtime Cluster)
1. Proje ana dizinine gidin:
   ```bash
   cd /var/www/starwebflow
   ```
2. Bağımlılıkları kurun ve projeyi derleyin:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```
3. Uygulamayı PM2 kullanarak başlatın (bu işlem `ecosystem.config.js` dosyasını kullanır):
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

## Adım 6: Certbot ile SSL Kurulumu
Nginx'in Cloudflare ile güvenli iletişim (Full Strict modu) kurabilmesi için Let's Encrypt SSL sertifikası oluşturun:
```bash
sudo certbot --nginx -d starwebflow.com -d www.starwebflow.com
```

## Adım 7: Gelecekteki Güncellemeler (Deployments)
VPS'inize yeni kod yüklediğinizde, sadece şu komutları çalıştırmanız yeterlidir:
```bash
cd /var/www/starwebflow/deploy
chmod +x deploy.sh
./deploy.sh
```
Bu script bağımlılıkları otomatik olarak kurar, Next.js uygulamasını derler ve **gelen istekleri düşürmeden** PM2'yi yumuşak bir şekilde yeniden başlatır (graceful reload).

## Adım 8 (İsteğe Bağlı Ama Önerilir): Sentry Kurulumu
Canlı ortamdaki hataları takip etmek için:
1. [Sentry.io](https://sentry.io/) üzerinden ücretsiz bir hesap oluşturun.
2. Proje klasörünüzde `npx @sentry/wizard@latest -i nextjs` komutunu çalıştırın.
3. Projenizi otomatik olarak bağlamak için CLI (komut satırı) talimatlarını izleyin.
