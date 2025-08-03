# Firebase Setup Instructions

## Current Configuration Status

✅ Firebase config file created: `config/firebaseConfig.js`
⚠️ **Authentication may not be enabled in Firebase console**

## Required Firebase Console Setup

### 1. Go to Firebase Console

Visit: https://console.firebase.google.com/project/alpha-boost-52c36

### 2. Enable Authentication

1. Click on "Authentication" in the left sidebar
2. Click "Get started" if not already enabled
3. Go to "Sign-in method" tab
4. Enable "Email/Password" provider:
   - Click on "Email/Password"
   - Toggle "Enable" to ON
   - Click "Save"

### 3. Verify Project Settings

Go to Project Settings (gear icon) and verify:

- Project ID: `alpha-boost-52c36`
- Web API Key: Should match the apiKey in your config

### 4. Add Android App (if not done)

1. Click "Add app" → Android
2. Android package name: `com.anonymous.alphaboost`
3. Download `google-services.json` and place in `android/app/`

## Common Error Solutions

### "auth/configuration-error" or "configuration not found"

- Ensure Authentication is enabled in Firebase console
- Verify all config values match your Firebase project
- Check that the project ID exists and is correct

### "auth/api-key-not-valid"

- Regenerate API key in Firebase console
- Update the apiKey in firebaseConfig.js

### "auth/unauthorized-domain"

- Add your domain to authorized domains in Authentication settings

## Testing Authentication

After setup, you can test by:

1. Creating a test user in Firebase console
2. Using the login screen in your app
3. Checking console logs for authentication state changes

## Current Config Values

```javascript
projectId: "alpha-boost-52c36";
authDomain: "alpha-boost-52c36.firebaseapp.com";
apiKey: "AIzaSyACwHjpbb3y_Ii3485BAxWym7gr5-MW0PU";
```

Make sure these match your Firebase project exactly!
