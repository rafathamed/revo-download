# REVO Download 1.0.14

This release completes the browser media-capture overhaul.

## Media discovery

- Detects direct video and audio URLs, including extensionless complete responses identified by their media MIME type.
- Observes page-world `fetch` and `XMLHttpRequest` response metadata from `document_start`.
- Detects HLS/M3U8 and MPEG-DASH/MPD manifests and keeps quality selection delegated to REVO's resolver.
- Covers dynamically assigned native video/audio sources and inherited-origin frames such as blob-backed frames.
- Supports direct browser media response types across common MP4, WebM, QuickTime, Matroska, Ogg and audio MIME families.

## False-positive filtering and safety

- Filters HTTP 206 and explicit Range responses rather than presenting byte ranges as complete files.
- Filters fragmented DASH media such as `.m4s`, `.cmfv` and `.cmfa` from the standalone file list.
- Filters small MIME-only responses that are likely to be player chunks or short UI sounds.
- Observes response metadata only; it does not read media bodies, extract DRM keys, or bypass DRM-protected streams.

## Validation

The release workflow checks browser extension simulations, page-world capture and range filtering, Rust engine tests, dependency advisories, FFmpeg fixtures, and Windows installer packaging before publishing.
