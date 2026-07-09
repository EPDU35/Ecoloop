# Utiliser une image Python officielle légère
FROM python:3.12-slim

# Définir le répertoire de travail dans le conteneur
WORKDIR /app

# Définir les variables d'environnement
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PYTHONIOENCODING=utf-8

# Installer les dépendances système nécessaires pour TensorFlow, Prophet et OpenCV/Pillow
RUN apt-get update && apt-get install -y \
    build-essential \
    curl \
    software-properties-common \
    libgl1-mesa-glx \
    libglib2.0-0 \
    && rm -rf /var/lib/apt/lists/*

# Copier le fichier des dépendances
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt

# Copier le reste du code source
COPY . .

# Exposer le port de l'API
EXPOSE 8000

# Commande pour démarrer le serveur
CMD ["uvicorn", "api.ai_server:app", "--host", "0.0.0.0", "--port", "8000"]
