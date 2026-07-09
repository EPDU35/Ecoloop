"""
Onboarding Cloudinary — Test d'intégration EcoLoop
"""
import cloudinary
import cloudinary.uploader
import cloudinary.api

CLOUD_NAME = "kqtgcqr5"
API_KEY = "938672558499711"
API_SECRET = "9exCT0grGj8Yuu1XUtlUdaoRRhU"

cloudinary.config(
    cloud_name=CLOUD_NAME,
    api_key=API_KEY,
    api_secret=API_SECRET,
    secure=True,
)

SAMPLE_URL = "https://res.cloudinary.com/demo/image/upload/v1/sample.jpg"

print("1. Upload de l'image...")
upload = cloudinary.uploader.upload(SAMPLE_URL, folder="ecoloop_test")
public_id = upload["public_id"]
secure_url = upload["secure_url"]
print(f"   Public ID : {public_id}")
print(f"   Secure URL: {secure_url}")

print("\n2. Metadata de l'image uploadée :")
print(f"   Largeur : {upload['width']} px")
print(f"   Hauteur : {upload['height']} px")
print(f"   Format  : {upload['format']}")
print(f"   Taille  : {upload['bytes']} bytes")

print("\n3. Generation URL transformee (f_auto + q_auto)...")
# f_auto: Cloudinary choisit le meilleur format (WebP, AVIF...) selon le navigateur
# q_auto: qualite optimisee automatiquement pour reduire le poids sans perte visible
base = f"https://res.cloudinary.com/{CLOUD_NAME}/image/upload"
transformed = f"{base}/f_auto,q_auto/{public_id}"
print(f"   URL transformee : {transformed}")

print("\nDone! Clique sur le lien ci-dessus pour voir la version optimisee.")
print("   Compare la taille et le format par rapport a l'originale.")
