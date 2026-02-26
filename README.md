# 🎮 Mots Secrets — React Native (Expo)

## 📁 Structure du projet

```
MotsSecrets/
├── App.js                        ← Point d'entrée
├── app.json                      ← Config Expo
├── package.json
├── babel.config.js
├── assets/
│   ├── fonts/
│   │   ├── BebasNeue-Regular.ttf  ← À télécharger
│   │   └── SpaceMono-Regular.ttf  ← À télécharger
│   ├── icon.png                   ← Icône app (1024x1024)
│   ├── splash.png                 ← Écran de chargement
│   └── adaptive-icon.png          ← Icône Android
└── src/
    ├── theme.js
    ├── gameLogic.js
    ├── data/
    │   └── words.js
    └── screens/
        ├── MenuScreen.js
        ├── PrepScreen.js
        ├── RevealScreen.js
        ├── BlackScreen.js
        └── ResultScreen.js
```

---

## 🚀 Installation étape par étape

### 1. Installe Node.js
→ https://nodejs.org (prends la version LTS)

### 2. Installe Expo CLI
```bash
npm install -g expo-cli eas-cli
```

### 3. Installe les dépendances du projet
```bash
cd MotsSecrets
npm install
```

### 4. Télécharge les polices
- **Bebas Neue** → https://fonts.google.com/specimen/Bebas+Neue
  → Renomme en `BebasNeue-Regular.ttf` → mets dans `assets/fonts/`
- **Space Mono** → https://fonts.google.com/specimen/Space+Mono
  → Renomme en `SpaceMono-Regular.ttf` → mets dans `assets/fonts/`

### 5. Lance l'app pour tester
```bash
npx expo start
```
→ Scanne le QR code avec l'app **Expo Go** sur ton téléphone

---

## 📱 Créer les fichiers de l'app (.apk / .ipa)

### 1. Crée un compte Expo
→ https://expo.dev

### 2. Connecte-toi
```bash
eas login
```

### 3. Configure le build
```bash
eas build:configure
```

### 4. Build Android (.apk)
```bash
eas build --platform android
```

### 5. Build iOS (.ipa)
```bash
eas build --platform ios
```
*(nécessite un compte Apple Developer à 99$/an)*

---

## 💰 Configurer AdMob (pubs)

### 1. Crée un compte
→ https://admob.google.com

### 2. Ajoute une app → obtiens :
- **App ID** (format : `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX`)
- **Ad Unit ID interstitiel** (format : `ca-app-pub-XXXXXXXXXXXXXXXX/XXXXXXXXXX`)

### 3. Mets à jour `app.json`
Remplace les deux `ca-app-pub-XXXXXXXXXXXXXXXX~XXXXXXXXXX` par tes vrais App IDs Android et iOS.

### 4. Mets à jour `ResultScreen.js`
Remplace `REMPLACE_PAR_TON_AD_UNIT_ID` par ton vrai Ad Unit ID.

---

## 🏪 Publier sur les stores

### Google Play (Android)
1. Compte développeur : https://play.google.com/console → **25$ une fois**
2. Crée une app → Upload ton `.apk` ou `.aab`
3. Remplis les infos (description, captures d'écran)
4. Soumets pour review (~3 jours)

### Apple App Store (iOS)
1. Compte développeur : https://developer.apple.com → **99$/an**
2. Crée une app sur App Store Connect
3. Upload avec Transporter ou EAS Submit
4. Soumets pour review (~1-2 jours)

### Soumission automatique avec EAS
```bash
eas submit --platform android
eas submit --platform ios
```
