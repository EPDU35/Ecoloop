import os
import json
from models.waste_classifier.model import WasteClassifier

img_dir = r"C:\Users\CHRIST\Desktop\ANTIGRAVITY\IMAGE"
print("🧠 Chargement de ton modèle (ecoloop_yolo.pt)...")
classifier = WasteClassifier()

results = {}

print("\n🚀 Début de l'analyse en masse...")
for filename in os.listdir(img_dir):
    if filename.lower().endswith(('.png', '.jpg', '.jpeg', '.webp')):
        filepath = os.path.join(img_dir, filename)
        print(f"  -> Analyse de {filename}...")
        try:
            res = classifier.predict(filepath)
            results[filename] = {
                "total_items": res.get("total_items"),
                "type_dominant": res.get("type_dominant"),
                "resume_quantite": res.get("resume_quantite")
            }
        except Exception as e:
            results[filename] = {"error": str(e)}

print("\n🎯 --- RÉSULTATS DE L'ANALYSE --- 🎯")
print(json.dumps(results, indent=2, ensure_ascii=False))
