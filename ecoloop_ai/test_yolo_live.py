import urllib.request
import json
from models.waste_classifier.model import WasteClassifier

print("🌍 Téléchargement d'une image test...")
url = "https://raw.githubusercontent.com/ultralytics/yolov5/master/data/images/bus.jpg"
req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})

with urllib.request.urlopen(req) as response, open('test_bus.jpg', 'wb') as out_file:
    out_file.write(response.read())

print("🧠 Chargement de ton modèle (ecoloop_yolo.pt)...")
classifier = WasteClassifier()

print("🔍 L'IA analyse l'image en ce moment...")
result = classifier.predict('test_bus.jpg')

print("\n🎯 --- RÉSULTAT DE TON IA --- 🎯")
print(json.dumps(result, indent=2, ensure_ascii=False))
