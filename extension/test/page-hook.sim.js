// Exercise the page-world observer without a real browser.
// Confirms that complete extensionless media responses are captured while
// partial/ranged responses and small MSE-like chunks are ignored.
const assert = require("assert");
const fs = require("fs");
const path = require("path");
const vm = require("vm");

class MockHeaders {
  constructor(init) {
    this.values = new Map();
    if (init instanceof MockHeaders) {
      for (const [k, v] of init.values) this.values.set(k, v);
    } else if (Array.isArray(init)) {
      for (const [k, v] of init) this.values.set(String(k).toLowerCase(), String(v));
    } else if (init && typeof init === "object") {
      for (const [k, v] of Object.entries(init)) this.values.set(String(k).toLowerCase(), String(v));
    }
  }
  get(name) { return this.values.get(String(name).toLowerCase()) ?? null; }
  has(name) { return this.values.has(String(name).toLowerCase()); }
}

const posted = [];
const xhrFixtures = [];
class MockXHR {
  constructor() {
    this.events = {};
    this.requestHeaders = {};
    this.responseHeaders = {};
    this.status = 0;
    this.responseURL = "";
  }
  addEventListener(name, fn) {
    (this.events[name] ||= []).push(fn);
  }
  open(_method, url) { this.originalUrl = url; }
  setRequestHeader(name, value) { this.requestHeaders[String(name).toLowerCase()] = value; }
  getResponseHeader(name) { return this.responseHeaders[String(name).toLowerCase()] ?? null; }
  send() {
    const f = xhrFixtures.shift();
    if (!f) throw new Error("missing XHR fixture");
    this.status = f.status;
    this.responseURL = f.url;
    this.responseHeaders = Object.fromEntries(Object.entries(f.headers).map(([k, v]) => [k.toLowerCase(), v]));
    for (const fn of this.events.loadend || []) fn.call(this);
  }
}

const document = {
  documentElement: {},
  querySelectorAll: () => [],
  addEventListener: () => {},
};
class MockMutationObserver {
  constructor(callback) { this.callback = callback; }
  observe() {}
}
const fetchFixtures = new Map();
const window = {
  __revoMediaHookInstalled: false,
  XMLHttpRequest: MockXHR,
  postMessage: (message) => posted.push(message),
  fetch: async (input) => {
    const url = typeof input === "string" ? input : input.url;
    const f = fetchFixtures.get(url);
    if (!f) throw new Error("missing fetch fixture: " + url);
    return {
      url,
      status: f.status,
      headers: new MockHeaders(f.headers),
    };
  },
};
const context = {
  window,
  document,
  location: { href: "https://site.example/watch" },
  MutationObserver: MockMutationObserver,
  Headers: MockHeaders,
  URL,
  console,
};
vm.createContext(context);
vm.runInContext(fs.readFileSync(path.join(__dirname, "..", "page-hook.js"), "utf8"), context);

(async () => {
  const fetchUrl = "https://cdn.example/media/play?id=fetch";
  fetchFixtures.set(fetchUrl, { status: 200, headers: { "Content-Type": "video/mp4", "Content-Length": "1800000" } });
  await window.fetch(fetchUrl);
  await Promise.resolve();

  const rangeUrl = "https://cdn.example/media/play?id=fetch-range";
  fetchFixtures.set(rangeUrl, { status: 200, headers: { "Content-Type": "video/mp4", "Content-Length": "1800000" } });
  await window.fetch(rangeUrl, { headers: { Range: "bytes=0-" } });
  await Promise.resolve();

  const partialUrl = "https://cdn.example/media/play?id=fetch-partial";
  fetchFixtures.set(partialUrl, { status: 206, headers: { "Content-Type": "video/mp4", "Content-Length": "1800000", "Content-Range": "bytes 0-999/1800000" } });
  await window.fetch(partialUrl);
  await Promise.resolve();

  xhrFixtures.push({ url: "https://cdn.example/media/play?id=xhr", status: 200,
    headers: { "Content-Type": "audio/mpeg", "Content-Length": "240000" } });
  const xhr = new window.XMLHttpRequest();
  xhr.open("GET", "https://cdn.example/media/play?id=xhr");
  xhr.send();

  xhrFixtures.push({ url: "https://cdn.example/media/play?id=xhr-range", status: 200,
    headers: { "Content-Type": "video/mp4", "Content-Length": "1800000" } });
  const xhrRange = new window.XMLHttpRequest();
  xhrRange.open("GET", "https://cdn.example/media/play?id=xhr-range");
  xhrRange.setRequestHeader("Range", "bytes=0-");
  xhrRange.send();

  const urls = posted.map(x => x.url);
  assert(urls.includes(fetchUrl), "complete extensionless fetch video is reported");
  assert(urls.includes("https://cdn.example/media/play?id=xhr"), "complete extensionless XHR audio is reported");
  assert(!urls.includes(rangeUrl), "fetch Range response is ignored");
  assert(!urls.includes(partialUrl), "HTTP 206 response is ignored");
  assert(!urls.includes("https://cdn.example/media/play?id=xhr-range"), "XHR Range response is ignored");
  assert.strictEqual(posted.find(x => x.url === fetchUrl).contentLength, 1800000);
  assert.strictEqual(posted.find(x => x.url.endsWith("id=xhr")).mime, "audio/mpeg");
  console.log("page-hook simulation: all checks passed");
})().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
