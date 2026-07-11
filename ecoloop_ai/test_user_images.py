import os
import sys
import json
from pprint import pprint

# Ajouter ecoloop_ai au PYTHON_PATH
sys.path.insert(0, os.path.abspath(os.path.dirname(__file__)))

from models.waste_classifier.model import WasteClassifier
from api.routes.classify_routes import set_classifier, _analyze_bytes

def test_images():
    print("Initialisation du modèle YOLO (patientez)...")
    classifier = WasteClassifier()
    set_classifier(classifier)
    print("Modèle prêt.\n")

    img_dir = r"C:\Users\CHRIST\Downloads\38833FF26BA1D.UnigramPreview_g9c9v27vpyspw!App"
    
    for filename in os.listdir(img_dir):
        if not filename.endswith(".jpeg") and not filename.endswith(".jpg") and not filename.endswith(".png"):
            continue
            
        filepath = os.path.join(img_dir, filename)
        print(f"--- Analyse de {filename} ---")
        
        with open(filepath, "rb") as f:
            contents = f.read()
            
        # Appel de notre route backend (exactement ce que fera l'API)
        result = _analyze_bytes(contents, filename, len(contents))
        
        # Affichage formaté des résultats qui intéressent l'utilisateur
        print(f"✅ Type Dominant: {result.type_dominant.upper()} (Qualité: {result.score_qualite}/100)")
        print(f"📦 Quantité Totale: {result.total_items} objets détectés")
        
        # Les nouvelles fonctionnalités F2
        print(f"⚖️  Poids estimé: {result.poids_estime_kg} kg")
        print(f"🧊 Volume estimé: {result.volume_estime_m3} m³")
        print(f"💰 Valeur estimée (FCFA): {result.valeur_estimee_fcfa} FCFA")
        
        print("🔍 Détails des déchets:")
        for item in result.items_trouves:
            print(f"   - {item.type} (Précision: {item.confidence*100:.1f}%)")
        print("\n")

if __name__ == "__main__":
    test_images()
