# Hướng dẫn Deployment Chi tiết

## 🐳 Docker Deployment

### Phương pháp 1: Docker đơn giản

```bash
# 1. Build image
docker build -t beqeek-web .

# 2. Chạy container
docker run -d \
  --name beqeek-app \
  -p 3000:80 \
  --restart unless-stopped \
  beqeek-web

# 3. Kiểm tra
curl http://localhost:3000/health
```

### Phương pháp 2: Docker Compose (Khuyến nghị)

```bash
# 1. Chạy ứng dụng
docker-compose up -d

# 2. Kiểm tra logs
docker-compose logs -f web

# 3. Scale nếu cần
docker-compose up -d --scale web=3

# 4. Update ứng dụng
docker-compose pull
docker-compose up -d

# 5. Cleanup
docker-compose down
docker system prune -f
```

### Phương pháp 3: Production với Nginx Proxy

```bash
# 1. Chạy với nginx proxy
docker-compose --profile proxy up -d

# 2. Cấu hình SSL (nếu cần)
# Đặt SSL certificates vào ./ssl/
# Cập nhật nginx-proxy.conf với SSL config

# 3. Monitoring
docker-compose ps
docker-compose top
```

## 🌐 Nginx Deployment

### Cài đặt trên Ubuntu/Debian

```bash
# 1. Cài đặt nginx
sudo apt update
sudo apt install nginx

# 2. Build ứng dụng
pnpm build

# 3. Copy files
sudo mkdir -p /var/www/beqeek
sudo cp -r apps/web/dist/* /var/www/beqeek/

# 4. Cấu hình nginx
sudo cp nginx.conf /etc/nginx/sites-available/beqeek

# 5. Enable site
sudo ln -s /etc/nginx/sites-available/beqeek /etc/nginx/sites-enabled/
sudo rm /etc/nginx/sites-enabled/default  # Remove default

# 6. Test và restart
sudo nginx -t
sudo systemctl restart nginx
sudo systemctl enable nginx

# 7. Kiểm tra
curl http://localhost/health
```

### Cài đặt trên CentOS/RHEL

```bash
# 1. Cài đặt nginx
sudo yum install epel-release
sudo yum install nginx

# 2. Build và copy files (tương tự Ubuntu)
pnpm build
sudo mkdir -p /var/www/beqeek
sudo cp -r apps/web/dist/* /var/www/beqeek/

# 3. Cấu hình nginx
sudo cp nginx.conf /etc/nginx/conf.d/beqeek.conf

# 4. SELinux (nếu enabled)
sudo setsebool -P httpd_can_network_connect 1
sudo chcon -R -t httpd_exec_t /var/www/beqeek/

# 5. Firewall
sudo firewall-cmd --permanent --add-service=http
sudo firewall-cmd --permanent --add-service=https
sudo firewall-cmd --reload

# 6. Start nginx
sudo systemctl start nginx
sudo systemctl enable nginx
```

## 🔧 Production Optimizations

### 1. Environment Variables

Tạo file `.env.production`:

```bash
# .env.production
NODE_ENV=production
VITE_API_URL=https://api.yourdomain.com
VITE_APP_VERSION=1.0.0
```

### 2. SSL/HTTPS Setup

```bash
# Sử dụng Let's Encrypt
sudo apt install certbot python3-certbot-nginx

# Tạo SSL certificate
sudo certbot --nginx -d yourdomain.com

# Auto-renewal
sudo crontab -e
# Thêm: 0 12 * * * /usr/bin/certbot renew --quiet
```

### 3. Performance Monitoring

```bash
# Nginx access logs
sudo tail -f /var/log/nginx/access.log

# Error logs
sudo tail -f /var/log/nginx/error.log

# System resources
htop
df -h
free -m
```

### 4. Backup Strategy

```bash
#!/bin/bash
# backup.sh

DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/backup/beqeek"

# Backup application files
tar -czf "$BACKUP_DIR/app_$DATE.tar.gz" /var/www/beqeek/

# Backup nginx config
tar -czf "$BACKUP_DIR/nginx_$DATE.tar.gz" /etc/nginx/sites-available/beqeek

# Keep only last 7 days
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete

echo "Backup completed: $DATE"
```

## 🚀 CI/CD Integration

### GitHub Actions Example

```yaml
# .github/workflows/deploy.yml
name: Deploy to Production

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '22'
          
      - name: Install pnpm
        run: npm install -g pnpm
        
      - name: Install dependencies
        run: pnpm install
        
      - name: Build
        run: pnpm build
        
      - name: Deploy to server
        run: |
          rsync -avz --delete apps/web/dist/ user@server:/var/www/beqeek/
          ssh user@server 'sudo systemctl reload nginx'
```

## 🔍 Troubleshooting

### Common Issues

1. **404 errors on refresh:**
   - Kiểm tra `try_files` trong nginx config
   - Đảm bảo SPA routing được cấu hình đúng

2. **Static assets không load:**
   - Kiểm tra MIME types trong nginx
   - Verify file permissions

3. **Performance issues:**
   - Enable gzip compression
   - Optimize caching headers
   - Use CDN cho static assets

### Health Checks

```bash
# Application health
curl http://localhost/health

# Nginx status
sudo systemctl status nginx

# Check ports
sudo netstat -tlnp | grep :80

# Check disk space
df -h

# Check memory
free -m
```

## 📊 Monitoring & Logs

### Log Locations

- Nginx access: `/var/log/nginx/access.log`
- Nginx error: `/var/log/nginx/error.log`
- System logs: `journalctl -u nginx`

### Monitoring Tools

```bash
# Install monitoring tools
sudo apt install htop iotop nethogs

# Real-time monitoring
htop           # CPU/Memory
iotop          # Disk I/O
nethogs        # Network usage
```

---

**Lưu ý:** Thay thế `yourdomain.com` bằng domain thực tế của bạn và cập nhật các đường dẫn phù hợp với môi trường production.