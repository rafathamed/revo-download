// REVO Download page-world media observer.
// This script can see page-owned fetch/XHR and media element URLs; it never
// reads decrypted media buffers, DRM keys, credentials or page storage.
(() => {
  "use strict";
  if (window.__revoMediaHookInstalled) return;
  Object.defineProperty(window, "__revoMediaHookInstalled", { value: true });
  const sent = new Set();
  const mediaPath = /\.(?:m3u8|mpd|mp4|m4v|webm|mov|mkv|ogv|avi|mp3|m4a|aac|wav|flac|ogg)(?:$|[?#])/i;
  const manifestMime = /mpegurl|dash\+xml/i;
  const mediaMime = /^(video|audio)\//i;
  const MIN_COMPLETE_MEDIA = 96 * 1024;
  const emit = (raw, mime = "", meta = {}) => {
    if (typeof raw !== "string" || !/^https?:\/\//i.test(raw)) return;
    const cleanMime = String(mime || "").toLowerCase().split(";")[0];
    // ISO BMFF fragmented-media segments are not standalone video files.
    if (/\.(?:m4s|cmfv|cmfa)(?:$|[?#])/i.test(raw)) return;
    const knownPath = mediaPath.test(raw);
    const manifest = manifestMime.test(cleanMime);
    if (!knownPath && !manifest && !mediaMime.test(cleanMime)) return;
    // A 206/Range response is a fragment, not a standalone downloadable file.
    // MIME-only URLs are accepted only when the server reports a substantial
    // complete response; this avoids listing the small MSE chunks as videos.
    if (meta.rangeRequested || Number(meta.status) === 206 || meta.contentRange) return;
    if (!knownPath && !manifest && mediaMime.test(cleanMime) &&
        (!Number(meta.contentLength) || Number(meta.contentLength) < MIN_COMPLETE_MEDIA)) return;
    const key = raw;
    if (sent.has(key)) return;
    sent.add(key);
    if (sent.size > 1500) sent.delete(sent.values().next().value);
    window.postMessage({
      __revoMediaHook: 1, url: raw, mime: cleanMime.slice(0, 160),
      status: Number(meta.status) || 0,
      contentLength: Number(meta.contentLength) || 0,
      contentRange: String(meta.contentRange || "").slice(0, 160),
      rangeRequested: !!meta.rangeRequested
    }, "*");
  };
  const absolute = (raw) => {
    try { return new URL(raw, location.href).href; } catch { return ""; }
  };

  // fetch: inspect response metadata only. Manifest bodies remain untouched.
  if (typeof window.fetch === "function") {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      let requested = "";
      let rangeRequested = false;
      try {
        requested = typeof args[0] === "string" ? args[0] : args[0] && args[0].url;
        const requestHeaders = args[0] && args[0].headers;
        const initHeaders = args[1] && args[1].headers;
        rangeRequested = new Headers(requestHeaders || undefined).has("range") ||
          new Headers(initHeaders || undefined).has("range");
      } catch {}
      const promise = originalFetch.apply(this, args);
      promise.then((response) => {
        try {
          emit(response.url || absolute(requested), response.headers.get("content-type") || "", {
            status: response.status,
            contentLength: Number(response.headers.get("content-length")) || 0,
            contentRange: response.headers.get("content-range") || "",
            rangeRequested
          });
        } catch {}
      }).catch(() => {});
      return promise;
    };
  }

  // XHR: observe the final URL and content type without reading response data.
  if (window.XMLHttpRequest) {
    const XHR = window.XMLHttpRequest;
    const open = XHR.prototype.open;
    XHR.prototype.open = function(method, url, ...rest) {
      this.__revoRangeRequested = false;
      try { this.__revoRequestedUrl = absolute(String(url)); } catch { this.__revoRequestedUrl = ""; }
      return open.call(this, method, url, ...rest);
    };
    const setRequestHeader = XHR.prototype.setRequestHeader;
    XHR.prototype.setRequestHeader = function(name, value) {
      if (String(name).toLowerCase() === "range") this.__revoRangeRequested = true;
      return setRequestHeader.call(this, name, value);
    };
    const send = XHR.prototype.send;
    XHR.prototype.send = function(...args) {
      this.addEventListener("loadend", () => {
        try {
          emit(this.responseURL || this.__revoRequestedUrl, this.getResponseHeader("content-type") || "", {
            status: this.status,
            contentLength: Number(this.getResponseHeader("content-length")) || 0,
            contentRange: this.getResponseHeader("content-range") || "",
            rangeRequested: !!this.__revoRangeRequested
          });
        } catch {}
      }, { once: true });
      return send.apply(this, args);
    };
  }

  // Native/progressive sources, including dynamically-created source nodes.
  const scan = (root) => {
    if (!root || !root.querySelectorAll) return;
    for (const el of root.querySelectorAll("video, audio, source")) {
      const src = el.currentSrc || el.src || el.getAttribute("src") || "";
      emit(absolute(src), el.getAttribute("type") || "");
    }
  };
  const observe = new MutationObserver((records) => {
    for (const r of records) {
      if (r.type === "attributes") {
        const el = r.target;
        if (el && /^(VIDEO|AUDIO|SOURCE)$/.test(el.tagName)) emit(absolute(el.currentSrc || el.src || el.getAttribute("src") || ""), el.getAttribute("type") || "");
      }
      for (const n of r.addedNodes || []) if (n.nodeType === 1) {
        if (/^(VIDEO|AUDIO|SOURCE)$/.test(n.tagName)) emit(absolute(n.currentSrc || n.src || n.getAttribute("src") || ""), n.getAttribute("type") || "");
        scan(n);
      }
    }
  });
  const start = () => {
    scan(document);
    observe.observe(document.documentElement || document, { subtree: true, childList: true, attributes: true, attributeFilter: ["src", "type"] });
  };
  if (document.documentElement) start();
  else document.addEventListener("DOMContentLoaded", start, { once: true });
  document.addEventListener("loadedmetadata", (e) => {
    const el = e.target;
    if (el && /^(VIDEO|AUDIO)$/.test(el.tagName)) emit(absolute(el.currentSrc || el.src || ""), "");
  }, true);
})();
