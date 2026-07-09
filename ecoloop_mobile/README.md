# EcoLoop - Application Mobile

Application mobile Flutter pour la plateforme EcoLoop de gestion intelligente des déchets.

## Stack

- **Flutter** 3.0+ (Dart)
- **Provider** pour la gestion d'état
- **flutter_map** + OpenStreetMap pour la cartographie
- **Lottie** pour les animations
- **Firebase Cloud Messaging** pour les notifications push

## Fonctionnalités

### Producteur
- Publier des lots de déchets
- Suivre les collectes en temps réel
- Scanner de codes-barres
- Historique et statistiques
- Programme de récompenses

### Collecteur
- Voir les lots disponibles sur la carte
- Accepter des collectes
- Valider avec OTP
- Gérer les tournées
- Suivi GPS en temps réel

### Communes
- Tableaux de bord municipaux
- Statistiques de recyclage
- Rapports de performance

## Démarrage

```bash
flutter pub get
flutter run              # Lance sur device/émulateur
flutter run -d chrome    # Version web
flutter build apk        # Build Android
flutter build ios        # Build iOS
```

## Configuration

L'URL de l'API est configurée dans `lib/core/api_service.dart` :

```dart
baseUrl: 'http://localhost:8000'   # Dev
# En production, utiliser l'URL HTTPS du backend déployé
```

## Structure

```
lib/
├── auth/           # Authentification (login, register, OTP)
├── producer/       # Fonctionnalités producteur
├── collector/      # Fonctionnalités collecteur
├── shared/         # Écrans partagés (notifications, wallet, etc.)
├── core/           # Services (API, localisation, push, etc.)
├── models/         # Modèles de données
├── widgets/        # Widgets réutilisables
├── theme/          # Thème sombre
└── main.dart       # Point d'entrée
```

## Plateformes supportées

- Android
- iOS
- Web (Flutter Web)
- Windows
- macOS
- Linux
