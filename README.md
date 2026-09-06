<p align="center">
  <img src="./public/logo.png" lt="Logo" width="65" />
<p>

# VueTemplate

![Landing](public/previews/landing.webp)

> Vue + Typescript + Tailwind + Tauri Template

- 🚀 PWA
- ✋ Push Notification
- 🌙 Light/Dark Mode
- 🐋 Containerized
- 🪄 CI/CD (Github Action)
- 📐 Analytics

# Todo

- [ ] Add Testing

## External Dependencies

- gitleaks

## Clone Template

Clone the template

```bash
bunx giget@latest gh:shba007/vuetemplate#<branch> <project>
```

## Change Placeholder Value

### In package.json change the following

- name
- description
- docker:build
- docker:start

### In index.html

<title>Vuetemplate</title>

### In tailwind.config.ts change the following

- fontFamily
  - head
  - body
- colors
  - light
  - dark
  - primary
  - success
  - warning
  - alert

### In src-tauri/Cargo.toml change the following

- name
- description
- repository

### In src-tauri/tauri.conf.json change the following

- productName
- identifier
- app
  - windows
    - title

### In .github\workflows\deploy.yml change the following

- asset_name [deploy.yml](.github/workflows/deploy.yml) in line 271

### In github registry add Repo or Org Vars following

- Vars
  - USERNAME
  - GH_PAT
  - `TAURI_SIGNING_PRIVATE_KEY`: Content of `./src-tauri/app-sign.key`
  - `TAURI_SIGNING_PRIVATE_KEY_PASSWORD`: Key password (leave empty if none)

## Change the Icons and Screenshots

dir public/pwa

## Generate Logo

bun tauri icon ./public/logo.svg

## Reinitialize Android

rm -rf src-tauri/gen/android
bun tauri android init

## Appstore Signing Config

cd src-tauri/gen/android

keytool -genkey -v -keystore release-keystore.jks -keyalg RSA -keysize 2048 -validity 10000 -alias release-key

cat ./release-keystore.jks | base64

goto src-tauri/gen/android/app/build.gradle.kts

```kotlin
import java.io.FileInputStream

defaultConfig {
...
}
signingConfigs {
    create("release") {
        val keystorePropertiesFile = rootProject.file("keystore.properties")
        val keystoreProperties = Properties()
        if (keystorePropertiesFile.exists()) {
            keystoreProperties.load(FileInputStream(keystorePropertiesFile))
        }

        keyAlias = keystoreProperties["keyAlias"] as String
        keyPassword = keystoreProperties["password"] as String
        storeFile = file(keystoreProperties["storeFile"] as String)
        storePassword = keystoreProperties["password"] as String
    }
}

getByName("release") {
    isMinifyEnabled = true
    signingConfig = signingConfigs.getByName("release")
...
}
```

put release-keystore.jks, keystore.properties into src-tauri/gen/android

### Desktop Updater Signing Config

**1. Generate Keypair**

```bash
bun x tauri signer generate -w ./src-tauri/app-sign.key

```

**2. Configure `src-tauri/tauri.conf.json`**

```json
{
  "bundle": {
    "createUpdaterArtifacts": true
  },
  "plugins": {
    "updater": {
      "pubkey": "YOUR_PUBLIC_KEY_HERE",
      "endpoints": ["https://github.com/<OWNER>/<REPO>/releases/latest/download/latest.json"]
    }
  }
}
```

## License

Published under the [MIT](https://github.com/shba007/vuetemplate/blob/main/LICENSE) license.
<br><br>
<a href="https://github.com/shba007/vuetemplate/graphs/contributors">
<img src="https://contrib.rocks/image?repo=shba007/vuetemplate" />
</a>