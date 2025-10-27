#!/bin/bash

# Beqeek Deployment Script
# Usage: ./deploy.sh [docker|nginx|local]

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    log_info "Checking prerequisites..."
    
    if ! command_exists pnpm; then
        log_error "pnpm is not installed. Please install it first."
        exit 1
    fi
    
    if ! command_exists node; then
        log_error "Node.js is not installed. Please install it first."
        exit 1
    fi
    
    log_success "Prerequisites check passed"
}

# Install dependencies
install_deps() {
    log_info "Installing dependencies..."
    pnpm install
    log_success "Dependencies installed"
}

# Build application
build_app() {
    log_info "Building application..."
    pnpm build
    log_success "Application built successfully"
}

# Docker deployment
deploy_docker() {
    log_info "Starting Docker deployment..."
    
    if ! command_exists docker; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi
    
    # Build and run with docker-compose
    if [ -f "docker-compose.yml" ]; then
        log_info "Using docker-compose..."
        docker-compose down 2>/dev/null || true
        docker-compose build
        docker-compose up -d
        
        # Wait for container to be ready
        log_info "Waiting for container to be ready..."
        sleep 10
        
        # Health check
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            log_success "Docker deployment successful! App is running at http://localhost:3000"
        else
            log_error "Health check failed. Check container logs with: docker-compose logs"
            exit 1
        fi
    else
        # Fallback to simple docker build
        log_info "Using simple Docker build..."
        docker build -t beqeek-web .
        docker stop beqeek-app 2>/dev/null || true
        docker rm beqeek-app 2>/dev/null || true
        docker run -d --name beqeek-app -p 3000:80 --restart unless-stopped beqeek-web
        
        sleep 5
        if curl -f http://localhost:3000/health >/dev/null 2>&1; then
            log_success "Docker deployment successful! App is running at http://localhost:3000"
        else
            log_error "Health check failed. Check container logs with: docker logs beqeek-app"
            exit 1
        fi
    fi
}

# Nginx deployment
deploy_nginx() {
    log_info "Starting Nginx deployment..."
    
    if ! command_exists nginx; then
        log_error "Nginx is not installed. Please install Nginx first."
        exit 1
    fi
    
    # Build first
    build_app
    
    # Check if running as root or with sudo
    if [ "$EUID" -ne 0 ]; then
        log_warning "Nginx deployment requires sudo privileges"
        SUDO="sudo"
    else
        SUDO=""
    fi
    
    # Create web directory
    $SUDO mkdir -p /var/www/beqeek
    
    # Copy built files
    log_info "Copying built files to /var/www/beqeek..."
    $SUDO cp -r apps/web/dist/* /var/www/beqeek/
    
    # Copy nginx config if it doesn't exist
    if [ ! -f "/etc/nginx/sites-available/beqeek" ]; then
        log_info "Installing nginx configuration..."
        $SUDO cp nginx.conf /etc/nginx/sites-available/beqeek
        $SUDO ln -sf /etc/nginx/sites-available/beqeek /etc/nginx/sites-enabled/beqeek
        
        # Remove default site if it exists
        $SUDO rm -f /etc/nginx/sites-enabled/default
    fi
    
    # Test nginx config
    log_info "Testing nginx configuration..."
    $SUDO nginx -t
    
    # Restart nginx
    log_info "Restarting nginx..."
    $SUDO systemctl restart nginx
    $SUDO systemctl enable nginx
    
    # Health check
    sleep 2
    if curl -f http://localhost/health >/dev/null 2>&1; then
        log_success "Nginx deployment successful! App is running at http://localhost"
    else
        log_error "Health check failed. Check nginx logs with: sudo journalctl -u nginx"
        exit 1
    fi
}

# Local preview
deploy_local() {
    log_info "Starting local preview..."
    
    build_app
    
    log_info "Starting preview server..."
    log_success "Local preview will be available at http://localhost:4173"
    log_info "Press Ctrl+C to stop the server"
    
    pnpm --filter web preview
}

# Show usage
show_usage() {
    echo "Usage: $0 [docker|nginx|local]"
    echo ""
    echo "Options:"
    echo "  docker  - Deploy using Docker (recommended for development)"
    echo "  nginx   - Deploy using Nginx (recommended for production)"
    echo "  local   - Start local preview server"
    echo ""
    echo "Examples:"
    echo "  $0 docker   # Deploy with Docker"
    echo "  $0 nginx    # Deploy with Nginx (requires sudo)"
    echo "  $0 local    # Start local preview"
}

# Main script
main() {
    echo "🚀 Beqeek Deployment Script"
    echo "=========================="
    
    if [ $# -eq 0 ]; then
        show_usage
        exit 1
    fi
    
    case "$1" in
        "docker")
            check_prerequisites
            install_deps
            deploy_docker
            ;;
        "nginx")
            check_prerequisites
            install_deps
            deploy_nginx
            ;;
        "local")
            check_prerequisites
            install_deps
            deploy_local
            ;;
        "-h"|"--help"|"help")
            show_usage
            ;;
        *)
            log_error "Unknown option: $1"
            show_usage
            exit 1
            ;;
    esac
}

# Run main function with all arguments
main "$@"