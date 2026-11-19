# REVO Download 1.0.16

## About window

- The official download button now opens https://revo-download.higgsfield.app/.
- Removed the Slint attribution/logo block from the About window while retaining Slint as the UI framework.

## Multi-selection

- The number of selected downloads is now visible in the status bar.
- The native Windows context menu and the in-app context menu now disable single-download actions while multiple downloads are selected.
- Multi-download actions remain available: resume, stop, redownload, move to queue, copy addresses, and remove.

## Browser integration

- Preserves the automatic per-user Native Messaging host registration and extension-folder preparation performed when REVO starts.
- Browser add-in installation continues to use each browser's supported installation flow. On unmanaged Windows systems, Chromium browsers do not permit a desktop application to silently sideload an unpublished extension; publishing the add-in in the relevant official stores is required for a normal one-click installation.

## Compatibility and validation

- Bumped the desktop app, engine, host, and browser add-in versions to 1.0.16.
- Preserved the existing signed-update manifest format and embedded Ed25519 verification key.
- The Windows release workflow runs browser-extension tests, Rust engine tests, dependency auditing, FFmpeg validation, and the Windows installer build before publishing.
