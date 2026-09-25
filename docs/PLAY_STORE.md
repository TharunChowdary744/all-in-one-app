# Releasing OmniKit to Google Play

The workflow `.github/workflows/android-release.yml` builds a signed Android App Bundle on
[EAS Build](https://docs.expo.dev/build/introduction/) and submits it to Google Play with
[EAS Submit](https://docs.expo.dev/submit/android/). It runs:

- on every push to `main` that changes `apps/mobile/**`, `packages/core/**` or `package-lock.json`
- on tags matching `mobile-v*` (for example `git tag mobile-v1.1.0 && git push --tags`)
- manually: **Actions → Release Android app to Google Play → Run workflow**

Until the two secrets below exist, the workflow skips itself with a warning instead of failing.

## One-time setup

Google requires a few steps that only the account owner can do. You only do this once.

### 1. Expo account and token
1. Create a free account at <https://expo.dev/signup>.
2. Link the project from your machine and commit the result:
   ```bash
   cd apps/mobile
   npx eas-cli@latest login
   npx eas-cli@latest init        # writes extra.eas.projectId into app.json
   git commit -am "Link EAS project" && git push
   ```
   (CI will also run `eas init` if the id is missing, but committing it keeps every build tied to the same project.)
3. Create an access token at **expo.dev → Account settings → Access tokens**.
4. Add it to GitHub: **repo → Settings → Secrets and variables → Actions → New repository secret**,
   name `EXPO_TOKEN`.

### 2. Google Play Console app
1. Register a developer account at <https://play.google.com/console> (one-time US$25 fee plus identity verification).
2. **Create app**: name `OmniKit`, type *App*, *Free*.
3. Fill in **App content**: privacy policy URL
   `https://tharunchowdary744.github.io/all-in-one-app/privacy.html`, ads (*No*), data safety
   (*no data collected or shared*), content rating questionnaire, target audience.
4. Fill in the **Store listing**: short/full description, 512×512 icon (`apps/mobile/assets/images/icon.png`
   scaled down), a 1024×500 feature graphic, and at least 2 phone screenshots.

### 3. First build (manual upload, required by Google)
Google Play only accepts API uploads after the first bundle for a new app has been uploaded by hand.
```bash
cd apps/mobile
npx eas-cli@latest build --platform android --profile production
```
EAS generates and stores the upload keystore for you. Download the `.aab` from the build page and upload it in
**Play Console → Testing → Internal testing → Create new release**.

### 4. Service account for automatic submissions
1. In [Google Cloud Console](https://console.cloud.google.com/), create (or pick) a project and enable the
   **Google Play Android Developer API**.
2. **IAM & Admin → Service accounts → Create service account**, then **Keys → Add key → JSON** and download it.
3. In **Play Console → Users and permissions → Invite new user**, invite the service account's email and grant
   *Release apps to testing tracks* and *Release to production* (at least for OmniKit).
4. Add the whole JSON file contents as a GitHub secret named `GOOGLE_SERVICE_ACCOUNT_JSON`.

From now on every qualifying push builds a new version (the `versionCode` is auto-incremented by EAS) and
publishes it to the **internal** testing track.

## Going to production

Releases go to the `internal` track by default so you can test on real devices first. To publish straight to
the Play Store, change `apps/mobile/eas.json`:

```json
"submit": {
  "production": {
    "android": { "track": "production", "releaseStatus": "completed" }
  }
}
```

If Play Console still shows the app as a **draft** (not yet reviewed), submissions must use
`"releaseStatus": "draft"` until the first review is approved.

Bump the user-facing version by changing `expo.version` in `apps/mobile/app.json`.
