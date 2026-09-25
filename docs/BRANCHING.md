# Branches, environments and releases

```
feature/*  ──PR──▶  develop  ──PR──▶  test  ──PR──▶  prod
                       │               │              │
                       ▼               ▼              ▼
                  develop URL       test URL      prod URL
                                  Play internal  Play production
```

| Branch | Web URL | Android (when the mobile app changed) |
| --- | --- | --- |
| `develop` | https://tharunchowdary744.github.io/all-in-one-app/develop/ | none |
| `test` | https://tharunchowdary744.github.io/all-in-one-app/test/ | Google Play **internal** testing track |
| `prod` | https://tharunchowdary744.github.io/all-in-one-app/ | Google Play **production** track |

The develop and test builds show a dashed `DEVELOP` / `TEST` badge in the top bar so they can't be confused with production.

## How it works

| Workflow | Trigger | What it does |
| --- | --- | --- |
| `ci.yml` | every PR into `develop`, `test` or `prod`; pushes to `develop` | unit tests, typecheck, web build |
| `promotion.yml` | PRs into `test` / `prod` | fails unless `test` ← `develop` and `prod` ← `test` |
| `deploy-web.yml` | push (= merged PR) to `develop`, `test` or `prod` | builds the web app for that environment and publishes it to its folder on GitHub Pages, leaving the other two untouched |
| `android-release.yml` | push to `test` or `prod` touching `apps/mobile`, `packages/core` or the lockfile | EAS build + submit to the matching Play track (needs the secrets from [PLAY_STORE.md](PLAY_STORE.md)) |

Each deploy run appears under **Code → Deployments** with a link to its environment.

## Day-to-day flow

1. Branch from `develop`: `git switch develop && git pull && git switch -c feature/my-change`.
2. Open a PR into `develop`. CI must pass. Merging deploys to the **develop** URL.
3. When develop is ready, open a PR **`develop` → `test`**. Merging deploys to the **test** URL (and Play internal testing).
4. After QA on test, open a PR **`test` → `prod`**. Merging deploys to **production** (and the Play production track).

Hotfix: branch from `develop`, then promote through test and prod as usual. The promotion check rejects shortcuts on purpose.

## One-time repository settings (admin only)

Workflows can't change repository settings, so these need an admin in the GitHub UI:

1. **Default branch**: *Settings → General → Default branch* → `develop`.
2. **Rulesets**: *Settings → Rules → Rulesets → New branch ruleset*:
   - Target branches `develop`, `test`, `prod`: *Require a pull request before merging*, *Block force pushes*,
     *Restrict deletions*, and *Require status checks to pass* → `CI / check`.
   - Target branches `test` and `prod`: additionally require the status check `Promotion flow / source-branch`.
3. **Optional production approval**: *Settings → Environments → prod → Required reviewers*. Deploys to prod then wait
   for approval. Do the same for `play-production` to gate Play Store releases.
4. **Pages** is already enabled (source: `gh-pages` branch, root). Leave it as is.
