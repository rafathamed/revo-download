# REVO Download 1.0.17

## Download confirmation and safety

- Browser-captured links always open the download information window, even when an older settings file had disabled it.
- Removed the early background transfer that previously started while the information window was open. The actual file download starts only after the user presses **Start**.
- Clipboard monitoring now detects and presents links for confirmation; it no longer starts transfers automatically.
- Browser video clips are added as stopped items and wait for the user to start them from the main download list.
- Removed contradictory automatic-start controls from Options and made old saved values migrate to the safe behavior.

## Browser add-in

- Redesigned the REVO popup with a download-manager-inspired layout while preserving the existing enable switch, connection state, media detection, playlist actions, video quality choices, button appearance controls, and settings.
- Updated both Chromium and Firefox add-in manifests to 1.0.17.

## Installation limitation

- The installer continues to prepare the REVO Native Messaging host and extension files for the current Windows user.
- Chromium browsers do not allow ordinary desktop installers to silently sideload an unpublished local extension on unmanaged consumer devices. A published Chrome Web Store / Edge Add-ons listing is required for the supported store-based installation flow; the browser still controls its own final approval prompt.
- Firefox requires a Mozilla-signed add-on and its normal browser approval flow. Enterprise-only force-install policies are not applied to personal devices.
## Build

- Windows installer and signed update target: 1.0.17.
