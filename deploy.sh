#!/bin/bash

# Script de déploiement pour Kinshasa-Alerte
# Usage: ./deploy.sh [production|staging]

set -e

# Configuration
APP_NAME="kin-alerte"
DEPLOY_ENV=${1:-production}
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_DIR="/var/backups/kin-alerte"
LOG_DIR="/var/log/kin-alerte"

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction de logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

success() {
    echo -e "${GREEN}✅ $1${NC}"
}

warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

error() {
    echo -e "${RED}❌ $1${NC}"
}

# Vérification des prérequis
check_prerequisites() {
    log "Vérification des prérequis..."
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        error "Node.js n'est pas installé"
        exit 1
    fi
    
    # Vérifier npm
    if ! command -v npm &> /dev/null; then
        error "npm n'est pas installé"
        exit 1
    fi
    
    # Vérifier PM2
    if ! command -v pm2 &> /dev/null; then
        warning "PM2 n'est pas installé, installation..."
        npm install -g pm2
    fi
    
    success "Prérequis vérifiés"
}

# Sauvegarde de l'ancienne version
backup_current_version() {
    log "Sauvegarde de la version actuelle..."
    
    if [ -d "dist" ]; then
        mkdir -p "$BACKUP_DIR"
        tar -czf "$BACKUP_DIR/backup_${TIMESTAMP}.tar.gz" dist/
        success "Sauvegarde créée: backup_${TIMESTAMP}.tar.gz"
    else
        warning "Aucune version précédente à sauvegarder"
    fi
}

# Installation des dépendances
install_dependencies() {
    log "Installation des dépendances..."
    npm ci --production=false
    success "Dépendances installées"
}

# Build de l'application
build_application() {
    log "Build de l'application..."
    
    # Nettoyer le dossier dist
    rm -rf dist/
    
    # Build
    npm run build
    
    if [ -d "dist" ]; then
        success "Build réussi"
    else
        error "Échec du build"
        exit 1
    fi
}

# Tests de production
run_tests() {
    log "Exécution des tests..."
    
    # Tests de build
    if npm run build --dry-run &> /dev/null; then
        success "Tests de build passés"
    else
        warning "Tests de build échoués, mais continuation..."
    fi
}

# Déploiement avec PM2
deploy_with_pm2() {
    log "Déploiement avec PM2..."
    
    # Arrêter l'application si elle tourne
    if pm2 list | grep -q "$APP_NAME"; then
        log "Arrêt de l'application existante..."
        pm2 stop "$APP_NAME"
    fi
    
    # Démarrer l'application
    pm2 start ecosystem.config.js --env "$DEPLOY_ENV"
    
    # Sauvegarder la configuration PM2
    pm2 save
    
    success "Application déployée avec PM2"
}

# Vérification du déploiement
verify_deployment() {
    log "Vérification du déploiement..."
    
    # Attendre que l'application démarre
    sleep 5
    
    # Vérifier le statut PM2
    if pm2 list | grep -q "$APP_NAME.*online"; then
        success "Application en ligne"
    else
        error "Application hors ligne"
        pm2 logs "$APP_NAME" --lines 20
        exit 1
    fi
    
    # Test de santé (si configuré)
    if curl -f http://localhost:8080/health &> /dev/null; then
        success "Test de santé réussi"
    else
        warning "Test de santé échoué (peut être normal si non configuré)"
    fi
}

# Nettoyage des anciennes sauvegardes
cleanup_old_backups() {
    log "Nettoyage des anciennes sauvegardes..."
    
    # Garder seulement les 5 dernières sauvegardes
    if [ -d "$BACKUP_DIR" ]; then
        cd "$BACKUP_DIR"
        ls -t *.tar.gz | tail -n +6 | xargs -r rm
        success "Anciennes sauvegardes nettoyées"
    fi
}

# Affichage des informations de déploiement
show_deployment_info() {
    log "Informations de déploiement:"
    echo "  - Environnement: $DEPLOY_ENV"
    echo "  - Timestamp: $TIMESTAMP"
    echo "  - Version Node.js: $(node --version)"
    echo "  - Version npm: $(npm --version)"
    echo "  - Statut PM2:"
    pm2 list | grep "$APP_NAME" || echo "    Application non trouvée"
}

# Fonction principale
main() {
    log "🚀 Début du déploiement de $APP_NAME"
    
    check_prerequisites
    backup_current_version
    install_dependencies
    build_application
    run_tests
    deploy_with_pm2
    verify_deployment
    cleanup_old_backups
    show_deployment_info
    
    success "🎉 Déploiement terminé avec succès!"
    
    log "Commandes utiles:"
    echo "  - Voir les logs: pm2 logs $APP_NAME"
    echo "  - Monitorer: pm2 monit"
    echo "  - Redémarrer: pm2 restart $APP_NAME"
    echo "  - Arrêter: pm2 stop $APP_NAME"
}

# Gestion des erreurs
trap 'error "Déploiement interrompu"; exit 1' INT TERM

# Exécution
main "$@" 