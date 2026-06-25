# Elite Pro Deployment Guide for starwebflow.com

This guide contains the step-by-step instructions to deploy your application securely and robustly to your Hostinger VPS, utilizing Cloudflare, PM2, and Nginx.

## Step 1: Cloudflare Setup (DNS & WAF)
1. Create a free account at [Cloudflare](https://dash.cloudflare.com/sign-up).
2. Add your site `starwebflow.com`.
3. Cloudflare will give you two **Nameservers**.
4. Go to your **Ionos** dashboard, find the domain settings, and change the nameservers to the ones provided by Cloudflare.
5. In Cloudflare's **DNS** tab, ensure you have an `A` record for `@` and `www` pointing to your **Hostinger VPS IP Address**.
6. Set the Proxy status to **Proxied (Orange Cloud)**.
7. Go to **SSL/TLS -> Overview** and set it to **Full (Strict)**.

## Step 2: VPS Connection & File Transfer
1. Connect to your VPS via SSH:
   ```bash
   ssh root@<YOUR_VPS_IP>
   ```
2. Upload this entire project folder to your VPS. You can use SCP, SFTP (FileZilla), or Git:
   ```bash
   scp -r C:\Users\sinan\Desktop\projeler\starwebflow root@<YOUR_VPS_IP>:/var/www/starwebflow
   ```

## Step 3: Server Hardening & Setup
1. On your VPS, navigate to the deployment folder:
   ```bash
   cd /var/www/starwebflow/deploy
   ```
2. Make the setup script executable and run it:
   ```bash
   chmod +x setup-server.sh
   ./setup-server.sh
   ```
   *This installs UFW, Fail2ban, Node.js 20, Nginx, Certbot, and PM2.*

## Step 4: Nginx Configuration
1. Copy the hardened Nginx configuration:
   ```bash
   sudo cp nginx.conf /etc/nginx/sites-available/starwebflow.com
   sudo ln -s /etc/nginx/sites-available/starwebflow.com /etc/nginx/sites-enabled/
   ```
2. Remove the default Nginx configuration:
   ```bash
   sudo rm /etc/nginx/sites-enabled/default
   ```
3. Test Nginx and restart:
   ```bash
   sudo nginx -t
   sudo systemctl restart nginx
   ```

## Step 5: Start the Application (Zero-Downtime Cluster)
1. Go to the project root:
   ```bash
   cd /var/www/starwebflow
   ```
2. Install dependencies and build:
   ```bash
   npm ci
   npx prisma generate
   npm run build
   ```
3. Start the application using PM2 (this uses the `ecosystem.config.js` file):
   ```bash
   pm2 start ecosystem.config.js
   pm2 save
   ```

## Step 6: SSL with Certbot
Generate a Let's Encrypt SSL certificate so Nginx can communicate securely with Cloudflare (Full Strict mode):
```bash
sudo certbot --nginx -d starwebflow.com -d www.starwebflow.com
```

## Step 7: Future Deployments
Whenever you push new code to your VPS, simply run:
```bash
cd /var/www/starwebflow/deploy
chmod +x deploy.sh
./deploy.sh
```
This script will automatically install dependencies, build the Next.js app, and gracefully reload PM2 **without dropping any incoming requests**.

## Step 8 (Optional but Recommended): Sentry Setup
To track errors in production:
1. Create a free account at [Sentry.io](https://sentry.io/).
2. Run `npx @sentry/wizard@latest -i nextjs` in your project folder.
3. Follow the CLI instructions to automatically link your project.
