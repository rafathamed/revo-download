# REVO Download ffmpeg

`build.sh` builds the small ffmpeg that ships with REVO Download. The GitHub
workflow (job `ffmpeg`) runs it for every release.

For a local build with `BUILD.bat`, put the result in `tools/ffmpeg/win64/`:
`ffmpeg.exe`, `ffmpeg-LICENSE.txt`, `lame-COPYING.txt`,
`openh264-LICENSE.txt`, `ffmpeg-version.txt` (download the `ffmpeg` artifact of
a GitHub run). Without them the setup is made without ffmpeg.
