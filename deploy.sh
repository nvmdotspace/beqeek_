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
    
    # Build and run with docker compose
    if [ -f "compose.yml" ]; then
        log_info "Using docker compose..."
        docker compose down 2>/dev/null || true
        docker compose build
        docker compose up -d --remove-orphans

        # Wait for container to be ready
        log_info "Waiting for container to be ready..."
        sleep 10

        # Health check
        if curl -f http://localhost:82/health >/dev/null 2>&1; then
            log_success "Docker deployment successful! App is running at http://localhost:82"
        else
            log_error "Health check failed. Check container logs with: docker compose logs"
            exit 1
        fi
    else
        # Fallback to simple docker build
        log_info "Using simple Docker build..."
        docker build -f Dockerfile.web -t beqeek-web .
        docker stop beqeek-app 2>/dev/null || true
        docker rm beqeek-app 2>/dev/null || true
        docker run -d --name beqeek-app -p 82:80 --restart unless-stopped beqeek-web

        sleep 5
        if curl -f http://localhost:82/health >/dev/null 2>&1; then
            log_success "Docker deployment successful! App is running at http://localhost:82"
        else
            log_error "Health check failed. Check container logs with: docker logs beqeek-app"
            exit 1
        fi
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

# Deploy product-page with Docker
deploy_product_page() {
    log_info "Starting Product Page Docker deployment..."

    if ! command_exists docker; then
        log_error "Docker is not installed. Please install Docker first."
        exit 1
    fi

    # Build and run product-page container
    log_info "Building product-page Docker image..."
    docker build -f Dockerfile.product-page -t beqeek-product-page .

    docker stop beqeek-product-page 2>/dev/null || true
    docker rm beqeek-product-page 2>/dev/null || true
    docker run -d --name beqeek-product-page -p 83:80 --restart unless-stopped beqeek-product-page

    sleep 5
    if curl -f http://localhost:83/health >/dev/null 2>&1; then
        log_success "Product Page deployment successful! Running at http://localhost:83"
    else
        log_error "Health check failed. Check container logs with: docker logs beqeek-product-page"
        exit 1
    fi
}

# Local preview for product-page
preview_product_page() {
    log_info "Starting product-page local preview..."

    log_info "Building product-page..."
    pnpm --filter product-page build

    log_success "Local preview will be available at http://localhost:4173"
    log_info "Press Ctrl+C to stop the server"

    pnpm --filter product-page preview
}

# Show usage
show_usage() {
    echo "Usage: $0 [docker|local|product-page|product-page-local]"
    echo ""
    echo "Options:"
    echo "  docker              - Deploy web app using Docker (recommended)"
    echo "  local               - Start web app local preview server"
    echo "  product-page        - Deploy product landing page with Docker"
    echo "  product-page-local  - Start product landing page local preview"
    echo "  all                 - Deploy both web and product-page with Docker"
    echo ""
    echo "Examples:"
    echo "  $0 docker              # Deploy web app with Docker"
    echo "  $0 local               # Start web app local preview"
    echo "  $0 product-page        # Deploy product landing page"
    echo "  $0 product-page-local  # Preview product landing page locally"
    echo "  $0 all                 # Deploy all services"
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
        "local")
            check_prerequisites
            install_deps
            deploy_local
            ;;
        "product-page")
            check_prerequisites
            install_deps
            deploy_product_page
            ;;
        "product-page-local")
            check_prerequisites
            install_deps
            preview_product_page
            ;;
        "all")
            check_prerequisites
            install_deps
            deploy_docker
            deploy_product_page
            log_success "All services deployed successfully!"
            log_info "Web App: http://localhost:82"
            log_info "Product Page: http://localhost:83"
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