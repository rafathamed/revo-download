# REVO Download 1.0.13

This release strengthens browser video discovery across:
- Direct media URLs, including extensionless responses and generic binary MIME types.
- HLS/M3U8 and MPEG-DASH/MPD manifests discovered by browser network observation and page-world fetch/XHR hooks.
- Dynamically assigned native video and audio sources.
- Better separation of direct media files from MSE segment traffic to reduce false detections.

DRM-protected streams remain detected as protected content and are not bypassed.
