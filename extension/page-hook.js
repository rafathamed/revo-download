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
  const emit = (raw, mime = "") => {
    if (typeof raw !== "string" || !/^https?:\/\//i.test(raw)) return;
    if (!mediaPath.test(raw) && !manifestMime.test(String(mime))) return;
    const key = raw;
    if (sent.has(key)) return;
    sent.add(key);
    if (sent.size > 1500) sent.delete(sent.values().next().value);
    window.postMessage({ __revoMediaHook: 1, url: raw, mime: String(mime || "").slice(0, 160) }, "*");
  };
  const absolute = (raw) => {
    try { return new URL(raw, location.href).href; } catch { return ""; }
  };

  // fetch: inspect response metadata only. Manifest bodies remain untouched.
  if (typeof window.fetch === "function") {
    const originalFetch = window.fetch;
    window.fetch = function(...args) {
      let requested = "";
      try { requested = typeof args[0] === "string" ? args[0] : args[0] && args[0].url; } catch {}
      const promise = originalFetch.apply(this, args);
      promise.then((response) => {
        try { emit(response.url || absolute(requested), response.headers.get("content-type") || ""); } catch {}
      }).catch(() => {});
      return promise;
    };
  }

  // XHR: observe the final URL and content type without reading response data.
  if (window.XMLHttpRequest) {
    const XHR = window.XMLHttpRequest;
    const open = XHR.prototype.open;
    XHR.prototype.open = function(method, url, ...rest) {
      try { this.__revoRequestedUrl = absolute(String(url)); } catch { this.__revoRequestedUrl = ""; }
      return open.call(this, method, url, ...rest);
    };
    const send = XHR.prototype.send;
    XHR.prototype.send = function(...args) {
      this.addEventListener("loadend", () => {
        try { emit(this.responseURL || this.__revoRequestedUrl, this.getResponseHeader("content-type") || ""); } catch {}
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
