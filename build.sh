#!/bin/bash

# ============================================
# Build and Deployment Script
# Usage: ./build.sh [production|dev|k8s|push]
# ============================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
IMAGE_NAME="${DOCKER_IMAGE_NAME:-hamza-portfolio}"
IMAGE_TAG="${DOCKER_IMAGE_TAG:-latest}"
REGISTRY="${DOCKER_REGISTRY:-docker.io}"
DOCKER_USERNAME="${DOCKER_USERNAME:-}"

# Functions
print_header() {
    echo -e "${BLUE}╔════════════════════════════════════════╗${NC}"
    echo -e "${BLUE}║${NC} $1"
    echo -e "${BLUE}╚════════════════════════════════════════╝${NC}"
}

print_success() {
    echo -e "${GREEN}✓${NC} $1"
}

print_error() {
    echo -e "${RED}✗${NC} $1"
}

print_info() {
    echo -e "${YELLOW}ℹ${NC} $1"
}

# Check Docker is installed
check_docker() {
    if ! command -v docker &> /dev/null; then
        print_error "Docker is not installed"
        exit 1
    fi
    print_success "Docker found"
}

# Check Docker daemon is running
check_docker_daemon() {
    # Try docker ps first
    if docker ps > /dev/null 2>&1; then
        print_success "Docker daemon is running"
        return 0
    fi
    
    # If docker ps fails, check if Docker service is running
    if systemctl is-active --quiet docker 2>/dev/null; then
        print_success "Docker service is running"
        print_info "Note: You may need to add your user to the docker group:"
        print_info "  sudo usermod -aG docker \$USER"
        print_info "  newgrp docker"
        return 0
    fi
    
    # Check with sudo as fallback
    if sudo -n docker ps > /dev/null 2>&1; then
        print_success "Docker daemon is running (using sudo)"
        return 0
    fi
    
    print_error "Docker daemon is not running"
    print_info "Try starting it with: sudo systemctl start docker"
    exit 1
}

# Build development image
build_dev() {
    print_header "Building Development Image"
    
    docker build \
        -f Dockerfile \
        -t "${IMAGE_NAME}:${IMAGE_TAG}" \
        -t "${IMAGE_NAME}:dev" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" \
        .
    
    print_success "Development image built successfully"
    print_info "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
    print_info "Run with: docker run -d -p 80:80 ${IMAGE_NAME}:${IMAGE_TAG}"
}

# Build production image
build_prod() {
    print_header "Building Production Image"
    
    docker build \
        -f Dockerfile.prod \
        -t "${IMAGE_NAME}:${IMAGE_TAG}" \
        -t "${IMAGE_NAME}:prod" \
        --build-arg BUILD_DATE="$(date -u +'%Y-%m-%dT%H:%M:%SZ')" \
        --build-arg VCS_REF="$(git rev-parse --short HEAD 2>/dev/null || echo 'unknown')" \
        .
    
    print_success "Production image built successfully"
    print_info "Image: ${IMAGE_NAME}:${IMAGE_TAG}"
}

# Run container
run_container() {
    print_header "Running Container"
    
    CONTAINER_ID=$(docker run -d -p 80:80 --name "${IMAGE_NAME}-dev" "${IMAGE_NAME}:${IMAGE_TAG}" 2>/dev/null) || true
    
    if [ -z "$CONTAINER_ID" ]; then
        print_info "Container with name ${IMAGE_NAME}-dev already exists, starting it..."
        docker start "${IMAGE_NAME}-dev"
    else
        print_success "Container started: ${CONTAINER_ID:0:12}"
    fi
    
    print_info "Access at: http://localhost/"
    print_info "View logs: docker logs -f ${IMAGE_NAME}-dev"
}

# Stop container
stop_container() {
    print_header "Stopping Container"
    
    if docker ps -a | grep -q "${IMAGE_NAME}-dev"; then
        docker stop "${IMAGE_NAME}-dev" 2>/dev/null || true
        docker rm "${IMAGE_NAME}-dev" 2>/dev/null || true
        print_success "Container stopped and removed"
    else
        print_info "No running container found"
    fi
}

# Build with Docker Compose
build_compose() {
    print_header "Building with Docker Compose"
    
    docker-compose build
    print_success "Docker Compose build completed"
}

