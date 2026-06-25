#!/bin/bash
# Hostinger VPS Hardening and Setup Script
set -e

echo "Starting VPS Hardening and Initial Setup..."

# Update and upgrade packages
sudo apt update && sudo apt upgrade -y

# Install UFW, Fail2ban, Nginx, Certbot
sudo apt install -y ufw fail2ban nginx certbot python3-certbot-nginx curl

# Setup UFW (Firewall)
echo "Configuring UFW Firewall..."
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow http
sudo ufw allow https
echo "y" | sudo ufw enable

# Configure Fail2ban for SSH
echo "Configuring Fail2ban..."
sudo cp /etc/fail2ban/jail.conf /etc/fail2ban/jail.local
sudo systemctl enable fail2ban
sudo systemctl start fail2ban

# Install Node.js (v20) and NPM
echo "Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# Install PM2 globally
echo "Installing PM2..."
sudo npm install -g pm2
pm2 startup systemd -u $USER --hp /home/$USER

echo "✅ Server Setup Complete! You can now deploy the application."
