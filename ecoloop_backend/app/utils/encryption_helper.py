import hashlib
import os
from cryptography.fernet import Fernet

# Use secret key from settings or a default key for testing
SECRET_KEY = os.environ.get("SECRET_KEY", "ecoloopsupersafekeyforlocaldevelopment123=")
if len(SECRET_KEY) < 32:
    SECRET_KEY = SECRET_KEY.ljust(32, "=")[:32]

# Ensure we have a valid Fernet key (must be base64-encoded 32 bytes)
import base64
FERNET_KEY = base64.urlsafe_b64encode(SECRET_KEY.encode()[:32])
cipher = Fernet(FERNET_KEY)


def encrypt_data(text: str) -> str:
    """Encrypt text using versioned AES (Fernet)."""
    if not text:
        return ""
    encrypted_bytes = cipher.encrypt(text.encode())
    return encrypted_bytes.decode()


def decrypt_data(token: str) -> str:
    """Decrypt text using versioned AES (Fernet)."""
    if not token:
        return ""
    decrypted_bytes = cipher.decrypt(token.encode())
    return decrypted_bytes.decode()


def generate_search_hash(text: str) -> str:
    """Generate SHA-256 hash for secure indexing/lookups."""
    if not text:
        return ""
    # Standardize string format (e.g. remove spaces, strip whitespace)
    clean_text = text.strip().replace(" ", "").replace("-", "")
    return hashlib.sha256(clean_text.encode()).hexdigest()
