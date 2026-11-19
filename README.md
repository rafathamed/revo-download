# REVO Download

**Professional Download Manager for Windows 10 and Windows 11 (64-bit)**

Developed and maintained by **RAFAT HAMED**.

REVO Download is a download manager with a Rust download engine and browser
integration for Chrome, Edge, Brave and Firefox.

## Features

- Segmented downloads using up to 32 simultaneous connections where the server allows it.
- Pause and resume, including after closing or restarting Windows.
- Browser integration for Chrome, Edge, Brave and Firefox.
- Video and audio downloads with quality selection, playlists and FFmpeg merging.
- Advanced browser media discovery for direct and extensionless media responses, HLS/M3U8, DASH/MPD, and dynamically assigned video sources.
- Queue management, scheduling, speed limits and automatic file categorization.
- Page link grabber, batch links, import/export lists and torrent support.
- Arabic and English interface plus the other languages inherited from the upstream project.

See [RELEASE-1.0.15.md](RELEASE-1.0.15.md) for the latest video-grabber and Windows path-compatibility fixes.

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

The update endpoint is configured for `rafathamed/revo-download`. The
GitHub Actions release workflow uses repository secrets:

- `UPDATE_SIGNING_KEY`: the 64-character Ed25519 private seed used to sign
  `version.json`. It is required for official releases. Keep it in GitHub
  Actions secrets and never commit it.
- `AMO_JWT_ISSUER` and `AMO_JWT_SECRET`: optional Mozilla Add-ons signing
  credentials. Without them, the Windows installer can still be released,
  but the Firefox XPI and Firefox update metadata are not produced.

The public update key is embedded in `crates/engine/src/selfupdate.rs`.
Installed copies verify the signed update manifest before accepting an update.
The private signing seed is not included in the source tree.

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
