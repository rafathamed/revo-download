# REVO Download 1.0.15

This release fixes video resolution failures on Windows when a user profile, temporary folder, or PATH entry contains a junction that Windows blocks as an untrusted mount point.

## Windows path compatibility

- Prevents the per-user Inno Setup process from passing RedirectionGuard to the REVO process launched at the end of installation. The installer writes only inside the current user's LocalAppData and HKCU.
- Runs yt-dlp with a private temporary working folder under the local per-user cache, avoiding roaming/system temporary paths that may be redirected.
- Filters only PATH entries for which Windows explicitly returns WinError 448, while preserving the remaining PATH order and prepending the bundled tools folder.
- Adds regression coverage to ensure a blocked PATH junction cannot abort video-link discovery.

## Validation

The release workflow runs the Rust engine suite, browser-extension simulations, dependency advisory checks, FFmpeg fixtures, and the Windows installer build before publishing.
