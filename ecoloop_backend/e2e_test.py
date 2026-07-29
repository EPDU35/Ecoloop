import requests
import json
import uuid
import os
import time

BASE_URL = "http://localhost:8000/api/v1"
AI_BASE_URL = "http://localhost:8001/api/v1"

def print_section(title):
    print(f"\n{'='*50}\n{title}\n{'='*50}")

def register_user(session, name, email, role, phone):
    print(f"Registering {role}...")
    payload = {
        "full_name": name,
        "email": email,
        "phone": phone,
        "password": "Password123!",
        "role": role
    }
    resp = session.post(f"{BASE_URL}/auth/register", json=payload)
    if resp.status_code == 201:
        print(f"SUCCESS: {role} registered successfully.")
    elif resp.status_code == 400 and "already exists" in resp.text:
        print(f"WARNING: {role} already exists.")
    else:
        print(f"ERROR: {role} registration failed: {resp.status_code} - {resp.text}")
    return resp

def login_user(session, email):
    print(f"Logging in {email}...")
    payload = {
        "email": email,
        "password": "Password123!"
    }
    resp = session.post(f"{BASE_URL}/auth/login", json=payload)
    if resp.status_code == 200:
        data = resp.json()
        token = data.get("access_token")
        print(f"SUCCESS: Logged in successfully.")
        return token
    else:
        print(f"ERROR: Login failed: {resp.status_code} - {resp.text}")
        return None

def main():
    print_section("STARTING END-TO-END TEST")
    session = requests.Session()
    
    users = [
        {"name": "E2E Producteur", "email": f"prod_{uuid.uuid4().hex[:6]}@test.com", "role": "PRODUCTEUR"},
        {"name": "E2E Collecteur", "email": f"coll_{uuid.uuid4().hex[:6]}@test.com", "role": "COLLECTEUR"},
        {"name": "E2E Industriel", "email": f"ind_{uuid.uuid4().hex[:6]}@test.com", "role": "INDUSTRIEL"},
        {"name": "E2E Mairie", "email": f"mair_{uuid.uuid4().hex[:6]}@test.com", "role": "MAIRIE"},
    ]
    
    tokens = {}
    
    import random
    import sqlite3
    
    # 1. Register & Login
    print_section("1. AUTHENTICATION FLOW")
    for u in users:
        phone = f"+225{random.randint(10000000, 99999999)}"
        register_user(session, u["name"], u["email"], u["role"], phone)
        
        token = login_user(session, u["email"])
        if token:
            tokens[u["role"]] = token
            
    prod_token = tokens.get("PRODUCTEUR")
    coll_token = tokens.get("COLLECTEUR")
    
    # 2. Test AI Direct Endpoint
    print_section("2. TESTING AI MODEL DIRECTLY (YOLO)")
    if prod_token:
        # Use one of the user uploaded images
        image_path = r"C:\Users\CHRIST\.gemini\antigravity\brain\939785dd-2f5a-49ce-8e70-6e8eb632585a\.user_uploaded\media__1785204127785.jpg"
        if os.path.exists(image_path):
            headers = {"Authorization": f"Bearer {prod_token}"}
            with open(image_path, "rb") as f:
                files = {"file": ("test.jpg", f, "image/jpeg")}
                print(f"Uploading {image_path} to AI classify endpoint...")
                # Call via the backend proxy
                resp = session.post(f"{BASE_URL}/ai/classify", headers=headers, files=files)
                if resp.status_code == 200:
                    print("SUCCESS: AI Classification successful:")
                    print(json.dumps(resp.json(), indent=2))
                else:
                    print(f"ERROR: AI Classification failed: {resp.status_code} - {resp.text}")
        else:
            print(f"ERROR: Image not found at {image_path}")

    # 3. Create Waste Lot
    print_section("3. PRODUCER FLOW (CREATE WASTE LOT)")
    lot_id = None
    if prod_token:
        headers = {"Authorization": f"Bearer {prod_token}"}
        payload = {
            "title": "Bouteilles plastiques E2E",
            "description": "Lot de test créé automatiquement.",
            "category": "PLASTIQUE",
            "weight_kg": 15.5,
            "latitude": 5.30966,
            "longitude": -4.01266,
            "address": "Plateau, Abidjan",
            "notes": "Test automatisé",
            "status": "PENDING"
        }
        resp = session.post(f"{BASE_URL}/wastes", headers=headers, json=payload)
        if resp.status_code == 201:
            lot = resp.json()
            lot_id = lot.get("id")
            print(f"SUCCESS: Waste lot created successfully! ID: {lot_id}")
        else:
            print(f"ERROR: Failed to create lot: {resp.status_code} - {resp.text}")

    # 4. Collector Flow
    print_section("4. COLLECTOR FLOW (FIND WASTES)")
    if coll_token:
        headers = {"Authorization": f"Bearer {coll_token}"}
        resp = session.get(f"{BASE_URL}/available-wastes", headers=headers)
        if resp.status_code == 200:
            lots = resp.json()
            print(f"SUCCESS: Found {len(lots)} available lots.")
            # Verify our lot is in the list
            if lot_id and any(l.get("id") == lot_id for l in lots):
                print("SUCCESS: Newly created lot is visible to collector!")
            else:
                print("WARNING: Newly created lot is NOT visible to collector.")
        else:
            print(f"ERROR: Failed to get available lots: {resp.status_code} - {resp.text}")

    print_section("END OF TESTS")

if __name__ == "__main__":
    main()
