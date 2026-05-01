"""
AES-256 encryption utility for stored packet data.
Uses PyCryptodome (pycryptodome package).
"""
import os
import base64
import hashlib
from Crypto.Cipher import AES
from Crypto.Util.Padding import pad, unpad

SECRET_KEY = os.getenv("AES_SECRET_KEY", "NetWatch@SecureK3y!2024XYZ")

def _derive_key(secret: str) -> bytes:
    """Derive a 32-byte AES key from a passphrase using SHA-256."""
    return hashlib.sha256(secret.encode()).digest()


def encrypt(plaintext: str) -> str:
    """Encrypt a string using AES-CBC. Returns base64-encoded iv:ciphertext."""
    key = _derive_key(SECRET_KEY)
    iv = os.urandom(16)
    cipher = AES.new(key, AES.MODE_CBC, iv)
    ct = cipher.encrypt(pad(plaintext.encode(), AES.block_size))
    encoded = base64.b64encode(iv + ct).decode()
    return encoded


def decrypt(encoded: str) -> str:
    """Decrypt a base64-encoded AES-CBC string."""
    key = _derive_key(SECRET_KEY)
    raw = base64.b64decode(encoded)
    iv, ct = raw[:16], raw[16:]
    cipher = AES.new(key, AES.MODE_CBC, iv)
    plaintext = unpad(cipher.decrypt(ct), AES.block_size)
    return plaintext.decode()
