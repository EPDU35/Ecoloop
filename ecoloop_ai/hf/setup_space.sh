#!/bin/bash
# =============================================================================
# EcoLoop AI - Déploiement sur Hugging Face Spaces (gratuit)
# =============================================================================
# Utilisation :
#   1. Créer un Space sur https://huggingface.co/new-space
#      - Name: ecoloop-ai
#      - License: MIT
#      - Space SDK: Docker
#   2. Cloner le Space :
#        git clone https://huggingface.co/spaces/<USER>/ecoloop-ai
#   3. Copier les fichiers depuis ce dossier :
#        cp -r ecoloop_ai/* <ESPACE>/
#        cp ecoloop_ai/hf/README.md <ESPACE>/
#   4. Pousser :
#        cd <ESPACE>
#        git add . && git commit -m "Initial deploy" && git push
# =============================================================================

set -e

echo "==> Configuration du Space Hugging Face..."
echo ""
echo "Porte d'entree:  http://127.0.0.1:7860"
echo "Etape 1: Cree un Space Docker sur https://huggingface.co/new-space"
echo "Etape 2: git clone https://huggingface.co/spaces/<VOTRE_USER>/ecoloop-ai"
echo "Etape 3: Copie les fichiers:"
echo "   cp -r ../* ./"
echo "   cp ../hf/README.md ./"
echo "Etape 4: git add . && git commit -m \"Deploy EcoLoop AI\" && git push"
echo ""
echo "Le port 7860 est automatiquement configure par Hugging Face Spaces."
echo "Les modeles ML charges au demarrage peuvent prendre 30-60s."
