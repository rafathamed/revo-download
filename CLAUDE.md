# Claude handoff — REVO Download

This repository is the source of truth for REVO Download. Work from the latest `main` branch; do not use an older ZIP or copy files from a previous release.

## Current source state
- Product version is defined in the workspace `Cargo.toml` (currently 1.0.12).
- Windows packaging and release automation: `.github/workflows/build.yml`.
- Rust self-update implementation: `crates/engine/src/selfupdate.rs`.
- Installer definition: `installer/revo.iss`.
- The latest workflow fix ensures an existing empty GitHub Release is populated with assets rather than skipped.
- Build/release workflow: https://github.com/rafathamed/revo-download/actions
- Releases: https://github.com/rafathamed/revo-download/releases

## Build and release contract
1. Preserve the current CI workflow and its pinned GitHub Actions dependencies.
2. A push to `main` builds and stores workflow artifacts. A commit message containing `[release]` triggers release publishing.
3. The Windows job runs the extension tests, Rust engine tests, `cargo audit`, builds the release executable, packages the Inno Setup installer, and generates `dist/version.json`.
4. The release must contain at least:
   - `REVO-Download-Setup.exe`
   - `version.json`
   - `ffmpeg.exe`
5. The update manifest must point to the exact installer asset URL and contain its SHA-256 and valid Ed25519 signature.
6. Do not publish a release unless all build and test jobs succeed. After publishing, verify the release assets and download the manifest to confirm it is valid.

## Update signing and secrets
- The application embeds the Ed25519 **public verification key** in `crates/engine/src/selfupdate.rs`. This public key must remain paired with the existing private signing key.
- The matching private signing seed is a secret. It must never be committed, added to a ZIP, printed in logs, pasted into Claude, or included in project files.
- GitHub Actions expects the private seed as repository secret `UPDATE_SIGNING_KEY` (64 hexadecimal characters). Configure it directly in GitHub: Repository → Settings → Secrets and variables → Actions.
- If that secret is missing, the release job intentionally fails rather than publishing an update that installed clients cannot verify.
- Optional Firefox signing credentials are `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`. They are optional for the Windows installer/update.
- Never generate a replacement signing key casually: that would break update verification for already-installed clients. Any key rotation requires a deliberate migration plan and a compatible client update.
- Do not put any real secret values in `.env`, `.env.example`, source files, documentation, commits, or Claude context.

## Rules for changes
- Keep backward compatibility with installed versions and their updater.
- Do not change the public verification key, manifest schema, installer filename, release tag convention (`v<version>`), or download URLs without explaining the migration impact.
- Keep the version in `Cargo.toml` consistent with the tag and manifest.
- Update tests when behavior changes. Run the same tests used by CI.
- Treat downloaded executables and third-party tools as untrusted until their published hashes are verified.
- Do not remove signature verification, SHA-256 checks, or update rollback protections to make a build pass.
- Do not claim that an update is available until the GitHub Release exists and has the required assets, and the manifest signature verifies against the embedded public key.

## Working in Claude
Open this GitHub repository in Claude Code / Claude's GitHub-connected workspace:
https://github.com/rafathamed/revo-download

At the start of a task, inspect the latest `main` commit and this file. Make changes on a feature branch or pull request, review the diff, run tests, and only then merge/publish. Keep signing secrets in GitHub Actions secrets, not in Claude.
