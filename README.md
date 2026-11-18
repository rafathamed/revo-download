# REVO Download

**Professional Download Manager for Windows 10 and Windows 11 (64-bit)**

Developed and maintained by **RAFAT HAMED**.

REVO Download is a download manager with a Rust download engine and
browser integration for Chrome, Edge, Brave and Firefox.

## Features

- Segmented downloads using up to 32 simultaneous connections where the server allows it.
- Pause and resume, including after closing or restarting Windows.
- Browser integration for Chrome, Edge, Brave and Firefox (Firefox signing is required for normal distribution).
- Video and audio downloads with quality selection, playlists and FFmpeg merging.
- Expanded browser media discovery for direct and extensionless media responses, HLS/M3U8, DASH/MPD, and dynamically assigned video sources.
- Queue management, scheduling, speed limits and automatic file categorization.
- Page link grabber, batch links, import/export lists and torrent support.
- Arabic and English interface plus the other languages inherited from the upstream project.

See [RELEASE-1.0.13.md](RELEASE-1.0.13.md) for the latest browser media-capture changes.

## Technology

- Rust workspace: `crates/engine`, `crates/app`, `crates/host`
- Slint desktop UI
- JavaScript browser extension
- Inno Setup installer

## Build on Windows

1. Install Git and ensure `winget` is available.
2. Extract this folder to a short writable path such as `C:\REVO-Download`.
3. Double-click `BUILD.bat`.
4. The installer is produced at `dist\REVO-Download-Setup.exe`.

The first build downloads Rust build tools and helper dependencies. A Windows
64-bit environment is required to produce the Windows installer.

## Release and automatic updates

The update endpoint is configured for `rafathamed/revo-download`. Create that
GitHub repository and push this source tree before publishing releases. The
GitHub Actions workflow uses these repository secrets:

- `UPDATE_SIGNING_KEY`: the 64-character Ed25519 private seed supplied
  separately with this handoff. Keep it secret and never commit it.
- `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`: Mozilla Add-ons signing credentials
  for signed Firefox releases (optional for local builds, required by the
  current release workflow when publishing a release).

The public update key is embedded in `crates/engine/src/selfupdate.rs`. The
private seed is not included in this source archive. Until the REVO GitHub
repository and its release secrets are configured, in-app self-updates and
Firefox add-on auto-update distribution are not yet operational.

## User data isolation

REVO stores its settings and download database under
`%APPDATA%\RafatHamed\REVO Download\data`.

## Saved credentials

Saved site/proxy passwords and cookies are encrypted with the Windows user's
own key (DPAPI), so only the same Windows user on the same computer can read
them.

## License

See `LICENSE` and `THIRD-PARTY-NOTICES.txt`. Third-party software remains
under its respective licenses.
