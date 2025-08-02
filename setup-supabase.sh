#!/bin/bash

# Script de configuration Supabase pour Kinshasa-Alerte
# Usage: ./setup-supabase.sh

echo "🚀 Configuration Supabase - Kinshasa-Alerte"
echo "=========================================="

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonction pour afficher les messages
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Vérifier que Node.js est installé
if ! command -v node &> /dev/null; then
    print_error "Node.js n'est pas installé. Veuillez l'installer d'abord."
    exit 1
fi

print_success "Node.js détecté: $(node --version)"

# Vérifier que les dépendances sont installées
if [ ! -d "node_modules" ]; then
    print_status "Installation des dépendances..."
    npm install
    if [ $? -ne 0 ]; then
        print_error "Erreur lors de l'installation des dépendances"
        exit 1
    fi
    print_success "Dépendances installées"
else
    print_success "Dépendances déjà installées"
fi

# Vérifier que le fichier .env existe
if [ ! -f ".env" ]; then
    print_error "Fichier .env manquant. Veuillez le créer avec vos clés Supabase."
    exit 1
fi

print_success "Fichier .env détecté"

# Test de connexion initial
print_status "Test de connexion à Supabase..."
node test-connection.js

if [ $? -ne 0 ]; then
    print_warning "La base de données n'est pas encore configurée."
    echo ""
    print_status "Étapes à suivre :"
    echo "1. Allez dans votre dashboard Supabase"
    echo "2. Ouvrez l'éditeur SQL"
    echo "3. Copiez et exécutez le contenu de database-schema.sql"
    echo "4. Créez le bucket 'report-images' dans Storage"
    echo "5. Configurez l'authentification"
    echo "6. Relancez ce script"
    echo ""
    read -p "Appuyez sur Entrée quand vous avez terminé la configuration SQL..."
fi

# Initialisation des données
print_status "Initialisation des données..."
node init-database-complete.js

if [ $? -eq 0 ]; then
    print_success "Données initialisées avec succès !"
else
    print_error "Erreur lors de l'initialisation des données"
    exit 1
fi

# Test final
print_status "Test final de la configuration..."
node test-connection.js

if [ $? -eq 0 ]; then
    print_success "Configuration Supabase terminée avec succès !"
    echo ""
    print_status "Vous pouvez maintenant :"
    echo "1. Lancer l'application : npm run dev"
    echo "2. Tester le formulaire de signalement"
    echo "3. Utiliser les comptes de test :"
    echo "   - Admin: admin@kinshasa-alerte.rdc"
    echo "   - Bourgmestre: bourgmestre.gombe@kinshasa-alerte.rdc"
else
    print_error "Problème avec la configuration finale"
    exit 1
fi

echo ""
print_success "🎉 Configuration terminée !" 