# Start with Docker Compose
start_compose() {
    print_header "Starting with Docker Compose"
    
    docker-compose up -d
    print_success "Services started"
    print_info "Access at: http://localhost/"
}

# Stop Docker Compose
stop_compose() {
    print_header "Stopping Docker Compose"
    
    docker-compose down
    print_success "Services stopped"
}

# Deploy to Kubernetes
deploy_k8s() {
    print_header "Deploying to Kubernetes"
    
    if ! command -v kubectl &> /dev/null; then
        print_error "kubectl is not installed"
        exit 1
    fi
    
    print_info "Applying Kubernetes manifests..."
    kubectl apply -f k8s-deployment.yaml
    
    print_success "Kubernetes deployment applied"
    print_info "View deployment: kubectl get deployment -n hamza-portfolio"
    print_info "View pods: kubectl get pods -n hamza-portfolio"
    print_info "Port forward: kubectl port-forward -n hamza-portfolio svc/portfolio-service 8080:80"
}

# Push to Docker Hub
push_docker() {
    print_header "Pushing to Docker Hub"
    
    if [ -z "$DOCKER_USERNAME" ]; then
        read -p "Docker Hub username: " DOCKER_USERNAME
    fi
    
    docker login
    
    docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
    docker tag "${IMAGE_NAME}:${IMAGE_TAG}" "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
    
    docker push "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:${IMAGE_TAG}"
    docker push "${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}:latest"
    
    print_success "Image pushed successfully"
    print_info "Pull with: docker pull ${REGISTRY}/${DOCKER_USERNAME}/${IMAGE_NAME}"
}

# Show usage
usage() {
    cat << EOF
${BLUE}Portfolio Docker Build Script${NC}

${YELLOW}Usage:${NC}
    $0 [command] [options]

${YELLOW}Commands:${NC}
    dev              Build development image and run
    prod             Build production image
    build-compose    Build with Docker Compose
    start-compose    Start services with Docker Compose
    stop-compose     Stop services with Docker Compose
    run              Run container
    stop             Stop container
    k8s              Deploy to Kubernetes
    push             Push to Docker Hub
    clean            Remove all containers and images
    logs             Show container logs
    help             Show this help message

${YELLOW}Examples:${NC}
    $0 dev              # Build and run development version
    $0 prod             # Build production image
    $0 k8s              # Deploy to Kubernetes
    $0 push             # Push to Docker Hub
    
${YELLOW}Environment Variables:${NC}
    DOCKER_USERNAME    Docker Hub username
    DOCKER_IMAGE_NAME  Image name (default: hamza-portfolio)
    DOCKER_IMAGE_TAG   Image tag (default: latest)

EOF
}

# Clean all
clean() {
    print_header "Cleaning Up"
    
    if docker ps -a | grep -q "${IMAGE_NAME}"; then
        print_info "Removing containers..."
        docker ps -a | grep "${IMAGE_NAME}" | awk '{print $1}' | xargs docker rm -f 2>/dev/null || true
    fi
    
    if docker images | grep -q "${IMAGE_NAME}"; then
        print_info "Removing images..."
        docker images | grep "${IMAGE_NAME}" | awk '{print $3}' | xargs docker rmi -f 2>/dev/null || true
    fi
    
    print_success "Cleanup completed"
}

# Show logs
show_logs() {
    print_header "Container Logs"
    
    if docker ps | grep -q "${IMAGE_NAME}"; then
        docker logs -f "${IMAGE_NAME}-dev"
    else
        print_error "Container is not running"
        exit 1
    fi
}

# Main
main() {
    case "${1:-help}" in
        dev)
            check_docker
            check_docker_daemon
            build_dev
            run_container
            ;;
        prod)
            check_docker
            check_docker_daemon
            build_prod
            ;;
        build-compose)
            check_docker
            check_docker_daemon
            build_compose
            ;;
        start-compose)
            check_docker
            check_docker_daemon
            start_compose
            ;;
        stop-compose)
            stop_compose
            ;;
        run)
            run_container
            ;;
        stop)
            stop_container
            ;;
        k8s)
            build_prod
            deploy_k8s
            ;;
        push)
            push_docker
            ;;
        clean)
            clean
            ;;
        logs)
            show_logs
            ;;
        help)
            usage
            ;;
        *)
            print_error "Unknown command: $1"
            usage
            exit 1
            ;;
    esac
}

# Run main
main "$@"
